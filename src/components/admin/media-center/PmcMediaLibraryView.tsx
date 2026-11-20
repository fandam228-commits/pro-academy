"use client";

import React, { useEffect, useState } from "react";
import {
  FolderOpen,
  Film,
  Image as ImageIcon,
  Copy,
  Check,
  Upload,
  RefreshCw,
  Clock,
  HardDrive,
  FileVideo,
} from "lucide-react";

interface MediaAsset {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  dimensions?: string;
  durationSeconds?: number;
  sizeBytes?: number;
  createdAt: string;
}

interface PmcMediaLibraryViewProps {
  lang?: "ar" | "en";
}

export const PmcMediaLibraryView: React.FC<PmcMediaLibraryViewProps> = ({
  lang = "ar",
}) => {
  const isAr = lang === "ar";
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchAssets = async () => {
    try {
      const res = await fetch("/api/admin/media-center/media-library");
      if (res.ok) {
        const json = await res.json();
        setAssets(json.assets || []);
      }
    } catch (err) {
      console.warn("Failed to fetch media assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleCopyLink = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.fileUrl);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAssets = assets.filter((a) => {
    if (filterType === "all") return true;
    if (filterType === "video_916") return a.dimensions === "9:16";
    if (filterType === "video_169") return a.dimensions === "16:9";
    if (filterType === "thumbnail") return a.fileType === "thumbnail" || a.fileType === "image";
    return true;
  });

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
              {isAr ? "مكتبة الوسائط الرقمية" : "Media Asset Vault"}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {assets.length} {isAr ? "ملفات مسجلة" : "Assets"}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? "إدارة الوسائط والتصميمات (Media Library)" : "Media Library & Brand Assets"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {isAr
              ? "مستودع الفيديوهات الأفقية 16:9 والرأسية 9:16، وصور الـ Thumbnails، ومقاطع الـ B-Roll الجاهزة للنشر عبر المنصات."
              : "Repository of vertical and widescreen videos, custom thumbnails, and verified B-roll clips."}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl self-start md:self-auto">
          {[
            { id: "all", labelAr: "الكل", labelEn: "All" },
            { id: "video_916", labelAr: "رأسي 9:16", labelEn: "9:16 Reels" },
            { id: "video_169", labelAr: "أفقي 16:9", labelEn: "16:9 Master" },
            { id: "thumbnail", labelAr: "Thumbnails", labelEn: "Thumbnails" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterType === tab.id
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  {asset.fileType === "video" ? <FileVideo className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                </div>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-black text-slate-600 dark:text-slate-300">
                  {asset.dimensions || "16:9"}
                </span>
              </div>

              <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate" title={asset.fileName}>
                {asset.fileName}
              </h4>
              <p className="text-[11px] text-slate-400 font-mono truncate">{asset.fileUrl}</p>

              <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-500 font-mono">
                {asset.durationSeconds ? (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {asset.durationSeconds}s
                  </span>
                ) : null}
                {asset.sizeBytes ? (
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    {Math.round(asset.sizeBytes / 1024 / 1024)} MB
                  </span>
                ) : null}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">#{asset.id}</span>
              <button
                onClick={() => handleCopyLink(asset)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition flex items-center gap-1 cursor-pointer"
              >
                {copiedId === asset.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedId === asset.id ? (isAr ? "تم النسخ" : "Copied") : (isAr ? "نسخ الرابط" : "Copy Link")}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
