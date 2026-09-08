export function getYouTubeEmbedUrl(value: string) {
  try {
    const url = new URL(value.trim());
    let videoId = "";

    if (url.hostname === "youtu.be") {
      videoId = url.pathname.slice(1);
    } else if (url.hostname.includes("youtube.com")) {
      videoId = url.searchParams.get("v") ?? url.pathname.split("/").filter(Boolean).pop() ?? "";
    }

    if (!/^[a-zA-Z0-9_-]{6,}$/.test(videoId)) return null;
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  } catch {
    return null;
  }
}