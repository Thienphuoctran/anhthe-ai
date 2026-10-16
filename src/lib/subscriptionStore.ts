export interface UserPlan {
  credits: number;
  isVip: boolean;
  vipExpiry: number | null; // Timestamp (ms) hoặc null
}

const STORAGE_KEY = "anhthe_ai_user_plan_v1";
export const SUBSCRIPTION_EVENT = "anhthe-subscription-updated";

const DEFAULT_PLAN: UserPlan = {
  credits: 0,
  isVip: false,
  vipExpiry: null,
};

/**
 * Thông báo cho các component React biết trạng thái gói cước vừa thay đổi.
 */
function notifyPlanChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SUBSCRIPTION_EVENT));
  }
}

/**
 * Lưu trạng thái gói cước xuống localStorage an toàn.
 */
function saveUserPlan(plan: UserPlan): UserPlan {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
      notifyPlanChanged();
    } catch (err) {
      console.warn("Không thể lưu trạng thái gói cước vào localStorage:", err);
    }
  }
  return plan;
}

/**
 * Lấy thông tin gói cước hiện tại của người dùng từ localStorage.
 * Tự động kiểm tra hạn sử dụng VIP (nếu đã quá hạn sẽ tự động tắt isVip).
 */
export function getUserPlan(): UserPlan {
  if (typeof window === "undefined") {
    return { ...DEFAULT_PLAN };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_PLAN };
    }

    const parsed = JSON.parse(raw) as Partial<UserPlan>;
    const now = Date.now();

    let isVip = Boolean(parsed.isVip);
    let vipExpiry = typeof parsed.vipExpiry === "number" ? parsed.vipExpiry : null;
    const credits =
      typeof parsed.credits === "number" && parsed.credits >= 0
        ? Math.floor(parsed.credits)
        : 0;

    // Kiểm tra nếu gói VIP đã hết hạn
    if (isVip && vipExpiry !== null && vipExpiry <= now) {
      isVip = false;
      vipExpiry = null;
      const updated: UserPlan = { credits, isVip, vipExpiry };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }

    return {
      credits,
      isVip,
      vipExpiry,
    };
  } catch (err) {
    console.warn("Lỗi đọc trạng thái gói cước từ localStorage:", err);
    return { ...DEFAULT_PLAN };
  }
}

/**
 * Cộng thêm n lượt tải ảnh HD (Gói Lẻ 1 ảnh hoặc Gói Gia Đình 10 ảnh - không giới hạn thời gian).
 */
export function addCredits(n: number): UserPlan {
  const current = getUserPlan();
  const added = Math.max(0, Math.floor(n));
  const updated: UserPlan = {
    ...current,
    credits: current.credits + added,
  };
  return saveUserPlan(updated);
}

/**
 * Kích hoạt gói Pro Studio (VIP) trong số ngày chỉ định (mặc định 30 ngày).
 */
export function activateVip(days: number = 30): UserPlan {
  const current = getUserPlan();
  const now = Date.now();
  const durationMs = Math.max(1, days) * 24 * 60 * 60 * 1000;

  // Nếu đang còn hạn VIP thì cộng dồn thêm ngày, ngược lại tính từ thời điểm hiện tại
  const baseTime =
    current.isVip && current.vipExpiry && current.vipExpiry > now
      ? current.vipExpiry
      : now;

  const updated: UserPlan = {
    ...current,
    isVip: true,
    vipExpiry: baseTime + durationMs,
  };
  return saveUserPlan(updated);
}

/**
 * Sử dụng 1 lượt tải ảnh HD:
 * - Nếu người dùng đang có gói VIP còn hạn: Trả về true ngay lập tức (tải không giới hạn, không trừ credit).
 * - Nếu người dùng có credits > 0: Trừ 1 credit và trả về true.
 * - Nếu hết lượt và không phải VIP: Trả về false.
 */
export function consumeOneCredit(): boolean {
  const current = getUserPlan();

  if (current.isVip) {
    return true;
  }

  if (current.credits > 0) {
    saveUserPlan({
      ...current,
      credits: current.credits - 1,
    });
    return true;
  }

  return false;
}
