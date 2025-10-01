import { useState, useEffect } from "react";
import api from "../api";
import "../styles/UserManagement.css"; // Crearemos este archivo para los estilos
import { useAuth } from "../hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

function UserManagement() {
  const [users, setUsers] = useState([]);
  // State para saber qué usuario estamos editando
  const [editingUserId, setEditingUserId] = useState(null);
  // State para guardar el nuevo rol seleccionado
  const [selectedRole, setSelectedRole] = useState("");
  const { userId: loggedInUserId } = useAuth();

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = () => {
    api
      .get("/api/users/")
      .then((res) => setUsers(res.data))
      .catch((err) => alert(err));
  };

  // Se activa al hacer clic en "Editar"
  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setSelectedRole(user.profile ? user.profile.role : "CLINICA");
  };

  // Se activa al hacer clic en "Cancelar"
  const handleCancelClick = () => {
    setEditingUserId(null);
  };

  // Se activa al hacer clic en "Guardar"
  const handleSaveClick = (userId) => {
    api
      .patch(`/api/users/${userId}/`, { profile: { role: selectedRole } })
      .then((res) => {
        alert("¡Rol actualizado exitosamente!");
        setEditingUserId(null); // Salimos del modo edición
        getUsers(); // Volvemos a cargar la lista de usuarios para ver el cambio
      })
      .catch((err) => {
        console.error("Error al actualizar el rol:", err.response.data);
        alert(`Error: ${JSON.stringify(err.response.data)}`);
      });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Usuarios
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  {editingUserId === user.id ? (
                    <Select
                      size="small"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      <MenuItem value="CLINICA">Clínica</MenuItem>
                      <MenuItem value="ADMINISTRACION">Administración</MenuItem>
                      <MenuItem value="COMERCIAL">Comercial</MenuItem>
                      <MenuItem value="TI">TI</MenuItem>
                      <MenuItem value="ADMIN">Admin</MenuItem>
                    </Select>
                  ) : user.profile ? (
                    user.profile.role
                  ) : (
                    "Sin rol asignado"
                  )}
                </TableCell>
                <TableCell align="right">
                  {editingUserId === user.id ? (
                    <>
                      <IconButton
                        color="success"
                        onClick={() => handleSaveClick(user.id)}
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton color="error" onClick={handleCancelClick}>
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <IconButton
                      color="primary"
                      onClick={() => handleEditClick(user)}
                      disabled={user.id === loggedInUserId}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default UserManagement;
