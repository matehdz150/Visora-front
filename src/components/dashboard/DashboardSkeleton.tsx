"use client";

import React from "react";
import { motion } from "framer-motion";
import { loadingVariants } from "./animations";
import { card } from "./styles";

function Skeleton({ style }: { style?: React.CSSProperties }) {
  return <span className="dash-skeleton" style={{ display: "block", borderRadius: "8px", ...style }} />;
}

function SidebarSkeleton() {
  return (
    <aside style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: "250px", background: "#0b0b0b", borderRight: "1px solid rgba(255,255,255,0.08)", padding: "22px 18px", zIndex: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "11px", marginBottom: "28px" }}>
        <Skeleton style={{ width: "26px", height: "26px", borderRadius: "7px" }} />
        <Skeleton style={{ width: "74px", height: "18px" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} style={{ height: "36px", borderRadius: "9px" }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: "18px", right: "18px", bottom: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <Skeleton style={{ height: "44px", borderRadius: "10px" }} />
        <Skeleton style={{ height: "34px", borderRadius: "17px" }} />
      </div>
    </aside>
  );
}

export function DashboardSkeleton() {
  return (
    <motion.div variants={loadingVariants} initial="initial" animate="animate" exit="exit" style={{ display: "flex", minHeight: "100vh", background: "#050505" }}>
      <SidebarSkeleton />
      <main style={{ marginLeft: "250px", flex: 1, minHeight: "100vh" }}>
        <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "40px 44px 80px" }}>
          <Skeleton style={{ width: "180px", height: "34px", marginBottom: "12px" }} />
          <Skeleton style={{ width: "360px", height: "18px" }} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginTop: "32px" }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} style={{ ...card, padding: "20px" }}>
                <Skeleton style={{ width: "64%", height: "14px", marginBottom: "18px" }} />
                <Skeleton style={{ width: "46%", height: "32px" }} />
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.35fr 0.9fr", gap: "22px", marginTop: "34px", alignItems: "start" }}>
            <div style={{ ...card, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "18px", padding: "14px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} style={{ height: "12px" }} />)}
              </div>
              {Array.from({ length: 6 }).map((_, row) => (
                <div key={row} style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "18px", padding: "15px 22px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {Array.from({ length: 6 }).map((_, col) => <Skeleton key={col} style={{ height: "14px" }} />)}
                </div>
              ))}
            </div>

            <div style={{ ...card, padding: "22px" }}>
              <Skeleton style={{ width: "42%", height: "15px", marginBottom: "18px" }} />
              <Skeleton style={{ height: "150px", borderRadius: "12px", marginBottom: "18px" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Skeleton style={{ height: "76px", borderRadius: "12px" }} />
                <Skeleton style={{ height: "76px", borderRadius: "12px" }} />
              </div>
              <Skeleton style={{ height: "14px", marginTop: "22px", marginBottom: "12px", width: "55%" }} />
              {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} style={{ height: "34px", borderRadius: "10px", marginTop: "10px" }} />)}
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
