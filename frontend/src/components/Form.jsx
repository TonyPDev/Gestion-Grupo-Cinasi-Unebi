import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCES_TOKEN, REFRESH_TOKEN } from "../constants";
import {
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Paper,
} from "@mui/material";

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("CLINICA");
  const navigate = useNavigate();

  const name = method === "login" ? "Iniciar Sesión" : "Registrarse";

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const dataToSend = {
        username,
        password,
      };
      if (method === "register") {
        if (!role) {
          alert("Por favor, selecciona un rol.");
          setLoading(false);
          return;
        }
        dataToSend.role = role;
      }
      const res = await api.post(route, dataToSend);
      if (method === "login") {
        localStorage.setItem(ACCES_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        alert("Usuario Creado Exitosamente");
        navigate("/admin/gestion-usuarios");
      }
    } catch (error) {
      alert("Usuario no encontrado");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Paper elevation={3} sx={{ maxWidth: 400, mx: "auto", mt: 8, p: 4 }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        noValidate
        autoComplete="off"
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {name}
        </Typography>
        <TextField
          label="Usuario"
          variant="outlined"
          fullWidth
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Contraseña"
          type="password"
          variant="outlined"
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {/*Renderizado condicional del selector de rol */}
        {method === "register" && (
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Rol</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              label="Rol"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="CLINICA">Clínica</MenuItem>
              <MenuItem value="ADMINISTRACION">Administración</MenuItem>
              <MenuItem value="COMERCIAL">Comercial</MenuItem>
              <MenuItem value="TI">TI</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Select>
          </FormControl>
        )}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{ mt: 2, py: 1.5 }}
        >
          {loading ? <CircularProgress size={24} /> : name}
        </Button>
      </Box>
    </Paper>
  );
}

export default Form;
