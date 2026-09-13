export const API = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ""
    ? import.meta.env.VITE_API_URL
    : (import.meta.env.DEV ? "http://localhost:5000" : "");

export const SUPABASE_STORAGE_URL = "https://cznfksfrmdvvajbufavx.supabase.co/storage/v1/object/public/uploads";

/**
 * Returns primary image URL:
 * - If full URL (http/https/data:), returns as is.
 * - Otherwise, tries Supabase Storage Bucket first.
 */
export const getImageUrl = (path, fallback = "https://placehold.co/500x250?text=No+Image") => {
    if (!path || path === "null" || path === "undefined" || (typeof path === "string" && path.trim() === "")) {
        return fallback;
    }
    const strPath = String(path).trim();
    if (strPath.startsWith("http://") || strPath.startsWith("https://") || strPath.startsWith("data:")) {
        return strPath;
    }
    const cleanPath = strPath.replace(/\\/g, "/").replace(/^\/+/, "");
    const filename = cleanPath.startsWith("uploads/") ? cleanPath.replace(/^uploads\//, "") : cleanPath;
    return `${SUPABASE_STORAGE_URL}/${filename}`;
};

/**
 * Returns secondary table upload path (relative path on backend API).
 */
export const getTableImagePath = (path) => {
    if (!path || path === "null" || path === "undefined" || (typeof path === "string" && path.trim() === "")) {
        return null;
    }
    const strPath = String(path).trim();
    if (strPath.startsWith("http://") || strPath.startsWith("https://") || strPath.startsWith("data:")) {
        return strPath;
    }
    const cleanPath = strPath.replace(/\\/g, "/").replace(/^\/+/, "");
    if (cleanPath.startsWith("uploads/")) {
        return `${API}/${cleanPath}`;
    }
    return `${API}/uploads/${cleanPath}`;
};

/**
 * Conditional image error handler:
 * 1. If image fails to load from Supabase Storage (triggers onError), try backend table path (${API}/uploads/filename).
 * 2. If backend table path also fails, load default fallback placeholder.
 */
export const handleImageError = (e, originalPath, fallback = "https://placehold.co/500x250?text=No+Image") => {
    const img = e.currentTarget;
    const currentSrc = img.src;

    if (!img.dataset.triedTablePath && originalPath) {
        img.dataset.triedTablePath = "true";
        const tablePath = getTableImagePath(originalPath);
        if (tablePath && currentSrc !== tablePath) {
            img.src = tablePath;
            return;
        }
    }

    if (fallback && currentSrc !== fallback) {
        img.src = fallback;
    }
};

export default API;

