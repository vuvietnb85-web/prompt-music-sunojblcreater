import Meyda from "meyda";
import { estimateBpm } from "@/lib/bpm";
import { detectKey } from "@/lib/key-detect";
import type { Bands } from "@/lib/prompt980";
import { yinPitch } from "@/lib/yin";

export type EngineSnap = {
  kind: "audio" | "video" | "none";
  fileLabel: string;
  durationSec: number;
  bpm: number;
  confidence: number;
  bands: Bands;
  crestDb: number;
  heard: number;
  playing: boolean;
  mode: "dry" | "wet";
  error: string | null;
  subAmount: number;
  fluteAmount: number;
  keyName: string;
  centroidHz: number;
  flatness: number;
  rolloffHz: number;
  pitchHz: number;
};

const SCALE = [293.66, 349.23, 392, 440, 523.25, 587.33, 659.25, 523.25];
const PATTERN = [0, 2, 4, 7, 4, 2, 3, 5];

const emptyBands = (): Bands => ({
  sub: 0,
  bass: 0,
  lowMid: 0,
  mid: 0,
  presence: 0,
  air: 0,
});

function bandAvg(freq: Uint8Array, sampleRate: number, lo: number, hi: number) {
  const nyquist = sampleRate / 2;
  const n = freq.length;
  const i0 = Math.max(0, Math.floor((lo / nyquist) * n));
  const i1 = Math.min(n - 1, Math.ceil((hi / nyquist) * n));
  let s = 0;
  let c = 0;
  for (let i = i0; i <= i1; i++) {
    s += freq[i] ?? 0;
    c++;
  }
  return c ? (s / c / 255) * 100 : 0;
}

export class RemixEngine {
  private ctx: AudioContext | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private videoEl: HTMLVideoElement | null = null;
  private audioSrc: MediaElementAudioSourceNode | null = null;
  private videoSrc: MediaElementAudioSourceNode | null = null;
  private input: GainNode | null = null;
  private shelf: BiquadFilterNode | null = null;
  private mud: BiquadFilterNode | null = null;
  private presence: BiquadFilterNode | null = null;
  private fluteBus: GainNode | null = null;
  private master: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private noise: AudioBuffer | null = null;
  private meter: number | null = null;
  private fluteTimer: number | null = null;
  private nextNote = 0;
  private noteIndex = 0;
  private onsets: number[] = [];
  private prevRms = 0;
  private lastSample = 0;
  private bpmAccum = 0;
  private objectUrl: string | null = null;
  private subAmount = 0.85;
  private fluteAmount = 0.8;
  private mode: "dry" | "wet" = "wet";
  private playing = false;
  private demo = false;
  freq = new Uint8Array(1024);
  private time = new Uint8Array(2048);
  private floatTime = new Float32Array(2048);
  private chroma = new Array<number>(12).fill(0);
  private featureTick = 0;
  bands = emptyBands();
  rms = 0;
  peak = 0;
  crestDb = 0;
  bpm = 0;
  confidence = 0;
  keyName = "unknown";
  centroidHz = 0;
  flatness = 0;
  rolloffHz = 0;
  pitchHz = 0;
  durationSec = 0;
  heard = 0;
  fileLabel = "";
  kind: "audio" | "video" | "none" = "none";
  error: string | null = null;

  attach(audio: HTMLAudioElement, video: HTMLVideoElement) {
    this.audioEl = audio;
    this.videoEl = video;
  }

  get playingNow() {
    return this.playing;
  }

  snapshot(): EngineSnap {
    return {
      kind: this.kind,
      fileLabel: this.fileLabel,
      durationSec: this.durationSec,
      bpm: this.bpm,
      confidence: this.confidence,
      bands: { ...this.bands },
      crestDb: this.crestDb,
      heard: this.heard,
      playing: this.playing,
      mode: this.mode,
      error: this.error,
      subAmount: Math.round(this.subAmount * 100),
      fluteAmount: Math.round(this.fluteAmount * 100),
      keyName: this.keyName,
      centroidHz: this.centroidHz,
      flatness: this.flatness,
      rolloffHz: this.rolloffHz,
      pitchHz: this.pitchHz,
    };
  }

  private ensure() {
    if (this.ctx) return;
    const ctx = new AudioContext();
    this.ctx = ctx;
    const input = ctx.createGain();
    const shelf = ctx.createBiquadFilter();
    shelf.type = "lowshelf";
    shelf.frequency.value = 52;
    const mud = ctx.createBiquadFilter();
    mud.type = "peaking";
    mud.frequency.value = 260;
    mud.Q.value = 0.9;
    const presence = ctx.createBiquadFilter();
    presence.type = "peaking";
    presence.frequency.value = 3200;
    presence.Q.value = 0.7;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 6;
    comp.ratio.value = 3.2;
    comp.attack.value = 0.01;
    comp.release.value = 0.18;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -1.2;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.08;
    const master = ctx.createGain();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.72;
    this.freq = new Uint8Array(analyser.frequencyBinCount);
    this.time = new Uint8Array(analyser.fftSize);
    const fluteBus = ctx.createGain();
    fluteBus.gain.value = 0;
    const flutePan = ctx.createStereoPanner();
    flutePan.pan.value = 0.42;
    const lowPan = ctx.createStereoPanner();
    lowPan.pan.value = -0.28;
    input.connect(lowPan);
    lowPan.connect(shelf);
    shelf.connect(mud);
    mud.connect(presence);
    presence.connect(comp);
    fluteBus.connect(flutePan);
    flutePan.connect(comp);
    comp.connect(limiter);
    limiter.connect(master);
    master.connect(analyser);
    analyser.connect(ctx.destination);
    this.input = input;
    this.shelf = shelf;
    this.mud = mud;
    this.presence = presence;
    this.fluteBus = fluteBus;
    this.master = master;
    this.analyser = analyser;
    const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noise = noise;
    if (this.audioEl && !this.audioSrc) {
      this.audioSrc = ctx.createMediaElementSource(this.audioEl);
      this.audioSrc.connect(input);
    }
    if (this.videoEl && !this.videoSrc) {
      this.videoSrc = ctx.createMediaElementSource(this.videoEl);
      this.videoSrc.connect(input);
    }
    this.applyTone();
  }

  private applyTone() {
    if (!this.ctx || !this.shelf || !this.mud || !this.presence || !this.master || !this.fluteBus) return;
    const wet = this.mode === "wet";
    const now = this.ctx.currentTime;
    this.shelf.gain.setTargetAtTime(wet ? this.subAmount * 14 : 0, now, 0.03);
    this.mud.gain.setTargetAtTime(wet ? -3.5 - this.subAmount * 2 : 0, now, 0.03);
    this.presence.gain.setTargetAtTime(wet ? 1.6 : 0, now, 0.03);
    this.master.gain.setTargetAtTime(wet ? 1.25 : 1, now, 0.03);
    this.fluteBus.gain.setTargetAtTime(wet ? this.fluteAmount : 0, now, 0.03);
  }

  setMode(mode: "dry" | "wet") {
    this.mode = mode;
    this.applyTone();
  }

  setSub(percent: number) {
    this.subAmount = Math.max(0, Math.min(1, percent / 100));
    this.applyTone();
  }

  setFlute(percent: number) {
    this.fluteAmount = Math.max(0, Math.min(1, percent / 100));
    this.applyTone();
  }

  loadFile(file: File, label?: string) {
    this.ensure();
    void this.ctx?.resume();
    const name = label || file.name || "ban-tai-len";
    const isVideo = file.type.startsWith("video") || /\.(mp4|webm|mov|mkv|m4v)$/i.test(name);
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    const url = URL.createObjectURL(file);
    this.objectUrl = url;
    this.fileLabel = name;
    this.kind = isVideo ? "video" : "audio";
    this.demo = false;
    this.onsets = [];
    this.heard = 0;
    this.bpm = 0;
    this.confidence = 0;
    this.bands = emptyBands();
    this.keyName = "unknown";
    this.centroidHz = 0;
    this.flatness = 0;
    this.rolloffHz = 0;
    this.pitchHz = 0;
    this.chroma.fill(0);
    this.featureTick = 0;
    this.error = null;
    const el = isVideo ? this.videoEl : this.audioEl;
    if (!el) {
      this.error = "Thiếu ô phát. Tải lại trang rồi chọn file.";
      return;
    }
    if (isVideo) {
      this.audioEl?.pause();
      this.audioEl?.removeAttribute("src");
    } else {
      this.videoEl?.pause();
      this.videoEl?.removeAttribute("src");
    }
    el.src = url;
    this.playing = true;
    this.nextNote = 0;
    this.startTimers();
    void el.play().catch(() => {
      this.playing = false;
      this.error = "Trình duyệt chặn phát. Bấm Phát lần nữa.";
    });
    el.addEventListener(
      "loadedmetadata",
      () => {
        this.durationSec = Number.isFinite(el.duration) ? el.duration : 0;
      },
      { once: true },
    );
    void rememberFile(file, this.fileLabel);
  }

  loadRemote(src: string, label: string, kind: "audio" | "video") {
    this.ensure();
    void this.ctx?.resume();
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.fileLabel = label || "link-truc-tuyen";
    this.kind = kind;
    this.demo = false;
    this.onsets = [];
    this.heard = 0;
    this.bpm = 0;
    this.confidence = 0;
    this.bands = emptyBands();
    this.keyName = "unknown";
    this.centroidHz = 0;
    this.flatness = 0;
    this.rolloffHz = 0;
    this.pitchHz = 0;
    this.chroma.fill(0);
    this.featureTick = 0;
    this.error = null;
    const el = kind === "video" ? this.videoEl : this.audioEl;
    if (!el) {
      this.error = "Thiếu ô phát. Tải lại trang rồi dán link lại.";
      return;
    }
    if (kind === "video") {
      this.audioEl?.pause();
      this.audioEl?.removeAttribute("src");
    } else {
      this.videoEl?.pause();
      this.videoEl?.removeAttribute("src");
    }
    el.src = src;
    this.playing = true;
    this.nextNote = 0;
    this.startTimers();
    void el.play().catch(() => {
      this.playing = false;
      this.error = "Chưa nghe được link. Kiểm tra lại địa chỉ file.";
    });
    el.addEventListener(
      "loadedmetadata",
      () => {
        this.durationSec = Number.isFinite(el.duration) ? el.duration : 0;
      },
      { once: true },
    );
  }

  play() {
    try {
      this.ensure();
    } catch {
      this.error = "Máy không mở được mạch tiếng. Bấm Phát lại.";
      return;
    }
    if (this.ctx && this.ctx.state === "suspended") void this.ctx.resume();
    this.error = null;
    if (this.kind === "none") {
      this.demo = true;
      this.playing = true;
      this.nextNote = 0;
      this.startTimers();
      return;
    }
    this.demo = false;
    const el = this.kind === "video" ? this.videoEl : this.audioEl;
    if (!el) return;
    this.playing = true;
    this.startTimers();
    void el.play().catch(() => {
      this.playing = false;
      this.error = "Chưa phát được. Bấm Phát lần nữa, hoặc chọn file khác.";
    });
  }

  pause() {
    this.audioEl?.pause();
    this.videoEl?.pause();
    this.playing = false;
    this.stopTimers();
  }

  toggle() {
    if (this.playing) this.pause();
    else void this.play();
  }

  private startTimers() {
    if (this.meter != null) return;
    this.lastSample = performance.now();
    this.meter = window.setInterval(() => this.sample(), 50);
    this.fluteTimer = window.setInterval(() => this.schedule(), 90);
  }

  private stopTimers() {
    if (this.meter != null) window.clearInterval(this.meter);
    if (this.fluteTimer != null) window.clearInterval(this.fluteTimer);
    this.meter = null;
    this.fluteTimer = null;
  }

  private sample() {
    if (!this.playing || !this.analyser || !this.ctx) return;
    const now = performance.now();
    const dt = Math.min(0.2, (now - this.lastSample) / 1000);
    this.lastSample = now;
    this.heard += dt;
    this.analyser.getByteTimeDomainData(this.time);
    this.analyser.getFloatTimeDomainData(this.floatTime);
    this.analyser.getByteFrequencyData(this.freq);
    let peak = 0;
    let sum = 0;
    for (let i = 0; i < this.time.length; i++) {
      const v = ((this.time[i] ?? 128) - 128) / 128;
      const a = Math.abs(v);
      if (a > peak) peak = a;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / this.time.length);
    this.rms = rms;
    this.peak = peak;
    this.crestDb = 20 * Math.log10((peak + 1e-5) / (rms + 1e-5));
    const rate = this.ctx.sampleRate;
    const measured: Bands = {
      sub: bandAvg(this.freq, rate, 20, 60),
      bass: bandAvg(this.freq, rate, 60, 140),
      lowMid: bandAvg(this.freq, rate, 140, 400),
      mid: bandAvg(this.freq, rate, 400, 2000),
      presence: bandAvg(this.freq, rate, 2000, 5000),
      air: bandAvg(this.freq, rate, 5000, 12000),
    };
    (Object.keys(measured) as (keyof Bands)[]).forEach((key) => {
      this.bands[key] = this.bands[key] * 0.72 + measured[key] * 0.28;
    });
    const onset = Math.max(0, rms - this.prevRms);
    this.prevRms = rms;
    this.onsets.push(onset);
    if (this.onsets.length > 400) this.onsets.shift();
    this.bpmAccum += dt;
    if (this.bpmAccum >= 1.1 && this.onsets.length >= 80) {
      this.bpmAccum = 0;
      const est = estimateBpm(this.onsets);
      if (est.bpm) {
        this.bpm = est.bpm;
        this.confidence = est.confidence;
      }
    }
    this.featureTick++;
    if (this.featureTick % 4 === 0) this.extractOpen(rate);
  }

  private extractOpen(sampleRate: number) {
    try {
      Meyda.bufferSize = 1024;
      Meyda.sampleRate = sampleRate;
      const features = Meyda.extract(
        ["spectralCentroid", "spectralFlatness", "spectralRolloff", "chroma"],
        this.floatTime.subarray(0, 1024),
      );
      if (!features) return;
      if (typeof features.spectralCentroid === "number" && features.spectralCentroid > 0) {
        this.centroidHz = this.centroidHz * 0.75 + features.spectralCentroid * 0.25;
      }
      if (typeof features.spectralFlatness === "number") {
        this.flatness = this.flatness * 0.75 + features.spectralFlatness * 0.25;
      }
      if (typeof features.spectralRolloff === "number" && features.spectralRolloff > 0) {
        this.rolloffHz = this.rolloffHz * 0.75 + features.spectralRolloff * 0.25;
      }
      if (features.chroma && features.chroma.length >= 12) {
        for (let i = 0; i < 12; i++) {
          this.chroma[i] = (this.chroma[i] ?? 0) * 0.86 + (features.chroma[i] ?? 0) * 0.14;
        }
        this.keyName = detectKey(this.chroma);
      }
    } catch {
      /* khung đo lỗi thì giữ số cũ, không chặn phát */
    }
    if (this.featureTick % 12 !== 0) return;
    const hz = yinPitch(this.floatTime.subarray(0, 1024), sampleRate);
    if (hz > 70 && hz < 1800) {
      this.pitchHz = this.pitchHz > 0 ? this.pitchHz * 0.6 + hz * 0.4 : hz;
    }
  }

  private schedule() {
    if (!this.playing || !this.ctx || this.mode !== "wet" || this.fluteAmount < 0.03) return;
    const beat = 60 / 150;
    const horizon = this.ctx.currentTime + 0.3;
    if (this.nextNote < this.ctx.currentTime + 0.02) this.nextNote = this.ctx.currentTime + 0.05;
    let guard = 0;
    while (this.nextNote < horizon && guard < 4) {
      const step = this.noteIndex % 8 === 3 ? beat * 2 : beat;
      if (this.noteIndex % 8 !== 7) {
        const degree = PATTERN[this.noteIndex % PATTERN.length] ?? 0;
        this.spit(SCALE[degree] ?? 392, this.nextNote, Math.min(beat * 0.95, step * 0.9));
      }
      if (this.demo) this.kick(this.nextNote);
      this.noteIndex++;
      this.nextNote += step;
      guard++;
    }
  }

  private spit(freq: number, time: number, dur: number) {
    const ctx = this.ctx;
    const bus = this.fluteBus;
    const noise = this.noise;
    if (!ctx || !bus || !noise) return;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * 1.015, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + Math.min(0.09, dur));
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.16, time + 0.045);
    g.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(0.08, dur));
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = Math.min(1800, freq * 2.1);
    bp.Q.value = 3.2;
    osc.connect(bp);
    bp.connect(g);
    g.connect(bus);
    osc.start(time);
    osc.stop(time + dur + 0.05);

    const src = ctx.createBufferSource();
    src.buffer = noise;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, time);
    ng.gain.exponentialRampToValueAtTime(0.035, time + 0.02);
    ng.gain.exponentialRampToValueAtTime(0.0001, time + Math.min(0.16, dur));
    const air = ctx.createBiquadFilter();
    air.type = "bandpass";
    air.frequency.value = 1700;
    air.Q.value = 0.6;
    src.connect(air);
    air.connect(ng);
    ng.connect(bus);
    src.start(time);
    src.stop(time + 0.2);
  }

  private kick(time: number) {
    const ctx = this.ctx;
    const input = this.input;
    if (!ctx || !input) return;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(146, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.09);
    const g = ctx.createGain();
    const peak = 0.2 + this.subAmount * 0.45;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(peak, time + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.26);
    osc.connect(g);
    g.connect(input);
    osc.start(time);
    osc.stop(time + 0.3);
  }

  dispose() {
    this.pause();
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    void this.ctx?.close();
    this.ctx = null;
  }
}

async function rememberFile(file: File, label: string) {
  try {
    const root = await navigator.storage.getDirectory();
    const handle = await root.getFileHandle("last-source.bin", { create: true });
    const writable = await handle.createWritable();
    await file.stream().pipeTo(writable);
    localStorage.setItem(
      "tramsao.last",
      JSON.stringify({ name: label, type: file.type || "application/octet-stream" }),
    );
  } catch {
    /* máy đầy hoặc không có OPFS — vẫn phát từ bản vừa chọn */
  }
}

export async function loadRemembered(): Promise<{ file: File; label: string } | null> {
  try {
    const raw = localStorage.getItem("tramsao.last");
    if (!raw) return null;
    const meta = JSON.parse(raw) as { name?: string; type?: string };
    const root = await navigator.storage.getDirectory();
    const handle = await root.getFileHandle("last-source.bin");
    const file = await handle.getFile();
    return { file, label: meta.name || file.name };
  } catch {
    return null;
  }
}
