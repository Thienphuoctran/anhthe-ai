import { createClient } from "@supabase/supabase-js";

/**
 * Chuẩn hóa URL Supabase:
 * Nếu người dùng cấu hình URL có đuôi /rest/v1/ hoặc dấu gạch chéo cuối,
 * hàm này sẽ tự động loại bỏ để SDK Supabase kết nối chính xác tới endpoint Auth và Database.
 */
export function getSanitizedSupabaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://lmanwfyxwejcmctycdlo.supabase.co";
  return raw.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtYW53Znl4d2VqY21jdHljZGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNDQwNzIsImV4cCI6MjEwNzcyMDA3Mn0.LVkIJbQ_6G6_T2OgNEiPSUH-XPb4PvpxvhUtVNwDlJw"
  );
}

export interface ProfileRecord {
  id: string;
  email?: string | null;
  credits: number;
  is_vip: boolean;
  vip_expires_at?: string | null; // ISO timestamp
  created_at?: string;
}

export const supabase = createClient(
  getSanitizedSupabaseUrl(),
  getSupabaseAnonKey(),
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Kích hoạt đăng nhập một chạm bằng Google OAuth
 */
export async function signInWithGoogle(redirectTo?: string) {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  const targetRedirect = redirectTo || `${origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: targetRedirect,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Lỗi đăng nhập Google:", error);
    throw error;
  }

  return data;
}

/**
 * Đăng xuất khỏi hệ thống
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Lỗi đăng xuất:", error);
    throw error;
  }
}

/**
 * Kiểm tra xem nhà cung cấp Google OAuth đã được bật trên Supabase Dashboard chưa
 */
export async function isGoogleProviderEnabled(): Promise<boolean> {
  try {
    const url = getSanitizedSupabaseUrl();
    const key = getSupabaseAnonKey();
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: {
        apikey: key,
      },
    });
    if (!res.ok) return false;
    const settings = await res.json();
    return Boolean(settings?.external?.google);
  } catch (err) {
    console.warn("Không thể kiểm tra trạng thái Google provider:", err);
    return false;
  }
}

