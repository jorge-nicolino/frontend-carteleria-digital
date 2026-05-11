import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/client";
import AlertMessage from "../components/AlertMessage";
import { Link } from "react-router-dom";

export default function Playlists() {
    const [playlists, setPlaylists] = useState([]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [alert, setAlert] = useState({
        type: "",
        message: "",
    });

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
            setAlert({
                type: "warning",
                message: "El nombre es obligatorio.",
            });

            return;
        }

        try {
            await api.post("/playlists", {
                name,
                description,
            });

            setName("");
            setDescription("");

            setAlert({
                type: "success",
                message: "Playlist creada correctamente.",
            });

            loadPlaylists();
        } catch (error) {
            setAlert({
                type: "error",
                message: error.response?.data?.message || "Error creando playlist.",
            });
        }
    }

    return (
        <Layout>
            <h1>Playlists</h1>

            <p>
                Organizá los contenidos que se mostrarán en cada pantalla.
            </p>

            <AlertMessage
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ type: "", message: "" })}
            />

            <div style={containerStyle}>
                <form onSubmit={handleSubmit} style={formStyle}>
                    <h2>Nueva playlist</h2>

                    <label>Nombre</label>

                    <input
                        style={inputStyle}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Pantalla biblioteca"
                    />

                    <label>Descripción</label>

                    <textarea
                        style={inputStyle}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descripción opcional"
                    />

                    <button style={buttonStyle}>
                        Crear playlist
                    </button>
                </form>

                <div style={listStyle}>
                    <h2>Playlists creadas</h2>

                    {playlists.map((playlist) => (
                        <div key={playlist.id} style={cardStyle}>
                            <h3>{playlist.name}</h3>

                            <p>{playlist.description || "Sin descripción"}</p>

                            <small>
                                {new Date(playlist.created_at).toLocaleString("es-AR", {
                                    timeZone: "America/Argentina/Cordoba",
                                })}
                            </small>

                            <br />

                            <Link
                                to={`/playlists/${playlist.id}`}
                                style={{
                                    display: "inline-block",
                                    marginTop: 12,
                                    background: "var(--color-primary)",
                                    color: "white",
                                    padding: "9px 12px",
                                    borderRadius: 8,
                                    textDecoration: "none",
                                    fontWeight: "bold",
                                }}
                            >
                                Administrar
                            </Link>
                            
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}

const containerStyle = {
    display: "grid",
    gridTemplateColumns: "350px 1fr",
    gap: 30,
    alignItems: "start",
};

const formStyle = {
    background: "white",
    padding: 24,
    borderRadius: 14,
    border: "1px solid var(--color-border)",
    boxShadow: "var(--shadow)",
};

const listStyle = {
    display: "grid",
    gap: 16,
};

const cardStyle = {
    background: "white",
    border: "1px solid var(--color-border)",
    borderRadius: 14,
    padding: 18,
    boxShadow: "var(--shadow)",
};

const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
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