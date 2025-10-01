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
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";

const roleOptions = ["CLINICA", "ADMINISTRACION", "COMERCIAL", "TI", "ADMIN"];

function UserManagement() {
  const [users, setUsers] = useState([]);
  // State para saber qué usuario estamos editando
  const [editingUserId, setEditingUserId] = useState(null);
  // State para guardar el nuevo rol seleccionado
  const [editedUsername, setEditedUsername] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
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
    setEditedUsername(user.username);
    setSelectedRoles(user.profile ? user.profile.roles : []);
  };

  // Se activa al hacer clic en "Cancelar"
  const handleCancelClick = () => {
    setEditingUserId(null);
  };

  // Se activa al hacer clic en "Guardar"
  const handleSaveClick = (userId) => {
    const dataToSave = {
      username: editedUsername,
      profile: {
        roles: selectedRoles,
      },
    };
    api
      .patch(`/api/users/${userId}/`, { profile: { roles: selectedRoles } })
      .then((res) => {
        alert("¡Roles actualizados exitosamente!");
        setEditingUserId(null); // Salimos del modo edición
        getUsers(); // Volvemos a cargar la lista de usuarios para ver el cambio
      })
      .catch((err) => {
        alert(`Error: ${JSON.stringify(err.response.data)}`);
      });
    api
      .patch(`/api/users/${userId}/`, dataToSave)
      .then(() => {
        alert("¡Usuario actualizado!");
        setEditingUserId(null);
        getUsers();
      })
      .catch((err) => alert(`Error: ${JSON.stringify(err.response.data)}`));
  };

  const handleDeleteClick = (userId) => {
    // Pedimos confirmación antes de borrar
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible."
      )
    ) {
      api
        .delete(`/api/users/delete/${userId}/`)
        .then(() => {
          alert("¡Usuario eliminado exitosamente!");
          getUsers(); // Refrescamos la lista de usuarios
        })
        .catch((err) =>
          alert(`Error al eliminar: ${JSON.stringify(err.response.data)}`)
        );
    }
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
                <TableCell>
                  {editingUserId === user.id ? (
                    <TextField
                      size="small"
                      value={editedUsername}
                      onChange={(e) => setEditedUsername(e.target.value)}
                    />
                  ) : (
                    user.username
                  )}
                </TableCell>
                <TableCell>
                  {editingUserId === user.id ? (
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <InputLabel>Roles</InputLabel>
                      <Select
                        multiple
                        value={selectedRoles}
                        onChange={(e) => setSelectedRoles(e.target.value)}
                        input={<OutlinedInput label="Roles" />}
                        renderValue={(selected) => (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {selected.map((value) => (
                              <Chip key={value} label={value} size="small" />
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
                  ) : // Muestra los roles como texto simple o un mensaje si no tiene
                  user.profile ? (
                    user.profile.roles.join(", ")
                  ) : (
                    "Sin roles"
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
                      <IconButton color="default" onClick={handleCancelClick}>
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditClick(user)}
                        disabled={user.id === loggedInUserId}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(user.id)}
                        disabled={user.id === loggedInUserId}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
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
