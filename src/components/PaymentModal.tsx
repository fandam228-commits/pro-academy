"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PLATFORM_CONFIG, buildWhatsAppLink } from "@/config/platform";
import { CreditCard, Smartphone, ShieldCheck, KeyRound, Check, X, QrCode, Building2, Upload, MessageCircle } from "lucide-react";

interface PaymentModalProps {
  courseId: string;
  courseTitle: string;
  price: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  courseId,
  courseTitle,
  price,
  onClose,
  onSuccess,
}) => {
  const { user, lang } = useApp();
  const [method, setMethod] = useState<"vodafone_cash" | "instapay" | "fawry" | "stripe" | "code">("vodafone_cash");
  const [activationCode, setActivationCode] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [senderPhone, setSenderPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);

    try {
      if (method === "code") {
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "redeem_code",
            studentId: user?.id || "usr_student_1",
            code: activationCode,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setMessage({ type: "success", text: data.message });
          setTimeout(() => {
            onSuccess();
          }, 1500);
        } else {
          setMessage({ type: "error", text: data.error || "Failed to redeem code" });
        }
      } else {
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "submit_payment",
            studentId: user?.id || "usr_student_1",
            studentName: user?.name || "Student",
            courseId,
            amount: price,
            method,
            transactionId: transactionId || `TXN-${Date.now()}`,
            senderNumber: senderPhone,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setMessage({ type: "success", text: data.message });
          setTimeout(() => {
            onSuccess();
          }, 1500);
        } else {
          setMessage({ type: "error", text: data.error || "Payment failed" });
        }
      }
    } catch (e) {
      setMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:left-4 rtl:right-auto p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="mb-6">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            {lang === "ar" ? "تفعيل الكورس والاشتراك" : "Course Enrollment & Activation"}
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">{courseTitle}</h3>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">{price} EGP</p>
        </div>

        {/* PAYMENT METHOD SELECTOR */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            onClick={() => setMethod("vodafone_cash")}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 text-xs font-bold ${
              method === "vodafone_cash"
                ? "bg-red-50 dark:bg-red-950/60 border-red-500 text-red-600 dark:text-red-400 shadow-md"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            <Smartphone className="w-5 h-5 text-red-500" />
            <span>Vodafone Cash</span>
          </button>

          <button
            onClick={() => setMethod("instapay")}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 text-xs font-bold ${
              method === "instapay"
                ? "bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-600 dark:text-purple-400 shadow-md"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            <Building2 className="w-5 h-5 text-purple-500" />
            <span>InstaPay</span>
          </button>

          <button
            onClick={() => setMethod("code")}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 text-xs font-bold ${
              method === "code"
                ? "bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-600 dark:text-amber-400 shadow-md"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            <KeyRound className="w-5 h-5 text-amber-500" />
            <span>{lang === "ar" ? "كود التفعيل" : "Activation Code"}</span>
          </button>
        </div>

        {/* METHOD DETAILS & FORM */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6">
          {method === "vodafone_cash" && (
            <div className="space-y-3">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                <p>📌 {lang === "ar" ? "قم بتحويل المبلغ إلى رقم فودافون كاش التالي:" : "Transfer amount to Vodafone Cash:"}</p>
                <p className="text-base font-black text-red-600 dark:text-red-400 font-mono mt-1 tracking-wider">
                  {PLATFORM_CONFIG.vodafoneCashDisplay}
                </p>
                <a
                  href={buildWhatsAppLink(
                    lang === "ar"
                      ? `مرحباً، قمت بتحويل مبلغ ${price} جنيه عبر فودافون كاش على رقم ${PLATFORM_CONFIG.vodafoneCashNumber} لاشتراك كورس: ${courseTitle}. أرسل الآن صورة إثبات التحويل.`
                      : `Hello, I transferred ${price} EGP via Vodafone Cash to ${PLATFORM_CONFIG.vodafoneCashNumber} for course: ${courseTitle}. Sending proof screenshot now.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "أرسل إثبات التحويل عبر واتساب" : "Send payment proof via WhatsApp"}</span>
                </a>
              </div>
              <input
                type="text"
                placeholder={lang === "ar" ? "رقم الهاتف المحول منه..." : "Sender Phone Number..."}
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              />
              <input
                type="text"
                placeholder={lang === "ar" ? "رقم عملية التحويل (المرجع)..." : "Transaction Ref ID..."}
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          )}

          {method === "instapay" && (
            <div className="space-y-3">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                <p>📌 {lang === "ar" ? "معرف انستا باي الحساب:" : "InstaPay IPA Handle:"}</p>
                <p className="text-base font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
                  {PLATFORM_CONFIG.instapayHandle}
                </p>
                <a
                  href={buildWhatsAppLink(
                    lang === "ar"
                      ? `مرحباً، قمت بالدفع عبر انستاباي (${PLATFORM_CONFIG.instapayHandle}) لاشتراك كورس: ${courseTitle}. أرسل الآن صورة إثبات الدفع.`
                      : `Hello, I paid via InstaPay (${PLATFORM_CONFIG.instapayHandle}) for course: ${courseTitle}.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "أرسل إثبات الدفع عبر واتساب" : "Send payment proof via WhatsApp"}</span>
                </a>
              </div>
              <input
                type="text"
                placeholder={lang === "ar" ? "رقم العملية أو اسم محول انستاباي..." : "InstaPay Ref ID / Sender Name..."}
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          )}

          {method === "code" && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                🔑 {lang === "ar" ? "أدخل كود التفعيل المطبوع أو المشترى من السنتر:" : "Enter your activation card code:"}
              </p>
              <input
                type="text"
                placeholder="HABIB-3SEC-2025-VIP1"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value)}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-mono font-bold text-center tracking-wider text-slate-900 dark:text-slate-100 focus:border-amber-500 uppercase"
              />
            </div>
          )}
        </div>

        {/* FEEDBACK MESSAGES */}
        {message && (
          <div
            className={`p-3 rounded-xl text-xs font-bold mb-4 ${
              message.type === "success"
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300"
                : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* ACTION BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 transition-all disabled:opacity-50"
        >
          {loading
            ? (lang === "ar" ? "جاري المعالجة والتفعيل..." : "Processing...")
            : method === "code"
            ? (lang === "ar" ? "تفعيل الكود الآن" : "Redeem Activation Code")
            : (lang === "ar" ? "تأكيد وإرسال طلب الدفع" : "Submit Payment Request")}
        </button>
      </div>
    </div>
  );
};
