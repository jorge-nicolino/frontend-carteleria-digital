import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const navItems = [
        { path: "/dashboard", label: "Dashboard", roles: ["admin", "marketing", "viewer"] },
        { path: "/contents", label: "Contenidos", roles: ["admin", "marketing"] },
        { path: "/playlists", label: "Playlists", roles: ["admin", "marketing"] },
        { path: "/screens", label: "Pantallas", roles: ["admin"] },
    ];

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    }

    return (
        <div style={pageStyle}>
            <header style={headerStyle}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 22 }}>Cartelería Digital</h2>
                    <p style={{ margin: "4px 0 0", opacity: 0.8, fontSize: 14 }}>
                        Instituto General Manuel Belgrano
                    </p>
                </div>

                <div style={{ textAlign: "right" }}>
                    <strong>{user.name || "Usuario"}</strong>
                    <div style={{ fontSize: 13, opacity: 0.8 }}>{user.role || "Sin rol"}</div>
                </div>
            </header>

            <nav style={navStyle}>
                {navItems
                    .filter((item) => item.roles.includes(user.role))
                    .map((item) => {
                        const active = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    ...navLinkStyle,
                                    ...(active ? activeNavLinkStyle : {}),
                                }}
                            >
                                {item.label}
                            </Link>
                        );
                    })}

                <button onClick={logout} style={logoutButtonStyle}>
                    Cerrar sesión
                </button>
            </nav>

            <main style={mainStyle}>{children}</main>
        </div>
    );
}

const pageStyle = {
    minHeight: "100vh",
    background: "#f8fafc",
};

const headerStyle = {
    background: "linear-gradient(135deg, #003366 0%, #004B8C 100%)",
    color: "white",
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const navStyle = {
    background: "white",
    padding: "12px 24px",
    display: "flex",
    gap: 12,
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};

const navLinkStyle = {
    color: "#003366",
    padding: "8px 14px",
    borderRadius: 8,
    fontWeight: 600,
};

const activeNavLinkStyle = {
    background: "#003366",
    color: "white",
};

const logoutButtonStyle = {
    marginLeft: "auto",
    background: "#E63946",
    color: "white",
    border: "none",
    padding: "9px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
};

const mainStyle = {
    padding: 24,
    width: "100%",
    maxWidth: 1400,
    margin: "0 auto",
};