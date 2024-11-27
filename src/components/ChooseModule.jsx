import React, { useEffect, useState } from 'react';
import { Col, Container, Dropdown, Row, Card } from "react-bootstrap";
import axios from "axios";

function ChooseModule() {
  // Zustand für die Module
  const [modules, setModules] = useState([]);
  const [moduleChosen, setModuleChosen] = useState();
  const [languageModuleInfo, setLanguage] = useState("");

  // URL des Backends
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001"; 

  // Funktion zum Abrufen der Module
  useEffect(() => {
    try {
      axios
        .get(`${backendUrl}/modules/all`)
        .then((result) =>{  
          setModules(result.data)//save result modules in modules
          console.log("Module abgerufen");
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
          console.log("ModuleChosen: " + result.data);
        });
        
    } catch (error) {
      console.error("Fehler beim Auswählen eines Moduls:", error);
    }
  }

  const changeLanguage = (language) =>{
    setLanguage(language);
    console.log("changed language to "+ language)

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
        <Dropdown>
          <Dropdown.Toggle id="dropdown-button-dark-example1" variant="secondary">
            Choose Language 
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Header>Choose Module</Dropdown.Header>
            {/* Dropdown-Elemente */}
            <Dropdown.Item  onClick={() => {
              changeLanguage("deutsch");
            }}>
              Deutsch
            </Dropdown.Item>
            <Dropdown.Item  onClick={() => {
              changeLanguage("english");
            }}>
              English
            </Dropdown.Item>
           
          </Dropdown.Menu>
        </Dropdown>
      </Row>
      {moduleChosen?
      <div className="content">
        <Row>
          <Col lg={4}>
            <Row><Card>
              <Card.Header>Modultitel</Card.Header>
              <Card.Body>{languageModuleInfo=="deutsch"?(moduleChosen?.modulinfos?.titelde || "Kein Titel verfügbar" ):(moduleChosen?.modulinfos?.titelen || "no title available" )}</Card.Body>
              </Card></Row>
            <Row><Card>
              <Card.Header>ID</Card.Header>
              <Card.Body>{languageModuleInfo=="deutsch"?(moduleChosen?.modulinfos?.modulnummer || "Keine ID verfügbar"):(moduleChosen?.modulinfos?.modulnummer || "no ID available")}</Card.Body>
            </Card></Row>
          </Col>
          <Col lg={8}>
              <Card>
                <Card.Header>Moduledesription</Card.Header>
                <Card.Body>
                  {languageModuleInfo=="deutsch"?
                    <div>
                      <p>Lehrinhalte</p>
                      {moduleChosen?.modulinfos?.lehrinhaltede || "Keine lehrinhalte verfügbar"}
                      <p></p>
                      <p>Lernergebnisse</p>
                      <p></p>
                      {moduleChosen?.modulinfos?.lehrnergebnissede || "Keine lernergebnisse verfügbar"}
                    </div>
                   :
                    <div>
                      <p>subjects</p>
                      {moduleChosen?.modulinfos?.lehrinhalteen || "no subjects available"}
                      <p></p>
                      <p>learnig goals</p>
                      <p></p>
                      {moduleChosen?.modulinfos?.lehrnergebnisseen || "no goals available"}
                    </div>}
                </Card.Body>
              </Card>
          </Col>
        </Row>
      </div>: <div>Bitte wählen Sie ein Modul aus.</div>}
    </Container>
  );
}

export default ChooseModule;
