import React, { useEffect, useState } from "react";
import {
  Col,
  Container,
  Dropdown,
  Row,
  Card,
  Button,
  CardBody,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import { DropdownButton, FormControl } from "react-bootstrap/DropdownButton";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import PropTypes from "prop-types";
import Select from "react-select";

function ChooseModule({
  setSentRequest,
  sendRequest,
  chooseModule,
  moduleChosen,
  setModuleChosen,
  loading,
}) {
  // states for modules
  const [modules, setModules] = useState([]);

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

  console.log(`${backendUrl}`);
  // function to get modules from backend and save in modules
  useEffect(() => {

    try {
      axios
        .get(`${backendUrl}/modules/all`)
        .then((result) => {
          setModules(result.data);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.error("Fehler beim Abrufen der Module:", error);
    }
  }, []);

  //language to display modules
  const [languageModuleInfo, setLanguage] = useState("deutsch");
  const changeLanguage = (language) => {
    setLanguage(language);
  };
  const radios = [
    { name: "deutsch", value: "deutsch" },
    { name: "english", value: "english" },
  ];

  return (
    <Container xl={12}>
      <Row>
        <div style={{ zIndex: "9999" }}>
          <Select
            options={modules.map((module) => ({
              label: module.titelde || module.titelen,
              value: module.modulnummer,
              modulnummer: module.modulnummer,
            }))}
            onChange={chooseModule}
            isClearable
            placeholder="Please choose a module..."
          />
        </div>
      </Row>
      {moduleChosen && (
        <div className="content" class="div-padding-top-bottom">
          <Row class="row-margin-bottom">
            <Col xl={6}>
              <p>Choose module language</p>
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
            </Col>
          </Row>
          <Row>
            <Col lg={4}>
              <Card>
                <Card.Header>
                  {languageModuleInfo == "deutsch"
                  ? <h5>Modultitel</h5>:
                  <h5>Modultitle</h5>}
                </Card.Header>
                <Card.Body>
                  {languageModuleInfo == "deutsch"
                    ? moduleChosen?.modulinfos?.titelde ||
                      "Kein Titel verfügbar"
                    : moduleChosen?.modulinfos?.titelen || "no title available"}
                </Card.Body>
              </Card>
              <Card>
                <Card.Header>
                  <h5>ID</h5>
                </Card.Header>
                <Card.Body>
                  {languageModuleInfo == "deutsch"
                    ? moduleChosen?.modulinfos?.modulnummer ||
                      "Keine ID verfügbar"
                    : moduleChosen?.modulinfos?.modulnummer ||
                      "no ID available"}
                </Card.Body>
              </Card>
            </Col>
            <Col lg={8}>
              <Card>
                <Card.Header>
                  {languageModuleInfo == "deutsch" 
                  ? <h5>Modulbeschreibung</h5>
                  : <h5>Moduledescription</h5>}
                </Card.Header>
                <Card.Body>
                  {languageModuleInfo == "deutsch" ? (
                    <div>
                      <h6>Lehrinhalte</h6>
                      {moduleChosen?.modulinfos?.lehrinhaltede ||
                        "Keine Lehrinhalte verfügbar"}
                      <p></p>
                      <h6>Lernergebnisse</h6>
                      <p></p>
                      {moduleChosen?.modulinfos?.lernergebnissede ||
                        "Keine lernergebnisse verfügbar"}
                    </div>
                  ) : (
                    <div>
                      <h6>content</h6>
                      {moduleChosen?.modulinfos?.lehrinhalteen ||
                        "no subjects available"}
                      <p></p>
                      <h6>learning outcomes</h6>
                      <p></p>
                      {moduleChosen?.modulinfos?.lernergebnisseen ||
                        "no outcomes available"}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row class="row-margin-bottom">
            <Col>
              <Button
                className="btn-cta"
                onClick={() => {
                  setSentRequest(true);
                  sendRequest(moduleChosen);
                }}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Get SDGs from AI model"
                )}
              </Button>
            </Col>
          </Row>
        </div>
      )}
    </Container>
  );
}
ChooseModule.propTypes = {
  setSentRequest: PropTypes.func.isRequired,
  sendRequest: PropTypes.func.isRequired,
  chooseModule: PropTypes.func.isRequired,
  moduleChosen: PropTypes.object,
  setModuleChosen: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};
export default ChooseModule;
