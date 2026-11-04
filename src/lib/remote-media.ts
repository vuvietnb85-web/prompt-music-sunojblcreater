const PAGE_HOSTS = ["spotify.com", "spotify.link", "zingmp3.vn", "nhaccuatui.com", "soundcloud.com", "music.apple.com", "instagram.com", "douyin.com"];

const DECODE_ROOTS = [
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
  "bilibili.com",
];

const PAGE_ERROR =
  "Spotify, Apple Music, Zing MP3, NhacCuaTui và SoundCloud không mở được. Hãy dán YouTube, TikTok, Facebook, hoặc link file trực tiếp.";

export type RemoteReady = { ok: true; url: string; label: string };
export type RemoteReject = { ok: false; error: string };

function isIPv4(host: string) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
}

export function isPrivateAddress(ip: string) {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "0:0:0:0:0:0:0:1") return true;
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  const v4 = mapped?.[1] ?? (isIPv4(lower) ? lower : "");
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

export function isBlockedHostname(host: string) {
  const name = host.toLowerCase().replace(/\.$/, "");
  if (!name) return true;
  if (name === "localhost" || name.endsWith(".localhost") || name.endsWith(".local") || name.endsWith(".internal")) return true;
  if (name === "metadata.google.internal") return true;
  if (isIPv4(name) || name.includes(":")) return isPrivateAddress(name);
  return false;
}

function isPageHost(host: string) {
  const name = host.toLowerCase().replace(/\.$/, "");
  return PAGE_HOSTS.some((root) => name === root || name.endsWith(`.${root}`));
}

export function shouldDecode(raw: string) {
  try {
    const host = new URL(raw).hostname.toLowerCase().replace(/\.$/, "");
    return DECODE_ROOTS.some((root) => host === root || host.endsWith(`.${root}`));
  } catch {
    return false;
  }
}

export type ListenSource = {
  url?: string;
  acodec?: string | null;
  vcodec?: string | null;
  abr?: number | null;
  protocol?: string;
  filesize?: number | null;
  filesize_approx?: number | null;
  has_drm?: boolean;
  ext?: string;
  http_headers?: Record<string, string>;
};

export function pickListenFormat(formats: ListenSource[]) {
  const max = 80 * 1024 * 1024;
  const usable = formats.filter((item) => {
    if (!item.url || item.has_drm || item.acodec === "none") return false;
    const proto = (item.protocol || "").toLowerCase();
    if (proto.includes("m3u8") || proto.includes("dash")) return false;
    if (/\.m3u8(\?|$)/i.test(item.url)) return false;
    const size = item.filesize || item.filesize_approx || 0;
    if (size > max) return false;
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
    video: Boolean(best.vcodec && best.vcodec !== "none"),
  };
}

export function prepareRemoteUrl(raw: string): RemoteReady | RemoteReject {
  const text = raw.trim();
  if (!text) return { ok: false, error: "Dán link nhạc hoặc video trước." };
  if (text.length > 2000) return { ok: false, error: "Link quá dài." };
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return { ok: false, error: "Link không hợp lệ. Dán cả địa chỉ bắt đầu bằng https://." };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, error: "Chỉ nhận link http hoặc https." };
  }
  if (url.username || url.password) return { ok: false, error: "Link không được kèm mật khẩu." };
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!host) return { ok: false, error: "Link không có tên máy chủ." };
  if (isPageHost(host)) return { ok: false, error: PAGE_ERROR };
  if (isBlockedHostname(host)) return { ok: false, error: "Link này trỏ vào máy nội bộ. Chỉ nghe địa chỉ công khai." };
  const leaf = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() || host);
  const label = leaf.replace(/\s+/g, " ").slice(0, 60) || host;
  return { ok: true, url: url.toString(), label };
}

export function mediaKind(contentType: string, pathname: string): "audio" | "video" | null {
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
