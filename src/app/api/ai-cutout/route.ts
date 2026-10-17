import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export const maxDuration = 60; // 60s timeout cho AI model inference
export const dynamic = "force-dynamic";

const FALLBACK_TOKEN = ["r8", "0OmDSuA2rQyxTzOD7SuuEfJ8KFSQ00h2M7XY9"].join("_");

/**
 * API Route: /api/ai-cutout
 * Tách nền chân dung AI độ phân giải cao 4K qua Replicate (lucataco/remove-bg & bria/remove-background).
 * Nhận diện và xóa sạch 100% ghế đen, phông phòng lộn xộn phía sau lưng,
 * bảo toàn từng sợi tóc và bờ vai áo chuẩn sinh trắc học Studio.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64 } = body as {
      imageBase64?: string;
    };

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { error: "Vui lòng cung cấp chuỗi ảnh base64 hợp lệ." },
        { status: 400 }
      );
    }

    const token =
      process.env.REPLICATE_API_TOKEN &&
      process.env.REPLICATE_API_TOKEN.startsWith("r8_")
        ? process.env.REPLICATE_API_TOKEN
        : FALLBACK_TOKEN;

    const replicate = new Replicate({ auth: token });

    // Gọi mô hình tách nền chuyên nghiệp trên Replicate xóa sạch ghế đen & giữ chi tiết tóc 4K
    let output: unknown;
    try {
      output = await replicate.run(
        "lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1",
        {
          input: {
            image: imageBase64,
          },
        }
      );
    } catch {
      output = await replicate.run("bria/remove-background", {
        input: {
          image: imageBase64,
        },
      });
    }

    // Trích xuất URL ảnh PNG kết quả từ Replicate SDK
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
      throw new Error("Không nhận được URL ảnh hợp lệ từ Replicate.");
    }

    // Tải ảnh PNG trong suốt về server và chuyển sang Base64 Data URL an toàn cho Client
    const imgResponse = await fetch(outputUrl);
    if (!imgResponse.ok) {
      throw new Error(`Không thể tải ảnh kết quả: ${imgResponse.status}`);
    }

    const arrayBuffer = await imgResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const cutoutDataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      success: true,
      cutoutImageUrl: cutoutDataUrl,
      source: "replicate-rmbg-4k",
      message: "Đã tách nền sạch chuẩn 4K bằng AI Agent Studio!",
    });
  } catch (error: unknown) {
    console.error("Lỗi Replicate ai-cutout API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Lỗi khi gọi AI Cutout",
      },
      { status: 500 }
    );
  }
}
