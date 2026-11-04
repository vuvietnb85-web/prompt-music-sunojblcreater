export const MOMO_E164 = "+84988960419";
export const MOMO_LOCAL = "0988960419";
export const MOMO_SHOWN = "0988 960 419";

export type FloorApp = {
  name: string;
  href: string;
  here?: boolean;
  purpose: string;
  functions: string[];
  note: string;
};

export const FLOOR: FloorApp[] = [
  {
    name: "AUTO PROMPT MUSIC",
    href: "https://prompt-music-sunojblcreater.grok.me",
    here: true,
    purpose: "Viết Style Suno đúng 995 ký tự: mở đầu năng lượng cao, bass sâu, sáo ví von, khóa 150.",
    functions: ["Nghe file hoặc link", "Chọn loa, nhạc cụ, phòng", "Lượng tử chọn đường giai điệu", "Nút Tạo nhạc sang Suno"],
    note: "Một số link YouTube bị nơi phát từ chối theo máy chủ. File trực tiếp vẫn nghe được.",
  },
  {
    name: "PROMPT",
    href: "https://prompt-music.grok.me",
    purpose: "Giữ lời Việt trong sáng và nghe file nhạc ngay trên máy.",
    functions: ["Tệp nhạc nhiều định dạng", "Phát và ba đường loa", "TVPT, TVQC", "Lịch, thời tiết, tỉ giá, đài, Morse"],
    note: "Trang công khai không hiện nút trả phí.",
  },
  {
    name: "PHỔ VÀNG",
    href: "https://auto-prompt-sunoai-creater.grok.me",
    purpose: "Đo phổ bản nhạc rồi đưa số đo vào prompt.",
    functions: ["Tải file", "Băng phổ từ siêu trầm tới hơi", "BPM, tông, mức", "Nghe bản phác"],
    note: "Hợp khi cần xem bản gốc trước lúc viết. Trang có số đo kỹ thuật.",
  },
  {
    name: "SÓNG HÀ TÂY",
    href: "https://nhacsonghatay-xeomhaihau-vxo.grok.me",
    purpose: "Prompt nhạc sống Hà Tây không lời, dán vào Suno.",
    functions: ["Sân khấu và nhịp", "Giai điệu", "Cách dán Style", "Sóng thật"],
    note: "Trang có lối ủng hộ PayPal riêng.",
  },
  {
    name: "XEOM BASS",
    href: "https://xeom-remix-bass.grok.me",
    purpose: "Prompt remix bass nhiều thể loại sàn, kèm lời và phần loại.",
    functions: ["Chọn thể loại và giọng", "Hình drop", "Chép style, exclude, lyrics", "Gợi ý thông số Suno"],
    note: "Hướng dẫn bản Suno miễn phí. Không thấy nút trả phí.",
  },
  {
    name: "NHỊP VÀNG",
    href: "https://music-prompt-suno-bass.grok.me",
    purpose: "Prompt instrumental khoảng 990 ký tự, lấy nhịp từ file, khóa 150.",
    functions: ["Nhận nhiều định dạng file", "Khung năng lượng 3:30", "Chép prompt", "Bass khóa theo bản nguồn"],
    note: "Trang có lối ủng hộ PayPal riêng.",
  },
  {
    name: "SÓNG FORGE",
    href: "https://edm-music-prompt.grok.me",
    purpose: "Prompt EDM giờ cao điểm, bass rất sâu cho hộp đêm.",
    functions: ["Lò bass", "Tải bản hoặc link", "Chốt 990 ký tự", "Nghe thử và loa club"],
    note: "Kèm lịch, thời tiết, tỉ giá và phát sóng.",
  },
  {
    name: "ATELIER 998",
    href: "https://fashion-prompt-musical.grok.me",
    purpose: "Prompt tiếng Anh 998 ký tự theo chất âm đã chọn.",
    functions: ["Chọn chất âm và hãng loa", "Giải mã file", "Khóa brief", "Bonus PayPal không bắt buộc"],
    note: "Dùng khi cần một prompt tiếng Anh cố định độ dài.",
  },
  {
    name: "SÀN 154",
    href: "https://nhacsan-club-bar.grok.me",
    purpose: "Prompt nhạc sàn 154 nhịp, bốn phút, dán vào Suno.",
    functions: ["File nguồn", "Mặt sàn", "Nghe phác bốn phút", "Luật soạn và luật prompt"],
    note: "Trang công khai không hiện nút trả phí.",
  },
];
