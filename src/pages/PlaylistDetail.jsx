import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/client";
import AlertMessage from "../components/AlertMessage";

export default function PlaylistDetail() {
    const { id } = useParams();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const canEdit = ["admin", "marketing"].includes(user.role);
    const [items, setItems] = useState([]);
    const [contents, setContents] = useState([]);
    const [selectedContent, setSelectedContent] = useState("");
    const [duration, setDuration] = useState(10);
    const [orderIndex, setOrderIndex] = useState(1);
    const [alert, setAlert] = useState({ type: "", message: "" });

    const loadData = useCallback(async function loadData() {
        const [playlistRes, contentsRes] = await Promise.all([
            api.get(`/playlists/${id}`),
            api.get("/contents"),
        ]);

        setItems(playlistRes.data);
        setContents(contentsRes.data);
        setOrderIndex(playlistRes.data.length + 1);
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    async function handleAddContent(e) {
        e.preventDefault();

        if (!selectedContent) {
            setAlert({ type: "warning", message: "Selecciona un contenido para agregar." });
            return;
        }

        try {
            await api.post(`/playlists/${id}/items`, {
                content_id: selectedContent,
                order_index: Number(orderIndex),
                duration_seconds: Number(duration),
            });

            setSelectedContent("");
            setDuration(10);
            setAlert({ type: "success", message: "Contenido agregado a la playlist." });
            loadData();
        } catch (error) {
            setAlert({ type: "error", message: error.response?.data?.message || "Error agregando contenido." });
        }
    }

    async function handleRemoveItem(itemId) {
        const confirmDelete = confirm("Seguro que queres quitar este contenido de la playlist?");
        if (!confirmDelete) return;

        try {
            await api.delete(`/playlists/items/${itemId}`);
            setAlert({ type: "success", message: "Contenido quitado de la playlist." });
            loadData();
        } catch (error) {
            setAlert({
                type: "error",
                message: error.response?.data?.message || "Error quitando contenido de la playlist.",
            });
        }
    }

    return (
        <Layout>
            <h1 style={{ color: "#003366", marginBottom: 8 }}>Detalle de Playlist</h1>
            <p style={{ color: "#64748b", marginBottom: 24 }}>
                {canEdit
                    ? "Agrega contenidos y defini el orden y la duracion de reproduccion."
                    : "Consulta los contenidos incluidos en esta playlist."}
            </p>

            <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

            {canEdit && (
                <form onSubmit={handleAddContent} style={formStyle}>
                    <h2 style={{ color: "#003366", fontSize: 20, marginBottom: 20 }}>Agregar contenido</h2>

                    <label>Contenido</label>
                    <select style={inputStyle} value={selectedContent} onChange={(e) => setSelectedContent(e.target.value)}>
                        <option value="">Seleccionar contenido</option>
                        {contents.map((content) => (
                            <option key={content.id} value={content.id}>{content.title} - {content.type}</option>
                        ))}
                    </select>

                    <label>Orden</label>
                    <input style={inputStyle} type="number" min="1" value={orderIndex} onChange={(e) => setOrderIndex(e.target.value)} />

                    <label>Duracion en segundos</label>
                    <input style={inputStyle} type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} />

                    <button style={buttonStyle}>Agregar a playlist</button>
                </form>
            )}

            <h2 style={{ color: "#003366", fontSize: 20, marginTop: 35, marginBottom: 20 }}>Contenidos en esta playlist</h2>

            <div style={gridStyle}>
                {items.length === 0 ? (
                    <p style={{ color: "#94a3b8", gridColumn: "1/-1", textAlign: "center", padding: 40 }}>No hay contenidos en esta playlist</p>
                ) : (
                    items.map((item) => (
                        <div key={item.id} style={cardStyle}>
                            {item.contents?.type === "image" ? (
                                <img src={item.contents.file_url} alt={item.contents.title} style={previewStyle} />
                            ) : (
                                <video src={item.contents?.file_url} controls style={previewStyle} />
                            )}

                            <h3 style={{ color: "#003366", fontSize: 16, margin: "14px 0 6px" }}>
                                {item.order_index}. {item.contents?.title}
                            </h3>
                            <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 10px" }}>{item.contents?.description}</p>
                            <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 10px" }}>
                                <strong>Duracion:</strong> {item.duration_seconds || 10}s
                            </p>
                            {canEdit && (
                                <button onClick={() => handleRemoveItem(item.id)} style={dangerButtonStyle}>
                                    Quitar de playlist
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </Layout>
    );
}

const formStyle = {
    background: "white",
    padding: "clamp(18px, 4vw, 24px)",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    maxWidth: 520,
};

const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    marginTop: 6,
    marginBottom: 14,
    border: "2px solid #e5e7eb",
    borderRadius: 8,
    fontFamily: "inherit",
    fontSize: 15,
};

const buttonStyle = {
    width: "100%",
    padding: 13,
    background: "linear-gradient(135deg, #003366 0%, #004B8C 100%)",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontWeight: "bold",
    fontSize: 15,
    cursor: "pointer",
};

const dangerButtonStyle = {
    ...buttonStyle,
    padding: 10,
    background: "#ef4444",
    marginTop: 10,
};

const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))",
    gap: 20,
};

const cardStyle = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 16,
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
};

const previewStyle = {
    width: "100%",
    height: 160,
    objectFit: "contain",
    background: "#f3f4f6",
    borderRadius: 8,
};
