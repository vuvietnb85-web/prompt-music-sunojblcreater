import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/san-B3oNlJXK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MOMO_E164 = "+84988960419";
var MOMO_LOCAL = "0988960419";
var MOMO_SHOWN = "0988 960 419";
var FLOOR = [
	{
		name: "AUTO PROMPT MUSIC",
		href: "https://prompt-music-sunojblcreater.grok.me",
		here: true,
		purpose: "Viết Style Suno đúng 995 ký tự: mở đầu năng lượng cao, bass sâu, sáo ví von, khóa 150.",
		functions: [
			"Nghe file hoặc link",
			"Chọn loa, nhạc cụ, phòng",
			"Lượng tử chọn đường giai điệu",
			"Nút Tạo nhạc sang Suno"
		],
		note: "Một số link YouTube bị nơi phát từ chối theo máy chủ. File trực tiếp vẫn nghe được."
	},
	{
		name: "PROMPT",
		href: "https://prompt-music.grok.me",
		purpose: "Giữ lời Việt trong sáng và nghe file nhạc ngay trên máy.",
		functions: [
			"Tệp nhạc nhiều định dạng",
			"Phát và ba đường loa",
			"TVPT, TVQC",
			"Lịch, thời tiết, tỉ giá, đài, Morse"
		],
		note: "Trang công khai không hiện nút trả phí."
	},
	{
		name: "PHỔ VÀNG",
		href: "https://auto-prompt-sunoai-creater.grok.me",
		purpose: "Đo phổ bản nhạc rồi đưa số đo vào prompt.",
		functions: [
			"Tải file",
			"Băng phổ từ siêu trầm tới hơi",
			"BPM, tông, mức",
			"Nghe bản phác"
		],
		note: "Hợp khi cần xem bản gốc trước lúc viết. Trang có số đo kỹ thuật."
	},
	{
		name: "SÓNG HÀ TÂY",
		href: "https://nhacsonghatay-xeomhaihau-vxo.grok.me",
		purpose: "Prompt nhạc sống Hà Tây không lời, dán vào Suno.",
		functions: [
			"Sân khấu và nhịp",
			"Giai điệu",
			"Cách dán Style",
			"Sóng thật"
		],
		note: "Trang có lối ủng hộ PayPal riêng."
	},
	{
		name: "XEOM BASS",
		href: "https://xeom-remix-bass.grok.me",
		purpose: "Prompt remix bass nhiều thể loại sàn, kèm lời và phần loại.",
		functions: [
			"Chọn thể loại và giọng",
			"Hình drop",
			"Chép style, exclude, lyrics",
			"Gợi ý thông số Suno"
		],
		note: "Hướng dẫn bản Suno miễn phí. Không thấy nút trả phí."
	},
	{
		name: "NHỊP VÀNG",
		href: "https://music-prompt-suno-bass.grok.me",
		purpose: "Prompt instrumental khoảng 990 ký tự, lấy nhịp từ file, khóa 150.",
		functions: [
			"Nhận nhiều định dạng file",
			"Khung năng lượng 3:30",
			"Chép prompt",
			"Bass khóa theo bản nguồn"
		],
		note: "Trang có lối ủng hộ PayPal riêng."
	},
	{
		name: "SÓNG FORGE",
		href: "https://edm-music-prompt.grok.me",
		purpose: "Prompt EDM giờ cao điểm, bass rất sâu cho hộp đêm.",
		functions: [
			"Lò bass",
			"Tải bản hoặc link",
			"Chốt 990 ký tự",
			"Nghe thử và loa club"
		],
		note: "Kèm lịch, thời tiết, tỉ giá và phát sóng."
	},
	{
		name: "ATELIER 998",
		href: "https://fashion-prompt-musical.grok.me",
		purpose: "Prompt tiếng Anh 998 ký tự theo chất âm đã chọn.",
		functions: [
			"Chọn chất âm và hãng loa",
			"Giải mã file",
			"Khóa brief",
			"Bonus PayPal không bắt buộc"
		],
		note: "Dùng khi cần một prompt tiếng Anh cố định độ dài."
	},
	{
		name: "SÀN 154",
		href: "https://nhacsan-club-bar.grok.me",
		purpose: "Prompt nhạc sàn 154 nhịp, bốn phút, dán vào Suno.",
		functions: [
			"File nguồn",
			"Mặt sàn",
			"Nghe phác bốn phút",
			"Luật soạn và luật prompt"
		],
		note: "Trang công khai không hiện nút trả phí."
	}
];
function Catalog() {
	const [bonus, setBonus] = (0, import_react.useState)(null);
	const [payReady, setPayReady] = (0, import_react.useState)(false);
	const [copied, setCopied] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (bonus !== "paypal") return;
		const render = () => {
			const paypal = window.paypal;
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
		s.src = "https://www.paypal.com/sdk/js?client-id=BAAIfuQli_a3Qud-8CIRqCRCeohqtiW29_i2Txx2rQM35pqMc-pbCIZX6L8tx1zbyOj_vp8AUE_dpSqOhc&components=hosted-buttons&disable-funding=venmo&currency=USD";
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
		description: "Chín xưởng prompt nhạc đang mở. Ủng hộ tự nguyện bằng PayPal hoặc MoMo, không khóa tính năng.",
		mainEntity: {
			"@type": "ItemList",
			itemListElement: FLOOR.map((app, index) => ({
				"@type": "ListItem",
				position: index + 1,
				name: app.name,
				url: app.href,
				description: app.purpose
			}))
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "floor",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
			type: "application/ld+json",
			dangerouslySetInnerHTML: { __html: listJson }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "floor-wrap",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "floor-hero",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-xs tracking-widest text-gold uppercase",
							children: "Sàn thương mại"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "floor-title text-fg",
							children: "Sàn xưởng nhạc"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-2xl text-pretty text-muted",
							children: "Chín ứng dụng đang mở. Nhận xét chỉ mô tả chức năng nhìn thấy trên trang công khai ngày 3 tháng 11 năm 2026. Không chấm điểm giả, không đếm người dùng."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "mt-4 inline-flex min-h-11 items-center border border-gold px-4 font-display tracking-wide text-gold uppercase",
							children: "Về xưởng"
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						"aria-labelledby": "bonus-title",
						className: "border border-gold bg-bg p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "bonus-title",
								className: "font-display text-xs tracking-widest text-gold uppercase",
								children: "Ủng hộ tự nguyện"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-pretty text-muted",
								children: "Bonus không bán bản quyền, không mở khóa tính năng, không lưu thẻ. PayPal tính bằng đô la. MoMo là chuyển khoản VND, bạn tự chọn số tiền."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: `min-h-11 font-display tracking-wide uppercase ${bonus === "paypal" ? "bg-gold text-bg" : "border border-gold text-gold"}`,
									onClick: () => setBonus(bonus === "paypal" ? null : "paypal"),
									children: "Bonus PayPal"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: `min-h-11 font-display tracking-wide uppercase ${bonus === "momo" ? "bg-gold text-bg" : "border border-gold text-gold"}`,
									onClick: () => setBonus(bonus === "momo" ? null : "momo"),
									children: "Bonus MoMo"
								})]
							}),
							bonus === "paypal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3",
								children: [payReady ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Đang mở PayPal…"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { id: "paypal-container-T7AZ748Y27248" })]
							}) : null,
							bonus === "momo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-xl tabular-nums text-fg",
										children: MOMO_SHOWN
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm text-muted",
										children: [
											"MoMo ",
											MOMO_E164,
											". Nội dung gợi ý: BONUS XUONG NHAC."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 grid grid-cols-2 gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "min-h-11 border border-gold text-fg",
											onClick: () => void copyMomo(),
											children: "Chép số"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: `tel:${MOMO_E164}`,
											className: "flex min-h-11 items-center justify-center border border-gold text-fg",
											children: "Gọi"
										})]
									})
								]
							}) : null,
							copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-gold",
								children: copied
							}) : null
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "floor-grid",
					children: FLOOR.map((app) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "floor-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-fg",
								children: app.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-pretty text-fg",
								children: app.purpose
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 flex flex-1 flex-col gap-1 text-sm text-muted",
								children: app.functions.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-pretty text-muted",
								children: app.note
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid grid-cols-1 gap-2",
								children: [app.here ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/",
									className: "flex min-h-11 items-center justify-center bg-gold font-display tracking-wide text-bg uppercase",
									children: "Mở xưởng này"
								}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: app.href,
									target: "_blank",
									rel: "noopener noreferrer",
									className: "flex min-h-11 items-center justify-center border border-gold font-display tracking-wide text-gold uppercase",
									children: "Mở ứng dụng"
								})]
							})
						]
					}, app.href))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
					className: "mt-6 text-sm text-pretty text-muted",
					children: [
						"Ứng dụng nằm trên máy chủ riêng. Sàn này không thay mặt chủ thẻ và không giữ số dư. Muốn ủng hộ, dùng Bonus PayPal hoặc MoMo ",
						MOMO_SHOWN,
						"."
					]
				})
			]
		})]
	});
}
var SplitComponent = Catalog;
//#endregion
export { SplitComponent as component };
