import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { VictoryPie, VictoryLabel } from "victory";
import PropTypes from "prop-types";
import { sdgIcons, sdgColors } from "./utils.js";

function XaiFeatures ({ sdgActive, pageData, setSdgActive }){
  const sdgActiveColor =
    sdgActive !== null ? sdgColors[sdgActive] : "#F7EFE5";
  const activeData =
    sdgActive !== null
      ? pageData[sdgActive]
      : { score: 0.1, factuality: 0.0, tense: 0.1, category: null };

  const { score, factuality, tense, category, nl_explanation } = activeData;

  const [sdgDescriptions, setSdgDescriptions] = useState(null);
  
  

    return (
      <>
        <Container // SDG Icons
          fluid="sm"
          style={{ maxWidth: "600px" }}
        >
          <Row>
            <Col lg={8}>
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
                          : pageData[key].score > 0
                            ? "grayscale(50%)" // if sdg has a positive score but not selected less color intensity
                            : "grayscale(100%)", // if score is 0 and not selected show black&white icon
                    }}
                    onMouseEnter={() => setSdgActive(key)}
                    onMouseLeave={() => setSdgActive(null)}
                  />
                  
                </Col>
              ))}
              </Row>
            </Col>
            {/*display additional information (definition) about the sdg which ist hovered*/}
            <Col>
            <h3>SDG Definition:</h3>
            
            </Col>  
          </Row>
        </Container>

        <Container
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "5px",
          }}
        >
          <svg height="150" viewBox="40 30 70 70">
            <VictoryPie
              standalone={false}
              padAngle={0} // used to hide labels
              labelComponent={<span />}
              innerRadius={17}
              width={150}
              height={150}
              data={[
                { key: "", y: Math.round(score * 100) },
                { key: "", y: 100 - Math.round(score * 100) },
              ]}
              colorScale={[sdgActiveColor, "#F7EFE5"]}
            />
            <VictoryLabel
              textAnchor="middle"
              style={{ fontSize: 10 }}
              x={75}
              y={75}
              text={`${score * 100}%`}
            />
          </svg>
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
  pageData: PropTypes.object.isRequired,
  setSdgActive: PropTypes.func.isRequired,
};

export default XaiFeatures;
