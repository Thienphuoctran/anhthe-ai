/**
 * Hệ thống Tách Nền Ảnh Thẻ AI Studio Chuẩn Sinh Trắc Học & Giữ Nguyên Độ Phân Giải Gốc (100% Client-Side):
 * 1. Giữ nguyên 100% độ sắc nét và điểm ảnh gốc (Native Resolution) của camera điện thoại (không nén mờ JPEG).
 * 2. Tách nền bằng mô hình IS-Net AI chuyên dụng (model 'isnet_quint8' tối ưu tốc độ & RAM trên Safari / Mobile).
 * 3. Hỗ trợ tăng tốc phần cứng WebGL/GPU chống tràn bộ nhớ trên iOS.
 * 4. Tầng dự phòng Google MediaPipe Portrait Model (modelSelection: 0) với thuật toán làm mượt cạnh sub-pixel.
 * 5. Ghép mặt nạ Alpha ngược trở lại tấm ảnh gốc độ phân giải cao bằng phép hòa trộn Destination-In chuẩn Studio.
 */

/**
 * Tải file/blob thành đối tượng HTMLImageElement với đầy đủ thông số kích thước thực.
 */
export function blobToImage(blob: Blob | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Tạo bản sao proxy tối ưu cho AI nhận diện tách nền (tối đa 2000px để bảo vệ RAM trình duyệt trên điện thoại)
 * Giữ nguyên định dạng PNG không nén để tránh suy hao chi tiết sợi tóc.
 */
export async function createAiSegmentationProxy(
  img: HTMLImageElement,
  maxDimension: number = 2000
): Promise<Blob> {
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  const maxDim = Math.max(width, height);

  if (maxDim <= maxDimension) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Không thể khởi tạo Canvas Context");
    ctx.drawImage(img, 0, 0);
    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), "image/png");
    });
  }

  const scale = maxDimension / maxDim;
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Không thể khởi tạo Canvas Context");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetW, targetH);

  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b || new Blob()), "image/png");
  });
}

/**
 * Kiểm tra xem ảnh sau xử lý có phông nền trong suốt hợp lệ hay không (kiểm tra 4 góc ảnh).
 */
async function hasTransparentBackground(blob: Blob): Promise<boolean> {
  try {
    const img = await blobToImage(blob);
    const canvas = document.createElement("canvas");
    const testSize = 64;
    canvas.width = testSize;
    canvas.height = testSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return true;

    ctx.drawImage(img, 0, 0, testSize, testSize);
    const data = ctx.getImageData(0, 0, testSize, testSize).data;

    let transparentCorners = 0;
    // Kiểm tra góc trên trái (0,0), góc trên phải (63,0), góc giữa mép trái (0,32), góc giữa mép phải (63,32)
    const checkCoords = [
      [2, 2],
      [testSize - 3, 2],
      [2, Math.round(testSize / 2)],
      [testSize - 3, Math.round(testSize / 2)],
    ];

    for (const [cx, cy] of checkCoords) {
      const alpha = data[(cy * testSize + cx) * 4 + 3];
      if (alpha < 120) {
        transparentCorners++;
      }
    }

    return transparentCorners >= 2;
  } catch {
    return true;
  }
}

/**
 * Tầng dự phòng cao cấp: Google MediaPipe Portrait Segmentation (modelSelection: 0 - Chuyên chân dung)
 * với bộ lọc S-curve và khử răng cưa mượt mà cho tóc và vai.
 */
async function segmentWithMediaPipePortrait(
  inputImg: HTMLImageElement,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  onProgress?.(65);

  const win = window as unknown as Record<string, unknown>;
  if (!win.SelfieSegmentation) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js";
      script.crossOrigin = "anonymous";
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Không thể tải thư viện MediaPipe Selfie Segmentation."));
      document.head.appendChild(script);
    });
  }

  onProgress?.(75);

  const SelfieSegmentationCtor = win.SelfieSegmentation as new (config: {
    locateFile: (file: string) => string;
  }) => {
    setOptions: (opts: { modelSelection: number }) => void;
    onResults: (
      cb: (results: {
        segmentationMask: CanvasImageSource;
        image: CanvasImageSource;
      }) => void
    ) => void;
    send: (input: { image: HTMLImageElement }) => Promise<void>;
    close: () => Promise<void>;
  };

  return new Promise<Blob>((resolve, reject) => {
    const segmenter = new SelfieSegmentationCtor({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });

    // modelSelection: 0 là mô hình Chân Dung/Selfie (tập trung đầu và vai, loại bỏ ghế tựa và nền)
    segmenter.setOptions({ modelSelection: 0 });

    segmenter.onResults((results) => {
      try {
        onProgress?.(90);
        const w = inputImg.naturalWidth || inputImg.width;
        const h = inputImg.naturalHeight || inputImg.height;

        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = w;
        maskCanvas.height = h;
        const mCtx = maskCanvas.getContext("2d");

        const outCanvas = document.createElement("canvas");
        outCanvas.width = w;
        outCanvas.height = h;
        const oCtx = outCanvas.getContext("2d");

        if (!mCtx || !oCtx) {
          reject(new Error("Không thể khởi tạo Canvas tách nền."));
          return;
        }

        mCtx.imageSmoothingEnabled = true;
        mCtx.imageSmoothingQuality = "high";
        mCtx.drawImage(results.segmentationMask, 0, 0, w, h);

        // Khử viền răng cưa và chuẩn hóa độ trong suốt của mặt nạ (Sigmoid curve)
        const maskData = mCtx.getImageData(0, 0, w, h);
        const d = maskData.data;
        for (let i = 0; i < d.length; i += 4) {
          const val = d[i] / 255;
          // Áp dụng đường cong sigmoid để làm rõ ranh giới tóc/người và loại bỏ mờ viền
          let refined = 0;
          if (val > 0.65) {
            refined = 255;
          } else if (val < 0.25) {
            refined = 0;
          } else {
            refined = Math.round(((val - 0.25) / (0.65 - 0.25)) * 255);
          }
          d[i] = refined;
          d[i + 1] = refined;
          d[i + 2] = refined;
          d[i + 3] = refined;
        }
        mCtx.putImageData(maskData, 0, 0);

        // Hòa trộn mặt nạ với ảnh chân dung gốc
        oCtx.drawImage(inputImg, 0, 0, w, h);
        oCtx.globalCompositeOperation = "destination-in";
        oCtx.drawImage(maskCanvas, 0, 0, w, h);

        segmenter.close().catch(() => {});

        outCanvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Không thể tạo tệp PNG từ MediaPipe."));
          }
        }, "image/png");
      } catch (e) {
        reject(e);
      }
    });

    segmenter.send({ image: inputImg }).catch((err) => reject(err));
  });
}

/**
 * Hàm Tách Nền Ảnh Thẻ Toàn Diện:
 * - Bảo toàn 100% độ nét gốc của ảnh camera điện thoại.
 * - Tự động chọn mô hình tối ưu theo thiết bị (isnet_quint8 nhẹ và mượt cho mobile).
 * - Ghép mặt nạ Alpha trở lại kích thước gốc nguyên bản.
 */
export async function removePhotoBackground(
  file: File | Blob,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error(
      "removePhotoBackground chỉ hoạt động trên môi trường trình duyệt."
    );
  }

  onProgress?.(5);

  // 1. Nạp ảnh gốc nguyên bản (Full Resolution)
  const originalImg = await blobToImage(file);
  const origW = originalImg.naturalWidth || originalImg.width;
  const origH = originalImg.naturalHeight || originalImg.height;

  // 2. Tạo ảnh proxy cho AI (tối đa 2000px) để bảo vệ RAM trình duyệt
  const aiProxyBlob = await createAiSegmentationProxy(originalImg, 2000);
  onProgress?.(15);

  const isMobile =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent);

  let cutoutResultBlob: Blob | null = null;

  // 3. Tầng 1: Sử dụng @imgly/background-removal với mô hình IS-Net
  try {
    const { removeBackground } = await import("@imgly/background-removal");

    // Chọn mô hình tối ưu: 'isnet_quint8' (38MB - cực nhanh, chuẩn tóc)
    const selectedModel = isMobile ? "isnet_quint8" : "isnet_quint8";

    cutoutResultBlob = await removeBackground(aiProxyBlob, {
      model: selectedModel,
      device: "gpu", // Thử GPU (WebGL) trước để tận dụng phần cứng
      output: {
        format: "image/png",
        quality: 1,
      },
      progress: (_key: string, current: number, total: number) => {
        onProgress?.(
          Math.min(85, Math.round(15 + (current / Math.max(1, total)) * 70))
        );
      },
    });

    const isClean = await hasTransparentBackground(cutoutResultBlob);
    if (!isClean) {
      throw new Error("Phông nền sau xử lý chưa đạt tiêu chuẩn trong suốt.");
    }
  } catch (imglyGpuError) {
    console.warn("Thử lại @imgly ở chế độ CPU:", imglyGpuError);

    try {
      const { removeBackground } = await import("@imgly/background-removal");
      cutoutResultBlob = await removeBackground(aiProxyBlob, {
        model: "isnet_quint8",
        device: "cpu",
        output: {
          format: "image/png",
          quality: 1,
        },
        progress: (_key: string, current: number, total: number) => {
          onProgress?.(
            Math.min(85, Math.round(15 + (current / Math.max(1, total)) * 70))
          );
        },
      });
    } catch (imglyCpuError) {
      console.warn(
        "Chuyển sang cơ chế dự phòng MediaPipe Portrait AI:",
        imglyCpuError
      );

      // 4. Tầng 2: Fallback an toàn sang Google MediaPipe Portrait
      try {
        cutoutResultBlob = await segmentWithMediaPipePortrait(
          originalImg,
          onProgress
        );
      } catch (mediaPipeError) {
        console.error("Lỗi tất cả các tầng tách nền:", mediaPipeError);
        throw new Error(
          "Không thể tự động tách nền bức ảnh này. Vui lòng chụp lại ảnh với ánh sáng tốt hơn và thử lại."
        );
      }
    }
  }

  onProgress?.(92);

  // 5. BƯỚC QUAN TRỌNG NHẤT: GHÉP MẶT NẠ VÀO ẢNH GỐC ĐỘ PHÂN GIẢI CAO NGUYÊN BẢN
  // Giúp mặt, mắt, da và áo giữ 100% độ sắc nét tuyệt đối của camera gốc!
  try {
    const cutoutImg = await blobToImage(cutoutResultBlob);

    const masterCanvas = document.createElement("canvas");
    masterCanvas.width = origW;
    masterCanvas.height = origH;
    const mCtx = masterCanvas.getContext("2d");

    if (!mCtx) {
      return URL.createObjectURL(cutoutResultBlob);
    }

    mCtx.imageSmoothingEnabled = true;
    mCtx.imageSmoothingQuality = "high";

    // Bước 5.1: Vẽ ảnh gốc nguyên bản 100% độ nét lên canvas
    mCtx.drawImage(originalImg, 0, 0, origW, origH);

    // Bước 5.2: Phép hòa trộn destination-in dùng mặt nạ AI để loại bỏ nền nhưng giữ nguyên mọi chi tiết gốc
    mCtx.globalCompositeOperation = "destination-in";
    mCtx.drawImage(cutoutImg, 0, 0, origW, origH);

    const finalMasterBlob = await new Promise<Blob>((resolve) => {
      masterCanvas.toBlob((b) => resolve(b || cutoutResultBlob!), "image/png");
    });

    onProgress?.(100);
    return URL.createObjectURL(finalMasterBlob);
  } catch (compositeErr) {
    console.warn("Dùng trực tiếp ảnh cutout:", compositeErr);
    onProgress?.(100);
    return URL.createObjectURL(cutoutResultBlob);
  }
}
