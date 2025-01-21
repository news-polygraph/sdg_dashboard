import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardHeader, CardBody } from "react-bootstrap";
import PropTypes from "prop-types";
import { sdgIcons, sdgColors } from "../utils.js";
import axios from "axios";
import ActiveSdgFeedback from "components/Feedback/ActiveSDGFeedback.jsx";

function XaiFeatures ({ sdgActive, setSdgActive, sdgsAnswer, nlExplanation, foundIn, moduleChosen, editorinfos, setModuleChosen}){

  //saves the iconObjects with the same key as listed in sdgMissing
	const sdgIconsAnswer = sdgsAnswer
  .map(number => sdgIcons.find(icon => icon.key === number))
  .filter(Boolean);

  //saves for which sdgs feedback was sent
  const [sdgsFeedbackSent, setSdgsFeedbackSent] = useState([]);
  const saveInFeedbackSent = (sdgNumber) =>{
    setSdgsFeedbackSent(sdgsFeedbackSent+sdgNumber);
  }

  //saves the descriptions to all sdgs
  const [sdgDescriptions, setSdgDescriptions] = useState();
  //saves which sdg was clicked to switch back after onMouseLeave
  const [sdgClicked, setSdgClicked] = useState("");
  
  //backend URL
   const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001"; 

   // function to load sdg_descriptions
   useEffect(() => {
    try {
      axios
        .get(`${backendUrl}/descriptions`)
        .then((result) =>{
          setSdgDescriptions(result.data)
        });
    } catch (error) {
      console.error("cant get descriptions", error);
    }
   }, []);
  
   
   const [activeSdgDescription, setActiveSdgDescription] = useState({}); 

   //called by clicking on an sdgIcon
   const changeSDGActiveDescription = (number) =>{
    setActiveSdgDescription(sdgDescriptions?.find(sdg => sdg.number==number));
   };

   

    return (
      <>
        <Container // SDG Icons
          fluid="sm"
        >
          <Row>
            <Card>
              <CardHeader>
                <h5>Chosen SDGs</h5>
                <p><strong>Select a sdg-icon to read about the SDGs that the AI Model has decided to fit to the given module. As soon as an SDG has been selected, an explanation of why the AI model has assigned this SDG to the module appears, as well as the possibility to give feedback on whether the SDG fits the module.</strong></p>
              </CardHeader>
              <CardBody>
                <Row class="row-padding-side">
                  {sdgIconsAnswer.map(({ key, sdgIcon }) => (
                    <Col xs={3} sm={2}  xl={1} key={key} className="p-0">
                      <img
                        className="sdgIcon img-fluid"
                        src={sdgIcon}
                        key={key}
                        alt={"sdg_icon_".concat(key)}
                        style={{
                          objectFit: "contain",
                          paddingLeft: "0px", // remove style
                          filter:
                            sdgsFeedbackSent.includes(key)
                              ?"opacity(30%)"
                              :
                              key === sdgActive
                                ? "grayscale(0%)" // if sdg is selected normal color
                                : "grayscale(70%)" // not selected less color intensity
                            
                                
                        }}
                        onMouseEnter={() => {
                          setSdgActive(key);
                          changeSDGActiveDescription(key);
                        }}
                        onMouseLeave={() => {
                          setSdgActive(sdgClicked);
                          changeSDGActiveDescription(sdgClicked);
                        }}
                        onClick={() => {
                          setSdgActive(key);
                          changeSDGActiveDescription(key);
                          setSdgClicked(key);
                        }}
                      />
                      
                    </Col>
                  ))}
                </Row>
              </CardBody>
            </Card>
          </Row>
           <Row class="row-padding-side row-margin-bottom"> 
            {/*display additional information (definition) about the sdg which ist hovered*/}
            <Col lg={8} class="col-no-margin" >
                <Card>
                  <CardHeader><h5>info about chosen SDG</h5></CardHeader>
                  <CardBody>
                    <Row>
                      <Col lg={6}>
                        <h6>SDG {sdgActive} description</h6>
                      
                        {activeSdgDescription?
                        <>
                          <p>{activeSdgDescription.description}</p>
                          {/*<p>{activeSdgDescription.targets}</p>*/}
                          {activeSdgDescription?.targets?.map((target)=>( <p>{target}</p>))}
                        </>
                        :<p>No sdg chosen.</p>}
                      
                      </Col>  
                      <Col lg={6}>
                        {sdgActive ? (
                          <>
                            <h6> AIs explanation </h6>
                            <p style={{ whiteSpace: "pre-line" }}> {nlExplanation} </p>
                            <h6> SDG Found in Section: </h6>
                            <p style={{ whiteSpace: "pre-line" }}> {foundIn} </p>
                          </>
                        ) : (
                          <></>
                        )}
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
            </Col> 
            <Col lg={4}class="col-no-margin">
              <Card className="feedback-card">
                <CardHeader>
                  Feedback for SDG {sdgActive} in module {moduleChosen.modulinfos.titelde ? moduleChosen.modulinfos.titelde : moduleChosen.modulinfos.titelen}
                </CardHeader>
                <CardBody>
                {sdgActive?
                  <ActiveSdgFeedback 
                  sdgActive={sdgActive}
                  moduleNr={moduleChosen.modulinfos.modulnummer}
                  feedbackSent={saveInFeedbackSent}
                  moduleChosen={moduleChosen}
                  editorinfos={editorinfos}
                  setModuleChosen={setModuleChosen}
                  />:
                  <p>No SDG chosen</p>
                }
                </CardBody>
              </Card>
            </Col> 
          </Row>
        </Container>

        
      </>
    );
 }
XaiFeatures.propTypes = {
  sdgActive: PropTypes.number,
  setSdgActive: PropTypes.func.isRequired,
  sdgsAnswer: PropTypes.array,
  nlExplanation: PropTypes.string,
  foundIn: PropTypes.string,
  moduleChosen: PropTypes.object,
  editorinfos: PropTypes.array,
  setModuleChosen: PropTypes.func,
};

export default XaiFeatures;
