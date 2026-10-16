---
name: threejs-skills
description: Three.js 3D WebGL visualization guidelines for Antigravity, featuring OpenXmlConstellation and strict GPU Lifecycle Guard.
---

# Three.js 3D Visuals & GPU Lifecycle Guard

## 1. Mục tiêu
Xây dựng hiệu ứng 3D trực quan tương tác (như OpenXmlConstellation ở Hero landing page) với hiệu năng cao, không gây rò rỉ bộ nhớ (memory leak) và tối ưu GPU 0% khi vào phòng thi.

## 2. Quy tắc Bắt buộc: GPU Lifecycle Guard
- Khi người dùng ở Landing Page / Hero: Render 3D WebGL với Three.js ở 60fps.
- Khi người dùng chuyển sang phòng thi Certiport (`view === 'exam'` hoặc route `/exam/[slug]`):
  - BẮT BUỘC gọi `cancelAnimationFrame(animationFrameId)`.
  - Hủy bộ renderer: `renderer.dispose()`.
  - Dọn sạch Scene, Camera, Geometries, Materials và gỡ bỏ WebGL Context.
  - Hạ mức tiêu thụ GPU về chính xác 0% để dành toàn bộ tài nguyên cho trình duyệt và mô phỏng Office.

## 3. Kiến trúc Component mẫu
```typescript
useEffect(() => {
  let animationFrameId: number;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  // Setup scene, camera, mesh...

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    // render logic
  };
  animate();

  return () => {
    cancelAnimationFrame(animationFrameId);
    renderer.dispose();
    geometry.dispose();
    material.dispose();
  };
}, []);
```
