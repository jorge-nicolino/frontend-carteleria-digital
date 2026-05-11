import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import "./Login.css";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("admin@colegio.com");
    const [password, setPassword] = useState("admin1234");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { data } = await api.post("/auth/login", {
                email,
                password,
            });

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            navigate("/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.message || "Error al iniciar sesión"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={handleSubmit}>
                <div className="logo-container">
                    <img 
                        src="/logo_igmb.png" 
                        alt="Logo IGMB"
                        className="logo-image"
                    />
                </div>

                <h1>Cartelería Digital</h1>
                <p>Panel administrativo del Instituto General Manuel Belgrano</p>

                {error && <div className="login-error">{error}</div>}

                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    disabled={loading}
                />

                <label htmlFor="password">Contraseña</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                />

                <button disabled={loading} type="submit">
                    {loading ? "Ingresando..." : "Ingresar"}
                </button>
            </form>
        </div>
    );
}