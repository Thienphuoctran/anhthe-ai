---
name: gsap-skills
description: GSAP animation, timeline choreography, score tweening, SVG bell curve & radar morphing for MOS Master Studio.
---

# GSAP Animation & Score Choreography

## 1. Mục tiêu
Tạo chuyển động mượt mà cho các chỉ số điểm thi (Score Tween 0 ➔ 1000 điểm), hiệu ứng hiển thị Staggered Bento Card, biến hình đa giác Radar 5 góc và hiệu ứng cảnh báo Anti-Cheat.

## 2. Quy tắc Bắt buộc: Quản lý Lifecycle với `gsap.context()`
Trong React 18/19 & Next.js, mọi hiệu ứng GSAP BẮT BUỘC phải được bọc trong `gsap.context()` để đảm bảo tự động dọn dẹp khi unmount (tránh duplicate animations / memory leaks):

```typescript
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export function useGsapScoreTween(targetScore: number) {
  const scoreRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetScore,
        duration: 1.8,
        ease: "power2.out",
        onUpdate: () => {
          if (scoreRef.current) {
            scoreRef.current.innerText = Math.round(obj.val).toString();
          }
        }
      });
    });

    return () => ctx.revert(); // Dọn dẹp sạch sẽ
  }, [targetScore]);

  return scoreRef;
}
```

## 3. Các hiệu ứng ứng dụng
- **Biểu đồ Radar ngũ giác:** Morphing đỉnh đa giác theo 5 kỹ năng MOS.
- **Biểu đồ Chuông Gauss (Bell Curve):** Vẽ đường cong phân phối chuẩn SVG với tween diện tích tích lũy percentile.
- **Anti-Cheat Warning Shake:** Rung lắc nhẹ khung hình khi phát hiện học viên rời màn hình thi.
