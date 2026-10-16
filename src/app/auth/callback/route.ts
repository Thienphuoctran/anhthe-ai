import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSanitizedSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    const supabaseUrl = getSanitizedSupabaseUrl();
    const supabaseKey = getSupabaseAnonKey();

    // Khởi tạo Supabase Server Client để xử lý cookie phiên đăng nhập
    const response = NextResponse.redirect(new URL(next, requestUrl.origin));

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }

    console.error("Lỗi trao đổi mã OAuth Supabase:", error);
  }

  // Trường hợp không có code hoặc lỗi, điều hướng về trang chủ
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
