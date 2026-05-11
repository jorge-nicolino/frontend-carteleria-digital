import { useEffect, useState } from "react";
import api from "../api/client";
import AlertMessage from "../components/AlertMessage";
import Layout from "../components/Layout";

export default function Contents() {
    const [contents, setContents] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState(10);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [alert, setAlert] = useState({
        type: "",
        message: "",
    });

    async function loadContents() {
        const { data } = await api.get("/contents");
        setContents(data);
    }

    useEffect(() => {
        loadContents();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!title || !file) {
            setAlert({
                type: "warning",
                message: "El título y el archivo son obligatorios.",
            });
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("duration_seconds", duration);
        formData.append("file", file);

        try {
            setLoading(true);
            await api.post("/contents/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setTitle("");
            setDescription("");
            setDuration(10);
            setFile(null);

            await loadContents();

            setAlert({
                type: "success",
                message: "Contenido subido correctamente.",
            });
        } catch (error) {
            setAlert({
                type: "error",
                message: error.response?.data?.message || "Error subiendo contenido.",
            });
        } finally {
            setLoading(false);
        }
    }

    function startEdit(content) {
        setEditingId(content.id);
        setEditTitle(content.title);
        setEditDescription(content.description || "");
    }

    async function handleUpdateContent(e) {
        e.preventDefault();

        if (!editTitle) {
            setAlert({
                type: "warning",
                message: "El título es obligatorio.",
            });
            return;
        }

        try {
            await api.patch(`/contents/${editingId}`, {
                title: editTitle,
                description: editDescription,
            });

            setAlert({
                type: "success",
                message: "Contenido actualizado correctamente.",
            });

            setEditingId(null);
            setEditTitle("");
            setEditDescription("");

            loadContents();
        } catch (error) {
            setAlert({
                type: "error",
                message: error.response?.data?.message || "Error actualizando contenido.",
            });
        }
    }

    return (
        <Layout>
            <h1>Gestión de Contenidos</h1>
            <p>Subí imágenes, flyers o videos para la cartelería digital.</p>

            <AlertMessage
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ type: "", message: "" })}
            />

            <form onSubmit={handleSubmit} style={formStyle}>
                <h2>Nuevo contenido</h2>

                <label>Título</label>
                <input
                    style={inputStyle}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Inscripciones abiertas"
                />

                <label>Descripción</label>
                <textarea
                    style={inputStyle}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción opcional"
                />


                <label>Archivo</label>
                <input
                    style={inputStyle}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4"
                    onChange={(e) => setFile(e.target.files[0])}
                />

                <button style={buttonStyle} disabled={loading}>
                    {loading ? "Subiendo..." : "Subir contenido"}
                </button>
            </form>

            <h2 style={{ marginTop: 40 }}>Contenidos cargados</h2>

            <div style={gridStyle}>
                {contents.map((content) => (
                    <div key={content.id} style={cardStyle}>
                        {content.type === "image" ? (
                            <img
                                src={content.file_url}
                                alt={content.title}
                                style={previewStyle}
                            />
                        ) : (
                            <video
                                src={content.file_url}
                                controls
                                style={previewStyle}
                            />
                        )}

                        {editingId === content.id ? (
                            <form onSubmit={handleUpdateContent}>
                                <input
                                    style={inputStyle}
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                />

                                <textarea
                                    style={inputStyle}
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                />

                                <button style={buttonStyle}>Guardar cambios</button>

                                <button
                                    type="button"
                                    onClick={() => setEditingId(null)}
                                    style={{
                                        ...buttonStyle,
                                        background: "#6b7280",
                                        marginTop: 8,
                                    }}
                                >
                                    Cancelar
                                </button>
                            </form>
                        ) : (
                            <>
                                <h3>{content.title}</h3>
                                <p>{content.description}</p>

                                <button
                                    onClick={() => startEdit(content)}
                                    style={{
                                        ...buttonStyle,
                                        marginTop: 10,
                                    }}
                                >
                                    Editar
                                </button>
                            </>
                        )}

                        <p>
                            <strong>Tipo:</strong> {content.type}
                        </p>

                    </div>
                ))}
            </div>
        </Layout>
    );
}

const formStyle = {
    background: "#ffffff",
    padding: 24,
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    maxWidth: 520,
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
};

const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    marginTop: 6,
    marginBottom: 14,
    border: "1px solid #d1d5db",
    borderRadius: 10,
    fontSize: 15,
};

const buttonStyle = {
    width: "100%",
    padding: 13,
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 16,
    cursor: "pointer",
};

const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 20,
};

const cardStyle = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
};

const previewStyle = {
    width: "100%",
    height: 160,
    objectFit: "contain",
    background: "#111827",
    borderRadius: 10,
};