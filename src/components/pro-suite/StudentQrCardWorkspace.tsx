"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  QrCode,
  Printer,
  Download,
  ShieldCheck,
  Sparkles,
  User,
  GraduationCap,
  Calendar,
  Smartphone,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

interface StudentQrCardProps {
  onNavigateHome?: () => void;
}

export const StudentQrCardWorkspace: React.FC<StudentQrCardProps> = ({ onNavigateHome }) => {
  const { user } = useApp();
  const [studentData, setStudentData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQr() {
      try {
        setLoading(true);
        const res = await fetch(`/api/center/student-qr?userId=${user?.id || ""}`);
        const data = await res.json();
        if (data.success && data.student) {
          setStudentData(data.student);
        }
      } catch (e) {
        console.error("Load QR error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadQr();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  const downloadQrImage = () => {
    if (!studentData?.qrDataUrl) return;
    const a = document.createElement("a");
    a.href = studentData.qrDataUrl;
    a.download = `pro_student_qr_${studentData.studentCode || "id"}.png`;
    a.click();
  };

  return (
    <div className="max-w-md mx-auto space-y-6 text-slate-800 dark:text-slate-100" dir="rtl">
      {/* 1. HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-[#101b33] to-blue-950 p-6 rounded-3xl text-white border border-blue-500/20 shadow-xl relative overflow-hidden text-center sm:text-right">
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-sm">
              <QrCode className="w-3.5 h-3.5" />
              <span>بطاقة الطالب الذكية • Digital ID Pass</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              بطاقة الحضور والتسليم بالسنتر
            </h2>
            <p className="text-xs text-slate-300">
              أظهر هذا الرمز لمساعد مستر حبيب الرحمن عند مدخل السنتر لتسجيل الحضور وتأكيد الواجب.
            </p>
          </div>

          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 transition border border-white/10 shrink-0"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-0" />
              <span>الرئيسية</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. DIGITAL ID PASS CARD */}
      {loading ? (
        <div className="py-24 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">جاري إنشاء بطاقة الطالب المشفرة...</p>
        </div>
      ) : studentData ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-amber-500/30 shadow-2xl relative overflow-hidden text-center space-y-6">
            {/* TOP BRANDING */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                  PROFESSIONAL ACADEMY
                </span>
                <h3 className="text-sm font-black text-white">منصة مستر حبيب الرحمن للإنجليزية</h3>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-amber-400 text-slate-950 shadow">
                2026 / 2027
              </span>
            </div>

            {/* QR CODE DISPLAY */}
            <div className="bg-white p-4 rounded-3xl w-48 h-48 sm:w-56 sm:h-56 mx-auto shadow-xl flex items-center justify-center border-4 border-amber-400/40">
              {studentData.qrDataUrl ? (
                <img
                  src={studentData.qrDataUrl}
                  alt={`QR Code for ${studentData.studentCode}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <QrCode className="w-24 h-24 text-slate-400" />
              )}
            </div>

            {/* STUDENT CODE & INFO */}
            <div className="space-y-2">
              <div className="inline-block py-1 px-4 rounded-xl bg-slate-800 text-amber-300 font-mono text-base font-black tracking-widest border border-slate-700" dir="ltr">
                {studentData.studentCode}
              </div>
              <h4 className="text-lg font-black text-white">{studentData.name}</h4>
              <p className="text-xs text-slate-400 font-bold">{studentData.grade || "الثانوية العامة"}</p>
            </div>

            {/* FOOTER VERIFICATION BADGE */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>بطاقة ذكية رسمية معتمدة للحضور بالسنتر والامتحانات</span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handlePrint}
              className="py-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>طباعة الكارت (Print)</span>
            </button>

            <button
              onClick={downloadQrImage}
              className="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/25"
            >
              <Download className="w-4 h-4" />
              <span>حفظ الرمز كصورة (PNG)</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
