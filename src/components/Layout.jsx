import { Link, useLocation } from "react-router-dom";

export default function Layout({ children }) {
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
    }

    const navItems = [
        {
            path: "/dashboard",
            label: "Dashboard",
            roles: ["admin", "marketing", "viewer"],
        },
        {
            path: "/contents",
            label: "Contenidos",
            roles: ["admin", "marketing"],
        },
        {
            path: "/playlists",
            label: "Playlists",
            roles: ["admin", "marketing"],
        },
        {
            path: "/screens",
            label: "Pantallas",
            roles: ["admin"],
        },
    ];

    return (
        <div style={layoutStyle}>
            <aside style={sidebarStyle}>
                <h2 style={logoStyle}>Cartelería Digital</h2>
                <p style={userStyle}>{user.name}</p>

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
                                        ...linkStyle,
                                        background: active ? "#19376D" : "transparent",
                                        color: active ? "#ffffff" : "#dbeafe",
                                    }}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                </nav>

                <button onClick={logout} style={logoutStyle}>
                    Cerrar sesión
                </button>
            </aside>

            <main style={mainStyle}>{children}</main>
        </div>
    );
}

const layoutStyle = {
    display: "flex",
    minHeight: "100vh",
    background: "var(--color-bg)",
};

const sidebarStyle = {
    width: 260,
    background: "var(--color-primary)",
    color: "white",
    padding: 24,
    display: "flex",
    flexDirection: "column",
};

const logoStyle = {
    margin: 0,
    fontSize: 22,
};

const userStyle = {
    color: "#cbd5e1",
    marginBottom: 30,
};

const navStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flex: 1,
};

const linkStyle = {
    textDecoration: "none",
    padding: "12px 14px",
    borderRadius: 10,
    fontWeight: 600,
};

const logoutStyle = {
    background: "#E63946",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: 10,
    fontWeight: "bold",
};

const mainStyle = {
    flex: 1,
    padding: 30,
};