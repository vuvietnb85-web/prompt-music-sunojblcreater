import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

import { VxoBinanceRef } from "@/components/vxo-binance-ref";
const APP_NAME = "AUTO PROMPT MUSIC";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
      },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "AUTO PROMPT MUSIC viết Style Suno: bass sâu căng, sáo trúc sáng ví von, cao trào từng lớp, khóa 150 BPM. Phân tích audio hoặc video trên máy.",
      },
      { name: "theme-color", content: "#061018" },
      { name: "color-scheme", content: "dark" },
      { name: "google", content: "notranslate" },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: APP_NAME },
      {
        property: "og:description",
        content:
          "AUTO PROMPT MUSIC viết Style Suno: bass sâu căng, sáo trúc sáng ví von, cao trào từng lớp, khóa 150 BPM. Phân tích audio hoặc video trên máy.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "vi_VN" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Oswald:wght@500;600&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="vi" translate="no" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <VxoBinanceRef />
        <Scripts />
      </body>
    </html>
  ),
});
