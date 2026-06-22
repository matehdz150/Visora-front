"use client";

import React, { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_LABEL } from "../constants";
import { brandPill, cap, card, fmtRisk, pill, riskCell } from "../styles";
import type { Category, Project, ReviewItem } from "../types";

function catText(category: Category | null) {
  return category ? CATEGORY_LABEL[category] : "Uncategorized";
}

function imageTint(category: Category | null) {
  if (category === "violence" || category === "weapons") return ["rgba(255,90,90,0.13)", "rgba(255,90,90,0.035)"];
  if (category === "drugs") return ["rgba(126,155,255,0.13)", "rgba(126,155,255,0.035)"];
  if (category === "suggestive" || category === "nudity") return ["rgba(232,201,138,0.13)", "rgba(232,201,138,0.035)"];
  if (category === "alcohol") return ["rgba(126,224,168,0.1)", "rgba(126,224,168,0.025)"];
  return ["rgba(255,255,255,0.07)", "rgba(255,255,255,0.018)"];
}

function shortKey(imageKey: string) {
  const parts = imageKey.split("/");
  return parts[parts.length - 1] || imageKey;
}

function getNextId(reviews: ReviewItem[], currentId: string | null) {
  if (reviews.length === 0) return null;
  const index = reviews.findIndex((review) => review.reviewId === currentId);
  return reviews[(index + 1 >= reviews.length || index < 0 ? 0 : index + 1)].reviewId;
}

export function ReviewsPage({
  projects,
  reviews,
  resolvingReviewId,
  onOpenModeration,
  onDecideReview,
}: {
  projects: Project[];
  reviews: ReviewItem[];
  resolvingReviewId: string | null;
  onOpenModeration: (review: ReviewItem) => void;
  onDecideReview: (
    reviewId: string,
    decision: "approved" | "rejected" | "ignored"
  ) => Promise<void>;
}) {
  const [projectFilter, setProjectFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const projectName = Object.fromEntries(projects.map((project) => [project.id, project.name]));
  const filtered = useMemo(
    () =>
      reviews.filter((review) =>
        projectFilter === "all" ? true : review.projectId === projectFilter
      ),
    [reviews, projectFilter]
  );
  const selected =
    filtered.find((review) => review.reviewId === selectedId) ?? filtered[0] ?? null;
  const busy = selected ? resolvingReviewId === selected.reviewId : false;
  const currentIndex = selected
    ? filtered.findIndex((review) => review.reviewId === selected.reviewId) + 1
    : 0;

  const decideSelected = async (decision: "approved" | "rejected" | "ignored") => {
    if (!selected) return;
    const nextId = getNextId(filtered, selected.reviewId);
    await onDecideReview(selected.reviewId, decision);
    setSelectedId(nextId === selected.reviewId ? null : nextId);
  };

  const skipSelected = () => {
    setSelectedId(getNextId(filtered, selected?.reviewId ?? null));
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 44px 80px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 600, letterSpacing: "-0.03em" }}>Review queue</h1>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#e8c98a", background: "rgba(232,201,138,0.12)", border: "1px solid rgba(232,201,138,0.25)", borderRadius: "999px", padding: "3px 9px" }}>{filtered.length} pending</span>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Review images that landed in a human decision state.</p>
        </div>
        <Select
          value={projectFilter}
          onValueChange={(value) => {
            setProjectFilter(value);
            setSelectedId(null);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {reviews.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "74px 20px" }}>
          <div style={{ position: "relative", width: "108px", height: "108px", display: "grid", placeItems: "center", marginBottom: "28px" }}>
            <div style={{ position: "absolute", inset: "-20px", background: "radial-gradient(circle, rgba(126,224,168,0.18), rgba(126,224,168,0) 68%)" }} />
            <div style={{ width: "86px", height: "86px", borderRadius: "24px", background: "linear-gradient(155deg,#1c1e26,#0a0b0e)", border: "1px solid rgba(126,224,168,0.3)", display: "grid", placeItems: "center", fontSize: "38px", color: "#7ee0a8", boxShadow: "0 0 30px rgba(126,224,168,0.18)" }}>✓</div>
          </div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>All caught up</h2>
          <p style={{ margin: "12px 0 0", maxWidth: "390px", fontSize: "15px", lineHeight: 1.6, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>No images are waiting for review. New items appear here when a project policy returns review.</p>
        </div>
      ) : selected ? (
        <div className="r-stack" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 330px", gap: "22px", marginTop: "30px", alignItems: "start" }}>
          <section style={{ ...card, padding: "20px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.38)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Item {currentIndex} of {filtered.length}</div>
                <h2 style={{ margin: "6px 0 0", fontSize: "20px", fontWeight: 600 }}>{catText(selected.category)}</h2>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={riskCell(selected.riskScore)}>{fmtRisk(selected.riskScore)}</span>
                <span style={pill("review")}>Review</span>
              </div>
            </div>

            <div style={{ position: "relative", aspectRatio: "16 / 10", borderRadius: "16px", overflow: "hidden", background: "#090909", border: "1px solid rgba(255,255,255,0.08)" }}>
              {selected.imageUrl ? (
                <img src={selected.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: revealed[selected.reviewId] ? "none" : "blur(16px)", transform: revealed[selected.reviewId] ? "scale(1)" : "scale(1.03)", transition: "filter .18s, transform .18s" }} />
              ) : (
                <div style={{ height: "100%", background: `repeating-linear-gradient(45deg, ${imageTint(selected.category)[0]} 0 11px, ${imageTint(selected.category)[1]} 11px 22px)`, display: "grid", placeItems: "center", color: "rgba(255,255,255,0.42)", fontSize: "13px" }}>No image preview</div>
              )}
              {!revealed[selected.reviewId] && (
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(5,5,5,0.26)" }}>
                  <button onClick={() => setRevealed((prev) => ({ ...prev, [selected.reviewId]: true }))} style={{ padding: "10px 14px", borderRadius: "11px", border: "1px solid rgba(255,255,255,0.16)", background: "rgba(10,10,10,0.72)", color: "#fff", fontFamily: "inherit", fontSize: "13px", cursor: "pointer", backdropFilter: "blur(12px)" }}>Reveal image</button>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "16px" }}>
              <div style={{ padding: "13px", borderRadius: "12px", background: "#000", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "5px" }}>Project</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.86)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{projectName[selected.projectId] ?? selected.project}</div>
              </div>
              <div style={{ padding: "13px", borderRadius: "12px", background: "#000", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "5px" }}>Brand safety</div>
                <span style={brandPill(selected.brandLevel)}>{cap(selected.brandLevel)}</span>
              </div>
              <button onClick={() => onOpenModeration(selected)} style={{ padding: "13px", borderRadius: "12px", background: "#000", border: "1px solid rgba(255,255,255,0.07)", textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginBottom: "5px" }}>Moderation ID</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.72)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.moderationId}</div>
              </button>
            </div>

            {selected.explanation && (
              <div style={{ marginTop: "18px", padding: "16px", borderRadius: "14px", background: "rgba(232,201,138,0.07)", border: "1px solid rgba(232,201,138,0.18)" }}>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.42)", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Policy decision</div>
                <div style={{ fontSize: "14px", lineHeight: 1.55, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>{selected.explanation.message}</div>
              </div>
            )}

            <div style={{ marginTop: "18px", padding: "16px", borderRadius: "14px", background: "#000", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.72)", marginBottom: "12px" }}>Detected labels</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
                {(selected.labels ?? []).slice(0, 6).map((label) => (
                  <div key={`${label.name}-${label.confidence}`}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", marginBottom: "5px" }}>
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.82)" }}>{label.name}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.48)" }}>{label.confidence.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: "4px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                      <div style={{ width: `${label.confidence}%`, height: "100%", borderRadius: "999px", background: selected.riskScore >= 70 ? "#e8c98a" : "rgba(126,155,255,0.75)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "18px" }}>
              <button disabled={busy} onClick={() => decideSelected("rejected")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "16px", borderRadius: "13px", background: "rgba(255,90,90,0.12)", border: "1px solid rgba(255,90,90,0.32)", color: "#ff9b9b", fontFamily: "inherit", fontSize: "15px", fontWeight: 600, cursor: busy ? "wait" : "pointer" }}>Reject</button>
              <button disabled={busy} onClick={() => decideSelected("approved")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "16px", borderRadius: "13px", background: "rgba(126,224,168,0.12)", border: "1px solid rgba(126,224,168,0.32)", color: "#7ee0a8", fontFamily: "inherit", fontSize: "15px", fontWeight: 600, cursor: busy ? "wait" : "pointer" }}>Approve</button>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "12px" }}>
              <button disabled={busy || filtered.length < 2} onClick={skipSelected} style={{ padding: "9px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "#000", color: "rgba(255,255,255,0.68)", fontFamily: "inherit", fontSize: "13px", cursor: busy ? "wait" : "pointer" }}>Skip</button>
              <button disabled={busy} onClick={() => decideSelected("ignored")} style={{ padding: "9px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", background: "#000", color: "rgba(255,255,255,0.68)", fontFamily: "inherit", fontSize: "13px", cursor: busy ? "wait" : "pointer" }}>Ignore</button>
            </div>
          </section>

          <aside style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ ...card, overflow: "hidden" }}>
              <div style={{ padding: "15px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "14px", fontWeight: 600 }}>Up next</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{filtered.length} items</span>
              </div>
              <div style={{ maxHeight: "630px", overflowY: "auto" }}>
                {filtered.map((review) => {
                  const active = selected.reviewId === review.reviewId;
                  const tint = imageTint(review.category);
                  return (
                    <button key={review.reviewId} onClick={() => setSelectedId(review.reviewId)} style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "11px 16px", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", borderLeft: active ? "2px solid #aebfff" : "2px solid transparent", background: active ? "rgba(126,155,255,0.08)" : "transparent", color: "inherit", fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}>
                      <span style={{ position: "relative", width: "46px", height: "46px", borderRadius: "9px", overflow: "hidden", flexShrink: 0, border: "1px solid rgba(255,255,255,0.1)", background: `repeating-linear-gradient(45deg, ${tint[0]} 0 7px, ${tint[1]} 7px 14px)` }}>
                        {review.imageUrl ? <img src={review.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(6px)", transform: "scale(1.05)" }} /> : null}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{catText(review.category)}</span>
                        <span style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shortKey(review.imageKey)}</span>
                      </span>
                      <span style={{ ...riskCell(review.riskScore), fontSize: "12px", flexShrink: 0 }}>{fmtRisk(review.riskScore)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ padding: "14px 16px", borderRadius: "12px", background: "rgba(126,155,255,0.05)", border: "1px solid rgba(126,155,255,0.16)" }}>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}><strong style={{ color: "#aebfff", fontWeight: 600 }}>Policy review</strong> keeps uncertain images separate from hard rejects, so teams can approve edge cases without weakening automated rules.</div>
            </div>
          </aside>
        </div>
      ) : (
        <div style={{ ...card, marginTop: "28px", padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>No reviews match this filter.</div>
      )}
    </div>
  );
}
