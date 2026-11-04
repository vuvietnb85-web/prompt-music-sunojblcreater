import { n as __exportAll } from "../_runtime.mjs";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { URL as URL$1 } from "node:url";
import { Script, createContext } from "node:vm";
//#region node_modules/ytdlp-typescript/dist/networking/cookies.js
function parseExpiresDate(s) {
	const ts = Date.parse(s);
	if (!Number.isNaN(ts)) return Math.floor(ts / 1e3);
	const num = parseInt(s, 10);
	return Number.isNaN(num) ? null : num > 0xe8d4a51000 ? Math.floor(num / 1e3) : num;
}
var CookieJar = class CookieJar {
	cookies = /* @__PURE__ */ new Map();
	key(name, domain, path) {
		return `${name}\n${domain}\n${path}`;
	}
	setCookieFromSetCookieHeader(header, url) {
		const headers = Array.isArray(header) ? header : [header];
		for (const h of headers) this.setCookie(h, url);
	}
	setCookie(setCookieValue, url) {
		const parts = setCookieValue.split(";");
		const first = parts.shift().trim();
		if (!first) return;
		const eq = first.indexOf("=");
		let name;
		let value;
		if (eq === -1) {
			name = "";
			value = first;
		} else {
			name = first.slice(0, eq).trim();
			value = first.slice(eq + 1).trim();
		}
		if (!name) return;
		let domain = url.hostname.toLowerCase();
		let hostOnly = true;
		let path = null;
		let expires = null;
		let secure = false;
		let httpOnly = false;
		for (const attr of parts) {
			const idx = attr.indexOf("=");
			const attrName = (idx === -1 ? attr : attr.slice(0, idx)).trim().toLowerCase();
			const attrVal = idx === -1 ? "" : attr.slice(idx + 1).trim();
			switch (attrName) {
				case "domain": {
					const raw = attrVal.toLowerCase().replace(/^\./, "");
					const host = url.hostname.toLowerCase();
					if (raw && (raw === host || host.endsWith(`.${raw}`))) {
						domain = raw;
						hostOnly = false;
					}
					break;
				}
				case "path":
					path = attrVal || "/";
					break;
				case "expires":
					expires = parseExpiresDate(attrVal);
					break;
				case "max-age":
					expires = Math.floor(Date.now() / 1e3) + parseInt(attrVal, 10);
					break;
				case "secure":
					secure = true;
					break;
				case "httponly": httpOnly = true;
			}
		}
		if (expires != null && expires <= Date.now() / 1e3) {
			this.removeCookie(name, domain, path ?? "/");
			return;
		}
		this.cookies.set(this.key(name, domain, path ?? defaultPath(url.pathname)), {
			name,
			value,
			domain,
			path: path ?? defaultPath(url.pathname),
			expires,
			secure,
			httpOnly,
			hostOnly
		});
	}
	removeCookie(name, domain, path = "/") {
		this.cookies.delete(this.key(name, domain, path));
	}
	getCookies(urlStr) {
		let url;
		try {
			url = new URL(urlStr);
		} catch {
			return [];
		}
		const host = url.hostname.toLowerCase();
		const secureOk = url.protocol === "https:" || url.protocol === "wss:";
		const now = Date.now() / 1e3;
		const out = [];
		for (const c of this.cookies.values()) {
			if (c.expires != null && c.expires <= now) continue;
			if (c.secure && !secureOk) continue;
			if (c.hostOnly ? c.domain !== host : !domainMatch(host, c.domain)) continue;
			if (!pathMatch(url.pathname, c.path)) continue;
			out.push(c);
		}
		out.sort((a, b) => a.path.length - b.path.length || (a.name < b.name ? -1 : 1));
		return out;
	}
	getCookieHeader(urlStr) {
		const pairs = this.getCookies(urlStr).map((c) => `${c.name}=${c.value}`);
		return pairs.length ? pairs.join("; ") : void 0;
	}
	setRawCookie(name, value, opts = {}) {
		const domain = (opts.domain ?? "").toLowerCase().replace(/^\./, "") || "localhost";
		this.cookies.set(this.key(name, domain, opts.path ?? "/"), {
			name,
			value,
			domain,
			path: opts.path ?? "/",
			expires: opts.expires ?? null,
			secure: opts.secure ?? false,
			httpOnly: false,
			hostOnly: !opts.domain
		});
	}
	getNamedCookie(name, urlStr) {
		return this.getCookies(urlStr ?? "https://").find((c) => c.name === name);
	}
	toNetscape() {
		const lines = ["# Netscape HTTP Cookie File"];
		for (const c of this.cookies.values()) {
			const includeSub = c.hostOnly ? "FALSE" : "TRUE";
			const exp = c.expires == null ? "9999999999" : String(c.expires);
			lines.push([
				c.domain,
				includeSub,
				c.path,
				c.secure ? "TRUE" : "FALSE",
				exp,
				c.name,
				c.value
			].join("	"));
		}
		return lines.join("\n") + "\n";
	}
	static fromNetscape(text) {
		const jar = new CookieJar();
		for (let line of text.split(/\r?\n/)) {
			line = line.trimEnd();
			if (!line) continue;
			let httpOnly = false;
			if (line.startsWith("#HttpOnly_")) {
				httpOnly = true;
				line = line.slice(10);
			}
			if (line.startsWith("#")) continue;
			const parts = line.split("	");
			if (parts.length < 7) continue;
			const [domain, includeSub, path, secure, expires, name, ...rest] = parts;
			jar.cookies.set(jar.key(name, domain, path), {
				name,
				value: rest.join("	"),
				domain: domain.replace(/^\./, ""),
				path,
				expires: parseInt(expires, 10) || null,
				secure: secure === "TRUE",
				httpOnly,
				hostOnly: includeSub !== "TRUE"
			});
		}
		return jar;
	}
	static async fromFile(path) {
		return CookieJar.fromNetscape(await readFile(path, "utf8"));
	}
};
function defaultPath(pathname) {
	const idx = pathname.lastIndexOf("/");
	return idx <= 0 ? "/" : pathname.slice(0, idx);
}
function domainMatch(host, cookieDomain) {
	if (host === cookieDomain) return true;
	return host.endsWith(`.${cookieDomain}`);
}
function pathMatch(requestPath, cookiePath) {
	if (!requestPath.startsWith("/")) requestPath = `/${requestPath}`;
	if (requestPath === cookiePath) return true;
	if (requestPath.startsWith(cookiePath)) {
		if (cookiePath.endsWith("/")) return true;
		if (requestPath.charAt(cookiePath.length) === "/") return true;
	}
	return false;
}
//#endregion
//#region node_modules/ytdlp-typescript/dist/core/utils.js
function determineExt(url, defaultExt = "mp4") {
	try {
		const u = new URL$1(url);
		const extParam = u.searchParams.get("extension");
		if (extParam) return extParam.toLowerCase();
		const mime = u.searchParams.get("mime");
		if (mime) return mimetype2ext$1(mime) ?? defaultExt;
		const pathname = u.pathname;
		const m = /\.([a-zA-Z0-9]{1,5})$/.exec(pathname);
		if (m) {
			const e = m[1].toLowerCase();
			if (/^[a-z0-9]+$/.test(e)) return e === "m3u8" ? "m3u8" : e === "mpd" ? "mpd" : e;
		}
	} catch {}
	return defaultExt;
}
var MIME_EXT_MAP = {
	"audio/mp4": "m4a",
	"audio/mpeg": "mp3",
	"audio/webm": "webm",
	"audio/ogg": "ogg",
	"audio/wav": "wav",
	"audio/aac": "aac",
	"audio/flac": "flac",
	"video/mp4": "mp4",
	"video/webm": "webm",
	"video/x-flv": "flv",
	"video/quicktime": "mov",
	"video/mpeg": "mpeg",
	"video/3gpp": "3gp",
	"video/mp2t": "ts",
	"video/x-matroska": "mkv",
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/gif": "gif",
	"image/webp": "webp",
	"text/html": "html",
	"text/plain": "txt",
	"application/json": "json",
	"application/xml": "xml",
	"application/pdf": "pdf",
	"application/x-mpegurl": "m3u8",
	"application/vnd.apple.mpegurl": "m3u8",
	"application/dash+xml": "mpd",
	"application/f4v": "f4v"
};
function mimetype2ext$1(mime) {
	if (!mime) return void 0;
	let m = mime.trim().split(";")[0].trim().toLowerCase();
	if (!m.includes("/")) m = `unknown/${m}`;
	const full = MIME_EXT_MAP[m];
	if (full) return full;
	const [type, subtype] = m.split("/");
	if (type === "audio" || type === "video" || type === "image") {
		const sub = subtype.replace(/^x-/, "").split("+")[0];
		if (sub === "mpegurl") return "m3u8";
		if (sub === "dash") return "mpd";
		return sub === "quicktime" ? "mov" : sub;
	}
	if (subtype === "mpegurl") return "m3u8";
}
function intOrNone(v, scale = 1) {
	if (v == null || v === false || v === "") return null;
	const n = typeof v === "number" ? v : parseInt(String(v).replace(/[,\s]/g, ""), 10);
	return Number.isFinite(n) ? Math.trunc(n * scale) : null;
}
function floatOrNone(v, scale = 1) {
	if (v == null || v === false || v === "") return null;
	const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[,\s]/g, ""));
	return Number.isFinite(n) ? n * scale : null;
}
function strOrNone(v) {
	if (v == null || v === false) return null;
	if (typeof v === "string") return v === "" ? null : v;
	return String(v);
}
function urlOrNone(v) {
	const s = strOrNone(v);
	if (!s) return null;
	return /^https?:\/\//i.test(s) || s.startsWith("//") ? s : null;
}
function getSeg(v, seg) {
	if (v == null) return null;
	if (Array.isArray(v)) {
		if (/^\d+$/.test(seg)) {
			const r = v[parseInt(seg, 10)];
			return r != null ? r : null;
		}
		const out = [];
		for (const item of v) {
			if (typeof item !== "object" || item === null) continue;
			const r = item[seg];
			if (r != null) out.push(r);
		}
		return out.length ? out : null;
	}
	if (typeof v === "object") {
		const r = v[seg];
		return r != null ? r : null;
	}
	return null;
}
function traverseSingle(src, path) {
	let cur = src;
	for (const segRaw of path.split(".")) {
		if (cur == null) return null;
		if (segRaw === "") continue;
		const seg = segRaw.endsWith("[]") ? segRaw.slice(0, -2) : segRaw;
		if (seg === "") continue;
		cur = getSeg(cur, seg);
	}
	return cur;
}
function traverseObj(src, paths, defaultValue) {
	const list = (Array.isArray(paths) ? paths : [paths]).filter((p) => p != null && p !== "");
	for (const path of list) {
		const result = traverseSingle(src, path);
		if (result != null) return result;
	}
	return defaultValue;
}
function urljoin(base, path) {
	if (!path) return null;
	path = path.trim();
	if (!base) return /^https?:\/\//i.test(path) ? path : path.startsWith("//") ? `https:${path}` : null;
	if (/^https?:\/\//i.test(path)) return path;
	try {
		if (path.startsWith("//")) return new URL$1(`${new URL$1(base).protocol}${path}`).toString();
		return new URL$1(path, base).toString();
	} catch {
		return null;
	}
}
function updateUrlQuery(url, params) {
	const u = new URL$1(url);
	for (const [k, v] of Object.entries(params)) if (v == null) u.searchParams.delete(k);
	else u.searchParams.set(k, String(v));
	return u.toString();
}
var DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36";
//#endregion
//#region node_modules/ytdlp-typescript/dist/networking/http.js
var HttpError = class extends Error {
	status;
	response;
	constructor(message, status, response) {
		super(message);
		this.status = status;
		this.response = response;
		this.name = "HttpError";
	}
};
var NetworkError = class extends Error {};
function lowerHeaders(headers = {}) {
	const out = {};
	for (const [k, v] of Object.entries(headers)) out[k.toLowerCase()] = v;
	return out;
}
var HttpClient = class HttpClient {
	cookieJar;
	defaultHeaders;
	timeout;
	retries;
	constructor(opts = {}) {
		this.cookieJar = opts.cookieJar ?? new CookieJar();
		this.defaultHeaders = lowerHeaders(opts.headers);
		this.timeout = opts.timeout ?? 2e4;
		this.retries = opts.retries ?? 3;
	}
	static fromDownloadOptions(opts) {
		return new HttpClient({
			cookieJar: opts.cookieJar,
			headers: {
				"user-agent": opts.userAgent ?? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
				...lowerHeaders(opts.httpHeaders ?? {})
			},
			timeout: opts.socketTimeout != null ? opts.socketTimeout * 1e3 : void 0
		});
	}
	async request(url, reqOpts = {}, redirectCount = 0) {
		const headers = {
			...this.defaultHeaders,
			...lowerHeaders(reqOpts.headers ?? {})
		};
		const cookieHeader = this.cookieJar.getCookieHeader(url);
		if (cookieHeader) headers["cookie"] = headers["cookie"] ? `${headers["cookie"]}; ${cookieHeader}` : cookieHeader;
		if (!headers["user-agent"]) headers["user-agent"] = DEFAULT_UA;
		const timeoutMs = reqOpts.timeout ?? this.timeout;
		const maxRetries = reqOpts.retries ?? this.retries;
		let lastError;
		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), timeoutMs);
			try {
				const res = await globalThis.fetch(url, {
					method: reqOpts.method ?? "GET",
					headers,
					body: reqOpts.body,
					signal: controller.signal,
					redirect: "manual"
				});
				clearTimeout(timer);
				if (res.status >= 300 && res.status < 400) {
					const loc = res.headers.get("location");
					res.body?.cancel().catch(() => {});
					if (!loc || redirectCount > 10) throw new HttpError(`HTTP Error ${res.status}: ${url}`, res.status);
					const nextUrl = new URL(loc, url).toString();
					return this.request(nextUrl, { ...reqOpts }, redirectCount + 1);
				}
				const response = {
					status: res.status,
					headers: res.headers,
					url,
					text: () => res.text(),
					json: () => res.text().then((t) => JSON.parse(t)),
					bytes: async () => new Uint8Array(await res.arrayBuffer()),
					body: res.body
				};
				const setCookies = collectSetCookies(res.headers);
				if (setCookies.length) this.cookieJar.setCookieFromSetCookieHeader(setCookies, new URL(res.url));
				const expected = reqOpts.expectedStatus;
				if (!(expected ? Array.isArray(expected) ? expected : [expected] : [200]).includes(res.status)) {
					const err = new HttpError(`HTTP Error ${res.status}: ${reqOpts.note ?? url}`, res.status, response);
					if (res.status >= 500 && attempt < maxRetries) {
						lastError = err;
						await backoff(attempt, res.headers.get("retry-after"));
						continue;
					}
					throw err;
				}
				return response;
			} catch (err) {
				clearTimeout(timer);
				if (err instanceof HttpError && !(err.status >= 500)) throw err;
				lastError = err;
				if (attempt < maxRetries) await backoff(attempt);
				else break;
			}
		}
		throw lastError instanceof Error ? lastError : new NetworkError(String(lastError));
	}
	async downloadText(url, opts = {}) {
		return (await this.request(url, opts)).text();
	}
	async downloadJson(url, opts = {}) {
		const textData = await (await this.request(url, opts)).text();
		try {
			return JSON.parse(textData);
		} catch {
			throw new Error(`Failed to parse JSON from ${reqNote(opts, url)}`);
		}
	}
	async postJson(url, data, opts = {}) {
		const headers = {
			"content-type": "application/json",
			...opts.headers ?? {}
		};
		return this.downloadJson(url, {
			...opts,
			method: "POST",
			body: typeof data === "string" ? data : JSON.stringify(data),
			headers
		});
	}
};
function reqNote(opts, url) {
	return opts.note ?? url;
}
async function backoff(attempt, retryAfterHeader = null) {
	let delaySec;
	const ra = retryAfterHeader ? parseInt(retryAfterHeader, 10) : NaN;
	if (!Number.isNaN(ra)) delaySec = ra;
	else delaySec = Math.min(2 ** attempt, 30);
	await new Promise((r) => setTimeout(r, delaySec * 1e3));
}
function collectSetCookies(headers) {
	const anyHeaders = headers;
	if (typeof anyHeaders.getSetCookie === "function") return anyHeaders.getSetCookie();
	const single = headers.get("set-cookie");
	if (!single) return [];
	return splitSetCookie(single);
}
function splitSetCookie(header) {
	const out = [];
	let start = 0;
	for (let i = 0; i < header.length; i++) {
		if (header[i] !== ",") continue;
		const rest = header.slice(i + 1);
		const semi = rest.indexOf(";");
		const eq = rest.indexOf("=");
		if (!(eq !== -1 && (semi === -1 || eq < semi))) continue;
		out.push(header.slice(start, i).trim());
		start = i + 1;
	}
	out.push(header.slice(start).trim());
	return out.filter(Boolean);
}
//#endregion
//#region node_modules/ytdlp-typescript/dist/types/options.js
var YtDlpTsError = class extends Error {
	videoId;
	constructor(message, videoId) {
		super(message);
		this.videoId = videoId;
		this.name = "YtDlpTsError";
	}
};
var ExtractorError = class extends YtDlpTsError {
	expected;
	constructor(message, videoId, expected = false) {
		super(message, videoId);
		this.expected = expected;
		this.name = "ExtractorError";
	}
};
//#endregion
//#region node_modules/ytdlp-typescript/dist/extractor/hls.js
function isMasterPlaylist(manifest) {
	return manifest.includes("#EXT-X-STREAM-INF");
}
function parseM3u8Master(manifest, m3u8Url, headers) {
	const formats = [];
	const lines = manifest.split(/\r?\n/);
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line.startsWith("#EXT-X-STREAM-INF:")) continue;
		const attrs = parseM3u8Attributes(line.slice(18));
		let uri = "";
		for (let j = i + 1; j < lines.length; j++) {
			const l = lines[j].trim();
			if (!l || l.startsWith("#")) continue;
			uri = l;
			break;
		}
		const resolved = urljoin(m3u8Url, uri);
		if (!resolved) continue;
		const codecs = attrs["CODECS"];
		const codecList = codecs ? codecs.split(",").map((c) => c.trim()) : [];
		const vcodec = codecList.find((c) => /^(avc|hev|hvc|vp0?9|av01|hvc1|mp4v|vp8)/i.test(c)) ?? null;
		const acodec = codecList.find((c) => /^(mp4a|opus|ac-3|ec-3|flac|alac|vorbis)/i.test(c)) ?? null;
		const resMatch = /(\d+)[xX](\d+)/.exec(attrs["RESOLUTION"] ?? "");
		const bandwidth = intOrNone(attrs["BANDWIDTH"]);
		const audioOnly = !vcodec && !!acodec;
		formats.push({
			format_id: `${bandwidth ?? 0}-${formats.length}`,
			url: resolved,
			manifest_url: m3u8Url,
			ext: audioOnly ? "m4a" : attrs["EXT-X-INDEPENDENT-SEGMENTS"] === void 0 ? "mp4" : "mp4",
			width: resMatch ? parseInt(resMatch[1], 10) : null,
			height: resMatch ? parseInt(resMatch[2], 10) : null,
			fps: floatOrNone(attrs["FRAME-RATE"]),
			vcodec: vcodec ?? (audioOnly ? "none" : null),
			acodec: acodec ?? (audioOnly ? null : "none"),
			tbr: bandwidth ? Math.round(bandwidth / 1e3) : null,
			protocol: "m3u8_native",
			http_headers: headers,
			format_note: "hls",
			__pending_fragments: true
		});
	}
	return formats;
}
function parseMediaPlaylist(manifest, m3u8Url, baseFormat = {}) {
	const lines = manifest.split(/\r?\n/);
	const fragments = [];
	let totalDur = 0;
	let pendingDur = null;
	let pendingRange = null;
	let key = null;
	let byterangeNextStart = 0;
	let unsupportedKey = false;
	for (const rawLine of lines) {
		const line = rawLine.trim();
		if (!line || line.startsWith("#EXTINF")) {
			if (line.startsWith("#EXTINF")) pendingDur = parseFloat(line.slice(8).split(",")[0]);
			continue;
		}
		if (line.startsWith("#EXT-X-BYTERANGE:")) {
			const m = /^#EXT-X-BYTERANGE:(\d+)(?:@(\d+))?/.exec(line);
			if (m) {
				const len = parseInt(m[1], 10);
				const start = m[2] != null ? parseInt(m[2], 10) : byterangeNextStart;
				byterangeNextStart = start + len;
				pendingRange = `bytes=${start}-${start + len - 1}`;
			}
			continue;
		}
		if (line.startsWith("#EXT-X-KEY:")) {
			const attrs = parseM3u8Attributes(line.slice(11));
			const method = attrs["METHOD"] ?? "NONE";
			if (method === "NONE") key = null;
			else if (method === "AES-128") key = {
				method,
				uri: urljoin(m3u8Url, stripQuotes(attrs["URI"])) ?? "",
				iv: attrs["IV"]
			};
			else unsupportedKey = true;
			continue;
		}
		if (line.startsWith("#EXT-X-MAP:")) {
			const mapUri = urljoin(m3u8Url, stripQuotes(parseM3u8Attributes(line.slice(11))["URI"]));
			if (mapUri) fragments.push({
				url: mapUri,
				duration: 0
			});
			continue;
		}
		if (line.startsWith("#")) continue;
		const fragUrl = urljoin(m3u8Url, line);
		if (!fragUrl) continue;
		fragments.push({
			url: fragUrl,
			duration: pendingDur,
			byterange: pendingRange
		});
		totalDur += pendingDur ?? 0;
		pendingDur = null;
		pendingRange = null;
	}
	const format = {
		...baseFormat,
		format_id: baseFormat.format_id ?? "hls_media",
		url: m3u8Url,
		manifest_url: m3u8Url,
		protocol: "m3u8_native",
		fragments,
		duration: totalDur > 0 ? totalDur : baseFormat.duration,
		__pending_fragments: false
	};
	if (key && !unsupportedKey) format.hls_aes = {
		uri: key.uri,
		iv: key.iv
	};
	return {
		format,
		key,
		mediaSequenceOffset: 0
	};
}
//#endregion
//#region node_modules/ytdlp-typescript/dist/extractor/dash-mpd.js
function parseMpd(mpd, mpdUrl) {
	const formats = [];
	const mpdDuration = parseMpdTotalDuration(mpd);
	const periodRe = /<Period\b([^>]*)(?:\/>|>([\s\S]*?)<\/Period>)/g;
	let pm;
	let hasPeriods = false;
	while (pm = periodRe.exec(mpd)) {
		hasPeriods = true;
		collectPeriod(pm[1] ?? "", pm[2] ?? "", mpd, mpdUrl, mpdDuration, formats);
	}
	if (!hasPeriods) collectPeriod("", mpd, mpd, mpdUrl, mpdDuration, formats);
	return dedupeFormats(formats);
}
function collectPeriod(periodAttrsRaw, body, mpd, mpdUrl, mpdDuration, formats) {
	const asRe = /<AdaptationSet\b([^>]*?)(?:\/>|>([\s\S]*?)<\/AdaptationSet>)/g;
	let am;
	let hasSets = false;
	while (am = asRe.exec(body)) {
		hasSets = true;
		collectAdaptationSet(am[1] ?? "", am[2] ?? "", mpd, mpdUrl, mpdDuration, formats);
	}
	if (!hasSets) collectAdaptationSet("", body, mpd, mpdUrl, mpdDuration, formats);
}
function collectAdaptationSet(asAttrsRaw, body, mpd, mpdUrl, mpdDuration, formats) {
	const asAttrs = parseXmlAttrs(asAttrsRaw);
	const asSegTemplate = matchSegmentTemplate(body);
	const asSegList = matchSegmentList(body);
	const asBaseURL = matchBaseUrl(body);
	const repRe = /<Representation\b([^>]*?)(?:\/>|>([\s\S]*?)<\/Representation>)/g;
	let rm;
	while (rm = repRe.exec(body)) {
		const attrs = parseXmlAttrs(rm[1] ?? "");
		const inner = rm[2] ?? "";
		const segTemplate = matchSegmentTemplate(inner) ?? asSegTemplate;
		const segList = matchSegmentList(inner) ?? asSegList;
		const baseURL = matchBaseUrl(inner) ?? asBaseURL;
		const codecList = (attrs.codecs ?? asAttrs.codecs ?? "").split(",").map((c) => c.trim()).filter(Boolean);
		let vcodec = null;
		let acodec = null;
		for (const c of codecList) if (/^(avc|hev|hvc|vp8|vp9|av01|mp4v)/i.test(c)) vcodec = vcodec ?? c;
		else if (/^(mp4a|opus|ac-3|ec-3|flac|alac|vorbis|dts)/i.test(c)) acodec = acodec ?? c;
		const mime = (attrs.mimeType ?? asAttrs.mimeType ?? "").toLowerCase();
		const isAudio = mime.startsWith("audio/") || !vcodec && !!acodec && !mime.startsWith("video/");
		const isWebm = mime.includes("webm") || codecList.some((c) => /^(vp9|opus)/i.test(c));
		const repId = attrs.id ?? String(formats.length);
		const bandwidth = intOrNone(attrs.bandwidth);
		const timescale = intOrNone(segTemplate?.timescale) ?? intOrNone(asAttrs.timescale) ?? 1;
		const initTemplate = segTemplate?.initialization ?? (segList?.initUrl ? segList.initUrl : null);
		const mediaTemplate = segTemplate?.media ?? (segList ? null : null);
		let fragments;
		let singleUrl;
		let approxDur = null;
		if (segTemplate?.timeline && segTemplate.media) {
			const tl = segTemplate.timeline;
			fragments = [];
			if (initTemplate) fragments.push({
				url: urljoin(mpdUrl, substitute(initTemplate, repId, bandwidth)),
				duration: 0
			});
			let n = segTemplate.startNumber ?? 1;
			for (const entry of tl) for (let k = 0; k <= entry.r; k++) {
				fragments.push({
					url: urljoin(mpdUrl, substitute(segTemplate.media, repId, bandwidth, n, entry.t + k * entry.d)) ?? void 0,
					duration: entry.d / timescale
				});
				n++;
			}
			approxDur = tl.reduce((acc, e) => acc + e.d * (e.r + 1), 0) / timescale;
		} else if (segTemplate?.duration && mediaTemplate) {
			const segDurSec = segTemplate.duration / timescale;
			approxDur = mpdDuration ?? estimateFromBandwidth(bandwidth);
			const count = Math.max(1, Math.ceil(approxDur / segDurSec));
			fragments = [];
			if (initTemplate) fragments.push({
				url: urljoin(mpdUrl, substitute(initTemplate, repId, bandwidth)),
				duration: 0
			});
			const startNum = segTemplate.startNumber ?? 1;
			for (let i = 0; i < count; i++) {
				fragments.push({
					url: urljoin(mpdUrl, substitute(mediaTemplate, repId, bandwidth, startNum + i)),
					duration: segDurSec
				});
				approxDur = count * segDurSec;
			}
		} else if (segList && segList.segmentUrls.length) {
			fragments = [];
			if (initTemplate) fragments.push({
				url: urljoin(mpdUrl, substitute(initTemplate, repId, bandwidth)),
				duration: 0
			});
			for (const su of segList.segmentUrls) fragments.push({
				url: urljoin(mpdUrl, su),
				duration: null
			});
		} else if (baseURL || /\.(mp4|m4s|webm|mpd)(\?|$)/i.test(repId)) {
			singleUrl = decodeXmlEntities(urljoin(mpdUrl, baseURL ?? repId) ?? "");
			fragments = [{
				url: singleUrl,
				duration: null
			}];
		}
		if (!fragments?.length) continue;
		const isSingleDirect = !segTemplate && !segList && fragments.length === 1;
		const fmt = {
			format_id: repId,
			url: isSingleDirect ? singleUrl ?? mpdUrl : mpdUrl,
			manifest_url: mpdUrl,
			ext: isAudio ? isWebm ? "webm" : "m4a" : isWebm ? "webm" : "mp4",
			width: intOrNone(attrs.width),
			height: intOrNone(attrs.height),
			fps: attrs.frameRate ? parseFloat(attrs.frameRate.replace(/FPS$/i, "")) || void 0 : void 0,
			tbr: bandwidth != null ? Math.round(bandwidth / 1e3) : void 0,
			asr: attrs.audioSamplingRate ? intOrNone(attrs.audioSamplingRate) : void 0,
			vcodec: isAudio ? "none" : vcodec ?? "unknown",
			acodec: isAudio ? acodec ?? "unknown" : acodec ?? "none",
			protocol: isSingleDirect ? mpdUrl.startsWith("https") ? "https" : "http" : "http_dash_segments",
			fragment_base_url: mpdUrl,
			format_note: "dash",
			language: attrs.lang ?? asAttrs.lang ?? void 0
		};
		if (!isSingleDirect) {
			fmt.fragments = fragments;
			fmt.__pending_fragments = false;
		}
		if (approxDur && approxDur > 0) fmt.duration = Math.round(approxDur * 100) / 100;
		formats.push(fmt);
	}
}
function matchSegmentTemplate(body) {
	const m = /<SegmentTemplate\b([^>]*?)(?:\/>|>([\s\S]*?)<\/SegmentTemplate>)/.exec(body);
	if (!m) return null;
	const attrs = parseXmlAttrs(m[1] ?? "");
	const inner = m[2] ?? "";
	const tpl = {
		timescale: attrs.timescale ? parseInt(attrs.timescale, 10) : void 0,
		duration: attrs.duration ? parseInt(attrs.duration, 10) : void 0,
		startNumber: attrs.startNumber ? parseInt(attrs.startNumber, 10) : void 0,
		media: attrs.media,
		initialization: attrs.initialization
	};
	const tlBlock = /<SegmentTimeline>([\s\S]*?)<\/SegmentTimeline>/.exec(inner);
	if (tlBlock) {
		const timeline = [];
		let t = 0;
		for (const sm of tlBlock[1].matchAll(/<S\s+([^>]*?)\/?>/g)) {
			const sa = parseXmlAttrs(sm[1] ?? "");
			const st = sa.t != null ? parseInt(sa.t, 10) : t;
			const d = parseInt(sa.d ?? "0", 10);
			const r = sa.r != null ? parseInt(sa.r, 10) : 0;
			timeline.push({
				t: st,
				d,
				r
			});
			t = st + d * (r + 1);
		}
		tpl.timeline = timeline;
	}
	return tpl;
}
function matchSegmentList(body) {
	const m = /<SegmentList\b[^>]*>([\s\S]*?)<\/SegmentList>/.exec(body);
	if (!m) return null;
	const inner = m[1];
	const initMatch = /<Initialization[^>]*sourceURL="([^"]*)"/.exec(inner);
	const segmentUrls = [...inner.matchAll(/<SegmentURL[^>]*media="([^"]*)"[^>]*\/?>/g)].map((x) => decodeXmlEntities(x[1]));
	return {
		initUrl: initMatch?.[1],
		segmentUrls
	};
}
function matchBaseUrl(body) {
	const raw = /(?:^|>)<BaseURL[^>]*>([^<]+)<\/BaseURL>/.exec(body)?.[1] ?? /<BaseURL[^>]*>([^<]+)<\/BaseURL>/.exec(body)?.[1];
	return raw?.trim() ? decodeXmlEntities(raw.trim()) : void 0;
}
function decodeXmlEntities(s) {
	return s.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10))).replace(/&quot;/g, "\"").replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}
function substitute(template, repId, bandwidth, number, time) {
	return decodeXmlEntities(template.replace(/\$RepresentationID\$/g, repId).replace(/\$Bandwidth\$/g, String(bandwidth ?? 0)).replace(/\$Number(%0\d+d)?\$/g, (_, fmt) => number == null ? "" : fmt ? padNum(number, fmt) : String(number)).replace(/\$Time(%0\d+d)?\$/g, (_, fmt) => time == null ? "" : fmt ? padNum(time, fmt) : String(time)).replace(/\$\$/g, "$"));
}
function padNum(n, fmt) {
	const width = parseInt(fmt.replace(/%0(\d+)d/, "$1"), 10) || 1;
	return String(n).padStart(width, "0");
}
function parseMpdTotalDuration(mpd) {
	const m = /mediaPresentationDuration\s*=\s*"([^"]*)"/.exec(mpd);
	if (!m) return null;
	return parseIsoDuration(m[1]);
}
function parseIsoDuration(s) {
	const m = /^-?P(?:(\d+(?:\.\d+)?)Y)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/.exec(s);
	if (!m) return null;
	const [, y, mo, d, h, mi, sec] = m.map((v) => v ? parseFloat(v) : 0);
	return ((y * 365 + mo * 30 + d) * 24 + h) * 3600 + mi * 60 + sec;
}
function estimateFromBandwidth(bandwidth) {
	return bandwidth ? 600 : 300;
}
//#endregion
//#region node_modules/ytdlp-typescript/dist/extractor/base.js
var InfoExtractor = class {
	IE_NAME;
	client;
	ctx;
	constructor() {
		this.IE_NAME = new.target.name.replace(/IE$/, "");
	}
	attach(ctx) {
		this.ctx = ctx;
		this.client = ctx.client;
	}
	get validUrlPatterns() {
		return [];
	}
	suitable(url) {
		for (const p of this.validUrlPatterns) {
			const m = (typeof p === "string" ? new RegExp(p) : new RegExp(p.source, p.flags)).exec(url);
			if (m) return m;
		}
		return null;
	}
	matchId(url) {
		const m = this.suitable(url);
		return m?.groups?.["id"] ?? m?.[1] ?? null;
	}
	async extract(url) {
		const info = await this.realExtract(url);
		info.extractor = info.extractor ?? this.IE_NAME;
		info.extractor_key = info.extractor_key ?? this.IE_NAME;
		info.webpage_url = info.webpage_url ?? url;
		info.webpage_url_basename = info.webpage_url ? basename(info.webpage_url) : void 0;
		if (!info.formats?.length && !info._type) throw new ExtractorError(this.noFormatsMessage(), info.id);
		return info;
	}
	noFormatsMessage() {
		return "No video formats found!";
	}
	async downloadWebpage(url, opts = {}) {
		return this.client.downloadText(url, opts);
	}
	async downloadJson(url, opts = {}) {
		return this.client.downloadJson(url, opts);
	}
	parseJson(jsonStr, name = "JSON", fatal = true) {
		try {
			try {
				return JSON.parse(jsonStr.trim());
			} catch {}
			const s = jsonStr.trim().replace(/,\s*([}\]])/g, "$1");
			return JSON.parse(s);
		} catch (err) {
			if (fatal) throw new ExtractorError(`Failed to parse JSON (${name}): ${err.message}`);
			return null;
		}
	}
	searchRegex(pattern, str, name = "video", flags = "", fatal = true, group = 0) {
		const m = (typeof pattern === "string" ? new RegExp(pattern, flags) : new RegExp(pattern.source, pattern.flags || flags)).exec(str);
		if (!m) {
			if (fatal) throw new ExtractorError(`Unable to extract ${name}`);
			return null;
		}
		const value = typeof group === "number" ? m[group] : m.groups?.[group];
		if (value == null && fatal) throw new ExtractorError(`Unable to extract ${name}`);
		return value ?? null;
	}
	searchJson(pattern, str, name = "JSON object", flags = "") {
		const m = (typeof pattern === "string" ? new RegExp(pattern, flags) : pattern).exec(str);
		if (!m) throw new ExtractorError(`Unable to extract ${name}`);
		const tail = str.slice(m.index + m[0].length - 1);
		const jsonStart = tail.search(/[{[]/);
		if (jsonStart === -1) throw new ExtractorError(`Unable to find JSON after match (${name})`);
		const balanced = scanBalanced(tail.slice(jsonStart));
		return this.parseJson(balanced, name);
	}
	htmlSearchMeta(names, html, fatal = false) {
		const list = Array.isArray(names) ? names : [names];
		for (const name of list) {
			const re = new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${escapeReg(name)}["'][^>]+content=["']([^"']*)["']`, "i");
			const alt = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name|itemprop)=["']${escapeReg(name)}["']`, "i");
			const v = re.exec(html)?.[1] ?? alt.exec(html)?.[1];
			if (v != null) return decodeHtmlEntities(v);
		}
		if (fatal) throw new ExtractorError(`Unable to extract meta field ${list.join(",")}`);
		return null;
	}
	raiseLoginRequired(msg = "This video is only available to authorized users") {
		throw new ExtractorError(msg, void 0, true);
	}
	raiseNoFormats(videoId, msg = "No video formats found!") {
		throw new ExtractorError(msg, videoId, true);
	}
	urlResult(url, ieKey, videoId, title) {
		return {
			_type: "url",
			id: videoId ?? "",
			title: title ?? null,
			url,
			ie_key: ieKey
		};
	}
	videoResult(partial) {
		return {
			_type: "video",
			formats: [],
			thumbnails: [],
			...partial
		};
	}
	async extractM3u8Formats(m3u8Url, videoId, fatal = true, headers) {
		try {
			const manifest = await this.client.downloadText(m3u8Url, {
				note: "Downloading m3u8 information",
				headers,
				retries: 2
			});
			return this.parseM3u8Formats(manifest, m3u8Url, headers);
		} catch (err) {
			if (!fatal) return [];
			throw err;
		}
	}
	parseM3u8Formats(manifest, m3u8Url, headers) {
		if (isMasterPlaylist(manifest)) return parseM3u8Master(manifest, m3u8Url, headers);
		if (!manifest.includes("#EXTINF")) return [];
		return [parseMediaPlaylist(manifest, m3u8Url, {
			format_id: "hls_media",
			ext: "mp4"
		}).format];
	}
	extractMpdFormats(mpdUrl, videoId, fatal = true) {
		return this.client.downloadText(mpdUrl, { retries: 2 }).then((text) => this.parseMpdFormats(text, mpdUrl)).catch((err) => {
			if (!fatal) return [];
			throw err;
		});
	}
	parseMpdFormats(mpdText, mpdUrl) {
		return parseMpd(mpdText, mpdUrl);
	}
	async resolveMediaPlaylist(format, headers) {
		if (!format.__pending_fragments) return format;
		const manifest = await this.client.downloadText(format.url, {
			headers,
			retries: 2
		});
		if (isMasterPlaylist(manifest)) throw new ExtractorError("Expected media playlist but got master playlist");
		return parseMediaPlaylist(manifest, format.url, format).format;
	}
};
function basename(url) {
	try {
		const u = new URL(url);
		return u.pathname.split("/").filter(Boolean).at(-1) ?? u.hostname;
	} catch {
		return url;
	}
}
function escapeReg(s) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function decodeHtmlEntities(s) {
	return s.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10))).replace(/&quot;/g, "\"").replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
}
function scanBalanced(input) {
	let depth = 0;
	let inString = false;
	let quote = "";
	let escaped = false;
	for (let i = 0; i < input.length; i++) {
		const ch = input[i];
		if (inString) {
			if (escaped) escaped = false;
			else if (ch === "\\") escaped = true;
			else if (ch === quote) inString = false;
			continue;
		}
		if (ch === "\"" || ch === "'") {
			inString = true;
			quote = ch;
		} else if (ch === "{" || ch === "[") depth++;
		else if (ch === "}" || ch === "]") {
			depth--;
			if (depth === 0) return input.slice(0, i + 1);
		}
	}
	return repairTrailingComma(input);
}
function repairTrailingComma(s) {
	return s.replace(/,(\s*[}\]])/g, "$1");
}
function stripQuotes(s) {
	if (!s) return "";
	return s.replace(/^["']|["']$/g, "");
}
function parseM3u8Attributes(input) {
	const attrs = {};
	const re = /([A-Z0-9-]+)=(?:"((?:[^"\\]|\\.)*)"|([^,]*))/g;
	let m;
	while (m = re.exec(input)) attrs[m[1]] = m[2] ?? m[3] ?? "";
	return attrs;
}
function parseXmlAttrs(input) {
	const attrs = {};
	const re = /([\w:-]+)\s*=\s*"([^"]*)"|([\w:-]+)\s*=\s*'([^']*)'/g;
	let m;
	while (m = re.exec(input)) if (m[1]) attrs[m[1]] = m[2];
	else if (m[3]) attrs[m[3]] = m[4];
	return attrs;
}
function dedupeFormats(formats) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const f of formats) {
		const key = `${f.format_id}|${f.url}|${f.height ?? ""}|${f.vcodec ?? ""}`;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(f);
	}
	return out;
}
//#endregion
//#region node_modules/ytdlp-typescript/dist/extractor/pinterest.js
var Pinterest = class extends InfoExtractor {
	get validUrlPatterns() {
		return [/^https?:\/\/(?:[^/?#]+\.)?pinterest\.[a-z]{2,6}(?:\.[a-z]{2})?\/pin\/(?<id>\d+)/i, /^https?:\/\/pin\.it\/(?<id>[A-Za-z0-9_-]+)/i];
	}
	async callApi(resource, options) {
		const dataParam = JSON.stringify({ options });
		const url = `https://www.pinterest.com/resource/${resource}Resource/get/?data=${encodeURIComponent(dataParam)}`;
		return this.downloadJson(url, {
			note: `Downloading ${resource} JSON metadata`,
			headers: {
				"x-pinterest-pws-handler": "www/[username].js",
				accept: "application/json, text/javascript, */*, q=0.01"
			}
		});
	}
	async realExtract(url) {
		let target = url;
		if (/^https?:\/\/pin\.it\//i.test(url)) target = (await this.client.request(url, { retries: 1 })).url;
		const pinId = this.matchId(target);
		const data = (await this.callApi("Pin", {
			id: pinId,
			field_set_key: "unauth_react_main_pin",
			fetch_visual_search_objects: false
		}))?.resource_response?.data;
		if (!data) this.raiseNoFormats(pinId, "Unable to download Pin info");
		if (strOrNone(data.link)) return this.urlResult(data.link, void 0, pinId, strOrNone(data.grid_title));
		const formats = [];
		const videoLists = collectVideoLists(data);
		for (const list of videoLists) for (const item of list) {
			const vUrl = urlOrNone(item.url ?? item.video_url);
			if (!vUrl) continue;
			if (/\.m3u8($|\?)/i.test(vUrl)) {
				const hlsFormats = await this.extractM3u8Formats(vUrl, pinId, false);
				formats.push(...hlsFormats);
				continue;
			}
			const isHls = /\.m3u8/i.test(vUrl);
			formats.push({
				format_id: strOrNone(item.id) ?? vUrl.slice(-24),
				url: vUrl,
				ext: isHls ? "m3u8" : "mp4",
				protocol: isHls ? "m3u8_native" : "https",
				width: intOrNone(item.width),
				height: intOrNone(item.height),
				duration: item.duration != null ? Math.round(Number(item.duration)) : null,
				http_headers: defaultHeaders(),
				vcodec: isHls ? null : "unknown",
				acodec: isHls ? null : "unknown",
				format_note: strOrNone(item.render_type) ?? void 0
			});
		}
		const timestamp = data.created_at ? Math.floor(Date.parse(data.created_at) / 1e3) : null;
		return this.videoResult({
			id: String(data.id ?? pinId),
			title: strOrNone(data.grid_title) ?? strOrNone(data.seo_title) ?? strOrNone(data.description)?.slice(0, 60) ?? `Pin ${pinId}`,
			description: strOrNone(data.closeup_unified_description) ?? strOrNone(data.description) ?? strOrNone(data.seo_description),
			duration: formats[0]?.duration ?? null,
			timestamp,
			uploader: strOrNone(data.pinner?.full_name) ?? strOrNone(data.native_creator?.full_name),
			uploader_id: strOrNone(data.pinner?.username) ?? strOrNone(data.native_creator?.username),
			webpage_url: `https://www.pinterest.com/pin/${pinId}/`,
			view_count: intOrNone(data.aggregated_pin_data?.aggregated_stats?.saves),
			like_count: intOrNone(data.reaction_counts?.["1"]),
			repost_count: intOrNone(data.repins_count_from_this_pin ?? data.repin_count),
			comment_count: intOrNone(data.comment_count),
			tags: data.pin_join?.visual_descriptions,
			thumbnail: urlOrNone(traverseObj(data, "images.orig.url")),
			formats
		});
	}
};
function collectVideoLists(data) {
	const lists = [];
	const main = data.videos?.video_list;
	if (main) lists.push(toList(main));
	const storyPages = data.story_pin_data?.pages;
	if (Array.isArray(storyPages)) for (const page of storyPages) for (const block of page?.blocks ?? []) {
		const vl = block?.video?.video_list;
		if (vl) lists.push(toList(vl));
	}
	return lists;
}
function toList(vl) {
	if (Array.isArray(vl)) return vl.filter((v) => v && typeof v === "object");
	if (typeof vl === "object" && vl !== null) return Object.values(vl).filter((v) => v && typeof v === "object");
	return [];
}
function defaultHeaders() {
	return { referer: "https://www.pinterest.com/" };
}
//#endregion
//#region node_modules/ytdlp-typescript/dist/extractor/facebook.js
var VALID_URL$4 = /^https?:\/\/(?:[\w-]+\.)?facebook\.com\/(?:(?:[^#]*?\#!\/)?(?:(?:permalink\.php|video\/video\.php|photo\.php|video\.php|video\/embed|story\.php|watch(?:\/live)?\/?)\?(?:.*?)(?:v|video_id|story_fbid)=|[^/]+\/videos\/(?:[^/]+\/)?|[^/]+\/posts\/|events\/(?:[^/]+\/)?|groups\/[^/]+\/(?:permalink|posts)\/(?:[\da-f]+\/)?|reel\/|watchparty\/))?(?:[^/?#]*\/)?(?<id>pfbid[A-Za-z0-9]+|\d+)/i;
var Facebook = class extends InfoExtractor {
	get validUrlPatterns() {
		return [VALID_URL$4];
	}
	async realExtract(url) {
		let videoId = this.suitable(url).groups["id"];
		if (/\/reel\//i.test(url)) videoId = videoId.replace(/^0+/, "") || videoId;
		const headers = { "user-agent": BOT_UA };
		let webpage = await this.downloadWebpage(url, {
			note: "Downloading webpage",
			headers,
			expectedStatus: [200]
		});
		let collected = this.collectFromHtml(webpage);
		if (!collected.length) {
			const desktopPage = await this.downloadWebpage(url, {
				note: "Retrying with browser user-agent",
				headers: { "user-agent": DEFAULT_DESKTOP_UA },
				retries: 1
			}).catch(() => null);
			if (desktopPage) {
				collected = this.collectFromHtml(desktopPage);
				if (collected.length) webpage = desktopPage;
			}
		}
		if (!collected.length) {
			this.checkUnavailable(webpage);
			collected = await this.tryTahoe(videoId, webpage);
		}
		if (!collected.length) this.checkUnavailable(webpage);
		if (!collected.length) this.raiseLoginRequired("The video is not available, Facebook may require you to log in");
		pickBest(collected);
		const formats = [];
		const seenFormatUrls = /* @__PURE__ */ new Set();
		for (const c of collected) for (const f of this.buildFormats(c.raw)) {
			if (seenFormatUrls.has(f.url)) continue;
			seenFormatUrls.add(f.url);
			formats.push(f);
		}
		const usable = formats.filter((f) => !isLookaside(f.url));
		const finalFormats = usable.length ? usable : formats;
		if (!usable.length && /\/reel\//i.test(url)) this.raiseLoginRequired("Reel is only available as a crawler preview without authentication; pass cookiesFile of a logged-in session");
		const metaRaw = pickMeta(collected);
		const ogTitle = this.htmlSearchMeta(["og:title"], webpage);
		let title = strOrNone(metaRaw["name"]) ?? strOrNone(metaRaw["message"])?.slice(0, 80) ?? cleanOgTitle(ogTitle) ?? `Facebook video #${videoId}`;
		if (/^\d+(\.\d+)?[KM]?\s*(views|reactions)/i.test(title)) {
			const afterPipe = title.split("|").slice(1).join("|").trim();
			if (afterPipe && !/^(views|reactions)/i.test(afterPipe)) title = afterPipe;
		}
		const description = strOrNone(traverseObj(metaRaw, ["savable_description.text", "description"])) ?? strOrNone(traverseObj(metaRaw, "creation_story.description.text")) ?? this.htmlSearchMeta(["og:description", "description"], webpage);
		const subtitles = {};
		const captionUrl = urlOrNone(traverseObj(metaRaw, ["captions_url", "video_available_captions_locales[].captions_url"]));
		if (captionUrl) subtitles["en"] = [{
			ext: "srt",
			url: captionUrl,
			name: "English"
		}];
		return this.videoResult({
			id: strOrNone(metaRaw["videoId"]) ?? strOrNone(metaRaw["id"]) ?? videoId,
			title: title.replace(/\s*\|\s*By\s+.*$/i, "").trim() || title,
			description,
			uploader: strOrNone(traverseObj(metaRaw, ["owner.name", "owner.short_name"])) ?? this.htmlSearchMeta(["og:site_name"], webpage),
			uploader_id: strOrNone(traverseObj(metaRaw, ["owner.id"])) ?? void 0,
			timestamp: intOrNone(metaRaw["publish_time"]) ?? intOrNone(metaRaw["creation_time"]) ?? parseOgTimestamp(webpage),
			duration: floatOrNone(metaRaw["playable_duration_in_ms"], 1 / 1e3) ?? floatOrNone(metaRaw["length_in_second"]) ?? void 0,
			view_count: intOrNone(traverseObj(metaRaw, ["viewCount", "video_view_count_rendered"])) ?? void 0,
			thumbnail: urlOrNone(traverseObj(metaRaw, ["thumbnailImage.uri", "preferred_thumbnail.image.uri"])) ?? this.htmlSearchMeta(["og:image"], webpage),
			webpage_url: `https://www.facebook.com/watch/?v=${videoId}`,
			formats: finalFormats,
			subtitles,
			http_headers: headers
		});
	}
	collectFromHtml(webpage) {
		const blocks = [...webpage.matchAll(/data-sjs>\{.*?ScheduledServerJS.*?\}<\/script>/g)];
		const videos = [];
		for (const block of blocks) {
			const jsonStr = block[0].slice(9, -9);
			const data = this.parseJson(jsonStr, "server js data", false);
			if (!data) continue;
			videos.push(...collectVideoObjects(data));
		}
		if (!videos.length) for (const m of webpage.matchAll(/"playable_url":"(https:\\?\/\\?\/[^"]+)"/g)) try {
			const u = JSON.parse(`"${m[1]}"`);
			videos.push({
				raw: {},
				urls: [u]
			});
		} catch {}
		return dedupe(videos);
	}
	async tryTahoe(videoId, webpage) {
		const pkgCohort = this.searchRegex(/pkg_cohort["']\s*:\s*["'](.+?)["']/, webpage, "pkg cohort", "", false) ?? "PHASED:DEFAULT";
		const clientRev = this.searchRegex(/client_revision["']\s*:\s*(\d+),/, webpage, "client revision", "", false) ?? "3944515";
		const dtsg = this.searchRegex(/"DTSGInitialData"\s*,\s*\[\]\s*,\s*\{\s*"token"\s*:\s*"([^"]+)"/, webpage, "dtsg token", "", false) ?? "";
		const body = new URLSearchParams({
			__a: "1",
			__pc: pkgCohort,
			__rev: clientRev,
			fb_dtsg: dtsg
		}).toString();
		try {
			const text = await (await this.client.request(`https://www.facebook.com/video/tahoe/async/${videoId}/?chain=true&isvideo=true&payloadtype=primary`, {
				method: "POST",
				body,
				headers: {
					"content-type": "application/x-www-form-urlencoded",
					referer: "https://www.facebook.com/"
				},
				retries: 1,
				expectedStatus: [200]
			})).text();
			const jsonStart = text.startsWith("for (;;);") ? 9 : 0;
			const data = this.parseJson(text.slice(jsonStart), "tahoe data", false);
			if (!data) return [];
			return dedupe(collectVideoObjects(data));
		} catch {
			return [];
		}
	}
	buildFormats(raw) {
		const formats = [];
		const seenUrls = /* @__PURE__ */ new Set();
		const legacy = raw["videoDeliveryLegacyFields"] ?? raw;
		for (const [key, fid, quality] of [
			[
				"playable_url",
				"sd",
				-2
			],
			[
				"playable_url_quality_hd",
				"hd",
				-1
			],
			[
				"browser_native_sd_url",
				"sd",
				-2
			],
			[
				"browser_native_hd_url",
				"hd",
				-1
			],
			[
				"playable_url_dash",
				"dash",
				0
			]
		]) {
			const pUrl = urlOrNone(legacy[key]) ?? urlOrNone(raw[key]);
			if (!pUrl || seenUrls.has(pUrl)) continue;
			seenUrls.add(pUrl);
			if (determineExt(pUrl) === "mpd") {
				formats.push(...this.extractMpdFormatsSyncSafe(pUrl));
				continue;
			}
			formats.push({
				format_id: fid,
				quality,
				url: pUrl,
				ext: "mp4",
				protocol: "https",
				http_headers: { "user-agent": "facebookexternalhit/1.1" }
			});
		}
		const dashManifest = legacy["dash_manifest"] ?? raw["dash_manifest"];
		if (typeof dashManifest === "string" && dashManifest) {
			const xml = decodePlus(dashManifest);
			try {
				formats.push(...this.parseMpdFormats(xml, strOrNone(raw["dash_manifest_url"]) ?? "https://www.facebook.com/"));
			} catch {}
		}
		const resp = traverseObj(raw, "videoDeliveryResponseFragment.videoDeliveryResponseResult");
		if (resp) {
			for (const prog of resp["progressive_urls"] ?? []) {
				const pUrl = urlOrNone(prog?.["progressive_url"]);
				if (!pUrl || seenUrls.has(pUrl)) continue;
				seenUrls.add(pUrl);
				const qid = strOrNone(prog?.["metadata"]?.["quality"])?.toLowerCase();
				formats.push({
					format_id: qid ?? "progressive",
					quality: qid === "hd" ? -1 : qid === "sd" ? -2 : 0,
					url: pUrl,
					ext: "mp4",
					protocol: "https",
					width: intOrNone(prog?.["width"]),
					height: intOrNone(prog?.["height"]),
					http_headers: { "user-agent": "facebookexternalhit/1.1" }
				});
			}
			for (const hls of resp["hls_playlist_urls"] ?? []) {
				const hUrl = urlOrNone(hls?.["hls_playlist_url"]);
				if (!hUrl) continue;
				formats.push({
					format_id: "hls",
					url: hUrl,
					protocol: "m3u8_native",
					ext: "mp4",
					__pending_fragments: true,
					http_headers: { "user-agent": "facebookexternalhit/1.1" }
				});
			}
			for (const dm of resp["dash_manifests"] ?? []) {
				const xml = dm?.["manifest_xml"];
				if (typeof xml === "string" && xml) try {
					formats.push(...this.parseMpdFormats(xml, urlOrNone(dm?.["manifest_url"]) ?? "https://www.facebook.com/"));
				} catch {}
			}
		}
		return formats;
	}
	extractMpdFormatsSyncSafe(mpdUrl) {
		return [];
	}
	checkUnavailable(webpage) {
		const mMsg = /class="[^"]*uiInterstitialContent[^"]*"><div>(.*?)<\/div>/.exec(webpage);
		if (mMsg) throw new Error(`The video is not available, Facebook said: "${mMsg[1]}"`);
		if (webpage.includes(">You must log in to continue") || webpage.includes("id=\"login_form\"") || webpage.includes("id=\"loginbutton\"")) this.raiseLoginRequired();
	}
};
var DEFAULT_DESKTOP_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36";
var BOT_UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
function collectVideoObjects(root) {
	const out = [];
	const visited = /* @__PURE__ */ new Set();
	const visit = (node, depth) => {
		if (!node || typeof node !== "object" || depth > 40) return;
		if (visited.has(node)) return;
		visited.add(node);
		if (Array.isArray(node)) {
			for (const item of node) visit(item, depth + 1);
			return;
		}
		const obj = node;
		if (("playable_url" in obj || "playable_url_quality_hd" in obj || "browser_native_hd_url" in obj || "videoDeliveryLegacyFields" in obj || "videoDeliveryResponseFragment" in obj) && !out.some((v) => v.raw === obj)) out.push({
			raw: obj,
			urls: []
		});
		for (const key of Object.keys(obj)) {
			const val = obj[key];
			if (val && typeof val === "object") visit(val, depth + 1);
		}
	};
	visit(root, 0);
	return out;
}
function dedupe(videos) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const v of videos) {
		if (seen.has(v.raw)) continue;
		seen.add(v.raw);
		out.push(v);
	}
	return out;
}
function pickBest(videos) {
	let best = videos[0];
	let bestScore = -1;
	for (const v of videos) {
		let score = 0;
		if (v.raw["playable_url"]) score++;
		if (v.raw["playable_url_quality_hd"] || v.raw["browser_native_hd_url"]) score += 2;
		if (v.raw["videoDeliveryLegacyFields"]) score += 4;
		if (v.raw["name"]) score++;
		if (score > bestScore) {
			bestScore = score;
			best = v;
		}
	}
	return best;
}
function isLookaside(u) {
	return /lookaside\.fbsbx\.com|\/lookaside\//.test(u);
}
function pickMeta(videos) {
	let best = {};
	let bestScore = -1;
	for (const v of videos) {
		const r = v.raw;
		let score = 0;
		if (r["name"]) score += 2;
		if (r["owner"]) score += 2;
		if (r["publish_time"] || r["creation_time"]) score++;
		if (r["playable_duration_in_ms"] || r["length_in_second"]) score++;
		if (r["videoId"]) score++;
		if (score > bestScore) {
			bestScore = score;
			best = r;
		}
	}
	return best;
}
function cleanOgTitle(t) {
	if (!t) return null;
	return t.replace(/^\s*\d+(\.\d+)?[KM]?\s*views\s*·\s*/i, "").replace(/\s*·\s*\d+(\.\d+)?[KM]?\s*reactions\s*\|\s*/i, " | ").trim() || null;
}
function decodePlus(s) {
	try {
		return decodeURIComponent(s.replace(/\+/g, " "));
	} catch {
		return s;
	}
}
function parseOgTimestamp(webpage) {
	const m = propertyContent(webpage, "article:published_time");
	if (!m) return null;
	const ts = Date.parse(m);
	return Number.isNaN(ts) ? null : Math.floor(ts / 1e3);
}
function propertyContent(webpage, prop) {
	return new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']*)["']`, "i").exec(webpage)?.[1] ?? null;
}
//#endregion
//#region node_modules/ytdlp-typescript/dist/extractor/tiktok.js
var VALID_URL$3 = /^https?:\/\/(?:www\.)?tiktokv?\.com\/(?:embed|(?:share|@(?<user_id>[\w.-]+)?)\/video)\/(?<id>\d+)/i;
var SHORT_URL = /^https?:\/\/(?:vm|vt)\.tiktok\.com\/(?<id>[\w-]+)/i;
var TikTok = class extends InfoExtractor {
	get validUrlPatterns() {
		return [SHORT_URL, VALID_URL$3];
	}
	async realExtract(url) {
		let target = url;
		if (SHORT_URL.test(url)) target = (await this.client.request(url, { retries: 1 })).url;
		const m = VALID_URL$3.exec(target);
		if (!m) throw new Error(`Unsupported TikTok URL after redirects: ${url}`);
		const videoId = m.groups["id"];
		const canonicalUrl = `https://www.tiktok.com/@${m.groups["user_id"] ?? "_"}/video/${videoId}`;
		const { videoData, status } = await this.extractWebData(canonicalUrl, videoId);
		if (!videoData) {
			if (status === 10216 || status === 10222) this.raiseLoginRequired("You do not have permission to view this post. Log into an account that has access");
			if (status === 10204) throw new Error("Your IP address is blocked from accessing this post");
			throw new Error(`Video not available, status code ${status}`);
		}
		return this.parseAwemeVideoWeb(videoData, canonicalUrl, videoId);
	}
	async extractWebData(url, videoId) {
		const attempts = [{
			"user-agent": DESKTOP_UA$1,
			referer: "https://www.tiktok.com/",
			accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
			"accept-language": "en-US,en;q=0.9"
		}, {
			"user-agent": MOBILE_APP_UA,
			referer: "https://www.tiktok.com/",
			accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
		}];
		let webpage = "";
		for (const headers of attempts) {
			let lastErr = null;
			for (let i = 0; i < 2; i++) try {
				webpage = await this.downloadWebpage(url, {
					headers,
					retries: 1
				});
				lastErr = null;
				break;
			} catch (err) {
				lastErr = err;
			}
			if (lastErr != null) continue;
			const universal = getUniversalData(webpage);
			if (universal) return this.parseUniversal(universal);
			let solved = false;
			try {
				solved = this.solveChallenge(webpage);
			} catch {
				solved = false;
			}
			if (solved) {
				webpage = await this.downloadWebpage(url, {
					headers,
					retries: 1
				});
				const retryUniversal = getUniversalData(webpage);
				if (retryUniversal) return this.parseUniversal(retryUniversal);
			}
		}
		if (webpage.includes("/login")) this.raiseLoginRequired("TikTok is requiring login for access to this content");
		throw new Error("Unable to extract TikTok video data (bot protection); pass cookiesFile of a logged-in browser session");
	}
	parseUniversal(universal) {
		const detailScope = universal?.["__DEFAULT_SCOPE__"] ?? {};
		const detail = detailScope?.["webapp.video-detail"] ?? detailScope?.["webapp.reflow.video.detail"] ?? {};
		const status = intOrNone(detail?.["statusCode"]) ?? -1;
		const videoData = detail?.["itemInfo"]?.["itemStruct"] ?? null;
		if (!videoData?.["video"] && videoData?.["isContentClassified"]) this.raiseLoginRequired("This post may not be comfortable for some audiences. Log in for access");
		return {
			videoData,
			status
		};
	}
	solveChallenge(webpage) {
		const csClass = getDivAttributeById(webpage, "cs", "class");
		if (!csClass) {
			if (webpage.includes("Please wait...") || webpage.includes("id=\"cs\"") || webpage.includes("id='cs'")) throw new Error("Unable to extract challenge data");
			return false;
		}
		let challengeData;
		try {
			challengeData = JSON.parse(Buffer.from(csClass + "===", "base64").toString("utf8"));
		} catch {
			return false;
		}
		if (!challengeData) return false;
		const expectedDigestB64 = challengeData?.v?.c;
		const baseHashStr = challengeData?.v?.a;
		if (typeof expectedDigestB64 !== "string" || typeof baseHashStr !== "string") throw new Error("Unexpected challenge data shape");
		const expectedDigest = Buffer.from(expectedDigestB64, "base64");
		let answer = null;
		for (let i = 0; i <= 1e6; i++) {
			const num = Buffer.from(String(i), "utf8");
			if (createHash("sha256").update(Buffer.from(baseHashStr, "base64")).update(num).digest().equals(expectedDigest)) {
				answer = String(i);
				break;
			}
		}
		if (answer == null) throw new Error("Unable to solve JS challenge");
		challengeData.d = Buffer.from(answer, "utf8").toString("base64");
		const wciValue = Buffer.from(JSON.stringify(challengeData)).toString("base64");
		const wciName = getDivAttributeById(webpage, "wci", "class");
		if (wciName) this.client.cookieJar.setRawCookie(wciName, wciValue, {
			domain: ".tiktok.com",
			path: "/",
			expires: Math.floor(Date.now() / 1e3) + 120
		});
		const rciName = getDivAttributeById(webpage, "rci", "class");
		const rciValue = getDivAttributeById(webpage, "rs", "class");
		if (rciName && rciValue) this.client.cookieJar.setRawCookie(rciName, rciValue, {
			domain: ".tiktok.com",
			path: "/",
			expires: Math.floor(Date.now() / 1e3) + 120
		});
		return true;
	}
	parseAwemeVideoWeb(aweme, webpageUrl, videoId) {
		const formats = this.extractWebFormats(aweme);
		const author = aweme["authorInfo"] ?? aweme["author"] ?? {};
		const stats = aweme["stats"] ?? {};
		const music = aweme["music"] ?? {};
		return this.videoResult({
			id: videoId,
			title: truncate(strOrNone(aweme["desc"]), 72) ?? videoId,
			description: strOrNone(aweme["desc"]),
			duration: intOrNone(aweme?.["video"]?.["duration"]) ?? void 0,
			timestamp: intOrNone(aweme["createTime"]) ?? void 0,
			uploader: strOrNone(author["uniqueId"] ?? author["author"]),
			uploader_id: strOrNone(author["authorId"] ?? author["uid"] ?? author["id"]),
			channel: strOrNone(author["nickname"]),
			channel_id: strOrNone(author["authorSecUid"] ?? author["secUid"]),
			uploader_url: author["uniqueId"] ? `https://www.tiktok.com/@${author["uniqueId"]}` : void 0,
			view_count: intOrNone(stats["playCount"]) ?? void 0,
			like_count: intOrNone(stats["diggCount"]) ?? void 0,
			repost_count: intOrNone(stats["shareCount"]) ?? void 0,
			comment_count: intOrNone(stats["commentCount"]) ?? void 0,
			track: strOrNone(music["title"]) ?? void 0,
			album: strOrNone(music["album"]) ?? void 0,
			artists: strOrNone(music["authorName"]) ? String(music["authorName"]).split(/, | & /) : void 0,
			thumbnails: buildThumbnails(aweme),
			webpage_url: webpageUrl,
			http_headers: { referer: webpageUrl },
			formats
		});
	}
	extractWebFormats(aweme) {
		const formats = [];
		const seenUrls = /* @__PURE__ */ new Set();
		const videoInfo = aweme["video"] ?? {};
		const playWidth = intOrNone(videoInfo["width"]);
		const playHeight = intOrNone(videoInfo["height"]);
		const ratio = playWidth && playHeight ? playWidth / playHeight : .5625;
		for (const bitrate of videoInfo["bitrateInfo"] ?? []) {
			const playAddr = bitrate?.["PlayAddr"];
			const urlKey = strOrNone(playAddr?.["UrlKey"]) ?? "";
			const resMatch = /(?:res(?:olution)?_)?(\d{3,4})p(?:_|$)/i.exec(urlKey);
			let dimension = resMatch ? parseInt(resMatch[1], 10) : 0;
			if (dimension === 540) dimension = 576;
			let width;
			let height;
			if (dimension > 0) {
				if (ratio < 1) {
					width = dimension;
					height = dimension / ratio;
					height = height - height % 2;
					width = Math.round(width);
					height = Math.round(height);
				} else {
					height = dimension;
					width = Math.round(dimension * ratio + dimension * ratio % 2);
				}
			}
			const isBytevc2 = urlKey.includes("bytevc2");
			const isHvc1 = urlKey.includes("hvc1");
			for (const vUrl of playAddr?.["UrlList"] ?? []) {
				const u = normalizeProto$1(urlOrNone(vUrl));
				if (!u || seenUrls.has(u)) continue;
				seenUrls.add(u);
				formats.push({
					url: u,
					format_id: `${urlKey.split("/").at(-1) ?? "bp"}-${formats.length}`,
					ext: "mp4",
					protocol: "https",
					vcodec: isBytevc2 ? "bytevc2" : "h264",
					acodec: isHvc1 ? "none" : "aac",
					format_note: isBytevc2 ? "UNPLAYABLE" : void 0,
					preference: isBytevc2 ? -100 : -1,
					filesize: intOrNone(playAddr?.["DataSize"]) ?? void 0,
					width,
					height,
					quality: -1,
					http_headers: { referer: "https://www.tiktok.com/" }
				});
			}
		}
		const playQuality = formats.find((f) => f.width === playWidth)?.quality;
		const playAddr = normalizeProto$1(urlOrNone(videoInfo["playAddr"]));
		if (playAddr && !seenUrls.has(playAddr)) {
			seenUrls.add(playAddr);
			formats.push({
				format_id: "play",
				url: playAddr,
				ext: "mp4",
				protocol: "https",
				vcodec: "h264",
				acodec: "aac",
				width: playWidth ?? void 0,
				height: playHeight ?? void 0,
				quality: playQuality,
				http_headers: { referer: "https://www.tiktok.com/" }
			});
		}
		const downloadUrl = urlOrNone(videoInfo["downloadAddr"] ?? videoInfo?.["download"]?.["url"]);
		if (downloadUrl) formats.push({
			format_id: "download",
			url: downloadUrl,
			ext: "mp4",
			protocol: "https",
			vcodec: "h264",
			acodec: "aac",
			format_note: "watermarked",
			preference: -2,
			http_headers: { referer: "https://www.tiktok.com/" }
		});
		const audioUrl = urlOrNone(aweme?.["music"]?.["playUrl"]);
		if (audioUrl) formats.push({
			format_id: "audio",
			url: audioUrl,
			ext: "m4a",
			protocol: "https",
			acodec: "aac",
			vcodec: "none",
			http_headers: { referer: "https://www.tiktok.com/" }
		});
		return formats;
	}
};
var DESKTOP_UA$1 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36";
var MOBILE_APP_UA = "TikTok 26.2.0 rv:202260200 (iPhone; iOS 14.4.2; en_US) Cronet";
function getUniversalData(webpage) {
	const m = /<script[^>]+\bid="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/i.exec(webpage) ?? /<script[^>]+\bid="SIGI_STATE"[^>]*>([\s\S]*?)<\/script>/i.exec(webpage);
	if (!m) return null;
	try {
		return JSON.parse(m[1].trim());
	} catch {
		return null;
	}
}
function normalizeProto$1(u) {
	if (!u) return null;
	if (u.startsWith("//")) return `https:${u}`;
	return u;
}
function getDivAttributeById(html, id, attr) {
	const tagRe = new RegExp(`<div[^>]*\\bid=["']${id}["'][^>]*>`, "i");
	const attrRe = new RegExp(`${attr}=["']([^"']*)["']`, "i");
	const tag = tagRe.exec(html)?.[0];
	if (!tag) return null;
	return attrRe.exec(tag)?.[1] ?? null;
}
function buildThumbnails(aweme) {
	const out = [];
	const video = aweme["video"] ?? {};
	for (const id of [
		"thumbnail",
		"cover",
		"dynamicCover",
		"originCover"
	]) {
		const u = urlOrNone(video[id]);
		if (u) out.push({
			id,
			url: u.startsWith("//") ? `https:${u}` : u,
			preference: id === "dynamicCover" ? -2 : -1
		});
	}
	return out;
}
function truncate(s, n) {
	if (!s) return null;
	return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
//#endregion
//#region node_modules/ytdlp-typescript/dist/extractor/youtube/clients.js
var INNERTUBE_CLIENTS = {
	visionos: {
		clientName: "VISIONOS",
		clientVersion: "1.02",
		clientNameNumber: 101,
		userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15",
		requireJsPlayer: false,
		gvsPotRequiredHttps: false
	},
	android_vr: {
		clientName: "ANDROID_VR",
		clientVersion: "1.65.10",
		clientNameNumber: 28,
		userAgent: "com.google.android.apps.youtube.vr.oculus/1.65.10 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip",
		extraContext: {
			deviceMake: "Oculus",
			deviceModel: "Quest 3",
			androidSdkVersion: 32,
			osName: "Android",
			osVersion: "12L"
		},
		requireJsPlayer: false,
		gvsPotRequiredHttps: true
	},
	ios: {
		clientName: "IOS",
		clientVersion: "21.26.4",
		clientNameNumber: 5,
		userAgent: "com.google.ios.youtube/21.26.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)",
		extraContext: {
			deviceMake: "Apple",
			deviceModel: "iPhone16,2",
			osName: "iPhone",
			osVersion: "18.3.2.22D82"
		},
		requireJsPlayer: false,
		gvsPotRequiredHttps: true
	},
	android: {
		clientName: "ANDROID",
		clientVersion: "21.26.364",
		clientNameNumber: 3,
		userAgent: "com.google.android.youtube/21.26.364 (Linux; U; Android 11) gzip",
		extraContext: {
			androidSdkVersion: 30,
			osName: "Android",
			osVersion: "11"
		},
		requireJsPlayer: false,
		gvsPotRequiredHttps: true
	},
	tv: {
		clientName: "TVHTML5",
		clientVersion: "7.20260707.07.00",
		clientNameNumber: 7,
		userAgent: "Mozilla/5.0 (ChromiumStylePlatform) Cobalt/25.lts.30.1034943-gold (unlike Gecko), Unknown_TV_Unknown_0/Unknown (Unknown, Unknown)",
		supportsCookies: true,
		requireJsPlayer: void 0,
		gvsPotRequiredHttps: false
	},
	tv_downgraded: {
		clientName: "TVHTML5",
		clientVersion: "5.20260707",
		clientNameNumber: 7,
		userAgent: "Mozilla/5.0 (ChromiumStylePlatform) Cobalt/Version",
		supportsCookies: true,
		gvsPotRequiredHttps: false
	},
	web: {
		clientName: "WEB",
		clientVersion: "2.20260708.00.00",
		clientNameNumber: 1,
		supportsCookies: true,
		requireJsPlayer: true,
		gvsPotRequiredHttps: true
	},
	web_safari: {
		clientName: "WEB",
		clientVersion: "2.20260708.00.00",
		clientNameNumber: 1,
		userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Safari/605.1.15,gzip(gfe)",
		supportsCookies: true,
		requireJsPlayer: true,
		gvsPotRequiredHttps: true
	},
	mweb: {
		clientName: "MWEB",
		clientVersion: "2.20260708.05.00",
		clientNameNumber: 2,
		userAgent: "Mozilla/5.0 (iPad; CPU OS 16_7_10 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1,gzip(gfe)",
		supportsCookies: true,
		requireJsPlayer: true,
		gvsPotRequiredHttps: true
	}
};
var DEFAULT_CLIENT_ORDER = [
	"visionos",
	"ios",
	"tv",
	"android_vr",
	"web_safari",
	"web"
];
function buildInnertubeContext(clientKey) {
	const c = INNERTUBE_CLIENTS[clientKey];
	return { client: {
		clientName: c.clientName,
		clientVersion: c.clientVersion,
		...c.userAgent ? { userAgent: c.userAgent } : {},
		...c.extraContext ?? {},
		hl: "en",
		gl: "US",
		timeZone: "UTC",
		utcOffsetMinutes: 0
	} };
}
function apiHeaders(clientKey, visitorData) {
	const c = INNERTUBE_CLIENTS[clientKey];
	const origin = `https://www.youtube.com`;
	const headers = {
		"x-youtube-client-name": String(c.clientNameNumber),
		"x-youtube-client-version": c.clientVersion,
		origin,
		referer: origin,
		"content-type": "application/json"
	};
	if (c.userAgent) headers["user-agent"] = c.userAgent;
	if (visitorData) headers["x-goog-visitor-id"] = visitorData;
	return headers;
}
//#endregion
//#region node_modules/ytdlp-typescript/dist/extractor/youtube/sig.js
var playerCache = /* @__PURE__ */ new Map();
var PlayerRuntime = class PlayerRuntime {
	playerUrl;
	js;
	constructor(playerUrl, js) {
		this.playerUrl = playerUrl;
		this.js = js;
	}
	static async load(client, playerUrl) {
		const cached = playerCache.get(playerUrl);
		if (cached) return cached;
		const js = await (await client.request(new URL(playerUrl, "https://www.youtube.com").toString(), { retries: 2 })).text();
		const rt = new PlayerRuntime(playerUrl, js);
		playerCache.set(playerUrl, rt);
		return rt;
	}
	extractSignatureTimestamp() {
		const m = /(?:signatureTimestamp|sts)\s*:\s*(\d{5})/.exec(this.js) ?? /"sts"\s*:\s*(\d{5})/.exec(this.js);
		return m ? parseInt(m[1], 10) : null;
	}
	solveNsig(challenge) {
		const fnName = this.findNsigFunctionName();
		if (!fnName) return null;
		const ctx = createPlayerContext();
		try {
			new Script(this.js).runInContext(ctx, { timeout: 5e3 });
			new Script(`globalThis.__out__ = ${fnName}(${JSON.stringify(challenge)})`).runInContext(ctx, { timeout: 5e3 });
			const out = ctx.__out__;
			return typeof out === "string" ? out : null;
		} catch {
			return this.tryNsigIsolated(challenge);
		}
	}
	solveSignature(input) {
		const recipe = this.findSigRecipe();
		if (!recipe) return null;
		const ctx = createContext({});
		try {
			new Script(recipe).runInContext(ctx);
			const out = new Script(`sigfun(${JSON.stringify(input)})`).runInContext(ctx, { timeout: 2e3 });
			return typeof out === "string" ? out : null;
		} catch {
			return null;
		}
	}
	findNsigFunctionName() {
		for (const re of [/([\w$]+)\s*=\s*function\(\s*[\w$]+\s*\)\s*\{[^{}]{0,300}?["']enhanced_except_[^"']*["']/, /function\s+([\w$]+)\s*\(\s*[\w$]+\s*\)\s*\{[\s\S]{0,600}?enhanced_except_/]) {
			const m = re.exec(this.js);
			if (m?.[1]) return m[1];
		}
		const varDecl = /\b(?:var|let|const)?\s*([\w$]+)\s*=\s*\[\s*\]\s*\.\s*concat[\s\S]{0,80}?\(a\)\.join\(""\)[\s\S]{0,400}?catch\(/.exec(this.js);
		if (varDecl?.[1]) return varDecl[1];
		const b = /&&\(\s*b\s*=\s*([\w$]{1,5})\s*\(\s*([\w$]+)\s*\)/.exec(this.js)?.[1];
		if (b && new RegExp(`function ${b.replace(/\$/g, "\\$")}`).test(this.js)) return b;
		return null;
	}
	tryNsigIsolated(challenge) {
		const idx = this.js.indexOf("enhanced_except_");
		if (idx === -1) return null;
		const start = Math.max(0, this.js.lastIndexOf("function", idx));
		if (start === -1) return null;
		let depth = 0;
		let end = -1;
		let inStr = false;
		let quote = "";
		for (let i = start; i < this.js.length; i++) {
			const ch = this.js[i];
			if (inStr) {
				if (ch === quote) inStr = false;
				continue;
			}
			if (ch === "\"" || ch === "'") {
				inStr = true;
				quote = ch;
			} else if (ch === "{") depth++;
			else if (ch === "}") {
				depth--;
				if (depth === 0) {
					end = i + 1;
					break;
				}
			}
		}
		if (end === -1) return null;
		const fnSrc = this.js.slice(start, end);
		const fnName = (/^function\s+([\w$]+)/.exec(fnSrc) ?? /^([\w$]+)\s*=\s*function/.exec(fnSrc.trim()))?.[1];
		if (!fnName) return null;
		const ctx = createContext({
			window: {},
			document: {
				createElement: () => ({ style: {} }),
				getElementById: () => null
			},
			navigator: { userAgent: "Mozilla/5.0" },
			location: {
				href: "https://www.youtube.com/",
				protocol: "https:"
			},
			atob,
			btoa,
			console: {
				log: () => {},
				warn: () => {},
				error: () => {}
			},
			Math,
			Date,
			JSON,
			Array,
			Object,
			String,
			Number
		});
		try {
			new Script(`${fnSrc}; globalThis.__out__ = ${fnName}(${JSON.stringify(challenge)});`).runInContext(ctx, { timeout: 5e3 });
			const out = ctx.__out__;
			return typeof out === "string" ? out : null;
		} catch {
			return null;
		}
	}
	findSigRecipe() {
		const m = /([$\w]+)\s*=\s*function\(\s*(\w+)\s*\)\s*\{\s*\2\s*=\s*\2\.split\(\s*""\s*\);([\s\S]*?)return \2\.join\(\s*""\s*\)/.exec(this.js);
		if (!m) return null;
		const objMatch = /(?:var|let|const|,\s*)([$\w]+)\s*=\s*\{[\s\S]*?\}(?:;|,)/g;
		let helperBlock = "";
		let searchIdx = Math.max(0, m.index - 3e3);
		const region = this.js.slice(searchIdx, m.index + m[0].length + 1e3);
		const helperNames = [...region.matchAll(/([$][\w]+|\w+)\s*[.(]/g)].map((x) => x[1]);
		const seenHelpers = /* @__PURE__ */ new Set();
		for (const om of region.matchAll(objMatch)) {
			const name = om[1];
			if (!seenHelpers.has(name) && helperNames.includes(name)) seenHelpers.add(name);
		}
		const helperObj = /(?:var |let |const |,\s*)([$\w]+\s*=\s*\{\s*[\w$]+\s*:\s*function[\s\S]*?\n\})/.exec(region);
		if (helperObj) helperBlock = `var ${helperObj[1]};`;
		else if (seenHelpers.size) for (const name of seenHelpers) {
			const dm = new RegExp(`(?:var |let |const )?${name.replace(/\$/g, "\\$")}\\s*=\\s*\\{`, "").exec(this.js);
			if (dm) {
				const objStart = this.js.indexOf("{", dm.index);
				let d = 0;
				for (let i = objStart; i < this.js.length; i++) if (this.js[i] === "{") d++;
				else if (this.js[i] === "}") {
					d--;
					if (d === 0) {
						helperBlock += `var ${name}=${this.js.slice(objStart, i + 1)};\n`;
						break;
					}
				}
			}
		}
		const funName = m[1];
		return `${helperBlock}\nvar sigfun=${funName};`;
	}
};
function createPlayerContext() {
	const noop = () => {};
	const elStub = () => ({
		style: {},
		setAttribute: noop,
		appendChild: noop,
		removeChild: noop,
		addEventListener: noop,
		attachShadow: () => ({ appendChild: noop }),
		innerHTML: "",
		textContent: "",
		contentWindow: null,
		contentDocument: null
	});
	return createContext({
		window: {},
		self: {},
		globalThis: {},
		document: {
			createElement: elStub,
			createTextNode: () => ({}),
			getElementById: () => null,
			querySelector: () => null,
			querySelectorAll: () => [],
			documentElement: elStub(),
			head: elStub(),
			body: elStub(),
			cookie: "",
			visibilityState: "visible",
			addEventListener: noop,
			readyState: "complete"
		},
		location: {
			href: "https://www.youtube.com/",
			protocol: "https:",
			host: "www.youtube.com",
			hostname: "www.youtube.com",
			origin: "https://www.youtube.com",
			pathname: "/watch",
			search: "",
			hash: ""
		},
		navigator: {
			userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
			platform: "Win32",
			language: "en-US",
			languages: ["en-US"]
		},
		history: {
			pushState: noop,
			replaceState: noop
		},
		localStorage: (() => {
			const store = /* @__PURE__ */ new Map();
			return {
				getItem: (k) => store.get(k) ?? null,
				setItem: (k, v) => store.set(k, v),
				removeItem: (k) => store.delete(k),
				clear: () => store.clear()
			};
		})(),
		sessionStorage: (() => {
			const store = /* @__PURE__ */ new Map();
			return {
				getItem: (k) => store.get(k) ?? null,
				setItem: (k, v) => store.set(k, v),
				removeItem: (k) => store.delete(k),
				clear: () => store.clear()
			};
		})(),
		setInterval: () => 0,
		clearInterval: noop,
		setTimeout: () => 0,
		clearTimeout: noop,
		requestAnimationFrame: () => 0,
		cancelAnimationFrame: noop,
		alert: noop,
		confirm: () => false,
		prompt: () => null,
		fetch: () => Promise.reject(/* @__PURE__ */ new Error("fetch disabled")),
		XMLHttpRequest: function() {},
		atob,
		btoa,
		crypto: { subtle: {} },
		performance: { now: () => Date.now() },
		screen: {
			width: 1920,
			height: 1080
		},
		console: {
			log: noop,
			warn: noop,
			error: noop,
			info: noop,
			debug: noop,
			trace: noop
		},
		addEventListener: noop,
		removeEventListener: noop,
		dispatchEvent: () => true,
		devicePixelRatio: 1,
		innerWidth: 1920,
		innerHeight: 1080,
		outerWidth: 1920,
		outerHeight: 1080
	});
}
//#endregion
//#region node_modules/ytdlp-typescript/dist/extractor/youtube/index.js
var VALID_URL$2 = /^https?:\/\/(?:(?:www|m|music|youtube)\.)?(?:youtube\.com\/(?:(?:watch\?(?:[^#]*&)?v=|(?:embed|v|shorts)\/)|live\/)|youtu\.be\/)(?<id>[\w-]{11})/i;
var YouTube = class extends InfoExtractor {
	get validUrlPatterns() {
		return [VALID_URL$2];
	}
	async realExtract(url) {
		const videoId = this.matchId(url);
		const poToken = this.ctx.poToken;
		let webpage = null;
		let ytcfg = {};
		let initialPr = null;
		try {
			webpage = await this.downloadWebpage(`https://www.youtube.com/watch?v=${videoId}&bpctr=9999999999&has_verified=1`, {
				note: "Downloading webpage",
				headers: {
					"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
					"accept-language": "en-US,en;q=0.9"
				},
				retries: 1
			});
			ytcfg = extractYtcfg(webpage) ?? {};
			initialPr = extractInitialPlayerResponse(webpage);
		} catch {
			webpage = null;
		}
		let visitorData = strOrNone(ytcfg?.["VISITOR_DATA"]) ?? strOrNone(traverseObj(initialPr, "responseContext.visitorData"));
		this.ytcfgSts = intOrNone(ytcfg?.["STS"]);
		const results = [];
		if (initialPr && traverseObj(initialPr, "videoDetails.videoId") === videoId && (initialPr["playabilityStatus"]?.["status"] ?? "") === "OK") results.push({
			pr: initialPr,
			client: "web",
			playerUrl: null
		});
		for (const clientKey of DEFAULT_CLIENT_ORDER) {
			if (results.some((r) => hasFormats(r.pr))) break;
			try {
				const result = await this.fetchPlayerResponse(clientKey, videoId, visitorData, poToken?.player);
				visitorData = visitorData ?? result.visitorData;
				if (result.pr && (result.pr["playabilityStatus"]?.["status"] ?? "") !== "OK") continue;
				if (result.pr) results.push({
					pr: result.pr,
					client: clientKey,
					playerUrl: ytcfg?.["PLAYER_JS_URL"] ?? null
				});
			} catch {
				continue;
			}
		}
		if (!results.length) throw new Error(`Unable to extract player responses for ${videoId}`);
		const playerUrl = strOrNone(ytcfg?.["PLAYER_JS_URL"]) ?? findPlayerUrlInHtml(webpage) ?? await this.downloadPlayerUrl(videoId);
		let solver = null;
		if (playerUrl) try {
			solver = await PlayerRuntime.load(this.client, playerUrl);
		} catch {
			solver = null;
		}
		return this.processVideo(videoId, results, solver, webpage);
	}
	async fetchPlayerResponse(clientKey, videoId, visitorData, playerPot) {
		const c = INNERTUBE_CLIENTS[clientKey];
		const body = {
			context: buildInnertubeContext(clientKey),
			videoId,
			contentCheckOk: true,
			racyCheckOk: true
		};
		if (playerPot) body["serviceIntegrityDimensions"] = { poToken: playerPot };
		if (c.requireJsPlayer && this.ytcfgSts) body["playbackContext"] = { contentPlaybackContext: {
			signatureTimestamp: this.ytcfgSts,
			html5Preference: "HTML5_PREF_WANTS"
		} };
		const headers = apiHeaders(clientKey, visitorData);
		const pr = await (await this.client.request(`https://www.youtube.com/youtubei/v1/player?prettyPrint=false`, {
			method: "POST",
			body: JSON.stringify(body),
			headers,
			retries: 1,
			expectedStatus: [200]
		})).json();
		return {
			pr,
			visitorData: strOrNone(traverseObj(pr, "responseContext.visitorData"))
		};
	}
	currentSolver = null;
	ytcfgSts = null;
	async downloadPlayerUrl(videoId) {
		try {
			const iframe = await this.downloadWebpage(`https://www.youtube.com/embed/${videoId}`, {
				note: "Downloading iframe",
				retries: 1
			});
			return (/"PLAYER_JS_URL"\s*:\s*"([^"]+)"/.exec(iframe) ?? /<script[^>]+src=["'](\/s\/player\/[^"']+\.js)["']/.exec(iframe))?.[1] ?? null;
		} catch {
			return null;
		}
	}
	processVideo(videoId, results, solver, webpage) {
		this.currentSolver = solver;
		const formats = [];
		const subtitles = {};
		const automaticCaptions = {};
		const seenItags = /* @__PURE__ */ new Set();
		let bestInfo = null;
		for (const { pr, client } of results) {
			const streamingData = pr["streamingData"];
			if (!streamingData) continue;
			const gvsPot = this.ctx.poToken?.gvs;
			for (const fmtStream of [...streamingData["formats"] ?? [], ...streamingData["adaptiveFormats"] ?? []]) {
				const itag = strOrNone(fmtStream["itag"]);
				if (!itag || seenItags.has(itag)) continue;
				if (fmtStream["type"] === "FORMAT_STREAM_TYPE_OTF") continue;
				if (fmtStream["drmFamilies"]) continue;
				let fmtUrl = strOrNone(fmtStream["url"]);
				let encryptedSig = null;
				if (!fmtUrl && fmtStream["signatureCipher"]) {
					const sc = parseQs(fmtStream["signatureCipher"]);
					fmtUrl = urlOrNoneStr(sc["url"]);
					encryptedSig = sc["s"] ?? null;
				}
				if (!fmtUrl) continue;
				if (encryptedSig) {
					if (!solver) continue;
					const solved = solver.solveSignature(encryptedSig);
					if (!solved) continue;
					const sp = parseQs(fmtStream["signatureCipher"])["sp"] ?? "signature";
					fmtUrl = `${fmtUrl}&${sp}=${encodeURIComponent(solved)}`;
				}
				const nMatch = /[?&]n=([^&]+)/.exec(fmtUrl);
				if (nMatch && solver) {
					const nsig = solver.solveNsig(decodeURIComponentSafe(nMatch[1]));
					if (nsig) fmtUrl = updateUrlQuery(fmtUrl, { n: nsig });
				}
				if (gvsPot) fmtUrl = updateUrlQuery(fmtUrl, { pot: gvsPot });
				const mimeMatch = /((?:[\w-]+)\/(?:[\w.-]+))(?:;\s*codecs="([^"]+)")?/.exec(fmtStream["mimeType"] ?? "");
				const ext = mimeMatch ? mimetype2ext(mimeMatch[1]) : "mp4";
				const codecs = mimeMatch?.[2]?.split(", ").map((x) => x.trim()) ?? [];
				const vcodec = codecs.find((c) => /^(avc|hev|hvc|vp09|vp8|av01)/i.test(c)) ?? null;
				const acodec = codecs.find((c) => /^(mp4a|opus|ac-3|ec-3|flac|vorbis)/i.test(c)) ?? null;
				const audioOnly = !vcodec && !!acodec;
				if (INNERTUBE_CLIENTS[client]?.gvsPotRequiredHttps && audioOnly === false && !gvsPot) continue;
				formats.push({
					format_id: itag,
					url: fmtUrl,
					ext: audioOnly ? ext === "mp4" ? "m4a" : ext : ext ?? "mp4",
					protocol: "https",
					width: intOrNone(fmtStream["width"]),
					height: intOrNone(fmtStream["height"]),
					fps: intOrNone(fmtStream["fps"]),
					vcodec: vcodec ?? (audioOnly ? "none" : "unknown"),
					acodec: acodec ?? (audioOnly ? "unknown" : "none"),
					abr: audioOnly ? floatOrNone(fmtStream["averageBitrate"] ?? fmtStream["bitrate"], 1 / 1e3) : null,
					tbr: floatOrNone(fmtStream["averageBitrate"] ?? fmtStream["bitrate"], 1 / 1e3),
					asr: intOrNone(fmtStream["audioSampleRate"]),
					filesize: intOrNone(fmtStream["contentLength"]),
					language: strOrNone(fmtStream?.["audioTrack"]?.["id"]?.split(".")[0]),
					format_note: strOrNone(fmtStream["qualityLabel"]) ?? void 0,
					http_headers: { referer: `https://www.youtube.com/watch?v=${videoId}` }
				});
				seenItags.add(itag);
			}
			if (streamingData["hlsManifestUrl"]) {
				const hlsUrl = streamingData["hlsManifestUrl"];
				formats.push({
					format_id: "hls_me",
					url: gvsPot ? updateUrlQuery(hlsUrl, { pot: gvsPot }) : hlsUrl,
					protocol: "m3u8_native",
					ext: "mp4",
					format_note: "HLS",
					__pending_fragments: true,
					http_headers: { referer: `https://www.youtube.com/watch?v=${videoId}` }
				});
			}
			if (streamingData["dashManifestUrl"]) formats.push({
				format_id: "dash_me",
				url: streamingData["dashManifestUrl"],
				protocol: "http_dash_segments",
				ext: "mp4",
				manifest_url: streamingData["dashManifestUrl"],
				http_headers: { referer: `https://www.youtube.com/watch?v=${videoId}` }
			});
			extractCaptions(pr, subtitles, automaticCaptions);
			if (!bestInfo || !bestInfo["videoDetails"]) bestInfo = pr;
		}
		const detailsPr = results.find((r) => r.pr["videoDetails"])?.pr ?? results[0].pr;
		const vd = detailsPr["videoDetails"] ?? {};
		const micro = traverseObj(detailsPr, "microformat.playerMicroformatRenderer") ?? {};
		const durationSeconds = intOrNone(vd["lengthSeconds"]) ?? Math.round(floatOrNone(micro?.["lengthSeconds"], 1) ?? 0) ?? null;
		const thumbnails = (vd["thumbnail"]?.["thumbnails"] ?? []).map((t, i) => ({
			id: String(i),
			url: t["url"],
			width: intOrNone(t["width"]),
			height: intOrNone(t["height"])
		}));
		const isLive = vd["isLiveContent"] === true && detailsPr["playabilityStatus"]?.["status"] === "OK";
		return this.videoResult({
			id: videoId,
			title: strOrNone(vd["title"]) ?? strOrNone(micro?.["title"]?.["simpleText"]) ?? `YouTube video #${videoId}`,
			description: strOrNone(vd["shortDescription"]) ?? strOrNone(micro?.["description"]?.["simpleText"]),
			duration: durationSeconds,
			uploader: strOrNone(vd["author"]),
			channel: strOrNone(vd["author"]),
			channel_id: strOrNone(vd["channelId"]),
			uploader_id: strOrNone(vd["channelId"]),
			uploader_url: vd["channelId"] ? `https://www.youtube.com/channel/${vd["channelId"]}` : void 0,
			view_count: intOrNone(vd["viewCount"]) ?? intOrNone(micro?.["viewCount"]),
			average_rating: floatOrNone(vd["averageRating"]),
			timestamp: micro?.["timestamp"] != null ? Number(micro["timestamp"]) : parseDateStr(strOrNone(micro?.["publishDate"])),
			upload_date: toUploadDate(strOrNone(micro?.["uploadDate"]) ?? strOrNone(micro?.["publishDate"])),
			live_status: isLive ? "is_live" : "not_live",
			is_live: isLive,
			thumbnail: thumbnails.at(-1)?.url ?? null,
			thumbnails,
			webpage_url: `https://www.youtube.com/watch?v=${videoId}`,
			categories: Array.isArray(micro?.["category"]) ? micro["category"] : void 0,
			tags: Array.isArray(vd["keywords"]) ? vd["keywords"] : void 0,
			formats,
			subtitles: Object.keys(subtitles).length ? subtitles : void 0,
			automatic_captions: Object.keys(automaticCaptions).length ? automaticCaptions : void 0,
			http_headers: { referer: `https://www.youtube.com/watch?v=${videoId}` }
		});
	}
};
function hasFormats(pr) {
	const sd = pr?.["streamingData"];
	if (!sd) return false;
	return [...sd["formats"] ?? [], ...sd["adaptiveFormats"] ?? []].some((f) => f["url"]) || !!sd["hlsManifestUrl"];
}
function extractYtcfg(webpage) {
	const m = /ytcfg\.set\s*\(\s*/.exec(webpage);
	if (!m) return null;
	const tail = webpage.slice(m.index + m[0].length);
	try {
		return JSON.parse(scanBalanced(tail));
	} catch {
		return null;
	}
}
function extractInitialPlayerResponse(webpage) {
	const m = /ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;\s*(?:var|const|let|\}|if|\()/.exec(webpage) ?? /ytInitialPlayerResponse\s*=\s*(\{.+?\});/.exec(webpage);
	if (!m) return null;
	try {
		return JSON.parse(scanBalanced(m[1]));
	} catch {
		return null;
	}
}
function findPlayerUrlInHtml(webpage) {
	if (!webpage) return null;
	return /"PLAYER_JS_URL"\s*:\s*"([^"]+)"/.exec(webpage)?.[1] ?? /<script[^>]+src="(\/s\/player\/[^"]+\.js)"/.exec(webpage)?.[1] ?? null;
}
function extractCaptions(pr, subtitles, automaticCaptions) {
	const tracks = traverseObj(pr, "captions.playerCaptionsTracklistRenderer.captionTracks");
	if (!Array.isArray(tracks)) return;
	for (const track of tracks) {
		const langCode = strOrNone(track["languageCode"]);
		const baseUrl = urlOrNoneStr(track["baseUrl"]);
		if (!langCode || !baseUrl) continue;
		const target = (track["kind"] === "asr" ? "auto" : "manual") === "auto" ? automaticCaptions : subtitles;
		(target[langCode] ??= []).push({
			ext: "vtt",
			url: `${baseUrl}&fmt=vtt`,
			name: strOrNone(track?.["name"]?.["simpleText"] ?? track?.["name"]?.["runs"]?.[0]?.["text"]) ?? langCode
		});
	}
}
function parseQs(qs) {
	const out = {};
	for (const pair of qs.replace(/^\?/, "").split("&")) {
		const eq = pair.indexOf("=");
		if (eq === -1) continue;
		out[pair.slice(0, eq)] = decodeURIComponentSafe(pair.slice(eq + 1));
	}
	return out;
}
function decodeURIComponentSafe(s) {
	try {
		return decodeURIComponent(s);
	} catch {
		return s;
	}
}
function urlOrNoneStr(v) {
	const s = strOrNone(v);
	if (!s) return null;
	return /^https?:\/\//i.test(s) || s.startsWith("//") ? s : null;
}
function mimetype2ext(mime) {
	const m = mime.split(";")[0].trim().toLowerCase();
	const type = m.split("/")[0];
	const sub = m.split("/")[1]?.split("+")[0];
	if (sub === "mpegurl") return "mp4";
	if (type === "audio") return sub === "mp4" ? "m4a" : sub ?? "mp4";
	if (type === "video") return sub === "webm" ? "webm" : "mp4";
	return "mp4";
}
function parseDateStr(s) {
	if (!s) return null;
	const ts = Date.parse(s);
	return Number.isNaN(ts) ? null : Math.floor(ts / 1e3);
}
function toUploadDate(s) {
	if (!s) return void 0;
	const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
	return m ? `${m[1]}${m[2]}${m[3]}` : void 0;
}
//#endregion
//#region node_modules/ytdlp-typescript/dist/extractor/vk-core.js
var VIDEOID_URL = /^https?:\/\/(?:(?:m|new|vksport)\.)?(?:vk\.com|vk\.ru|vkvideo\.ru)\/(?:.+?\?.*?z=)?(?:video|clip)(?<videoid>-?\d+_\d+)(?:.*?\blist=(?<list_id>[\da-f]+|ln-[\da-zA-Z]+))?/i;
var EMBED_URL = /^https?:\/\/(?:(?:m|new|vksport)\.)?(?:vk\.com|vk\.ru|vkvideo\.ru)\/video_ext\.php\?(?<embed_query>.*)/i;
var VK = class extends InfoExtractor {
	get validUrlPatterns() {
		return [VIDEOID_URL, EMBED_URL];
	}
	async requestWithChallenge(url, opts = {}) {
		let res = await this.client.request(url, {
			...opts,
			retries: 1
		});
		const parsed = safeUrl(res.url);
		if (!parsed || parsed.pathname !== "/challenge.html") return {
			res,
			text: await res.text()
		};
		const challengeBody = await res.text();
		const challengeHash = parsed.searchParams.get("hash429");
		const saltMatch = /var\s+salt\s*=\s*\(\s*function\s*\(\)\s*(\{[\s\S]+?\})\s*\)\(\);\s*var\s+hash/.exec(challengeBody);
		if (!challengeHash || !saltMatch) throw new Error("Received VK JS challenge but could not parse it");
		const salt = evalSaltFunction(saltMatch[1]);
		const key = createHash("md5").update(`${challengeHash}:${salt}`).digest("hex");
		await this.client.request(updateUrlQuery(res.url, { key }), { retries: 1 });
		res = await this.client.request(url, {
			...opts,
			retries: 1
		});
		return {
			res,
			text: await res.text()
		};
	}
	async downloadPayload(path, videoId, data) {
		const endpoint = `https://vk.com/${path}.php`;
		const form = { al: "1" };
		for (const [k, v] of Object.entries(data)) form[k] = String(v);
		const body = new URLSearchParams(form).toString();
		const payload = (await (await this.client.request(endpoint, {
			method: "POST",
			body,
			headers: {
				referer: endpoint,
				"x-requested-with": "XMLHttpRequest",
				"content-type": "application/x-www-form-urlencoded"
			},
			expectedStatus: [200],
			retries: 1
		})).json())?.payload;
		if (!Array.isArray(payload)) throw new Error("Invalid VK API payload");
		const code = strOrNone(payload[0]);
		if (code === "3") this.raiseLoginRequired();
		if (code === "8") {
			const raw = typeof payload[1] === "string" ? payload[1] : "";
			const msg = raw.length > 2 ? raw.slice(1, -1) : "Unknown error";
			throw new Error(decodeHtmlEntities(msg));
		}
		return payload;
	}
	async realExtract(url) {
		await this.fetchVideoPage(url);
		throw new Error("not implemented");
	}
	async fetchVideoPage(url) {
		const vidMatch = VIDEOID_URL.exec(url);
		if (vidMatch) {
			const videoId = vidMatch.groups["videoid"];
			const data = {
				act: "show",
				video: videoId
			};
			const listId = vidMatch.groups["list_id"];
			if (listId) data["list"] = listId;
			const payload = await this.downloadPayload("al_video", videoId, data);
			let infoPage = "";
			let mvData = {};
			let player = {};
			const visit = (node) => {
				if (!node || typeof node !== "object") return;
				if (Array.isArray(node)) {
					node.forEach(visit);
					return;
				}
				const obj = node;
				if (typeof obj["mvData"] === "object" && obj["mvData"] !== null && !mvData) mvData = obj["mvData"];
				if (typeof obj["player"] === "object" && obj["player"] !== null && !Object.keys(player).length) player = obj["player"];
				for (const v of Object.values(obj)) visit(v);
			};
			for (const element of payload) if (typeof element === "string" && element.length > 500 && !infoPage) infoPage = element;
			else visit(element);
			return {
				videoId,
				infoPage,
				mvData,
				player
			};
		}
		const embedMatch = EMBED_URL.exec(url);
		if (!embedMatch) throw new Error(`Unsupported VK URL: ${url}`);
		const query = embedMatch.groups["embed_query"];
		const { text } = await this.requestWithChallenge(`https://vk.com/video_ext.php?${query}`, { headers: { referer: "https://vk.com/" } });
		const oid = /\boid=(-?\d+)/.exec(query)?.[1];
		const vid = /\bid=(\d+)/.exec(query)?.[1];
		const videoId = oid && vid ? `${oid}_${vid}` : query.slice(0, 40);
		checkEmbedErrors(text, videoId);
		const pm = /var\s+playerParams\s*=\s*(\{[\s\S]+?\})\s*;\s*\n/.exec(text);
		if (!pm) return {
			videoId,
			infoPage: text,
			mvData: {},
			player: {}
		};
		return {
			videoId,
			infoPage: text,
			mvData: {},
			player: JSON.parse(scanJsObject(pm[1]))
		};
	}
	buildFormats(player, videoId) {
		return buildFormatsFromParams.call(this, player, videoId);
	}
};
function safeUrl(u) {
	try {
		return new URL(u);
	} catch {
		return null;
	}
}
function normalizeProto(u) {
	return u.startsWith("//") ? `https:${u}` : u;
}
function evalSaltFunction(body) {
	const ctx = createContext({});
	new Script(`globalThis.__out__ = (function() ${body})();`).runInContext(ctx, { timeout: 3e3 });
	const out = ctx.__out__;
	if (typeof out !== "string") throw new Error("VK salt function returned non-string");
	return out;
}
function checkEmbedErrors(html, videoId) {
	const errorMessage = /<!><div[^>]+class="video_layer_message"[^>]*>([\s\S]+?)<\/div>/.exec(html)?.[1] ?? /<div[^>]+id="video_ext_msg"[^>]*>([\s\S]+?)<\/div>/.exec(html)?.[1];
	if (errorMessage) throw new Error(decodeHtmlEntities(errorMessage.replace(/<[^>]+>/g, "")));
	if (/<!>\/login\.php\?.*\bact=security_check/.test(html)) throw new Error("You are trying to log in from an unusual location. Confirm ownership at vk.com first.");
	for (const [re, msg] of [
		[/<!>Please log in or </, "Video is only available for registered users"],
		[/<!>Unknown error/, "Video does not exist"],
		[/<!>Видео временно недоступно/, "Video is temporarily unavailable"],
		[/<!>Access denied/, "Access denied to video"],
		[/was removed from public access/, "Video was removed due to copyright complaint"],
		[/изъята из публичного доступа/, "Video was removed due to copyright complaint"],
		[/no longer available, because it has been deleted/, "Video has been deleted"],
		[/is not available in your region/, "Video is not available in your region"]
	]) if (re.test(html)) throw new Error(`${msg}: ${videoId}`);
}
function scanJsObject(src) {
	let depth = 0;
	let inStr = false;
	let quote = "";
	for (let i = 0; i < src.length; i++) {
		const ch = src[i];
		if (inStr) {
			if (ch === "\\") i++;
			else if (ch === quote) inStr = false;
			continue;
		}
		if (ch === "\"" || ch === "'") {
			inStr = true;
			quote = ch;
		} else if (ch === "{") depth++;
		else if (ch === "}") {
			depth--;
			if (depth === 0) return src.slice(0, i + 1);
		}
	}
	return src;
}
async function buildFormatsFromParams(player, videoId) {
	const paramsList = player?.["params"];
	if (!Array.isArray(paramsList) || !paramsList.length) return [];
	const data = paramsList[0];
	const formats = [];
	for (const [formatId, rawUrl] of Object.entries(data)) {
		const formatUrl = urlOrNone(rawUrl);
		if (!formatUrl || !/^(https?:)?\/\//.test(formatUrl)) continue;
		if (/^(url|cache)\d+$/.test(formatId)) formats.push({
			format_id: formatId,
			url: normalizeProto(formatUrl),
			ext: "mp4",
			protocol: "https",
			height: intOrNone(/^(?:url|cache)(\d+)/.exec(formatId)?.[1]),
			source_preference: 1,
			http_headers: { referer: "https://vk.com/" }
		});
		else if (formatId.startsWith("hls") && formatId !== "hls_live_playback") {
			const hls = await this.extractM3u8Formats(normalizeProto(formatUrl), videoId, false);
			for (const f of hls) f.format_id = `${formatId}-${f.format_id ?? ""}`;
			formats.push(...hls);
		} else if (formatId.startsWith("dash") && !["dash_live_playback", "dash_uni"].includes(formatId)) {
			const dash = await this.extractMpdFormats(normalizeProto(formatUrl), videoId, false);
			for (const f of dash) f.format_id = `${formatId}-${f.format_id ?? ""}`;
			formats.push(...dash);
		}
	}
	return formats;
}
//#endregion
//#region node_modules/ytdlp-typescript/dist/extractor/vk.js
var YT_URL_RE = /(?:https?:)?\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/)|youtu\.be\/)([\w-]{11})/i;
var VKVideo = class extends VK {
	async realExtract(url) {
		const { videoId, infoPage, mvData, player } = await this.fetchVideoPage(url);
		const external = findExternalEmbed(infoPage);
		if (external) return delegate.call(this, external);
		const paramsList = player?.["params"];
		if (!Array.isArray(paramsList) || !paramsList.length) {
			if (/<!>Unknown error/.test(infoPage)) throw new Error(`Video ${videoId} does not exist`);
			this.raiseNoFormats(videoId);
		}
		const data = paramsList[0];
		const formats = await this.buildFormats(player, videoId);
		if (!formats.length) this.raiseNoFormats(videoId);
		const subtitles = {};
		for (const sub of data["subs"] ?? []) {
			const subUrl = urlOrNone(sub?.["url"]);
			if (!subUrl) continue;
			const lang = strOrNone(sub["lang"]) ?? "en";
			const ext = (strOrNone(sub["title"]) ?? ".srt").split(".").at(-1) ?? "srt";
			(subtitles[lang] ??= []).push({
				ext,
				url: subUrl
			});
		}
		const dateText = /class=["']mv_info_date[^>]+>([^<]+)(?:<|from)/.exec(infoPage)?.[1];
		const viewsText = /class=["']mv_views_count[^>]+>\s*([\d.,]+)/.exec(infoPage)?.[1];
		const isLive = data["live"] === 2;
		return this.videoResult({
			id: videoId,
			title: decode(strOrNone(data["md_title"])) || decode(strOrNone(mvData["title"])) || `VK video ${videoId}`,
			description: decode(strOrNone(data["description"])) || decode(strOrNone(mvData["desc"])) || void 0,
			thumbnail: urlOrNone(data["jpg"]),
			uploader: decode(strOrNone(data["md_author"])) || void 0,
			uploader_id: strOrNone(data["author_id"] ?? data["authorId"]) ?? void 0,
			duration: intOrNone(data["duration"]) ?? intOrNone(mvData["duration"]) ?? void 0,
			timestamp: intOrNone(data["date"]) ?? parseRuDate(dateText) ?? void 0,
			view_count: looseCount(viewsText) ?? void 0,
			like_count: intOrNone(mvData["likes"]) ?? void 0,
			comment_count: intOrNone(mvData["commcount"]) ?? void 0,
			chapters: buildChapters(data["time_codes"]),
			is_live: isLive,
			live_status: isLive ? "is_live" : "not_live",
			webpage_url: `https://vk.com/video${videoId}`,
			formats,
			subtitles: Object.keys(subtitles).length ? subtitles : void 0,
			http_headers: { referer: "https://vk.com/" }
		});
	}
};
function findExternalEmbed(html) {
	const yt = YT_URL_RE.exec(html);
	if (yt?.[1]) return `https://www.youtube.com/watch?v=${yt[1]}`;
	const rutube = /\ssrc="((?:https?:)?\/\/rutube\.ru\\?\/(?:video|play)\\?\/embed(?:.*?))\\?"/.exec(html);
	if (rutube?.[1]) return normalizeProto(rutube[1].replace(/\\/g, ""));
	return null;
}
async function delegate(externalUrl) {
	const { getExtractorFor } = await Promise.resolve().then(() => extractor_exports);
	const ie = getExtractorFor(externalUrl);
	if (ie && !(ie instanceof VK)) {
		ie.attach(this.ctx);
		return ie.extract(externalUrl);
	}
	this.raiseNoFormats(void 0, `VK video embeds external content (${externalUrl}) which needs a dedicated extractor`);
}
function decode(s) {
	if (!s) return null;
	const d = s.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d2) => String.fromCodePoint(parseInt(d2, 10))).replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/<[^>]+>/g, "").trim();
	return d === "" ? null : d;
}
function parseRuDate(text) {
	if (!text) return null;
	const months = {
		"января": 0,
		"февраля": 1,
		"марта": 2,
		"апреля": 3,
		"мая": 4,
		"июня": 5,
		"июля": 6,
		"августа": 7,
		"сентября": 8,
		"октября": 9,
		"ноября": 10,
		"декабря": 11
	};
	const m = /(\d{1,2})\s+([а-яё]+)\s+(\d{4})(?:\s+в\s+(\d{1,2}):(\d{2}))?/i.exec(text) ?? null;
	if (!m) return null;
	const month = months[m[2].toLowerCase()];
	if (month == null) return null;
	const d = new Date(Date.UTC(+m[3], month, +m[1], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0));
	const ts = Math.floor(d.getTime() / 1e3);
	return Number.isNaN(ts) ? null : ts;
}
function looseCount(s) {
	if (!s) return null;
	const normalized = s.replace(/\s/g, "").replace(/,/g, ".");
	const mK = /^([\d.]+)([KMB])$/i.exec(normalized);
	if (mK) {
		const n = parseFloat(mK[1]);
		const mult = {
			K: 1e3,
			M: 1e6,
			B: 1e9
		}[mK[2].toUpperCase()];
		return Math.round(n * mult);
	}
	const n = parseInt(normalized.replace(/\./g, ""), 10);
	return Number.isFinite(n) ? n : null;
}
function buildChapters(timeCodes) {
	if (!Array.isArray(timeCodes)) return void 0;
	const chapters = timeCodes.filter((tc) => Number.isInteger(tc?.["time"])).map((tc) => ({
		start_time: tc["time"],
		end_time: null,
		title: decode(strOrNone(tc["text"])) ?? ""
	}));
	return chapters.length ? chapters : void 0;
}
//#endregion
//#region node_modules/ytdlp-typescript/dist/extractor/telegram.js
var VALID_URL$1 = /^https?:\/\/t\.me\/(?<channel>[^/?#]+)\/(?<id>\d+)/i;
var Telegram = class extends InfoExtractor {
	get validUrlPatterns() {
		return [VALID_URL$1];
	}
	async realExtract(url) {
		const m = this.suitable(url);
		const channel = decodeURIComponent(m.groups["channel"]);
		const msgId = m.groups["id"];
		const embedUrl = updateUrlQuery(url.replace(/^http:/, "https:"), {
			embed: "1",
			single: ""
		});
		const embed = await this.downloadWebpage(embedUrl, {
			note: "Downloading Telegram embed frame",
			retries: 1,
			headers: { referer: "https://t.me/" }
		});
		if (/tgme_widget_message_error/.test(embed)) {
			const err = extractClassText("tgme_widget_message_error", embed);
			throw new Error(decodeHtmlEntities(err ?? "Message unavailable") || "Message unavailable");
		}
		if (!embed.includes("tgme_widget_message_video_player")) this.raiseNoFormats(msgId, "This Telegram post contains no video");
		const description = extractClassText("tgme_widget_message_text", embed)?.replace(/\n+/g, " ").trim() || null;
		const channelName = extractClassText("tgme_widget_message_author", embed)?.replace(/\s+/g, " ").trim() || null;
		const timestamp = parseIsoTime(/<time[^>]*datetime="([^"]*)"/.exec(embed)?.[1] ?? null);
		const videos = parseVideoBlocks(embed);
		let chosen = videos.find((v) => v.id === msgId) ?? videos[0];
		if (!chosen?.videoUrl) this.raiseNoFormats(msgId, "No downloadable video found in Telegram post");
		return this.videoResult({
			id: chosen.id,
			title: description ?? `${channelName ?? channel} ${msgId}`,
			description,
			channel: channelName,
			channel_id: channel,
			uploader: channelName,
			uploader_id: channel,
			timestamp: timestamp ?? void 0,
			duration: chosen.duration ?? void 0,
			thumbnail: chosen.thumbnail,
			webpage_url: `https://t.me/${channel}/${chosen.id}`,
			formats: [{
				format_id: "mp4",
				url: chosen.videoUrl,
				ext: "mp4",
				protocol: "https",
				http_headers: { referer: "https://t.me/" }
			}]
		});
	}
};
function parseVideoBlocks(html) {
	const out = [];
	for (const block of html.matchAll(/<a\s+class="tgme_widget_message_video_player[\s\S]+?<\/time>/g)) {
		const b = block[0];
		const videoUrl = /<video[^>]+src="([^"]+)"/.exec(b)?.[1] ?? null;
		const webpageUrl = /class="tgme_widget_message_video_player[^"]*"[^>]*href="([^"]+)"/.exec(b)?.[1] ?? /<a[^>]+href="(\/[^"]+)"[^>]*class="tgme_widget_message_video_player/.exec(b)?.[1] ?? null;
		if (!videoUrl) continue;
		const durMatch = /<time[^>]+duration[^>]*>([\d:]+)<\/time>/.exec(b)?.[1] ?? null;
		const thumb = /tgme_widget_message_video_thumb"[^>]+background-image:url\('([^']+)'\)/.exec(b)?.[1] ?? null;
		out.push({
			id: webpageUrl?.split("/").filter(Boolean).at(-1) ?? String(out.length),
			videoUrl: decodeHtmlEntities(videoUrl),
			webpageUrl: webpageUrl ? `https://t.me${webpageUrl}` : "",
			duration: durMatch ? hmsToSeconds(durMatch) : null,
			thumbnail: thumb ? decodeHtmlEntities(thumb) : null
		});
	}
	return out;
}
function hmsToSeconds(hms) {
	const parts = hms.split(":").map((p) => parseInt(p, 10));
	if (parts.some((p) => Number.isNaN(p))) return null;
	return parts.reduce((acc, p) => acc * 60 + p, 0);
}
function parseIsoTime(iso) {
	if (!iso) return null;
	const ts = Date.parse(iso);
	return Number.isNaN(ts) ? null : Math.floor(ts / 1e3);
}
function extractClassText(className, html) {
	const raw = new RegExp(`class="[^"]*${className}[^"]*"[^>]*>([\\s\\S]*?)</div>`).exec(html)?.[1];
	if (!raw) return null;
	return decodeHtmlEntities(raw.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")).trim();
}
//#endregion
//#region node_modules/ytdlp-typescript/dist/extractor/bilibili-wbi.js
var MIXIN_KEY_ENC_TAB = [
	46,
	47,
	18,
	2,
	53,
	8,
	23,
	32,
	15,
	50,
	10,
	31,
	58,
	3,
	45,
	35,
	27,
	43,
	5,
	49,
	33,
	9,
	42,
	19,
	29,
	28,
	14,
	39,
	12,
	38,
	41,
	13,
	37,
	48,
	7,
	16,
	24,
	55,
	40,
	61,
	26,
	17,
	0,
	1,
	60,
	51,
	30,
	4,
	22,
	25,
	54,
	21,
	56,
	59,
	6,
	63,
	57,
	62,
	11,
	36,
	20,
	34,
	44,
	52
];
var wbiCache = null;
async function getWbiKey(client, videoId) {
	if (wbiCache && Date.now() / 1e3 < wbiCache.ts + 30) return wbiCache.key;
	const nav = await client.downloadJson("https://api.bilibili.com/x/web-interface/nav", {
		note: "Downloading wbi sign",
		retries: 1
	});
	const imgName = basenameNoExt(traverseObj(nav, "data.wbi_img.img_url"));
	const subName = basenameNoExt(traverseObj(nav, "data.wbi_img.sub_url"));
	const lookup = (imgName ?? "") + (subName ?? "");
	if (lookup.length < 32) throw new Error("Unable to extract wbi keys");
	return cacheKey(MIXIN_KEY_ENC_TAB.slice(0, 32).map((i) => lookup[i]).join(""));
}
function cacheKey(key) {
	if (!wbiCache) wbiCache = {
		key,
		ts: Date.now() / 1e3
	};
	else {
		wbiCache.key = key;
		wbiCache.ts = Date.now() / 1e3;
	}
	return key;
}
function basenameNoExt(url) {
	if (!url) return null;
	return (url.split("/").pop() ?? "").split(".")[0] || null;
}
async function signWbi(client, videoId, params) {
	const key = await getWbiKey(client, videoId);
	const wts = Math.round(Date.now() / 1e3);
	const entries = Object.entries({
		...params,
		wts
	}).map(([k, v]) => [k, String(v).replace(/[!'()*]/g, "")]).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
	const query = new URLSearchParams(entries).toString();
	const wRid = createHash("md5").update(query + key).digest("hex");
	return {
		...Object.fromEntries(entries),
		w_rid: wRid
	};
}
var SCREEN_DIMS = [
	[1920, 1080],
	[1366, 768],
	[1536, 864],
	[1280, 720]
];
function dmParams() {
	const [w, h] = SCREEN_DIMS[Math.floor(Math.random() * SCREEN_DIMS.length)];
	const rnd = Math.floor(114 * Math.random());
	const wh = [
		2 * w + 2 * h + 3 * rnd,
		4 * w - h + rnd,
		rnd
	];
	const r2 = Math.floor(514 * Math.random());
	const of = [
		30 + 3 * r2,
		0 + 2 * r2,
		r2
	];
	return {
		dm_img_list: "[]",
		dm_img_str: randomB64(16 + Math.floor(Math.random() * 48)),
		dm_cover_img_str: randomB64(32 + Math.floor(Math.random() * 96)),
		dm_img_inter: JSON.stringify({
			ds: [],
			wh,
			of
		})
	};
}
function randomB64(len) {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,-./:;<=>?@[]^_`{|}~ ";
	let s = "";
	for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * 92)];
	return Buffer.from(s, "utf8").toString("base64").slice(0, -2);
}
function formatIdFromUrl(url) {
	return /-(\d+)\.m4s\?/.exec(url)?.[1];
}
function mimetypeToBiliExt(mime) {
	const m = (mime ?? "").split(";")[0].trim().toLowerCase();
	if (m.includes("mp4")) return "mp4";
	if (m.includes("webm")) return "webm";
	if (m.includes("m4s")) return "m4s";
	return "mp4";
}
//#endregion
//#region node_modules/ytdlp-typescript/dist/extractor/bilibili.js
var VALID_URL = /^https?:\/\/(?:www\.)?bilibili\.com\/(?:video\/|festival\/[^/?#]+\?(?:[^#]*&)?bvid=)(?<prefix>[aA][vV]|[bB][vV])(?<id>[^/?#&]+)/;
var HEADERS = {
	referer: "https://www.bilibili.com/",
	origin: "https://www.bilibili.com"
};
var BiliBili = class extends InfoExtractor {
	get validUrlPatterns() {
		return [VALID_URL];
	}
	async realExtract(url) {
		const m = this.suitable(url);
		const prefix = m.groups["prefix"].toUpperCase();
		const rawId = m.groups["id"];
		const videoId = prefix === "BV" ? `BV${rawId}` : `av${rawId}`;
		const webpage = await this.downloadWebpage(url.replace(/^http:/, "https:"), {
			note: "Downloading webpage",
			headers: {
				...HEADERS,
				"user-agent": DESKTOP_UA
			},
			retries: 1
		});
		const initialState = extractJsonAssignment(webpage, /window\.__INITIAL_STATE__\s*=\s*/);
		if (!initialState) {
			if (extractJsonAssignment(webpage, /window\._riskdata_\s*=/)?.v_voucher) throw new Error("You have exceeded the rate limit. Try again later");
			this.raiseNoFormats(videoId, "Unable to extract initial state");
		}
		const trueCode = traverseObj(initialState, "error.trueCode");
		if (trueCode === -403) this.raiseLoginRequired();
		if (trueCode === -404) throw new Error("This video may be deleted or geo-restricted. A VPN/proxy might help.");
		const isFestival = !initialState["videoData"];
		const videoData = isFestival ? initialState["videoInfo"] : initialState["videoData"];
		if (!videoData) this.raiseNoFormats(videoId);
		const bvid = String(videoData["bvid"] ?? videoId);
		let title = strOrNone(videoData["title"]) ?? videoId;
		let cid = intOrNone(videoData["cid"]);
		const aid = intOrNone(videoData["aid"]);
		const pageParam = /\?[^\#]*\bp=(\d+)/.exec(url)?.[1];
		let partId = pageParam ? parseInt(pageParam, 10) : null;
		if (!isFestival) try {
			const pagelist = await this.client.downloadJson(updateUrlQuery("https://api.bilibili.com/x/player/pagelist", {
				bvid,
				jsonp: "jsonp"
			}), {
				note: "Extracting videos in anthology",
				headers: HEADERS,
				retries: 1
			});
			const pages = Array.isArray(pagelist?.data) ? pagelist.data : [];
			pages.length;
			if (pages.length > 1) {
				partId = partId ?? 1;
				const part = pages[partId - 1]?.["part"];
				if (part) title = `${title} p${String(partId).padStart(2, "0")} ${part}`;
			}
			if (!partId || partId < 1) partId = 1;
			cid = intOrNone(pages[partId - 1]?.["cid"]) ?? cid;
		} catch {}
		if (!cid && Array.isArray(videoData["pages"])) cid = intOrNone(videoData["pages"][Math.max(0, (partId ?? 1) - 1)]?.["cid"]);
		if (!cid) this.raiseNoFormats(bvid, "Unable to obtain cid");
		let playInfo = extractJsonAssignment(webpage, /window\.__playinfo__\s*=/)?.["data"] ?? void 0;
		if (!playInfo) playInfo = await this.downloadPlayInfo(bvid, cid, { try_look: 1 }) ?? void 0;
		if (!playInfo) this.raiseNoFormats(bvid, "Unable to download play info");
		const formats = extractBiliFormats(playInfo);
		const chapters = await this.getChapters(aid ?? void 0, cid);
		const subtitles = {};
		subtitles["danmaku"] = [{
			ext: "xml",
			url: `https://comment.bilibili.com/${cid}.xml`,
			name: "Danmaku"
		}];
		return this.videoResult({
			id: `${bvid}${partId ? `_p${partId}` : ""}`,
			title,
			description: strOrNone(videoData["desc"]) ?? void 0,
			uploader: strOrNone(traverseObj(initialState, "upData.name")) ?? void 0,
			uploader_id: strOrNone(traverseObj(initialState, "upData.mid")) ?? strOrNone(videoData["owner"]?.["mid"]) ?? void 0,
			thumbnail: urlOrNone(traverseObj(initialState, "videoData.pic")),
			timestamp: intOrNone(videoData["pubdate"]) ?? void 0,
			view_count: intOrNone(traverseObj(videoData, "stat.view")) ?? void 0,
			like_count: intOrNone(traverseObj(videoData, "stat.like")) ?? void 0,
			comment_count: intOrNone(traverseObj(videoData, "stat.reply")) ?? void 0,
			tags: initialState["tags"]?.map((t) => t?.["tag_name"]).filter(Boolean),
			duration: floatOrNone(playInfo["timelength"], 1 / 1e3) ?? floatOrNone(videoData["duration"]) ?? void 0,
			chapters: chapters ?? void 0,
			webpage_url: `https://www.bilibili.com/video/${bvid}`,
			http_headers: HEADERS,
			formats,
			subtitles
		});
	}
	async downloadPlayInfo(bvid, cid, query = {}) {
		const params = {
			bvid,
			cid,
			fnval: 4048,
			...dmParams(),
			...query
		};
		const signed = await signWbi(this.client, bvid, params);
		const res = await this.client.downloadJson(updateUrlQuery("https://api.bilibili.com/x/player/wbi/playurl", signed), {
			note: "Downloading play info",
			headers: HEADERS,
			retries: 1
		});
		const code = -1 * Number(res?.code ?? 0);
		if (code !== 0) throw new Error(`Unable to download video info (${code}): ${res?.message ?? "unknown"} — may require login or retry later`);
		return res?.data ?? null;
	}
	async getChapters(aid, cid) {
		if (!aid || !cid) return void 0;
		try {
			const signed = await signWbi(this.client, String(aid), {
				aid,
				cid
			});
			const points = (await this.client.downloadJson(updateUrlQuery("https://api.bilibili.com/x/player/wbi/v2", signed), {
				note: "Extracting chapters",
				headers: HEADERS,
				retries: 1
			}))?.data?.view_points;
			if (!Array.isArray(points) || !points.length) return void 0;
			return points.map((p) => ({
				start_time: intOrNone(p["from"]) ?? 0,
				end_time: intOrNone(p["to"]),
				title: strOrNone(p["content"]) ?? ""
			}));
		} catch {
			return;
		}
	}
};
var DESKTOP_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36";
function extractJsonAssignment(webpage, re) {
	const idx = webpage.search(re);
	if (idx === -1) return null;
	const tail = webpage.slice(idx + re.lastIndex);
	const braceStart = tail.indexOf("{");
	if (braceStart === -1) return null;
	try {
		return JSON.parse(scanBalanced(tail.slice(braceStart)));
	} catch {
		return null;
	}
}
function extractBiliFormats(playInfo) {
	const formats = [];
	const formatNames = {};
	for (const r of playInfo["support_formats"] ?? []) if (r?.["quality"] != null) formatNames[String(r["quality"])] = r["new_description"] ?? r["display_desc"] ?? "";
	const audios = [...playInfo["dash"]?.["audio"] ?? [], ...playInfo["dash"]?.["dolby"]?.["audio"] ?? []];
	const flac = playInfo["dash"]?.["flac"]?.["audio"];
	if (flac) audios.push(flac);
	for (const audio of audios) {
		const audioUrl = urlOrNone(audio?.["baseUrl"] ?? audio?.["base_url"] ?? audio?.["url"]);
		if (!audioUrl) continue;
		formats.push({
			url: audioUrl,
			ext: mimetypeToBiliExt(audio?.["mimeType"] ?? audio?.["mime_type"]),
			acodec: strOrNone(audio["codecs"])?.toLowerCase() ?? void 0,
			vcodec: "none",
			tbr: floatOrNone(audio["bandwidth"], 1 / 1e3),
			filesize: intOrNone(audio["size"]) ?? void 0,
			format_id: strOrNone(audio["id"]) ?? void 0,
			http_headers: HEADERS
		});
	}
	for (const video of playInfo["dash"]?.["video"] ?? []) {
		const videoUrl = urlOrNone(video?.["baseUrl"] ?? video?.["base_url"] ?? video?.["url"]);
		if (!videoUrl) continue;
		const idNum = intOrNone(video["id"]);
		formats.push({
			url: videoUrl,
			ext: mimetypeToBiliExt(video?.["mimeType"] ?? video?.["mime_type"]),
			fps: floatOrNone(video?.["frameRate"] ?? video?.["frame_rate"]),
			width: intOrNone(video["width"]),
			height: intOrNone(video["height"]),
			vcodec: strOrNone(video["codecs"]) ?? void 0,
			acodec: audios.length ? "none" : void 0,
			tbr: floatOrNone(video["bandwidth"], 1 / 1e3),
			filesize: intOrNone(video["size"]) ?? void 0,
			quality: idNum ?? void 0,
			format_id: formatIdFromUrl(videoUrl) ?? strOrNone(video["id"]) ?? void 0,
			format_note: idNum != null ? formatNames[String(idNum)] || void 0 : void 0,
			dynamic_range: idNum === 126 ? "DV" : idNum === 125 ? "HDR10" : void 0,
			http_headers: HEADERS
		});
	}
	const durl = (playInfo["durl"] ?? []).filter((d) => urlOrNone(d?.["url"]));
	if (durl.length) {
		const fragments = durl.map((d) => ({
			url: d["url"],
			duration: floatOrNone(d["length"], 1 / 1e3),
			filesize: intOrNone(d["size"]) ?? void 0
		}));
		const qn = intOrNone(playInfo["quality"]);
		formats.push({
			url: fragments[0].url,
			ext: "flv",
			protocol: fragments.length > 1 ? "http_dash_segments" : "https",
			...fragments.length > 1 ? { fragments } : {},
			filesize: fragments.reduce((acc, f) => acc + (f.filesize ?? 0), 0),
			quality: qn ?? void 0,
			format_id: qn != null ? String(qn) : "durl",
			format_note: qn != null ? formatNames[String(qn)] || void 0 : void 0,
			http_headers: HEADERS
		});
	}
	return formats;
}
//#endregion
//#region node_modules/ytdlp-typescript/dist/extractor/index.js
var extractor_exports = /* @__PURE__ */ __exportAll({
	EXTRACTORS: () => EXTRACTORS,
	getExtractorFor: () => getExtractorFor
});
var EXTRACTORS = [
	new Pinterest(),
	new Facebook(),
	new TikTok(),
	new YouTube(),
	new VKVideo(),
	new Telegram(),
	new BiliBili()
];
function getExtractorFor(url) {
	for (const ie of EXTRACTORS) if (ie.suitable(url)) return ie;
	return null;
}
//#endregion
//#region node_modules/ytdlp-typescript/dist/core/ytdlp.js
async function buildContext(opts) {
	const client = HttpClient.fromDownloadOptions(opts);
	if (opts.cookiesFile) client.cookieJar = await CookieJar.fromFile(opts.cookiesFile);
	else if (opts.cookieJar) client.cookieJar = opts.cookieJar;
	return client;
}
async function extract(url, opts = {}) {
	return extractWithClient(await buildContext(opts), url, opts);
}
async function extractWithClient(client, url, opts = {}) {
	const ie = getExtractorFor(url);
	if (!ie) throw new YtDlpTsError(`No suitable extractor found for URL: ${url}`);
	ie.attach({
		client,
		verbose: opts.verbose,
		poToken: opts.poToken
	});
	return ie.extract(url);
}
//#endregion
export { extract as t };
