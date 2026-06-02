import { useEffect, useState } from "react";
import api from "../api/client";
import AlertMessage from "../components/AlertMessage";
import Layout from "../components/Layout";

export default function Contents() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const canEdit = ["admin", "marketing"].includes(user.role);
    const [contents, setContents] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [alert, setAlert] = useState({ type: "", message: "" });

    function formatFileSize(bytes) {
        if (!bytes) return "0 MB";

        const units = ["B", "KB", "MB", "GB"];
        const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
        const size = bytes / Math.pow(1024, index);

        return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
    }

    function getReductionPercent(stats) {
        if (!stats?.original_size_bytes || !stats?.saved_bytes) return 0;
        return Math.round((stats.saved_bytes * 100) / stats.original_size_bytes);
    }

    function getUploadSummary(stats) {
        if (!stats?.final_size_bytes) return "";

        if (stats.optimization_status === "pending") {
            return ` Video guardado: ${formatFileSize(stats.final_size_bytes)}. La reduccion se procesa en segundo plano.`;
        }

        const reductionPercent = getReductionPercent(stats);

        if (reductionPercent > 0) {
            return ` Peso original: ${formatFileSize(stats.original_size_bytes)}. Guardado: ${formatFileSize(stats.final_size_bytes)}. Reduccion: ${reductionPercent}%.`;
        }

        return ` Peso guardado: ${formatFileSize(stats.final_size_bytes)}. No se redujo el archivo.`;
    }

    function getOptimizationLabel(stats) {
        if (stats?.optimization_status === "pending") return "Procesando";
        if (stats?.optimization_status === "failed") return "Fallo";
        if (stats?.saved_bytes > 0) return `${getReductionPercent(stats)}% (${formatFileSize(stats.saved_bytes)})`;
        return "No reducido";
    }

    function getVideoThumbnailUrl(content) {
        if (!content?.file_url || !content?.file_name) return undefined;

        const thumbnailName = content.file_name.replace(/\.[^.]+$/, ".jpg");
        return content.file_url.replace(`/videos/${encodeURIComponent(content.file_name)}`, `/thumbnails/${encodeURIComponent(thumbnailName)}`);
    }

    async function loadContents() {
        const { data } = await api.get("/contents");
        setContents(data);
    }

    useEffect(() => {
        loadContents();
    }, []);

    useEffect(() => {
        const hasPendingOptimization = contents.some((content) => content.upload_stats?.optimization_status === "pending");

        if (!hasPendingOptimization) return undefined;

        const intervalId = setInterval(() => {
            loadContents().catch(() => {});
        }, 7000);

        return () => clearInterval(intervalId);
    }, [contents]);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!title || !file) {
            setAlert({ type: "warning", message: "El titulo y el archivo son obligatorios." });
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("file", file);

        try {
            setLoading(true);
            setUploadProgress(0);
            setUploadStatus("Preparando archivo...");

            const { data } = await api.post("/contents/upload", formData, {
                onUploadProgress: (progressEvent) => {
                    if (!progressEvent.total) {
                        setUploadStatus("Subiendo archivo...");
                        return;
                    }

                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                    setUploadStatus(percent >= 100 ? "Guardando datos del contenido..." : `Subiendo archivo... ${percent}%`);
                },
            });

            setTitle("");
            setDescription("");
            setFile(null);
            e.target.reset();

            await loadContents();
            setAlert({
                type: "success",
                message: `Contenido subido correctamente.${getUploadSummary(data.upload)}`,
            });
        } catch (error) {
            await loadContents().catch(() => {});

            setAlert({
                type: "error",
                message: error.response?.data?.message || "Error subiendo contenido.",
            });
        } finally {
            setLoading(false);
            setUploadProgress(0);
            setUploadStatus("");
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
            setAlert({ type: "warning", message: "El titulo es obligatorio." });
            return;
        }

        try {
            await api.patch(`/contents/${editingId}`, {
                title: editTitle,
                description: editDescription,
            });

            setAlert({ type: "success", message: "Contenido actualizado correctamente." });
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

    async function handleDeleteContent(content) {
        const confirmDelete = confirm(`Seguro que queres eliminar "${content.title}"?`);
        if (!confirmDelete) return;

        try {
            await api.delete(`/contents/${content.id}`);
            setAlert({ type: "success", message: "Contenido eliminado correctamente." });
            loadContents();
        } catch (error) {
            setAlert({
                type: "error",
                message: error.response?.data?.message || "Error eliminando contenido.",
            });
        }
    }

    return (
        <Layout>
            <h1 style={{ color: "#003366", marginBottom: 8 }}>Gestion de Contenidos</h1>
            <p style={{ color: "#64748b", marginBottom: 24 }}>
                {canEdit
                    ? "Subi imagenes, flyers o videos para la carteleria digital."
                    : "Consulta los contenidos cargados para la carteleria digital."}
            </p>

            <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

            {canEdit && (
                <form onSubmit={handleSubmit} style={formStyle}>
                    <h2 style={{ color: "#003366", fontSize: 20, marginBottom: 20 }}>Nuevo contenido</h2>

                    <label>Titulo</label>
                    <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Inscripciones abiertas" />

                    <label>Descripcion</label>
                    <textarea style={inputStyle} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripcion opcional" />

                    <label>Archivo</label>
                    <input
                        style={inputStyle}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm,.mp4,.mov,.avi,.mkv,.webm,.m4v"
                        onChange={(e) => {
                            setFile(e.target.files[0]);
                            setUploadProgress(0);
                            setUploadStatus("");
                        }}
                    />

                    {file && !loading && (
                        <div style={selectedFileStyle}>
                            <strong>{file.name}</strong>
                            <span>{formatFileSize(file.size)}</span>
                        </div>
                    )}

                    <button style={buttonStyle} disabled={loading}>
                        {loading ? `Subiendo ${uploadProgress}%` : "Subir contenido"}
                    </button>

                    {loading && (
                        <div style={uploadBoxStyle}>
                            <div style={uploadHeaderStyle}>
                                <strong>{uploadProgress}%</strong>
                                <span>{file?.name || "Archivo seleccionado"}</span>
                            </div>
                            <div style={progressTrackStyle}>
                                <div style={{ ...progressBarStyle, width: `${uploadProgress}%` }} />
                            </div>
                            <p style={uploadTextStyle}>
                                {uploadStatus || "Subiendo archivo..."}
                            </p>
                        </div>
                    )}
                </form>
            )}

            <h2 style={{ color: "#003366", fontSize: 20, marginTop: 40, marginBottom: 20 }}>Contenidos cargados</h2>

            <div style={gridStyle}>
                {contents.map((content) => (
                    <div key={content.id} style={cardStyle}>
                        {content.type === "image" ? (
                            <img src={content.file_url} alt={content.title} style={previewStyle} />
                        ) : (
                            <video src={content.file_url} poster={getVideoThumbnailUrl(content)} controls style={previewStyle} />
                        )}

                        {canEdit && editingId === content.id ? (
                            <form onSubmit={handleUpdateContent}>
                                <input style={inputStyle} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                                <textarea style={inputStyle} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                                <button style={buttonStyle}>Guardar cambios</button>
                                <button type="button" onClick={() => setEditingId(null)} style={{ ...secondaryButtonStyle, marginTop: 8 }}>
                                    Cancelar
                                </button>
                            </form>
                        ) : (
                            <>
                                <h3 style={{ color: "#003366", fontSize: 16, marginTop: 14, marginBottom: 6 }}>{content.title}</h3>
                                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 10 }}>{content.description}</p>
                                {canEdit && (
                                    <div style={buttonRowStyle}>
                                        <button onClick={() => startEdit(content)} style={buttonStyle}>Editar</button>
                                        <button onClick={() => handleDeleteContent(content)} style={dangerButtonStyle}>Eliminar</button>
                                    </div>
                                )}
                            </>
                        )}

                        <p style={{ color: "#64748b", fontSize: 12, marginTop: 12, marginBottom: 0 }}>
                            <strong>Tipo:</strong> {content.type}
                        </p>

                        {content.upload_stats?.final_size_bytes && (
                            <div style={statsBoxStyle}>
                                <div style={statsLineStyle}>
                                    <strong>Peso guardado</strong>
                                    <span>{formatFileSize(content.upload_stats.final_size_bytes)}</span>
                                </div>
                                <div style={statsLineStyle}>
                                    <strong>Reduccion</strong>
                                    <span>{getOptimizationLabel(content.upload_stats)}</span>
                                </div>
                                {content.upload_stats.original_size_bytes && (
                                    <div style={statsLineStyle}>
                                        <strong>Original</strong>
                                        <span>{formatFileSize(content.upload_stats.original_size_bytes)}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Layout>
    );
}

const formStyle = {
    background: "#ffffff",
    padding: "clamp(18px, 4vw, 24px)",
    borderRadius: 8,
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
    border: "2px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 15,
    fontFamily: "inherit",
};

const buttonStyle = {
    width: "100%",
    padding: 13,
    background: "linear-gradient(135deg, #003366 0%, #004B8C 100%)",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: "600",
    cursor: "pointer",
};

const selectedFileStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    background: "#eef6ff",
    color: "#003366",
    border: "1px solid #bfdbfe",
    borderRadius: 8,
    padding: "10px 12px",
    marginBottom: 14,
    fontSize: 13,
};

const uploadBoxStyle = {
    marginTop: 14,
    background: "#f8fafc",
    border: "1px solid #dbeafe",
    borderRadius: 8,
    padding: 12,
};

const uploadHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    color: "#003366",
    fontSize: 14,
    marginBottom: 10,
};

const progressTrackStyle = {
    width: "100%",
    height: 14,
    background: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
    border: "1px solid #cbd5e1",
};

const progressBarStyle = {
    height: "100%",
    background: "linear-gradient(135deg, #003366 0%, #004B8C 100%)",
    transition: "width 0.2s ease",
};

const uploadTextStyle = {
    color: "#64748b",
    fontSize: 13,
    margin: "8px 0 0",
};

const secondaryButtonStyle = {
    ...buttonStyle,
    background: "#6b7280",
};

const dangerButtonStyle = {
    ...buttonStyle,
    background: "#ef4444",
};

const buttonRowStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
    gap: 10,
    marginTop: 10,
};

const statsBoxStyle = {
    display: "grid",
    gap: 6,
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    color: "#334155",
    fontSize: 12,
};

const statsLineStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
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
