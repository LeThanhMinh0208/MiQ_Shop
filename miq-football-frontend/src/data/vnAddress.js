/**
 * Vietnam administrative dataset — all 63 provinces/municipalities.
 * Province → District hierarchy. Wards omitted (optional field) to keep
 * bundle size manageable; extend per-district when needed.
 *
 * NOTE (2025): Vietnam consolidated 63 provinces into 34 units effective
 * 2025. Update province names/codes to the official post-reform list from
 * https://data.gov.vn or https://provinces.open-api.vn when available.
 *
 * Structure: { [code]: { name, districts: { [code]: { name, wards: [] } } } }
 */
const VN_ADDRESS = {

  // ── Hà Nội ───────────────────────────────────────────────────────────────
  HN: { name: 'Hà Nội', districts: {
    D01: { name: 'Quận Ba Đình', wards: [] },
    D02: { name: 'Quận Cầu Giấy', wards: [] },
    D03: { name: 'Quận Đống Đa', wards: [] },
    D04: { name: 'Quận Hai Bà Trưng', wards: [] },
    D05: { name: 'Quận Hà Đông', wards: [] },
    D06: { name: 'Quận Hoàn Kiếm', wards: [] },
    D07: { name: 'Quận Hoàng Mai', wards: [] },
    D08: { name: 'Quận Long Biên', wards: [] },
    D09: { name: 'Quận Nam Từ Liêm', wards: [] },
    D10: { name: 'Quận Bắc Từ Liêm', wards: [] },
    D11: { name: 'Quận Tây Hồ', wards: [] },
    D12: { name: 'Quận Thanh Xuân', wards: [] },
    D13: { name: 'TX. Sơn Tây', wards: [] },
    D14: { name: 'Huyện Ba Vì', wards: [] },
    D15: { name: 'Huyện Chương Mỹ', wards: [] },
    D16: { name: 'Huyện Đan Phượng', wards: [] },
    D17: { name: 'Huyện Đông Anh', wards: [] },
    D18: { name: 'Huyện Gia Lâm', wards: [] },
    D19: { name: 'Huyện Hoài Đức', wards: [] },
    D20: { name: 'Huyện Mê Linh', wards: [] },
    D21: { name: 'Huyện Mỹ Đức', wards: [] },
    D22: { name: 'Huyện Phú Xuyên', wards: [] },
    D23: { name: 'Huyện Phúc Thọ', wards: [] },
    D24: { name: 'Huyện Quốc Oai', wards: [] },
    D25: { name: 'Huyện Sóc Sơn', wards: [] },
    D26: { name: 'Huyện Thạch Thất', wards: [] },
    D27: { name: 'Huyện Thanh Oai', wards: [] },
    D28: { name: 'Huyện Thanh Trì', wards: [] },
    D29: { name: 'Huyện Thường Tín', wards: [] },
    D30: { name: 'Huyện Ứng Hòa', wards: [] },
  }},

  // ── Hải Phòng ─────────────────────────────────────────────────────────────
  HP: { name: 'Hải Phòng', districts: {
    D01: { name: 'Quận Dương Kinh', wards: [] },
    D02: { name: 'Quận Đồ Sơn', wards: [] },
    D03: { name: 'Quận Hải An', wards: [] },
    D04: { name: 'Quận Hồng Bàng', wards: [] },
    D05: { name: 'Quận Kiến An', wards: [] },
    D06: { name: 'Quận Lê Chân', wards: [] },
    D07: { name: 'Quận Ngô Quyền', wards: [] },
    D08: { name: 'Huyện An Dương', wards: [] },
    D09: { name: 'Huyện An Lão', wards: [] },
    D10: { name: 'Huyện Bạch Long Vĩ', wards: [] },
    D11: { name: 'Huyện Cát Hải', wards: [] },
    D12: { name: 'Huyện Kiến Thụy', wards: [] },
    D13: { name: 'Huyện Tiên Lãng', wards: [] },
    D14: { name: 'Huyện Thủy Nguyên', wards: [] },
    D15: { name: 'Huyện Vĩnh Bảo', wards: [] },
  }},

  // ── Cần Thơ ───────────────────────────────────────────────────────────────
  CT: { name: 'Cần Thơ', districts: {
    D01: { name: 'Quận Bình Thủy', wards: [] },
    D02: { name: 'Quận Cái Răng', wards: [] },
    D03: { name: 'Quận Ninh Kiều', wards: [] },
    D04: { name: 'Quận Ô Môn', wards: [] },
    D05: { name: 'Quận Thốt Nốt', wards: [] },
    D06: { name: 'Huyện Cờ Đỏ', wards: [] },
    D07: { name: 'Huyện Phong Điền', wards: [] },
    D08: { name: 'Huyện Thới Lai', wards: [] },
    D09: { name: 'Huyện Vĩnh Thạnh', wards: [] },
  }},

  // ── Đà Nẵng ──────────────────────────────────────────────────────────────
  DN: { name: 'Đà Nẵng', districts: {
    D01: { name: 'Quận Cẩm Lệ', wards: [] },
    D02: { name: 'Quận Hải Châu', wards: [] },
    D03: { name: 'Quận Liên Chiểu', wards: [] },
    D04: { name: 'Quận Ngũ Hành Sơn', wards: [] },
    D05: { name: 'Quận Sơn Trà', wards: [] },
    D06: { name: 'Quận Thanh Khê', wards: [] },
    D07: { name: 'Huyện Hòa Vang', wards: [] },
    D08: { name: 'Huyện Hoàng Sa', wards: [] },
  }},

  // ── TP. Hồ Chí Minh ──────────────────────────────────────────────────────
  HCM: { name: 'TP. Hồ Chí Minh', districts: {
    D01: { name: 'Quận 1', wards: [] },
    D03: { name: 'Quận 3', wards: [] },
    D04: { name: 'Quận 4', wards: [] },
    D05: { name: 'Quận 5', wards: [] },
    D06: { name: 'Quận 6', wards: [] },
    D07: { name: 'Quận 7', wards: [] },
    D08: { name: 'Quận 8', wards: [] },
    D10: { name: 'Quận 10', wards: [] },
    D11: { name: 'Quận 11', wards: [] },
    D12: { name: 'Quận 12', wards: [] },
    DBT: { name: 'Quận Bình Tân', wards: [] },
    DBTH: { name: 'Quận Bình Thạnh', wards: [] },
    DGV: { name: 'Quận Gò Vấp', wards: [] },
    DPN: { name: 'Quận Phú Nhuận', wards: [] },
    DTP: { name: 'Quận Tân Bình', wards: [] },
    DTPU: { name: 'Quận Tân Phú', wards: [] },
    DTDU: { name: 'TP. Thủ Đức', wards: [] },
    DBH: { name: 'Huyện Bình Chánh', wards: [] },
    DCT: { name: 'Huyện Cần Giờ', wards: [] },
    DCU: { name: 'Huyện Củ Chi', wards: [] },
    DHM: { name: 'Huyện Hóc Môn', wards: [] },
    DNB: { name: 'Huyện Nhà Bè', wards: [] },
  }},

  // ── An Giang ─────────────────────────────────────────────────────────────
  AG: { name: 'An Giang', districts: {
    D01: { name: 'TP. Long Xuyên', wards: [] },
    D02: { name: 'TP. Châu Đốc', wards: [] },
    D03: { name: 'TX. Tân Châu', wards: [] },
    D04: { name: 'Huyện An Phú', wards: [] },
    D05: { name: 'Huyện Châu Phú', wards: [] },
    D06: { name: 'Huyện Châu Thành', wards: [] },
    D07: { name: 'Huyện Chợ Mới', wards: [] },
    D08: { name: 'Huyện Phú Tân', wards: [] },
    D09: { name: 'Huyện Thoại Sơn', wards: [] },
    D10: { name: 'Huyện Tịnh Biên', wards: [] },
    D11: { name: 'Huyện Tri Tôn', wards: [] },
  }},

  // ── Bà Rịa - Vũng Tàu ────────────────────────────────────────────────────
  BRVT: { name: 'Bà Rịa - Vũng Tàu', districts: {
    D01: { name: 'TP. Vũng Tàu', wards: [] },
    D02: { name: 'TP. Bà Rịa', wards: [] },
    D03: { name: 'Huyện Châu Đức', wards: [] },
    D04: { name: 'Huyện Côn Đảo', wards: [] },
    D05: { name: 'Huyện Đất Đỏ', wards: [] },
    D06: { name: 'Huyện Long Điền', wards: [] },
    D07: { name: 'TX. Phú Mỹ', wards: [] },
    D08: { name: 'Huyện Xuyên Mộc', wards: [] },
  }},

  // ── Bắc Giang ─────────────────────────────────────────────────────────────
  BG: { name: 'Bắc Giang', districts: {
    D01: { name: 'TP. Bắc Giang', wards: [] },
    D02: { name: 'Huyện Hiệp Hòa', wards: [] },
    D03: { name: 'Huyện Lạng Giang', wards: [] },
    D04: { name: 'Huyện Lục Nam', wards: [] },
    D05: { name: 'Huyện Lục Ngạn', wards: [] },
    D06: { name: 'Huyện Sơn Động', wards: [] },
    D07: { name: 'Huyện Tân Yên', wards: [] },
    D08: { name: 'Huyện Việt Yên', wards: [] },
    D09: { name: 'Huyện Yên Dũng', wards: [] },
    D10: { name: 'Huyện Yên Thế', wards: [] },
  }},

  // ── Bắc Kạn ──────────────────────────────────────────────────────────────
  BK: { name: 'Bắc Kạn', districts: {
    D01: { name: 'TP. Bắc Kạn', wards: [] },
    D02: { name: 'Huyện Ba Bể', wards: [] },
    D03: { name: 'Huyện Bạch Thông', wards: [] },
    D04: { name: 'Huyện Chợ Đồn', wards: [] },
    D05: { name: 'Huyện Chợ Mới', wards: [] },
    D06: { name: 'Huyện Na Rì', wards: [] },
    D07: { name: 'Huyện Ngân Sơn', wards: [] },
    D08: { name: 'Huyện Pác Nặm', wards: [] },
  }},

  // ── Bạc Liêu ─────────────────────────────────────────────────────────────
  BL: { name: 'Bạc Liêu', districts: {
    D01: { name: 'TP. Bạc Liêu', wards: [] },
    D02: { name: 'TX. Giá Rai', wards: [] },
    D03: { name: 'Huyện Đông Hải', wards: [] },
    D04: { name: 'Huyện Hòa Bình', wards: [] },
    D05: { name: 'Huyện Hồng Dân', wards: [] },
    D06: { name: 'Huyện Phước Long', wards: [] },
    D07: { name: 'Huyện Vĩnh Lợi', wards: [] },
  }},

  // ── Bắc Ninh ─────────────────────────────────────────────────────────────
  BN: { name: 'Bắc Ninh', districts: {
    D01: { name: 'TP. Bắc Ninh', wards: [] },
    D02: { name: 'TX. Từ Sơn', wards: [] },
    D03: { name: 'Huyện Gia Bình', wards: [] },
    D04: { name: 'Huyện Lương Tài', wards: [] },
    D05: { name: 'Huyện Quế Võ', wards: [] },
    D06: { name: 'Huyện Thuận Thành', wards: [] },
    D07: { name: 'Huyện Tiên Du', wards: [] },
    D08: { name: 'Huyện Yên Phong', wards: [] },
  }},

  // ── Bến Tre ──────────────────────────────────────────────────────────────
  BTE: { name: 'Bến Tre', districts: {
    D01: { name: 'TP. Bến Tre', wards: [] },
    D02: { name: 'Huyện Ba Tri', wards: [] },
    D03: { name: 'Huyện Bình Đại', wards: [] },
    D04: { name: 'Huyện Châu Thành', wards: [] },
    D05: { name: 'Huyện Chợ Lách', wards: [] },
    D06: { name: 'Huyện Giồng Trôm', wards: [] },
    D07: { name: 'Huyện Mỏ Cày Bắc', wards: [] },
    D08: { name: 'Huyện Mỏ Cày Nam', wards: [] },
    D09: { name: 'Huyện Thạnh Phú', wards: [] },
  }},

  // ── Bình Định ─────────────────────────────────────────────────────────────
  BDI: { name: 'Bình Định', districts: {
    D01: { name: 'TP. Quy Nhơn', wards: [] },
    D02: { name: 'TX. An Nhơn', wards: [] },
    D03: { name: 'TX. Hoài Nhơn', wards: [] },
    D04: { name: 'Huyện An Lão', wards: [] },
    D05: { name: 'Huyện Hoài Ân', wards: [] },
    D06: { name: 'Huyện Phù Cát', wards: [] },
    D07: { name: 'Huyện Phù Mỹ', wards: [] },
    D08: { name: 'Huyện Tây Sơn', wards: [] },
    D09: { name: 'Huyện Tuy Phước', wards: [] },
    D10: { name: 'Huyện Vân Canh', wards: [] },
    D11: { name: 'Huyện Vĩnh Thạnh', wards: [] },
  }},

  // ── Bình Dương ────────────────────────────────────────────────────────────
  BDU: { name: 'Bình Dương', districts: {
    D01: { name: 'TP. Thủ Dầu Một', wards: [] },
    D02: { name: 'TP. Dĩ An', wards: [] },
    D03: { name: 'TP. Thuận An', wards: [] },
    D04: { name: 'TX. Bến Cát', wards: [] },
    D05: { name: 'TX. Tân Uyên', wards: [] },
    D06: { name: 'Huyện Bàu Bàng', wards: [] },
    D07: { name: 'Huyện Bắc Tân Uyên', wards: [] },
    D08: { name: 'Huyện Dầu Tiếng', wards: [] },
    D09: { name: 'Huyện Phú Giáo', wards: [] },
  }},

  // ── Bình Phước ────────────────────────────────────────────────────────────
  BP: { name: 'Bình Phước', districts: {
    D01: { name: 'TP. Đồng Xoài', wards: [] },
    D02: { name: 'TX. Bình Long', wards: [] },
    D03: { name: 'TX. Phước Long', wards: [] },
    D04: { name: 'Huyện Bù Đăng', wards: [] },
    D05: { name: 'Huyện Bù Đốp', wards: [] },
    D06: { name: 'Huyện Bù Gia Mập', wards: [] },
    D07: { name: 'Huyện Chơn Thành', wards: [] },
    D08: { name: 'Huyện Đồng Phú', wards: [] },
    D09: { name: 'Huyện Hớn Quản', wards: [] },
    D10: { name: 'Huyện Lộc Ninh', wards: [] },
    D11: { name: 'Huyện Phú Riềng', wards: [] },
  }},

  // ── Bình Thuận ────────────────────────────────────────────────────────────
  BTH: { name: 'Bình Thuận', districts: {
    D01: { name: 'TP. Phan Thiết', wards: [] },
    D02: { name: 'TX. La Gi', wards: [] },
    D03: { name: 'Huyện Bắc Bình', wards: [] },
    D04: { name: 'Huyện Đức Linh', wards: [] },
    D05: { name: 'Huyện Hàm Tân', wards: [] },
    D06: { name: 'Huyện Hàm Thuận Bắc', wards: [] },
    D07: { name: 'Huyện Hàm Thuận Nam', wards: [] },
    D08: { name: 'Huyện Phú Quý', wards: [] },
    D09: { name: 'Huyện Tánh Linh', wards: [] },
    D10: { name: 'Huyện Tuy Phong', wards: [] },
  }},

  // ── Cà Mau ───────────────────────────────────────────────────────────────
  CM: { name: 'Cà Mau', districts: {
    D01: { name: 'TP. Cà Mau', wards: [] },
    D02: { name: 'Huyện Cái Nước', wards: [] },
    D03: { name: 'Huyện Đầm Dơi', wards: [] },
    D04: { name: 'Huyện Năm Căn', wards: [] },
    D05: { name: 'Huyện Ngọc Hiển', wards: [] },
    D06: { name: 'Huyện Phú Tân', wards: [] },
    D07: { name: 'Huyện Thới Bình', wards: [] },
    D08: { name: 'Huyện Trần Văn Thời', wards: [] },
    D09: { name: 'Huyện U Minh', wards: [] },
  }},

  // ── Cao Bằng ──────────────────────────────────────────────────────────────
  CB: { name: 'Cao Bằng', districts: {
    D01: { name: 'TP. Cao Bằng', wards: [] },
    D02: { name: 'Huyện Bảo Lạc', wards: [] },
    D03: { name: 'Huyện Bảo Lâm', wards: [] },
    D04: { name: 'Huyện Hà Quảng', wards: [] },
    D05: { name: 'Huyện Hạ Lang', wards: [] },
    D06: { name: 'Huyện Hòa An', wards: [] },
    D07: { name: 'Huyện Nguyên Bình', wards: [] },
    D08: { name: 'Huyện Quảng Hòa', wards: [] },
    D09: { name: 'Huyện Thạch An', wards: [] },
    D10: { name: 'Huyện Trùng Khánh', wards: [] },
  }},

  // ── Đắk Lắk ──────────────────────────────────────────────────────────────
  DLK: { name: 'Đắk Lắk', districts: {
    D01: { name: 'TP. Buôn Ma Thuột', wards: [] },
    D02: { name: 'TX. Buôn Hồ', wards: [] },
    D03: { name: 'Huyện Buôn Đôn', wards: [] },
    D04: { name: 'Huyện Cư Kuin', wards: [] },
    D05: { name: "Huyện Cư M'Gar", wards: [] },
    D06: { name: "Huyện Ea H'Leo", wards: [] },
    D07: { name: 'Huyện Ea Kar', wards: [] },
    D08: { name: 'Huyện Ea Súp', wards: [] },
    D09: { name: 'Huyện Krông Ana', wards: [] },
    D10: { name: 'Huyện Krông Bông', wards: [] },
    D11: { name: 'Huyện Krông Buk', wards: [] },
    D12: { name: 'Huyện Krông Năng', wards: [] },
    D13: { name: 'Huyện Krông Pắc', wards: [] },
    D14: { name: 'Huyện Lắk', wards: [] },
    D15: { name: "Huyện M'Đrắk", wards: [] },
  }},

  // ── Đắk Nông ─────────────────────────────────────────────────────────────
  DNO: { name: 'Đắk Nông', districts: {
    D01: { name: 'TP. Gia Nghĩa', wards: [] },
    D02: { name: 'Huyện Cư Jút', wards: [] },
    D03: { name: "Huyện Đắk G'Long", wards: [] },
    D04: { name: 'Huyện Đắk Mil', wards: [] },
    D05: { name: "Huyện Đắk R'Lấp", wards: [] },
    D06: { name: 'Huyện Đắk Song', wards: [] },
    D07: { name: 'Huyện Krông Nô', wards: [] },
    D08: { name: 'Huyện Tuy Đức', wards: [] },
  }},

  // ── Điện Biên ─────────────────────────────────────────────────────────────
  DB: { name: 'Điện Biên', districts: {
    D01: { name: 'TP. Điện Biên Phủ', wards: [] },
    D02: { name: 'TX. Mường Lay', wards: [] },
    D03: { name: 'Huyện Điện Biên', wards: [] },
    D04: { name: 'Huyện Điện Biên Đông', wards: [] },
    D05: { name: 'Huyện Mường Ảng', wards: [] },
    D06: { name: 'Huyện Mường Chà', wards: [] },
    D07: { name: 'Huyện Mường Nhé', wards: [] },
    D08: { name: 'Huyện Nậm Pồ', wards: [] },
    D09: { name: 'Huyện Tủa Chùa', wards: [] },
    D10: { name: 'Huyện Tuần Giáo', wards: [] },
  }},

  // ── Đồng Nai ─────────────────────────────────────────────────────────────
  DNI: { name: 'Đồng Nai', districts: {
    D01: { name: 'TP. Biên Hòa', wards: [] },
    D02: { name: 'TX. Long Khánh', wards: [] },
    D03: { name: 'Huyện Cẩm Mỹ', wards: [] },
    D04: { name: 'Huyện Định Quán', wards: [] },
    D05: { name: 'Huyện Long Thành', wards: [] },
    D06: { name: 'Huyện Nhơn Trạch', wards: [] },
    D07: { name: 'Huyện Tân Phú', wards: [] },
    D08: { name: 'Huyện Thống Nhất', wards: [] },
    D09: { name: 'Huyện Trảng Bom', wards: [] },
    D10: { name: 'Huyện Vĩnh Cửu', wards: [] },
    D11: { name: 'Huyện Xuân Lộc', wards: [] },
  }},

  // ── Đồng Tháp ────────────────────────────────────────────────────────────
  DTP: { name: 'Đồng Tháp', districts: {
    D01: { name: 'TP. Cao Lãnh', wards: [] },
    D02: { name: 'TP. Sa Đéc', wards: [] },
    D03: { name: 'TX. Hồng Ngự', wards: [] },
    D04: { name: 'Huyện Cao Lãnh', wards: [] },
    D05: { name: 'Huyện Châu Thành', wards: [] },
    D06: { name: 'Huyện Hồng Ngự', wards: [] },
    D07: { name: 'Huyện Lai Vung', wards: [] },
    D08: { name: 'Huyện Lấp Vò', wards: [] },
    D09: { name: 'Huyện Tam Nông', wards: [] },
    D10: { name: 'Huyện Tân Hồng', wards: [] },
    D11: { name: 'Huyện Thanh Bình', wards: [] },
    D12: { name: 'Huyện Tháp Mười', wards: [] },
  }},

  // ── Gia Lai ──────────────────────────────────────────────────────────────
  GL: { name: 'Gia Lai', districts: {
    D01: { name: 'TP. Pleiku', wards: [] },
    D02: { name: 'TX. An Khê', wards: [] },
    D03: { name: 'TX. Ayun Pa', wards: [] },
    D04: { name: 'Huyện Chư Păh', wards: [] },
    D05: { name: 'Huyện Chư Prông', wards: [] },
    D06: { name: 'Huyện Chư Pưh', wards: [] },
    D07: { name: 'Huyện Chư Sê', wards: [] },
    D08: { name: 'Huyện Đắk Đoa', wards: [] },
    D09: { name: 'Huyện Đắk Pơ', wards: [] },
    D10: { name: 'Huyện Đức Cơ', wards: [] },
    D11: { name: 'Huyện Ia Grai', wards: [] },
    D12: { name: 'Huyện Ia Pa', wards: [] },
    D13: { name: "Huyện K'Bang", wards: [] },
    D14: { name: 'Huyện Kông Chro', wards: [] },
    D15: { name: 'Huyện Krông Pa', wards: [] },
    D16: { name: 'Huyện Mang Yang', wards: [] },
    D17: { name: 'Huyện Phú Thiện', wards: [] },
  }},

  // ── Hà Giang ─────────────────────────────────────────────────────────────
  HGI: { name: 'Hà Giang', districts: {
    D01: { name: 'TP. Hà Giang', wards: [] },
    D02: { name: 'Huyện Bắc Mê', wards: [] },
    D03: { name: 'Huyện Bắc Quang', wards: [] },
    D04: { name: 'Huyện Đồng Văn', wards: [] },
    D05: { name: 'Huyện Hoàng Su Phì', wards: [] },
    D06: { name: 'Huyện Mèo Vạc', wards: [] },
    D07: { name: 'Huyện Quản Bạ', wards: [] },
    D08: { name: 'Huyện Quang Bình', wards: [] },
    D09: { name: 'Huyện Vị Xuyên', wards: [] },
    D10: { name: 'Huyện Xín Mần', wards: [] },
    D11: { name: 'Huyện Yên Minh', wards: [] },
  }},

  // ── Hà Nam ────────────────────────────────────────────────────────────────
  HNam: { name: 'Hà Nam', districts: {
    D01: { name: 'TP. Phủ Lý', wards: [] },
    D02: { name: 'TX. Duy Tiên', wards: [] },
    D03: { name: 'Huyện Bình Lục', wards: [] },
    D04: { name: 'Huyện Kim Bảng', wards: [] },
    D05: { name: 'Huyện Lý Nhân', wards: [] },
    D06: { name: 'Huyện Thanh Liêm', wards: [] },
  }},

  // ── Hà Tĩnh ──────────────────────────────────────────────────────────────
  HT: { name: 'Hà Tĩnh', districts: {
    D01: { name: 'TP. Hà Tĩnh', wards: [] },
    D02: { name: 'TX. Hồng Lĩnh', wards: [] },
    D03: { name: 'TX. Kỳ Anh', wards: [] },
    D04: { name: 'Huyện Cẩm Xuyên', wards: [] },
    D05: { name: 'Huyện Can Lộc', wards: [] },
    D06: { name: 'Huyện Đức Thọ', wards: [] },
    D07: { name: 'Huyện Hương Khê', wards: [] },
    D08: { name: 'Huyện Hương Sơn', wards: [] },
    D09: { name: 'Huyện Kỳ Anh', wards: [] },
    D10: { name: 'Huyện Lộc Hà', wards: [] },
    D11: { name: 'Huyện Nghi Xuân', wards: [] },
    D12: { name: 'Huyện Thạch Hà', wards: [] },
    D13: { name: 'Huyện Vũ Quang', wards: [] },
  }},

  // ── Hải Dương ─────────────────────────────────────────────────────────────
  HD: { name: 'Hải Dương', districts: {
    D01: { name: 'TP. Hải Dương', wards: [] },
    D02: { name: 'TX. Chí Linh', wards: [] },
    D03: { name: 'TX. Kinh Môn', wards: [] },
    D04: { name: 'Huyện Bình Giang', wards: [] },
    D05: { name: 'Huyện Cẩm Giàng', wards: [] },
    D06: { name: 'Huyện Gia Lộc', wards: [] },
    D07: { name: 'Huyện Kim Thành', wards: [] },
    D08: { name: 'Huyện Nam Sách', wards: [] },
    D09: { name: 'Huyện Ninh Giang', wards: [] },
    D10: { name: 'Huyện Thanh Hà', wards: [] },
    D11: { name: 'Huyện Thanh Miện', wards: [] },
    D12: { name: 'Huyện Tứ Kỳ', wards: [] },
  }},

  // ── Hậu Giang ─────────────────────────────────────────────────────────────
  HGiang: { name: 'Hậu Giang', districts: {
    D01: { name: 'TP. Vị Thanh', wards: [] },
    D02: { name: 'TX. Long Mỹ', wards: [] },
    D03: { name: 'TX. Ngã Bảy', wards: [] },
    D04: { name: 'Huyện Châu Thành', wards: [] },
    D05: { name: 'Huyện Châu Thành A', wards: [] },
    D06: { name: 'Huyện Long Mỹ', wards: [] },
    D07: { name: 'Huyện Phụng Hiệp', wards: [] },
    D08: { name: 'Huyện Vị Thủy', wards: [] },
  }},

  // ── Hòa Bình ─────────────────────────────────────────────────────────────
  HB: { name: 'Hòa Bình', districts: {
    D01: { name: 'TP. Hòa Bình', wards: [] },
    D02: { name: 'Huyện Cao Phong', wards: [] },
    D03: { name: 'Huyện Đà Bắc', wards: [] },
    D04: { name: 'Huyện Kim Bôi', wards: [] },
    D05: { name: 'Huyện Lạc Sơn', wards: [] },
    D06: { name: 'Huyện Lạc Thủy', wards: [] },
    D07: { name: 'Huyện Lương Sơn', wards: [] },
    D08: { name: 'Huyện Mai Châu', wards: [] },
    D09: { name: 'Huyện Tân Lạc', wards: [] },
    D10: { name: 'Huyện Yên Thủy', wards: [] },
    D11: { name: 'Huyện Cao Phong', wards: [] },
  }},

  // ── Hưng Yên ─────────────────────────────────────────────────────────────
  HY: { name: 'Hưng Yên', districts: {
    D01: { name: 'TP. Hưng Yên', wards: [] },
    D02: { name: 'TX. Mỹ Hào', wards: [] },
    D03: { name: 'Huyện Ân Thi', wards: [] },
    D04: { name: 'Huyện Khoái Châu', wards: [] },
    D05: { name: 'Huyện Kim Động', wards: [] },
    D06: { name: 'Huyện Phù Cừ', wards: [] },
    D07: { name: 'Huyện Tiên Lữ', wards: [] },
    D08: { name: 'Huyện Văn Giang', wards: [] },
    D09: { name: 'Huyện Văn Lâm', wards: [] },
    D10: { name: 'Huyện Yên Mỹ', wards: [] },
  }},

  // ── Khánh Hòa ────────────────────────────────────────────────────────────
  KH: { name: 'Khánh Hòa', districts: {
    D01: { name: 'TP. Nha Trang', wards: [] },
    D02: { name: 'TP. Cam Ranh', wards: [] },
    D03: { name: 'TX. Ninh Hòa', wards: [] },
    D04: { name: 'Huyện Cam Lâm', wards: [] },
    D05: { name: 'Huyện Diên Khánh', wards: [] },
    D06: { name: 'Huyện Khánh Sơn', wards: [] },
    D07: { name: 'Huyện Khánh Vĩnh', wards: [] },
    D08: { name: 'Huyện Trường Sa', wards: [] },
    D09: { name: 'Huyện Vạn Ninh', wards: [] },
  }},

  // ── Kiên Giang ───────────────────────────────────────────────────────────
  KG: { name: 'Kiên Giang', districts: {
    D01: { name: 'TP. Rạch Giá', wards: [] },
    D02: { name: 'TX. Hà Tiên', wards: [] },
    D03: { name: 'TP. Phú Quốc', wards: [] },
    D04: { name: 'Huyện An Biên', wards: [] },
    D05: { name: 'Huyện An Minh', wards: [] },
    D06: { name: 'Huyện Châu Thành', wards: [] },
    D07: { name: 'Huyện Giang Thành', wards: [] },
    D08: { name: 'Huyện Giồng Riềng', wards: [] },
    D09: { name: 'Huyện Gò Quao', wards: [] },
    D10: { name: 'Huyện Hòn Đất', wards: [] },
    D11: { name: 'Huyện Kiên Hải', wards: [] },
    D12: { name: 'Huyện Kiên Lương', wards: [] },
    D13: { name: 'Huyện Tân Hiệp', wards: [] },
    D14: { name: 'Huyện U Minh Thượng', wards: [] },
    D15: { name: 'Huyện Vĩnh Thuận', wards: [] },
  }},

  // ── Kon Tum ──────────────────────────────────────────────────────────────
  KT: { name: 'Kon Tum', districts: {
    D01: { name: 'TP. Kon Tum', wards: [] },
    D02: { name: 'Huyện Đắk Glei', wards: [] },
    D03: { name: 'Huyện Đắk Hà', wards: [] },
    D04: { name: 'Huyện Đắk Tô', wards: [] },
    D05: { name: "Huyện Ia H'Drai", wards: [] },
    D06: { name: 'Huyện Kon Plông', wards: [] },
    D07: { name: 'Huyện Kon Rẫy', wards: [] },
    D08: { name: 'Huyện Ngọc Hồi', wards: [] },
    D09: { name: 'Huyện Sa Thầy', wards: [] },
    D10: { name: 'Huyện Tu Mơ Rông', wards: [] },
  }},

  // ── Lai Châu ─────────────────────────────────────────────────────────────
  LCI: { name: 'Lai Châu', districts: {
    D01: { name: 'TP. Lai Châu', wards: [] },
    D02: { name: 'Huyện Mường Tè', wards: [] },
    D03: { name: 'Huyện Nậm Nhùn', wards: [] },
    D04: { name: 'Huyện Phong Thổ', wards: [] },
    D05: { name: 'Huyện Sìn Hồ', wards: [] },
    D06: { name: 'Huyện Tam Đường', wards: [] },
    D07: { name: 'Huyện Tân Uyên', wards: [] },
    D08: { name: 'Huyện Than Uyên', wards: [] },
  }},

  // ── Lâm Đồng ─────────────────────────────────────────────────────────────
  LD: { name: 'Lâm Đồng', districts: {
    D01: { name: 'TP. Đà Lạt', wards: [] },
    D02: { name: 'TP. Bảo Lộc', wards: [] },
    D03: { name: 'Huyện Bảo Lâm', wards: [] },
    D04: { name: 'Huyện Cát Tiên', wards: [] },
    D05: { name: 'Huyện Di Linh', wards: [] },
    D06: { name: 'Huyện Đạ Huoai', wards: [] },
    D07: { name: 'Huyện Đạ Tẻh', wards: [] },
    D08: { name: 'Huyện Đam Rông', wards: [] },
    D09: { name: 'Huyện Đơn Dương', wards: [] },
    D10: { name: 'Huyện Đức Trọng', wards: [] },
    D11: { name: 'Huyện Lạc Dương', wards: [] },
    D12: { name: 'Huyện Lâm Hà', wards: [] },
  }},

  // ── Lạng Sơn ─────────────────────────────────────────────────────────────
  LS: { name: 'Lạng Sơn', districts: {
    D01: { name: 'TP. Lạng Sơn', wards: [] },
    D02: { name: 'Huyện Bắc Sơn', wards: [] },
    D03: { name: 'Huyện Bình Gia', wards: [] },
    D04: { name: 'Huyện Cao Lộc', wards: [] },
    D05: { name: 'Huyện Chi Lăng', wards: [] },
    D06: { name: 'Huyện Đình Lập', wards: [] },
    D07: { name: 'Huyện Hữu Lũng', wards: [] },
    D08: { name: 'Huyện Lộc Bình', wards: [] },
    D09: { name: 'Huyện Tràng Định', wards: [] },
    D10: { name: 'Huyện Văn Lãng', wards: [] },
    D11: { name: 'Huyện Văn Quan', wards: [] },
  }},

  // ── Lào Cai ──────────────────────────────────────────────────────────────
  LO: { name: 'Lào Cai', districts: {
    D01: { name: 'TP. Lào Cai', wards: [] },
    D02: { name: 'TX. Sa Pa', wards: [] },
    D03: { name: 'Huyện Bắc Hà', wards: [] },
    D04: { name: 'Huyện Bảo Thắng', wards: [] },
    D05: { name: 'Huyện Bảo Yên', wards: [] },
    D06: { name: 'Huyện Bát Xát', wards: [] },
    D07: { name: 'Huyện Mường Khương', wards: [] },
    D08: { name: 'Huyện Si Ma Cai', wards: [] },
    D09: { name: 'Huyện Văn Bàn', wards: [] },
  }},

  // ── Long An ──────────────────────────────────────────────────────────────
  LA: { name: 'Long An', districts: {
    D01: { name: 'TP. Tân An', wards: [] },
    D02: { name: 'TX. Kiến Tường', wards: [] },
    D03: { name: 'Huyện Bến Lức', wards: [] },
    D04: { name: 'Huyện Cần Đước', wards: [] },
    D05: { name: 'Huyện Cần Giuộc', wards: [] },
    D06: { name: 'Huyện Châu Thành', wards: [] },
    D07: { name: 'Huyện Đức Hòa', wards: [] },
    D08: { name: 'Huyện Đức Huệ', wards: [] },
    D09: { name: 'Huyện Mộc Hóa', wards: [] },
    D10: { name: 'Huyện Tân Hưng', wards: [] },
    D11: { name: 'Huyện Tân Thạnh', wards: [] },
    D12: { name: 'Huyện Tân Trụ', wards: [] },
    D13: { name: 'Huyện Thạnh Hóa', wards: [] },
    D14: { name: 'Huyện Thủ Thừa', wards: [] },
    D15: { name: 'Huyện Vĩnh Hưng', wards: [] },
  }},

  // ── Nam Định ─────────────────────────────────────────────────────────────
  ND: { name: 'Nam Định', districts: {
    D01: { name: 'TP. Nam Định', wards: [] },
    D02: { name: 'Huyện Giao Thủy', wards: [] },
    D03: { name: 'Huyện Hải Hậu', wards: [] },
    D04: { name: 'Huyện Mỹ Lộc', wards: [] },
    D05: { name: 'Huyện Nam Trực', wards: [] },
    D06: { name: 'Huyện Nghĩa Hưng', wards: [] },
    D07: { name: 'Huyện Trực Ninh', wards: [] },
    D08: { name: 'Huyện Vụ Bản', wards: [] },
    D09: { name: 'Huyện Xuân Trường', wards: [] },
    D10: { name: 'Huyện Ý Yên', wards: [] },
  }},

  // ── Nghệ An ──────────────────────────────────────────────────────────────
  NA: { name: 'Nghệ An', districts: {
    D01: { name: 'TP. Vinh', wards: [] },
    D02: { name: 'TX. Cửa Lò', wards: [] },
    D03: { name: 'TX. Hoàng Mai', wards: [] },
    D04: { name: 'TX. Thái Hòa', wards: [] },
    D05: { name: 'Huyện Anh Sơn', wards: [] },
    D06: { name: 'Huyện Con Cuông', wards: [] },
    D07: { name: 'Huyện Diễn Châu', wards: [] },
    D08: { name: 'Huyện Đô Lương', wards: [] },
    D09: { name: 'Huyện Hưng Nguyên', wards: [] },
    D10: { name: 'Huyện Kỳ Sơn', wards: [] },
    D11: { name: 'Huyện Nam Đàn', wards: [] },
    D12: { name: 'Huyện Nghĩa Đàn', wards: [] },
    D13: { name: 'Huyện Nghi Lộc', wards: [] },
    D14: { name: 'Huyện Quế Phong', wards: [] },
    D15: { name: 'Huyện Quỳ Châu', wards: [] },
    D16: { name: 'Huyện Quỳ Hợp', wards: [] },
    D17: { name: 'Huyện Quỳnh Lưu', wards: [] },
    D18: { name: 'Huyện Tân Kỳ', wards: [] },
    D19: { name: 'Huyện Thanh Chương', wards: [] },
    D20: { name: 'Huyện Tương Dương', wards: [] },
    D21: { name: 'Huyện Yên Thành', wards: [] },
  }},

  // ── Ninh Bình ────────────────────────────────────────────────────────────
  NB: { name: 'Ninh Bình', districts: {
    D01: { name: 'TP. Ninh Bình', wards: [] },
    D02: { name: 'TX. Tam Điệp', wards: [] },
    D03: { name: 'Huyện Gia Viễn', wards: [] },
    D04: { name: 'Huyện Hoa Lư', wards: [] },
    D05: { name: 'Huyện Kim Sơn', wards: [] },
    D06: { name: 'Huyện Nho Quan', wards: [] },
    D07: { name: 'Huyện Yên Khánh', wards: [] },
    D08: { name: 'Huyện Yên Mô', wards: [] },
  }},

  // ── Ninh Thuận ───────────────────────────────────────────────────────────
  NTH: { name: 'Ninh Thuận', districts: {
    D01: { name: 'TP. Phan Rang-Tháp Chàm', wards: [] },
    D02: { name: 'Huyện Bác Ái', wards: [] },
    D03: { name: 'Huyện Ninh Hải', wards: [] },
    D04: { name: 'Huyện Ninh Phước', wards: [] },
    D05: { name: 'Huyện Ninh Sơn', wards: [] },
    D06: { name: 'Huyện Thuận Bắc', wards: [] },
    D07: { name: 'Huyện Thuận Nam', wards: [] },
  }},

  // ── Phú Thọ ──────────────────────────────────────────────────────────────
  PT: { name: 'Phú Thọ', districts: {
    D01: { name: 'TP. Việt Trì', wards: [] },
    D02: { name: 'TX. Phú Thọ', wards: [] },
    D03: { name: 'Huyện Cẩm Khê', wards: [] },
    D04: { name: 'Huyện Đoan Hùng', wards: [] },
    D05: { name: 'Huyện Hạ Hòa', wards: [] },
    D06: { name: 'Huyện Lâm Thao', wards: [] },
    D07: { name: 'Huyện Phù Ninh', wards: [] },
    D08: { name: 'Huyện Tam Nông', wards: [] },
    D09: { name: 'Huyện Tân Sơn', wards: [] },
    D10: { name: 'Huyện Thanh Ba', wards: [] },
    D11: { name: 'Huyện Thanh Sơn', wards: [] },
    D12: { name: 'Huyện Thanh Thủy', wards: [] },
    D13: { name: 'Huyện Yên Lập', wards: [] },
  }},

  // ── Phú Yên ──────────────────────────────────────────────────────────────
  PY: { name: 'Phú Yên', districts: {
    D01: { name: 'TP. Tuy Hòa', wards: [] },
    D02: { name: 'TX. Đông Hòa', wards: [] },
    D03: { name: 'TX. Sông Cầu', wards: [] },
    D04: { name: 'Huyện Đồng Xuân', wards: [] },
    D05: { name: 'Huyện Phú Hòa', wards: [] },
    D06: { name: 'Huyện Sông Hinh', wards: [] },
    D07: { name: 'Huyện Sơn Hòa', wards: [] },
    D08: { name: 'Huyện Tây Hòa', wards: [] },
    D09: { name: 'Huyện Tuy An', wards: [] },
  }},

  // ── Quảng Bình ───────────────────────────────────────────────────────────
  QB: { name: 'Quảng Bình', districts: {
    D01: { name: 'TP. Đồng Hới', wards: [] },
    D02: { name: 'TX. Ba Đồn', wards: [] },
    D03: { name: 'Huyện Bố Trạch', wards: [] },
    D04: { name: 'Huyện Lệ Thủy', wards: [] },
    D05: { name: 'Huyện Minh Hóa', wards: [] },
    D06: { name: 'Huyện Quảng Ninh', wards: [] },
    D07: { name: 'Huyện Quảng Trạch', wards: [] },
    D08: { name: 'Huyện Tuyên Hóa', wards: [] },
  }},

  // ── Quảng Nam ────────────────────────────────────────────────────────────
  QNA: { name: 'Quảng Nam', districts: {
    D01: { name: 'TP. Tam Kỳ', wards: [] },
    D02: { name: 'TP. Hội An', wards: [] },
    D03: { name: 'TX. Điện Bàn', wards: [] },
    D04: { name: 'Huyện Bắc Trà My', wards: [] },
    D05: { name: 'Huyện Đại Lộc', wards: [] },
    D06: { name: 'Huyện Đông Giang', wards: [] },
    D07: { name: 'Huyện Duy Xuyên', wards: [] },
    D08: { name: 'Huyện Hiệp Đức', wards: [] },
    D09: { name: 'Huyện Nam Giang', wards: [] },
    D10: { name: 'Huyện Nam Trà My', wards: [] },
    D11: { name: 'Huyện Nông Sơn', wards: [] },
    D12: { name: 'Huyện Núi Thành', wards: [] },
    D13: { name: 'Huyện Phú Ninh', wards: [] },
    D14: { name: 'Huyện Phước Sơn', wards: [] },
    D15: { name: 'Huyện Quế Sơn', wards: [] },
    D16: { name: 'Huyện Tây Giang', wards: [] },
    D17: { name: 'Huyện Thăng Bình', wards: [] },
    D18: { name: 'Huyện Tiên Phước', wards: [] },
  }},

  // ── Quảng Ngãi ───────────────────────────────────────────────────────────
  QNG: { name: 'Quảng Ngãi', districts: {
    D01: { name: 'TP. Quảng Ngãi', wards: [] },
    D02: { name: 'TX. Đức Phổ', wards: [] },
    D03: { name: 'Huyện Ba Tơ', wards: [] },
    D04: { name: 'Huyện Bình Sơn', wards: [] },
    D05: { name: 'Huyện Lý Sơn', wards: [] },
    D06: { name: 'Huyện Minh Long', wards: [] },
    D07: { name: 'Huyện Mộ Đức', wards: [] },
    D08: { name: 'Huyện Nghĩa Hành', wards: [] },
    D09: { name: 'Huyện Sơn Hà', wards: [] },
    D10: { name: 'Huyện Sơn Tây', wards: [] },
    D11: { name: 'Huyện Sơn Tịnh', wards: [] },
    D12: { name: 'Huyện Tây Trà', wards: [] },
    D13: { name: 'Huyện Trà Bồng', wards: [] },
    D14: { name: 'Huyện Tư Nghĩa', wards: [] },
  }},

  // ── Quảng Ninh ───────────────────────────────────────────────────────────
  QNI: { name: 'Quảng Ninh', districts: {
    D01: { name: 'TP. Hạ Long', wards: [] },
    D02: { name: 'TP. Cẩm Phả', wards: [] },
    D03: { name: 'TP. Uông Bí', wards: [] },
    D04: { name: 'TX. Đông Triều', wards: [] },
    D05: { name: 'TX. Móng Cái', wards: [] },
    D06: { name: 'TX. Quảng Yên', wards: [] },
    D07: { name: 'Huyện Ba Chẽ', wards: [] },
    D08: { name: 'Huyện Bình Liêu', wards: [] },
    D09: { name: 'Huyện Cô Tô', wards: [] },
    D10: { name: 'Huyện Đầm Hà', wards: [] },
    D11: { name: 'Huyện Hải Hà', wards: [] },
    D12: { name: 'Huyện Tiên Yên', wards: [] },
    D13: { name: 'Huyện Vân Đồn', wards: [] },
  }},

  // ── Quảng Trị ────────────────────────────────────────────────────────────
  QTR: { name: 'Quảng Trị', districts: {
    D01: { name: 'TP. Đông Hà', wards: [] },
    D02: { name: 'TX. Quảng Trị', wards: [] },
    D03: { name: 'Huyện Cam Lộ', wards: [] },
    D04: { name: 'Huyện Cồn Cỏ', wards: [] },
    D05: { name: 'Huyện Đa Krông', wards: [] },
    D06: { name: 'Huyện Gio Linh', wards: [] },
    D07: { name: 'Huyện Hải Lăng', wards: [] },
    D08: { name: 'Huyện Hướng Hóa', wards: [] },
    D09: { name: 'Huyện Triệu Phong', wards: [] },
    D10: { name: 'Huyện Vĩnh Linh', wards: [] },
  }},

  // ── Sóc Trăng ────────────────────────────────────────────────────────────
  STR: { name: 'Sóc Trăng', districts: {
    D01: { name: 'TP. Sóc Trăng', wards: [] },
    D02: { name: 'TX. Ngã Năm', wards: [] },
    D03: { name: 'TX. Vĩnh Châu', wards: [] },
    D04: { name: 'Huyện Châu Thành', wards: [] },
    D05: { name: 'Huyện Cù Lao Dung', wards: [] },
    D06: { name: 'Huyện Kế Sách', wards: [] },
    D07: { name: 'Huyện Long Phú', wards: [] },
    D08: { name: 'Huyện Mỹ Tú', wards: [] },
    D09: { name: 'Huyện Mỹ Xuyên', wards: [] },
    D10: { name: 'Huyện Thạnh Trị', wards: [] },
    D11: { name: 'Huyện Trần Đề', wards: [] },
  }},

  // ── Sơn La ───────────────────────────────────────────────────────────────
  SL: { name: 'Sơn La', districts: {
    D01: { name: 'TP. Sơn La', wards: [] },
    D02: { name: 'Huyện Bắc Yên', wards: [] },
    D03: { name: 'Huyện Mai Sơn', wards: [] },
    D04: { name: 'Huyện Mộc Châu', wards: [] },
    D05: { name: 'Huyện Mường La', wards: [] },
    D06: { name: 'Huyện Phù Yên', wards: [] },
    D07: { name: 'Huyện Quỳnh Nhai', wards: [] },
    D08: { name: 'Huyện Sông Mã', wards: [] },
    D09: { name: 'Huyện Sốp Cộp', wards: [] },
    D10: { name: 'Huyện Thuận Châu', wards: [] },
    D11: { name: 'Huyện Vân Hồ', wards: [] },
    D12: { name: 'Huyện Yên Châu', wards: [] },
  }},

  // ── Tây Ninh ─────────────────────────────────────────────────────────────
  TN2: { name: 'Tây Ninh', districts: {
    D01: { name: 'TP. Tây Ninh', wards: [] },
    D02: { name: 'TX. Hòa Thành', wards: [] },
    D03: { name: 'TX. Trảng Bàng', wards: [] },
    D04: { name: 'Huyện Bến Cầu', wards: [] },
    D05: { name: 'Huyện Châu Thành', wards: [] },
    D06: { name: 'Huyện Dương Minh Châu', wards: [] },
    D07: { name: 'Huyện Gò Dầu', wards: [] },
    D08: { name: 'Huyện Tân Biên', wards: [] },
    D09: { name: 'Huyện Tân Châu', wards: [] },
  }},

  // ── Thái Bình ────────────────────────────────────────────────────────────
  TB: { name: 'Thái Bình', districts: {
    D01: { name: 'TP. Thái Bình', wards: [] },
    D02: { name: 'Huyện Đông Hưng', wards: [] },
    D03: { name: 'Huyện Hưng Hà', wards: [] },
    D04: { name: 'Huyện Kiến Xương', wards: [] },
    D05: { name: 'Huyện Quỳnh Phụ', wards: [] },
    D06: { name: 'Huyện Thái Thụy', wards: [] },
    D07: { name: 'Huyện Tiền Hải', wards: [] },
    D08: { name: 'Huyện Vũ Thư', wards: [] },
  }},

  // ── Thái Nguyên ──────────────────────────────────────────────────────────
  TNguyen: { name: 'Thái Nguyên', districts: {
    D01: { name: 'TP. Thái Nguyên', wards: [] },
    D02: { name: 'TX. Phổ Yên', wards: [] },
    D03: { name: 'TX. Sông Công', wards: [] },
    D04: { name: 'Huyện Định Hóa', wards: [] },
    D05: { name: 'Huyện Đại Từ', wards: [] },
    D06: { name: 'Huyện Đồng Hỷ', wards: [] },
    D07: { name: 'Huyện Phú Bình', wards: [] },
    D08: { name: 'Huyện Phú Lương', wards: [] },
    D09: { name: 'Huyện Võ Nhai', wards: [] },
  }},

  // ── Thanh Hóa ────────────────────────────────────────────────────────────
  TH: { name: 'Thanh Hóa', districts: {
    D01: { name: 'TP. Thanh Hóa', wards: [] },
    D02: { name: 'TX. Bỉm Sơn', wards: [] },
    D03: { name: 'TX. Sầm Sơn', wards: [] },
    D04: { name: 'Huyện Bá Thước', wards: [] },
    D05: { name: 'Huyện Cẩm Thủy', wards: [] },
    D06: { name: 'Huyện Đông Sơn', wards: [] },
    D07: { name: 'Huyện Hà Trung', wards: [] },
    D08: { name: 'Huyện Hậu Lộc', wards: [] },
    D09: { name: 'Huyện Hoằng Hóa', wards: [] },
    D10: { name: 'Huyện Lang Chánh', wards: [] },
    D11: { name: 'Huyện Mường Lát', wards: [] },
    D12: { name: 'Huyện Nga Sơn', wards: [] },
    D13: { name: 'Huyện Ngọc Lặc', wards: [] },
    D14: { name: 'Huyện Như Thanh', wards: [] },
    D15: { name: 'Huyện Như Xuân', wards: [] },
    D16: { name: 'Huyện Nông Cống', wards: [] },
    D17: { name: 'Huyện Quan Hóa', wards: [] },
    D18: { name: 'Huyện Quan Sơn', wards: [] },
    D19: { name: 'Huyện Quảng Xương', wards: [] },
    D20: { name: 'Huyện Thạch Thành', wards: [] },
    D21: { name: 'Huyện Thiệu Hóa', wards: [] },
    D22: { name: 'Huyện Thọ Xuân', wards: [] },
    D23: { name: 'Huyện Thường Xuân', wards: [] },
    D24: { name: 'Huyện Tĩnh Gia', wards: [] },
    D25: { name: 'Huyện Triệu Sơn', wards: [] },
    D26: { name: 'Huyện Vĩnh Lộc', wards: [] },
    D27: { name: 'Huyện Yên Định', wards: [] },
  }},

  // ── Thừa Thiên Huế ───────────────────────────────────────────────────────
  TTH: { name: 'Thừa Thiên Huế', districts: {
    D01: { name: 'TP. Huế', wards: [] },
    D02: { name: 'TX. Hương Thủy', wards: [] },
    D03: { name: 'TX. Hương Trà', wards: [] },
    D04: { name: 'Huyện A Lưới', wards: [] },
    D05: { name: 'Huyện Nam Đông', wards: [] },
    D06: { name: 'Huyện Phong Điền', wards: [] },
    D07: { name: 'Huyện Phú Lộc', wards: [] },
    D08: { name: 'Huyện Phú Vang', wards: [] },
    D09: { name: 'Huyện Quảng Điền', wards: [] },
  }},

  // ── Tiền Giang ───────────────────────────────────────────────────────────
  TG: { name: 'Tiền Giang', districts: {
    D01: { name: 'TP. Mỹ Tho', wards: [] },
    D02: { name: 'TX. Cai Lậy', wards: [] },
    D03: { name: 'TX. Gò Công', wards: [] },
    D04: { name: 'Huyện Cái Bè', wards: [] },
    D05: { name: 'Huyện Châu Thành', wards: [] },
    D06: { name: 'Huyện Chợ Gạo', wards: [] },
    D07: { name: 'Huyện Gò Công Đông', wards: [] },
    D08: { name: 'Huyện Gò Công Tây', wards: [] },
    D09: { name: 'Huyện Tân Phú Đông', wards: [] },
    D10: { name: 'Huyện Tân Phước', wards: [] },
  }},

  // ── Trà Vinh ─────────────────────────────────────────────────────────────
  TV: { name: 'Trà Vinh', districts: {
    D01: { name: 'TP. Trà Vinh', wards: [] },
    D02: { name: 'TX. Duyên Hải', wards: [] },
    D03: { name: 'Huyện Càng Long', wards: [] },
    D04: { name: 'Huyện Cầu Kè', wards: [] },
    D05: { name: 'Huyện Cầu Ngang', wards: [] },
    D06: { name: 'Huyện Châu Thành', wards: [] },
    D07: { name: 'Huyện Duyên Hải', wards: [] },
    D08: { name: 'Huyện Tiểu Cần', wards: [] },
    D09: { name: 'Huyện Trà Cú', wards: [] },
  }},

  // ── Tuyên Quang ──────────────────────────────────────────────────────────
  TQ: { name: 'Tuyên Quang', districts: {
    D01: { name: 'TP. Tuyên Quang', wards: [] },
    D02: { name: 'Huyện Chiêm Hóa', wards: [] },
    D03: { name: 'Huyện Hàm Yên', wards: [] },
    D04: { name: 'Huyện Lâm Bình', wards: [] },
    D05: { name: 'Huyện Na Hang', wards: [] },
    D06: { name: 'Huyện Sơn Dương', wards: [] },
    D07: { name: 'Huyện Yên Sơn', wards: [] },
  }},

  // ── Vĩnh Long ────────────────────────────────────────────────────────────
  VL: { name: 'Vĩnh Long', districts: {
    D01: { name: 'TP. Vĩnh Long', wards: [] },
    D02: { name: 'TX. Bình Minh', wards: [] },
    D03: { name: 'Huyện Bình Tân', wards: [] },
    D04: { name: 'Huyện Long Hồ', wards: [] },
    D05: { name: 'Huyện Mang Thít', wards: [] },
    D06: { name: 'Huyện Tam Bình', wards: [] },
    D07: { name: 'Huyện Trà Ôn', wards: [] },
    D08: { name: 'Huyện Vũng Liêm', wards: [] },
  }},

  // ── Vĩnh Phúc ────────────────────────────────────────────────────────────
  VP: { name: 'Vĩnh Phúc', districts: {
    D01: { name: 'TP. Vĩnh Yên', wards: [] },
    D02: { name: 'TX. Phúc Yên', wards: [] },
    D03: { name: 'Huyện Bình Xuyên', wards: [] },
    D04: { name: 'Huyện Lập Thạch', wards: [] },
    D05: { name: 'Huyện Sông Lô', wards: [] },
    D06: { name: 'Huyện Tam Đảo', wards: [] },
    D07: { name: 'Huyện Tam Dương', wards: [] },
    D08: { name: 'Huyện Vĩnh Tường', wards: [] },
    D09: { name: 'Huyện Yên Lạc', wards: [] },
  }},

  // ── Yên Bái ──────────────────────────────────────────────────────────────
  YB: { name: 'Yên Bái', districts: {
    D01: { name: 'TP. Yên Bái', wards: [] },
    D02: { name: 'TX. Nghĩa Lộ', wards: [] },
    D03: { name: 'Huyện Lục Yên', wards: [] },
    D04: { name: 'Huyện Mù Căng Chải', wards: [] },
    D05: { name: 'Huyện Trạm Tấu', wards: [] },
    D06: { name: 'Huyện Trấn Yên', wards: [] },
    D07: { name: 'Huyện Văn Chấn', wards: [] },
    D08: { name: 'Huyện Văn Yên', wards: [] },
    D09: { name: 'Huyện Yên Bình', wards: [] },
  }},
};

// ── Helpers (same interface as before — AddressForm needs no changes) ─────────
export const getCities = () =>
  Object.entries(VN_ADDRESS)
    .map(([code, v]) => ({ code, name: v.name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

export const getDistricts = (cityCode) =>
  cityCode && VN_ADDRESS[cityCode]
    ? Object.entries(VN_ADDRESS[cityCode].districts)
        .map(([code, v]) => ({ code, name: v.name }))
        .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    : [];

export const getWards = (cityCode, districtCode) =>
  cityCode && districtCode && VN_ADDRESS[cityCode]?.districts[districtCode]
    ? VN_ADDRESS[cityCode].districts[districtCode].wards.map((w) => ({ code: w, name: w }))
    : [];
