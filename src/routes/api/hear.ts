import { createFileRoute } from "@tanstack/react-router";
import { openRemoteMedia } from "@/lib/remote-media.server";

function fail(status: number, error: string) {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

async function answer(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return fail(403, "Chỉ nghe link từ chính ứng dụng.");
  const url = new URL(request.url);
  const raw = url.searchParams.get("u") ?? "";
  const check = url.searchParams.get("check") === "1";
  const opened = await openRemoteMedia(raw, check ? "HEAD" : "GET");
  if (!opened.ok) return fail(opened.status, opened.error);
  if (check) {
    return Response.json(
      { ok: true, kind: opened.kind },
      { headers: { "Cache-Control": "no-store", "X-Media-Kind": opened.kind } },
    );
  }
  const headers = new Headers({
    "Content-Type": opened.type,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Media-Kind": opened.kind,
  });
  if (opened.length != null) headers.set("Content-Length", String(opened.length));
  if (!opened.body) return new Response(null, { status: 200, headers });
  return new Response(opened.body, { status: 200, headers });
}

export const Route = createFileRoute("/api/hear")({
  server: {
    handlers: {
      GET: async ({ request }) => answer(request),
    },
  },
});
