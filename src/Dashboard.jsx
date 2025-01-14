import React, { useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Card, Container, Row, Col, CardBody } from "react-bootstrap";

import MainNavbar from "components/Navbars/MainNavbar";
import UploadNavbar from "components/Navbars/UploadNavbar";
import ChooseModule from "components/ChooseModule.jsx";
import Footer from "components/Footer/Footer";

import PdfViewer from "components/PdfViewer";
import XaiFeatures from "components/Analysis/XaiFeatures";
import PdfAnalysis from "components/Analysis/PdfAnalysis";
import { fileDataDefault } from "./components/utils.js";

import { useState } from 'react';
import OldXaiFeatures from "components/OldXaiFeatures.jsx";
import FeedbackSection from "components/Feedback/FeedbackSection.jsx";
import MissingSDGFeedback from "components/Feedback/MissingSDGFeedback.jsx";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001"; 

console.log("REACT_APP_BACKEND_URL:");
console.log(process.env.REACT_APP_BACKEND_URL);

console.log("Dashboard.jsx:");
console.log(backendUrl);

function Dashboard() {
  const location = useLocation();
  const mainPanel = React.useRef(null);
  const [file, setFile] = React.useState(null);
  const [fileData, setFileData] = React.useState(fileDataDefault);
  const [sdgActive, setSdgActive] = React.useState(null); //which sdg is chosen in analysis Section
  const [pageNumber, setPageNumber] = React.useState(1);
  const cardColor = { backgroundColor: "#FFFBF5" };
  const [mistralAnswer, setMistralAnswer] = useState([]) //maybe not the right Data-Type for UnseState, proof befor use

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainPanel.current.scrollTop = 0;
    if (
      window.innerWidth < 993 &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
      const element = document.getElementById("bodyClick");
      element.parentNode.removeChild(element);
    }
  }, [location]);

  const onSelectPdf = useCallback((fileUploadedTitle, fileUploaded) => {
    // use uploaded file and get sdg data from backend
    // set File to be shown in PdfViewer
    setFile(fileUploaded);

    axios
      .get(`${backendUrl}/data_initial/`.concat(fileUploadedTitle))
      .then((res) => {
        // set Keywords to be shown in PdfViewer
        setFileData(res.data);
        console.log(fileData);
      });
    // get sdg data of first page
  });

  const onPageChange = useCallback((newPageNumber) => {
    setPageNumber(newPageNumber);
  });

  React.useEffect(() => {
    if (fileData.title != "default_title") {
      axios
        .get(`${backendUrl}/data/`.concat(fileData.title, "/", pageNumber))
        .then((res) => {
          // set Keywords to be shown in PdfViewer
          setFileData(res.data);
        });
    }
  }, [pageNumber]);

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
        .then((res) =>{
          setMistralAnswer(res.data)
          console.log("Answer: ");
          console.log(res.data);
          console.log("speichere Answer in MistralAnswer");
        });
        
    } catch (error) {
      console.error("Req Fehler", error);
    }
  }

  // filter sdgData to feed relevent attributes to child-components
  // changes per file
  const analysisData = fileData.analysis_data;

  // changes per page
  const pageData = fileData.sdg_data[pageNumber]; // data for XAI-Features
  const numPages = Object.keys(fileData.sdg_data).length;

  const keywordsAllSet = new Set();

  for (var value of Object.values(pageData)) {
    value.keywords.forEach((keyword) => keywordsAllSet.add(keyword.word));
  }
  const keywordsAll = Array.from(keywordsAllSet);

  //page state 0 means choose module from list, 1 are PDF functions
  const [pageState, setPageState] = useState(0);

  // changes per SDG if PDF-Fuctions are active
  const keywords = sdgActive !== null ? pageState==1? pageData[sdgActive].keywords : [] : []; // if sdg is active return the keywords else return emplty list
  const sequences = sdgActive !== null ? pageState==1? pageData[sdgActive].sequences : [] : [];

  //only for demo
  const [sentRequest, setSentRequest] = useState(false);

  const [moduleChosen, setModuleChosen] = useState();

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
  

  /*React.useEffect(() => {
        if (moduleChosen) {
          console.log("Aktualisiertes moduleChosen:", moduleChosen);
          // Hier kannst du den Wert weitergeben oder darauf reagieren
        }
      }, [moduleChosen]);*/

  //change all relevant state for Xai Features if active SDG changes
  const [nlExplanation, setNlExplanation] = useState("no sdg chosen");

  const changeSDGActive = (sdgNumber) =>{
    setSdgActive (Number(sdgNumber))
    console.log("mistralAnswer: " + toString(mistralAnswer))
    const sdgExplanation = mistralAnswer.find(
      (object) => object.sdg_number == String(sdgNumber) // String-Vergleich für `sdg_number`
    )?.explanation;
  
    if (sdgExplanation) {
      setNlExplanation(sdgExplanation); // Erklärung setzen, wenn gefunden
    } else {
      setNlExplanation("No explanation available."); // Fallback
    }
  }

  return (
    <div className="wrapper">
      <Container fluid>
      <MainNavbar
          dashboardState={pageState}
          changeDashboardState={(newState)=>{
            if (newState !== pageState) {
              console.log("Changing dashboardState to:", newState);
              setPageState(newState);
            }
          }}
        />
      </Container>
      <div ref={mainPanel}>
        
        <div className="content">
          <Container fluid>
            {pageState==1?(<UploadNavbar onSelectPdf={onSelectPdf} />):(
              <Card style={cardColor}>
                <Card.Header style={cardColor}>
                  <Card.Title as="h4">Choose module and send request</Card.Title>
                </Card.Header>
                <Card.Body>
                  <ChooseModule
                    setSentRequest={setSentRequest}
                    sendRequest={sendModelReq}
                    chooseModule={chooseModule}
                    moduleChosen={moduleChosen}
                  /> 
                </Card.Body>
              </Card>
            )}
          </Container>
          <Container fluid>
            <Row>
            {pageState==1?
              <Col md="8">
                <Card style={cardColor}>
                  <Card.Header style={cardColor}>
                    <Card.Title as="h4">{fileData.title}</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <PdfViewer
                      file={file}
                      numPages={numPages}
                      pageNumber={pageNumber}
                      keywordsAll={keywordsAll}
                      keywords={keywords}
                      sequences={sequences}
                      sdgActive={sdgActive}
                      onPageChange={onPageChange}
                    />
                  </Card.Body>
                </Card>
              </Col>:(null)}
              {pageState==1?<Col md="4">
                <Card style={cardColor}>
                  <Card.Header style={cardColor}>
                    <Card.Title as="h4">SDGs</Card.Title>
                  </Card.Header>
                  <Card.Body>
                  <OldXaiFeatures
                    sdgActive={sdgActive}
                    pageData={pageData}
                    setSdgActive={setSdgActive}
                    />
                  
                  </Card.Body>
                </Card>
              </Col>:sentRequest?
              <Col md="12">
                <Card style={cardColor}>
                  <Card.Header style={cardColor}>
                    <Card.Title as="h4">Results for {moduleChosen.titelde}/{moduleChosen.titelen} sent by mistral</Card.Title>
                  </Card.Header>
                  <Card.Body>
                  {/*later: only shown when request was send and request-answer is not empty*/}
                  <XaiFeatures
                      sdgActive={sdgActive}
                      setSdgActive={changeSDGActive}
                      mistralAnswer = {mistralAnswer}
                      nlExplanation={nlExplanation}
                      moduleNr={moduleChosen.modulnummer}
                 />
                  </Card.Body>
                </Card>
              </Col>:(null)}
            </Row>
            <Row>
              <Col>
              {pageState==1?
                <Card style={cardColor}>
                  <Card.Header style={cardColor}>
                    <Card.Title as="h4">Analysis</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <PdfAnalysis analysisData={analysisData} />
                  </Card.Body>
                </Card>:sentRequest?
                <Card style={cardColor}>
                  <Card.Header style={cardColor}>
                    <Card.Title as="h4">Missing SDGs Feedback</Card.Title>
                  </Card.Header>
                  <Card.Body>
                  {/*later: only shown when request was send and request-answer is not empty*/}
                  <MissingSDGFeedback sdgMissing={[2,3,5,6,7,9,10,12,13,15,16,17]}/>
                  </Card.Body>
                </Card>:(null)}
              </Col>
            </Row>
          </Container>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Dashboard;
