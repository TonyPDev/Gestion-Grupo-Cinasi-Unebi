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
  OutlinedInput,
  Chip,
} from "@mui/material";

// Helper para mostrar los roles seleccionados como "Chips"
const roleOptions = ["CLINICA", "ADMINISTRACION", "COMERCIAL", "TI", "ADMIN"];

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]); // El estado es un array
  const navigate = useNavigate();

  const name = method === "login" ? "Iniciar Sesión" : "Crear Usuario";

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    const dataToSend = {
      username,
      password,
    };

    if (method === "register") {
      if (roles.length === 0) {
        alert("Por favor, selecciona al menos un rol.");
        setLoading(false);
        return;
      }
      dataToSend.roles = roles;
    }

    try {
      const res = await api.post(route, dataToSend);

      if (method === "login") {
        localStorage.setItem(ACCES_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        alert("¡Usuario creado exitosamente!");
        navigate("/admin/gestion-usuarios");
      }
    } catch (error) {
      alert(`Error: ${JSON.stringify(error.response?.data || error.message)}`);
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
        {method === "register" && (
          <FormControl fullWidth>
            <InputLabel id="multiple-roles-label">Roles</InputLabel>
            <Select
              labelId="multiple-roles-label"
              multiple
              value={roles}
              onChange={(e) => setRoles(e.target.value)}
              input={<OutlinedInput label="Roles" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {roleOptions.map((roleName) => (
                <MenuItem key={roleName} value={roleName}>
                  {roleName}
                </MenuItem>
              ))}
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
