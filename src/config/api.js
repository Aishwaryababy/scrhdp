export const SUPABASE_URL = "https://cznfksfrmdvvajbufavx.supabase.co";
export const SUPABASE_BUCKET = "uploads";

export const API = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ""
    ? import.meta.env.VITE_API_URL
    : (import.meta.env.DEV ? "http://localhost:5000" : "");

export const getCleanFileName = (path) => {
    if (!path) return "";
    const str = String(path).trim().replace(/\\/g, "/");
    if (str.includes("/uploads/")) {
        return str.split("/uploads/").pop();
    }
    if (str.startsWith("uploads/")) {
        return str.replace(/^uploads\//, "");
    }
    return str;
};

export const getSupabaseStorageUrl = (path) => {
    const filename = getCleanFileName(path);
    if (!filename) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${filename}`;
};

export const getBackendUploadUrl = (path) => {
    const filename = getCleanFileName(path);
    if (!filename) return null;
    return `${API}/uploads/${filename}`;
};

export const getImageUrl = (path, fallback = null) => {
    if (!path || path === "null" || path === "undefined" || (typeof path === "string" && path.trim() === "")) {
        return fallback;
    }
    const strPath = String(path).trim();

    if (strPath.startsWith("data:") || strPath.includes(".supabase.co/storage/v1/object/public/")) {
        return strPath;
    }

    if ((strPath.startsWith("http://") || strPath.startsWith("https://")) && !strPath.includes("localhost:5000")) {
        return strPath;
    }

    const supabaseUrl = getSupabaseStorageUrl(strPath);
    if (supabaseUrl) {
        return supabaseUrl;
    }

    return getBackendUploadUrl(strPath) || fallback;
};

export const handleImageError = (e, originalPath, fallback = null) => {
    const target = e.currentTarget || e.target;
    if (!target) return;

    const fallbackUrl = fallback || "https://placehold.co/500x300?text=No+Image";

    if (!target.dataset.triedBackend && originalPath) {
        target.dataset.triedBackend = "true";
        const backendUrl = getBackendUploadUrl(originalPath);
        if (backendUrl && backendUrl !== target.src) {
            target.src = backendUrl;
            return;
        }
    }

    if (target.src !== fallbackUrl) {
        target.src = fallbackUrl;
    }
};

export default API;

