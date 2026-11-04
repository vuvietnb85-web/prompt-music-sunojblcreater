import { createFileRoute } from "@tanstack/react-router";
import { Catalog } from "@/components/catalog";

const TITLE = "Sàn xưởng nhạc | AUTO PROMPT MUSIC";
const DESCRIPTION =
  "Chín xưởng prompt nhạc đang mở: Suno, bass, sáo, nhạc sàn và nhạc sống. Ủng hộ tự nguyện bằng PayPal hoặc MoMo 0988960419. Không khóa tính năng.";

export const Route = createFileRoute("/san")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "vi_VN" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
  }),
  component: Catalog,
});
