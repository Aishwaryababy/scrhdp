export const API = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ""
    ? import.meta.env.VITE_API_URL
    : (import.meta.env.DEV ? "http://localhost:5000" : "");

export const getImageUrl = (path, fallback = null) => {
    if (!path || path === "null" || path === "undefined" || (typeof path === "string" && path.trim() === "")) {
        return fallback;
    }
    const strPath = String(path).trim();
    if (strPath.startsWith("http://") || strPath.startsWith("https://") || strPath.startsWith("data:")) {
        return strPath;
    }
    const cleanPath = strPath.replace(/\\/g, "/");
    if (cleanPath.startsWith("uploads/")) {
        return `${API}/${cleanPath}`;
    } else if (cleanPath.startsWith("/uploads/")) {
        return `${API}${cleanPath}`;
    }
    return `${API}/uploads/${cleanPath}`;
};

export default API;
