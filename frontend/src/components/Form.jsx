import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCES_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const name = method === "login" ? "Iniciar Sesión" : "Registrarse";
  const datos = {
    username,
    password,
  };
  if (method === "register") {
    datos.role = role;
  }

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const res = await api.post(route, { username, password });
      if (method === "login") {
        localStorage.setItem(ACCES_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        navigate("/admin/gestion-usuarios");
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h1>{name}</h1>
      <input
        className="form-input"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Usuario"
        autoComplete={method === "login" ? "username" : "new-username"}
      />
      <input
        className="form-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        autoComplete={method === "login" ? "current-password" : "new-password"}
      />
      {/*Renderizado condicional del selector de rol */}
      {method === "register" && (
        <div className="form-group">
          <label htmlFor="role-select">Rol:</label>
          <select
            id="role-select"
            className="form-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="CLINICA">Clínica</option>
            <option value="ADMINISTRACION">Administración</option>
            <option value="COMERCIAL">Comercial</option>
            <option value="TI">TI</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      )}
      <button className="form-button" type="submit">
        {name}
      </button>
    </form>
  );
}

export default Form;
