import React, { useEffect, useState } from 'react';
import { Col, Container, Dropdown, Row } from "react-bootstrap";
import axios from "axios";

function ChooseModule() {
  // Zustand für die Module
  const [modules, setModules] = useState([]);
  const [moduleChosen, setModuleChosen] = useState({});

  // URL des Backends
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001"; 

  // Funktion zum Abrufen der Module
  useEffect(() => {
    try {
      axios
        .get(`${backendUrl}/modules/all`)
        .then((result) =>{  
          setModules(result.data)//save result modules in modules
        }); 
    } catch (error) {
      console.error("Fehler beim Abrufen der Module:", error);
    }
  }, []);

  const chooseModule = (module) => {
    try {
      axios
        .get(`${backendUrl}/modules/${module.modulnummer}`)
        .then((result) =>{  
          setModuleChosen(result.data);
        });
    } catch (error) {
      console.error("Fehler beim Auswählen eines Moduls:", error);
    }
  }

  return (
    <Container fluid>
      <Row>
        <Dropdown>
          <Dropdown.Toggle id="dropdown-button-dark-example1" variant="secondary">
            Choose Module
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Header>Choose Module</Dropdown.Header>
            {/* Dropdown-Elemente */}
            {modules.map((module, index) => (
              <Dropdown.Item key={index} eventKey={index} onClick={() => {
                chooseModule(module);
              }}>
                {module.titelde} / {module.titelen}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </Row>
      <Container fluid>
        <Row>
          <Col lg={2}>
            <Row>Modultitel: Lustiger Modultitel</Row>
            <Row>ID: #03854094</Row>
          </Col>
          <Col lg={8}>
              Moduledesription
          </Col>
        </Row>
        </Container>
    </Container>
  );
}

export default ChooseModule;
