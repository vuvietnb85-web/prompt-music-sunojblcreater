import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { asSunoPrompt, composePrompt, DEFAULT_FACTS, EXTRA_CHOICES, EXTRA_IDS, PROMPT_CHARS, ROOM_CHOICES, ROOM_IDS, TONE_IDS, type ExtraId, type PromptFacts, type RoomId, type ToneId } from "@/lib/prompt980";
import { formatCivil, nextCivicEvent } from "@/lib/lunar";
import { RemixEngine, loadRemembered, type EngineSnap } from "@/lib/remix-engine";
import { prepareRemoteUrl, shouldDecode } from "@/lib/remote-media";
import { quantumMusic } from "@/lib/quantum-music";
import { upgradePrompt, type UpgradeInput } from "@/lib/upgrade-prompt";

type Hist = { id: number; title: string; prompt: string };

const TICKER =
  "AUTO PROMPT MUSIC · MỞ ĐẦU NĂNG LƯỢNG CAO · BÀI DÀI ÍT NHẤT 4 PHÚT · BASS SÂU CĂNG · SÁO SÁNG VÍ VON · KHÓA 150 BPM · STYLE SUNO CHÉP VÀ DÁN · FILE Ở TRÊN MÁY · KHÔNG CHẨN ĐOÁN Y TẾ · KIỂM TRA NGUỒN TIN TRƯỚC KHI CHIA SẺ · ";

function factsFrom(
  snap: EngineSnap,
  note: string,
  sub: number,
  flute: number,
  tone: ToneId,
  extras: ExtraId[],
  room: RoomId,
): PromptFacts {
  return {
    kind: snap.kind,
    fileLabel: snap.fileLabel,
    durationSec: snap.durationSec,
    bpmEstimate: snap.bpm,
    confidence: snap.confidence,
    bands: snap.bands,
    crestDb: snap.crestDb,
    note,
    subAmount: sub,
    fluteAmount: flute,
    keyName: snap.keyName,
    centroidHz: snap.centroidHz,
    flatness: snap.flatness,
    rolloffHz: snap.rolloffHz,
    pitchHz: snap.pitchHz,
    tone,
    extras,
    room,
  };
}

export function Studio() {
  const engineRef = useRef<RemixEngine | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const radioRef = useRef<HTMLAudioElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const newRef = useRef<HTMLElement>(null);
  const autoWrote = useRef(false);
  const drag = useRef<{ dx: number; dy: number; moved: boolean } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);

  const runAi = useServerFn(upgradePrompt);

  const [prompt, setPrompt] = useState(() => composePrompt(DEFAULT_FACTS));
  const [edited, setEdited] = useState(false);
  const [note, setNote] = useState("");
  const [sub, setSub] = useState(85);
  const [flute, setFlute] = useState(80);
  const [tone, setTone] = useState<ToneId>("JBL");
  const [extras, setExtras] = useState<ExtraId[]>([]);
  const [room, setRoom] = useState<RoomId>("club");
  const [mode, setMode] = useState<"dry" | "wet">("wet");
  const [snap, setSnap] = useState<EngineSnap | null>(null);
  const [status, setStatus] = useState("Chọn audio hoặc video, hoặc bấm Phát để nghe mẫu khóa 150.");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<Hist[]>([]);
  const [kept, setKept] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [fx, setFx] = useState<string>("bấm để lấy");
  const [radioOn, setRadioOn] = useState(false);
  const [idle, setIdle] = useState(false);
  const [wxAsk, setWxAsk] = useState(false);
  const [wx, setWx] = useState<string | null>(null);
  const [payReady, setPayReady] = useState(false);
  const [gate, setGate] = useState<null | "choose" | "pay">(null);
  const [closed, setClosed] = useState(false);
  const [sticker, setSticker] = useState<{ x: number; y: number } | null>(null);
  const [link, setLink] = useState("");
  const [hearing, setHearing] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const engine = new RemixEngine();
    engineRef.current = engine;
    if (audioRef.current && videoRef.current) engine.attach(audioRef.current, videoRef.current);
    engine.setSub(85);
    engine.setFlute(80);
    const id = window.setInterval(() => setSnap(engine.snapshot()), 400);
    void loadRemembered().then((found) => {
      if (found) setKept(found.label);
    });
    try {
      const raw = localStorage.getItem("tramsao.history");
      if (raw) setHistory(JSON.parse(raw) as Hist[]);
      const pos = localStorage.getItem("tramsao.sticker");
      if (pos) setSticker(JSON.parse(pos) as { x: number; y: number });
      const taste = localStorage.getItem("tramsao.taste");
      if (taste) {
        const t = JSON.parse(taste) as { sub?: number; flute?: number; tone?: string; extras?: string[]; room?: string };
        let nextSub = 85;
        let nextFlute = 80;
        let nextTone: ToneId = "JBL";
        let nextExtras: ExtraId[] = [];
        let nextRoom: RoomId = "club";
        if (typeof t.sub === "number") {
          nextSub = t.sub;
          setSub(t.sub);
          engine.setSub(t.sub);
        }
        if (typeof t.flute === "number") {
          nextFlute = t.flute;
          setFlute(t.flute);
          engine.setFlute(t.flute);
        }
        if (t.tone && (TONE_IDS as readonly string[]).includes(t.tone)) {
          nextTone = t.tone as ToneId;
          setTone(nextTone);
        }
        if (Array.isArray(t.extras)) {
          nextExtras = t.extras.filter((id): id is ExtraId => (EXTRA_IDS as readonly string[]).includes(id));
          setExtras(nextExtras);
        }
        if (t.room && (ROOM_IDS as readonly string[]).includes(t.room)) {
          nextRoom = t.room as RoomId;
          setRoom(nextRoom);
        }
        setPrompt(
          composePrompt({
            ...DEFAULT_FACTS,
            subAmount: nextSub,
            fluteAmount: nextFlute,
            tone: nextTone,
            extras: nextExtras,
            room: nextRoom,
          }),
        );
      }
    } catch {
      /* bộ nhớ hỏng thì bỏ qua */
    }
    return () => {
      window.clearInterval(id);
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    const allow = (target: EventTarget | null) => {
      const el = target instanceof Element ? target.closest("input, textarea") : null;
      return Boolean(el);
    };
    const blockSelect = (event: Event) => {
      if (!allow(event.target)) event.preventDefault();
    };
    const blockKeys = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key === "+" || event.key === "-" || event.key === "=" || event.key === "0") event.preventDefault();
    };
    const blockWheel = (event: WheelEvent) => {
      if (event.ctrlKey) event.preventDefault();
    };
    document.addEventListener("selectstart", blockSelect);
    document.addEventListener("contextmenu", blockSelect);
    document.addEventListener("keydown", blockKeys);
    document.addEventListener("wheel", blockWheel, { passive: false });
    return () => {
      document.removeEventListener("selectstart", blockSelect);
      document.removeEventListener("contextmenu", blockSelect);
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("wheel", blockWheel);
    };
  }, []);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const zone = newRef.current;
    if (!zone) return;
    let timer = window.setTimeout(() => setIdle(true), 10000);
    const arm = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), 10000);
    };
    zone.addEventListener("pointerdown", arm);
    return () => {
      window.clearTimeout(timer);
      zone.removeEventListener("pointerdown", arm);
    };
  }, []);

  useEffect(() => {
    if (gate !== "pay") return;
    const render = () => {
      const paypal = (
        window as unknown as {
          paypal?: { HostedButtons: (o: { hostedButtonId: string }) => { render: (id: string) => void } };
        }
      ).paypal;
      const el = document.getElementById("paypal-container-T7AZ748Y27248");
      if (!paypal || !el || el.childElementCount > 0) return;
      paypal.HostedButtons({ hostedButtonId: "T7AZ748Y27248" }).render("#paypal-container-T7AZ748Y27248");
      setPayReady(true);
    };
    if (document.getElementById("paypal-sdk")) {
      render();
      return;
    }
    const s = document.createElement("script");
    s.id = "paypal-sdk";
    s.src =
      "https://www.paypal.com/sdk/js?client-id=BAAIfuQli_a3Qud-8CIRqCRCeohqtiW29_i2Txx2rQM35pqMc-pbCIZX6L8tx1zbyOj_vp8AUE_dpSqOhc&components=hosted-buttons&disable-funding=venmo&currency=USD";
    s.onload = render;
    s.onerror = () => setStatus("Không tải được PayPal. Thử lại.");
    document.body.appendChild(s);
  }, [gate]);

  useEffect(() => {
    let raf = 0;
    const draw = () => {
      const host = meterRef.current;
      const engine = engineRef.current;
      if (host && engine) {
        const freq = engine.freq;
        const playing = engine.playingNow;
        const kids = host.children;
        for (let i = 0; i < kids.length; i++) {
          const mag = playing ? (freq[2 + i * 6] ?? 0) / 255 : 0;
          (kids[i] as HTMLElement).style.transform = `scaleY(${0.08 + mag * 0.92})`;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!snap || edited || autoWrote.current) return;
    if (snap.kind !== "none" && snap.heard >= 8) {
      autoWrote.current = true;
      setPrompt(composePrompt(factsFrom(snap, note, sub, flute, tone, extras, room)));
      setStatus("Đã dịch số đo thành Style Suno. Có thể gọi siêu AI để viết lại.");
    }
  }, [snap, edited, note, sub, flute, tone, extras, room]);

  function currentFacts(): PromptFacts {
    const live = engineRef.current?.snapshot();
    if (!live) return { ...DEFAULT_FACTS, note, subAmount: sub, fluteAmount: flute, tone, extras, room };
    return factsFrom(live, note, sub, flute, tone, extras, room);
  }

  function remember(nextSub: number, nextFlute: number, nextTone: ToneId, nextExtras: ExtraId[], nextRoom: RoomId) {
    localStorage.setItem(
      "tramsao.taste",
      JSON.stringify({ sub: nextSub, flute: nextFlute, tone: nextTone, extras: nextExtras, room: nextRoom }),
    );
  }

  function writeLocal() {
    const next = composePrompt(currentFacts());
    setPrompt(next);
    setEdited(false);
    setStatus("Đã viết Style và Exclude. Chép rồi dán vào Suno Custom Mode.");
  }

  function commitSliders(nextSub = sub, nextFlute = flute) {
    engineRef.current?.setSub(nextSub);
    engineRef.current?.setFlute(nextFlute);
    remember(nextSub, nextFlute, tone, extras, room);
    if (!edited) setPrompt(composePrompt(factsFrom(engineRef.current?.snapshot() ?? blankSnap(), note, nextSub, nextFlute, tone, extras, room)));
  }

  function paint(nextTone: ToneId, nextExtras: ExtraId[], nextRoom: RoomId) {
    setTone(nextTone);
    setExtras(nextExtras);
    setRoom(nextRoom);
    remember(sub, flute, nextTone, nextExtras, nextRoom);
    if (!edited) {
      setPrompt(composePrompt(factsFrom(engineRef.current?.snapshot() ?? blankSnap(), note, sub, flute, nextTone, nextExtras, nextRoom)));
    }
  }

  async function onAi() {
    if (busy) return;
    setBusy(true);
    setStatus("Khách hàng đang chốt hướng, rồi người viết mới ra Style…");
    const facts = currentFacts();
    const data: UpgradeInput = {
      ...facts,
      bpmEstimate: facts.bpmEstimate,
      draft: prompt.slice(0, 700),
    };
    try {
      const res = await runAi({ data });
      if (!res.ok) {
        setPrompt(composePrompt(facts));
        setEdited(false);
        setStatus(`${res.error} Đã giữ Style viết trên máy.`);
      } else {
        setPrompt(asSunoPrompt(res.text, facts));
        setEdited(false);
        setStatus(res.client ? `Khách hàng chốt: ${res.client}` : "Siêu AI đã viết Style cho Suno. Chép rồi dán vào Custom Mode.");
      }
    } catch {
      setPrompt(composePrompt(facts));
      setEdited(false);
      setStatus("Không gọi được AI. Đã viết Style trên máy, vẫn dán được vào Suno.");
    } finally {
      setBusy(false);
    }
  }

  function onFile(file: File | undefined, label?: string) {
    if (!file) return;
    const name = label || file.name;
    autoWrote.current = false;
    setEdited(false);
    setShowVideo(file.type.startsWith("video") || /\.(mp4|webm|mov|mkv|m4v)$/i.test(name));
    radioRef.current?.pause();
    setRadioOn(false);
    engineRef.current?.loadFile(file, name);
    setSnap(engineRef.current?.snapshot() ?? null);
    setStatus(`Đang phát «${name}». Đo phổ vài giây rồi viết prompt.`);
    setKept(null);
  }

  async function hearLink() {
    if (hearing) return;
    const ready = prepareRemoteUrl(link);
    if (!ready.ok) {
      setStatus(ready.error);
      return;
    }
    setHearing(true);
    setStatus(shouldDecode(ready.url) ? "Đang giải link và lấy tiếng…" : "Đang mở link để nghe…");
    try {
      const probe = await fetch(`/api/hear?check=1&u=${encodeURIComponent(ready.url)}`);
      const body = (await probe.json().catch(() => null)) as { error?: string; kind?: string } | null;
      if (!probe.ok) {
        setStatus(body?.error || "Không mở được link.");
        return;
      }
      const kind = body?.kind === "video" ? "video" : "audio";
      autoWrote.current = false;
      setEdited(false);
      setShowVideo(kind === "video");
      radioRef.current?.pause();
      setRadioOn(false);
      engineRef.current?.loadRemote(`/api/hear?u=${encodeURIComponent(ready.url)}`, ready.label, kind);
      setSnap(engineRef.current?.snapshot() ?? null);
      setStatus(`Đang nghe «${ready.label}». Vài giây nữa sẽ viết prompt bắt chước.`);
    } catch {
      setStatus("Không kết nối được. Kiểm tra link rồi thử lại.");
    } finally {
      setHearing(false);
    }
  }

  async function restoreKept() {
    const found = await loadRemembered();
    if (!found) {
      setStatus("Không còn bản đã giữ trên máy.");
      setKept(null);
      return;
    }
    onFile(found.file, found.label);
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setStatus("Đã chép. Dán vào ô Style của Suno, phần Exclude dán kèm nếu Suno có ô loại.");
    } catch {
      setStatus("Không chép được. Giữ ô prompt rồi chọn thủ công.");
    }
  }

  function saveHistory() {
    const title = snap?.fileLabel || note.trim() || "Khóa 150";
    const item: Hist = { id: Date.now(), title: title.slice(0, 42), prompt };
    const next = [item, ...history.filter((h) => h.prompt !== prompt)].slice(0, 8);
    setHistory(next);
    localStorage.setItem("tramsao.history", JSON.stringify(next));
    setStatus("Đã nhớ prompt trên máy này.");
  }

  function setHeardMode(next: "dry" | "wet") {
    setMode(next);
    engineRef.current?.setMode(next);
  }

  async function toggleRadio() {
    const el = radioRef.current;
    if (!el) return;
    if (radioOn) {
      el.pause();
      setRadioOn(false);
      setStatus("Đã tắt đài.");
      return;
    }
    engineRef.current?.pause();
    setStatus("Đang tìm đài Việt…");
    try {
      const res = await fetch(
        "https://de1.api.radio-browser.info/json/stations/search?countrycode=VN&hidebroken=true&limit=15&order=votes&reverse=true",
      );
      const list = (await res.json()) as { name?: string; url_resolved?: string }[];
      const station = list.find((s) => s.url_resolved);
      if (!station?.url_resolved) {
        setStatus("Không thấy đài nào đang sống. Thử lại sau.");
        return;
      }
      el.src = station.url_resolved;
      await el.play();
      setRadioOn(true);
      setStatus(`Đài: ${station.name || "Việt Nam"}. Phát trực tiếp, không trộn sáo.`);
    } catch {
      setStatus("Không mở được đài. Kiểm tra mạng rồi bấm lại.");
    }
  }

  function speak() {
    const synth = window.speechSynthesis;
    if (!synth) {
      setStatus("Máy không có giọng đọc.");
      return;
    }
    if (synth.speaking) {
      synth.cancel();
      return;
    }
    const utter = new SpeechSynthesisUtterance(prompt.slice(0, 420));
    utter.lang = "vi-VN";
    utter.rate = 1;
    synth.speak(utter);
  }

  function onStickerDown(e: ReactPointerEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    drag.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onStickerMove(e: ReactPointerEvent<HTMLButtonElement>) {
    if (!drag.current) return;
    drag.current.moved = true;
    const x = Math.max(8, Math.min(window.innerWidth - 80, e.clientX - drag.current.dx));
    const y = Math.max(8, Math.min(window.innerHeight - 80, e.clientY - drag.current.dy));
    posRef.current = { x, y };
    setSticker({ x, y });
  }

  function onStickerUp() {
    const moved = drag.current?.moved;
    drag.current = null;
    if (!moved) speak();
    else if (posRef.current) localStorage.setItem("tramsao.sticker", JSON.stringify(posRef.current));
  }

  async function loadFx() {
    setFx("đang lấy…");
    try {
      const j = (await (await fetch("https://open.er-api.com/v6/latest/USD")).json()) as {
        rates?: { VND?: number };
      };
      const v = j?.rates?.VND;
      setFx(typeof v === "number" ? `${Math.round(v).toLocaleString("vi-VN")} đ` : "chưa có số");
    } catch {
      setFx("chưa lấy được");
    }
  }

  async function askWeather() {
    setWx("Đang xin vị trí…");
    if (!navigator.geolocation) {
      setWx("Máy không có định vị.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude.toFixed(3)}&longitude=${pos.coords.longitude.toFixed(3)}&current=temperature_2m,weather_code`;
          const j = (await (await fetch(url)).json()) as {
            current?: { temperature_2m?: number; weather_code?: number };
          };
          const t = j.current?.temperature_2m;
          setWx(typeof t === "number" ? `${Math.round(t)}°C · Open-Meteo` : "Chưa có số nhiệt.");
        } catch {
          setWx("Không lấy được thời tiết.");
        }
      },
      () => setWx("Bạn từ chối vị trí. Thời tiết tắt."),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  const civil = now ? formatCivil(now) : null;
  const event = now ? nextCivicEvent(now) : null;
  const count = prompt.length;
  const live = snap;
  const quantum = quantumMusic({
    subAmount: sub,
    fluteAmount: flute,
    pitchHz: live?.pitchHz ?? 0,
    centroidHz: live?.centroidHz ?? 0,
    air: live?.bands.air ?? 0,
    note,
  });

  return (
    <div className="shell">
      <section ref={newRef} className="zone-new frame-gold">
        <button type="button" className="close-btn" onClick={() => setGate("choose")}>
          Đóng
        </button>
        <div className="zone-scroll">
          <header className="mb-3 pr-16 pl-16">
            <p className="font-display text-xs tracking-widest text-gold uppercase">Xưởng prompt</p>
            <h1 className="font-display text-2xl leading-none text-balance text-fg">AUTO PROMPT MUSIC</h1>
            <p className="mt-1 text-pretty text-muted">
              Style cho Suno. Mở đầu năng lượng cao ngay nhịp đầu, bài dài ít nhất 4 phút. Bass sâu căng, sáo sáng ví von. Chép rồi dán.
            </p>
            <Link to="/san" className="mt-3 flex min-h-11 items-center justify-center border border-gold font-display tracking-wide text-gold uppercase">
              Sàn ứng dụng
            </Link>
          </header>

          <div className="mb-3 grid grid-cols-3 gap-2 text-center">
            <Stat k="BPM remix" v="150" />
            <Stat k="Ký tự" v={`${count}/${PROMPT_CHARS}`} hot={count === PROMPT_CHARS} />
            <Stat k="BPM đo" v={live && live.bpm > 0 ? String(live.bpm) : "—"} />
          </div>

          <button
            type="button"
            className="mb-3 flex min-h-16 w-full items-center justify-center border border-dashed border-gold bg-bg px-3 text-center text-fg"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFile(e.dataTransfer.files[0]);
            }}
          >
            Thả audio hoặc video vào đây. Không giới hạn dung lượng.
          </button>
          <input
            ref={fileRef}
            className="sr-only"
            type="file"
            accept="audio/*,video/*"
            onChange={(e) => {
              onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          <label className="mb-2 block text-sm text-fg">
            Link nhạc hoặc video trực tuyến
            <input
              value={link}
              maxLength={2000}
              onChange={(e) => setLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void hearLink();
                }
              }}
              placeholder="YouTube, TikTok, Facebook hoặc .mp3"
              className="mt-1 w-full border border-gold bg-bg px-3 py-2 text-base text-fg outline-none"
            />
          </label>
          <button
            type="button"
            className="mb-3 min-h-11 w-full border border-gold font-display tracking-wide text-gold uppercase disabled:opacity-50"
            disabled={hearing}
            onClick={() => void hearLink()}
          >
            {hearing ? "Đang mở link…" : "Nghe và bắt chước"}
          </button>

          {kept ? (
            <button type="button" className="mb-3 min-h-11 w-full border border-gold text-gold" onClick={() => void restoreKept()}>
              Mở lại bản đã giữ: {kept}
            </button>
          ) : null}

          <video
            ref={videoRef}
            playsInline
            className={showVideo ? "relative z-10 mb-3 h-28 w-full bg-bg object-contain opacity-100" : "media-host"}
          />
          <audio ref={audioRef} preload="auto" className="media-host" />

          <p className="mb-1 font-display text-xs tracking-widest text-gold uppercase">DSPSS · phổ thật · LOA3</p>
          <div ref={meterRef} className="meter" aria-hidden="true">
            {Array.from({ length: 28 }, (_, i) => (
              <span key={i} className={i < 6 ? "bg-gold" : "bg-fg"} />
            ))}
          </div>

          {live && live.kind !== "none" ? (
            <p className="mb-3 text-sm text-pretty text-muted">
              Gốc: sub {Math.round(live.bands.sub)} · bass {Math.round(live.bands.bass)} · hơi {Math.round(live.bands.air)} ·{" "}
              {live.durationSec ? `${live.durationSec.toFixed(0)}s` : "đang đọc"} · {live.fileLabel}
              . Nâng cấp: sub {sub}/100, sáo {flute}/100, 150 BPM.
            </p>
          ) : (
            <p className="mb-3 text-sm text-muted">
              Chưa có file thì Phát nghe mẫu: kick sub JBL và sáo 150 trên máy, để hình dung prompt.
            </p>
          )}
          <p className="mb-3 text-sm text-pretty text-muted">
            Meyda {live && live.centroidHz > 0 ? `${Math.round(live.centroidHz)} Hz` : "chưa đo"} · giọng{" "}
            {live?.keyName && live.keyName !== "unknown" ? live.keyName : "chưa rõ"} · YIN{" "}
            {live && live.pitchHz > 0 ? `${Math.round(live.pitchHz)} Hz` : "chưa có nốt"}
          </p>

          <label className="mb-2 block text-sm text-fg">
            Độ trầm {tone} {sub}
            <input
              type="range"
              min={0}
              max={100}
              value={sub}
              onChange={(e) => {
                const v = Number(e.target.value);
                setSub(v);
                engineRef.current?.setSub(v);
              }}
              onPointerUp={() => commitSliders(sub, flute)}
            />
          </label>
          <label className="mb-3 block text-sm text-fg">
            Độ sáo ví von {flute}
            <input
              type="range"
              min={0}
              max={100}
              value={flute}
              onChange={(e) => {
                const v = Number(e.target.value);
                setFlute(v);
                engineRef.current?.setFlute(v);
              }}
              onPointerUp={() => commitSliders(sub, flute)}
            />
          </label>

          <div className="mb-3">
            <p className="mb-1 font-display text-xs tracking-widest text-gold uppercase">Chất âm</p>
            <div className="flex flex-wrap gap-2">
              {TONE_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={tone === id}
                  className={`min-h-11 px-3 ${tone === id ? "bg-gold text-bg" : "border border-gold text-fg"}`}
                  onClick={() => paint(id, extras, room)}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <p className="mb-1 font-display text-xs tracking-widest text-gold uppercase">Nhạc cụ thêm</p>
            <div className="flex flex-wrap gap-2">
              {EXTRA_CHOICES.map((item) => {
                const on = extras.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={on}
                    className={`min-h-11 px-3 ${on ? "bg-gold text-bg" : "border border-gold text-fg"}`}
                    onClick={() => paint(tone, on ? extras.filter((id) => id !== item.id) : [...extras, item.id], room)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-3">
            <p className="mb-1 font-display text-xs tracking-widest text-gold uppercase">Chế độ</p>
            <div className="flex flex-wrap gap-2">
              {ROOM_CHOICES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={room === item.id}
                  className={`min-h-11 px-3 ${room === item.id ? "bg-gold text-bg" : "border border-gold text-fg"}`}
                  onClick={() => paint(tone, extras, item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <label className="mb-3 block text-sm text-fg">
            Ghi chú hướng remix
            <input
              value={note}
              maxLength={140}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => {
                if (!edited) setPrompt(composePrompt(currentFacts()));
              }}
              placeholder="Ví dụ: đêm sông, lời ít, drop dài"
              className="mt-1 w-full border border-gold bg-bg px-3 py-2 text-base text-fg outline-none"
            />
          </label>

          <p className="mb-3 text-sm text-pretty text-gold">{quantum.label}</p>
          <a
            href="https://suno.com/@vuvietnhac"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 flex min-h-11 w-full items-center justify-center bg-gold font-display tracking-wide text-bg uppercase"
            onClick={() => setStatus("Đã mở Suno. Chép Style rồi dán vào Custom Mode.")}
          >
            Tạo nhạc
          </a>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <button type="button" className="min-h-11 bg-gold font-display tracking-wide text-bg uppercase" onClick={writeLocal}>
              Viết Suno
            </button>
            <button
              type="button"
              className="min-h-11 border border-gold font-display tracking-wide text-gold uppercase disabled:opacity-50"
              disabled={busy}
              onClick={() => void onAi()}
            >
              {busy ? "Đang viết…" : "Siêu AI"}
            </button>
            <button type="button" className="min-h-11 border border-gold text-fg" onClick={() => void copyPrompt()}>
              Chép
            </button>
            <button type="button" className="min-h-11 border border-gold text-fg" onClick={saveHistory}>
              Nhớ
            </button>
          </div>

          <div className="mb-1 flex items-baseline justify-between">
            <p className="font-display text-xs tracking-widest text-gold uppercase">Style Suno</p>
            <p className={`font-display tabular-nums ${count === PROMPT_CHARS ? "text-gold" : "text-gold-2"}`}>{count}/{PROMPT_CHARS}</p>
          </div>
          <textarea
            value={prompt}
            spellCheck={false}
            onChange={(e) => {
              setEdited(true);
              setPrompt(e.target.value);
            }}
            className="mb-2 min-h-40 w-full border border-gold bg-bg p-3 text-base leading-relaxed text-fg outline-none"
          />
          {count === PROMPT_CHARS ? null : (
            <button
              type="button"
              className="mb-3 min-h-11 w-full border border-gold text-gold"
              onClick={() => {
                setPrompt(asSunoPrompt(prompt, currentFacts()));
                setEdited(true);
                setStatus("Đã khít đúng 995 ký tự.");
              }}
            >
              Khít 995
            </button>
          )}

          <p className="text-sm text-pretty text-muted" aria-live="polite">
            {status}
          </p>
          <p className="mt-2 text-sm text-pretty text-muted">
            Chép nguyên khối Style và Exclude, dán vào Suno Custom Mode. Siêu AI chỉ nhận số đo, không nhận file. Nghe nâng cấp là phối lại trên máy, không phải file master mới.
          </p>

          {history.length > 0 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {history.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  className="shrink-0 border border-gold px-3 py-2 text-sm text-fg"
                  onClick={() => {
                    setPrompt(h.prompt);
                    setEdited(true);
                  }}
                >
                  {h.title}
                </button>
              ))}
            </div>
          ) : null}

          {idle ? (
            <button
              type="button"
              className="mt-3 w-full border border-gold bg-bg p-3 text-left"
              onClick={() => setIdle(false)}
            >
              <p className="font-display text-xs tracking-widest text-gold uppercase">Bảng mép · chạm để đóng</p>
              <p className="mt-1 text-sm text-pretty text-fg">
                Nghe nâng cấp không đè đài. Tắt đài trước khi đo bản của bạn. Prompt không phải chẩn đoán, không phải bản thu thay thế.
              </p>
              {wxAsk ? (
                <span className="mt-2 block text-sm text-muted">
                  {wx ?? "Xin vị trí chỉ để xem nhiệt độ chỗ bạn. Không lưu, không theo dõi."}
                </span>
              ) : null}
            </button>
          ) : null}
        </div>

        <div className="transport">
          <button
            type="button"
            className="flex-1 bg-gold text-bg"
            onClick={() => {
              const engine = engineRef.current;
              if (!engine) {
                setStatus("Mạch tiếng chưa sẵn sàng. Bấm Phát lại.");
                return;
              }
              engine.toggle();
              const next = engine.snapshot();
              setSnap(next);
              if (next.error) setStatus(next.error);
              else if (next.playing && next.kind === "none") setStatus("Đang nghe mẫu: kick sub JBL và sáo trúc 150 BPM.");
              else if (next.playing) setStatus("Đang phát. Gốc là bản trần, Nâng là sub JBL cộng lớp sáo.");
              else setStatus("Đã dừng.");
            }}
          >
            {live?.playing ? "Dừng" : "Phát"}
          </button>
          <button
            type="button"
            className={`flex-1 ${mode === "dry" ? "bg-gold text-bg" : "text-gold"}`}
            onClick={() => setHeardMode("dry")}
          >
            Gốc
          </button>
          <button
            type="button"
            className={`flex-1 ${mode === "wet" ? "bg-gold text-bg" : "text-gold"}`}
            onClick={() => setHeardMode("wet")}
          >
            Nâng
          </button>
        </div>
        <p className="px-3 pb-2 font-display text-xs tracking-widest text-muted uppercase">NGAME · nghe · bo tròn · không đè prompt</p>
      </section>

      <section className="zone-cu frame-gold">
        <div className="marquee">
          <span>
            {TICKER}
            {TICKER}
          </span>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-2 content-center gap-x-3 gap-y-1 overflow-auto px-3 py-1 text-xs">
          <p className="text-fg">{civil ? civil.lunar : "Âm lịch …"}</p>
          <p className="text-right text-fg">{civil ? civil.solar : "Dương lịch …"}</p>
          <p className="text-gold">
            {event ? (event.days === 0 ? `Hôm nay: ${event.name}` : `${event.days} ngày tới ${event.name}`) : "Đếm ngược …"}
          </p>
          <p className="text-right text-muted">
            <button type="button" className="uppercase" onClick={() => void loadFx()}>
              USD {fx}
            </button>
          </p>
          <button type="button" className="text-left text-gold uppercase" onClick={() => void toggleRadio()}>
            {radioOn ? "Tắt đài" : "Đài Việt"}
          </button>
          <button type="button" className="text-right text-gold uppercase" onClick={() => (wxAsk ? void askWeather() : setWxAsk(true))}>
            {wxAsk ? "Lấy thời tiết" : "Thời tiết"}
          </button>
        </div>
        <div className="flex items-center justify-between px-3 pb-1">
          <p className="truncate text-xs text-muted">
            {radioOn ? "Đài trực tiếp" : live?.playing ? "Nguồn đang phát" : "Sẵn sàng"} · {live?.error ?? "mức theo tiếng thật"}
          </p>
          <button type="button" className="shrink-0 pl-3 text-xs text-gold uppercase" onClick={() => setGate("pay")}>
            Bonus
          </button>
        </div>
        <audio ref={radioRef} preload="none" className="media-host" />
      </section>

      <button
        type="button"
        className={sticker ? "pwamc" : "pwamc pwamc-dock"}
        style={sticker ? { left: sticker.x, top: sticker.y, right: "auto", bottom: "auto" } : undefined}
        onPointerDown={onStickerDown}
        onPointerMove={onStickerMove}
        onPointerUp={onStickerUp}
        aria-label="Sticker đọc prompt"
      >
        <span className="text-sm">SÁO</span>
        <span className="text-xs">ĐỌC</span>
      </button>
      {gate ? (
        <div className="gate" role="dialog" aria-modal="true" aria-labelledby="close-title">
          <div className="gate-card">
            <p id="close-title" className="font-display text-lg tracking-wide text-fg uppercase">
              Đóng xưởng
            </p>
            <p className="text-sm text-pretty text-muted">Chọn một. Bonus không đóng máy.</p>
            <button
              type="button"
              className="min-h-11 bg-gold font-display tracking-wide text-bg uppercase"
              onClick={() => {
                engineRef.current?.pause();
                radioRef.current?.pause();
                window.speechSynthesis?.cancel();
                setRadioOn(false);
                setGate(null);
                setClosed(true);
              }}
            >
              Đóng luôn
            </button>
            <button
              type="button"
              className="min-h-11 border border-gold font-display tracking-wide text-gold uppercase"
              onClick={() => setGate("pay")}
            >
              Bonus PayPal
            </button>
            {gate === "pay" ? (
              <>
                {payReady ? null : <p className="text-sm text-muted">Đang mở PayPal…</p>}
                <div id="paypal-container-T7AZ748Y27248" />
              </>
            ) : null}
          </div>
        </div>
      ) : null}
      {closed ? (
        <div className="gate">
          <div className="gate-card">
            <p className="font-display text-lg tracking-wide text-fg uppercase">Đã đóng</p>
            <p className="text-sm text-muted">Prompt và bản nhạc vẫn nằm trên máy này.</p>
            <button
              type="button"
              className="min-h-11 bg-gold font-display tracking-wide text-bg uppercase"
              onClick={() => setClosed(false)}
            >
              Mở lại
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ k, v, hot }: { k: string; v: string; hot?: boolean }) {
  return (
    <div className="border border-gold bg-bg px-2 py-2">
      <p className="font-display text-xs tracking-wider text-muted uppercase">{k}</p>
      <p className={`font-display text-xl tabular-nums ${hot ? "text-gold" : "text-fg"}`}>{v}</p>
    </div>
  );
}

function blankSnap(): EngineSnap {
  return {
    kind: "none",
    fileLabel: "",
    durationSec: 0,
    bpm: 0,
    confidence: 0,
    bands: { sub: 0, bass: 0, lowMid: 0, mid: 0, presence: 0, air: 0 },
    crestDb: 0,
    heard: 0,
    playing: false,
    mode: "wet",
    error: null,
    subAmount: 85,
    fluteAmount: 80,
    keyName: "unknown",
    centroidHz: 0,
    flatness: 0,
    rolloffHz: 0,
    pitchHz: 0,
  };
}
