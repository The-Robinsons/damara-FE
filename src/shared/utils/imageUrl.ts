const getApiBase = () => (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

function isIpHost(hostname: string) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
}

function toApiUploadUrl(url: URL) {
  const apiBase = getApiBase();
  return apiBase ? `${apiBase}${url.pathname}` : url.toString();
}

export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return "/placeholder.png";

  const rawPath = imagePath.trim();
  const normalizedPath = rawPath.replace(/^\/+/, "");

  if (
    !rawPath ||
    normalizedPath === "placeholder.png" ||
    normalizedPath === "uploads/images/placeholder.png"
  ) {
    return "/placeholder.png";
  }

  if (rawPath.startsWith("data:") || rawPath.startsWith("blob:")) {
    return rawPath;
  }

  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
    try {
      const url = new URL(rawPath);
      if (url.pathname.endsWith("/placeholder.png")) {
        return "/placeholder.png";
      }
      if (isIpHost(url.hostname) || url.hostname.includes("ec2-")) {
        return toApiUploadUrl(url);
      }
      if (url.protocol === "http:") {
        url.protocol = "https:";
      }
      return url.toString();
    } catch {
      const pathMatch = rawPath.match(/\/uploads\/.*/);
      if (pathMatch) return `${getApiBase()}${pathMatch[0]}`;
      return rawPath;
    }
  }

  let cleanPath = rawPath;
  if (cleanPath.startsWith("/")) {
    if (!cleanPath.startsWith("/uploads/")) {
      cleanPath = `/uploads/images${cleanPath}`;
    }
  } else {
    cleanPath = `/uploads/images/${cleanPath}`;
  }

  return `${getApiBase()}${cleanPath}`;
};
