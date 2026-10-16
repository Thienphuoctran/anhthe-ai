"use client";

import React, { useState } from "react";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Copy,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { supabase, isGoogleProviderEnabled, signInWithGoogle } from "@/lib/supabaseClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showGoogleGuide, setShowGoogleGuide] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  if (!isOpen) return null;

  const callbackUrl = "https://lmanwfyxwejcmctycdlo.supabase.co/auth/v1/callback";

  const handleCopyCallback = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Xử lý khi bấm nút Đăng nhập bằng Google
  const handleGoogleClick = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      // 1. Kiểm tra xem Google provider đã được bật trên Supabase chưa
      const isEnabled = await isGoogleProviderEnabled();

      if (!isEnabled) {
        setIsLoading(false);
        setShowGoogleGuide(true);
        setErrorMsg(
          "Tính năng đăng nhập Google chưa được kích hoạt trên Supabase Dashboard của bạn. Bạn hãy xem hướng dẫn 3 bước bên dưới hoặc đăng nhập bằng Email."
        );
        return;
      }

      // 2. Nếu đã bật -> Chuyển hướng tới trang xác thực Google
      await signInWithGoogle();
    } catch (err: unknown) {
      setIsLoading(false);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi kết nối tới dịch vụ xác thực Google."
      );
    }
  };

  // Xử lý Đăng nhập / Đăng ký bằng Email & Mật khẩu
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Vui lòng nhập đầy đủ Email và Mật khẩu.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Mật khẩu phải có độ dài tối thiểu từ 6 ký tự.");
      return;
    }

    setIsLoading(true);

    try {
      if (tab === "signin") {
        // ĐĂNG NHẬP
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes("Email not confirmed")) {
            throw new Error(
              "Tài khoản chưa được xác nhận email. Hãy kiểm tra hộp thư hoặc vào Supabase Dashboard tắt tính năng 'Confirm email'."
            );
          }
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Email hoặc mật khẩu không chính xác.");
          }
          throw error;
        }

        if (data?.session) {
          setSuccessMsg("Đăng nhập thành công! Đang tải tài khoản...");
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 800);
        }
      } else {
        // ĐĂNG KÝ
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim() || email.split("@")[0],
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data?.session) {
          setSuccessMsg("Đăng ký thành công! Bạn đã đăng nhập vào hệ thống.");
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 1000);
        } else if (data?.user) {
          setSuccessMsg(
            "Đăng ký thành công! Bạn có thể dùng email này để đăng nhập ngay."
          );
          setTab("signin");
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi trong quá trình xác thực. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Tài Khoản ẢnhThẻ.AI</span>
            </h2>
            <p className="text-xs text-slate-500">
              Đồng bộ lượt tải & tài khoản VIP trên Supabase Cloud DB
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung Modal */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Thông báo lỗi nếu có */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Thông báo thành công */}
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="flex-1 leading-relaxed font-bold">{successMsg}</div>
            </div>
          )}

          {/* NÚT 1-CHẠM: ĐĂNG NHẬP VỚI GOOGLE */}
          <div>
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm border-2 border-slate-200 shadow-sm hover:border-slate-300 transition flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Đăng nhập nhanh bằng Google</span>
            </button>

            {/* Nút bật/tắt hướng dẫn kích hoạt Google */}
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => setShowGoogleGuide(!showGoogleGuide)}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>
                  {showGoogleGuide
                    ? "Thu gọn hướng dẫn kích hoạt"
                    : "Làm sao để kích hoạt Google Provider trên Supabase?"}
                </span>
              </button>
            </div>
          </div>

          {/* KHỐI HƯỚNG DẪN KÍCH HOẠT GOOGLE AUTH TRÊN SUPABASE */}
          {showGoogleGuide && (
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-3">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <span>🛠️ 3 Bước Bật Google Auth Trên Supabase:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed text-slate-700">
                <li>
                  Vào Supabase Dashboard ➔ mục <strong>Authentication</strong> (biểu tượng 2 hình người ở thanh trái) ➔ <strong>Providers</strong> ➔ <strong>Google</strong>.
                </li>
                <li>
                  Gạt nút <strong>Enable Google provider</strong> sang màu xanh.
                </li>
                <li>
                  Điền <strong>Client ID</strong> & <strong>Client Secret</strong> từ Google Cloud Console.
                </li>
              </ol>

              {/* URL Callback cần điền vào Google Cloud */}
              <div className="space-y-1 pt-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Callback URL (Dán vào Google Cloud Console):
                </div>
                <div className="flex items-center gap-1 bg-white p-2 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    readOnly
                    value={callbackUrl}
                    className="flex-1 text-[10px] font-mono bg-transparent text-slate-800 outline-none truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyCallback}
                    className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedUrl ? "Đã copy!" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Vạch kẻ hoặc */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs font-bold text-slate-400 uppercase">
              hoặc Email
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* TAB CHUYỂN ĐỔI: ĐĂNG NHẬP / ĐĂNG KÝ */}
          <div className="flex p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setTab("signin");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition ${
                tab === "signin"
                  ? "bg-white text-blue-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("signup");
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition ${
                tab === "signup"
                  ? "bg-white text-blue-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Đăng Ký Mới
            </button>
          </div>

          {/* FORM ĐĂNG NHẬP / ĐĂNG KÝ */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {tab === "signup" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Họ và tên</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-xs sm:text-sm text-slate-900"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-xs sm:text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mật khẩu</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-xs sm:text-sm text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : tab === "signin" ? (
                <>
                  <span>Đăng Nhập Ngay</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Tạo Tài Khoản Mới</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
