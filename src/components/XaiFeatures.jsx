import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardHeader, CardBody } from "react-bootstrap";
import PropTypes from "prop-types";
import { sdgIcons, sdgColors } from "./utils.js";
import axios from "axios";

function XaiFeatures ({ sdgActive, setSdgActive }){
  const sdgActiveColor =
    sdgActive !== null ? sdgColors[sdgActive] : "#F7EFE5";
  const activeData = { factuality: 0.0, category: null };

  const { factuality, nl_explanation } = activeData;

  //saves the descriptions to all sdgs
  const [sdgDescriptions, setSdgDescriptions] = useState([]);
  //saves which sdg was clicked to switch back after onMouseLeave
  const [sdgClicked, setSdgClicked] = useState("");
  
   // URL des Backends
   const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001"; 

   // function to load sdg_descriptions
   useEffect(() => {
     try {
       axios
         .get(`${backendUrl}/descriptions`)
         .then((result) =>{  
           setSdgDescriptions(result.data)//save result in sdgDescriptions
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
            <Col lg={4}>
              <Row>
              {sdgIcons.map(({ key, sdgIcon }) => (
                <Col md={4} lg={3} xl={2} key={key} className="p-0">
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
            </Col>
            {/*display additional information (definition) about the sdg which ist hovered*/}
            <Col lg={8}>
              <Card>
                <CardHeader>
                  SDG {activeSdgDescription.number} description
                </CardHeader>
                <CardBody>
                  {activeSdgDescription?
                  <>
                    <p>{activeSdgDescription.description}</p>
                    {/*<p>{activeSdgDescription.targets}</p>*/}
                    {activeSdgDescription.targets?.map((target)=>( <p>{target}</p>))}
                  </>
                  :<p>No sdg chosen.</p>}
                  
                </CardBody>
              </Card>
            
            
            </Col>  
          </Row>
        </Container>

        

        <style type="text/css">
          {`
                .progress-bar {
                    background-color: ${sdgActiveColor};
                    color: ${factuality < 0.05 ? "black" : "white"};
                    font-size: 12px;
                    }
            `}
        </style>
        <Container>
          
          <div style={{ margin: "30px 0" }}>
            <div>Natural Language Explanation</div>
            <div
              style={{
                display: "flex",
                background: "#F7EFE5",
                borderRadius: "7px",
                fontSize: "12px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "10px",
                }}
              >
                {nl_explanation}
              </div>
            </div>
          </div>
        </Container>
      </>
    );
 }
XaiFeatures.propTypes = {
  sdgActive: PropTypes.number,
  setSdgActive: PropTypes.func.isRequired,
};

export default XaiFeatures;
