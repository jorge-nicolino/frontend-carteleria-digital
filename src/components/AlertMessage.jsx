export default function AlertMessage({ type = "success", message, onClose }) {
    if (!message) return null;

    const config = {
        success: {
            icon: "✅",
            background: "linear-gradient(135deg, #e6f4ea 0%, #d1f0e0 100%)",
            color: "#0f9d58",
            border: "#0f9d58",
        },
        error: {
            icon: "❌",
            background: "linear-gradient(135deg, #fde8ea 0%, #fcd5d9 100%)",
            color: "#e63946",
            border: "#e63946",
        },
        warning: {
            icon: "⚠️",
            background: "linear-gradient(135deg, #fff7db 0%, #ffeed4 100%)",
            color: "#9a6b00",
            border: "#f4b400",
        },
    };

    const selected = config[type] || config.success;

    return (
        <div
            style={{
                background: selected.background,
                color: selected.color,
                border: `2px solid ${selected.border}`,
                borderRadius: 12,
                padding: "14px 16px",
                margin: "16px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                fontWeight: 600,
                fontSize: 14,
                animation: "slideInDown 0.4s ease-out",
            }}
        >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{selected.icon}</span>
                <span>{message}</span>
            </span>

            {onClose && (
                <button
                    onClick={onClose}
                    style={{
                        border: "none",
                        background: "transparent",
                        fontSize: 20,
                        cursor: "pointer",
                        color: selected.color,
                        padding: 0,
                        transition: "transform 0.3s ease",
                    }}
                    onMouseEnter={(e) => e.target.style.transform = "scale(1.2)"}
                    onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                >
                    ×
                </button>
            )}
        </div>
    );
}