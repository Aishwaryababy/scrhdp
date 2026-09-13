import React, { createContext, useContext, useState, useRef } from "react";

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: "Confirm Action",
        message: "",
        confirmText: "Confirm",
        cancelText: "Cancel",
        variant: "primary" // 'primary' | 'danger' | 'warning' | 'success'
    });

    const resolverRef = useRef(null);

    const confirm = (options) => {
        let message = "";
        let title = "Confirm Action";
        let confirmText = "Confirm";
        let cancelText = "Cancel";
        let variant = "primary";

        if (typeof options === "string") {
            message = options;
            const lower = options.toLowerCase();
            if (lower.includes("delete") || lower.includes("deactivate") || lower.includes("cancel") || lower.includes("remove")) {
                variant = "danger";
                confirmText = "Yes, Delete";
            } else if (lower.includes("update") || lower.includes("save") || lower.includes("change") || lower.includes("edit") || lower.includes("reset")) {
                variant = "primary";
                confirmText = "Yes, Proceed";
            }
        } else if (options && typeof options === "object") {
            message = options.message || "";
            title = options.title || title;
            confirmText = options.confirmText || confirmText;
            cancelText = options.cancelText || cancelText;
            variant = options.variant || variant;
        }

        setModalState({
            isOpen: true,
            title,
            message,
            confirmText,
            cancelText,
            variant
        });

        return new Promise((resolve) => {
            resolverRef.current = resolve;
        });
    };

    const handleConfirm = () => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
        if (resolverRef.current) {
            resolverRef.current(true);
            resolverRef.current = null;
        }
    };

    const handleCancel = () => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
        if (resolverRef.current) {
            resolverRef.current(false);
            resolverRef.current = null;
        }
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {modalState.isOpen && (
                <div
                    className="modal-confirmation-backdrop"
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(15, 23, 42, 0.65)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        zIndex: 999999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1.25rem",
                        animation: "modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards"
                    }}
                    onClick={handleCancel}
                >
                    <div
                        className="modal-confirmation-card"
                        style={{
                            width: "100%",
                            maxWidth: "430px",
                            backgroundColor: "#ffffff",
                            borderRadius: "24px",
                            padding: "1.75rem",
                            boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(15, 23, 42, 0.05)",
                            transform: "scale(1)",
                            animation: "modalScaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            {/* Icon Header */}
                            <div
                                style={{
                                    width: "64px",
                                    height: "64px",
                                    borderRadius: "50%",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "28px",
                                    marginBottom: "1.25rem",
                                    backgroundColor:
                                        modalState.variant === "danger"
                                            ? "#fef2f2"
                                            : modalState.variant === "warning"
                                            ? "#fffbeb"
                                            : modalState.variant === "success"
                                            ? "#f0fdf4"
                                            : "#eff6ff",
                                    color:
                                        modalState.variant === "danger"
                                            ? "#ef4444"
                                            : modalState.variant === "warning"
                                            ? "#f59e0b"
                                            : modalState.variant === "success"
                                            ? "#22c55e"
                                            : "#3b82f6"
                                }}
                            >
                                {modalState.variant === "danger" ? (
                                    <i className="bi bi-exclamation-triangle-fill"></i>
                                ) : modalState.variant === "warning" ? (
                                    <i className="bi bi-exclamation-circle-fill"></i>
                                ) : modalState.variant === "success" ? (
                                    <i className="bi bi-check-circle-fill"></i>
                                ) : (
                                    <i className="bi bi-question-circle-fill"></i>
                                )}
                            </div>

                            {/* Title & Message */}
                            <h5
                                style={{
                                    fontWeight: 700,
                                    fontSize: "1.2rem",
                                    color: "#0f172a",
                                    marginBottom: "0.5rem",
                                    letterSpacing: "-0.01em"
                                }}
                            >
                                {modalState.title}
                            </h5>
                            <p
                                style={{
                                    color: "#64748b",
                                    fontSize: "0.95rem",
                                    lineHeight: 1.5,
                                    marginBottom: "1.75rem",
                                    padding: "0 0.5rem"
                                }}
                            >
                                {modalState.message}
                            </p>

                            {/* Action Buttons */}
                            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    style={{
                                        flex: 1,
                                        padding: "0.75rem 1.25rem",
                                        borderRadius: "12px",
                                        border: "1px solid #cbd5e1",
                                        backgroundColor: "#f8fafc",
                                        color: "#475569",
                                        fontWeight: 600,
                                        fontSize: "0.95rem",
                                        cursor: "pointer",
                                        transition: "all 0.15s ease"
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e2e8f0")}
                                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                                >
                                    {modalState.cancelText}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    style={{
                                        flex: 1,
                                        padding: "0.75rem 1.25rem",
                                        borderRadius: "12px",
                                        border: "none",
                                        backgroundColor:
                                            modalState.variant === "danger"
                                                ? "#dc2626"
                                                : modalState.variant === "warning"
                                                ? "#d97706"
                                                : modalState.variant === "success"
                                                ? "#16a34a"
                                                : "#2563eb",
                                        color: "#ffffff",
                                        fontWeight: 600,
                                        fontSize: "0.95rem",
                                        cursor: "pointer",
                                        boxShadow:
                                            modalState.variant === "danger"
                                                ? "0 4px 12px rgba(220, 38, 38, 0.3)"
                                                : "0 4px 12px rgba(37, 99, 235, 0.3)",
                                        transition: "all 0.15s ease"
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.filter = "brightness(1.08)")}
                                    onMouseOut={(e) => (e.currentTarget.style.filter = "none")}
                                >
                                    {modalState.confirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error("useConfirm must be used within a ConfirmProvider");
    }
    return context;
};
