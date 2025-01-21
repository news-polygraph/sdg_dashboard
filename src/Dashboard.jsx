import React, { useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Container,
  Row,
  Col,
  CardBody,
  CardHeader,
} from "react-bootstrap";

import MainNavbar from "components/Navbars/MainNavbar";
import UploadNavbar from "components/Navbars/UploadNavbar";
import ChooseModule from "components/ChooseModule.jsx";
import Footer from "components/Footer/Footer";

import PdfViewer from "components/PdfViewer";
import XaiFeatures from "components/Analysis/XaiFeatures";
import PdfAnalysis from "components/Analysis/PdfAnalysis";
import { fileDataDefault } from "./components/utils.js";

import { useState } from "react";
import OldXaiFeatures from "components/OldXaiFeatures.jsx";
import FeedbackSection from "components/Feedback/FeedbackSection.jsx";
import MissingSDGFeedback from "components/Feedback/MissingSDGFeedback.jsx";
import Button from "react-bootstrap/Button";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

// react-bootstrap components
// console.log("REACT_APP_BACKEND_URL:");
// console.log(process.env.REACT_APP_BACKEND_URL);

// console.log("Dashboard.jsx:");
// console.log(backendUrl);

function Dashboard() {
  const location = useLocation();
  const mainPanel = React.useRef(null);
  const [file, setFile] = React.useState(null);
  const [fileData, setFileData] = React.useState(fileDataDefault);
  const [sdgActive, setSdgActive] = React.useState(null); //which sdg is chosen in analysis Section
  const [pageNumber, setPageNumber] = React.useState(1);
  const cardColor = { backgroundColor: "#FFFBF5" };
  const [mistralAnswer, setMistralAnswer] = React.useState([]); //maybe not the right Data-Type for UnseState, proof befor use
  const [sdgsAnswer, setSdgsAnswer] = React.useState([]);
  const [missingSdgsAnswer, setMissingSdgsAnswer] = React.useState([]);

  const [finishedFeedback, setFinishedFeedback] = useState(false);
  const [loading, setLoading] = useState(false);

  //if Mistral sent answer, actualize sdgsAnswer and missingSdgsAnswer automaticly
  React.useEffect(() => {
    if (mistralAnswer) {
      const sdgsAnswerArray = [
        ...new Set(mistralAnswer.map((object) => Number(object.sdg_number))),
      ].sort(function (a, b) {
        return a - b;
      });
      setSdgsAnswer(sdgsAnswerArray);
      setMissingSdgsAnswer(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].filter(
          (sdgnumber) => !sdgsAnswerArray.includes(sdgnumber)
        )
      );
    }
  }, [mistralAnswer]);

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
    setLoading(true);
    try {
      axios.post(`${backendUrl}/model`, module.modulinfos).then((res) => {
        console.log("then");
        setMistralAnswer(res.data);
        setLoading(false);
      });
    } catch (error) {
      console.error("Req Fehler", error);
      setLoading(false);
    }
  };

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
  const keywords =
    sdgActive !== null
      ? pageState == 1
        ? pageData[sdgActive].keywords
        : []
      : []; // if sdg is active return the keywords else return emplty list
  const sequences =
    sdgActive !== null
      ? pageState == 1
        ? pageData[sdgActive].sequences
        : []
      : [];

  //only for demo
  const [sentRequest, setSentRequest] = useState(false);

  const [moduleChosen, setModuleChosen] = useState();
  const [moduleFeedback, setModuleFeedback] = useState();

  const chooseModule = useCallback(async (module) => {
    setSentRequest(false);
    try {
      const response = await axios.get(
        `${backendUrl}/modules/${module.modulnummer}`
      );
      setModuleFeedback(response.data.editorinfos);
      setModuleChosen(response.data);
    } catch (error) {
      console.error("Fehler beim Auswählen eines Moduls:", error);
    }
  }, []);

  //change all relevant state for Xai Features if active SDG changes
  const [nlExplanation, setNlExplanation] = useState("no sdg chosen");
  const [foundIn, setFoundIn] = useState();

  const changeSDGActive = (sdgNumber) => {
    const m = {
      a: "Module Title",
      b: "Learning Outcomes",
      c: "Course Content",
    };
    setSdgActive(Number(sdgNumber));
    const sdgExplanation = mistralAnswer.reduce((acc, obj) => {
      if (obj.sdg_number == String(sdgNumber)) {
        if (acc !== "") return acc + "\n\n" + obj.explanation;
        return acc + obj.explanation;
      }
      return acc;
    }, "");

    const a = [];

    const sdgFoundIn = mistralAnswer.reduce((acc, obj) => {
      if (
        obj.sdg_number == String(sdgNumber) &&
        !a.includes(m[obj.found_in] || obj.found_in)
      ) {
        a.push(m[obj.found_in] || obj.found_in);
        if (acc !== "") return acc + "\n\n" + (m[obj.found_in] || obj.found_in);
        return acc + (m[obj.found_in] || obj.found_in);
      }
      return acc;
    }, "");

    if (sdgExplanation) {
      setFoundIn(sdgFoundIn);
      setNlExplanation(sdgExplanation); // Erklärung setzen, wenn gefunden
    } else {
      setNlExplanation("No explanation available."); // Fallback
    }
  };

  if (finishedFeedback) {
    return (
      <div className="wrapper">
        <Card>
          <CardBody>
            <h4>Thank you for your Feedback!</h4>
            <p>
              If you want to give Feedback for anothe module, reload your
              browser.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  } else {
    return (
      <div className="wrapper">
        <Container fluid>
          <MainNavbar
            dashboardState={pageState}
            changeDashboardState={(newState) => {
              if (newState !== pageState) {
                setPageState(newState);
              }
            }}
          />
        </Container>
        <div ref={mainPanel}>
          <div className="content">
            <Container fluid>
              {pageState == 1 ? (
                <UploadNavbar onSelectPdf={onSelectPdf} />
              ) : (
                <Card style={cardColor}>
                  <Card.Header style={cardColor}>
                    <Card.Title as="h4">
                      Choose module and send request
                    </Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <ChooseModule
                      setSentRequest={setSentRequest}
                      sendRequest={sendModelReq}
                      chooseModule={chooseModule}
                      moduleChosen={moduleChosen}
                      setModuleChosen={setModuleChosen}
                      loading={loading}
                    />
                  </Card.Body>
                </Card>
              )}
            </Container>
            <Container fluid>
              <Row>
                {pageState == 1 ? (
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
                  </Col>
                ) : null}
                {pageState == 1 ? (
                  <Col md="4">
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
                  </Col>
                ) : sentRequest ? (
                  <Col md="12">
                    <Card style={cardColor}>
                      <Card.Header style={cardColor}>
                        <Card.Title as="h4">
                          2. Resulting SDGs for{" "}
                          {moduleChosen.modulinfos.titelde}
                          {moduleChosen.modulinfos.titelen
                            ? `/${moduleChosen.modulinfos.titelen}`
                            : ""}{" "}
                          chosen by AI model
                        </Card.Title>
                      </Card.Header>
                      <Card.Body>
                        <XaiFeatures
                          sdgActive={sdgActive}
                          setSdgActive={changeSDGActive}
                          sdgsAnswer={sdgsAnswer}
                          nlExplanation={nlExplanation}
                          foundIn={foundIn}
                          moduleChosen={moduleChosen}
                          editorinfos={moduleFeedback}
                          setModuleChosen={setModuleChosen}
                        />
                      </Card.Body>
                    </Card>
                  </Col>
                ) : null}
              </Row>
              <Row>
                <Col>
                  {pageState == 1 ? (
                    <Card style={cardColor}>
                      <Card.Header style={cardColor}>
                        <Card.Title as="h4">Analysis</Card.Title>
                      </Card.Header>
                      <Card.Body>
                        <PdfAnalysis analysisData={analysisData} />
                      </Card.Body>
                    </Card>
                  ) : sentRequest ? (
                    <Card style={cardColor}>
                      <Card.Header style={cardColor}>
                        <Card.Title as="h4">
                          2. Missing SDGs Feedback
                        </Card.Title>
                      </Card.Header>
                      <Card.Body>
                        {/*later: only shown when request was send and request-answer is not empty*/}
                        <MissingSDGFeedback
                          sdgsMissing={missingSdgsAnswer}
                          moduleChosen={moduleChosen}
                          setModuleChosen={setModuleChosen}
                        />
                      </Card.Body>
                    </Card>
                  ) : null}
                </Col>
              </Row>
              {sentRequest ? (
                <Row>
                  <Col>
                    <Container>
                      <Card>
                        <CardHeader>
                          <h4>Finished feedback</h4>
                        </CardHeader>
                        <CardBody>
                          <p>
                            <strong>
                              Have you finished your feedback for all chosen
                              SDGs?
                            </strong>
                          </p>
                          <p>
                            Have you also checked the mising SDGs if some of
                            them would have fittet too?
                          </p>
                          <Button
                            className="btn-cta"
                            onClick={() => setFinishedFeedback(true)}
                          >
                            finished feedback
                          </Button>
                        </CardBody>
                      </Card>
                    </Container>
                  </Col>
                </Row>
              ) : null}
            </Container>
          </div>
          <Footer />
        </div>
      </div>
    );
  }
}

export default Dashboard;
