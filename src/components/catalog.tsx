import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FLOOR, MOMO_E164, MOMO_LOCAL, MOMO_SHOWN } from "@/lib/floor";

export function Catalog() {
  const [bonus, setBonus] = useState<null | "paypal" | "momo">(null);
  const [payReady, setPayReady] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (bonus !== "paypal") return;
    const render = () => {
      const paypal = (
        window as unknown as {
          paypal?: { HostedButtons: (o: { hostedButtonId: string }) => { render: (id: string) => void } };
        }
      ).paypal;
      const el = document.getElementById("paypal-container-T7AZ748Y27248");
      if (!paypal || !el || el.childElementCount > 0) {
        if (el && el.childElementCount > 0) setPayReady(true);
        return;
      }
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
    s.onerror = () => setCopied("Không tải được PayPal. Thử lại, hoặc chuyển MoMo.");
    document.body.appendChild(s);
  }, [bonus]);

  async function copyMomo() {
    const note = "BONUS XUONG NHAC";
    try {
      await navigator.clipboard.writeText(`${MOMO_LOCAL} ${note}`);
      setCopied("Đã chép số MoMo và nội dung chuyển khoản.");
    } catch {
      setCopied("Không chép được. Số MoMo nằm ngay phía trên.");
    }
  }

  const listJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Sàn xưởng nhạc",
    inLanguage: "vi",
    description:
      "Chín xưởng prompt nhạc đang mở. Ủng hộ tự nguyện bằng PayPal hoặc MoMo, không khóa tính năng.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: FLOOR.map((app, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: app.name,
        url: app.href,
        description: app.purpose,
      })),
    },
  });

  return (
    <div className="floor">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: listJson }} />
      <div className="floor-wrap">
        <header className="floor-hero">
          <div>
            <p className="font-display text-xs tracking-widest text-gold uppercase">Sàn thương mại</p>
            <h1 className="floor-title text-fg">Sàn xưởng nhạc</h1>
            <p className="mt-3 max-w-2xl text-pretty text-muted">
              Chín ứng dụng đang mở. Nhận xét chỉ mô tả chức năng nhìn thấy trên trang công khai ngày 3 tháng 11 năm 2026. Không chấm điểm giả, không đếm người dùng.
            </p>
            <Link to="/" className="mt-4 inline-flex min-h-11 items-center border border-gold px-4 font-display tracking-wide text-gold uppercase">
              Về xưởng
            </Link>
          </div>
          <section aria-labelledby="bonus-title" className="border border-gold bg-bg p-3">
            <h2 id="bonus-title" className="font-display text-xs tracking-widest text-gold uppercase">
              Ủng hộ tự nguyện
            </h2>
            <p className="mt-1 text-sm text-pretty text-muted">
              Bonus không bán bản quyền, không mở khóa tính năng, không lưu thẻ. PayPal tính bằng đô la. MoMo là chuyển khoản VND, bạn tự chọn số tiền.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`min-h-11 font-display tracking-wide uppercase ${bonus === "paypal" ? "bg-gold text-bg" : "border border-gold text-gold"}`}
                onClick={() => setBonus(bonus === "paypal" ? null : "paypal")}
              >
                Bonus PayPal
              </button>
              <button
                type="button"
                className={`min-h-11 font-display tracking-wide uppercase ${bonus === "momo" ? "bg-gold text-bg" : "border border-gold text-gold"}`}
                onClick={() => setBonus(bonus === "momo" ? null : "momo")}
              >
                Bonus MoMo
              </button>
            </div>
            {bonus === "paypal" ? (
              <div className="mt-3">
                {payReady ? null : <p className="text-sm text-muted">Đang mở PayPal…</p>}
                <div id="paypal-container-T7AZ748Y27248" />
              </div>
            ) : null}
            {bonus === "momo" ? (
              <div className="mt-3">
                <p className="font-display text-xl tabular-nums text-fg">{MOMO_SHOWN}</p>
                <p className="text-sm text-muted">MoMo {MOMO_E164}. Nội dung gợi ý: BONUS XUONG NHAC.</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button type="button" className="min-h-11 border border-gold text-fg" onClick={() => void copyMomo()}>
                    Chép số
                  </button>
                  <a href={`tel:${MOMO_E164}`} className="flex min-h-11 items-center justify-center border border-gold text-fg">
                    Gọi
                  </a>
                </div>
              </div>
            ) : null}
            {copied ? <p className="mt-2 text-sm text-gold">{copied}</p> : null}
          </section>
        </header>

        <main className="floor-grid">
          {FLOOR.map((app) => (
            <article key={app.href} className="floor-card">
              <h2 className="text-fg">{app.name}</h2>
              <p className="mt-2 text-sm text-pretty text-fg">{app.purpose}</p>
              <ul className="mt-2 flex flex-1 flex-col gap-1 text-sm text-muted">
                {app.functions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-pretty text-muted">{app.note}</p>
              <div className="mt-3 grid grid-cols-1 gap-2">
                {app.here ? (
                  <Link to="/" className="flex min-h-11 items-center justify-center bg-gold font-display tracking-wide text-bg uppercase">
                    Mở xưởng này
                  </Link>
                ) : null}
                <a
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 items-center justify-center border border-gold font-display tracking-wide text-gold uppercase"
                >
                  Mở ứng dụng
                </a>
              </div>
            </article>
          ))}
        </main>
        <footer className="mt-6 text-sm text-pretty text-muted">
          Ứng dụng nằm trên máy chủ riêng. Sàn này không thay mặt chủ thẻ và không giữ số dư. Muốn ủng hộ, dùng Bonus PayPal hoặc MoMo {MOMO_SHOWN}.
        </footer>
      </div>
    </div>
  );
}