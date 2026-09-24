"use client";

import React,{useState} from "react";

type Props={
  stage:string; grade:string; curriculum:string; term:string; unit:string; grammarTopic:string;
};

export const GrammarMiniExam:React.FC<Props>=({stage,grade,curriculum,term,unit,grammarTopic})=>{
  const [exam,setExam]=useState<any>(null);
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [result,setResult]=useState<any>(null);
  const [loading,setLoading]=useState(false);

  const generate=async()=>{
    setLoading(true);setResult(null);setAnswers({});
    try{
      const res=await fetch("/api/question-bank",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        action:"generate_smart_exam",stage,grade,curriculum,term,unit,domainCategory:"Grammar",
        grammarTopic,questionCount:10,easyPercent:30,mediumPercent:50,hardPercent:20,grammarRatio:100
      })});
      const json=await res.json();
      if(json.success)setExam(json.exam);
      else setResult({error:json.error||"لم يتم إنشاء الامتحان."});
    }catch{setResult({error:"حدث خطأ أثناء إنشاء الامتحان."});}
    finally{setLoading(false);}
  };

  const submit=async()=>{
    if(!exam)return;
    setLoading(true);
    try{
      const res=await fetch("/api/question-bank",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        action:"submit_exam",examId:exam.id,studentId:undefined,userAnswers:answers
      })});
      const json=await res.json();
      if(json.success){
        setResult(json);
        await fetch("/api/grammar/mastery",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
          stage,grade,curriculum,term,unit,grammarTopic,score:Math.round(json.percentage*exam.totalPoints/100/10),total:10
        })});
      }else setResult({error:json.error||"تعذر تصحيح الامتحان."});
    }catch{setResult({error:"حدث خطأ أثناء التصحيح."});}
    finally{setLoading(false);}
  };

  return <div className="mt-6 rounded-3xl border border-violet-200 bg-violet-50/70 p-5 dark:border-violet-900 dark:bg-violet-950/20">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h3 className="text-base font-black text-slate-900 dark:text-white">🏆 Mini Exam — 10 Questions</h3><p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">امتحان من نفس القاعدة فقط: {grammarTopic}</p></div>
      {!exam&&<button onClick={generate} disabled={loading} className="rounded-xl bg-violet-600 px-5 py-3 text-xs font-black text-white disabled:opacity-50">{loading?"جاري الإنشاء...":"ابدأ الامتحان"}</button>}
    </div>
    {exam&& !result?.percentage && <div className="mt-5 space-y-4">
      {exam.questionsData.map((q:any,i:number)=><div key={q.id} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
        <div className="text-sm font-black text-slate-900 dark:text-white">{i+1}. {q.questionText}</div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">{(q.options||[]).map((opt:string)=><button key={opt} onClick={()=>setAnswers(a=>({...a,[q.id]:opt}))} className={`rounded-xl border px-3 py-2 text-left text-xs font-bold ${answers[q.id]===opt?"border-violet-500 bg-violet-50 dark:bg-violet-950/40":"border-slate-200 dark:border-slate-700"}`}>{opt}</button>)}</div>
      </div>)}
      <button onClick={submit} disabled={loading} className="w-full rounded-xl bg-violet-600 px-5 py-3 text-xs font-black text-white disabled:opacity-50">{loading?"جاري التصحيح...":"تصحيح الـMini Exam"}</button>
    </div>}
    {result?.percentage!==undefined&&<div className="mt-5 rounded-2xl bg-white p-5 text-center shadow-sm dark:bg-slate-900">
      <div className="text-3xl font-black text-violet-600">{result.percentage}%</div>
      <div className="mt-1 text-sm font-black text-slate-800 dark:text-white">{result.passed?"أحسنت! كمل بنفس المستوى 💪":"لسه محتاج مراجعة القاعدة 🔄"}</div>
      <div className="mt-1 text-[10px] font-bold text-slate-500">تم تحديث مستوى إتقان القاعدة.</div>
      <button onClick={()=>{setExam(null);setResult(null);setAnswers({});}} className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-700 dark:border-slate-700 dark:text-slate-200">محاولة جديدة</button>
    </div>}
    {result?.error&&<div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-black text-red-700">{result.error}</div>}
  </div>;
};
