export type PhotoSizeKey = "2x3" | "3x4" | "3.5x4.5" | "4x6" | "visa";
export type BeautyPreset = "natural" | "bright" | "glow";
export type StandardBgColor =
  | "#0098ff"
  | "#0096ff"
  | "#0066cc"
  | "#0B69B7"
  | "#ffffff"
  | "#d9251d"
  | string;

export interface ManualBeautyAdjustments {
  /** Bù sáng / giảm chói cho khuôn mặt (từ -25 đến +25, mặc định 0) */
  brightnessAdjust?: number;
  /** Mức độ làm mịn da & xóa mụn (từ 0 đến 100, mặc định 50) */
  smoothness?: number;
  /** Nâng tông da trắng hồng, khử sắc vàng xỉn (từ 0 đến 100, mặc định 25) */
  rosyTone?: number;
  /** Làm sáng mắt và giảm quầng thâm (từ 0 đến 100, mặc định 40) */
  eyeBrightening?: number;
}

export interface PhotoRenderConfig {
  size: PhotoSizeKey;
  bgColor: StandardBgColor;
  beautyPreset?: BeautyPreset;
  /** Thu phóng người theo chuẩn sinh trắc học */
  scale?: number;
  /** Dịch chuyển ngang (mặc định 0) */
  offsetX?: number;
  /** Dịch chuyển dọc để chừa khoảng trống trên đỉnh tóc */
  offsetY?: number;
  showWatermark: boolean;
  // Các thông số tinh chỉnh làm đẹp da thủ công (Zero Latency)
  brightnessAdjust?: number;
  smoothness?: number;
  rosyTone?: number;
  eyeBrightening?: number;
  /** Cờ xem trước nhanh khi đang rê chuột / chạm (bỏ qua lọc nặng để đạt 60 FPS) */
  quickPreview?: boolean;
  // Tương thích ngược
  brightness?: number;
  contrast?: number;
  smoothSkin?: boolean;
}

export interface PhotoSizeSpec {
  id: PhotoSizeKey;
  width: number;
  height: number;
  label: string;
  dimensionsCm: string;
  description: string;
  sheetCount: number;
}

export const PHOTO_DIMENSIONS: Record<PhotoSizeKey, PhotoSizeSpec> = {
  "2x3": {
    id: "2x3",
    width: 472,
    height: 708,
    label: "Ảnh 2x3 cm",
    dimensionsCm: "2 x 3 cm (472 x 708 px - Ultra HD)",
    description: "Dùng cho Bảo hiểm y tế, Thẻ thư viện, Hồ sơ nhỏ",
    sheetCount: 12,
  },
  "3x4": {
    id: "3x4",
    width: 708,
    height: 944,
    label: "Ảnh 3x4 cm",
    dimensionsCm: "3 x 4 cm (708 x 944 px - Ultra HD)",
    description:
      "Dùng cho Hồ sơ xin việc, Thẻ học sinh/sinh viên, Sơ yếu lý lịch",
    sheetCount: 8,
  },
  "3.5x4.5": {
    id: "3.5x4.5",
    width: 826,
    height: 1062,
    label: "Ảnh 3.5x4.5 cm (Visa Schengen)",
    dimensionsCm: "3.5 x 4.5 cm (826 x 1062 px - Ultra HD)",
    description: "Chuẩn Visa Châu Âu (Schengen), Hàn Quốc, Nhật Bản, Đài Loan, Úc",
    sheetCount: 6,
  },
  "4x6": {
    id: "4x6",
    width: 944,
    height: 1418,
    label: "Ảnh 4x6 cm",
    dimensionsCm: "4 x 6 cm (944 x 1418 px - Ultra HD)",
    description: "Dùng cho CCCD, Hộ chiếu (Passport), Cổng Dịch vụ công, Bằng lái xe",
    sheetCount: 4,
  },
  visa: {
    id: "visa",
    width: 1200,
    height: 1200,
    label: "Ảnh Visa Mỹ 5x5 cm",
    dimensionsCm: "5 x 5 cm / 2x2 inch (1200 x 1200 px - Ultra HD)",
    description: "Chuẩn hình vuông bắt buộc cho Visa Hoa Kỳ (Mỹ DS-160), Visa Ấn Độ",
    sheetCount: 4,
  },
};

export const PHOTO_SIZE_OPTIONS: PhotoSizeSpec[] = [
  PHOTO_DIMENSIONS["2x3"],
  PHOTO_DIMENSIONS["3x4"],
  PHOTO_DIMENSIONS["3.5x4.5"],
  PHOTO_DIMENSIONS["4x6"],
  PHOTO_DIMENSIONS["visa"],
];

export interface BiometricPreset {
  scale: number;
  offsetX: number;
  offsetY: number;
  safeMarginTopRatio: number;
}

/**
 * Tự động căn chuẩn sinh trắc học (getBiometricStandardPreset)
 * Đảm bảo thông số khởi đầu chuẩn cho thuật toán Auto-Framing theo Bounding Box (Đỉnh tóc ở vạch 8.5% / 5mm)
 */
export function getBiometricStandardPreset(
  size: PhotoSizeKey
): BiometricPreset {
  switch (size) {
    case "2x3":
    case "3x4":
    case "3.5x4.5":
    case "4x6":
    case "visa":
    default:
      return { scale: 1.0, offsetY: 0, offsetX: 0, safeMarginTopRatio: 0.085 };
  }
}

export interface BgColorOption {
  id: string;
  name: string;
  hex: string;
  description: string;
}

export const BACKGROUND_COLORS: BgColorOption[] = [
  {
    id: "studio_blue",
    name: "Xanh Dịch Vụ Công",
    hex: "#0098ff",
    description: "Chuẩn Tiệm Ảnh Việt Nam & Cổng Dịch vụ công",
  },
  {
    id: "white",
    name: "Trắng Hộ chiếu",
    hex: "#ffffff",
    description: "Bắt buộc cho Hộ chiếu, CCCD và Visa",
  },
  {
    id: "deep_blue",
    name: "Xanh đậm",
    hex: "#0B69B7",
    description: "Xanh truyền thống cho học bạ, bằng cấp",
  },
  {
    id: "red",
    name: "Đỏ tiêu chuẩn",
    hex: "#d9251d",
    description: "Dùng cho thẻ đoàn, kỷ yếu và giấy khen",
  },
];

export interface BeautyPresetOption {
  id: BeautyPreset;
  name: string;
  description: string;
  brightness: number;
  contrast: number;
  saturate: number;
  smoothSkin: boolean;
}

export const BEAUTY_PRESETS: Record<BeautyPreset, BeautyPresetOption> = {
  natural: {
    id: "natural",
    name: "Tự nhiên",
    description: "Giữ nguyên ánh sáng và màu da gốc chân thực",
    brightness: 100,
    contrast: 100,
    saturate: 100,
    smoothSkin: false,
  },
  bright: {
    id: "bright",
    name: "Sáng rõ",
    description: "Đánh sáng đều vùng tối, khử ám vàng chuẩn tiệm ảnh",
    brightness: 103,
    contrast: 102,
    saturate: 102,
    smoothSkin: true,
  },
  glow: {
    id: "glow",
    name: "AI Rạng rỡ ✨",
    description: "Da trắng hồng chuẩn Studio, giảm bóng dầu & giữ nét mắt/tóc",
    brightness: 104,
    contrast: 103,
    saturate: 103,
    smoothSkin: true,
  },
};

export const BEAUTY_PRESET_LIST: BeautyPresetOption[] = [
  BEAUTY_PRESETS.natural,
  BEAUTY_PRESETS.bright,
  BEAUTY_PRESETS.glow,
];

// Cache lưu trữ ảnh đã nạp
const imageCache = new Map<string, HTMLImageElement>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    const cachedImg = imageCache.get(src)!;
    if (cachedImg.complete && cachedImg.naturalWidth > 0) {
      return Promise.resolve(cachedImg);
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = (err) => reject(new Error("Không thể tải ảnh: " + err));
    img.src = src;
  });
}

/**
 * Chuyển mã màu Hex sang RGB phục vụ khử viền sáng (Color Decontamination)
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 6) {
    const num = parseInt(clean, 16);
    if (!Number.isNaN(num)) {
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
      };
    }
  }
  return { r: 0, g: 152, b: 255 };
}

/**
 * Thuật toán Pixel-Level Edge Clean & Studio Relighting:
 * 1. Bo cong nhẹ vùng 5% đỉnh đầu nếu phát hiện ảnh gốc bị cắt ngang tóc.
 * 2. Xóa sạch mọi điểm ảnh lem nhem quanh cổ và tai có alpha < 115 (data[i + 3] = 0).
 * 3. Với điểm ảnh viền (115 <= alpha < 235), pha nhẹ 25% màu nền vào rìa tóc để tiệp hoàn toàn vào phông nền.
 * 4. Bộ lọc Làm đẹp da Đa tầng: Áp dụng Gamma Curve, cân bằng kênh Đỏ/Xanh dương (tạo da trắng hồng khử ám vàng) và làm mịn da Frequency Separation giữ nét mắt, lông mày, tóc.
 */
export function cleanPersonEdgesAndRelight(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bgColor: string,
  beautyPreset: BeautyPreset,
  adjustments?: ManualBeautyAdjustments,
  quickPreview: boolean = false
): void {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Lấy các thông số tinh chỉnh (ưu tiên adjustments thủ công, mặc định theo yêu cầu)
  const bAdjust =
    adjustments?.brightnessAdjust ??
    (beautyPreset === "glow" ? 12 : beautyPreset === "bright" ? 8 : 0);
  const sSmoothness =
    adjustments?.smoothness ??
    (beautyPreset === "glow" ? 75 : beautyPreset === "bright" ? 50 : 15);
  const rTone =
    adjustments?.rosyTone ??
    (beautyPreset === "glow" ? 35 : beautyPreset === "bright" ? 25 : 0);
  const eBright =
    adjustments?.eyeBrightening ??
    (beautyPreset === "glow" ? 60 : beautyPreset === "bright" ? 40 : 0);

  // --- BƯỚC 1: BO CONG NHẸ VÙNG 5% ĐỈNH ĐẦU NẾU ẢNH GỐC BỊ CẮT NGANG TÓC ---
  let firstOpaqueY = -1;
  const maxSearchY = Math.floor(height * 0.48);

  for (let y = 0; y < maxSearchY; y++) {
    let opaqueCount = 0;
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] >= 115) {
        opaqueCount++;
      }
    }
    if (opaqueCount >= 5) {
      firstOpaqueY = y;
      break;
    }
  }

  if (firstOpaqueY >= 0) {
    let topMinX = width;
    let topMaxX = 0;
    let topOpaquePixels = 0;

    for (let y = firstOpaqueY; y <= Math.min(height - 1, firstOpaqueY + 2); y++) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] >= 115) {
          if (x < topMinX) topMinX = x;
          if (x > topMaxX) topMaxX = x;
          topOpaquePixels++;
        }
      }
    }

    const topCutSpan = topMaxX - topMinX;
    if (topCutSpan > width * 0.09 && topOpaquePixels > 18) {
      const sampleHeadY = Math.min(
        height - 1,
        firstOpaqueY + Math.round(height * 0.05)
      );
      let headMinX = topMinX;
      let headMaxX = topMaxX;
      for (let x = 0; x < width; x++) {
        if (data[(sampleHeadY * width + x) * 4 + 3] >= 115) {
          if (x < headMinX) headMinX = x;
          if (x > headMaxX) headMaxX = x;
        }
      }

      const centerX = (topMinX + topMaxX) * 0.5;
      const radiusX = Math.max(
        (headMaxX - headMinX) * 0.52,
        topCutSpan * 0.55,
        width * 0.16
      );
      // Vùng bo cong 5% đỉnh đầu
      const roundZoneH = Math.max(10, Math.round(height * 0.05));
      const featherPx = 2.6;

      for (
        let y = firstOpaqueY;
        y <= Math.min(height - 1, firstOpaqueY + roundZoneH + 3);
        y++
      ) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          if (data[idx + 3] === 0) continue;

          const normX = (x - centerX) / radiusX;
          const archDropY = roundZoneH * Math.pow(normX, 2);
          const domeBoundaryY = firstOpaqueY + archDropY;

          if (y < domeBoundaryY) {
            const distOutside = domeBoundaryY - y;
            if (distOutside >= featherPx) {
              data[idx + 3] = 0;
            } else {
              const factor = Math.max(0, 1 - distOutside / featherPx);
              data[idx + 3] = Math.round(data[idx + 3] * factor * factor);
            }
          }
        }
      }
    }
  }

  // --- BƯỚC 2: XÓA SẠCH ĐIỂM ẢNH LEM NHEM QUANH CỔ VÀ TAI CÓ ALPHA < 115 ---
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 115) {
      data[i + 3] = 0;
    }
  }

  const alphaSnapshot = new Uint8Array(width * height);
  for (let pos = 0; pos < width * height; pos++) {
    alphaSnapshot[pos] = data[pos * 4 + 3];
  }

  // --- BƯỚC 3: CHUẨN BỊ GAMMA CURVE VÀ HỆ SỐ CÂN BẰNG TRẮNG HỒNG ---
  const enableStudioRelight =
    beautyPreset === "bright" ||
    beautyPreset === "glow" ||
    bAdjust !== 0 ||
    rTone !== 0 ||
    sSmoothness > 0 ||
    eBright > 0;

  const relightStrength =
    beautyPreset === "glow" ? 1.0 : beautyPreset === "bright" ? 0.76 : 0.65;

  const gamma = Math.max(0.68, Math.min(1.22, 0.86 - (bAdjust / 100) * 0.36));
  const directBrightness = Math.round(bAdjust * 0.85);

  const gammaLUT = new Uint8Array(256);
  for (let v = 0; v < 256; v++) {
    const lifted = 255 * Math.pow(v / 255, gamma);
    gammaLUT[v] = Math.min(
      255,
      Math.max(
        0,
        Math.round(v + (lifted - v) * relightStrength + directBrightness)
      )
    );
  }

  // Hệ số nâng tông da trắng hồng (0..100)
  const rosyFactor = Math.max(-0.12, Math.min(0.45, (rTone / 100) * 0.48));

  // --- BƯỚC 4: XỬ LÝ ĐIỂM ẢNH (LÀM ĐẸP DA & KHỬ RĂNG CƯA SUB-PIXEL) ---
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = y * width + x;
      const idx = pos * 4;
      let a = alphaSnapshot[pos];
      if (a === 0) continue;

      let r = data[idx];
      let g = data[idx + 1];
      let b = data[idx + 2];

      let emptyNeighbors = 0;
      if (x > 0 && alphaSnapshot[pos - 1] === 0) emptyNeighbors++;
      if (x < width - 1 && alphaSnapshot[pos + 1] === 0) emptyNeighbors++;
      if (y > 0 && alphaSnapshot[pos - width] === 0) emptyNeighbors++;
      if (y < height - 1 && alphaSnapshot[pos + width] === 0) emptyNeighbors++;

      // Khử nhiễu các điểm ảnh mồ côi cô lập nhưng TUYỆT ĐỐI KHÔNG ăn lẹm vào sợi tóc
      if (emptyNeighbors === 4 && a < 60) {
        data[idx + 3] = 0;
        continue;
      }

      if (enableStudioRelight) {
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const isSkinPixel =
          luma > 45 &&
          r > 74 &&
          g > 42 &&
          b > 26 &&
          r >= g &&
          g >= b * 0.74 &&
          maxC - minC > 8;

        if (isSkinPixel) {
          // 1) Gamma Curve & Độ sáng khuôn mặt
          r = gammaLUT[r];
          g = gammaLUT[g];
          b = gammaLUT[b];

          // 2) Highlight Roll-off mượt mà chống bóng dầu (không gây loang đốm vỡ màu)
          if (r > 240 && g > 230 && b > 215) {
            const excess = (r - 240) * 0.25;
            r = Math.round(r - excess);
            g = Math.round(g - excess * 0.8);
            b = Math.round(b - excess * 0.6);
          }

          // 3) Cân bằng kênh Đỏ/Xanh dương tạo làn da trắng hồng tự nhiên
          if (rosyFactor !== 0) {
            const rosyR = Math.min(255, r * (1 + rosyFactor * 0.35));
            const rosyG = Math.max(0, g * (1 - rosyFactor * 0.1));
            const rosyB = Math.min(255, b * (1 + rosyFactor * 0.44));

            r = Math.round(rosyR);
            g = Math.round(rosyG);
            b = Math.round(rosyB);
          }

          // 4) Khử quầng thâm dưới mắt
          if (eBright > 0) {
            const eyeYRatio = y / height;
            const eyeXRatio = x / width;
            const isUnderEyeZone =
              eyeYRatio >= 0.4 &&
              eyeYRatio <= 0.47 &&
              ((eyeXRatio >= 0.35 && eyeXRatio <= 0.47) ||
                (eyeXRatio >= 0.53 && eyeXRatio <= 0.65));

            if (isUnderEyeZone) {
              const underEyeLift = Math.round((eBright / 100) * 14);
              r = Math.min(255, r + underEyeLift);
              g = Math.min(255, g + Math.round(underEyeLift * 0.85));
              b = Math.min(255, b + Math.round(underEyeLift * 1.15));
            }
          }
        }
      }

      // Khử viền răng cưa mềm mại (Anti-aliasing sub-pixel) bảo toàn nguyên vẹn màu tóc gốc
      if (a > 0 && a < 240 && emptyNeighbors >= 1) {
        // Giữ nguyên 100% màu gốc r, g, b của sợi tóc và trang phục, chỉ làm mịn đường chuyển tiếp alpha
        a = Math.min(255, Math.round(a * 1.05));
      }

      data[idx] = Math.max(0, Math.min(255, r));
      data[idx + 1] = Math.max(0, Math.min(255, g));
      data[idx + 2] = Math.max(0, Math.min(255, b));
      data[idx + 3] = a;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // --- BƯỚC 5: LỚP PHỦ LÀM MỊN DA GIỮ NGUYÊN SẮC NÉT MẮT/TÓC & SÁNG MẮT ---
  // (Nếu quickPreview = true trong lúc rê chuột, tạm thời bỏ qua để đạt 60 FPS)
  if (!quickPreview && (sSmoothness > 0 || eBright > 0)) {
    applyFrequencySeparationRetouch(
      ctx,
      width,
      height,
      beautyPreset,
      sSmoothness,
      eBright
    );
  }
}

/**
 * Thuật toán làm mịn da Frequency Separation giữ nguyên độ sắc nét của mắt, lông mày và tóc
 */
function applyFrequencySeparationRetouch(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _beautyPreset: BeautyPreset,
  smoothness: number = 50,
  eyeBrightening: number = 40
): void {
  if (smoothness > 0) {
    const strength = Math.min(0.95, Math.max(0.05, (smoothness / 100) * 0.95));
    const blurRadius = Math.max(
      2,
      Math.min(6, Math.round(1.5 + (smoothness / 100) * 4.2))
    );

    const baseCanvas = document.createElement("canvas");
    baseCanvas.width = width;
    baseCanvas.height = height;
    const bCtx = baseCanvas.getContext("2d")!;
    bCtx.drawImage(ctx.canvas, 0, 0);
    const baseImgData = bCtx.getImageData(0, 0, width, height);
    const baseData = baseImgData.data;

    const lowCanvas = document.createElement("canvas");
    lowCanvas.width = width;
    lowCanvas.height = height;
    const lCtx = lowCanvas.getContext("2d")!;
    lCtx.filter = `blur(${blurRadius}px)`;
    lCtx.drawImage(baseCanvas, 0, 0);
    const lowImgData = lCtx.getImageData(0, 0, width, height);
    const lowData = lowImgData.data;

    const outImgData = ctx.getImageData(0, 0, width, height);
    const outData = outImgData.data;

    const faceCenterX = width * 0.5;
    const faceCenterY = height * 0.44;
    const faceRadiusX = width * 0.31;
    const faceRadiusY = height * 0.33;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const a = baseData[idx + 3];
        if (a === 0) continue;

        const dx = (x - faceCenterX) / faceRadiusX;
        const dy = (y - faceCenterY) / faceRadiusY;
        const distSq = dx * dx + dy * dy;
        if (distSq > 1.25) continue;

        const r = baseData[idx];
        const g = baseData[idx + 1];
        const b = baseData[idx + 2];
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;

        const isSkin =
          luma > 46 &&
          r > 76 &&
          g > 44 &&
          b > 28 &&
          r >= g &&
          g >= b * 0.74 &&
          Math.max(r, g, b) - Math.min(r, g, b) > 8;

        if (!isSkin) continue;

        const weight =
          Math.max(0, Math.min(1, 1 - (distSq - 0.6) / 0.55)) * strength;
        if (weight <= 0) continue;

        const highR = r - lowData[idx] + 128;
        const highG = g - lowData[idx + 1] + 128;
        const highB = b - lowData[idx + 2] + 128;

        const smoothLowR = lowData[idx];
        const smoothLowG = lowData[idx + 1];
        const smoothLowB = lowData[idx + 2];

        const targetR = Math.max(0, Math.min(255, smoothLowR + (highR - 128)));
        const targetG = Math.max(0, Math.min(255, smoothLowG + (highG - 128)));
        const targetB = Math.max(0, Math.min(255, smoothLowB + (highB - 128)));

        outData[idx] = Math.round(r + (targetR - r) * weight);
        outData[idx + 1] = Math.round(g + (targetG - g) * weight);
        outData[idx + 2] = Math.round(b + (targetB - b) * weight);
      }
    }

    ctx.putImageData(outImgData, 0, 0);
  }

  addStudioEyeCatchlights(ctx, width, height, eyeBrightening);
}

/**
 * Làm sáng tròng mắt & Thêm điểm sáng phản xạ đèn Softbox Studio (Catchlight)
 */
function addStudioEyeCatchlights(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  eyeBrightening: number = 40
): void {
  if (eyeBrightening <= 0) return;

  const eyeYMin = Math.round(height * 0.37);
  const eyeYMax = Math.round(height * 0.46);

  const leftEyeXMin = Math.round(width * 0.36);
  const leftEyeXMax = Math.round(width * 0.46);

  const rightEyeXMin = Math.round(width * 0.54);
  const rightEyeXMax = Math.round(width * 0.64);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Làm sáng tròng trắng mắt
  const scleraLift = Math.round((eyeBrightening / 100) * 16);
  for (let y = eyeYMin; y < eyeYMax; y++) {
    for (let x = leftEyeXMin - 8; x < rightEyeXMax + 8; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      if (luma > 105 && Math.abs(r - g) < 28 && Math.abs(r - b) < 32) {
        data[idx] = Math.min(255, r + scleraLift);
        data[idx + 1] = Math.min(255, g + scleraLift);
        data[idx + 2] = Math.min(255, b + Math.round(scleraLift * 1.1));
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const findPupilCenter = (xMin: number, xMax: number) => {
    let minLuma = 255;
    for (let y = eyeYMin; y < eyeYMax; y++) {
      for (let x = xMin; x < xMax; x++) {
        const idx = (y * width + x) * 4;
        const luma =
          0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        if (luma < minLuma) {
          minLuma = luma;
        }
      }
    }

    if (minLuma > 65) return null;

    let pupilX = 0;
    let pupilY = 0;
    let count = 0;
    for (let y = eyeYMin; y < eyeYMax; y++) {
      for (let x = xMin; x < xMax; x++) {
        const idx = (y * width + x) * 4;
        const luma =
          0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        if (luma <= minLuma + 14) {
          pupilX += x;
          pupilY += y;
          count++;
        }
      }
    }

    if (count === 0) return null;
    return { x: Math.round(pupilX / count), y: Math.round(pupilY / count) };
  };

  const leftPupil = findPupilCenter(leftEyeXMin, leftEyeXMax);
  const rightPupil = findPupilCenter(rightEyeXMin, rightEyeXMax);

  const drawCatchlight = (cx: number, cy: number) => {
    const factor = Math.min(1.5, Math.max(0.3, (eyeBrightening / 100) * 1.3));
    const lx = cx - 1.5;
    const ly = cy - 1.8;

    ctx.save();
    const outerRadius = 2.8 * factor;
    const outerGrad = ctx.createRadialGradient(
      lx,
      ly,
      0.3 * factor,
      lx,
      ly,
      outerRadius
    );
    outerGrad.addColorStop(
      0,
      `rgba(255, 255, 255, ${0.85 * Math.min(1, factor)})`
    );
    outerGrad.addColorStop(
      0.5,
      `rgba(255, 255, 255, ${0.35 * Math.min(1, factor)})`
    );
    outerGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(lx, ly, outerRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(lx, ly, 1.2 * factor, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  if (leftPupil) drawCatchlight(leftPupil.x, leftPupil.y);
  if (rightPupil) drawCatchlight(rightPupil.x, rightPupil.y);
}

/**
 * Vẽ phông nền Studio có chiều sâu với createRadialGradient:
 * Màu xanh chuẩn Dịch vụ công (#0098ff): tỏa nhẹ từ tâm phía sau đầu (#24adff) ra viền ngoài (#0082e0)
 */
function fillStudioBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bgColor: string
): void {
  if (bgColor === "transparent") {
    ctx.clearRect(0, 0, width, height);
    return;
  }

  const normalized = (bgColor || "#0098ff").toLowerCase();
  const centerX = width * 0.5;
  const centerY = height * 0.42;
  const innerRadius = width * 0.06;
  const outerRadius = Math.max(width, height) * 0.78;

  const grad = ctx.createRadialGradient(
    centerX,
    centerY,
    innerRadius,
    centerX,
    height * 0.46,
    outerRadius
  );

  if (
    normalized === "#0098ff" ||
    normalized === "#0096ff" ||
    normalized === "#0066cc"
  ) {
    // Màu xanh chuẩn Dịch vụ công: tỏa nhẹ từ tâm phía sau đầu (#24adff) ra viền ngoài (#0082e0)
    grad.addColorStop(0, "#24adff");
    grad.addColorStop(0.55, "#0098ff");
    grad.addColorStop(1, "#0082e0");
  } else if (normalized === "#0b69b7") {
    grad.addColorStop(0, "#1c82d6");
    grad.addColorStop(0.6, "#0B69B7");
    grad.addColorStop(1, "#085291");
  } else if (normalized === "#d9251d") {
    grad.addColorStop(0, "#f03a32");
    grad.addColorStop(0.6, "#d9251d");
    grad.addColorStop(1, "#b31912");
  } else if (normalized === "#ffffff") {
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.75, "#f8fafc");
    grad.addColorStop(1, "#eef2f6");
  } else {
    const rgb = hexToRgb(bgColor);
    const lightR = Math.min(255, rgb.r + 22);
    const lightG = Math.min(255, rgb.g + 22);
    const lightB = Math.min(255, rgb.b + 22);
    const darkR = Math.max(0, rgb.r - 18);
    const darkG = Math.max(0, rgb.g - 18);
    const darkB = Math.max(0, rgb.b - 18);
    grad.addColorStop(0, `rgb(${lightR}, ${lightG}, ${lightB})`);
    grad.addColorStop(0.6, bgColor);
    grad.addColorStop(1, `rgb(${darkR}, ${darkG}, ${darkB})`);
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

const refinedMaskCache = new WeakMap<
  HTMLImageElement | HTMLCanvasElement,
  HTMLCanvasElement
>();

export interface HeadAndBodyBounds {
  topY: number;
  bottomY: number;
  headLeftX: number;
  headRightX: number;
  headCenterX: number;
  headWidth: number;
}

const boundsCache = new WeakMap<HTMLCanvasElement, HeadAndBodyBounds>();

/**
 * Thuật toán "Co Viền 3px & Khử Răng Cưa Mặt Nạ" (Alpha Choke, Edge Color Decontamination & Feathering):
 * 1. Bước A (Alpha Choke & Erosion):
 *    - Mọi pixel có alpha < 185 (vùng viền lem nhem chứa màu tường vàng quanh tai và ghế đen quanh cổ): Gán thẳng alpha = 0.
 *    - Với các pixel từ 185 <= alpha <= 250: Nội suy tuyến tính newAlpha = Math.round(((alpha - 185) / (250 - 185)) * 255) để thu hẹp viền vào trong 2-3px.
 *    - Khử màu viền phản chiếu (Edge Color Decontamination): Với các pixel nằm sát biên (0 < newAlpha < 240), giảm nhẹ độ chói nếu pixel bị ám màu vàng/trắng sáng (R > 180 && G > 160).
 * 2. Bước B (Feathering Anti-Aliasing):
 *    - Tạo maskCanvas chứa kênh Alpha đã co viền, áp dụng maskCtx.filter = 'blur(1.8px)' để làm mềm hoàn toàn đường viền bậc thang.
 *    - Dùng ctx.globalCompositeOperation = 'destination-in' áp mặt nạ mượt này lên ảnh gốc.
 */
export function refineCutoutMask(
  personImg: HTMLImageElement | HTMLCanvasElement
): HTMLCanvasElement {
  const cached = refinedMaskCache.get(personImg);
  if (cached) {
    return cached;
  }

  const w = personImg.width;
  const h = personImg.height;

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = w;
  tempCanvas.height = h;
  const ctx = tempCanvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(personImg, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  const chokedMaskCanvas = document.createElement("canvas");
  chokedMaskCanvas.width = w;
  chokedMaskCanvas.height = h;
  const chokedCtx = chokedMaskCanvas.getContext("2d")!;
  const maskImageData = chokedCtx.createImageData(w, h);
  const maskData = maskImageData.data;

  // Bước A - Co viền mặt nạ (Alpha Choke & Erosion) + Khử màu viền phản chiếu (Edge Color Decontamination)
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    let newAlpha = 0;

    if (alpha < 185) {
      newAlpha = 0;
    } else if (alpha <= 250) {
      newAlpha = Math.round(((alpha - 185) / (250 - 185)) * 255);
    } else {
      newAlpha = 255;
    }

    // Khử màu viền phản chiếu (Edge Color Decontamination) cho pixel nằm sát biên
    if (newAlpha > 0 && newAlpha < 240) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r > 180 && g > 160) {
        data[i] = Math.round(r * 0.72);
        data[i + 1] = Math.round(g * 0.72);
        data[i + 2] = Math.round(b * 0.78);
      }
    }

    // Giữ ảnh gốc có độ phủ pełne ở vùng có mặt nạ để bước destination-in quyết định độ mượt biên
    data[i + 3] = newAlpha > 0 ? 255 : 0;

    maskData[i] = 0;
    maskData[i + 1] = 0;
    maskData[i + 2] = 0;
    maskData[i + 3] = newAlpha;
  }

  ctx.putImageData(imageData, 0, 0);
  chokedCtx.putImageData(maskImageData, 0, 0);

  // Bước B - Làm mềm biên chống răng cưa (Feathering Anti-Aliasing)
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = w;
  maskCanvas.height = h;
  const maskCtx = maskCanvas.getContext("2d")!;
  maskCtx.imageSmoothingEnabled = true;
  maskCtx.imageSmoothingQuality = "high";
  maskCtx.filter = "blur(1.8px)";
  maskCtx.drawImage(chokedMaskCanvas, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(maskCanvas, 0, 0);
  ctx.restore();

  refinedMaskCache.set(personImg, tempCanvas);
  return tempCanvas;
}

/**
 * Thuật toán Tự Động Đo Đỉnh Tóc & Bề Rộng Đầu (detectHeadAndBodyBounds):
 * - Quét tìm topY: Hàng pixel đầu tiên từ trên xuống có alpha > 100 (Đỉnh tóc).
 * - Quét vùng phần đầu (từ topY xuống khoảng topY + 35% chiều cao người) để tìm headLeftX và headRightX.
 * - Tính headCenterX = (headLeftX + headRightX) / 2 và headWidth = headRightX - headLeftX.
 */
export function detectHeadAndBodyBounds(
  cleanCanvas: HTMLCanvasElement
): HeadAndBodyBounds {
  const cached = boundsCache.get(cleanCanvas);
  if (cached) {
    return cached;
  }

  const w = cleanCanvas.width;
  const h = cleanCanvas.height;
  const ctx = cleanCanvas.getContext("2d")!;
  const data = ctx.getImageData(0, 0, w, h).data;

  let topY = -1;
  let bottomY = -1;

  // Quét tìm topY (hàng đầu tiên từ trên xuống có alpha > 100)
  for (let y = 0; y < h; y++) {
    let rowHasPixel = false;
    const rowOffset = y * w * 4;
    for (let x = 0; x < w; x++) {
      if (data[rowOffset + x * 4 + 3] > 100) {
        rowHasPixel = true;
        break;
      }
    }
    if (rowHasPixel) {
      topY = y;
      break;
    }
  }

  // Quét tìm bottomY từ dưới lên để xác định chiều cao người trong ảnh
  for (let y = h - 1; y >= 0; y--) {
    let rowHasPixel = false;
    const rowOffset = y * w * 4;
    for (let x = 0; x < w; x++) {
      if (data[rowOffset + x * 4 + 3] > 100) {
        rowHasPixel = true;
        break;
      }
    }
    if (rowHasPixel) {
      bottomY = y;
      break;
    }
  }

  if (topY === -1 || bottomY === -1 || bottomY <= topY) {
    const fallbackBounds: HeadAndBodyBounds = {
      topY: Math.round(h * 0.085),
      bottomY: h - 1,
      headLeftX: Math.round(w * 0.25),
      headRightX: Math.round(w * 0.75),
      headCenterX: w / 2,
      headWidth: w * 0.5,
    };
    boundsCache.set(cleanCanvas, fallbackBounds);
    return fallbackBounds;
  }

  const personHeight = Math.max(1, bottomY - topY);
  const headScanEndY = Math.min(
    bottomY,
    Math.round(topY + personHeight * 0.35)
  );

  let headLeftX = w;
  let headRightX = 0;

  for (let y = topY; y <= headScanEndY; y++) {
    const rowOffset = y * w * 4;
    for (let x = 0; x < w; x++) {
      if (data[rowOffset + x * 4 + 3] > 100) {
        if (x < headLeftX) headLeftX = x;
        if (x > headRightX) headRightX = x;
      }
    }
  }

  if (headRightX <= headLeftX) {
    headLeftX = Math.round(w * 0.25);
    headRightX = Math.round(w * 0.75);
  }

  const headCenterX = (headLeftX + headRightX) / 2;
  const headWidth = headRightX - headLeftX;

  const bounds: HeadAndBodyBounds = {
    topY,
    bottomY,
    headLeftX,
    headRightX,
    headCenterX,
    headWidth,
  };

  boundsCache.set(cleanCanvas, bounds);
  return bounds;
}

/**
 * Vẽ 1 ảnh thẻ hoàn chỉnh lên Canvas chuẩn 300 DPI (2x Retina Ultra HD)
 */
export async function renderSinglePhoto(
  canvas: HTMLCanvasElement,
  personImg: HTMLImageElement | HTMLCanvasElement,
  config: PhotoRenderConfig
): Promise<void> {
  const spec = PHOTO_DIMENSIONS[config.size] || PHOTO_DIMENSIONS["4x6"];
  const width = spec.width;
  const height = spec.height;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Không thể khởi tạo Canvas 2D Context.");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. Tô phông nền Radial Studio Backdrop (mặc định Xanh chuẩn Dịch vụ công #0098ff)
  const activeBgColor = config.bgColor || "#0098ff";
  fillStudioBackdrop(ctx, width, height, activeBgColor);

  // 2. Xác định thông số làm đẹp từ BeautyPreset
  const presetKey: BeautyPreset = config.beautyPreset || "glow";
  const preset = BEAUTY_PRESETS[presetKey] || BEAUTY_PRESETS.glow;

  let brightness = config.brightness ?? preset.brightness;
  if (config.brightnessAdjust) {
    brightness += Math.round(config.brightnessAdjust * 0.4);
  }
  const contrast = config.contrast ?? preset.contrast;
  const saturate = preset.saturate;

  // 3. Tinh chỉnh mặt nạ (Co viền 3px & Khử răng cưa) và Tự động đo Đỉnh tóc / Bề rộng đầu
  const cleanCanvas = refineCutoutMask(personImg);
  const { topY, headCenterX, headWidth } = detectHeadAndBodyBounds(cleanCanvas);

  const biometricPreset = getBiometricStandardPreset(config.size);
  const userScale = config.scale ?? biometricPreset.scale;
  const userOffsetX = config.offsetX ?? biometricPreset.offsetX;
  const userOffsetY = config.offsetY ?? biometricPreset.offsetY;

  // Tự động Phóng to (Auto-Zoom) để bề rộng đầu chiếm ~52% khung ảnh và Đỉnh tóc nằm đúng vạch 5mm (8.5%)
  const baseScale =
    (canvas.width * 0.52) / Math.max(headWidth, cleanCanvas.width * 0.22);
  const finalScale = baseScale * userScale;
  const drawWidth = cleanCanvas.width * finalScale;
  const drawHeight = cleanCanvas.height * finalScale;

  // Căn tâm đầu vào giữa khung ảnh + offsetX của người dùng
  const drawX =
    canvas.width / 2 - headCenterX * finalScale + userOffsetX * 2;
  // Đặt đỉnh tóc (topY) nằm đúng ở vạch 8.5% từ mép trên (5mm) + offsetY của người dùng
  const drawY =
    canvas.height * 0.085 - topY * finalScale + userOffsetY * 2;

  // 4. Vẽ người lên lớp Canvas trung gian với bộ lọc Canvas GPU mượt mà (Bảo toàn 100% màu sắc & chi tiết gốc)
  const personLayer = document.createElement("canvas");
  personLayer.width = width;
  personLayer.height = height;
  const pCtx = personLayer.getContext("2d")!;
  pCtx.imageSmoothingEnabled = true;
  pCtx.imageSmoothingQuality = "high";

  pCtx.save();
  pCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`;
  pCtx.drawImage(cleanCanvas, drawX, drawY, drawWidth, drawHeight);
  pCtx.restore();

  // 5. Hòa trộn Subpixel Feathering mượt mà vào nền Studio chuẩn (Không làm biến dạng hạt ảnh)
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(personLayer, 0, 0);
  ctx.restore();

  // 5. Nếu showWatermark = true (bản miễn phí), vẽ dòng chữ chìm tinh tế
  if (config.showWatermark) {
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((-26 * Math.PI) / 180);

    const watermarkText = "BẢN XEM TRƯỚC - ANHTHE.AI";
    const fontSize = Math.round(width * 0.072);

    ctx.font = `700 ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.strokeStyle = "rgba(15, 23, 42, 0.32)";
    ctx.lineWidth = 2.5;
    ctx.strokeText(watermarkText, 0, 0);

    ctx.fillStyle = "rgba(255, 255, 255, 0.52)";
    ctx.fillText(watermarkText, 0, 0);

    ctx.font = `600 ${Math.round(fontSize * 0.48)}px sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillText("CHUẨN DỊCH VỤ CÔNG - 300 DPI", 0, fontSize * 1.45);

    ctx.restore();
  }
}

/**
 * Tạo vỉ in khổ chuẩn 10x15cm (4R @ 300 DPI) - Tuyệt đối không xoay nghiêng ảnh người!
 * - Nếu size === '4x6' hoặc 'visa': Khổ DỌC (1200 x 1800 px), xếp 2 cột x 2 hàng đứng thẳng.
 * - Nếu size === '3.5x4.5': Khổ NGANG (1800 x 1200 px), xếp 3 cột x 2 hàng (6 ảnh) đứng thẳng.
 * - Nếu size === '3x4': Khổ NGANG (1800 x 1200 px), xếp 4 cột x 2 hàng (8 ảnh) đứng thẳng.
 * - Nếu size === '2x3': Khổ NGANG (1800 x 1200 px), xếp 4 cột x 3 hàng (12 ảnh) đứng thẳng.
 */
export async function generatePrintSheet(
  sourceCanvas: HTMLCanvasElement,
  size: PhotoSizeKey,
  showWatermark: boolean
): Promise<HTMLCanvasElement> {
  const printCanvas = document.createElement("canvas");
  const isVerticalSheet = size === "4x6" || size === "visa";

  // Khổ DỌC 1200x1800 cho 4x6 & visa; Khổ NGANG 1800x1200 cho 2x3, 3x4 & 3.5x4.5
  const SHEET_W = isVerticalSheet ? 1200 : 1800;
  const SHEET_H = isVerticalSheet ? 1800 : 1200;

  printCanvas.width = SHEET_W;
  printCanvas.height = SHEET_H;

  const ctx = printCanvas.getContext("2d");
  if (!ctx) {
    throw new Error("Không thể khởi tạo Context 2D cho khổ giấy in 10x15cm.");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. Nền giấy in trắng tinh chuẩn tiệm lab
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SHEET_W, SHEET_H);

  // Hàm phụ trợ vẽ đường viền cắt nét đứt màu xám (#cbd5e1) và dấu cộng (+) định vị góc cắt
  const drawCutGuideAndCornerMarks = (
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    ctx.save();
    // Đường viền cắt nét đứt màu xám (#cbd5e1)
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);

    // Dấu cộng (+) định vị góc cắt tại 4 góc ảnh
    ctx.setLineDash([]);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    const arm = 8;
    const corners = [
      [x - 1, y - 1],
      [x + w + 1, y - 1],
      [x - 1, y + h + 1],
      [x + w + 1, y + h + 1],
    ];
    for (const [cx, cy] of corners) {
      ctx.beginPath();
      ctx.moveTo(cx - arm, cy);
      ctx.lineTo(cx + arm, cy);
      ctx.moveTo(cx, cy - arm);
      ctx.lineTo(cx, cy + arm);
      ctx.stroke();
    }
    ctx.restore();
  };

  if (size === "4x6") {
    // 4 ảnh 4x6 cm (472 x 709 px): Lưới 2 cột x 2 hàng đứng thẳng trên khổ dọc 1200x1800
    const colX = [92, 636];
    const rowY = [140, 930];
    const itemW = 472;
    const itemH = 709;

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const x = colX[c];
        const y = rowY[r];
        ctx.drawImage(sourceCanvas, x, y, itemW, itemH);
        drawCutGuideAndCornerMarks(x, y, itemW, itemH);
      }
    }
  } else if (size === "visa") {
    // 4 ảnh Visa (5x5cm - 500 x 500 px trên khổ in): Lưới 2 cột x 2 hàng đứng thẳng cân đối ở giữa khổ giấy dọc 1200x1800
    const itemW = 500;
    const itemH = 500;
    const gapX = 64;
    const gapY = 80;
    const startX = Math.round((SHEET_W - (itemW * 2 + gapX)) / 2); // 68
    const startY = Math.round((SHEET_H - (itemH * 2 + gapY)) / 2 - 20); // 340

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const x = startX + c * (itemW + gapX);
        const y = startY + r * (itemH + gapY);
        ctx.drawImage(sourceCanvas, x, y, itemW, itemH);
        drawCutGuideAndCornerMarks(x, y, itemW, itemH);
      }
    }
  } else if (size === "3.5x4.5") {
    // 6 ảnh 3.5x4.5 cm (413 x 531 px): Khổ NGANG 1800x1200, xếp lưới 3 cột x 2 hàng đứng thẳng
    const itemW = 413;
    const itemH = 531;
    const startX = 210;
    const stepX = 413 + 70;
    const rowY = [40, 605];

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const x = startX + c * stepX;
        const y = rowY[r];
        ctx.drawImage(sourceCanvas, x, y, itemW, itemH);
        drawCutGuideAndCornerMarks(x, y, itemW, itemH);
      }
    }
  } else if (size === "2x3") {
    // 12 ảnh 2x3 cm (236 x 354 px): Khổ NGANG 1800x1200, xếp lưới 4 cột x 3 hàng đứng thẳng
    const itemW = 236;
    const itemH = 354;
    const startX = 334;
    const stepX = 236 + 60;
    const rowY = [40, 415, 790];

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const x = startX + c * stepX;
        const y = rowY[r];
        ctx.drawImage(sourceCanvas, x, y, itemW, itemH);
        drawCutGuideAndCornerMarks(x, y, itemW, itemH);
      }
    }
  } else {
    // Cỡ 3x4 (8 ảnh / vỉ): Khổ NGANG 1800x1200, xếp lưới 4 cột x 2 hàng đứng thẳng (354 x 472 px)
    const itemW = 354;
    const itemH = 472;
    const startX = 112;
    const stepX = 354 + 40;
    const rowY = [90, 610];

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        const x = startX + c * stepX;
        const y = rowY[r];
        ctx.drawImage(sourceCanvas, x, y, itemW, itemH);
        drawCutGuideAndCornerMarks(x, y, itemW, itemH);
      }
    }
  }

  // Ghi chú chân trang chuẩn 10x15cm (4R) - 300 DPI
  ctx.save();
  ctx.fillStyle = "#64748b";
  ctx.font = "500 18px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    "Khổ in chuẩn 10x15cm (4R) - 300 DPI | Mang file này ra tiệm in ảnh chỉ 2.000đ - 3.000đ",
    SHEET_W / 2,
    SHEET_H - 28
  );
  ctx.restore();

  if (showWatermark) {
    ctx.save();
    ctx.translate(SHEET_W / 2, SHEET_H / 2);
    ctx.rotate((-20 * Math.PI) / 180);
    ctx.font = "800 58px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(148, 163, 184, 0.28)";
    ctx.fillText("BẢN XEM TRƯỚC - ANHTHE.AI", 0, 0);
    ctx.restore();
  }

  return printCanvas;
}
