import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardHeader, CardBody } from "react-bootstrap";
import PropTypes from "prop-types";
import { sdgIcons, sdgColors } from "../utils.js";
import axios from "axios";
import ActiveSdgFeedback from "components/Feedback/ActiveSDGFeedback.jsx";

function XaiFeatures ({ sdgActive, setSdgActive, sdgsAnswer, nlExplanation, moduleChosen}){
  

  //saves the iconObjects with the same key as listed in sdgMissing
	const sdgIconsAnswer = sdgsAnswer
  .map(number => sdgIcons.find(icon => icon.key === number))
  .filter(Boolean);

  const sdgActiveColor =
    sdgActive !== null ? sdgColors[sdgActive] : "#F7EFE5";

  //saves the descriptions to all sdgs
  const [sdgDescriptions, setSdgDescriptions] = useState([]);
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
           //console.log("set SDGdescriptions");
           //console.log(result.data);
         }); 
       
     } catch (error) {
       console.error("cant get descriptions", error);
     }
   }, []);
  
   
   const [activeSdgDescription, setActiveSdgDescription] = useState({}); 

   //called by clicking on an sdgIcon
   const changeSDGActiveDescription = (number) =>{
    setActiveSdgDescription(sdgDescriptions.find(sdg => sdg.number==number));
    //console.log("changed activeSdgDescription to " + sdgDescriptions.find(sdg => sdg.number==number));
   };

   

    return (
      <>
        <Container // SDG Icons
          fluid="sm"
        >
          <Row>
            <Card>
              <CardHeader><h5>Select a sdg-icon to read about the SDGs by Mistral and mistrals explanation why it fits and give feedback</h5>
              </CardHeader>
              <CardBody>
                <Row class="row-padding-side">
                  {sdgIconsAnswer.map(({ key, sdgIcon }) => (
                    <Col xs={3} sm={2}  xl={1} key={key} className="p-0">
                      <img
                        className="sdgIcon img-fluid"
                        src={sdgIcon}
                        key={key}
                        sdgId={key}
                        alt={"sdg_icon_".concat(key)}
                        style={{
                          objectFit: "contain",
                          paddingLeft: "0px", // remove style
                          filter:
                            key === sdgActive
                              ? "grayscale(0%)" // if sdg is selected normal color
                              : "grayscale(50%)" // not selected less color intensity
                                
                        }}
                        onMouseEnter={() => setSdgActive(key)}
                        onMouseLeave={() => setSdgActive(sdgClicked)}
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
                          {activeSdgDescription.targets?.map((target)=>( <p>{target}</p>))}
                        </>
                        :<p>No sdg chosen.</p>}
                      
                      </Col>  
                      <Col lg={6}>
                       <h6> Mistrals explanation </h6>
                       <p> {sdgActive?nlExplanation:"no sdg chosen"} </p>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
            </Col> 
            <Col lg={4}class="col-no-margin">
              <Card              >
                <CardHeader>
                  Feedback Active SDG {sdgActive} and module {moduleChosen?.modulinfos?.titelen}
                </CardHeader>
                <CardBody>
                {sdgActive?
                  <ActiveSdgFeedback 
                  sdgActive={sdgActive}
                  moduleNr={moduleChosen.modulinfos.modulnummer}
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
  moduleChosen: PropTypes.object
};

export default XaiFeatures;
