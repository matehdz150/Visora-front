"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* Click-and-drag to rotate the hero 3D figure (orbit), with momentum on
   release. Desktop only. The idle float/spin pause while dragging. */
export function HeroTilt({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      window.matchMedia("(max-width: 860px)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const el = ref.current;
    if (!el) return;

    // Drag adds rotation on top of the figure's base orientation (starts at 0).
    let rotX = 0;
    let rotY = 0;
    let velX = 0;
    let velY = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let raf = 0;
    const SENS = 0.45;
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      velX = 0;
      velY = 0;
      el.classList.add("hero-grabbing");
      el.setPointerCapture?.(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      rotY += dx * SENS;
      rotX = clamp(rotX - dy * SENS, -85, 85);
      velY = dx * SENS;
      velX = -dy * SENS;
    };

    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("hero-grabbing");
      el.releasePointerCapture?.(e.pointerId);
    };

    const loop = () => {
      if (!dragging) {
        // momentum + decay after release
        rotX = clamp(rotX + velX, -85, 85);
        rotY += velY;
        velX *= 0.94;
        velY *= 0.94;
        if (Math.abs(velX) < 0.01) velX = 0;
        if (Math.abs(velY) < 0.01) velY = 0;
      }
      el.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
      raf = requestAnimationFrame(loop);
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    raf = requestAnimationFrame(loop);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div style={{ perspective: 1400, width: "100%", height: "100%" }}>
      <div
        ref={ref}
        style={{ width: "100%", height: "100%", transformStyle: "preserve-3d", willChange: "transform", cursor: "grab", touchAction: "none" }}
      >
        {children}
      </div>
    </div>
  );
}
