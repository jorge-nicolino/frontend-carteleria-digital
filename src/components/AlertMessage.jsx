export default function AlertMessage({ type = "success", message, onClose }) {
    if (!message) return null;

    const config = {
        success: {
            icon: "✅",
            background: "#e6f4ea",
            color: "#0f9d58",
            border: "#0f9d58",
        },
        error: {
            icon: "❌",
            background: "#fde8ea",
            color: "#e63946",
            border: "#e63946",
        },
        warning: {
            icon: "⚠️",
            background: "#fff7db",
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
                border: `1px solid ${selected.border}`,
                borderRadius: 12,
                padding: "12px 14px",
                margin: "16px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                fontWeight: 600,
            }}
        >
            <span>
                {selected.icon} {message}
            </span>

            {onClose && (
                <button
                    onClick={onClose}
                    style={{
                        border: "none",
                        background: "transparent",
                        fontSize: 18,
                        cursor: "pointer",
                        color: selected.color,
                    }}
                >
                    ×
                </button>
            )}
        </div>
    );
}