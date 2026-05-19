import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/client";
import AlertMessage from "../components/AlertMessage";
import { Link } from "react-router-dom";

export default function Playlists() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const canEdit = ["admin", "marketing"].includes(user.role);
    const [playlists, setPlaylists] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [alert, setAlert] = useState({ type: "", message: "" });

    async function loadPlaylists() {
        const { data } = await api.get("/playlists");
        setPlaylists(data);
    }

    useEffect(() => {
        loadPlaylists();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!name) {
            setAlert({ type: "warning", message: "El nombre es obligatorio." });
            return;
        }

        try {
            await api.post("/playlists", { name, description });
            setName("");
            setDescription("");
            setAlert({ type: "success", message: "Playlist creada correctamente." });
            loadPlaylists();
        } catch (error) {
            setAlert({ type: "error", message: error.response?.data?.message || "Error creando playlist." });
        }
    }

    function startEdit(playlist) {
        setEditingId(playlist.id);
        setEditName(playlist.name);
        setEditDescription(playlist.description || "");
    }

    async function handleUpdatePlaylist(e) {
        e.preventDefault();

        if (!editName) {
            setAlert({ type: "warning", message: "El nombre es obligatorio." });
            return;
        }

        try {
            await api.patch(`/playlists/${editingId}`, {
                name: editName,
                description: editDescription,
            });

            setEditingId(null);
            setEditName("");
            setEditDescription("");
            setAlert({ type: "success", message: "Playlist actualizada correctamente." });
            loadPlaylists();
        } catch (error) {
            setAlert({ type: "error", message: error.response?.data?.message || "Error actualizando playlist." });
        }
    }

    async function handleDeletePlaylist(playlist) {
        const confirmDelete = confirm(`Seguro que queres eliminar "${playlist.name}"?`);
        if (!confirmDelete) return;

        try {
            await api.delete(`/playlists/${playlist.id}`);
            setAlert({ type: "success", message: "Playlist eliminada correctamente." });
            loadPlaylists();
        } catch (error) {
            setAlert({ type: "error", message: error.response?.data?.message || "Error eliminando playlist." });
        }
    }

    return (
        <Layout>
            <h1 style={{ color: "#003366", marginBottom: 8 }}>Playlists</h1>
            <p style={{ color: "#64748b", marginBottom: 24 }}>
                {canEdit
                    ? "Organiza los contenidos que se mostraran en cada pantalla."
                    : "Consulta las playlists disponibles y sus contenidos."}
            </p>

            <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

            <div style={containerStyle}>
                {canEdit && (
                    <form onSubmit={handleSubmit} style={formStyle}>
                        <h2 style={{ color: "#003366", fontSize: 20, marginBottom: 20 }}>Nueva playlist</h2>

                        <label>Nombre</label>
                        <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Pantalla biblioteca" />

                        <label>Descripcion</label>
                        <textarea style={inputStyle} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripcion opcional" />

                        <button style={buttonStyle}>Crear playlist</button>
                    </form>
                )}

                <div style={listStyle}>
                    <h2 style={{ color: "#003366", fontSize: 20, marginBottom: 20 }}>Playlists creadas</h2>

                    {playlists.length === 0 ? (
                        <p style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>No hay playlists creadas aun</p>
                    ) : (
                        playlists.map((playlist) => (
                            <div key={playlist.id} style={cardStyle}>
                                {canEdit && editingId === playlist.id ? (
                                    <form onSubmit={handleUpdatePlaylist}>
                                        <label>Nombre</label>
                                        <input style={inputStyle} value={editName} onChange={(e) => setEditName(e.target.value)} />
                                        <label>Descripcion</label>
                                        <textarea style={inputStyle} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                                        <div style={buttonRowStyle}>
                                            <button style={buttonStyle}>Guardar</button>
                                            <button type="button" onClick={() => setEditingId(null)} style={secondaryButtonStyle}>Cancelar</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <h3 style={{ color: "#003366", fontSize: 16, margin: "0 0 8px" }}>{playlist.name}</h3>
                                        <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 12px" }}>{playlist.description || <em>Sin descripcion</em>}</p>
                                        <small style={{ color: "#94a3b8", fontSize: 12 }}>
                                            {new Date(playlist.created_at).toLocaleString("es-AR", { timeZone: "America/Argentina/Cordoba" })}
                                        </small>

                                        <div style={buttonRowStyle}>
                                            <Link to={`/playlists/${playlist.id}`} style={linkButtonStyle}>
                                                {canEdit ? "Administrar" : "Ver"}
                                            </Link>
                                            {canEdit && (
                                                <>
                                                    <button onClick={() => startEdit(playlist)} style={secondaryButtonStyle}>Renombrar</button>
                                                    <button onClick={() => handleDeletePlaylist(playlist)} style={dangerButtonStyle}>Eliminar</button>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
}

const containerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 330px), 1fr))",
    gap: 30,
    alignItems: "start",
};

const formStyle = {
    background: "white",
    padding: "clamp(18px, 4vw, 24px)",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
};

const listStyle = {
    display: "grid",
    gap: 16,
};

const cardStyle = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 18,
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
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
    padding: 12,
    background: "linear-gradient(135deg, #003366 0%, #004B8C 100%)",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontWeight: "bold",
    fontSize: 14,
    cursor: "pointer",
    textAlign: "center",
};

const linkButtonStyle = {
    ...buttonStyle,
    display: "block",
    textDecoration: "none",
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
    marginTop: 14,
};
