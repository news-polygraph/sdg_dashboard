import React, { useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Card, Container, Row, Col, CardBody } from "react-bootstrap";

import MainNavbar from "components/Navbars/MainNavbar";
import UploadNavbar from "components/Navbars/UploadNavbar";
import ChooseModule from "components/ChooseModule.jsx";
import Footer from "components/Footer/Footer";

import PdfViewer from "components/PdfViewer";
import XaiFeatures from "components/XaiFeatures";
import PdfAnalysis from "components/PdfAnalysis";
import { fileDataDefault } from "./components/utils.js";

import { useState } from 'react';
import OldXaiFeatures from "components/OldXaiFeatures.jsx";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

console.log("REACT_APP_BACKEND_URL:");
console.log(process.env.REACT_APP_BACKEND_URL);

console.log("Dashboard.jsx:");
console.log(backendUrl);

// react-bootstrap components
function Dashboard() {
  const location = useLocation();
  const mainPanel = React.useRef(null);
  const [file, setFile] = React.useState(null);
  const [fileData, setFileData] = React.useState(fileDataDefault);
  const [sdgActive, setSdgActive] = React.useState(null);
  const [pageNumber, setPageNumber] = React.useState(1);
  const cardColor = { backgroundColor: "#FFFBF5" };

  //page state 0 means choose module from list, 1 are PDF functions
  const [pageState, setPageState] = useState(0);

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
    //  use uploaded file and get sdg data from backend
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

    // if (fileData.title != "default_title") {
    //   axios
    //     .get(
    //       `${backendUrl}/data/`.concat(fileData.title, "/", pageNumber)
    //     )
    //     .then((res) => {
    //       // set Keywords to be shown in PdfViewer
    //       setFileData(res.data);
    //     });
    // }
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

  // changes per SDG
  //const keywords = sdgActive !== null ? pageData[sdgActive].keywords : []; // if sdg is active return the keywords else return emplty list
  //const sequences = sdgActive !== null ? pageData[sdgActive].sequences : [];

  return (
    <div className="wrapper">
      <div ref={mainPanel}>
        <MainNavbar
          dashboardState={pageState}
          changeDashboardState={(newState)=>{
            if (newState !== pageState) {
              console.log("Changing dashboardState to:", newState);
              setPageState(newState);
            }
          }}
        />
        
        <div className="content">
          <Container fluid>
            {pageState==1?(<UploadNavbar onSelectPdf={onSelectPdf} />):(
              <Card style={cardColor}>
                <Card.Header style={cardColor}>
                  <Card.Title as="h4">Choose module and send request</Card.Title>
                </Card.Header>
                <Card.Body>
                  <ChooseModule></ChooseModule>
                </Card.Body>
              </Card>
            )}
          </Container>
          <Container fluid>
            <Row>
            {pageState==1?(
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
              </Col>):(null)}
              {pageState==1?(<Col md="4">
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
              </Col>):
              (<Col md="12">
                <Card style={cardColor}>
                  <Card.Header style={cardColor}>
                    <Card.Title as="h4">SDGs</Card.Title>
                  </Card.Header>
                  <Card.Body>
                  <XaiFeatures
                      sdgActive={sdgActive}
                      setSdgActive={setSdgActive}
                    />
                  </Card.Body>
                </Card>
              </Col>)}
            </Row>
            <Row>
              <Col>
                <Card style={cardColor}>
                  <Card.Header style={cardColor}>
                    <Card.Title as="h4">Analysis</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <PdfAnalysis analysisData={analysisData} />
                  </Card.Body>
                </Card>
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
