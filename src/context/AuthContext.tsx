"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import {
  supabase,
  signInWithGoogle,
  signOut as supabaseSignOut,
  ProfileRecord,
} from "@/lib/supabaseClient";
import {
  UserPlan,
  getUserPlan as getLocalUserPlan,
  addCredits as addLocalCredits,
  activateVip as activateLocalVip,
  consumeOneCredit as consumeLocalCredit,
  SUBSCRIPTION_EVENT,
} from "@/lib/subscriptionStore";

interface AuthContextType {
  user: User | null;
  profile: ProfileRecord | null;
  userPlan: UserPlan;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  consumeCredit: () => Promise<boolean>;
  addCredits: (n: number) => Promise<UserPlan>;
  activateVip: (days?: number) => Promise<UserPlan>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan>({
    credits: 0,
    isVip: false,
    vipExpiry: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Hàm tải thông tin profile từ bảng 'profiles' trong Supabase PostgreSQL
  const fetchProfile = useCallback(async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error) {
        console.warn("Lỗi khi đọc profile Supabase:", error.message);
        return null;
      }

      if (data) {
        const record = data as ProfileRecord;
        const now = Date.now();
        const vipExpiryMs = record.vip_expires_at
          ? new Date(record.vip_expires_at).getTime()
          : null;

        // Tự động kiểm tra nếu VIP đã hết hạn thì cập nhật lên Cloud
        let isVip = Boolean(record.is_vip);
        let finalExpiryMs = vipExpiryMs;

        if (isVip && vipExpiryMs !== null && vipExpiryMs <= now) {
          isVip = false;
          finalExpiryMs = null;
          await supabase
            .from("profiles")
            .update({ is_vip: false, vip_expires_at: null })
            .eq("id", currentUser.id);
        }

        const plan: UserPlan = {
          credits: Math.max(0, record.credits ?? 0),
          isVip,
          vipExpiry: finalExpiryMs,
        };

        setProfile(record);
        setUserPlan(plan);
        return record;
      } else {
        // Chưa có profile -> Tạo mới dòng profile trong bảng PostgreSQL
        const newRecord = {
          id: currentUser.id,
          email: currentUser.email || null,
          credits: 0,
          is_vip: false,
          vip_expires_at: null,
        };

        const { data: inserted, error: insertError } = await supabase
          .from("profiles")
          .insert([newRecord])
          .select()
          .maybeSingle();

        if (insertError) {
          console.warn("Không thể tự động tạo profile:", insertError.message);
        }

        const validRecord = (inserted as ProfileRecord) || newRecord;
        setProfile(validRecord);
        setUserPlan({ credits: 0, isVip: false, vipExpiry: null });
        return validRecord;
      }
    } catch (err) {
      console.error("Lỗi fetchProfile:", err);
      return null;
    }
  }, []);

  // Khởi tạo và lắng nghe phiên đăng nhập Supabase Auth
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user);
        } else {
          // Chưa đăng nhập -> Dùng tạm plan local hoặc 0
          setUser(null);
          setProfile(null);
          setUserPlan(getLocalUserPlan());
        }
      } catch (err) {
        console.error("Lỗi khởi tạo Supabase Auth:", err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // Lắng nghe sự kiện thay đổi đăng nhập/đăng xuất
    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setUserPlan(getLocalUserPlan());
      }
    });

    // Lắng nghe sự kiện đồng bộ subscription event nội bộ
    const syncLocal = () => {
      if (!user) {
        setUserPlan(getLocalUserPlan());
      }
    };
    window.addEventListener(SUBSCRIPTION_EVENT, syncLocal);

    return () => {
      mounted = false;
      authSub.unsubscribe();
      window.removeEventListener(SUBSCRIPTION_EVENT, syncLocal);
    };
  }, [fetchProfile, user]);

  // Lắng nghe thay đổi Realtime trên bảng 'profiles' của Supabase PostgreSQL
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`profile_changes_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            const rec = payload.new as ProfileRecord;
            const vipExpiryMs = rec.vip_expires_at
              ? new Date(rec.vip_expires_at).getTime()
              : null;

            setProfile(rec);
            setUserPlan({
              credits: Math.max(0, rec.credits ?? 0),
              isVip: Boolean(rec.is_vip),
              vipExpiry: vipExpiryMs,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Làm mới profile thủ công
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user);
    } else {
      setUserPlan(getLocalUserPlan());
    }
  }, [user, fetchProfile]);

  // Đăng nhập bằng Google
  const handleSignInGoogle = async () => {
    await signInWithGoogle();
  };

  // Đăng xuất
  const handleSignOut = async () => {
    await supabaseSignOut();
    setUser(null);
    setProfile(null);
    setUserPlan({ credits: 0, isVip: false, vipExpiry: null });
  };

  // Trừ 1 credit khi tải ảnh
  const consumeCredit = async (): Promise<boolean> => {
    // 1. Nếu là tài khoản VIP: Cho phép tải không giới hạn
    if (userPlan.isVip) {
      return true;
    }

    // 2. Nếu người dùng đã đăng nhập Supabase: Trừ trên Cloud PostgreSQL
    if (user) {
      if (userPlan.credits > 0) {
        const nextCredits = userPlan.credits - 1;
        const { error } = await supabase
          .from("profiles")
          .update({ credits: nextCredits })
          .eq("id", user.id);

        if (!error) {
          setUserPlan((prev) => ({ ...prev, credits: nextCredits }));
          return true;
        } else {
          console.error("Lỗi trừ credit trên Supabase:", error.message);
          return false;
        }
      }
      return false;
    }

    // 3. Nếu chưa đăng nhập: Trừ theo localStorage dự phòng
    return consumeLocalCredit();
  };

  // Cộng credits (khi thanh toán thành công)
  const handleAddCredits = async (n: number): Promise<UserPlan> => {
    const added = Math.max(0, Math.floor(n));

    if (user) {
      const nextCredits = (userPlan.credits || 0) + added;
      const { error } = await supabase
        .from("profiles")
        .update({ credits: nextCredits })
        .eq("id", user.id);

      if (error) {
        console.error("Lỗi cập nhật credits trên Supabase:", error.message);
      }

      const updated: UserPlan = {
        ...userPlan,
        credits: nextCredits,
      };
      setUserPlan(updated);
      return updated;
    }

    // Fallback nếu chưa đăng nhập
    const localUpdated = addLocalCredits(n);
    setUserPlan(localUpdated);
    return localUpdated;
  };

  // Kích hoạt VIP (khi thanh toán thành công)
  const handleActivateVip = async (days: number = 30): Promise<UserPlan> => {
    const now = Date.now();
    const durationMs = Math.max(1, days) * 24 * 60 * 60 * 1000;
    const baseTime =
      userPlan.isVip && userPlan.vipExpiry && userPlan.vipExpiry > now
        ? userPlan.vipExpiry
        : now;
    const newExpiryMs = baseTime + durationMs;
    const isoExpiry = new Date(newExpiryMs).toISOString();

    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_vip: true,
          vip_expires_at: isoExpiry,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Lỗi kích hoạt VIP trên Supabase:", error.message);
      }

      const updated: UserPlan = {
        ...userPlan,
        isVip: true,
        vipExpiry: newExpiryMs,
      };
      setUserPlan(updated);
      return updated;
    }

    // Fallback nếu chưa đăng nhập
    const localUpdated = activateLocalVip(days);
    setUserPlan(localUpdated);
    return localUpdated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        userPlan,
        isLoading,
        signInWithGoogle: handleSignInGoogle,
        signOut: handleSignOut,
        refreshProfile,
        consumeCredit,
        addCredits: handleAddCredits,
        activateVip: handleActivateVip,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }
  return context;
}
