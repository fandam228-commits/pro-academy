"use client";

import React from "react";
import { ArrowLeft, ArrowRight, BookOpen, Brain, CheckCircle2, GraduationCap, Sparkles, Target, ClipboardCheck, ShieldCheck } from "lucide-react";

type Props = { lang: string; onToggleLang: () => void; onLogin: () => void; onRegister: () => void };

export const PublicLanding: React.FC<Props> = ({ lang, onToggleLang, onLogin, onRegister }) => {
  const ar = lang === "ar";
  return (
    <div dir={ar ? "rtl" : "ltr"} lang={ar ? "ar" : "en"} className="min-h-screen overflow-hidden bg-slate-950 text-white antialiased selection:bg-sky-300 selection:text-slate-950">
      <header className="relative z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-600 shadow-lg shadow-blue-950/50"><GraduationCap className="h-7 w-7 text-white" /></div>
            <div><p className="text-base font-black tracking-tight sm:text-lg">Professional Academy</p><p className="text-xs font-semibold text-sky-200">{ar ? "مستر حبيب الرحمن" : "Mr. Habib El Rahman"}</p></div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={onToggleLang} aria-label={ar ? "Switch to English" : "التبديل إلى العربية"} className="rounded-xl border border-white/20 px-3 py-2 text-xs font-bold text-sky-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">{ar ? "English" : "العربية"}</button>
            <button onClick={onLogin} className="rounded-xl px-3 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:px-4">{ar ? "تسجيل الدخول" : "Log in"}</button>
            <button onClick={onRegister} className="rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 px-4 py-2.5 text-sm font-extrabold shadow-lg shadow-blue-950/40 transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:px-5">{ar ? "إنشاء حساب" : "Create account"}</button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate">
          <div className="absolute inset-0 -z-20 bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950" />
          <div className="absolute inset-0 -z-10 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 18% 22%, #38bdf8 0, transparent 32%), radial-gradient(circle at 82% 35%, #8b5cf6 0, transparent 35%)" }} />
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:px-8 lg:py-20">
            <div className="space-y-6 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/20 bg-white/10 px-4 py-2 text-xs font-bold text-sky-100 backdrop-blur"><Sparkles className="h-4 w-4 text-amber-300" />{ar ? "تعلّم أذكى • تدريب عملي • تقدّم واضح" : "Smarter learning • Practice • Real progress"}</div>
              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">{ar ? <>طوّر مستواك في الإنجليزي مع <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">مستر حبيب الرحمن</span></> : <>Build your English skills with <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">Mr. Habib El Rahman</span></>}</h1>
              <p className="mx-auto max-w-2xl text-base font-medium leading-8 text-blue-100/85 sm:text-lg lg:mx-0">{ar ? "مكان واحد لمراجعة اللغة الإنجليزية والتدريب على الأسئلة واستكشاف أدوات التعلّم المتاحة — مع واجهة بسيطة تقدر تستخدمها من الموبايل أو الكمبيوتر." : "One place to review English, practise questions, and explore available learning tools—with a simple experience on mobile and desktop."}</p>
              <div className="flex flex-wrap justify-center gap-3 pt-2 lg:justify-start">
                <button onClick={onRegister} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-violet-600 px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-950/50 transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">{ar ? "أنشئ حسابك الآن" : "Create your account"}{ar ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}</button>
                <button onClick={onLogin} className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200">{ar ? "عندي حساب بالفعل" : "I already have an account"}</button>
              </div>
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 pt-2 text-xs font-semibold text-blue-100/75 lg:justify-start"><span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" />{ar ? "تسجيل سهل" : "Easy sign-up"}</span><span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" />{ar ? "تدريب تفاعلي" : "Interactive practice"}</span><span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" />{ar ? "واجهة مناسبة للموبايل" : "Mobile-friendly"}</span></div>
            </div>
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-sky-500/30 to-violet-500/30 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur">
                <img src="/images/mr-habib-el-rahman.jpg" alt={ar ? "الأستاذ حبيب الرحمن، مدرس اللغة الإنجليزية" : "Mr. Habib El Rahman, English teacher"} className="h-[420px] w-full rounded-[1.5rem] object-cover object-[center_25%] sm:h-[520px]" />
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-slate-950/80 p-4 shadow-xl backdrop-blur-xl sm:bottom-8 sm:left-8 sm:right-8">
                  <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-400/20 text-sky-200"><BookOpen className="h-6 w-6" /></div><div><p className="font-extrabold">{ar ? "مستر حبيب الرحمن" : "Mr. Habib El Rahman"}</p><p className="mt-1 text-xs text-blue-100/75">{ar ? "مدرّس اللغة الإنجليزية" : "Your English teacher at Professional Academy"}</p></div></div>
                </div>
              </div>
              <div className="absolute -right-2 -top-4 flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/90 px-4 py-3 shadow-xl sm:-right-5"><Sparkles className="h-5 w-5 text-amber-300" /><span className="text-xs font-extrabold">{ar ? "خطوتك الجاية تبدأ هنا" : "Your next step starts here"}</span></div>
            </div>
          </div>
        </section>

        <section className="bg-white py-14 text-slate-900 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-10 max-w-2xl text-center"><p className="text-sm font-extrabold text-blue-600">{ar ? "ماذا ستجد داخل المنصة؟" : "WHAT YOU CAN EXPLORE"}</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">{ar ? "أدوات تساعدك تتعلم بثقة" : "Tools designed to help you learn"}</h2><p className="mt-3 leading-7 text-slate-500">{ar ? "استكشف المزايا المتاحة، وسنضيف الكورسات تباعًا بعد تجهيز محتواها." : "Explore the available learning tools. Courses will appear here once their content is ready."}</p></div>
            <div className="grid gap-5 md:grid-cols-3">
              {[{icon:Brain,title:ar?"بنك الأسئلة":"Question bank",desc:ar?"تدرّب على الأسئلة وصنّف مراجعتك حسب الموضوع.":"Practise questions and focus your revision by topic."},{icon:ClipboardCheck,title:ar?"اختبارات تفاعلية":"Interactive quizzes",desc:ar?"اختبر فهمك وراجع إجاباتك خطوة بخطوة.":"Check your understanding and review your answers."},{icon:Target,title:ar?"تعلّم بهدف واضح":"Focused learning",desc:ar?"نظّم مراجعتك وتابع تقدّمك من خلال حسابك.":"Organize revision and follow progress in your account."}].map((item) => { const Icon = item.icon; return <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100 text-blue-700"><Icon className="h-6 w-6" /></div><h3 className="mt-5 text-lg font-black">{item.title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{item.desc}</p></div>})}
            </div>
          </div>
        </section>


        <section className="bg-white py-14 text-slate-900 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="text-sm font-extrabold text-violet-700">{ar ? "ابدأ في 3 خطوات بسيطة" : "GET STARTED IN 3 SIMPLE STEPS"}</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">{ar ? "طريقك للتعلّم يبدأ بسهولة" : "A simple path to better learning"}</h2>
              <p className="mt-3 leading-7 text-slate-500">{ar ? "صممنا التجربة علشان تبدأ بسهولة وتوصل للأدوات المتاحة من غير تعقيد." : "A clear experience to help you get started and find the learning tools available to you."}</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                { number: "01", title: ar ? "أنشئ حسابك" : "Create your account", desc: ar ? "سجّل بياناتك الأساسية واختر صفك الدراسي." : "Sign up with your basic details and school grade." },
                { number: "02", title: ar ? "استكشف الأدوات" : "Explore the tools", desc: ar ? "افتح الأدوات والملفات المتاحة داخل المنصة." : "Explore the tools and files currently available." },
                { number: "03", title: ar ? "ابدأ التدريب" : "Start practising", desc: ar ? "تدرّب على المحتوى المتاح، وسنضيف الكورسات عند تجهيزها." : "Practise with available content as courses are prepared." }
              ].map((step) => (
                <div key={step.number} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg">
                  <span className="text-4xl font-black tracking-tight text-slate-200">{step.number}</span>
                  <h3 className="mt-4 text-lg font-black">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-14 text-slate-900 sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_.8fr] lg:items-center lg:px-8">
            <div><p className="text-sm font-extrabold text-violet-700">{ar ? "إطلاق مبدئي" : "EARLY ACCESS"}</p><h2 className="mt-3 text-3xl font-black">{ar ? "عرض الإطلاق المقترح" : "PLANNED LAUNCH OFFER"}</h2><p className="mt-3 max-w-2xl leading-7 text-slate-600">{ar ? "نخطط لإتاحة تجربة مجانية لمدة 30 يومًا عند الإطلاق. المدة لم تُفعّل بعد؛ سنعلن عن بدء العرض بعد تجهيز نظام التجربة واختباره. لا توجد رسوم تلقائية ضمن هذه المعاينة." : "We plan to offer a 30-day free trial at launch. It is not active yet; we will announce the offer after trial tracking is implemented and tested. This preview does not initiate any automatic charges."}</p></div>
            <div className="rounded-3xl border border-violet-200 bg-white p-6 shadow-xl shadow-violet-950/5"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><ShieldCheck className="h-6 w-6" /></div><div><p className="text-lg font-black">{ar ? "معاينة قبل التسجيل" : "Preview before you join"}</p><p className="mt-1 text-sm text-slate-500">{ar ? "شاهد الواجهة والمميزات أولًا." : "See the platform and its features first."}</p></div></div><button onClick={onRegister} className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2">{ar ? "إنشاء حساب" : "Create account"}</button></div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950 px-4 py-8 text-center text-sm text-blue-100/70"><p className="font-extrabold text-white">Professional Academy — {ar ? "مستر حبيب الرحمن" : "Mr. Habib El Rahman"}</p><p className="mt-2">{ar ? "Limitless Innovation • تعلّم بلا حدود" : "Limitless Innovation • Learn without limits"}</p></footer>
    </div>
  );
};
