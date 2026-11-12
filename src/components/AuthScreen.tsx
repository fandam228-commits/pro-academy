"use client";

import React, { useState } from "react";
import { useApp, Role } from "@/context/AppContext";
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  LogIn,
  UserPlus,
  Sparkles,
  BookOpen,
  Users,
  AlertTriangle,
  Phone,
  Loader2,
  KeyRound,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export const AuthScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { lang, login, register, authLoading, authError, clearAuthError } = useApp();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regRole, setRegRole] = useState<"student" | "parent">("student");
  const [regStage, setRegStage] = useState("Secondary");
  const [regGrade, setRegGrade] = useState("Third Secondary (Baccalaureate)");
  const [regPhone, setRegPhone] = useState("");
  const [regParentPhone, setRegParentPhone] = useState("");
  const [localError, setLocalError] = useState("");

  const passwordStrength = (p: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 2) return { score, label: lang === "ar" ? "ضعيفة" : "Weak", color: "bg-red-500" };
    if (score <= 3) return { score, label: lang === "ar" ? "متوسطة" : "Medium", color: "bg-amber-500" };
    return { score, label: lang === "ar" ? "قوية" : "Strong", color: "bg-emerald-500" };
  };

  const handleLogin = async () => {
    setLocalError("");
    if (!email || !password) {
      setLocalError(lang === "ar" ? "أدخل البريد الإلكتروني وكلمة المرور" : "Enter email & password");
      return;
    }
    await login(email, password);
  };

  const handleRegister = async () => {
    setLocalError("");
    if (!regName || !regEmail || !regPassword) {
      setLocalError(lang === "ar" ? "أكمل كل الحقول المطلوبة" : "Complete all required fields");
      return;
    }
    if (regPassword !== regConfirm) {
      setLocalError(lang === "ar" ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
      return;
    }
    if (regPassword.length < 8) {
      setLocalError(lang === "ar" ? "كلمة المرور يجب ألا تقل عن 8 أحرف" : "Password must be at least 8 characters");
      return;
    }
    await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      stage: regStage,
      grade: regGrade,
      phone: regPhone,
      parentPhone: regParentPhone,
    });
  };

  const strength = passwordStrength(regPassword);
  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* BACKGROUND ACCENTS */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8F3FF] rounded-full blur-3xl pointer-events-none opacity-60" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl pointer-events-none opacity-40" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl overflow-hidden shadow-xl border border-blue-100">
        
        {/* LEFT BRANDING PANEL */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#1D4ED8] p-8 sm:p-10 text-white">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-md">
                <GraduationCap className="w-7 h-7 text-[#EABF58]" />
              </div>
              <div>
                <h1 className="text-xl font-black">Professional Academy</h1>
                <p className="text-xs text-blue-100 font-bold">Mr. Habib El Rahman</p>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold text-blue-100">
                {lang === "ar" ? "العام الدراسي 2026/2027" : "Academic Year 2026/2027"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black leading-snug">
                {lang === "ar"
                  ? "بوابتك الرسمية للتميز والتفوق في اللغة الإنجليزية"
                  : "Your Gateway to Top English Performance"}
              </h2>
              <p className="text-xs text-blue-100 leading-relaxed">
                {lang === "ar"
                  ? "حسابك يمنحك وصولاً مباشراً لكافة المناهج الدراسية، وبنك الأسئلة الذكي، وأكاديمية الترجمة، وعالم القصص الأدبي."
                  : "One unified account gives you full access to video lessons, smart shuffle exams, translation academy, and literary stories."}
              </p>
            </div>
          </div>

          <div className="py-6 space-y-3 text-xs text-blue-100 font-semibold border-t border-white/15 mt-6">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#EABF58] shrink-0" />
              <span>{lang === "ar" ? "تشفير فائق الأمان لكلمات المرور (scrypt)" : "scrypt password hashing"}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{lang === "ar" ? "حماية متقدمة للجلسات وحظر الهجمات" : "Brute-force protection & session tokens"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#EABF58] shrink-0" />
              <span>{lang === "ar" ? "متابعة مستمرة لنتائجك وتقدمك اليومي" : "Continuous progress tracking"}</span>
            </div>
          </div>

          <p className="text-[11px] text-blue-200/80 font-mono">
            © 2026/2027 Professional Academy — All Rights Reserved
          </p>
        </div>

        {/* RIGHT AUTH CARD */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-10 relative flex flex-col justify-center">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-4 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8F3FF] hover:bg-blue-100 transition-all cursor-pointer self-start"
            >
              <span>←</span>
              <span>{lang === "ar" ? "العودة للرئيسية" : "Back to Home"}</span>
            </button>
          )}

          {/* MOBILE LOGO */}
          <div className="lg:hidden flex items-center gap-3 mb-6 justify-center">
            <div className="w-10 h-10 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-black text-[#243247]">Professional Academy</h1>
              <p className="text-[10px] text-[#718096] font-bold">Mr. Habib El Rahman</p>
            </div>
          </div>

          {/* MODE TABS */}
          <div className="flex bg-[#F7F9FC] p-1.5 rounded-2xl mb-6 border border-slate-200">
            <button
              onClick={() => {
                setMode("login");
                clearAuthError();
                setLocalError("");
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === "login"
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-600/20"
                  : "text-[#718096] hover:text-[#243247]"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>{lang === "ar" ? "تسجيل الدخول" : "Sign In"}</span>
            </button>
            <button
              onClick={() => {
                setMode("register");
                clearAuthError();
                setLocalError("");
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === "register"
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-600/20"
                  : "text-[#718096] hover:text-[#243247]"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{lang === "ar" ? "إنشاء حساب جديد" : "Create Account"}</span>
            </button>
          </div>

          {/* ERROR BANNER */}
          {displayError && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          {mode === "login" ? (
            /* ============= LOGIN FORM ============= */
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-[#243247] block mb-1.5">
                  {lang === "ar" ? "اسم المستخدم أو البريد الإلكتروني" : "Username or Email"}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 rtl:right-3.5 rtl:left-auto top-3.5 text-[#718096]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder={lang === "ar" ? "البريد الإلكتروني أو اسم المستخدم" : "Email or Username"}
                    className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-3 rounded-2xl bg-[#F7F9FC] border border-slate-200 text-xs font-semibold text-[#243247] placeholder:text-[#718096] focus:outline-none focus:border-[#2563EB] focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#243247] block mb-1.5">
                  {lang === "ar" ? "كلمة المرور" : "Password"}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 rtl:right-3.5 rtl:left-auto top-3.5 text-[#718096]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="••••••••••"
                    className="w-full pl-10 rtl:pr-10 rtl:pl-12 pr-12 py-3 rounded-2xl bg-[#F7F9FC] border border-slate-200 text-xs font-semibold text-[#243247] placeholder:text-[#718096] focus:outline-none focus:border-[#2563EB] focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 rtl:left-3.5 rtl:right-auto top-3.5 text-[#718096] hover:text-[#243247]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={authLoading}
                className="w-full py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-sm shadow-md shadow-blue-600/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === "ar" ? "جاري التحقق الآمن..." : "Verifying securely..."}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{lang === "ar" ? "دخول آمن إلى المنصة" : "Secure Sign In"}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* ============= REGISTER FORM ============= */
            <div className="space-y-3.5 max-h-[62vh] overflow-y-auto pr-1">
              <div>
                <label className="text-[11px] font-bold text-[#243247] block mb-1.5">{lang === "ar" ? "الاسم الكامل" : "Full Name"}</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 rtl:right-3.5 rtl:left-auto top-3.5 text-[#718096]" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={lang === "ar" ? "مثال: أحمد محمد علي" : "Full name..."}
                    className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-3 rounded-2xl bg-[#F7F9FC] border border-slate-200 text-xs font-semibold text-[#243247] placeholder:text-[#718096] focus:outline-none focus:border-[#2563EB] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#243247] block mb-1.5">{lang === "ar" ? "البريد الإلكتروني" : "Email"}</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 rtl:right-3.5 rtl:left-auto top-3.5 text-[#718096]" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-3 rounded-2xl bg-[#F7F9FC] border border-slate-200 text-xs font-semibold text-[#243247] placeholder:text-[#718096] focus:outline-none focus:border-[#2563EB] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#243247] block mb-1.5">{lang === "ar" ? "كلمة المرور" : "Password"}</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="min 8 chars"
                    className="w-full px-3 py-3 rounded-2xl bg-[#F7F9FC] border border-slate-200 text-xs font-semibold text-[#243247] placeholder:text-[#718096] focus:outline-none focus:border-[#2563EB] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#243247] block mb-1.5">{lang === "ar" ? "تأكيد كلمة المرور" : "Confirm"}</label>
                  <input
                    type="password"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="repeat"
                    className="w-full px-3 py-3 rounded-2xl bg-[#F7F9FC] border border-slate-200 text-xs font-semibold text-[#243247] placeholder:text-[#718096] focus:outline-none focus:border-[#2563EB] focus:bg-white"
                  />
                </div>
              </div>

              {/* PASSWORD STRENGTH */}
              {regPassword.length > 0 && (
                <div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength.score ? strength.color : "bg-slate-200"}`} />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-[#718096] mt-1">
                    {lang === "ar" ? "قوة كلمة المرور:" : "Password strength:"} <span className="text-[#243247]">{strength.label}</span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#243247] block mb-1.5">{lang === "ar" ? "نوع الحساب" : "Account Type"}</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full p-3 rounded-2xl bg-[#F7F9FC] border border-slate-200 text-xs font-bold text-[#243247]"
                  >
                    <option value="student">{lang === "ar" ? "طالب" : "Student"}</option>
                    <option value="parent">{lang === "ar" ? "ولي أمر" : "Parent"}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#243247] block mb-1.5">{lang === "ar" ? "المرحلة" : "Stage"}</label>
                  <select
                    value={regStage}
                    onChange={(e) => setRegStage(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#F7F9FC] border border-slate-200 text-xs font-bold text-[#243247]"
                  >
                    <option value="Secondary">Secondary (ثانوي)</option>
                    <option value="Preparatory">Preparatory (إعدادي)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#243247] block mb-1.5">{lang === "ar" ? "الصف الدراسي" : "Grade"}</label>
                <select
                  value={regGrade}
                  onChange={(e) => setRegGrade(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-[#F7F9FC] border border-slate-200 text-xs font-bold text-[#243247]"
                >
                  <option value="Third Secondary (Baccalaureate)">Third Secondary (Baccalaureate)</option>
                  <option value="Second Secondary">Second Secondary</option>
                  <option value="First Secondary">First Secondary</option>
                  <option value="Third Prep">Third Prep</option>
                  <option value="Second Prep">Second Prep</option>
                  <option value="First Prep">First Prep</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#243247] block mb-1.5">{lang === "ar" ? "رقم هاتف الطالب" : "Phone"}</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3.5 rtl:right-3.5 rtl:left-auto top-3.5 text-[#718096]" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      className="w-full pl-9 rtl:pr-9 rtl:pl-3 pr-3 py-3 rounded-2xl bg-[#F7F9FC] border border-slate-200 text-xs font-semibold text-[#243247] placeholder:text-[#718096]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#243247] block mb-1.5">{lang === "ar" ? "رقم ولي الأمر" : "Parent Phone"}</label>
                  <input
                    type="tel"
                    value={regParentPhone}
                    onChange={(e) => setRegParentPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className="w-full px-3 py-3 rounded-2xl bg-[#F7F9FC] border border-slate-200 text-xs font-semibold text-[#243247] placeholder:text-[#718096]"
                  />
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={authLoading}
                className="w-full py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-sm shadow-md shadow-blue-600/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === "ar" ? "جاري إنشاء الحساب المشفر..." : "Creating secure account..."}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{lang === "ar" ? "إنشاء حساب آمن وتسجيل الدخول" : "Create Account & Sign In"}</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-[#718096] flex items-center gap-1.5 justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{lang === "ar" ? "كلمة مرورك مشفرة ولا يمكن استرجاعها كنص واضح أبداً" : "Your password is encrypted and securely protected"}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
