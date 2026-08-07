"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Award, QrCode, CheckCircle, ShieldCheck, Printer, Download } from "lucide-react";

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  certificateCode: string;
  issueDate: string;
  qrCodeData: string;
}

export const CertificateView: React.FC<CertificateProps> = ({
  studentName,
  courseTitle,
  certificateCode,
  issueDate,
  qrCodeData,
}) => {
  const { lang } = useApp();

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 p-4">
      <div className="bg-gradient-to-br from-amber-500/10 via-blue-500/10 to-indigo-500/10 p-2 rounded-3xl shadow-2xl">
        <div className="bg-white dark:bg-slate-900 border-8 border-double border-amber-500/40 rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
          
          {/* BACKGROUND DECORATIVE BADGE */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* TOP LOGO & HEADER */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg">
              <Award className="w-7 h-7" />
            </div>
            <div className="text-start">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Professional Academy
              </h1>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Mr. Habib El Rahman English Platform
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-400 tracking-widest uppercase block mb-3">
            {lang === "ar" ? "شهادة إتمام كورس تعليمي رسمية" : "Official Certificate of Excellence"}
          </span>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-6 font-serif">
            {lang === "ar" ? "شهادة تفوق وتقدير" : "Certificate of Completion"}
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
            {lang === "ar" ? "تمنح هذه الشهادة المعتمدة للطالب المتميز:" : "This official certificate is proudly awarded to:"}
          </p>

          <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 border-b-2 border-blue-600/30 inline-block pb-1 px-8 mb-6">
            {studentName}
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto mb-8 leading-relaxed">
            {lang === "ar"
              ? `لاكتماك كافة الوحدات الدراسية والاختبارات التقييمية بنجاح واقتدار في كورس:`
              : "for successfully completing all curriculum units, video lectures, and final assessment exams in:"}
          </p>

          <div className="text-lg font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-xl mx-auto mb-8">
            {courseTitle}
          </div>

          {/* FOOTER QR CODE & SIGNATURES */}
          <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
            
            {/* SIGNATURE */}
            <div className="text-start">
              <span className="text-slate-400 block mb-1">{lang === "ar" ? "المشرف العام والمعلم:" : "Course Instructor:"}</span>
              <span className="text-base font-black text-slate-900 dark:text-white">Mr. Habib El Rahman</span>
            </div>

            {/* QR CODE VERIFICATION */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-white p-1 rounded-xl shadow border border-slate-200 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-slate-900" />
              </div>
              <div className="text-start">
                <span className="text-[10px] text-slate-400 font-mono block">Code: {certificateCode}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified QR</span>
                </span>
              </div>
            </div>

            <div className="text-end">
              <span className="text-slate-400 block mb-1">{lang === "ar" ? "تاريخ الإصدار:" : "Issue Date:"}</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{issueDate}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-2xl font-bold text-xs shadow-lg transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>{lang === "ar" ? "طباعة الشهادة الرسمية" : "Print Official Certificate"}</span>
        </button>
      </div>
    </div>
  );
};
