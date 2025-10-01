import { useState, useEffect } from "react";
import api from "../api";

function UserManagement() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = () => {
    api
      .get("/api/users/")
      .then((res) => setUsers(res.data))
      .catch((err) => alert(err));
  };

  const handleChangeRole = (userId, newRole) => {
    // Lógica para llamar a la API y actualizar el rol
    // api.patch(`/api/users/${userId}/`, { profile: { role: newRole } })
    //    .then(...)
    //    .catch(...)
    console.log(`Cambiar rol del usuario ${userId} a ${newRole}`);
    alert("Funcionalidad de edición por implementar!");
  };

  return (
    <div>
      <h2>Gestión de Usuarios</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Rol Actual</th>
            <th>Nuevo Rol</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.profile.role}</td>
              <td>
                {/* Aquí podrías tener un selector y un botón de guardar */}
                <button onClick={() => handleChangeRole(user.id, "NUEVO_ROL")}>
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagement;
