"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  CameraOff,
  RefreshCw,
  Check,
  X,
  Timer,
  Sparkles,
  Eye,
  Sun,
  ShieldCheck,
  FlipHorizontal,
} from "lucide-react";

export interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
}: CameraCaptureModalProps) {
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isLoadingCamera, setIsLoadingCamera] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

  // Tính năng đếm ngược 3 giây
  const [useCountdown, setUseCountdown] = useState<boolean>(true);
  const [countdownNum, setCountdownNum] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isModalOpenRef = useRef<boolean>(false);

  // Tắt camera an toàn
  const stopCamera = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdownNum(null);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.error("Lỗi khi dừng track:", e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Khởi động luồng Camera với độ phân giải lý tưởng cho ảnh chân dung
  const startCamera = useCallback(async () => {
    stopCamera();
    setIsLoadingCamera(true);
    setCameraError(null);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError(
        "Trình duyệt hoặc thiết bị này không hỗ trợ truy cập Camera trực tiếp. Bạn vui lòng sử dụng tính năng tải ảnh từ máy."
      );
      setIsLoadingCamera(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Nếu người dùng đã đóng modal trong khi trình duyệt đang xin quyền camera, tắt ngay lập tức
      if (!isModalOpenRef.current) {
        stream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {}
        });
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.playsInline = true;
        await videoRef.current.play().catch((err) => {
          console.warn("Lỗi auto-play video:", err);
        });
      }
      setIsLoadingCamera(false);
    } catch (err: unknown) {
      console.error("Camera access error:", err);
      let errorMsg =
        "Không thể mở Camera. Vui lòng cấp quyền truy cập Camera trong cài đặt trình duyệt để tiếp tục.";
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          errorMsg =
            "Bạn đã từ chối quyền truy cập Camera. Hãy bấm vào biểu tượng ổ khóa/camera trên thanh địa chỉ trình duyệt để Cấp quyền (Allow), sau đó thử lại.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          errorMsg =
            "Không tìm thấy thiết bị Camera nào trên máy của bạn.";
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          errorMsg =
            "Camera đang được ứng dụng khác sử dụng (Zalo, Zoom, Teams...). Vui lòng tắt các ứng dụng đó rồi thử lại.";
        }
      }
      setCameraError(errorMsg);
      setIsLoadingCamera(false);
    }
  }, [facingMode, stopCamera]);

  // Quản lý vòng đời khi modal mở/đóng
  useEffect(() => {
    isModalOpenRef.current = isOpen;
    if (isOpen) {
      setCapturedPhotoUrl(null);
      setCapturedBlob(null);
      startCamera();
    } else {
      stopCamera();
      setCapturedPhotoUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setCapturedBlob(null);
    }

    return () => {
      isModalOpenRef.current = false;
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Chuyển đổi camera trước/sau
  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Thực hiện chụp ảnh từ khung hình hiện tại của Video lên Canvas ẩn
  const takeSnapshot = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    // Hiệu ứng màn trập chớp trắng
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 220);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Nếu là camera trước, lật gương để ảnh chụp ra khớp 100% với những gì người dùng thấy lúc soi gương
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const photoUrl = URL.createObjectURL(blob);
          setCapturedBlob(blob);
          setCapturedPhotoUrl(photoUrl);
          // Tạm dừng video để tiết kiệm pin
          stopCamera();
        }
      },
      "image/jpeg",
      0.95
    );
  }, [facingMode, stopCamera]);

  // Kích hoạt nút chụp (có đếm ngược 3s hoặc chụp ngay)
  const handleTriggerShutter = () => {
    if (isLoadingCamera || cameraError) return;

    if (useCountdown) {
      setCountdownNum(3);
      let count = 3;
      countdownTimerRef.current = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdownNum(count);
        } else {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          setCountdownNum(null);
          takeSnapshot();
        }
      }, 1000);
    } else {
      takeSnapshot();
    }
  };

  // Hủy ảnh vừa chụp & chụp lại
  const handleRetake = () => {
    if (capturedPhotoUrl) {
      URL.revokeObjectURL(capturedPhotoUrl);
    }
    setCapturedPhotoUrl(null);
    setCapturedBlob(null);
    startCamera();
  };

  // Xác nhận dùng ảnh này -> Chuyển thành File và gửi lên quy trình tách nền AI
  const handleConfirmUsePhoto = () => {
    if (!capturedBlob) return;
    const file = new File(
      [capturedBlob],
      `anhthe-camera-${Date.now()}.jpg`,
      { type: "image/jpeg" }
    );
    stopCamera();
    onCapture(file);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-0 sm:p-4 select-none">
      {/* Khung chính Modal */}
      <div className="relative w-full h-full sm:h-[92vh] sm:max-w-xl sm:rounded-3xl bg-slate-950 overflow-hidden flex flex-col justify-between shadow-2xl border border-slate-800">
        
        {/* ================= THANH ĐIỀU KHIỂN TRÊN CÙNG ================= */}
        <div className="relative z-30 px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-sm">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Chụp Ảnh Thẻ Trực Tiếp</span>
                <span className="text-[10px] bg-blue-500/30 text-blue-300 border border-blue-400/40 px-1.5 py-0.5 rounded-full font-semibold">
                  ICAO 9303
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                {capturedPhotoUrl ? "Xem lại ảnh đã chụp" : "Căn theo khung sinh trắc học"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Nút lật camera trước / sau */}
            {!capturedPhotoUrl && !cameraError && (
              <button
                type="button"
                onClick={handleSwitchCamera}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition backdrop-blur-sm"
                title="Đổi camera trước/sau"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            )}

            {/* Nút bật tắt hẹn giờ 3 giây */}
            {!capturedPhotoUrl && !cameraError && (
              <button
                type="button"
                onClick={() => setUseCountdown((prev) => !prev)}
                className={`px-2.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition backdrop-blur-sm border ${
                  useCountdown
                    ? "bg-amber-500/20 text-amber-300 border-amber-400/40"
                    : "bg-white/10 text-slate-400 border-white/10 hover:text-white"
                }`}
                title="Bật/Tắt đếm ngược 3 giây"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>{useCountdown ? "Hẹn giờ 3s" : "Ngay"}</span>
              </button>
            )}

            {/* Nút Đóng Modal */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition backdrop-blur-sm ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= KHUNG HIỂN THỊ CAMERA / ẢNH CHỤP ================= */}
        <div className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden">
          {/* Lớp chớp màn hình khi bấm chụp */}
          {isFlashing && (
            <div className="absolute inset-0 z-40 bg-white transition-opacity duration-150 pointer-events-none" />
          )}

          {/* Trường hợp 1: Có ảnh vừa chụp */}
          {capturedPhotoUrl ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedPhotoUrl}
                alt="Ảnh chụp thẻ vừa xong"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-xs">
                <Check className="w-4 h-4" />
                <span>Đã chụp xong! Kiểm tra độ sắc nét bên dưới</span>
              </div>
            </div>
          ) : cameraError ? (
            /* Trường hợp 2: Lỗi truy cập Camera */
            <div className="max-w-sm mx-auto p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
                <CameraOff className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white">
                  Không thể kết nối Camera
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {cameraError}
                </p>
              </div>
              <button
                type="button"
                onClick={startCamera}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Thử kết nối lại Camera</span>
              </button>
            </div>
          ) : (
            /* Trường hợp 3: Luồng Camera thời gian thực kèm Biometric Guide */
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Video Camera */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === "user" ? "scale-x-[-1]" : ""
                }`}
              />

              {/* Lớp phủ căn chuẩn sinh trắc học (Live Biometric Guide Overlay) */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                viewBox="0 0 400 600"
                preserveAspectRatio="xMidYMid slice"
              >
                <defs>
                  {/* Mặt nạ làm tối nhẹ 4 góc để người dùng dễ tập trung vào khuôn mặt */}
                  <mask id="faceHoleMask">
                    <rect width="400" height="600" fill="white" />
                    <ellipse cx="200" cy="245" rx="100" ry="145" fill="black" />
                  </mask>
                  <linearGradient id="neonCyan" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00f2fe" />
                    <stop offset="100%" stopColor="#4facfe" />
                  </linearGradient>
                  <linearGradient id="neonYellow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f6d365" />
                    <stop offset="100%" stopColor="#fda085" />
                  </linearGradient>
                </defs>

                {/* Vùng tối xung quanh ngoài khuôn mặt */}
                <rect
                  width="400"
                  height="600"
                  fill="rgba(0, 0, 0, 0.42)"
                  mask="url(#faceHoleMask)"
                />

                {/* 1. Đường kẻ giới hạn Đỉnh đầu (cách mép trên ~10% = 60px) */}
                <line
                  x1="60"
                  y1="65"
                  x2="340"
                  y2="65"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
                <rect
                  x="120"
                  y="48"
                  width="160"
                  height="18"
                  rx="9"
                  fill="rgba(15, 23, 42, 0.75)"
                  stroke="#38bdf8"
                  strokeWidth="1"
                />
                <text
                  x="200"
                  y="61"
                  fill="#38bdf8"
                  fontSize="9.5"
                  fontWeight="700"
                  textAnchor="middle"
                  letterSpacing="0.5"
                >
                  ĐỈNH ĐẦU CÁCH MÉP TRÊN (10%)
                </text>

                {/* 2. Trục đối xứng dọc căn thẳng mặt (Center Line) */}
                <line
                  x1="200"
                  y1="70"
                  x2="200"
                  y2="420"
                  stroke="rgba(255, 255, 255, 0.25)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* 3. Khung bầu dục định vị Khuôn mặt ở chính giữa */}
                <ellipse
                  cx="200"
                  cy="245"
                  rx="100"
                  ry="145"
                  fill="none"
                  stroke="url(#neonCyan)"
                  strokeWidth="2.5"
                  strokeDasharray="8 6"
                />

                {/* 4. Đường kẻ ngang màu vàng neon định vị vị trí Hai Mắt (Eye Level) */}
                <line
                  x1="105"
                  y1="220"
                  x2="295"
                  y2="220"
                  stroke="url(#neonYellow)"
                  strokeWidth="2.5"
                />
                <circle cx="150" cy="220" r="4" fill="#facc15" />
                <circle cx="250" cy="220" r="4" fill="#facc15" />
                <rect
                  x="135"
                  y="204"
                  width="130"
                  height="16"
                  rx="8"
                  fill="rgba(20, 15, 0, 0.8)"
                  stroke="#facc15"
                  strokeWidth="1"
                />
                <text
                  x="200"
                  y="215"
                  fill="#fef08a"
                  fontSize="9"
                  fontWeight="800"
                  textAnchor="middle"
                  letterSpacing="0.4"
                >
                  HAI MẮT NGANG ĐÂY
                </text>

                {/* 5. Vạch căn Cằm */}
                <line
                  x1="165"
                  y1="385"
                  x2="235"
                  y2="385"
                  stroke="#34d399"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
                <text
                  x="200"
                  y="400"
                  fill="#6ee7b7"
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  VỊ TRÍ CẰM
                </text>

                {/* 6. Đường cong định vị Bờ Vai cân đối */}
                <path
                  d="M 40,560 Q 115,465 160,445"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.45)"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                />
                <path
                  d="M 360,560 Q 285,465 240,445"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.45)"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                />
                <text
                  x="200"
                  y="470"
                  fill="rgba(255, 255, 255, 0.6)"
                  fontSize="8.5"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  BỜ VAI CÂN ĐỐI HAI BÊN
                </text>
              </svg>

              {/* Dòng chữ hướng dẫn động chạy trên đầu camera */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-sm">
                <div className="bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-xs font-bold py-2 px-3.5 rounded-full shadow-xl text-center flex items-center justify-center gap-2 animate-pulse">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">
                    Căn khuôn mặt vào khung bầu dục • Mắt ngang vạch vàng
                  </span>
                </div>
              </div>

              {/* Hoạt ảnh đếm ngược 3 giây to giữa màn hình */}
              {countdownNum !== null && (
                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-32 rounded-full bg-blue-600/90 text-white flex items-center justify-center text-7xl font-black shadow-2xl border-4 border-white animate-ping duration-700">
                    {countdownNum}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= THANH CÔNG CỤ ĐÁY & NÚT CHỤP ================= */}
        <div className="relative z-30 bg-gradient-to-t from-black/95 via-black/80 to-transparent px-4 pt-3 pb-5 space-y-3">
          {/* Thanh 3 mẹo nhanh (Pills) */}
          {!capturedPhotoUrl && (
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-white text-[10px] font-semibold backdrop-blur-sm border border-white/10">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Vén tóc lộ tai & trán</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-white text-[10px] font-semibold backdrop-blur-sm border border-white/10">
                <Eye className="w-3 h-3 text-blue-300" />
                <span>Mắt nhìn thẳng ống kính</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-white text-[10px] font-semibold backdrop-blur-sm border border-white/10">
                <Sun className="w-3 h-3 text-yellow-400" />
                <span>Đứng quay mặt ra ánh sáng</span>
              </div>
            </div>
          )}

          {/* Hàng nút bấm hành động */}
          <div className="flex items-center justify-center gap-4 pt-1">
            {capturedPhotoUrl ? (
              /* Đã chụp xong: Hiện nút Chụp lại vs Dùng ảnh này */
              <div className="flex items-center gap-3 w-full max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 py-3 px-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm transition flex items-center justify-center gap-2 border border-white/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Chụp lại ↺</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmUsePhoto}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2 border border-blue-400/40"
                >
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Dùng ảnh này (Tách nền AI)</span>
                </button>
              </div>
            ) : (
              /* Chưa chụp: Nút Shutter to tròn ở chính giữa */
              <div className="flex items-center justify-center w-full">
                <button
                  type="button"
                  disabled={isLoadingCamera || !!cameraError || countdownNum !== null}
                  onClick={handleTriggerShutter}
                  className="relative group w-20 h-20 rounded-full bg-white/20 p-1 flex items-center justify-center transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title={useCountdown ? "Bấm để đếm ngược 3 giây và chụp" : "Bấm để chụp ngay"}
                >
                  <div className="w-full h-full rounded-full border-4 border-white flex items-center justify-center bg-white/10 group-hover:bg-white/30 transition">
                    <div className="w-14 h-14 rounded-full bg-white group-hover:bg-blue-500 transition shadow-lg flex items-center justify-center">
                      <Camera className="w-6 h-6 text-slate-900 group-hover:text-white transition" />
                    </div>
                  </div>
                  {useCountdown && (
                    <span className="absolute -top-2 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-xs">
                      3s
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
