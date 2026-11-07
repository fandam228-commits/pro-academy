const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

function parseStartTime(value) {
  if (!value) return 0;
  if (/^\d+$/.test(value)) return Number(value);
  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!match || !match[0]) return 0;
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

function toYouTubeEmbedUrl(input) {
  if (typeof input !== "string" || !input.trim()) return null;
  let url;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  let videoId = "";

  if (host === "youtu.be") {
    videoId = url.pathname.split("/").filter(Boolean)[0] || "";
  } else if (["youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com"].includes(host)) {
    if (url.pathname === "/watch") videoId = url.searchParams.get("v") || "";
    else {
      const parts = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live", "v"].includes(parts[0])) videoId = parts[1] || "";
    }
  } else {
    return null;
  }

  if (!VIDEO_ID_PATTERN.test(videoId)) return null;
  const start = parseStartTime(url.searchParams.get("start") || url.searchParams.get("t"));
  return `https://www.youtube-nocookie.com/embed/${videoId}${start > 0 ? `?start=${start}` : ""}`;
}

exports.toYouTubeEmbedUrl = toYouTubeEmbedUrl;
