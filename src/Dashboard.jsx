import React, { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Card, Container, Row, Col } from "react-bootstrap";
import { grid } from 'ldrs';
grid.register('loading-grid')
import MainNavbar from "components/Navbars/MainNavbar";
import UploadNavbar from "components/Navbars/UploadNavbar";
import Footer from "components/Footer/Footer";

import PdfViewer from "components/PdfViewer";
import XaiFeatures from "components/XaiFeatures";
import PdfAnalysis from "components/PdfAnalysis";
import { fileDataDefault } from "./components/utils.js";

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
  const [loading, setLoading] = useState(false);
  const cardColor = { backgroundColor: "#FFFBF5" };

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
    setLoading(true); // Start Loading animation  
    axios
      .get(`${backendUrl}/data_initial/`.concat(fileUploadedTitle))
      .then((res) => {
        // set Keywords to be shown in PdfViewer
        setFileData(res.data);
        console.log("Data Initial:")
        console.log(fileData);
        setLoading(false);
      });
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

  // filter sdgData to feed relevent attributes to child-components
  // changes per file
  const analysisData = fileData.analysis_data;

  // changes per page
  const pageData = fileData.sdg_data[pageNumber]; // data for XAI-Features
  console.log(pageData)
  const numPages = Object.keys(fileData.sdg_data).length;

  const keywordsAllSet = new Set();

  for (var value of Object.values(pageData)) {
    value.keywords.forEach((keyword) => keywordsAllSet.add(keyword.word));
  }
  const keywordsAll = Array.from(keywordsAllSet);

  // changes per SDG
  const keywords = sdgActive !== null ? pageData[sdgActive].keywords : []; // if sdg is active return the keywords else return emplty list
  const sequences = sdgActive !== null ? pageData[sdgActive].sequences : [];

  return (
    <div className="wrapper">
      <div ref={mainPanel}>
        <MainNavbar />
        <UploadNavbar onSelectPdf={onSelectPdf} />
        <div className="content">
          <Container fluid>
            <Row>
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
              <Col md="4">
                <Card style={cardColor}>
                  <Card.Header style={cardColor}>
                    <Card.Title as="h4">SDGs</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    {loading ? ( 
                      <loading-grid color="black"></loading-grid> 
                    ):(
                      <XaiFeatures
                        sdgActive={sdgActive}
                        pageData={pageData}
                        setSdgActive={setSdgActive}
                      />
                    )}
                  </Card.Body>
                </Card>
              </Col>
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
