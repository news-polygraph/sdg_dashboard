import React, { useEffect, useState } from 'react';
import { Col, Container, Dropdown, Row, Card, Button, CardBody} from "react-bootstrap";
import axios from "axios";
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import PropTypes from "prop-types";

function ChooseModule({setSentRequest}) {
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

  const sendModelReq = (module) => {
    // bspw sowas:
    const m = {"modulinfos": {
        "modulnummer": 51088,
        "versionsnummer": 1,
        "link": "https://moseskonto.tu-berlin.de/moses/modultransfersystem/bolognamodule/beschreibung/anzeigen.html?number=51088&version=1&sprache=1",
        "titelde": "Medizintechnik im Krankenhaus",
        "titelen": "Medical technology in hospitals",
        "lernergebnissede": "Die Absolvent*innen dieses Moduls erlernen die erforderlichen Grundlagen des/der in der Medizintechnikabteilung eines Krankenhauses tätige/n Ingenieur*in bei der Anwendung dort eingesetzter Medizinprodukte. Durch die Vermittlung der zugehörigen Aufgaben und Tätigkeiten und deren relevanter Aspekte werden die Teilnehmer*innen in die Lage versetzt, Anforderungen an Medizinprodukte aus Sicht eines Krankenhauses zu verstehen. Mit Abschluss des Moduls verfügen die Absolvent*innen grundlegende Kenntnisse zur medizintechnischen Planung, zur Beschaffung sowie zum Betreiben von Medizinprodukten in einer Gesundheitseinrichtung. Die Absolvent*innen werden befähigt, Entscheidungen zur zielgerichteten Anwendung der Medizintechnik im Krankenhausumfeld zu treffen.",
        "lernergebnisseen": "Graduates of this module learn the necessary basics of the engineer working in the medical technology department of a hospital in the application of medical devices used there. By learning about the associated tasks and activities and their relevant aspects, participants will be able to understand the requirements for medical devices from the perspective of a hospital. On completion of the module, graduates will have basic knowledge of medical technology planning, procurement and the operation of medical devices in a healthcare facility. Graduates will be able to make decisions on the targeted application of medical technology in the hospital environment.",
        "lehrinhaltede": "• Funktionsweise und Aufbau Krankenhaus • Medizintechnische Planung • Beschaffung von Medizinprodukten • Betreiben von Medizinprodukten • Medizinische IT: Vernetzung und Informationssicherheit",
        "lehrinhalteen": "Functionality and organisation of hospitals - Medical technology planning - Procurement of Medical devices - Operation of Medical devices - Medical IT: networking and information security"
    }}
    try {
      axios
        .post(`${backendUrl}/model`, m)
        .then((result) =>{
          console.log(result.data);
        });
        
    } catch (error) {
      console.error("Req Fehler", error);
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
        <div className="content" class="div-padding-top-bottom">
          <Row>
          <ButtonGroup>
            {radios.map((radio) => (
              <ToggleButton
                type="radio"
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
          <Row class="row-margin-bottom">
					<Col >
						<Button className="btn-custom" onClick={()=>(setSentRequest(true))}>
							Send request to Mistral
						</Button>
					</Col>
				</Row>
        </div>
        
        : <div class="div-abstand">Bitte wählen Sie ein Modul aus.</div>}
    </Container> 
  );
}
ChooseModule.propTypes = {
  setSentRequest:PropTypes.func.isRequired,
};
export default ChooseModule;
