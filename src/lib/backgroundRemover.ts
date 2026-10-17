/**
 * Hệ thống Tách Nền Ảnh Thẻ AI Studio Chuẩn Sinh Trắc Học & Giữ Nguyên Độ Phân Giải Gốc:
 * 1. BẮT BUỘC ƯU TIÊN TẦNG 1: Gọi AI Replicate 4K qua `POST /api/ai-cutout` (tối đa 1600px để gửi nhanh, giữ độ nét cao).
 * 2. TẦNG 2 (Fallback khi mất mạng/API lỗi): @imgly/background-removal trên trình duyệt.
 * 3. TẦNG 3 (Dự phòng khẩn cấp): Google MediaPipe Portrait Segmentation (modelSelection: 0).
 * 4. Kỹ thuật High-Res Alpha Masking: Ghép mặt nạ AI ngược trở lại tấm ảnh gốc độ phân giải cao bằng
 *    phép hòa trộn Destination-In chuẩn Studio, bảo toàn 100% độ nét, màu sắc và chi tiết camera.
 */

/**
 * Tải file/blob/url thành đối tượng HTMLImageElement với đầy đủ thông số kích thước thực.
 */
export function blobToImage(
  blobOrUrl: Blob | File | string
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url =
      typeof blobOrUrl === "string"
        ? blobOrUrl
        : URL.createObjectURL(blobOrUrl);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (typeof blobOrUrl !== "string") {
        URL.revokeObjectURL(url);
      }
      resolve(img);
    };
    img.onerror = (err) => {
      if (typeof blobOrUrl !== "string") {
        URL.revokeObjectURL(url);
      }
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Chuyển đổi File/Blob sang chuỗi Base64 (giữ độ phân giải cao, tối đa 1600px để gửi nhanh)
 * phục vụ gọi POST /api/ai-cutout.
 */
async function fileToApiBase64(
  file: File | Blob,
  maxDimension: number = 1600
): Promise<string> {
  const img = await blobToImage(file);
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const maxD = Math.max(w, h);

  if (file.size <= 1.8 * 1024 * 1024 && maxD <= maxDimension) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const scale = maxD > maxDimension ? maxDimension / maxD : 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Không thể khởi tạo Canvas chuyển đổi Base64");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.94);
}

/**
 * Tạo bản sao proxy tối ưu cho AI nhận diện tách nền Client (tối đa 1600px để bảo vệ RAM trình duyệt)
 */
export async function createAiSegmentationProxy(
  img: HTMLImageElement,
  maxDimension: number = 1600
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
 * Tầng dự phòng: Google MediaPipe Portrait Segmentation (modelSelection: 0)
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
        reject(
          new Error("Không thể tải thư viện MediaPipe Selfie Segmentation.")
        );
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

        const maskData = mCtx.getImageData(0, 0, w, h);
        const d = maskData.data;
        for (let i = 0; i < d.length; i += 4) {
          const val = d[i] / 255;
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
 * 1. BẮT BUỘC ưu tiên gọi POST /api/ai-cutout (Replicate 4K) với ảnh Base64 tối đa 1600px.
 * 2. Chỉ khi /api/ai-cutout báo lỗi mạng mới chạy fallback sang @imgly/background-removal ở trình duyệt.
 * 3. Ghép mặt nạ Alpha vào ảnh gốc camera (Full Resolution), giữ 100% độ sắc nét nguyên bản.
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

  // 1. Nạp ảnh gốc nguyên bản (Full Native Resolution)
  const originalImg = await blobToImage(file);
  const origW = originalImg.naturalWidth || originalImg.width;
  const origH = originalImg.naturalHeight || originalImg.height;

  let cutoutResultBlob: Blob | null = null;

  // 2. BẮT BUỘC ƯU TIÊN TẦNG 1: GỌI AI REPLICATE 4K QUA POST /api/ai-cutout
  try {
    onProgress?.(15);
    const base64Data = await fileToApiBase64(file, 1600);
    onProgress?.(35);

    const apiRes = await fetch("/api/ai-cutout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64Data }),
    });

    if (!apiRes.ok) {
      throw new Error(`API /api/ai-cutout trả về mã lỗi ${apiRes.status}`);
    }

    const json = await apiRes.json();
    if (json.success && json.cutoutImageUrl) {
      onProgress?.(82);
      const resFetch = await fetch(json.cutoutImageUrl);
      if (resFetch.ok) {
        cutoutResultBlob = await resFetch.blob();
      }
    }
  } catch (apiErr) {
    console.warn(
      "API /api/ai-cutout gặp lỗi mạng, chuyển sang fallback @imgly/background-removal ở trình duyệt:",
      apiErr
    );
  }

  // 3. TẦNG 2 (FALLBACK KHI LỖI MẠNG): DÙNG @imgly/background-removal Ở TRÌNH DUYỆT
  if (!cutoutResultBlob) {
    const aiProxyBlob = await createAiSegmentationProxy(originalImg, 1600);
    onProgress?.(45);

    try {
      const { removeBackground } = await import("@imgly/background-removal");

      cutoutResultBlob = await removeBackground(aiProxyBlob, {
        model: "isnet_quint8",
        device: "gpu",
        output: {
          format: "image/png",
          quality: 1,
        },
        progress: (_key: string, current: number, total: number) => {
          onProgress?.(
            Math.min(85, Math.round(45 + (current / Math.max(1, total)) * 40))
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
              Math.min(85, Math.round(45 + (current / Math.max(1, total)) * 40))
            );
          },
        });
      } catch (imglyCpuError) {
        console.warn(
          "Chuyển sang cơ chế dự phòng MediaPipe Portrait AI:",
          imglyCpuError
        );

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
  }

  onProgress?.(92);

  // 4. BƯỚC QUAN TRỌNG: HIGH-RES ALPHA MASKING
  // Ghép mặt nạ AI vào ảnh gốc camera (Full Resolution), giữ 100% độ sắc nét tuyệt đối của camera!
  try {
    const cutoutImg = await blobToImage(cutoutResultBlob!);

    const masterCanvas = document.createElement("canvas");
    masterCanvas.width = origW;
    masterCanvas.height = origH;
    const mCtx = masterCanvas.getContext("2d");

    if (!mCtx) {
      return URL.createObjectURL(cutoutResultBlob!);
    }

    mCtx.imageSmoothingEnabled = true;
    mCtx.imageSmoothingQuality = "high";

    // Bước 4.1: Vẽ ảnh gốc nguyên bản 100% điểm ảnh sắc nét lên canvas
    mCtx.drawImage(originalImg, 0, 0, origW, origH);

    // Bước 4.2: Phép hòa trộn destination-in dùng mặt nạ AI để loại bỏ nền nhưng giữ nguyên mọi chi tiết gốc
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
    return URL.createObjectURL(cutoutResultBlob!);
  }
}
