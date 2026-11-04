import { lookup } from "node:dns/promises";
import { extract } from "ytdlp-typescript";
import { isBlockedHostname, isPrivateAddress, mediaKind, pickListenFormat, prepareRemoteUrl, shouldDecode } from "@/lib/remote-media";

const MAX_BYTES = 80 * 1024 * 1024;

export type OpenedMedia =
  | { ok: true; kind: "audio" | "video"; type: string; body: ReadableStream<Uint8Array> | null; length: number | null }
  | { ok: false; status: number; error: string };

async function assertPublic(url: URL) {
  const host = url.hostname.toLowerCase();
  if (isBlockedHostname(host)) return "Link này trỏ vào máy nội bộ. Chỉ nghe địa chỉ công khai.";
  if (host.includes(":") || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;
  let records: { address: string }[];
  try {
    records = await lookup(host, { all: true, verbatim: true });
  } catch {
    return "Không tìm thấy máy chủ của link.";
  }
  if (records.length === 0 || records.some((row) => isPrivateAddress(row.address))) {
    return "Link này trỏ vào máy nội bộ. Chỉ nghe địa chỉ công khai.";
  }
  return null;
}

function cap(body: ReadableStream<Uint8Array>) {
  let seen = 0;
  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        seen += chunk.byteLength;
        if (seen > MAX_BYTES) {
          controller.error(new Error("too-big"));
          return;
        }
        controller.enqueue(chunk);
      },
    }),
  );
}

type Hop = { ok: true; res: Response; url: URL } | { ok: false; status: number; error: string };

async function fetchHop(current: string, method: "GET" | "HEAD", extraHeaders?: Record<string, string>): Promise<Hop> {
  let url: URL;
  try {
    url = new URL(current);
  } catch {
    return { ok: false, status: 400, error: "Link không hợp lệ." };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, status: 400, error: "Chỉ nhận link http hoặc https." };
  }
  if (url.username || url.password) return { ok: false, status: 400, error: "Link không được kèm mật khẩu." };
  if (isBlockedHostname(url.hostname)) return { ok: false, status: 400, error: "Link này trỏ vào máy nội bộ. Chỉ nghe địa chỉ công khai." };
  const blocked = await assertPublic(url);
  if (blocked) return { ok: false, status: 400, error: blocked };
  const headers = new Headers({
    Accept: "audio/*,video/*;q=0.9,*/*;q=0.1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  });
  for (const [key, value] of Object.entries(extraHeaders ?? {})) {
    if (!value || /^(host|content-length|transfer-encoding)$/i.test(key)) continue;
    headers.set(key, value);
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, { method, redirect: "manual", signal: ctrl.signal, headers });
    clearTimeout(timer);
    return { ok: true, res, url };
  } catch {
    clearTimeout(timer);
    return { ok: false, status: 502, error: "Link phản hồi quá chậm hoặc không kết nối được." };
  }
}

async function decodePage(pageUrl: string): Promise<{ url: string; headers?: Record<string, string> } | OpenedMedia> {
  try {
    const info = await Promise.race([
      extract(pageUrl),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("slow")), 28000)),
    ]);
    const picked = pickListenFormat(info.formats ?? []);
    if (!picked) return { ok: false, status: 400, error: "Tìm thấy trang nhưng không có luồng tiếng để nghe." };
    return { url: picked.url, headers: picked.headers };
  } catch {
    return {
      ok: false,
      status: 502,
      error: "Không giải được link này. Thử bản công khai khác, hoặc tải file về rồi thả vào ô trên.",
    };
  }
}

export async function openRemoteMedia(raw: string, method: "GET" | "HEAD"): Promise<OpenedMedia> {
  const ready = prepareRemoteUrl(raw);
  if (!ready.ok) return { ok: false, status: 400, error: ready.error };
  let current = ready.url;
  let extraHeaders: Record<string, string> | undefined;
  if (shouldDecode(ready.url)) {
    const decoded = await decodePage(ready.url);
    if ("ok" in decoded) return decoded;
    current = decoded.url;
    extraHeaders = decoded.headers;
  }
  for (let hop = 0; hop < 4; hop++) {
    let opened = await fetchHop(current, method, extraHeaders);
    if (!opened.ok) return { ok: false, status: opened.status, error: opened.error };
    if (method === "HEAD" && (opened.res.status === 405 || opened.res.status === 501)) {
      opened.res.body?.cancel().catch(() => undefined);
      opened = await fetchHop(current, "GET", extraHeaders);
      if (!opened.ok) return { ok: false, status: opened.status, error: opened.error };
    }
    const res = opened.res;
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      res.body?.cancel().catch(() => undefined);
      if (!loc) return { ok: false, status: 502, error: "Link chuyển hướng không hợp lệ." };
      current = new URL(loc, current).toString();
      continue;
    }
    if (res.status === 401 || res.status === 403 || res.status === 404) {
      res.body?.cancel().catch(() => undefined);
      const refused =
        shouldDecode(ready.url) && res.status === 403
          ? "Đã giải được link nhưng nơi phát từ chối máy này. Thử lại sau, hoặc tải file về rồi thả vào ô trên."
          : "Máy chủ của link từ chối hoặc không còn file.";
      return { ok: false, status: 400, error: refused };
    }
    if (!res.ok && res.status !== 206) {
      res.body?.cancel().catch(() => undefined);
      return { ok: false, status: 502, error: "Không tải được file từ link này." };
    }
    const kind = mediaKind(res.headers.get("content-type") ?? "", opened.url.pathname);
    if (!kind) {
      res.body?.cancel().catch(() => undefined);
      return { ok: false, status: 400, error: "Link này là trang web, không phải file nhạc hoặc video." };
    }
    const lengthHeader = Number(res.headers.get("content-length") ?? "");
    if (Number.isFinite(lengthHeader) && lengthHeader > MAX_BYTES) {
      res.body?.cancel().catch(() => undefined);
      return { ok: false, status: 413, error: "File trên link nặng hơn 80 MB. Hãy tải về máy rồi thả vào ô trên." };
    }
    const headerType = (res.headers.get("content-type") ?? "").split(";")[0]?.trim().toLowerCase() ?? "";
    const type = headerType.startsWith("audio/") || headerType.startsWith("video/") ? headerType : kind === "video" ? "video/mp4" : "audio/mpeg";
    if (method === "HEAD") {
      res.body?.cancel().catch(() => undefined);
      return { ok: true, kind, type, body: null, length: Number.isFinite(lengthHeader) ? lengthHeader : null };
    }
    if (!res.body) return { ok: false, status: 502, error: "Link không gửi được tiếng." };
    return { ok: true, kind, type, body: cap(res.body), length: Number.isFinite(lengthHeader) ? lengthHeader : null };
  }
  return { ok: false, status: 502, error: "Link chuyển hướng quá nhiều lần." };
}
