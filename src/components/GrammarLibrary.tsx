"use client";
import React,{useEffect,useMemo,useRef,useState} from "react";
import {BookOpen,CheckCircle2,ChevronRight,ExternalLink,Filter,GraduationCap,PlayCircle,Sparkles,Target,Youtube} from "lucide-react";
import {GRAMMAR_PLAYLIST_ID,GRAMMAR_PLAYLIST_URL,grammarVideos,getMappedGrammarVideos,type GrammarVideo} from "@/data/grammar-videos";
import {currentCurriculumTracks,getCurriculumTrack} from "@/data/current-curriculum";

declare global { interface Window { YT?: any; onYouTubeIframeAPIReady?:()=>void; } }

function YouTubeGrammarPlayer({video}:{video:GrammarVideo}){
  const containerRef=useRef<HTMLDivElement|null>(null); const playerRef=useRef<any>(null); const [ready,setReady]=useState(false);
  useEffect(()=>{let cancelled=false;
    const create=()=>{if(cancelled||!containerRef.current||!window.YT?.Player)return;
      if(playerRef.current){try{playerRef.current.destroy()}catch{}}
      playerRef.current=new window.YT.Player(containerRef.current,{width:"100%",height:"100%",playerVars:{listType:"playlist",list:GRAMMAR_PLAYLIST_ID,index:video.playlistIndex,rel:0,playsinline:1,enablejsapi:1,origin:window.location.origin},events:{onReady:()=>setReady(true)}});
    };
    if(window.YT?.Player) create(); else {
      window.onYouTubeIframeAPIReady=create;
      if(!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')){
        const s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";s.async=true;document.head.appendChild(s);
      }
    }
    return()=>{cancelled=true;if(playerRef.current){try{playerRef.current.destroy()}catch{}playerRef.current=null}};
  },[]);
  useEffect(()=>{if(!ready||!playerRef.current?.loadPlaylist)return;try{playerRef.current.loadPlaylist({listType:"playlist",list:GRAMMAR_PLAYLIST_ID,index:video.playlistIndex,startSeconds:0})}catch{}},[ready,video.playlistIndex]);
  return <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950"><div ref={containerRef} className="absolute inset-0 h-full w-full"/>{!ready&&<div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-white"><div className="text-center"><Youtube className="mx-auto mb-3 h-10 w-10 text-red-500"/><p className="text-sm font-bold">جاري تحميل فيديو الشرح...</p></div></div>}</div>;
}

const filters=[["all","كل الفيديوهات"],["tenses","Tenses"],["structures","Structures"],["connectors","Linking & Connectors"]];

function filterKey(v:GrammarVideo){if(["present-continuous"].includes(v.id))return"tenses";if(["relative-clauses","question-formation","question-tags","passive-voice","negation"].includes(v.id))return"structures";if(["linkers","conditionals","direct-indirect"].includes(v.id))return"connectors";return"all";}

export const GrammarLibrary:React.FC=()=>{
  const [grade,setGrade]=useState("First Secondary");
  const stage=grade.includes("Prep") ? "Preparatory" : "Secondary";
  const [curriculum,setCurriculum]=useState("Ministry");
  const [term,setTerm]=useState("First");
  const [unit,setUnit]=useState("All");
  const [filter,setFilter]=useState("all");
  const [selectedId,setSelectedId]=useState(grammarVideos[0]?.id||"");
  const [requestedTopic,setRequestedTopic]=useState("");

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const qGrade=params.get("grade");
    const qCurriculum=params.get("curriculum");
    const qTerm=params.get("term");
    const qUnit=params.get("unit");
    const qTopic=params.get("grammarTopic");
    if(qGrade)setGrade(qGrade);
    if(qCurriculum)setCurriculum(qCurriculum);
    if(qTerm)setTerm(qTerm);
    if(qUnit)setUnit(qUnit);
    if(qTopic)setRequestedTopic(qTopic);
  },[]);

  const tracksForGrade=useMemo(()=>currentCurriculumTracks.filter(t=>t.stage===stage&&t.grade===grade&&t.term===term),[stage,grade,term]);
  const curriculumOptions=useMemo(()=>Array.from(new Set(tracksForGrade.map(t=>t.curriculum))),[tracksForGrade]);
  useEffect(()=>{if(!curriculumOptions.includes(curriculum))setCurriculum(curriculumOptions[0]||"Ministry")},[curriculumOptions,curriculum]);
  const track=getCurriculumTrack(stage,grade,curriculum,term);
  const unitOptions=track?.units||[];
  useEffect(()=>{if(unit!=="All"&&!unitOptions.some(u=>`Unit ${u.unit}`===unit))setUnit("All")},[unit,unitOptions]);

  const scopedVideos=useMemo(()=>{
    if(unit==="All") return grammarVideos.filter(v=>filter==="all"||filterKey(v)===filter);
    return getMappedGrammarVideos(stage,grade,curriculum,term,unit).filter(v=>filter==="all"||filterKey(v)===filter);
  },[stage,grade,curriculum,term,unit,filter]);

  const selected=useMemo(()=>{
    if(requestedTopic){
      const byTopic=scopedVideos.find(v=>v.mappedScopes?.some(s=>
        s.stage===stage && s.grade===grade && s.curriculum===curriculum && s.term===term && s.unit===unit && s.grammarTopic===requestedTopic
      ));
      if(byTopic)return byTopic;
    }
    const inScope=scopedVideos.find(v=>v.id===selectedId);
    if(inScope)return inScope;
    return scopedVideos[0]||null;
  },[scopedVideos,selectedId,requestedTopic,stage,grade,curriculum,term,unit]);

  const selectedScope=useMemo(()=>{
    if(!selected)return null;
    return selected.mappedScopes?.find(s=>
      s.stage===stage && s.grade===grade && s.curriculum===curriculum && s.term===term && s.unit===unit
    ) || null;
  },[selected,stage,grade,curriculum,term,unit]);

  const practiceUrl=useMemo(()=>{
    const params=new URLSearchParams();
    params.set("tab","question_bank");
    params.set("stage",stage);
    params.set("grade",grade);
    params.set("curriculum",curriculum);
    params.set("term",term);
    if(unit!=="All")params.set("unit",unit);
    params.set("domainCategory","Grammar");
    if(selectedScope?.grammarTopic)params.set("grammarTopic",selectedScope.grammarTopic);
    return `/?${params.toString()}`;
  },[stage,grade,curriculum,term,unit,selectedScope]);

  const [practiceQuestions,setPracticeQuestions]=useState<any[]>([]);
  const [practiceLoading,setPracticeLoading]=useState(false);
  const [practiceAnswers,setPracticeAnswers]=useState<Record<string,string>>({});
  const [practiceSubmitted,setPracticeSubmitted]=useState(false);

  useEffect(()=>{
    let cancelled=false;
    const loadPractice=async()=>{
      if(!selectedScope){setPracticeQuestions([]);return;}
      setPracticeLoading(true); setPracticeSubmitted(false); setPracticeAnswers({}); setPracticeResult(null);
      try{
        const params=new URLSearchParams({
          stage,grade,curriculum,term,unit,
          domainCategory:"Grammar",grammarTopic:selectedScope.grammarTopic,limit:"5"
        });
        const res=await fetch(`/api/question-bank?${params.toString()}`);
        const json=await res.json();
        if(!cancelled)setPracticeQuestions((json.questions||[]).slice(0,5));
      }catch{if(!cancelled)setPracticeQuestions([]);}
      finally{if(!cancelled)setPracticeLoading(false);}
    };
    loadPractice();
    return()=>{cancelled=true};
  },[selectedScope,stage,grade,curriculum,term,unit]);

  const [practiceResult,setPracticeResult]=useState<{score:number,total:number}|null>(null);
  const submitPractice=async()=>{
    try{
      const res=await fetch("/api/question-bank",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({action:"submit_practice",questionIds:practiceQuestions.map(q=>q.id),answers:practiceAnswers})});
      const json=await res.json();
      if(json.success){setPracticeResult({score:json.score,total:json.total});setPracticeSubmitted(true);}
    }catch{}
  };

  const currentUnit=unit!=="All" ? unitOptions.find(u=>`Unit ${u.unit}`===unit) : null;

  return <section className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
    <div className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-6 text-white shadow-2xl sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-blue-100"><Sparkles className="h-4 w-4 text-amber-300"/>Professional Academy • 2026/2027</div><h1 className="text-3xl font-black sm:text-4xl">📚 مكتبة شرح القواعد</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-blue-100 sm:text-base">الترتيب الآن مبني على الصف والمنهج والترم والوحدة. مفيش خلط بين بنك أو منهج وآخر.</p></div><a href={GRAMMAR_PLAYLIST_URL} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-900 shadow-lg"><ExternalLink className="h-4 w-4"/>فتح الـPlaylist</a></div>
    </div>

    <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800 dark:text-white"><Filter className="h-4 w-4 text-blue-600"/>تحديد المنهج الحالي</div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <select value={grade} onChange={e=>{setGrade(e.target.value);setUnit("All")}} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"><option>First Secondary</option><option>Second Secondary</option><option>Third Secondary</option><option>Third Prep</option></select>
        <select value={curriculum} onChange={e=>{setCurriculum(e.target.value);setUnit("All")}} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white">{curriculumOptions.map(c=><option key={c}>{c}</option>)}</select>
        <select value={term} onChange={e=>{setTerm(e.target.value);setUnit("All")}} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"><option>First</option><option>Second</option></select>
        <select value={unit} onChange={e=>setUnit(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"><option value="All">كل الوحدات</option>{unitOptions.map(u=><option key={u.id} value={`Unit ${u.unit}`}>Unit {u.unit} — {u.title}</option>)}</select>
        <div className="rounded-xl bg-blue-50 p-3 text-[11px] font-black text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">{currentUnit?.grammar||currentUnit?.concept||"اختر وحدة لعرض تفاصيلها"}</div>
      </div>
      {track&&<div className="mt-3 flex flex-wrap gap-2">{track.units.map(u=><button key={u.id} onClick={()=>setUnit(`Unit ${u.unit}`)} className={unit===`Unit ${u.unit}`?"rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-black text-white":"rounded-lg bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"}>U{u.unit}</button>)}</div>}
    </div>

    <div className="mb-5 flex flex-wrap items-center gap-2">{filters.map(([key,label])=><button key={key} onClick={()=>setFilter(key)} className={filter===key?"rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white shadow-lg":"rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"}>{label}</button>)}</div>

    {unit!=="All"&&scopedVideos.length===0 ? <div className="rounded-3xl border border-dashed border-amber-300 bg-amber-50 p-8 text-center dark:border-amber-800 dark:bg-amber-950/20"><div className="text-3xl">🎥</div><h2 className="mt-3 text-lg font-black text-slate-900 dark:text-white">الوحدة موجودة في المنهج، لكن فيديو القاعدة لم يُربط بها بعد</h2><p className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-300">وده مقصود عشان ما نعرضش للطالب فيديو من وحدة أو منهج تاني بالغلط.</p><button onClick={()=>setUnit("All")} className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-xs font-black text-white">عرض مكتبة الفيديوهات</button></div> :
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.65fr]">
      <aside className="space-y-3">{scopedVideos.map(v=><button key={v.id} onClick={()=>setSelectedId(v.id)} className={selected?.id===v.id?"w-full rounded-2xl border-2 border-blue-500 bg-blue-50 p-4 text-right shadow-lg dark:bg-blue-950/30":"w-full rounded-2xl border border-slate-200 bg-white p-4 text-right shadow-sm dark:border-slate-800 dark:bg-slate-900"}><div className="flex items-start gap-3"><div className={selected?.id===v.id?"mt-0.5 rounded-xl bg-blue-600 p-2 text-white":"mt-0.5 rounded-xl bg-slate-100 p-2 text-blue-600 dark:bg-slate-800"}><PlayCircle className="h-5 w-5"/></div><div className="min-w-0 flex-1"><div className="text-sm font-black text-slate-900 dark:text-white">{v.titleAr}</div><div className="mt-1 text-[11px] font-bold text-slate-400">{v.titleEn}</div><div className="mt-2 flex gap-1.5"><span className="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-500 dark:bg-slate-800 dark:text-slate-300">{v.duration||"Grammar Video"}</span><span className="rounded-lg bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-700">YouTube</span></div></div><ChevronRight className="mt-1 h-4 w-4 text-slate-400 rtl:rotate-180"/></div></button>)}</aside>
      <main className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">{selected?<><YouTubeGrammarPlayer video={selected}/><div className="p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700"><BookOpen className="h-3.5 w-3.5"/>Grammar Explanation</div><h2 className="text-2xl font-black text-slate-900 dark:text-white">{selected.titleAr}</h2><p className="mt-1 text-sm font-bold text-slate-400">{selected.titleEn}</p></div><div className="rounded-2xl bg-amber-50 px-4 py-3 text-center"><div className="text-[10px] font-black text-amber-700">Professional</div><div className="text-xs font-black text-slate-700">Mr. Habib El Rahman</div></div></div><p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300">{selected.descriptionAr}</p><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60"><GraduationCap className="mb-2 h-5 w-5 text-blue-600"/><div className="text-[10px] font-black text-slate-400">المنهج</div><div className="mt-1 text-xs font-black text-slate-800 dark:text-white">{grade} • {curriculum}</div></div><div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60"><Target className="mb-2 h-5 w-5 text-emerald-600"/><div className="text-[10px] font-black text-slate-400">الوحدة</div><div className="mt-1 text-xs font-black text-slate-800 dark:text-white">{unit}</div></div><div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60"><CheckCircle2 className="mb-2 h-5 w-5 text-amber-600"/><div className="text-[10px] font-black text-slate-400">التالي</div><div className="mt-1 text-xs font-black text-slate-800 dark:text-white">Practice & Question Bank</div></div></div><div className="mt-6 rounded-2xl border border-slate-200 p-5 dark:border-slate-800"><h3 className="text-sm font-black text-slate-900 dark:text-white">🔑 أهم النقاط</h3><ul className="mt-3 grid gap-2 sm:grid-cols-2">{selected.keyPoints.map(p=><li key={p} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle2 className="h-4 w-4 text-emerald-500"/>{p}</li>)}</ul></div><div className="mt-7 rounded-3xl border border-blue-200 bg-blue-50/70 p-5 dark:border-blue-900 dark:bg-blue-950/20">
<h3 className="text-base font-black text-slate-900 dark:text-white">🎯 جرّب القاعدة فورًا</h3>
<p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">5 أسئلة من نفس الصف والمنهج والترم والوحدة والقاعدة فقط.</p>
{practiceLoading?<div className="py-6 text-center text-xs font-bold text-slate-500">جاري تحميل التدريب...</div>:
practiceQuestions.length===0?<div className="py-5 text-center text-xs font-bold text-slate-500">لا توجد أسئلة مرتبطة بهذه القاعدة حتى الآن.</div>:
<div className="mt-4 space-y-4">{practiceQuestions.map((q,i)=><div key={q.id} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
<div className="text-sm font-black text-slate-900 dark:text-white">{i+1}. {q.questionText}</div>
<div className="mt-3 grid gap-2 sm:grid-cols-2">{(q.options||[]).map((opt:string)=><button key={opt} onClick={()=>!practiceSubmitted&&setPracticeAnswers(prev=>({...prev,[q.id]:opt}))} className={`rounded-xl border px-3 py-2 text-left text-xs font-bold transition ${practiceAnswers[q.id]===opt?"border-blue-500 bg-blue-50 dark:bg-blue-950/40":"border-slate-200 dark:border-slate-700"}`}>{opt}</button>)}</div>
{practiceSubmitted&&<div className="mt-3 text-xs font-black text-blue-600">تم التصحيح على الخادم — راجع نتيجتك بالأعلى.</div>}
</div>)}
<div className="flex flex-wrap items-center gap-3 pt-2">
<button onClick={submitPractice} disabled={practiceSubmitted} className="rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white disabled:opacity-50">تصحيح التدريب</button>
{practiceSubmitted&&<span className="text-sm font-black text-slate-700 dark:text-slate-200">النتيجة: {practiceResult?.score ?? 0} / {practiceResult?.total ?? practiceQuestions.length}</span>}
</div></div>}
</div>
<div className="mt-6 flex flex-col gap-3 sm:flex-row"><a href={practiceUrl} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg hover:bg-blue-700"><Target className="h-4 w-4"/>تدريب وأسئلة بنك الأسئلة</a><a href={GRAMMAR_PLAYLIST_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 dark:border-slate-700 dark:text-slate-200"><ExternalLink className="h-4 w-4"/>YouTube Playlist</a></div></div></>:<div className="p-10 text-center font-black text-slate-500">لا يوجد فيديو مربوط بهذا النطاق بعد.</div>}</main>
    </div>}
    <div className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-[11px] font-bold leading-6 text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">📌 مصدر ترتيب الوحدات والقواعد الحالية تم تثبيته داخل المنصة كـCurriculum Map، والفيديوهات لا تظهر داخل وحدة إلا لو كانت مربوطة بها صراحة.</div>
  </div></section>;
};
