import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardHeader, CardBody } from "react-bootstrap";
import PropTypes from "prop-types";
import { sdgIcons, sdgColors } from "../utils.js";
import axios from "axios";
import ActiveSdgFeedback from "components/Feedback/ActiveSDGFeedback.jsx";

function XaiFeatures ({ sdgActive, setSdgActive, sdgAnswer}){
  //saves the iconObjects with the same key as listed in sdgMissing
	const sdgIconsAnswer = sdgAnswer
  .map(number => sdgIcons.find(icon => icon.key === number))
  .filter(Boolean);
  const sdgActiveColor =
    sdgActive !== null ? sdgColors[sdgActive] : "#F7EFE5";
  const activeData = { factuality: 0.0, category: null };
  const { factuality, nl_explanation } = activeData;

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
           console.log("set SDGdescriptions");
           console.log(result.data);
         }); 
       
     } catch (error) {
       console.error("cant get descriptions", error);
     }
   }, []);
  
   
   const [activeSdgDescription, setActiveSdgDescription] = useState({}); 

   //called by clicking on an sdgIcon
   const changeSDGActiveDescription = (number) =>{
    setActiveSdgDescription(sdgDescriptions.find(sdg => sdg.number==number));
    console.log("changed activeSdgDescription to " + sdgDescriptions.find(sdg => sdg.number==number));
   };


    return (
      <>
        <Container // SDG Icons
          fluid="sm"
        >
          <Row>
            <Card>
              <CardHeader><h5>Read about the SDGs chosen by Mistral and give Feedback</h5>
              </CardHeader>
              <CardBody>
                <Row>
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
           <Row> 
            {/*display additional information (definition) about the sdg which ist hovered*/}
            <Col lg={8}>
                <Card>
                  <CardHeader>info about chosen SDG</CardHeader>
                  <CardBody>
                    <Row>
                      <Col lg={6}>
                        <h5>SDG {sdgActive} description</h5>
                      
                        {activeSdgDescription?
                        <>
                          <p>{activeSdgDescription.description}</p>
                          {/*<p>{activeSdgDescription.targets}</p>*/}
                          {activeSdgDescription.targets?.map((target)=>( <p>{target}</p>))}
                        </>
                        :<p>No sdg chosen.</p>}
                      
                      </Col>  
                      <Col lg={6}>
                        Mistrals explanation
                        {nl_explanation}
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
            </Col> 
            <Col lg={4}>
              <Card              >
                <CardHeader>
                  Feedback Active SDG {sdgActive}
                </CardHeader>
                <CardBody>
                  <ActiveSdgFeedback sdgActive={sdgActive}/>
                  
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
  sdgAnswer: PropTypes.array,
};

export default XaiFeatures;