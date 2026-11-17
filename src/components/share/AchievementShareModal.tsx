"use client";

import React, { useRef, useEffect, useState } from "react";
import { X, Download, Share2, Copy, Check, Trophy, Flame, Zap, Award, Sparkles } from "lucide-react";

export interface AchievementData {
  title: string;
  badgeType: "challenge_win" | "perfect_score" | "mistakes_cleared" | "level_up";
  studentName: string;
  scoreText?: string;
  speedText?: string;
  xpEarned: number;
  streakDays?: number;
  gradeLevel?: string;
  customQuote?: string;
}

interface AchievementShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AchievementData;
}

export function AchievementShareModal({ isOpen, onClose, data }: AchievementShareModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    title,
    badgeType,
    studentName,
    scoreText = "5 / 5",
    speedText = "35 ثانية",
    xpEarned = 40,
    streakDays = 7,
    gradeLevel = "الثانوية العامة",
    customQuote = "التميز ليس صدفة، بل التزام يومي وإصرار لا ينقطع.",
  } = data;

  // Draw the high-res card onto Canvas
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High DPI Canvas dimensions (9:16 aspect ratio: 1080 x 1920)
    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#08101E");
    bgGrad.addColorStop(0.3, "#0F1E36");
    bgGrad.addColorStop(0.7, "#142542");
    bgGrad.addColorStop(1, "#070D18");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Ambient Gold Lighting / Radial Glows
    const radialTop = ctx.createRadialGradient(width / 2, 350, 50, width / 2, 350, 600);
    radialTop.addColorStop(0, "rgba(234, 191, 88, 0.25)");
    radialTop.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = radialTop;
    ctx.fillRect(0, 0, width, height);

    const radialBottom = ctx.createRadialGradient(width / 2, 1600, 50, width / 2, 1600, 700);
    radialBottom.addColorStop(0, "rgba(59, 130, 246, 0.15)");
    radialBottom.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = radialBottom;
    ctx.fillRect(0, 0, width, height);

    // 3. Elegant Outer Border Frame
    ctx.strokeStyle = "rgba(234, 191, 88, 0.4)";
    ctx.lineWidth = 6;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(40, 40, width - 80, height - 80, 48);
      ctx.stroke();

      ctx.strokeStyle = "rgba(234, 191, 88, 0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(56, 56, width - 112, height - 112, 40);
      ctx.stroke();
    }

    // 4. Header: Academy Branding
    ctx.fillStyle = "#EABF58";
    ctx.font = "bold 44px 'Cairo', 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("أكاديمية المحترف • مستر حبيب الرحمن", width / 2, 160);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "600 28px 'Inter', sans-serif";
    ctx.fillText("PROFESSIONAL ACADEMY • ENGLISH EXCELLENCE", width / 2, 215);

    // Divider Line with Diamond
    ctx.strokeStyle = "rgba(234, 191, 88, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 250, 260);
    ctx.lineTo(width / 2 + 250, 260);
    ctx.stroke();

    // 5. Hero Trophy Icon Container
    const iconBoxY = 410;
    ctx.save();
    ctx.shadowColor = "#EABF58";
    ctx.shadowBlur = 30;
    ctx.fillStyle = "#1E293B";
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(width / 2 - 80, iconBoxY - 80, 160, 160, 36);
      ctx.fill();
    }
    ctx.restore();

    ctx.strokeStyle = "#EABF58";
    ctx.lineWidth = 4;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(width / 2 - 80, iconBoxY - 80, 160, 160, 36);
      ctx.stroke();
    }

    // Trophy Emoji / Graphic
    ctx.font = "80px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const badgeEmoji =
      badgeType === "challenge_win"
        ? "🏆"
        : badgeType === "perfect_score"
        ? "🌟"
        : badgeType === "mistakes_cleared"
        ? "🛡️"
        : "👑";
    ctx.fillText(badgeEmoji, width / 2, iconBoxY);
    ctx.textBaseline = "alphabetic";

    // 6. Achievement Title Badge
    ctx.fillStyle = "#EABF58";
    ctx.font = "bold 56px 'Cairo', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(title, width / 2, 590);

    // 7. Student Name Card
    const nameCardY = 660;
    ctx.fillStyle = "rgba(15, 30, 54, 0.8)";
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(140, nameCardY, width - 280, 200, 32);
      ctx.fill();
      ctx.strokeStyle = "rgba(234, 191, 88, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.fillStyle = "#94A3B8";
    ctx.font = "bold 32px 'Cairo', sans-serif";
    ctx.fillText("إنجاز متميز للطالب البطل:", width / 2, nameCardY + 65);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 64px 'Cairo', sans-serif";
    ctx.fillText(studentName || "بطل الأكاديمية", width / 2, nameCardY + 145);

    // 8. 4-Metrics Grid
    const gridY = 920;
    const metrics = [
      { label: "النتيجة والدقة", value: scoreText, icon: "🎯", color: "#10B981" },
      { label: "زمن الإنجاز", value: speedText, icon: "⚡", color: "#38BDF8" },
      { label: "نقاط الخبرة", value: `+${xpEarned} XP`, icon: "💎", color: "#F59E0B" },
      { label: "سلسلة الالتزام", value: `${streakDays} أيام`, icon: "🔥", color: "#EF4444" },
    ];

    const cardWidth = 370;
    const cardHeight = 180;
    const col1X = 140;
    const col2X = width - 140 - cardWidth;

    metrics.forEach((m, idx) => {
      const isCol1 = idx % 2 === 0;
      const row = Math.floor(idx / 2);
      const x = isCol1 ? col1X : col2X;
      const y = gridY + row * (cardHeight + 30);

      // Card Background
      ctx.fillStyle = "rgba(26, 41, 66, 0.7)";
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x, y, cardWidth, cardHeight, 24);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Icon & Value
      ctx.fillStyle = m.color;
      ctx.font = "bold 46px 'Cairo', 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${m.icon} ${m.value}`, x + cardWidth / 2, y + 80);

      // Label
      ctx.fillStyle = "#94A3B8";
      ctx.font = "600 28px 'Cairo', sans-serif";
      ctx.fillText(m.label, x + cardWidth / 2, y + 138);
    });

    // 9. Motivational Teacher Quote Box
    const quoteY = 1390;
    ctx.fillStyle = "rgba(234, 191, 88, 0.08)";
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(140, quoteY, width - 280, 200, 28);
      ctx.fill();
      ctx.strokeStyle = "rgba(234, 191, 88, 0.25)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.fillStyle = "#F8FAFC";
    ctx.font = "italic bold 34px 'Cairo', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`"${customQuote}"`, width / 2, quoteY + 90);

    ctx.fillStyle = "#EABF58";
    ctx.font = "bold 28px 'Cairo', sans-serif";
    ctx.fillText("— مستر حبيب الرحمن • خبير لغة إنجليزية", width / 2, quoteY + 155);

    // 10. Footer Call to Action & Security Badge
    ctx.fillStyle = "#64748B";
    ctx.font = "600 28px 'Cairo', sans-serif";
    ctx.fillText("منصة المحترف الرقمية • سجل الآن وتحدى أصدقاءك", width / 2, 1720);

    ctx.fillStyle = "#38BDF8";
    ctx.font = "bold 32px 'Inter', sans-serif";
    ctx.fillText("proacademy.edu.eg", width / 2, 1770);

    // Verification Seal
    ctx.fillStyle = "rgba(234, 191, 88, 0.8)";
    ctx.font = "600 22px 'Cairo', sans-serif";
    ctx.fillText("✓ بطاقة معتمدة رسمياً ومسجلة في لوحة الشرف", width / 2, 1830);
  }, [isOpen, title, badgeType, studentName, scoreText, speedText, xpEarned, streakDays, gradeLevel, customQuote]);

  if (!isOpen) return null;

  // Handle Download PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsGenerating(true);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `pro-academy-achievement-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Canvas export error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle WhatsApp Share
  const shareMessage = `🔥 حققت إنجازاً جديداً في أكاديمية المحترف لمستر حبيب الرحمن!
🏆 ${title}
👤 الطالب: ${studentName}
🎯 النتيجة: ${scoreText}
⚡ السرعة: ${speedText}
💎 نقاط الخبرة: +${xpEarned} XP
سجل الآن وتحداني على المنصة:
${typeof window !== "undefined" ? window.location.origin : "https://proacademy.edu.eg"}/dashboard/challenge`;

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank");
  };

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-[#0E1E38] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0B1528]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">بطاقة الإنجاز والتميز</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Visual Preview */}
        <div className="p-4 flex flex-col items-center bg-slate-950/40">
          <div className="w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl border border-amber-400/20 bg-[#08101E]">
            <canvas
              ref={canvasRef}
              className="w-full h-auto block"
              style={{ maxHeight: "420px", objectFit: "contain" }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            بطاقة مصممة بمقاس 9:16 بجودة عالية لمشاركتها على حالة واتساب وقصص إنستجرام
          </p>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-[#0B1528] border-t border-slate-800 flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4 stroke-[2.5px]" />
              <span>تحميل الصورة PNG</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4 stroke-[2.5px]" />
              <span>حالة واتساب</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">تم نسخ رسالة التحدي بنجاح!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>نسخ نص الإنجاز ورابط التحدي</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AchievementShareModal;
