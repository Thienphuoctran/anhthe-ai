import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export const maxDuration = 60; // 60s timeout cho AI model inference
export const dynamic = "force-dynamic";

/**
 * API Route: /api/ai-enhance
 * Tích hợp AI Studio Agent làm nét và phục hồi chân dung 4K (CodeFormer) qua Replicate SDK mới nhất.
 * Có cơ chế Fallback an toàn sang bộ lọc High-Pass Studio nội bộ nếu mạng hoặc quota gặp sự cố.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, fidelity } = body as {
      imageBase64?: string;
      fidelity?: number;
    };

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { error: "Vui lòng cung cấp chuỗi ảnh hợp lệ (imageBase64)." },
        { status: 400 }
      );
    }

    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      throw new Error("REPLICATE_API_TOKEN chưa được cấu hình.");
    }

    const replicate = new Replicate({ auth: token });

    // Gọi mô hình phục hồi khuôn mặt studio CodeFormer
    const output: unknown = await replicate.run(
      "sczhou/codeformer:7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
      {
        input: {
          image: imageBase64,
          codeformer_fidelity: fidelity ?? 0.78,
          background_enhance: true,
          face_upsample: true,
          upscale: 2,
        },
      }
    );

    // Xử lý an toàn kết quả trả về của Replicate SDK (String, Array, FileOutput object)
    let outputUrl = "";
    if (typeof output === "string") {
      outputUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      const firstItem = output[0];
      if (typeof firstItem === "string") {
        outputUrl = firstItem;
      } else if (
        firstItem &&
        typeof (firstItem as { url?: unknown }).url === "function"
      ) {
        outputUrl = String((firstItem as { url: () => string }).url());
      } else {
        outputUrl = String(firstItem);
      }
    } else if (
      output &&
      typeof (output as { url?: unknown }).url === "function"
    ) {
      outputUrl = String((output as { url: () => string }).url());
    } else if (
      output &&
      typeof (output as { url?: unknown }).url === "string"
    ) {
      outputUrl = (output as { url: string }).url;
    } else if (output) {
      outputUrl = String(output);
    }

    if (!outputUrl || !outputUrl.startsWith("http")) {
      throw new Error("Không nhận được URL hợp lệ từ Replicate SDK.");
    }

    // Tải ảnh về Server và chuyển sang Base64 để chống lỗi CORS Tainted Canvas ở Client
    const imgResponse = await fetch(outputUrl);
    if (!imgResponse.ok) {
      throw new Error(`Không thể tải ảnh từ Replicate: ${imgResponse.status}`);
    }

    const arrayBuffer = await imgResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const enhancedDataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      success: true,
      enhancedImageUrl: enhancedDataUrl,
      source: "replicate-cloud",
      message: "Đã phục hồi và làm nét khuôn mặt 4K bằng AI Studio Agent!",
    });
  } catch (error: unknown) {
    console.warn(
      "Replicate API gặp sự cố, kích hoạt Fallback High-Pass Studio nội bộ:",
      error
    );

    // Cơ chế Fallback an toàn với status 200 để không làm gián đoạn trải nghiệm người dùng
    return NextResponse.json(
      {
        success: false,
        fallback: true,
        message: "Đã kích hoạt bộ lọc High-Pass Studio nội bộ",
      },
      { status: 200 }
    );
  }
}
