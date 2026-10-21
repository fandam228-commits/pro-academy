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
} from "lucide-react";

export const AuthScreen: React.FC<{ onBack?: () => void; initialMode?: "login" | "register" }> = ({ onBack, initialMode = "login" }) => {
  const { lang, login, register, authLoading, authError, clearAuthError } = useApp();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
      {onBack && <button type="button" onClick={onBack} className="absolute top-4 left-4 z-20 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur hover:bg-white/20">{lang === "ar" ? "العودة للواجهة الرئيسية" : "Back to home"}</button>}
      {/* DECORATIVE GLOW CIRCLES */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        
        {/* LEFT BRANDING PANEL */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 p-10 text-white">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-3xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-black">Professional Academy</h1>
              <p className="text-xs text-blue-200 font-bold">Mr. Habib El Rahman</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-black leading-snug">
              {lang === "ar"
                ? "منصة تعليمية آمنة ومحمية بالكامل لطلاب الثانوية والإعدادية"
                : "A fully secure learning platform for Secondary & Prep students"}
            </h2>
            <ul className="space-y-3 text-sm text-blue-100 font-medium">
              <li className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>{lang === "ar" ? "كلمات مرور مشفرة بخوارزمية scrypt" : "scrypt-hashed passwords"}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{lang === "ar" ? "جلسات حقيقية بتوكن آمن وتاريخ انتهاء" : "Real session tokens with expiry"}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-sky-300 shrink-0" />
                <span>{lang === "ar" ? "حماية من محاولات التخمين + صلاحيات بالأدوار" : "Brute-force lockout + role-based permissions"}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />
                <span>{lang === "ar" ? "بنك أسئلة ذكي ومولد امتحانات ومساعد AI" : "Smart question bank, exam generator & AI tutor"}</span>
              </li>
            </ul>
          </div>

          <p className="text-[11px] text-blue-300/70 font-mono">
            © 2025 Professional Academy — Secure Learning Environment
          </p>
        </div>

        {/* RIGHT AUTH CARD */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-6 sm:p-10">
          {/* MOBILE LOGO */}
          <div className="lg:hidden flex items-center gap-3 mb-6 text-white justify-center">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-black">Professional Academy</h1>
          </div>

          {/* MODE TABS */}
          <div className="flex bg-slate-800/70 p-1 rounded-2xl mb-6 border border-slate-700">
            <button
              onClick={() => {
                setMode("login");
                clearAuthError();
                setLocalError("");
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                mode === "login" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400"
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
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                mode === "register" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{lang === "ar" ? "إنشاء حساب جديد" : "Create Account"}</span>
            </button>
          </div>

          {/* ERROR BANNER */}
          {displayError && (
            <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          {mode === "login" ? (
            /* ============= LOGIN FORM ============= */
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                  {lang === "ar" ? "اسم المستخدم أو البريد الإلكتروني" : "Username or Email"}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-3.5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="habibadmin أو email@example.com"
                    className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                  {lang === "ar" ? "كلمة المرور" : "Password"}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-3.5 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="••••••••••"
                    className="w-full pl-10 rtl:pr-10 rtl:pl-12 pr-12 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 rtl:left-3 rtl:right-auto top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={authLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">{lang === "ar" ? "الاسم الكامل" : "Full Name"}</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={lang === "ar" ? "مثال: أحمد محمد علي" : "Full name..."}
                    className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">{lang === "ar" ? "البريد الإلكتروني" : "Email"}</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-3.5 text-slate-500" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">{lang === "ar" ? "كلمة المرور" : "Password"}</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="min 8 chars"
                    className="w-full px-3 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">{lang === "ar" ? "تأكيد كلمة المرور" : "Confirm"}</label>
                  <input
                    type="password"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="repeat"
                    className="w-full px-3 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* PASSWORD STRENGTH */}
              {regPassword.length > 0 && (
                <div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength.score ? strength.color : "bg-slate-700"}`} />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">
                    {lang === "ar" ? "قوة كلمة المرور:" : "Password strength:"} <span className="text-white">{strength.label}</span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">{lang === "ar" ? "نوع الحساب" : "Account Type"}</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-white"
                  >
                    <option value="student">{lang === "ar" ? "طالب" : "Student"}</option>
                    <option value="parent">{lang === "ar" ? "ولي أمر" : "Parent"}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">{lang === "ar" ? "المرحلة" : "Stage"}</label>
                  <select
                    value={regStage}
                    onChange={(e) => setRegStage(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-white"
                  >
                    <option value="Secondary">Secondary (ثانوي)</option>
                    <option value="Preparatory">Preparatory (إعدادي)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">{lang === "ar" ? "الصف الدراسي" : "Grade"}</label>
                <select
                  value={regGrade}
                  onChange={(e) => setRegGrade(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-white"
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
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">{lang === "ar" ? "رقم هاتف الطالب" : "Phone"}</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 rtl:right-3 rtl:left-auto top-3.5 text-slate-500" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      className="w-full pl-9 rtl:pr-9 rtl:pl-3 pr-3 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs font-medium text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">{lang === "ar" ? "رقم ولي الأمر" : "Parent Phone"}</label>
                  <input
                    type="tel"
                    value={regParentPhone}
                    onChange={(e) => setRegParentPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className="w-full px-3 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs font-medium text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={authLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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

              <p className="text-[10px] text-slate-500 flex items-center gap-1.5 justify-center">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>{lang === "ar" ? "كلمة مرورك مشفرة ولا يمكن استرجاعها كنص واضح أبداً" : "Your password is hashed and never stored in plain text"}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
