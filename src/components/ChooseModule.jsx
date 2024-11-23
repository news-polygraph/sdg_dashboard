import React, { useEffect, useState } from 'react';
import { Col, Container, Dropdown, Row, Card } from "react-bootstrap";
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
      <div className="content">
        <Row>
          <Col lg={2}>
            <Row><Card>
              <Card.Header>Modultitel</Card.Header>
              <Card.Body>Lustiger Modultitel</Card.Body>
              </Card></Row>
            <Row><Card>
              <Card.Header>ID</Card.Header>
              <Card.Body>#03854094</Card.Body>
            </Card></Row>
          </Col>
          <Col lg={8}>
              <Card>
                <Card.Header>Moduledesription</Card.Header>
                <Card.Body>Nach dem erfolgreichem Abschluss des Moduls können die Studierenden - Audiosignale mit Hilfe des Computer Algebra Systems MATLAB erzeugen und analysieren. - elementare Eigenschaften diskreter Systeme bestimmen. - das Verhalten diskreter Signale und Systeme im Zeitbereich und im Frequenzbereich analysieren. - dafür benötigte Transformationen (Fouriertransformation, z-Transformation) analytisch sowie numerisch unter Benutzung von MATLAB durchführen. - für Audio-Effekte und für die akustische Messtechnik wichtige Signalprozesse (Faltung, Schnelle Faltung, FFT, IFFT, STFFT) berechnen. - einfache digitale Filter (IIR, FIR) entwerfen.</Card.Body>
              </Card>
          </Col>
        </Row>
        </div>
    </Container>
  );
}

export default ChooseModule;
