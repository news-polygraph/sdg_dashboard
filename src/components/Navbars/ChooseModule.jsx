import React, { useState, useEffect } from 'react';
import { Container, Dropdown } from "react-bootstrap";
import axios from "axios";

function ChooseModule() {
  // Zustand für die Module
  const [modules, setModules] = useState([]);

  // URL des Backends
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001"; 

  // Daten beim ersten Render abrufen
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await axios.get(`${backendUrl}/modules/all?full=false`);
        setModules(response.data); // Daten in den Zustand speichern
      } catch (error) {
        console.error("Fehler beim Abrufen der Module:", error);
      }
    };

    fetchModules();
  }, []); // Leer = nur einmal beim Mounten ausführen

  return (
    <Container fluid>
        <Dropdown>
          <Dropdown.Toggle id="dropdown-button-dark-example1" variant="secondary">
            Choose Module
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Header>Choose Module</Dropdown.Header>
            {/* Dropdown-Elemente */}
            {modules.map((module, index) => (
              <Dropdown.Item eventKey={index}>
                {module.titelde} / {module.titelen}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
    </Container>
  );
}

export default ChooseModule;