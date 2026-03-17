"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { Icons } from "@/components/icons";
import { type User } from "next-auth";

export type Badge = {
  id: number;
  title: string;
  period: string;
  image: StaticImageData;
  color: string;
  extraBadge?: {
    title: string;
    image: StaticImageData;
    color: string;
  };
};

type AchievementDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: Badge | null;
  user: User;
};

export default function AchievementDialog({
  open,
  onOpenChange,
  badge,
  user,
}: AchievementDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current || !badge) return;

    try {
      setIsDownloading(true);

      const domToImage = (await import("dom-to-image-more")).default;

      const dataUrl = await domToImage.toPng(cardRef.current, {
        scale: 3,
        bgcolor: "#0a0a0a",
        style: {
          outline: "none",
          border: "none",
        },
        filter: (node: Node) => {
          if (node instanceof HTMLElement) {
            node.style.outline = "none";
            if (node.style.border?.includes("0.5px")) {
              node.style.border = node.style.border.replace("0.5px", "1px");
            }
          }
          return true;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const link = document.createElement("a");
      link.download = `${badge.title.replace(/\s+/g, "-").toLowerCase()}-achievement.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download image:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!badge) return null;

  const color = badge.color;
  const colorFaint = `${color}70`;
  const colorFainter = `${color}30`;
  // const colorBorder = `${color}18`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 border-0 bg-transparent p-0 shadow-none [&>button]:hidden">
        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-2 -top-10 z-50 h-8 w-8 rounded-full border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Shareable card */}
          <div
            ref={cardRef}
            id="achievement-card"
            style={{
              position: "relative",
              width: 360,
              height: 640,
              backgroundColor: "#0a0a0a",
              borderRadius: 20,
              overflow: "hidden",
              fontFamily: "sans-serif",
              outline: "none",
              border: "none",
            }}
          >
            <style>{`
              #achievement-card * {
                box-sizing: border-box;
                outline: none;
              }
              #achievement-card div:not([style*="border:"]) {
                border: none;
              }
            `}</style>

            {/* Neon SVG rings */}
            <svg
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                border: "none",
                outline: "none",
              }}
              viewBox="0 0 360 640"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="g1">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="g2">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle
                cx="340"
                cy="60"
                r="100"
                fill="none"
                stroke={color}
                strokeWidth="1.2"
                opacity="0.65"
                filter="url(#g1)"
              />
              <circle
                cx="340"
                cy="60"
                r="145"
                fill="none"
                stroke={color}
                strokeWidth="0.8"
                opacity="0.35"
                filter="url(#g1)"
              />
              <circle
                cx="340"
                cy="60"
                r="190"
                fill="none"
                stroke={color}
                strokeWidth="0.5"
                opacity="0.2"
                filter="url(#g2)"
              />
              <circle
                cx="20"
                cy="590"
                r="120"
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity="0.35"
                filter="url(#g1)"
              />
              <circle
                cx="20"
                cy="590"
                r="165"
                fill="none"
                stroke={color}
                strokeWidth="0.6"
                opacity="0.18"
                filter="url(#g2)"
              />
              <line
                x1="0"
                y1="330"
                x2="360"
                y2="330"
                stroke={color}
                strokeWidth="0.5"
                opacity="0.1"
              />
            </svg>

            {/* TOP — accent bar + user info */}
            <div
              style={{
                position: "absolute",
                top: 32,
                left: 32,
                right: 32,
                border: "none",
                outline: "none",
              }}
            >
              {/* Accent bar */}
              <div
                style={{
                  width: 36,
                  height: 2,
                  backgroundColor: color,
                  borderRadius: 2,
                  marginBottom: 24,
                  boxShadow: `0 0 8px ${color}, 0 0 18px ${colorFaint}`,
                  border: "none",
                  outline: "none",
                }}
              />

              {/* Achievement label */}
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  color,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  margin: "0 0 16px",
                  opacity: 0.85,
                  border: "none",
                  outline: "none",
                }}
              >
                Achievement Unlocked
              </p>

              {/* User info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  border: "none",
                  outline: "none",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    overflow: "hidden",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    outline: "none",
                  }}
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name || "user"}
                      width={220}
                      height={220}
                      crossOrigin="anonymous"
                      style={{
                        objectFit: "contain",
                        border: "none",
                        outline: "none",
                        filter: `drop-shadow(0 0 16px ${colorFaint}) drop-shadow(0 0 40px ${colorFainter})`,
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: "sans-serif",
                        fontSize: 18,
                        fontWeight: 500,
                        color: "#737373",
                      }}
                    >
                      {user.name?.charAt(0) ?? "U"}
                    </span>
                  )}
                </div>

                {/* Name + username */}
                <div style={{ minWidth: 0, border: "none", outline: "none" }}>
                  <p
                    style={{
                      fontFamily: "sans-serif",
                      fontSize: 17,
                      fontWeight: 600,
                      color: "#e5e5e5",
                      margin: "0 0 3px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      border: "none",
                      outline: "none",
                    }}
                  >
                    {user.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "monospace",
                      fontSize: 13,
                      color: "#a1a1aa",
                      margin: 0,
                      border: "none",
                      outline: "none",
                    }}
                  >
                    @{user.user_name}
                  </p>
                </div>
              </div>
            </div>

            {/* MIDDLE — Badge image(s) */}
            <div
              style={{
                position: "absolute",
                top: 230,
                left: 0,
                right: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                border: "none",
                outline: "none",
              }}
            >
              {/* Badge image(s) */}
              {badge.extraBadge ? (
                // Two badges side by side
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    border: "none",
                    outline: "none",
                  }}
                >
                  {[
                    {
                      image: badge.image,
                      color: badge.color,
                      title: badge.title,
                    },
                    {
                      image: badge.extraBadge.image,
                      color: badge.extraBadge.color,
                      title: badge.extraBadge.title,
                    },
                  ].map((b) => (
                    <div
                      key={b.title}
                      style={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        border: "none",
                        outline: "none",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          width: 120,
                          height: 120,
                          borderRadius: "50%",
                          backgroundColor: b.color,
                          opacity: 0.1,
                          filter: "blur(30px)",
                          border: "none",
                          outline: "none",
                        }}
                      />
                      <Image
                        src={b.image}
                        alt={b.title}
                        width={150}
                        height={150}
                        crossOrigin="anonymous"
                        style={{
                          objectFit: "contain",
                          border: "none",
                          outline: "none",
                          filter: `drop-shadow(0 0 12px ${b.color}60) drop-shadow(0 0 28px ${b.color}30)`,
                        }}
                      />
                      {/* Title label under each badge */}
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 11,
                          color: b.color,
                          letterSpacing: "0.05em",
                          textAlign: "center",
                          opacity: 0.9,
                          border: "none",
                        }}
                      >
                        {b.title}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                // Single badge
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    outline: "none",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      width: 180,
                      height: 180,
                      borderRadius: "50%",
                      backgroundColor: color,
                      opacity: 0.1,
                      filter: "blur(40px)",
                      border: "none",
                      outline: "none",
                    }}
                  />
                  <Image
                    src={badge.image}
                    alt={badge.title}
                    width={220}
                    height={220}
                    crossOrigin="anonymous"
                    style={{
                      objectFit: "contain",
                      border: "none",
                      outline: "none",
                      filter: `drop-shadow(0 0 16px ${colorFaint}) drop-shadow(0 0 40px ${colorFainter})`,
                    }}
                  />
                </div>
              )}

              {/* Period pill */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  border: "none",
                  outline: "none",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    border: "1px solid #2a2a2a",
                    borderRadius: 999,
                    padding: "4px 12px",
                    outline: "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 14,
                      letterSpacing: "0.07em",
                      color: "#737373",
                    }}
                  >
                    {badge.period}
                  </span>
                </div>

                {/* Title badge(s) */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    border: "none",
                    outline: "none",
                  }}
                >
                  {[
                    { title: badge.title, color: badge.color },
                    ...(badge.extraBadge
                      ? [
                          {
                            title: badge.extraBadge.title,
                            color: badge.extraBadge.color,
                          },
                        ]
                      : []),
                  ].map((b) => (
                    <div
                      key={b.title}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        backgroundColor: "#1a1a1a",
                        border: `1px solid ${b.color}18`,
                        borderRadius: 6,
                        padding: "4px 10px",
                        outline: "none",
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: b.color,
                          boxShadow: `0 0 6px ${b.color}`,
                          flexShrink: 0,
                          display: "inline-block",
                          border: "none",
                          outline: "none",
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 12,
                          color: "#a3a3a3",
                        }}
                      >
                        {b.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BOTTOM — platform */}
            <div
              style={{
                position: "absolute",
                bottom: 32,
                left: 32,
                right: 32,
                border: "none",
                outline: "none",
              }}
            >
              <div
                style={{
                  height: 1,
                  backgroundColor: "#1f1f1f",
                  marginBottom: 20,
                  border: "none",
                  outline: "none",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 7,
                  border: "none",
                  outline: "none",
                }}
              >
                <Icons.logo
                  style={{
                    width: 22,
                    height: 22,
                    color: "#a3a3a3",
                    border: "none",
                    outline: "none",
                  }}
                />
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    color: "#a1a1aa",
                    letterSpacing: "0.08em",
                    fontWeight: 500,
                    border: "none",
                  }}
                >
                  LU-CP-Archive
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Download button */}
        <div className="mt-3 flex justify-end px-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
