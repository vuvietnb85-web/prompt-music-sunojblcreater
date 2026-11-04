import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, _ as createFileRoute, b as useRouter, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, v as createRootRoute, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { t as extract } from "../_libs/ytdlp-typescript.mjs";
import { lookup } from "node:dns/promises";
//#region node_modules/.nitro/vite/services/ssr/assets/router-C4YbUus7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "Có lỗi không rõ. Tải lại trang rồi thử lại.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-gold",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-lg tracking-wide uppercase",
				children: "Ứng dụng gặp lỗi"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-muted",
				children: errorMessage(error)
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-DvNJ49Ru.css";
var APP_NAME = "AUTO PROMPT MUSIC";
var Route$5 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "AUTO PROMPT MUSIC viết Style Suno: bass sâu căng, sáo trúc sáng ví von, cao trào từng lớp, khóa 150 BPM. Phân tích audio hoặc video trên máy."
			},
			{
				name: "theme-color",
				content: "#061018"
			},
			{
				name: "color-scheme",
				content: "dark"
			},
			{
				name: "google",
				content: "notranslate"
			},
			{
				name: "robots",
				content: "index,follow"
			},
			{
				property: "og:title",
				content: APP_NAME
			},
			{
				property: "og:description",
				content: "AUTO PROMPT MUSIC viết Style Suno: bass sâu căng, sáo trúc sáng ví von, cao trào từng lớp, khóa 150 BPM. Phân tích audio hoặc video trên máy."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:locale",
				content: "vi_VN"
			},
			{
				name: "twitter:card",
				content: "summary"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Oswald:wght@500;600&display=swap"
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "vi",
		translate: "no",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$1 = () => import("./routes-CsK9vdCo.mjs");
var Route$4 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var Route$3 = createFileRoute("/robots.txt")({ server: { handlers: { GET: async ({ request }) => {
	const body = `User-agent: *\nAllow: /\n\nSitemap: ${new URL(request.url).origin}/sitemap.xml\n`;
	return new Response(body, { headers: {
		"Content-Type": "text/plain; charset=utf-8",
		"Cache-Control": "public, max-age=3600"
	} });
} } } });
var $$splitComponentImporter = () => import("./san-B3oNlJXK.mjs");
var TITLE = "Sàn xưởng nhạc | AUTO PROMPT MUSIC";
var DESCRIPTION = "Chín xưởng prompt nhạc đang mở: Suno, bass, sáo, nhạc sàn và nhạc sống. Ủng hộ tự nguyện bằng PayPal hoặc MoMo 0988960419. Không khóa tính năng.";
var Route$2 = createFileRoute("/san")({
	head: () => ({ meta: [
		{ title: TITLE },
		{
			name: "description",
			content: DESCRIPTION
		},
		{
			name: "robots",
			content: "index,follow"
		},
		{
			property: "og:title",
			content: TITLE
		},
		{
			property: "og:description",
			content: DESCRIPTION
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			property: "og:locale",
			content: "vi_VN"
		},
		{
			name: "twitter:card",
			content: "summary"
		},
		{
			name: "twitter:title",
			content: TITLE
		},
		{
			name: "twitter:description",
			content: DESCRIPTION
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var Route$1 = createFileRoute("/sitemap.xml")({ server: { handlers: { GET: async ({ request }) => {
	const origin = new URL(request.url).origin;
	const body = [
		`<?xml version="1.0" encoding="UTF-8"?>`,
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
		...["/", "/san"].map((path) => `<url><loc>${origin}${path}</loc></url>`),
		`</urlset>`
	].join("");
	return new Response(body, { headers: {
		"Content-Type": "application/xml; charset=utf-8",
		"Cache-Control": "public, max-age=3600"
	} });
} } } });
var PAGE_HOSTS = [
	"spotify.com",
	"spotify.link",
	"zingmp3.vn",
	"nhaccuatui.com",
	"soundcloud.com",
	"music.apple.com",
	"instagram.com",
	"douyin.com"
];
var DECODE_ROOTS = [
	"youtube.com",
	"youtu.be",
	"youtube-nocookie.com",
	"tiktok.com",
	"facebook.com",
	"fb.watch",
	"fb.com",
	"pinterest.com",
	"pin.it",
	"t.me",
	"vk.com",
	"vk.ru",
	"vkvideo.ru",
	"bilibili.com"
];
var PAGE_ERROR = "Spotify, Apple Music, Zing MP3, NhacCuaTui và SoundCloud không mở được. Hãy dán YouTube, TikTok, Facebook, hoặc link file trực tiếp.";
function isIPv4(host) {
	return /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
}
function isPrivateAddress(ip) {
	const lower = ip.toLowerCase();
	if (lower === "::1" || lower === "0:0:0:0:0:0:0:1") return true;
	const v4 = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1] ?? (isIPv4(lower) ? lower : "");
	if (v4) {
		const [a, b] = v4.split(".").map(Number);
		if ([a, b].some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
		if (a === 0 || a === 10 || a === 127) return true;
		if (a === 169 && b === 254) return true;
		if (a === 192 && b === 168) return true;
		if (a === 172 && b >= 16 && b <= 31) return true;
		if (a === 100 && b >= 64 && b <= 127) return true;
		if (a >= 224) return true;
		return false;
	}
	if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
	if (/^fe[89ab]/.test(lower)) return true;
	return false;
}
function isBlockedHostname(host) {
	const name = host.toLowerCase().replace(/\.$/, "");
	if (!name) return true;
	if (name === "localhost" || name.endsWith(".localhost") || name.endsWith(".local") || name.endsWith(".internal")) return true;
	if (name === "metadata.google.internal") return true;
	if (isIPv4(name) || name.includes(":")) return isPrivateAddress(name);
	return false;
}
function isPageHost(host) {
	const name = host.toLowerCase().replace(/\.$/, "");
	return PAGE_HOSTS.some((root) => name === root || name.endsWith(`.${root}`));
}
function shouldDecode(raw) {
	try {
		const host = new URL(raw).hostname.toLowerCase().replace(/\.$/, "");
		return DECODE_ROOTS.some((root) => host === root || host.endsWith(`.${root}`));
	} catch {
		return false;
	}
}
function pickListenFormat(formats) {
	const max = 83886080;
	const usable = formats.filter((item) => {
		if (!item.url || item.has_drm || item.acodec === "none") return false;
		const proto = (item.protocol || "").toLowerCase();
		if (proto.includes("m3u8") || proto.includes("dash")) return false;
		if (/\.m3u8(\?|$)/i.test(item.url)) return false;
		if ((item.filesize || item.filesize_approx || 0) > max) return false;
		return true;
	});
	const audioOnly = usable.filter((item) => !item.vcodec || item.vcodec === "none");
	const pool = (audioOnly.length ? audioOnly : usable).slice();
	pool.sort((a, b) => Math.abs((a.abr ?? 96) - 96) - Math.abs((b.abr ?? 96) - 96));
	const best = pool[0];
	if (!best?.url) return null;
	return {
		url: best.url,
		headers: best.http_headers,
		ext: best.ext,
		video: Boolean(best.vcodec && best.vcodec !== "none")
	};
}
function prepareRemoteUrl(raw) {
	const text = raw.trim();
	if (!text) return {
		ok: false,
		error: "Dán link nhạc hoặc video trước."
	};
	if (text.length > 2e3) return {
		ok: false,
		error: "Link quá dài."
	};
	let url;
	try {
		url = new URL(text);
	} catch {
		return {
			ok: false,
			error: "Link không hợp lệ. Dán cả địa chỉ bắt đầu bằng https://."
		};
	}
	if (url.protocol !== "https:" && url.protocol !== "http:") return {
		ok: false,
		error: "Chỉ nhận link http hoặc https."
	};
	if (url.username || url.password) return {
		ok: false,
		error: "Link không được kèm mật khẩu."
	};
	const host = url.hostname.toLowerCase().replace(/\.$/, "");
	if (!host) return {
		ok: false,
		error: "Link không có tên máy chủ."
	};
	if (isPageHost(host)) return {
		ok: false,
		error: PAGE_ERROR
	};
	if (isBlockedHostname(host)) return {
		ok: false,
		error: "Link này trỏ vào máy nội bộ. Chỉ nghe địa chỉ công khai."
	};
	const label = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() || host).replace(/\s+/g, " ").slice(0, 60) || host;
	return {
		ok: true,
		url: url.toString(),
		label
	};
}
function mediaKind(contentType, pathname) {
	const type = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
	if (type.startsWith("text/") || type === "application/json" || type === "text/html") return null;
	if (type.startsWith("audio/")) return "audio";
	if (type.startsWith("video/")) return "video";
	if (type === "application/ogg" || type === "application/octet-stream" || type === "") {
		if (/\.(mp4|webm|mov|mkv|m4v)$/i.test(pathname)) return "video";
		if (/\.(mp3|m4a|aac|wav|ogg|flac|opus)$/i.test(pathname)) return "audio";
	}
	return null;
}
var MAX_BYTES = 83886080;
async function assertPublic(url) {
	const host = url.hostname.toLowerCase();
	if (isBlockedHostname(host)) return "Link này trỏ vào máy nội bộ. Chỉ nghe địa chỉ công khai.";
	if (host.includes(":") || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;
	let records;
	try {
		records = await lookup(host, {
			all: true,
			verbatim: true
		});
	} catch {
		return "Không tìm thấy máy chủ của link.";
	}
	if (records.length === 0 || records.some((row) => isPrivateAddress(row.address))) return "Link này trỏ vào máy nội bộ. Chỉ nghe địa chỉ công khai.";
	return null;
}
function cap(body) {
	let seen = 0;
	return body.pipeThrough(new TransformStream({ transform(chunk, controller) {
		seen += chunk.byteLength;
		if (seen > MAX_BYTES) {
			controller.error(/* @__PURE__ */ new Error("too-big"));
			return;
		}
		controller.enqueue(chunk);
	} }));
}
async function fetchHop(current, method, extraHeaders) {
	let url;
	try {
		url = new URL(current);
	} catch {
		return {
			ok: false,
			status: 400,
			error: "Link không hợp lệ."
		};
	}
	if (url.protocol !== "https:" && url.protocol !== "http:") return {
		ok: false,
		status: 400,
		error: "Chỉ nhận link http hoặc https."
	};
	if (url.username || url.password) return {
		ok: false,
		status: 400,
		error: "Link không được kèm mật khẩu."
	};
	if (isBlockedHostname(url.hostname)) return {
		ok: false,
		status: 400,
		error: "Link này trỏ vào máy nội bộ. Chỉ nghe địa chỉ công khai."
	};
	const blocked = await assertPublic(url);
	if (blocked) return {
		ok: false,
		status: 400,
		error: blocked
	};
	const headers = new Headers({
		Accept: "audio/*,video/*;q=0.9,*/*;q=0.1",
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
	});
	for (const [key, value] of Object.entries(extraHeaders ?? {})) {
		if (!value || /^(host|content-length|transfer-encoding)$/i.test(key)) continue;
		headers.set(key, value);
	}
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), 2e4);
	try {
		const res = await fetch(url, {
			method,
			redirect: "manual",
			signal: ctrl.signal,
			headers
		});
		clearTimeout(timer);
		return {
			ok: true,
			res,
			url
		};
	} catch {
		clearTimeout(timer);
		return {
			ok: false,
			status: 502,
			error: "Link phản hồi quá chậm hoặc không kết nối được."
		};
	}
}
async function decodePage(pageUrl) {
	try {
		const picked = pickListenFormat((await Promise.race([extract(pageUrl), new Promise((_, reject) => setTimeout(() => reject(/* @__PURE__ */ new Error("slow")), 28e3))])).formats ?? []);
		if (!picked) return {
			ok: false,
			status: 400,
			error: "Tìm thấy trang nhưng không có luồng tiếng để nghe."
		};
		return {
			url: picked.url,
			headers: picked.headers
		};
	} catch {
		return {
			ok: false,
			status: 502,
			error: "Không giải được link này. Thử bản công khai khác, hoặc tải file về rồi thả vào ô trên."
		};
	}
}
async function openRemoteMedia(raw, method) {
	const ready = prepareRemoteUrl(raw);
	if (!ready.ok) return {
		ok: false,
		status: 400,
		error: ready.error
	};
	let current = ready.url;
	let extraHeaders;
	if (shouldDecode(ready.url)) {
		const decoded = await decodePage(ready.url);
		if ("ok" in decoded) return decoded;
		current = decoded.url;
		extraHeaders = decoded.headers;
	}
	for (let hop = 0; hop < 4; hop++) {
		let opened = await fetchHop(current, method, extraHeaders);
		if (!opened.ok) return {
			ok: false,
			status: opened.status,
			error: opened.error
		};
		if (method === "HEAD" && (opened.res.status === 405 || opened.res.status === 501)) {
			opened.res.body?.cancel().catch(() => void 0);
			opened = await fetchHop(current, "GET", extraHeaders);
			if (!opened.ok) return {
				ok: false,
				status: opened.status,
				error: opened.error
			};
		}
		const res = opened.res;
		if (res.status >= 300 && res.status < 400) {
			const loc = res.headers.get("location");
			res.body?.cancel().catch(() => void 0);
			if (!loc) return {
				ok: false,
				status: 502,
				error: "Link chuyển hướng không hợp lệ."
			};
			current = new URL(loc, current).toString();
			continue;
		}
		if (res.status === 401 || res.status === 403 || res.status === 404) {
			res.body?.cancel().catch(() => void 0);
			return {
				ok: false,
				status: 400,
				error: shouldDecode(ready.url) && res.status === 403 ? "Đã giải được link nhưng nơi phát từ chối máy này. Thử lại sau, hoặc tải file về rồi thả vào ô trên." : "Máy chủ của link từ chối hoặc không còn file."
			};
		}
		if (!res.ok && res.status !== 206) {
			res.body?.cancel().catch(() => void 0);
			return {
				ok: false,
				status: 502,
				error: "Không tải được file từ link này."
			};
		}
		const kind = mediaKind(res.headers.get("content-type") ?? "", opened.url.pathname);
		if (!kind) {
			res.body?.cancel().catch(() => void 0);
			return {
				ok: false,
				status: 400,
				error: "Link này là trang web, không phải file nhạc hoặc video."
			};
		}
		const lengthHeader = Number(res.headers.get("content-length") ?? "");
		if (Number.isFinite(lengthHeader) && lengthHeader > MAX_BYTES) {
			res.body?.cancel().catch(() => void 0);
			return {
				ok: false,
				status: 413,
				error: "File trên link nặng hơn 80 MB. Hãy tải về máy rồi thả vào ô trên."
			};
		}
		const headerType = (res.headers.get("content-type") ?? "").split(";")[0]?.trim().toLowerCase() ?? "";
		const type = headerType.startsWith("audio/") || headerType.startsWith("video/") ? headerType : kind === "video" ? "video/mp4" : "audio/mpeg";
		if (method === "HEAD") {
			res.body?.cancel().catch(() => void 0);
			return {
				ok: true,
				kind,
				type,
				body: null,
				length: Number.isFinite(lengthHeader) ? lengthHeader : null
			};
		}
		if (!res.body) return {
			ok: false,
			status: 502,
			error: "Link không gửi được tiếng."
		};
		return {
			ok: true,
			kind,
			type,
			body: cap(res.body),
			length: Number.isFinite(lengthHeader) ? lengthHeader : null
		};
	}
	return {
		ok: false,
		status: 502,
		error: "Link chuyển hướng quá nhiều lần."
	};
}
function fail(status, error) {
	return Response.json({ error }, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function answer(request) {
	const site = request.headers.get("sec-fetch-site");
	if (site && site !== "same-origin" && site !== "none") return fail(403, "Chỉ nghe link từ chính ứng dụng.");
	const url = new URL(request.url);
	const raw = url.searchParams.get("u") ?? "";
	const check = url.searchParams.get("check") === "1";
	const opened = await openRemoteMedia(raw, check ? "HEAD" : "GET");
	if (!opened.ok) return fail(opened.status, opened.error);
	if (check) return Response.json({
		ok: true,
		kind: opened.kind
	}, { headers: {
		"Cache-Control": "no-store",
		"X-Media-Kind": opened.kind
	} });
	const headers = new Headers({
		"Content-Type": opened.type,
		"Cache-Control": "no-store",
		"X-Content-Type-Options": "nosniff",
		"X-Media-Kind": opened.kind
	});
	if (opened.length != null) headers.set("Content-Length", String(opened.length));
	if (!opened.body) return new Response(null, {
		status: 200,
		headers
	});
	return new Response(opened.body, {
		status: 200,
		headers
	});
}
var Route = createFileRoute("/api/hear")({ server: { handlers: { GET: async ({ request }) => answer(request) } } });
var rootRouteChildren = {
	IndexRoute: Route$4.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$5
	}),
	RobotsDottxtRoute: Route$3.update({
		id: "/robots.txt",
		path: "/robots.txt",
		getParentRoute: () => Route$5
	}),
	SanRoute: Route$2.update({
		id: "/san",
		path: "/san",
		getParentRoute: () => Route$5
	}),
	SitemapDotxmlRoute: Route$1.update({
		id: "/sitemap.xml",
		path: "/sitemap.xml",
		getParentRoute: () => Route$5
	}),
	ApiHearRoute: Route.update({
		id: "/api/hear",
		path: "/api/hear",
		getParentRoute: () => Route$5
	})
};
var routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { prepareRemoteUrl as n, shouldDecode as r, router_exports as t };
