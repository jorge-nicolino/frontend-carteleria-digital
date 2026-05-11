import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/client";
import AlertMessage from "../components/AlertMessage";

export default function PlaylistDetail() {
    const { id } = useParams();

    const [items, setItems] = useState([]);
    const [contents, setContents] = useState([]);
    const [selectedContent, setSelectedContent] = useState("");
    const [duration, setDuration] = useState(10);
    const [orderIndex, setOrderIndex] = useState(1);

    const [alert, setAlert] = useState({ type: "", message: "" });

    async function loadData() {
        const [playlistRes, contentsRes] = await Promise.all([
            api.get(`/playlists/${id}`),
            api.get("/contents"),
        ]);

        setItems(playlistRes.data);
        setContents(contentsRes.data);
        setOrderIndex(playlistRes.data.length + 1);
    }

    useEffect(() => {
        loadData();
    }, [id]);

    async function handleAddContent(e) {
        e.preventDefault();

        if (!selectedContent) {
            setAlert({
                type: "warning",
                message: "Seleccioná un contenido para agregar.",
            });
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

            setAlert({
                type: "success",
                message: "Contenido agregado a la playlist.",
            });

            loadData();
        } catch (error) {
            setAlert({
                type: "error",
                message: error.response?.data?.message || "Error agregando contenido.",
            });
        }
    }

    async function handleRemoveItem(itemId) {
        const confirmDelete = confirm(
            "¿Seguro que querés quitar este contenido de la playlist?"
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`/playlists/items/${itemId}`);

            setAlert({
                type: "success",
                message: "Contenido quitado de la playlist.",
            });

            loadData();
        } catch (error) {
            setAlert({
                type: "error",
                message:
                    error.response?.data?.message ||
                    "Error quitando contenido de la playlist.",
            });
        }
    }

    return (
        <Layout>
            <h1>Detalle de Playlist</h1>
            <p>Agregá contenidos y definí el orden de reproducción.</p>

            <AlertMessage
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ type: "", message: "" })}
            />

            <form onSubmit={handleAddContent} style={formStyle}>
                <h2>Agregar contenido</h2>

                <label>Contenido</label>
                <select
                    style={inputStyle}
                    value={selectedContent}
                    onChange={(e) => setSelectedContent(e.target.value)}
                >
                    <option value="">Seleccionar contenido</option>
                    {contents.map((content) => (
                        <option key={content.id} value={content.id}>
                            {content.title} - {content.type}
                        </option>
                    ))}
                </select>

                <label>Orden</label>
                <input
                    style={inputStyle}
                    type="number"
                    min="1"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(e.target.value)}
                />

                <label>Duración en segundos</label>
                <input
                    style={inputStyle}
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                />

                <button style={buttonStyle}>Agregar a playlist</button>
            </form>

            <h2 style={{ marginTop: 35 }}>Contenidos en esta playlist</h2>

            <div style={gridStyle}>
                {items.map((item) => (
                    <div key={item.id} style={cardStyle}>
                        {item.contents?.type === "image" ? (
                            <img
                                src={item.contents.file_url}
                                alt={item.contents.title}
                                style={previewStyle}
                            />
                        ) : (
                            <video
                                src={item.contents?.file_url}
                                controls
                                style={previewStyle}
                            />
                        )}

                        <h3>{item.order_index}. {item.contents?.title}</h3>
                        <p>{item.contents?.description}</p>
                        <p>
                            <strong>Duración:</strong>{" "}
                            {item.duration_seconds || item.contents?.duration_seconds}s
                        </p>
                        <button
                            onClick={() => handleRemoveItem(item.id)}
                            style={{
                                width: "100%",
                                padding: 10,
                                background: "var(--color-error)",
                                color: "white",
                                border: "none",
                                borderRadius: 8,
                                fontWeight: "bold",
                                marginTop: 10,
                            }}
                        >
                            Quitar de playlist
                        </button>
                    </div>
                ))}
            </div>
        </Layout>
    );
}

const formStyle = {
    background: "white",
    padding: 24,
    borderRadius: 14,
    border: "1px solid var(--color-border)",
    boxShadow: "var(--shadow)",
    maxWidth: 520,
};

const inputStyle = {
    width: "100%",
    padding: 12,
    marginTop: 6,
    marginBottom: 14,
    border: "1px solid var(--color-border)",
    borderRadius: 10,
};

const buttonStyle = {
    width: "100%",
    padding: 13,
    background: "var(--color-primary)",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontWeight: "bold",
};

const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 20,
};

const cardStyle = {
    background: "white",
    border: "1px solid var(--color-border)",
    borderRadius: 14,
    padding: 16,
    boxShadow: "var(--shadow)",
};

const previewStyle = {
    width: "100%",
    height: 160,
    objectFit: "contain",
    background: "#111827",
    borderRadius: 10,
};