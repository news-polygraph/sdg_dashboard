import React, { useEffect, useState } from 'react';
import { Col, Container, Dropdown, Row, Card, Button, CardBody} from "react-bootstrap";
import axios from "axios";
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

function ChooseModule() {
  // states for modules
  const [modules, setModules] = useState([]);
  const [moduleChosen, setModuleChosen] = useState();

  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001"; 

  // function to get modules frpm backend and save in modules
  useEffect(() => {
    try {
      axios
        .get(`${backendUrl}/modules/all`)
        .then((result) =>{  
          setModules(result.data)
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

  //language to display modules
  const [languageModuleInfo, setLanguage] = useState("deutsch");
  const changeLanguage = (language) =>{
    setLanguage(language);
    console.log("changed language to "+ language)

  }
  const radios = [
    { name: 'deutsch', value: 'deutsch' },
    { name: 'english', value: 'english' },
  ];

  return (
    <Container xl={12}>
        <Row>        
          <DropdownButton
              variant="secondary"
              align={{ lg: 'start' }}
              title="choose module"
              id="choose-module-btn"
            >
              {modules.map((module, index) => (
                  <Dropdown.Item key={index} eventKey={index} onClick={() => {
                    chooseModule(module);
                  }}>
                    {module.titelde} / {module.titelen}
                  </Dropdown.Item>
                ))}
          </DropdownButton>     
        </Row>
        {moduleChosen?
        <div className="content" class="div-abstand">
          <Row>
          <ButtonGroup>
            {radios.map((radio, idx) => (
              <ToggleButton
                key={idx}
                id={`radio-${idx}`}
                type="radio"
                variant="secondary"
                name="radio"
                value={radio.value}
                checked={languageModuleInfo === radio.value}
                onClick={() => {
                  changeLanguage(radio.name);
                }}
                
              >
                {radio.name}
              </ToggleButton>
            ))}
          </ButtonGroup>
            {/*<ToggleButtonGroup type="radio" name="options" defaultValue={1} variant="secondary">
              <ToggleButton value={1} onClick={() => {
                    changeLanguage("deutsch");
                  }}>
                deutsch
              </ToggleButton>
              <ToggleButton value={2} onClick={() => {
                    changeLanguage("english");
                  }}>
                english
              </ToggleButton>
            </ToggleButtonGroup>*/}
          </Row>
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
        </div>: <div class="div-abstand">Bitte wählen Sie ein Modul aus.</div>}
    </Container> 
  );
}

export default ChooseModule;
