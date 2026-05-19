import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/client";
import AlertMessage from "../components/AlertMessage";

const emptyUser = {
    name: "",
    email: "",
    password: "",
    role: "viewer",
};

export default function Users() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState(emptyUser);
    const [editingId, setEditingId] = useState(null);
    const [editUser, setEditUser] = useState(null);
    const [passwords, setPasswords] = useState({});
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [alert, setAlert] = useState({ type: "", message: "" });

    async function loadUsers() {
        const { data } = await api.get("/users");
        setUsers(data);
    }

    useEffect(() => {
        loadUsers();
    }, []);

    async function handleCreateUser(e) {
        e.preventDefault();

        try {
            await api.post("/users", newUser);
            setNewUser(emptyUser);
            setAlert({ type: "success", message: "Usuario creado correctamente." });
            loadUsers();
        } catch (error) {
            setAlert({ type: "error", message: error.response?.data?.message || "Error creando usuario." });
        }
    }

    function startEdit(user) {
        setEditingId(user.id);
        setEditUser({ ...user });
    }

    async function handleUpdateUser(e) {
        e.preventDefault();

        try {
            await api.patch(`/users/${editingId}`, editUser);
            setEditingId(null);
            setEditUser(null);
            setAlert({ type: "success", message: "Usuario actualizado correctamente." });
            loadUsers();
        } catch (error) {
            setAlert({ type: "error", message: error.response?.data?.message || "Error actualizando usuario." });
        }
    }

    async function handleAdminPassword(userId) {
        const password = passwords[userId] || "";

        try {
            await api.patch(`/users/${userId}/password`, { password });
            setPasswords({ ...passwords, [userId]: "" });
            setAlert({ type: "success", message: "Contrasena actualizada correctamente." });
        } catch (error) {
            setAlert({ type: "error", message: error.response?.data?.message || "Error actualizando contrasena." });
        }
    }

    async function handleOwnPassword(e) {
        e.preventDefault();

        try {
            await api.patch("/auth/change-password", {
                currentPassword,
                newPassword,
            });
            setCurrentPassword("");
            setNewPassword("");
            setAlert({ type: "success", message: "Tu contrasena fue actualizada." });
        } catch (error) {
            setAlert({ type: "error", message: error.response?.data?.message || "Error cambiando contrasena." });
        }
    }

    return (
        <Layout>
            <h1 style={{ color: "#003366", marginBottom: 8 }}>Usuarios</h1>
            <p style={{ color: "#64748b", marginBottom: 24 }}>Administra accesos y cambios de contrasena del panel.</p>

            <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />

            <div style={containerStyle}>
                <div style={stackStyle}>
                    <form onSubmit={handleCreateUser} style={formStyle}>
                        <h2 style={sectionTitleStyle}>Nuevo usuario</h2>
                        <label>Nombre</label>
                        <input style={inputStyle} value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />

                        <label>Email</label>
                        <input style={inputStyle} type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />

                        <label>Contrasena inicial</label>
                        <input style={inputStyle} type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />

                        <label>Rol</label>
                        <select style={inputStyle} value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                            <option value="admin">Admin</option>
                            <option value="marketing">Marketing</option>
                            <option value="viewer">Viewer</option>
                        </select>

                        <button style={buttonStyle}>Crear usuario</button>
                    </form>

                    <form onSubmit={handleOwnPassword} style={formStyle}>
                        <h2 style={sectionTitleStyle}>Cambiar mi contrasena</h2>
                        <label>Contrasena actual</label>
                        <input style={inputStyle} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />

                        <label>Nueva contrasena</label>
                        <input style={inputStyle} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

                        <button style={buttonStyle}>Actualizar contrasena</button>
                    </form>
                </div>

                <div style={listStyle}>
                    <h2 style={sectionTitleStyle}>Usuarios registrados</h2>
                    {users.map((user) => (
                        <div key={user.id} style={cardStyle}>
                            {editingId === user.id ? (
                                <form onSubmit={handleUpdateUser}>
                                    <label>Nombre</label>
                                    <input style={inputStyle} value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} />
                                    <label>Email</label>
                                    <input style={inputStyle} type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
                                    <label>Rol</label>
                                    <select style={inputStyle} value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}>
                                        <option value="admin">Admin</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                    <label style={checkboxStyle}>
                                        <input type="checkbox" checked={editUser.is_active} onChange={(e) => setEditUser({ ...editUser, is_active: e.target.checked })} />
                                        Usuario activo
                                    </label>
                                    <div style={buttonRowStyle}>
                                        <button style={buttonStyle}>Guardar</button>
                                        <button type="button" onClick={() => setEditingId(null)} style={secondaryButtonStyle}>Cancelar</button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div style={userHeaderStyle}>
                                        <div>
                                            <h3 style={{ color: "#003366", fontSize: 16, margin: "0 0 4px" }}>{user.name}</h3>
                                            <p style={{ color: "#64748b", margin: 0, fontSize: 13 }}>{user.email}</p>
                                        </div>
                                        <span style={{ ...badgeStyle, background: user.is_active ? "#dcfce7" : "#fee2e2", color: user.is_active ? "#166534" : "#991b1b" }}>
                                            {user.is_active ? "Activo" : "Inactivo"}
                                        </span>
                                    </div>
                                    <p style={{ color: "#64748b", fontSize: 13, margin: "12px 0" }}><strong>Rol:</strong> {user.role}</p>
                                    <div style={buttonRowStyle}>
                                        <button onClick={() => startEdit(user)} style={secondaryButtonStyle}>Editar</button>
                                    </div>
                                    <div style={passwordRowStyle}>
                                        <input
                                            style={{ ...inputStyle, marginBottom: 0 }}
                                            type="password"
                                            placeholder="Nueva contrasena"
                                            value={passwords[user.id] || ""}
                                            onChange={(e) => setPasswords({ ...passwords, [user.id]: e.target.value })}
                                        />
                                        <button onClick={() => handleAdminPassword(user.id)} style={buttonStyle}>Cambiar</button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
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

const stackStyle = {
    display: "grid",
    gap: 16,
};

const listStyle = {
    display: "grid",
    gap: 16,
};

const formStyle = {
    background: "white",
    padding: "clamp(18px, 4vw, 24px)",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
};

const cardStyle = {
    ...formStyle,
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
};

const sectionTitleStyle = {
    color: "#003366",
    fontSize: 20,
    marginBottom: 20,
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
};

const secondaryButtonStyle = {
    ...buttonStyle,
    background: "#6b7280",
};

const buttonRowStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
    gap: 10,
    marginTop: 12,
};

const passwordRowStyle = {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 120px",
    gap: 10,
    marginTop: 12,
    alignItems: "end",
};

const userHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    flexWrap: "wrap",
};

const badgeStyle = {
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
};

const checkboxStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#003366",
    fontWeight: 600,
};
