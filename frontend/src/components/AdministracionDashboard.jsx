import React from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";

function AdministracionDashboard() {
  return (
    <div className="dashboard-container">
      <h3>Panel de área de administración</h3>
      <div className="dashboard-grid">
        {/* Cada Link te llevará a una nueva página que deberás crear y proteger */}
        {/* <Link to="/pacientes" className="dashboard-card">
          Ver Pacientes
        </Link>
        <Link to="/citas" className="dashboard-card">
          Agendar Citas
        </Link>
        <Link to="/historial-clinico" className="dashboard-card">
          Consultar Historial Clínico
        </Link>
        <Link to="/mi-perfil" className="dashboard-card">
          Mi Perfil
        </Link> */}
      </div>
    </div>
  );
}

export default AdministracionDashboard;
