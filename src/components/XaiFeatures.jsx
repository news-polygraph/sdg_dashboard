/* eslint-disable react/forbid-prop-types */
import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProgressBar from "react-bootstrap/ProgressBar";
import { VictoryPie, VictoryLabel } from "victory";
import PropTypes from "prop-types";
import { sdgIcons, sdgColors, fileDataDefault } from "./utils.js";

class XaiFeatures extends Component {
  constructor(props) {
    super(props);
    const { setSdgActive } = this.props;
    // parent function
    this.setSdgActive = setSdgActive;
  }

  render() {
    const { sdgActive, pageData } = this.props; // needs to be called here to be updated when State changes
    const sdgActiveColor =
      sdgActive !== null ? sdgColors[sdgActive] : "#F7EFE5";
    const activeData =
      sdgActive !== null
        ? pageData[sdgActive]
        : { score: 0.1, factuality: 0.0, tense: 0.1, category: null, context : {impact: "", pro:"", con:""}}; // default values if no sdg is selected
    const { score, factuality, tense, category, summary } = activeData;
    const context = activeData.hasOwnProperty('context') ? activeData.context : {"impact_type":"","pro":"","con":""};
    let sdgLocked = false 
    return (
      <>
        <Container // SDG Icons
          fluid="sm"
          style={{ maxWidth: "600px" }}
        >
          <Row>
            {sdgIcons.map(({ key, sdgIcon }) => (
              <Col md={4} lg={3} xl={2} key={key} className="p-0">
                <img
                  className="sdgIcon img-fluid"
                  src={sdgIcon}
                  key={key}
                  alt={"sdg_icon_".concat(key)}
                  style={{
                    objectFit: "contain",
                    paddingLeft: "0px", // remove style
                    filter:
                      key === sdgActive
                        ? "grayscale(0%)" // if sdg is selected normal color
                        : pageData[key].score > 0
                          ? "grayscale(50%)" // if sdg has a positive score but not selected less color intensity
                          : "grayscale(100%)", // if score is 0 and not selected show black&white icon
                  }}
                  onMouseEnter={() => this.setSdgActive(key)}
                  onMouseDown={() => sdgLocked = true} 
                  onMouseLeave={() => {
                    if (sdgLocked == false){
                      this.setSdgActive(null)
                    }
                  }}
                />
              </Col>
              //
            ))}
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
              {/* Category */}

              <div style={{margin: "30px 0"}}>
                  <div>Summary</div>
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
                          {summary}
                      </div>
                  </div>
              </div>
              <div style={{margin: "30px 0"}}>
                  <div>Impact Type</div>
                  <div
                      style={{
                          display: "flex",
                          background: "#F7EFE5", // "#e9ecef", // Default background color
                          borderRadius: "7px",
                          fontSize: "12px",
                          overflow: "hidden",
                      }}
                  >
                      <div
                          style={{
                              flexGrow: 1,
                              padding: "2px 5px",
                              margin: 0, // Ensure no margin between divs
                              borderRadius: "5px 0 0 5px", // Only round the left corners of the first div
                              background:
                                  context.impact_type === "A" ? sdgActiveColor : "transparent",
                              color: context.impact_type === "A" ? "white" : "black",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                          }}
                      >
                          <b>A</b>ct to avoid harm
                      </div>
                      <div
                          style={{
                              flexGrow: 1,
                              padding: "2px 5px",
                              margin: 0,
                              background:
                                  context.impact_type === "B" ? sdgActiveColor : "transparent",
                              color: context.impact_type === "B" ? "white" : "black",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                          }}
                      >
                          <b>B</b>enefit stakeholders
                      </div>
                      <div
                          style={{
                              flexGrow: 1,
                              padding: "2px 5px",
                              margin: 0,
                              background:
                                  context.impact_type === "C" ? sdgActiveColor : "transparent",
                              color: context.impact_type === "C" ? "white" : "black",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                          }}
                      >
                          <b>C</b>ontribute to solutions
                      </div>
                  </div>
              </div>
              <div style={{margin: "30px 0"}}>
                  <div>Pro:</div>
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
                           {context.pro}
                       </div>
                   </div>
                   <div>Con:</div>
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
                           {context.con}
                       </div>
                   </div>
              </div>
          </Container>
      </>
    );
  }
}

XaiFeatures.defaultProps = {
    sdgData: fileDataDefault.sdg_data,
};
XaiFeatures.propTypes = {
    /* eslint-disable react/prop-types */
    sdgData: PropTypes.any,
};

export default XaiFeatures;
