import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, W as isRedirect, b as useRouter, x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as prepareRemoteUrl, r as shouldDecode } from "./router-C4YbUus7.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { t as Meyda } from "../_libs/meyda.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CsK9vdCo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var N = 8;
var MOTION = ["each step stays clean", "a passing tone leans into the line"];
var COLOR = ["the peak leans on a suspended fourth", "the peak leans on a bright major ninth"];
var ENTRY = ["the second flute answers on the peak", "the second flute answers just before the peak"];
var MOTION_VI = ["bước sạch", "nốt đi qua"];
var COLOR_VI = ["quãng bốn treo", "quãng chín sáng"];
var ENTRY_VI = ["sáo đáp đúng đỉnh", "sáo đáp trước đỉnh"];
function bias(value, full = 100) {
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(1, value / full)) * Math.PI;
}
function notePhase(note) {
	let hash = 0;
	for (const ch of note) hash = (hash * 33 + ch.charCodeAt(0)) % 360;
	return hash / 360 * Math.PI;
}
function hadamard(re, im, q) {
	const step = 1 << q;
	const s = Math.SQRT1_2;
	for (let base = 0; base < N; base += step * 2) for (let i = 0; i < step; i++) {
		const a = base + i;
		const b = a + step;
		const ar = re[a] ?? 0;
		const ai = im[a] ?? 0;
		const br = re[b] ?? 0;
		const bi = im[b] ?? 0;
		re[a] = s * (ar + br);
		im[a] = s * (ai + bi);
		re[b] = s * (ar - br);
		im[b] = s * (ai - bi);
	}
}
function ry(re, im, q, theta) {
	const c = Math.cos(theta / 2);
	const s = Math.sin(theta / 2);
	const step = 1 << q;
	for (let base = 0; base < N; base += step * 2) for (let i = 0; i < step; i++) {
		const a = base + i;
		const b = a + step;
		const ar = re[a] ?? 0;
		const ai = im[a] ?? 0;
		const br = re[b] ?? 0;
		const bi = im[b] ?? 0;
		re[a] = c * ar - s * br;
		im[a] = c * ai - s * bi;
		re[b] = s * ar + c * br;
		im[b] = s * ai + c * bi;
	}
}
function phase(re, im, q, theta) {
	const c = Math.cos(theta);
	const s = Math.sin(theta);
	const bit = 1 << q;
	for (let i = 0; i < N; i++) {
		if ((i & bit) === 0) continue;
		const r = re[i] ?? 0;
		const m = im[i] ?? 0;
		re[i] = r * c - m * s;
		im[i] = r * s + m * c;
	}
}
function quantumProbabilities(input) {
	const re = new Float64Array(N);
	const im = new Float64Array(N);
	re[0] = 1;
	ry(re, im, 0, bias(input.fluteAmount));
	ry(re, im, 1, bias(input.pitchHz, 800));
	ry(re, im, 2, bias(input.subAmount));
	hadamard(re, im, 0);
	phase(re, im, 0, bias(input.centroidHz, 4e3) + notePhase(input.note));
	hadamard(re, im, 0);
	hadamard(re, im, 1);
	phase(re, im, 1, bias(input.air));
	hadamard(re, im, 1);
	const probs = new Array(N);
	let sum = 0;
	for (let i = 0; i < N; i++) {
		const p = (re[i] ?? 0) ** 2 + (im[i] ?? 0) ** 2;
		probs[i] = p;
		sum += p;
	}
	return {
		probs,
		sum
	};
}
function quantumMusic(input) {
	const { probs } = quantumProbabilities(input);
	let best = 0;
	let bestP = -1;
	for (let i = 0; i < probs.length; i++) {
		const p = probs[i] ?? 0;
		if (p > bestP) {
			bestP = p;
			best = i;
		}
	}
	const motion = best & 1;
	const color = best >> 1 & 1;
	const entry = best >> 2 & 1;
	return {
		motion,
		color,
		entry,
		sentence: `Interference sets the line: ${MOTION[motion]}, ${COLOR[color]}, and ${ENTRY[entry]}.`,
		label: `Lượng tử chọn ${MOTION_VI[motion]}, ${COLOR_VI[color]}, ${ENTRY_VI[entry]}.`,
		probability: bestP
	};
}
var TONE_IDS = [
	"JBL",
	"BOSE",
	"TOA",
	"ONKYO",
	"YAMAHA"
];
var EXTRA_IDS = [
	"brass",
	"violin",
	"metal",
	"bells",
	"bau"
];
var ROOM_IDS = [
	"club",
	"stadium",
	"wedding",
	"hall"
];
var EXTRA_CHOICES = [
	{
		id: "brass",
		label: "Đại kèn đồng"
	},
	{
		id: "violin",
		label: "Violon"
	},
	{
		id: "metal",
		label: "Sáo kim loại"
	},
	{
		id: "bells",
		label: "Chuông chùa"
	},
	{
		id: "bau",
		label: "Đàn bầu"
	}
];
var ROOM_CHOICES = [
	{
		id: "club",
		label: "Hộp đêm"
	},
	{
		id: "stadium",
		label: "Sân vận động"
	},
	{
		id: "wedding",
		label: "Lễ cưới"
	},
	{
		id: "hall",
		label: "Nhà hát"
	}
];
var DEFAULT_FACTS = {
	kind: "none",
	fileLabel: "",
	durationSec: 0,
	bpmEstimate: 0,
	confidence: 0,
	bands: {
		sub: 0,
		bass: 0,
		lowMid: 0,
		mid: 0,
		presence: 0,
		air: 0
	},
	crestDb: 0,
	note: "",
	subAmount: 85,
	fluteAmount: 80,
	keyName: "unknown",
	centroidHz: 0,
	flatness: 0,
	rolloffHz: 0,
	pitchHz: 0,
	tone: "JBL",
	extras: [],
	room: "club"
};
var FILL = " After the break the hook returns harder, the flute stays bright, and the pedal stays tense until the final breath.";
var NOTES = [
	"C",
	"C#",
	"D",
	"D#",
	"E",
	"F",
	"F#",
	"G",
	"G#",
	"A",
	"A#",
	"B"
];
var BANNED = /\b(centroid|rolloff|flatness|meyda|yin|lufs|crest|sidechain|clearmountain|brauer|scheps|katz|ludwig|time-map|formant|dbtp|metadata|opfs)\b/i;
var DEFAULT_EXCLUDE = [
	"EDM",
	"supersaw",
	"harsh highs",
	"muddy low-mids",
	"distorted bass"
];
var HINTS = [
	[/ít lời|không lời|khong loi/i, "mostly instrumental, with little or no sung lyric"],
	[/đậm hơi|nhiều hơi|dam hoi/i, "more breath in the flute"],
	[/buồn|u sầu|u sau/i, "a sad, wistful mood"],
	[/tươi|rộn ràng|vui/i, "a lighter, brighter mood"],
	[/ngân/i, "long sustained flute notes"],
	[/mộc|gần mic/i, "a close, dry wooden sound"],
	[/đêm|sông|dem song/i, "a quiet night-river mood"]
];
function toAscii(raw) {
	return raw.replace(/[^\t\n\r\x20-\x7E]/g, " ");
}
function prettyKey(name) {
	const match = toAscii(name).trim().match(/^([A-G])(#|b)?\s+(major|minor|pentatonic|dorian|mixolydian)$/i);
	if (!match) return null;
	return `${match[1].toUpperCase()}${match[2] ?? ""} ${match[3].toLowerCase()}`;
}
function hzToNote(hz) {
	if (!Number.isFinite(hz) || hz < 70 || hz > 1800) return null;
	const midi = Math.round(69 + 12 * Math.log2(hz / 440));
	return `${NOTES[(midi % 12 + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}
function scrubSentences(text) {
	return text.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/).filter((part) => part && !BANNED.test(part) && !/\b\d+(?:\.\d+)?\s*hz\b/i.test(part) && !/\b\d+\s*:\s*\d+\b/.test(part)).join(" ");
}
function noteSentence(note) {
	const hits = HINTS.filter(([re]) => re.test(note)).map(([, line]) => line);
	if (!hits.length) return "";
	const line = hits.join(", ");
	return `${line.charAt(0).toUpperCase()}${line.slice(1)}.`;
}
function extraExclude(note) {
	const extra = [];
	if (/\bedm\b/i.test(note)) extra.push("EDM");
	if (/supersaw/i.test(note)) extra.push("supersaw");
	return extra;
}
function sourceColor(f) {
	if (f.kind === "none" && f.durationSec <= 0 && f.pitchHz <= 0) return [];
	const lines = [];
	const note = hzToNote(f.pitchHz);
	if (note) lines.push(`The flute center sits near ${note}.`);
	if (f.durationSec >= 90) lines.push("The source breathes slowly.");
	if ((f.bands?.sub ?? 0) > 0 && f.bands.sub < 30) lines.push("The low end is thin.");
	if (f.bpmEstimate > 0 && f.bpmEstimate < 130) lines.push("The source sits back, so the hook pushes ahead to the lock.");
	return lines;
}
function balanceLine(sub, flute) {
	return `${sub >= 70 ? "The sub stays forward." : "The sub stays lighter."} ${flute >= 70 ? "The flute stays forward." : "The flute stays lighter."}`;
}
function capSentences(required, optional, max) {
	const kept = required.filter(Boolean);
	for (const line of optional) {
		if (!line) continue;
		if ([...kept, line].join(" ").length <= max) kept.push(line);
	}
	return kept.join(" ");
}
function fit995(style, exclude) {
	const tail = exclude.replace(/\s+/g, " ").trim() || DEFAULT_EXCLUDE.join(", ");
	const budget = 995 - (`Style:\n`.length + `\n\nExclude:\n`.length + tail.length);
	let body = toAscii(style).replace(/\s+/g, " ").trim();
	if (budget < 40) return fit995(style, DEFAULT_EXCLUDE.join(", "));
	if (body.length > budget) {
		body = body.slice(0, budget);
		const sp = body.lastIndexOf(" ");
		if (sp > budget - 48) body = body.slice(0, sp);
	}
	while (body.length < budget) {
		if (budget - body.length < 115) {
			body = body.padEnd(budget, " ");
			break;
		}
		body += FILL;
	}
	const out = `Style:\n${body}\n\nExclude:\n${tail}`;
	return out.length === 995 ? out : out.slice(0, 995).padEnd(995, " ");
}
function bassLine(tone) {
	return `A deep mono sub is ${tone === "BOSE" ? "smooth and enveloping, the body of a Bose system" : tone === "TOA" ? "tight and projected, the far throw of a TOA horn" : tone === "ONKYO" ? "precise and detailed, the grip of an Onkyo system" : tone === "YAMAHA" ? "even and musical, the balance of a Yamaha system" : "punchy and heavy, the weight of a large JBL cabinet"}. It holds a tense pedal. A short dry kick marks time, and the low fifth enters late.`;
}
function roomLine(room) {
	if (room === "stadium") return "The room is a stadium, wide and far, flute slightly right.";
	if (room === "wedding") return "The room is a wedding, warm and ceremonial, flute slightly right.";
	if (room === "hall") return "The room is a concert hall, clear with a short bloom, flute slightly right.";
	return "The room is a nightclub, close and physical, flute slightly right.";
}
var EXTRA_PHRASE = {
	brass: "ceremonial brass",
	violin: "violin",
	metal: "metal flute",
	bells: "temple bells",
	bau: "dan bau"
};
function ensembleLine(ids) {
	const bits = EXTRA_IDS.filter((id) => ids.includes(id)).map((id) => EXTRA_PHRASE[id]);
	if (!bits.length) return "";
	return `The ensemble also carries ${bits.join(", ")}.`;
}
function quantumInput(f) {
	return {
		subAmount: f.subAmount,
		fluteAmount: f.fluteAmount,
		pitchHz: f.pitchHz,
		centroidHz: f.centroidHz,
		air: f.bands?.air ?? 0,
		note: f.note
	};
}
function quantumSentence(f) {
	return quantumMusic(quantumInput(f)).sentence;
}
function composePrompt(f) {
	const key = prettyKey(f.keyName) ?? "D pentatonic";
	const tone = TONE_IDS.includes(f.tone) ? f.tone : "JBL";
	const room = ROOM_IDS.includes(f.room) ? f.room : "club";
	const extras = EXTRA_IDS.filter((id) => f.extras?.includes(id));
	const required = [
		"Cinematic northern Vietnamese folk, yearning, vi von, opening at high energy.",
		"From the first bar the hook, the kick, and the bright flute hit together.",
		"A bright bamboo flute sings clearly: breath, a slide in, one ornamental turn, end vibrato, unequal phrases.",
		bassLine(tone),
		ensembleLine(extras),
		`Locked at 150 BPM in ${key}. One suspension colors the harmony and resolves only at the peak.`,
		"Across at least four minutes the line rises by step, a second flute a sixth above brightens the peak, then one single breath.",
		roomLine(room)
	];
	const optional = [
		noteSentence(f.note),
		...sourceColor(f),
		quantumSentence(f),
		balanceLine(f.subAmount, f.fluteAmount)
	];
	const exclude = [...DEFAULT_EXCLUDE, ...extraExclude(f.note)];
	const tail = exclude.filter((item, i) => exclude.findIndex((x) => x.toLowerCase() === item.toLowerCase()) === i).join(", ");
	const budget = 995 - (`Style:\n`.length + `\n\nExclude:\n`.length + tail.length);
	return fit995(capSentences(required, optional, Math.max(80, budget)), tail);
}
function asSunoPrompt(raw, facts = DEFAULT_FACTS) {
	const match = toAscii(raw).replace(/```[a-z]*/gi, "").replace(/[*#]/g, "").trim().match(/Style:\s*([\s\S]*?)\n\s*Exclude:\s*([^\n]+)/i);
	if (!match) return composePrompt(facts);
	const style = scrubSentences(match[1] ?? "");
	const exclude = scrubSentences(match[2] ?? "").replace(/\.$/, "");
	if (style.length < 80 || !/\b150\b/.test(style) || !/flute/i.test(style)) return composePrompt(facts);
	return fit995(lockChoices(lockForm(style), facts), exclude.length > 3 ? exclude : DEFAULT_EXCLUDE.join(", "));
}
var TONE_WORD = {
	JBL: "JBL",
	BOSE: "Bose",
	TOA: "TOA",
	ONKYO: "Onkyo",
	YAMAHA: "Yamaha"
};
var ROOM_WORD = {
	club: "nightclub",
	stadium: "stadium",
	wedding: "wedding",
	hall: "concert hall"
};
function lockChoices(style, f) {
	let next = style;
	const tone = TONE_IDS.includes(f.tone) ? f.tone : "JBL";
	const room = ROOM_IDS.includes(f.room) ? f.room : "club";
	if (!next.includes(TONE_WORD[tone])) next += ` The low end keeps the ${TONE_WORD[tone]} character.`;
	if (!next.toLowerCase().includes(ROOM_WORD[room])) next += ` ${roomLine(room)}`;
	for (const id of EXTRA_IDS) {
		if (!f.extras?.includes(id)) continue;
		const needle = id === "metal" ? "metal flute" : id === "bells" ? "temple bells" : id === "bau" ? "dan bau" : id === "violin" ? "violin" : "brass";
		if (!next.toLowerCase().includes(needle)) next += ` Keep ${EXTRA_PHRASE[id]}.`;
	}
	if (!next.toLowerCase().includes("interference sets the line")) next += ` ${quantumSentence(f)}`;
	return next;
}
function lockForm(style) {
	let next = style.replace(/\s+/g, " ").trim();
	if (!/high energy/i.test(next)) next += " From the first bar the hook, the kick, and the bright flute hit together at high energy.";
	if (!/at least four minutes/i.test(next)) next += " The piece runs at least four minutes and keeps the hook through the final section.";
	return next;
}
var PI = Math.PI;
var CAN = [
	"Giáp",
	"Ất",
	"Bính",
	"Đinh",
	"Mậu",
	"Kỷ",
	"Canh",
	"Tân",
	"Nhâm",
	"Quý"
];
var CHI = [
	"Tý",
	"Sửu",
	"Dần",
	"Mão",
	"Thìn",
	"Tỵ",
	"Ngọ",
	"Mùi",
	"Thân",
	"Dậu",
	"Tuất",
	"Hợi"
];
var THU = [
	"Chủ nhật",
	"Thứ hai",
	"Thứ ba",
	"Thứ tư",
	"Thứ năm",
	"Thứ sáu",
	"Thứ bảy"
];
function jdFromDate(dd, mm, yy) {
	const a = Math.floor((14 - mm) / 12);
	const y = yy + 4800 - a;
	const m = mm + 12 * a - 3;
	let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
	if (jd < 2299161) jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
	return jd;
}
function getNewMoonDay(k, timeZone) {
	const T = k / 1236.85;
	const T2 = T * T;
	const T3 = T2 * T;
	const dr = PI / 180;
	let Jd1 = 2415020.75933 + 29.53058868 * k + 1178e-7 * T2 - 155e-9 * T3;
	Jd1 += 33e-5 * Math.sin((166.56 + 132.87 * T - .009173 * T2) * dr);
	const M = 359.2242 + 29.10535608 * k - 333e-7 * T2 - 347e-8 * T3;
	const Mpr = 306.0253 + 385.81691806 * k + .0107306 * T2 + 1236e-8 * T3;
	const F = 21.2964 + 390.67050646 * k - .0016528 * T2 - 239e-8 * T3;
	let C1 = (.1734 - 393e-6 * T) * Math.sin(M * dr) + .0021 * Math.sin(2 * dr * M);
	C1 -= .4068 * Math.sin(Mpr * dr) + .0161 * Math.sin(dr * 2 * Mpr);
	C1 -= 4e-4 * Math.sin(dr * 3 * Mpr);
	C1 += .0104 * Math.sin(dr * 2 * F) - .0051 * Math.sin(dr * (M + Mpr));
	C1 -= .0074 * Math.sin(dr * (M - Mpr)) + 4e-4 * Math.sin(dr * (2 * F + M));
	C1 -= 4e-4 * Math.sin(dr * (2 * F - M)) - 6e-4 * Math.sin(dr * (2 * F + Mpr));
	C1 += .001 * Math.sin(dr * (2 * F - Mpr)) + 5e-4 * Math.sin(dr * (2 * Mpr + M));
	const deltat = T < -11 ? .001 + 839e-6 * T + 2261e-7 * T2 - 845e-8 * T3 - 81e-9 * T * T3 : -278e-6 + 265e-6 * T + 262e-6 * T2;
	return Math.floor(Jd1 + C1 - deltat + .5 + timeZone / 24);
}
function getSunLongitude(jdn, timeZone) {
	const T = (jdn - 2451545.5 - timeZone / 24) / 36525;
	const T2 = T * T;
	const dr = PI / 180;
	const M = 357.5291 + 35999.0503 * T - 1559e-7 * T2 - 48e-8 * T * T2;
	const L0 = 280.46645 + 36000.76983 * T + 3032e-7 * T2;
	let DL = (1.9146 - .004817 * T - 14e-6 * T2) * Math.sin(dr * M);
	DL += (.019993 - 101e-6 * T) * Math.sin(dr * 2 * M) + 29e-5 * Math.sin(dr * 3 * M);
	let L = (L0 + DL) * dr;
	L -= PI * 2 * Math.floor(L / (PI * 2));
	return Math.floor(L / PI * 6);
}
function getLunarMonth11(yy, timeZone) {
	const off = jdFromDate(31, 12, yy) - 2415021;
	const k = Math.floor(off / 29.530588853);
	let nm = getNewMoonDay(k, timeZone);
	if (getSunLongitude(nm, timeZone) >= 9) nm = getNewMoonDay(k - 1, timeZone);
	return nm;
}
function getLeapMonthOffset(a11, timeZone) {
	const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + .5);
	let last = 0;
	let i = 1;
	let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
	do {
		last = arc;
		i++;
		arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
	} while (arc !== last && i < 14);
	return i - 1;
}
function solarToLunar(dd, mm, yy, timeZone = 7) {
	const dayNumber = jdFromDate(dd, mm, yy);
	const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
	let monthStart = getNewMoonDay(k + 1, timeZone);
	if (monthStart > dayNumber) monthStart = getNewMoonDay(k, timeZone);
	let a11 = getLunarMonth11(yy, timeZone);
	let b11 = a11;
	let lunarYear;
	if (a11 >= monthStart) {
		lunarYear = yy;
		a11 = getLunarMonth11(yy - 1, timeZone);
	} else {
		lunarYear = yy + 1;
		b11 = getLunarMonth11(yy + 1, timeZone);
	}
	const lunarDay = dayNumber - monthStart + 1;
	const diff = Math.floor((monthStart - a11) / 29);
	let leap = 0;
	let lunarMonth = diff + 11;
	if (b11 - a11 > 365) {
		const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
		if (diff >= leapMonthDiff) {
			lunarMonth = diff + 10;
			if (diff === leapMonthDiff) leap = 1;
		}
	}
	if (lunarMonth > 12) lunarMonth -= 12;
	if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
	return {
		day: lunarDay,
		month: lunarMonth,
		year: lunarYear,
		leap
	};
}
function canChi(year) {
	return `${CAN[((year - 1984) % 10 + 10) % 10]} ${CHI[((year - 1984) % 12 + 12) % 12]}`;
}
function formatCivil(d) {
	const lunar = solarToLunar(d.getDate(), d.getMonth() + 1, d.getFullYear());
	const leap = lunar.leap ? " nhuận" : "";
	return {
		solar: `${THU[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
		lunar: `${lunar.day} tháng ${lunar.month}${leap} · ${canChi(lunar.year)}`
	};
}
var SOLAR = [
	[
		1,
		1,
		"Tết Dương lịch"
	],
	[
		4,
		30,
		"Ngày Thống nhất"
	],
	[
		5,
		1,
		"Quốc tế Lao động"
	],
	[
		9,
		2,
		"Quốc khánh"
	],
	[
		11,
		20,
		"Nhà giáo Việt Nam"
	],
	[
		12,
		22,
		"Thành lập Quân đội"
	],
	[
		12,
		25,
		"Giáng sinh"
	]
];
function startOfDay(d) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}
function nextCivicEvent(from) {
	const today = startOfDay(from);
	const found = [];
	for (let add = 0; add <= 1; add++) for (const [month, day, name] of SOLAR) {
		const at = new Date(from.getFullYear() + add, month - 1, day).getTime();
		if (at >= today) found.push({
			name,
			at
		});
	}
	const tet = new Date(2027, 1, 6).getTime();
	if (tet >= today) found.push({
		name: "Tết Nguyên đán Đinh Mùi",
		at: tet
	});
	found.sort((a, b) => a.at - b.at);
	const next = found[0];
	if (!next) return null;
	return {
		name: next.name,
		days: Math.round((next.at - today) / 864e5)
	};
}
/** Autocorrelation BPM on an onset envelope. hopSec is the sample period. */
function estimateBpm(energy, hopSec = .05) {
	if (energy.length < 60) return {
		bpm: 0,
		confidence: 0
	};
	const mean = energy.reduce((a, b) => a + b, 0) / energy.length;
	const x = energy.map((v) => v - mean);
	let power = 0;
	for (const v of x) power += v * v;
	if (power < 1e-8) return {
		bpm: 0,
		confidence: 0
	};
	const minLag = Math.max(2, Math.round(60 / 180 / hopSec));
	const maxLag = Math.min(x.length - 2, Math.round(60 / 80 / hopSec));
	let best = -Infinity;
	let second = -Infinity;
	let bestLag = minLag;
	for (let lag = minLag; lag <= maxLag; lag++) {
		let acc = 0;
		for (let i = lag; i < x.length; i++) acc += x[i] * x[i - lag];
		const score = acc / (x.length - lag);
		if (score > best) {
			second = best;
			best = score;
			bestLag = lag;
		} else if (score > second) second = score;
	}
	const bpm = Math.round(60 / (bestLag * hopSec));
	const norm = best / (power / x.length);
	const sep = best <= 0 ? 0 : (best - Math.max(0, second)) / best;
	return {
		bpm,
		confidence: Math.max(0, Math.min(1, norm * .65 + sep * .35))
	};
}
var NAMES = [
	"C",
	"C#",
	"D",
	"D#",
	"E",
	"F",
	"F#",
	"G",
	"G#",
	"A",
	"A#",
	"B"
];
var MAJOR = [
	6.35,
	2.23,
	3.48,
	2.33,
	4.38,
	4.09,
	2.52,
	5.19,
	2.39,
	3.66,
	2.29,
	2.88
];
var MINOR = [
	6.33,
	2.68,
	3.52,
	5.38,
	2.6,
	3.53,
	2.54,
	4.75,
	3.98,
	2.69,
	3.34,
	3.17
];
function correlate(chroma, profile, rotation) {
	let meanA = 0;
	let meanB = 0;
	for (let i = 0; i < 12; i++) {
		meanA += chroma[(i + rotation) % 12] ?? 0;
		meanB += profile[i] ?? 0;
	}
	meanA /= 12;
	meanB /= 12;
	let sum = 0;
	let sa = 0;
	let sb = 0;
	for (let i = 0; i < 12; i++) {
		const da = (chroma[(i + rotation) % 12] ?? 0) - meanA;
		const db = (profile[i] ?? 0) - meanB;
		sum += da * db;
		sa += da * da;
		sb += db * db;
	}
	return sum / (Math.sqrt(sa * sb) + 1e-9);
}
/** Krumhansl-Schmuckler key from a 12-bin chroma vector. */
function detectKey(chroma) {
	if (chroma.reduce((a, b) => a + b, 0) < .04) return "unknown";
	let best = .2;
	let name = "unknown";
	for (let rot = 0; rot < 12; rot++) {
		const major = correlate(chroma, MAJOR, rot);
		const minor = correlate(chroma, MINOR, rot);
		if (major > best) {
			best = major;
			name = `${NAMES[rot]} major`;
		}
		if (minor > best) {
			best = minor;
			name = `${NAMES[rot]} minor`;
		}
	}
	return name;
}
/**
* YIN pitch (de Cheveigne and Kawahara), short window.
* Returns Hz, or 0 when the frame is unpitched.
*/
function yinPitch(samples, sampleRate) {
	const n = samples.length;
	if (n < 64 || sampleRate < 8e3) return 0;
	const half = Math.floor(n / 2);
	const d = new Float32Array(half);
	for (let tau = 1; tau < half; tau++) {
		let sum = 0;
		for (let i = 0; i < half; i++) {
			const delta = (samples[i] ?? 0) - (samples[i + tau] ?? 0);
			sum += delta * delta;
		}
		d[tau] = sum;
	}
	const cmnd = new Float32Array(half);
	cmnd[0] = 1;
	let running = 0;
	for (let tau = 1; tau < half; tau++) {
		running += d[tau] ?? 0;
		cmnd[tau] = running > 0 ? (d[tau] ?? 0) * tau / running : 1;
	}
	const minTau = Math.max(2, Math.floor(sampleRate / 1800));
	const maxTau = Math.min(half - 2, Math.floor(sampleRate / 70));
	const threshold = .18;
	let tau = -1;
	for (let t = minTau; t <= maxTau; t++) if ((cmnd[t] ?? 1) < threshold) {
		tau = t;
		while (tau + 1 <= maxTau && (cmnd[tau + 1] ?? 1) < (cmnd[tau] ?? 1)) tau++;
		break;
	}
	if (tau < 0) return 0;
	const x0 = cmnd[tau - 1] ?? 1;
	const x1 = cmnd[tau] ?? 1;
	const x2 = cmnd[tau + 1] ?? 1;
	const denom = 2 * x1 - x2 - x0;
	const better = Math.abs(denom) > 1e-9 ? tau + (x2 - x0) / (2 * denom) : tau;
	if (better <= 0) return 0;
	return sampleRate / better;
}
var SCALE = [
	293.66,
	349.23,
	392,
	440,
	523.25,
	587.33,
	659.25,
	523.25
];
var PATTERN = [
	0,
	2,
	4,
	7,
	4,
	2,
	3,
	5
];
var emptyBands = () => ({
	sub: 0,
	bass: 0,
	lowMid: 0,
	mid: 0,
	presence: 0,
	air: 0
});
function bandAvg(freq, sampleRate, lo, hi) {
	const nyquist = sampleRate / 2;
	const n = freq.length;
	const i0 = Math.max(0, Math.floor(lo / nyquist * n));
	const i1 = Math.min(n - 1, Math.ceil(hi / nyquist * n));
	let s = 0;
	let c = 0;
	for (let i = i0; i <= i1; i++) {
		s += freq[i] ?? 0;
		c++;
	}
	return c ? s / c / 255 * 100 : 0;
}
var RemixEngine = class {
	ctx = null;
	audioEl = null;
	videoEl = null;
	audioSrc = null;
	videoSrc = null;
	input = null;
	shelf = null;
	mud = null;
	presence = null;
	fluteBus = null;
	master = null;
	analyser = null;
	noise = null;
	meter = null;
	fluteTimer = null;
	nextNote = 0;
	noteIndex = 0;
	onsets = [];
	prevRms = 0;
	lastSample = 0;
	bpmAccum = 0;
	objectUrl = null;
	subAmount = .85;
	fluteAmount = .8;
	mode = "wet";
	playing = false;
	demo = false;
	freq = /* @__PURE__ */ new Uint8Array(1024);
	time = /* @__PURE__ */ new Uint8Array(2048);
	floatTime = /* @__PURE__ */ new Float32Array(2048);
	chroma = new Array(12).fill(0);
	featureTick = 0;
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
	kind = "none";
	error = null;
	attach(audio, video) {
		this.audioEl = audio;
		this.videoEl = video;
	}
	get playingNow() {
		return this.playing;
	}
	snapshot() {
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
			pitchHz: this.pitchHz
		};
	}
	ensure() {
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
		mud.Q.value = .9;
		const presence = ctx.createBiquadFilter();
		presence.type = "peaking";
		presence.frequency.value = 3200;
		presence.Q.value = .7;
		const comp = ctx.createDynamicsCompressor();
		comp.threshold.value = -18;
		comp.knee.value = 6;
		comp.ratio.value = 3.2;
		comp.attack.value = .01;
		comp.release.value = .18;
		const limiter = ctx.createDynamicsCompressor();
		limiter.threshold.value = -1.2;
		limiter.knee.value = 0;
		limiter.ratio.value = 20;
		limiter.attack.value = .003;
		limiter.release.value = .08;
		const master = ctx.createGain();
		const analyser = ctx.createAnalyser();
		analyser.fftSize = 2048;
		analyser.smoothingTimeConstant = .72;
		this.freq = new Uint8Array(analyser.frequencyBinCount);
		this.time = new Uint8Array(analyser.fftSize);
		const fluteBus = ctx.createGain();
		fluteBus.gain.value = 0;
		const flutePan = ctx.createStereoPanner();
		flutePan.pan.value = .42;
		const lowPan = ctx.createStereoPanner();
		lowPan.pan.value = -.28;
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
	applyTone() {
		if (!this.ctx || !this.shelf || !this.mud || !this.presence || !this.master || !this.fluteBus) return;
		const wet = this.mode === "wet";
		const now = this.ctx.currentTime;
		this.shelf.gain.setTargetAtTime(wet ? this.subAmount * 14 : 0, now, .03);
		this.mud.gain.setTargetAtTime(wet ? -3.5 - this.subAmount * 2 : 0, now, .03);
		this.presence.gain.setTargetAtTime(wet ? 1.6 : 0, now, .03);
		this.master.gain.setTargetAtTime(wet ? 1.25 : 1, now, .03);
		this.fluteBus.gain.setTargetAtTime(wet ? this.fluteAmount : 0, now, .03);
	}
	setMode(mode) {
		this.mode = mode;
		this.applyTone();
	}
	setSub(percent) {
		this.subAmount = Math.max(0, Math.min(1, percent / 100));
		this.applyTone();
	}
	setFlute(percent) {
		this.fluteAmount = Math.max(0, Math.min(1, percent / 100));
		this.applyTone();
	}
	loadFile(file, label) {
		this.ensure();
		this.ctx?.resume();
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
		el.play().catch(() => {
			this.playing = false;
			this.error = "Trình duyệt chặn phát. Bấm Phát lần nữa.";
		});
		el.addEventListener("loadedmetadata", () => {
			this.durationSec = Number.isFinite(el.duration) ? el.duration : 0;
		}, { once: true });
		rememberFile(file, this.fileLabel);
	}
	loadRemote(src, label, kind) {
		this.ensure();
		this.ctx?.resume();
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
		el.play().catch(() => {
			this.playing = false;
			this.error = "Chưa nghe được link. Kiểm tra lại địa chỉ file.";
		});
		el.addEventListener("loadedmetadata", () => {
			this.durationSec = Number.isFinite(el.duration) ? el.duration : 0;
		}, { once: true });
	}
	play() {
		try {
			this.ensure();
		} catch {
			this.error = "Máy không mở được mạch tiếng. Bấm Phát lại.";
			return;
		}
		if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
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
		el.play().catch(() => {
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
		else this.play();
	}
	startTimers() {
		if (this.meter != null) return;
		this.lastSample = performance.now();
		this.meter = window.setInterval(() => this.sample(), 50);
		this.fluteTimer = window.setInterval(() => this.schedule(), 90);
	}
	stopTimers() {
		if (this.meter != null) window.clearInterval(this.meter);
		if (this.fluteTimer != null) window.clearInterval(this.fluteTimer);
		this.meter = null;
		this.fluteTimer = null;
	}
	sample() {
		if (!this.playing || !this.analyser || !this.ctx) return;
		const now = performance.now();
		const dt = Math.min(.2, (now - this.lastSample) / 1e3);
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
		const measured = {
			sub: bandAvg(this.freq, rate, 20, 60),
			bass: bandAvg(this.freq, rate, 60, 140),
			lowMid: bandAvg(this.freq, rate, 140, 400),
			mid: bandAvg(this.freq, rate, 400, 2e3),
			presence: bandAvg(this.freq, rate, 2e3, 5e3),
			air: bandAvg(this.freq, rate, 5e3, 12e3)
		};
		Object.keys(measured).forEach((key) => {
			this.bands[key] = this.bands[key] * .72 + measured[key] * .28;
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
	extractOpen(sampleRate) {
		try {
			Meyda.bufferSize = 1024;
			Meyda.sampleRate = sampleRate;
			const features = Meyda.extract([
				"spectralCentroid",
				"spectralFlatness",
				"spectralRolloff",
				"chroma"
			], this.floatTime.subarray(0, 1024));
			if (!features) return;
			if (typeof features.spectralCentroid === "number" && features.spectralCentroid > 0) this.centroidHz = this.centroidHz * .75 + features.spectralCentroid * .25;
			if (typeof features.spectralFlatness === "number") this.flatness = this.flatness * .75 + features.spectralFlatness * .25;
			if (typeof features.spectralRolloff === "number" && features.spectralRolloff > 0) this.rolloffHz = this.rolloffHz * .75 + features.spectralRolloff * .25;
			if (features.chroma && features.chroma.length >= 12) {
				for (let i = 0; i < 12; i++) this.chroma[i] = (this.chroma[i] ?? 0) * .86 + (features.chroma[i] ?? 0) * .14;
				this.keyName = detectKey(this.chroma);
			}
		} catch {}
		if (this.featureTick % 12 !== 0) return;
		const hz = yinPitch(this.floatTime.subarray(0, 1024), sampleRate);
		if (hz > 70 && hz < 1800) this.pitchHz = this.pitchHz > 0 ? this.pitchHz * .6 + hz * .4 : hz;
	}
	schedule() {
		if (!this.playing || !this.ctx || this.mode !== "wet" || this.fluteAmount < .03) return;
		const beat = 60 / 150;
		const horizon = this.ctx.currentTime + .3;
		if (this.nextNote < this.ctx.currentTime + .02) this.nextNote = this.ctx.currentTime + .05;
		let guard = 0;
		while (this.nextNote < horizon && guard < 4) {
			const step = this.noteIndex % 8 === 3 ? beat * 2 : beat;
			if (this.noteIndex % 8 !== 7) {
				const degree = PATTERN[this.noteIndex % PATTERN.length] ?? 0;
				this.spit(SCALE[degree] ?? 392, this.nextNote, Math.min(beat * .95, step * .9));
			}
			if (this.demo) this.kick(this.nextNote);
			this.noteIndex++;
			this.nextNote += step;
			guard++;
		}
	}
	spit(freq, time, dur) {
		const ctx = this.ctx;
		const bus = this.fluteBus;
		const noise = this.noise;
		if (!ctx || !bus || !noise) return;
		const osc = ctx.createOscillator();
		osc.type = "sine";
		osc.frequency.setValueAtTime(freq * 1.015, time);
		osc.frequency.exponentialRampToValueAtTime(freq, time + Math.min(.09, dur));
		const g = ctx.createGain();
		g.gain.setValueAtTime(1e-4, time);
		g.gain.exponentialRampToValueAtTime(.16, time + .045);
		g.gain.exponentialRampToValueAtTime(1e-4, time + Math.max(.08, dur));
		const bp = ctx.createBiquadFilter();
		bp.type = "bandpass";
		bp.frequency.value = Math.min(1800, freq * 2.1);
		bp.Q.value = 3.2;
		osc.connect(bp);
		bp.connect(g);
		g.connect(bus);
		osc.start(time);
		osc.stop(time + dur + .05);
		const src = ctx.createBufferSource();
		src.buffer = noise;
		const ng = ctx.createGain();
		ng.gain.setValueAtTime(1e-4, time);
		ng.gain.exponentialRampToValueAtTime(.035, time + .02);
		ng.gain.exponentialRampToValueAtTime(1e-4, time + Math.min(.16, dur));
		const air = ctx.createBiquadFilter();
		air.type = "bandpass";
		air.frequency.value = 1700;
		air.Q.value = .6;
		src.connect(air);
		air.connect(ng);
		ng.connect(bus);
		src.start(time);
		src.stop(time + .2);
	}
	kick(time) {
		const ctx = this.ctx;
		const input = this.input;
		if (!ctx || !input) return;
		const osc = ctx.createOscillator();
		osc.type = "sine";
		osc.frequency.setValueAtTime(146, time);
		osc.frequency.exponentialRampToValueAtTime(40, time + .09);
		const g = ctx.createGain();
		const peak = .2 + this.subAmount * .45;
		g.gain.setValueAtTime(1e-4, time);
		g.gain.exponentialRampToValueAtTime(peak, time + .008);
		g.gain.exponentialRampToValueAtTime(1e-4, time + .26);
		osc.connect(g);
		g.connect(input);
		osc.start(time);
		osc.stop(time + .3);
	}
	dispose() {
		this.pause();
		if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
		this.ctx?.close();
		this.ctx = null;
	}
};
async function rememberFile(file, label) {
	try {
		const writable = await (await (await navigator.storage.getDirectory()).getFileHandle("last-source.bin", { create: true })).createWritable();
		await file.stream().pipeTo(writable);
		localStorage.setItem("tramsao.last", JSON.stringify({
			name: label,
			type: file.type || "application/octet-stream"
		}));
	} catch {}
}
async function loadRemembered() {
	try {
		const raw = localStorage.getItem("tramsao.last");
		if (!raw) return null;
		const meta = JSON.parse(raw);
		const file = await (await (await navigator.storage.getDirectory()).getFileHandle("last-source.bin")).getFile();
		return {
			file,
			label: meta.name || file.name
		};
	} catch {
		return null;
	}
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var upgradePrompt = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("ce869ca0e4c95092056c59d42d2ffcbb838739427cca65d98e07fb93ce38c560"));
var TICKER = "AUTO PROMPT MUSIC · MỞ ĐẦU NĂNG LƯỢNG CAO · BÀI DÀI ÍT NHẤT 4 PHÚT · BASS SÂU CĂNG · SÁO SÁNG VÍ VON · KHÓA 150 BPM · STYLE SUNO CHÉP VÀ DÁN · FILE Ở TRÊN MÁY · KHÔNG CHẨN ĐOÁN Y TẾ · KIỂM TRA NGUỒN TIN TRƯỚC KHI CHIA SẺ · ";
function factsFrom(snap, note, sub, flute, tone, extras, room) {
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
		room
	};
}
function Studio() {
	const engineRef = (0, import_react.useRef)(null);
	const audioRef = (0, import_react.useRef)(null);
	const videoRef = (0, import_react.useRef)(null);
	const radioRef = (0, import_react.useRef)(null);
	const meterRef = (0, import_react.useRef)(null);
	const fileRef = (0, import_react.useRef)(null);
	const newRef = (0, import_react.useRef)(null);
	const autoWrote = (0, import_react.useRef)(false);
	const drag = (0, import_react.useRef)(null);
	const posRef = (0, import_react.useRef)(null);
	const runAi = useServerFn(upgradePrompt);
	const [prompt, setPrompt] = (0, import_react.useState)(() => composePrompt(DEFAULT_FACTS));
	const [edited, setEdited] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	const [sub, setSub] = (0, import_react.useState)(85);
	const [flute, setFlute] = (0, import_react.useState)(80);
	const [tone, setTone] = (0, import_react.useState)("JBL");
	const [extras, setExtras] = (0, import_react.useState)([]);
	const [room, setRoom] = (0, import_react.useState)("club");
	const [mode, setMode] = (0, import_react.useState)("wet");
	const [snap, setSnap] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)("Chọn audio hoặc video, hoặc bấm Phát để nghe mẫu khóa 150.");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [history, setHistory] = (0, import_react.useState)([]);
	const [kept, setKept] = (0, import_react.useState)(null);
	const [now, setNow] = (0, import_react.useState)(null);
	const [fx, setFx] = (0, import_react.useState)("bấm để lấy");
	const [radioOn, setRadioOn] = (0, import_react.useState)(false);
	const [idle, setIdle] = (0, import_react.useState)(false);
	const [wxAsk, setWxAsk] = (0, import_react.useState)(false);
	const [wx, setWx] = (0, import_react.useState)(null);
	const [payReady, setPayReady] = (0, import_react.useState)(false);
	const [gate, setGate] = (0, import_react.useState)(null);
	const [closed, setClosed] = (0, import_react.useState)(false);
	const [sticker, setSticker] = (0, import_react.useState)(null);
	const [link, setLink] = (0, import_react.useState)("");
	const [hearing, setHearing] = (0, import_react.useState)(false);
	const [showVideo, setShowVideo] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const engine = new RemixEngine();
		engineRef.current = engine;
		if (audioRef.current && videoRef.current) engine.attach(audioRef.current, videoRef.current);
		engine.setSub(85);
		engine.setFlute(80);
		const id = window.setInterval(() => setSnap(engine.snapshot()), 400);
		loadRemembered().then((found) => {
			if (found) setKept(found.label);
		});
		try {
			const raw = localStorage.getItem("tramsao.history");
			if (raw) setHistory(JSON.parse(raw));
			const pos = localStorage.getItem("tramsao.sticker");
			if (pos) setSticker(JSON.parse(pos));
			const taste = localStorage.getItem("tramsao.taste");
			if (taste) {
				const t = JSON.parse(taste);
				let nextSub = 85;
				let nextFlute = 80;
				let nextTone = "JBL";
				let nextExtras = [];
				let nextRoom = "club";
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
				if (t.tone && TONE_IDS.includes(t.tone)) {
					nextTone = t.tone;
					setTone(nextTone);
				}
				if (Array.isArray(t.extras)) {
					nextExtras = t.extras.filter((id) => EXTRA_IDS.includes(id));
					setExtras(nextExtras);
				}
				if (t.room && ROOM_IDS.includes(t.room)) {
					nextRoom = t.room;
					setRoom(nextRoom);
				}
				setPrompt(composePrompt({
					...DEFAULT_FACTS,
					subAmount: nextSub,
					fluteAmount: nextFlute,
					tone: nextTone,
					extras: nextExtras,
					room: nextRoom
				}));
			}
		} catch {}
		return () => {
			window.clearInterval(id);
			engine.dispose();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const allow = (target) => {
			const el = target instanceof Element ? target.closest("input, textarea") : null;
			return Boolean(el);
		};
		const blockSelect = (event) => {
			if (!allow(event.target)) event.preventDefault();
		};
		const blockKeys = (event) => {
			if (!(event.ctrlKey || event.metaKey)) return;
			if (event.key === "+" || event.key === "-" || event.key === "=" || event.key === "0") event.preventDefault();
		};
		const blockWheel = (event) => {
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
	(0, import_react.useEffect)(() => {
		const tick = () => setNow(/* @__PURE__ */ new Date());
		tick();
		const id = window.setInterval(tick, 3e4);
		return () => window.clearInterval(id);
	}, []);
	(0, import_react.useEffect)(() => {
		const zone = newRef.current;
		if (!zone) return;
		let timer = window.setTimeout(() => setIdle(true), 1e4);
		const arm = () => {
			setIdle(false);
			window.clearTimeout(timer);
			timer = window.setTimeout(() => setIdle(true), 1e4);
		};
		zone.addEventListener("pointerdown", arm);
		return () => {
			window.clearTimeout(timer);
			zone.removeEventListener("pointerdown", arm);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (gate !== "pay") return;
		const render = () => {
			const paypal = window.paypal;
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
		s.src = "https://www.paypal.com/sdk/js?client-id=BAAIfuQli_a3Qud-8CIRqCRCeohqtiW29_i2Txx2rQM35pqMc-pbCIZX6L8tx1zbyOj_vp8AUE_dpSqOhc&components=hosted-buttons&disable-funding=venmo&currency=USD";
		s.onload = render;
		s.onerror = () => setStatus("Không tải được PayPal. Thử lại.");
		document.body.appendChild(s);
	}, [gate]);
	(0, import_react.useEffect)(() => {
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
					kids[i].style.transform = `scaleY(${.08 + mag * .92})`;
				}
			}
			raf = requestAnimationFrame(draw);
		};
		raf = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(raf);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!snap || edited || autoWrote.current) return;
		if (snap.kind !== "none" && snap.heard >= 8) {
			autoWrote.current = true;
			setPrompt(composePrompt(factsFrom(snap, note, sub, flute, tone, extras, room)));
			setStatus("Đã dịch số đo thành Style Suno. Có thể gọi siêu AI để viết lại.");
		}
	}, [
		snap,
		edited,
		note,
		sub,
		flute,
		tone,
		extras,
		room
	]);
	function currentFacts() {
		const live = engineRef.current?.snapshot();
		if (!live) return {
			...DEFAULT_FACTS,
			note,
			subAmount: sub,
			fluteAmount: flute,
			tone,
			extras,
			room
		};
		return factsFrom(live, note, sub, flute, tone, extras, room);
	}
	function remember(nextSub, nextFlute, nextTone, nextExtras, nextRoom) {
		localStorage.setItem("tramsao.taste", JSON.stringify({
			sub: nextSub,
			flute: nextFlute,
			tone: nextTone,
			extras: nextExtras,
			room: nextRoom
		}));
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
	function paint(nextTone, nextExtras, nextRoom) {
		setTone(nextTone);
		setExtras(nextExtras);
		setRoom(nextRoom);
		remember(sub, flute, nextTone, nextExtras, nextRoom);
		if (!edited) setPrompt(composePrompt(factsFrom(engineRef.current?.snapshot() ?? blankSnap(), note, sub, flute, nextTone, nextExtras, nextRoom)));
	}
	async function onAi() {
		if (busy) return;
		setBusy(true);
		setStatus("Khách hàng đang chốt hướng, rồi người viết mới ra Style…");
		const facts = currentFacts();
		const data = {
			...facts,
			bpmEstimate: facts.bpmEstimate,
			draft: prompt.slice(0, 700)
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
	function onFile(file, label) {
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
			const body = await probe.json().catch(() => null);
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
		const next = [{
			id: Date.now(),
			title: title.slice(0, 42),
			prompt
		}, ...history.filter((h) => h.prompt !== prompt)].slice(0, 8);
		setHistory(next);
		localStorage.setItem("tramsao.history", JSON.stringify(next));
		setStatus("Đã nhớ prompt trên máy này.");
	}
	function setHeardMode(next) {
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
			const station = (await (await fetch("https://de1.api.radio-browser.info/json/stations/search?countrycode=VN&hidebroken=true&limit=15&order=votes&reverse=true")).json()).find((s) => s.url_resolved);
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
	function onStickerDown(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		drag.current = {
			dx: e.clientX - rect.left,
			dy: e.clientY - rect.top,
			moved: false
		};
		e.currentTarget.setPointerCapture(e.pointerId);
	}
	function onStickerMove(e) {
		if (!drag.current) return;
		drag.current.moved = true;
		const x = Math.max(8, Math.min(window.innerWidth - 80, e.clientX - drag.current.dx));
		const y = Math.max(8, Math.min(window.innerHeight - 80, e.clientY - drag.current.dy));
		posRef.current = {
			x,
			y
		};
		setSticker({
			x,
			y
		});
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
			const v = (await (await fetch("https://open.er-api.com/v6/latest/USD")).json())?.rates?.VND;
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
		navigator.geolocation.getCurrentPosition(async (pos) => {
			try {
				const url = `https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude.toFixed(3)}&longitude=${pos.coords.longitude.toFixed(3)}&current=temperature_2m,weather_code`;
				const t = (await (await fetch(url)).json()).current?.temperature_2m;
				setWx(typeof t === "number" ? `${Math.round(t)}°C · Open-Meteo` : "Chưa có số nhiệt.");
			} catch {
				setWx("Không lấy được thời tiết.");
			}
		}, () => setWx("Bạn từ chối vị trí. Thời tiết tắt."), {
			enableHighAccuracy: false,
			timeout: 8e3
		});
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
		note
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				ref: newRef,
				className: "zone-new frame-gold",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "close-btn",
						onClick: () => setGate("choose"),
						children: "Đóng"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "zone-scroll",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
								className: "mb-3 pr-16 pl-16",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-xs tracking-widest text-gold uppercase",
										children: "Xưởng prompt"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "font-display text-2xl leading-none text-balance text-fg",
										children: "AUTO PROMPT MUSIC"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-pretty text-muted",
										children: "Style cho Suno. Mở đầu năng lượng cao ngay nhịp đầu, bài dài ít nhất 4 phút. Bass sâu căng, sáo sáng ví von. Chép rồi dán."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/san",
										className: "mt-3 flex min-h-11 items-center justify-center border border-gold font-display tracking-wide text-gold uppercase",
										children: "Sàn ứng dụng"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-3 grid grid-cols-3 gap-2 text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										k: "BPM remix",
										v: "150"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										k: "Ký tự",
										v: `${count}/995`,
										hot: count === 995
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										k: "BPM đo",
										v: live && live.bpm > 0 ? String(live.bpm) : "—"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mb-3 flex min-h-16 w-full items-center justify-center border border-dashed border-gold bg-bg px-3 text-center text-fg",
								onClick: () => fileRef.current?.click(),
								onDragOver: (e) => e.preventDefault(),
								onDrop: (e) => {
									e.preventDefault();
									onFile(e.dataTransfer.files[0]);
								},
								children: "Thả audio hoặc video vào đây. Không giới hạn dung lượng."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: fileRef,
								className: "sr-only",
								type: "file",
								accept: "audio/*,video/*",
								onChange: (e) => {
									onFile(e.target.files?.[0]);
									e.target.value = "";
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mb-2 block text-sm text-fg",
								children: ["Link nhạc hoặc video trực tuyến", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: link,
									maxLength: 2e3,
									onChange: (e) => setLink(e.target.value),
									onKeyDown: (e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											hearLink();
										}
									},
									placeholder: "YouTube, TikTok, Facebook hoặc .mp3",
									className: "mt-1 w-full border border-gold bg-bg px-3 py-2 text-base text-fg outline-none"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mb-3 min-h-11 w-full border border-gold font-display tracking-wide text-gold uppercase disabled:opacity-50",
								disabled: hearing,
								onClick: () => void hearLink(),
								children: hearing ? "Đang mở link…" : "Nghe và bắt chước"
							}),
							kept ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "mb-3 min-h-11 w-full border border-gold text-gold",
								onClick: () => void restoreKept(),
								children: ["Mở lại bản đã giữ: ", kept]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
								ref: videoRef,
								playsInline: true,
								className: showVideo ? "relative z-10 mb-3 h-28 w-full bg-bg object-contain opacity-100" : "media-host"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
								ref: audioRef,
								preload: "auto",
								className: "media-host"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-1 font-display text-xs tracking-widest text-gold uppercase",
								children: "DSPSS · phổ thật · LOA3"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								ref: meterRef,
								className: "meter",
								"aria-hidden": "true",
								children: Array.from({ length: 28 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: i < 6 ? "bg-gold" : "bg-fg" }, i))
							}),
							live && live.kind !== "none" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-3 text-sm text-pretty text-muted",
								children: [
									"Gốc: sub ",
									Math.round(live.bands.sub),
									" · bass ",
									Math.round(live.bands.bass),
									" · hơi ",
									Math.round(live.bands.air),
									" ·",
									" ",
									live.durationSec ? `${live.durationSec.toFixed(0)}s` : "đang đọc",
									" · ",
									live.fileLabel,
									". Nâng cấp: sub ",
									sub,
									"/100, sáo ",
									flute,
									"/100, 150 BPM."
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-3 text-sm text-muted",
								children: "Chưa có file thì Phát nghe mẫu: kick sub JBL và sáo 150 trên máy, để hình dung prompt."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-3 text-sm text-pretty text-muted",
								children: [
									"Meyda ",
									live && live.centroidHz > 0 ? `${Math.round(live.centroidHz)} Hz` : "chưa đo",
									" · giọng",
									" ",
									live?.keyName && live.keyName !== "unknown" ? live.keyName : "chưa rõ",
									" · YIN",
									" ",
									live && live.pitchHz > 0 ? `${Math.round(live.pitchHz)} Hz` : "chưa có nốt"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mb-2 block text-sm text-fg",
								children: [
									"Độ trầm ",
									tone,
									" ",
									sub,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "range",
										min: 0,
										max: 100,
										value: sub,
										onChange: (e) => {
											const v = Number(e.target.value);
											setSub(v);
											engineRef.current?.setSub(v);
										},
										onPointerUp: () => commitSliders(sub, flute)
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mb-3 block text-sm text-fg",
								children: [
									"Độ sáo ví von ",
									flute,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "range",
										min: 0,
										max: 100,
										value: flute,
										onChange: (e) => {
											const v = Number(e.target.value);
											setFlute(v);
											engineRef.current?.setFlute(v);
										},
										onPointerUp: () => commitSliders(sub, flute)
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-1 font-display text-xs tracking-widest text-gold uppercase",
									children: "Chất âm"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
									children: TONE_IDS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-pressed": tone === id,
										className: `min-h-11 px-3 ${tone === id ? "bg-gold text-bg" : "border border-gold text-fg"}`,
										onClick: () => paint(id, extras, room),
										children: id
									}, id))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-1 font-display text-xs tracking-widest text-gold uppercase",
									children: "Nhạc cụ thêm"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
									children: EXTRA_CHOICES.map((item) => {
										const on = extras.includes(item.id);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-pressed": on,
											className: `min-h-11 px-3 ${on ? "bg-gold text-bg" : "border border-gold text-fg"}`,
											onClick: () => paint(tone, on ? extras.filter((id) => id !== item.id) : [...extras, item.id], room),
											children: item.label
										}, item.id);
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-1 font-display text-xs tracking-widest text-gold uppercase",
									children: "Chế độ"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
									children: ROOM_CHOICES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-pressed": room === item.id,
										className: `min-h-11 px-3 ${room === item.id ? "bg-gold text-bg" : "border border-gold text-fg"}`,
										onClick: () => paint(tone, extras, item.id),
										children: item.label
									}, item.id))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mb-3 block text-sm text-fg",
								children: ["Ghi chú hướng remix", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: note,
									maxLength: 140,
									onChange: (e) => setNote(e.target.value),
									onBlur: () => {
										if (!edited) setPrompt(composePrompt(currentFacts()));
									},
									placeholder: "Ví dụ: đêm sông, lời ít, drop dài",
									className: "mt-1 w-full border border-gold bg-bg px-3 py-2 text-base text-fg outline-none"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-3 text-sm text-pretty text-gold",
								children: quantum.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "https://suno.com/@vuvietnhac",
								target: "_blank",
								rel: "noopener noreferrer",
								className: "mb-3 flex min-h-11 w-full items-center justify-center bg-gold font-display tracking-wide text-bg uppercase",
								onClick: () => setStatus("Đã mở Suno. Chép Style rồi dán vào Custom Mode."),
								children: "Tạo nhạc"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-3 grid grid-cols-2 gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "min-h-11 bg-gold font-display tracking-wide text-bg uppercase",
										onClick: writeLocal,
										children: "Viết Suno"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "min-h-11 border border-gold font-display tracking-wide text-gold uppercase disabled:opacity-50",
										disabled: busy,
										onClick: () => void onAi(),
										children: busy ? "Đang viết…" : "Siêu AI"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "min-h-11 border border-gold text-fg",
										onClick: () => void copyPrompt(),
										children: "Chép"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "min-h-11 border border-gold text-fg",
										onClick: saveHistory,
										children: "Nhớ"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-1 flex items-baseline justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-xs tracking-widest text-gold uppercase",
									children: "Style Suno"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: `font-display tabular-nums ${count === 995 ? "text-gold" : "text-gold-2"}`,
									children: [
										count,
										"/",
										995
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: prompt,
								spellCheck: false,
								onChange: (e) => {
									setEdited(true);
									setPrompt(e.target.value);
								},
								className: "mb-2 min-h-40 w-full border border-gold bg-bg p-3 text-base leading-relaxed text-fg outline-none"
							}),
							count === 995 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mb-3 min-h-11 w-full border border-gold text-gold",
								onClick: () => {
									setPrompt(asSunoPrompt(prompt, currentFacts()));
									setEdited(true);
									setStatus("Đã khít đúng 995 ký tự.");
								},
								children: "Khít 995"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-pretty text-muted",
								"aria-live": "polite",
								children: status
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-pretty text-muted",
								children: "Chép nguyên khối Style và Exclude, dán vào Suno Custom Mode. Siêu AI chỉ nhận số đo, không nhận file. Nghe nâng cấp là phối lại trên máy, không phải file master mới."
							}),
							history.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex gap-2 overflow-x-auto",
								children: history.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "shrink-0 border border-gold px-3 py-2 text-sm text-fg",
									onClick: () => {
										setPrompt(h.prompt);
										setEdited(true);
									},
									children: h.title
								}, h.id))
							}) : null,
							idle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "mt-3 w-full border border-gold bg-bg p-3 text-left",
								onClick: () => setIdle(false),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-xs tracking-widest text-gold uppercase",
										children: "Bảng mép · chạm để đóng"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-pretty text-fg",
										children: "Nghe nâng cấp không đè đài. Tắt đài trước khi đo bản của bạn. Prompt không phải chẩn đoán, không phải bản thu thay thế."
									}),
									wxAsk ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-2 block text-sm text-muted",
										children: wx ?? "Xin vị trí chỉ để xem nhiệt độ chỗ bạn. Không lưu, không theo dõi."
									}) : null
								]
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "transport",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "flex-1 bg-gold text-bg",
								onClick: () => {
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
								},
								children: live?.playing ? "Dừng" : "Phát"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: `flex-1 ${mode === "dry" ? "bg-gold text-bg" : "text-gold"}`,
								onClick: () => setHeardMode("dry"),
								children: "Gốc"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: `flex-1 ${mode === "wet" ? "bg-gold text-bg" : "text-gold"}`,
								onClick: () => setHeardMode("wet"),
								children: "Nâng"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-3 pb-2 font-display text-xs tracking-widest text-muted uppercase",
						children: "NGAME · nghe · bo tròn · không đè prompt"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "zone-cu frame-gold",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "marquee",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [TICKER, TICKER] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid min-h-0 flex-1 grid-cols-2 content-center gap-x-3 gap-y-1 overflow-auto px-3 py-1 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-fg",
								children: civil ? civil.lunar : "Âm lịch …"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-right text-fg",
								children: civil ? civil.solar : "Dương lịch …"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-gold",
								children: event ? event.days === 0 ? `Hôm nay: ${event.name}` : `${event.days} ngày tới ${event.name}` : "Đếm ngược …"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-right text-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "uppercase",
									onClick: () => void loadFx(),
									children: ["USD ", fx]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-left text-gold uppercase",
								onClick: () => void toggleRadio(),
								children: radioOn ? "Tắt đài" : "Đài Việt"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-right text-gold uppercase",
								onClick: () => wxAsk ? void askWeather() : setWxAsk(true),
								children: wxAsk ? "Lấy thời tiết" : "Thời tiết"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between px-3 pb-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-xs text-muted",
							children: [
								radioOn ? "Đài trực tiếp" : live?.playing ? "Nguồn đang phát" : "Sẵn sàng",
								" · ",
								live?.error ?? "mức theo tiếng thật"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "shrink-0 pl-3 text-xs text-gold uppercase",
							onClick: () => setGate("pay"),
							children: "Bonus"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
						ref: radioRef,
						preload: "none",
						className: "media-host"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: sticker ? "pwamc" : "pwamc pwamc-dock",
				style: sticker ? {
					left: sticker.x,
					top: sticker.y,
					right: "auto",
					bottom: "auto"
				} : void 0,
				onPointerDown: onStickerDown,
				onPointerMove: onStickerMove,
				onPointerUp: onStickerUp,
				"aria-label": "Sticker đọc prompt",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm",
					children: "SÁO"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs",
					children: "ĐỌC"
				})]
			}),
			gate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "gate",
				role: "dialog",
				"aria-modal": "true",
				"aria-labelledby": "close-title",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "gate-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							id: "close-title",
							className: "font-display text-lg tracking-wide text-fg uppercase",
							children: "Đóng xưởng"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-pretty text-muted",
							children: "Chọn một. Bonus không đóng máy."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 bg-gold font-display tracking-wide text-bg uppercase",
							onClick: () => {
								engineRef.current?.pause();
								radioRef.current?.pause();
								window.speechSynthesis?.cancel();
								setRadioOn(false);
								setGate(null);
								setClosed(true);
							},
							children: "Đóng luôn"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 border border-gold font-display tracking-wide text-gold uppercase",
							onClick: () => setGate("pay"),
							children: "Bonus PayPal"
						}),
						gate === "pay" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [payReady ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Đang mở PayPal…"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { id: "paypal-container-T7AZ748Y27248" })] }) : null
					]
				})
			}) : null,
			closed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "gate",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "gate-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg tracking-wide text-fg uppercase",
							children: "Đã đóng"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Prompt và bản nhạc vẫn nằm trên máy này."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 bg-gold font-display tracking-wide text-bg uppercase",
							onClick: () => setClosed(false),
							children: "Mở lại"
						})
					]
				})
			}) : null
		]
	});
}
function Stat({ k, v, hot }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-gold bg-bg px-2 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-xs tracking-wider text-muted uppercase",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `font-display text-xl tabular-nums ${hot ? "text-gold" : "text-fg"}`,
			children: v
		})]
	});
}
function blankSnap() {
	return {
		kind: "none",
		fileLabel: "",
		durationSec: 0,
		bpm: 0,
		confidence: 0,
		bands: {
			sub: 0,
			bass: 0,
			lowMid: 0,
			mid: 0,
			presence: 0,
			air: 0
		},
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
		pitchHz: 0
	};
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Studio, {});
}
//#endregion
export { Home as component };
