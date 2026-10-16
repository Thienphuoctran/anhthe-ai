-- ==============================================================================
-- THIẾT KẾ CƠ SỞ DỮ LIỆU CLOUD CHO ẢNH THẺ AI (SUPABASE POSTGRESQL)
-- Chuẩn hóa bảng profiles, RLS Policies và Trigger tự động tạo khi đăng nhập Google
-- ==============================================================================

-- 1. Tạo bảng profiles (nếu chưa tồn tại)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  credits INTEGER NOT NULL DEFAULT 0,
  is_vip BOOLEAN NOT NULL DEFAULT false,
  vip_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Kích hoạt Row Level Security (RLS) để đảm bảo an ninh dữ liệu
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Tạo các chính sách an ninh (RLS Policies)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 4. Tạo hàm và Trigger tự động khởi tạo profile khi người dùng đăng nhập Google OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits, is_vip)
  VALUES (new.id, new.email, 0, false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Bật Realtime cho bảng profiles để UI tự động cập nhật ngay lập tức khi nạp tiền
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
