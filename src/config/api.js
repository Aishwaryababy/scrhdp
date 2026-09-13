export const SUPABASE_URL = "https://cznfksfrmdvvajbufavx.supabase.co";
export const SUPABASE_BUCKET = "uploads";

export const API = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ""
    ? import.meta.env.VITE_API_URL
    : (import.meta.env.DEV ? "http://localhost:5000" : "");

export const getCleanFileName = (pathStr) => {
    if (!pathStr || pathStr === "null" || pathStr === "undefined") return "";
    let str = String(pathStr).trim().replace(/\\/g, "/");
    
    if (str.includes("https://") || str.includes("http://")) {
        const lastHttpIndex = Math.max(str.lastIndexOf("https://"), str.lastIndexOf("http://"));
        str = str.substring(lastHttpIndex);
    }
    
    if (str.includes("/storage/v1/object/public/uploads/")) {
        return str.split("/storage/v1/object/public/uploads/").pop();
    }
    if (str.includes("/uploads/")) {
        return str.split("/uploads/").pop();
    }
    if (str.startsWith("uploads/")) {
        return str.replace(/^uploads\//, "");
    }
    if (str.startsWith("/uploads/")) {
        return str.replace(/^\/uploads\//, "");
    }
    return str;
};

export const getSupabaseStorageUrl = (pathStr) => {
    const filename = getCleanFileName(pathStr);
    if (!filename) return null;
    return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${filename}`;
};

export const getBackendUploadUrl = (pathStr) => {
    const filename = getCleanFileName(pathStr);
    if (!filename) return null;
    return `${API}/uploads/${filename}`;
};

export const getImageUrl = (path, fallback = null) => {
    const defaultFallback = fallback || "https://placehold.co/500x300?text=No+Image";
    if (!path || path === "null" || path === "undefined" || (typeof path === "string" && path.trim() === "")) {
        return defaultFallback;
    }
    const strPath = String(path).trim();
    if (strPath.startsWith("data:")) {
        return strPath;
    }

    const supabaseUrl = getSupabaseStorageUrl(strPath);
    if (supabaseUrl) {
        return supabaseUrl;
    }

    return defaultFallback;
};

export const handleImageError = (e, originalPath, fallback = null) => {
    const target = e.currentTarget || e.target;
    if (!target) return;

    const fallbackUrl = fallback || "https://placehold.co/500x300?text=No+Image";

    if (!target.dataset.triedBackend && originalPath) {
        target.dataset.triedBackend = "true";
        const filename = getCleanFileName(originalPath);
        if (filename) {
            const backendUrl = `${API}/uploads/${filename}`;
            if (backendUrl && backendUrl !== target.src) {
                target.src = backendUrl;
                return;
            }
        }
    }

    if (target.src !== fallbackUrl) {
        target.src = fallbackUrl;
    }
};

export default API;


