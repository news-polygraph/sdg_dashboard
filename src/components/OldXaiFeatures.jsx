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
        : { score: 0.1, factuality: 0.0, tense: 0.1, category: null }; // default values if no sdg is selected
    const { score, factuality, tense, category, nl_explanation } = activeData;

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
                  onMouseEnter={() => this.setSdgActive(key)}
                  onMouseLeave={() => this.setSdgActive(null)}
                />
              </Col>
              //
            ))}
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
        <div
            style={{
              margin: "30px 0",
            }}
          >
          /*  <div>Factuality</div>
            <ProgressBar
              now={Math.round(factuality * 100)}
              label={`${Math.round(factuality * 100)}%`}
              style={{
                height: "25px",
                backgroundColor: "#F7EFE5",
                // color: "balck",
              }}
            />
          </div>

          {/* Tense */}

          <div style={{ margin: "30px 0" }}>
            <div>Tense</div>
            <div style={{ position: "relative" }}>
              <ProgressBar
                now={Math.round(tense * 100)}
                style={{
                  height: "25px", // Set the height of the ProgressBar
                  backgroundColor: "#F7EFE5",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "25px", // Same height as the ProgressBar
                  display: "flex",
                  alignItems: "center", // Vertically center the content
                  top: "0",
                  left: "0",
                  fontSize: "12px",
                  color: "#343a40",
                }}
              >
                <div
                  style={{
                    width: "33.33%",
                    textAlign: "center",
                    zIndex: 2,
                    color: tense < 0.2 ? "black" : "white",
                  }}
                >
                  Future
                </div>
                <div
                  style={{
                    width: "33.33%",
                    textAlign: "center",
                    zIndex: 2,
                    color: tense < 0.5 ? "black" : "white",
                  }}
                >
                  Present
                </div>
                <div
                  style={{
                    width: "33.33%",
                    textAlign: "center",
                    zIndex: 2,
                    color: tense < 0.7 ? "black" : "white",
                  }}
                >
                  Past
                </div>
              </div>
            </div>
          </div>

          {/* Category */}

          <div style={{ margin: "30px 0" }}>
            <div>Category</div>
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
                    category === "action" ? sdgActiveColor : "transparent",
                  color: category === "action" ? "white" : "black",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Action
              </div>
              <div
                style={{
                  flexGrow: 1,
                  padding: "2px 5px",
                  margin: 0,
                  background:
                    category === "target" ? sdgActiveColor : "transparent",
                  color: category === "target" ? "white" : "black",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Target
              </div>
              <div
                style={{
                  flexGrow: 1,
                  padding: "2px 5px",
                  margin: 0,
                  background:
                    category === "belief" ? sdgActiveColor : "transparent",
                  color: category === "belief" ? "white" : "black",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Belief
              </div>
              <div
                style={{
                  flexGrow: 1,
                  padding: "2px 5px",
                  margin: 0,
                  borderRadius: "0 5px 5px 0", // Only round the right corners of the last div
                  background:
                    category === "situation" ? sdgActiveColor : "transparent",
                  color: category === "situation" ? "white" : "black",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Situation
              </div>
            </div>
          </div>
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
}
XaiFeatures.defaultProps = {
  sdgData: fileDataDefault.sdg_data,
};
XaiFeatures.propTypes = {
  /* eslint-disable react/prop-types */
  sdgData: PropTypes.any,
};

export default XaiFeatures;


