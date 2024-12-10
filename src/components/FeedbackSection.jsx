import React, { useEffect, useState } from "react";
import PropTypes, { number } from "prop-types";
import { Container, Row, Col, Card, CardHeader, CardBody,InputGroup } from "react-bootstrap";
import { sdgIcons, sdgColors } from "./utils.js";
import axios from "axios";
import Button from 'react-bootstrap/Button';
import { Label } from "recharts";
import Form from 'react-bootstrap/Form';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { Input } from "reactstrap";

function FeedbackSection ({ sdgActive, sdgMissing }){
	console.log("Props in FeedbackSection:", { sdgActive, sdgMissing });
	//saves the iconObjects with the same key as listed in sdgMissing
	const missingSDGIcons = sdgMissing
        .map(number => sdgIcons.find(icon => icon.key === number))
        .filter(Boolean);
	console.log(missingSDGIcons);
	const [missingSdgActive, setMissingSdgActive] = React.useState(null);
	 //saves the descriptions to all sdgs
	 const [sdgDescriptions, setSdgDescriptions] = useState([]);
	 //saves which sdg was clicked to switch back after onMouseLeave
	 const [sdgClicked, setSdgClicked] = useState("");
	 
	  // URL des Backends
	  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001"; 
	  //for debugging
	  if (sdgActive === null) {
		console.log("sdgActive is null");
	  }
	  
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
	 
	  //only the missing SDGs from this section
	  const [activeSdgDescription, setActiveSdgDescription] = useState({}); 
   
	  //called by clicking on an sdgIcon from the missing SDGS
	  const changeSDGActiveDescription = (number) =>{
	   setActiveSdgDescription(sdgDescriptions.find(sdg => sdg.number==number));
	   console.log("changed activeSdgDescription to " + sdgDescriptions.find(sdg => sdg.number==number));
	  };


    return (
		//TODO:
		//sdg active Section (show only when sdg Active is not [])
			//button fits/not
			//text input personal explanation
			//button send feedback for active sdg 

		//missing sdg section
			//icon list missing sdgs to choose one by clicking
			//eplanations field for displaying sdg description
			//text input personal explanation (show only when missing one is chosen)
			//button send feedback for missing sdgs (show only when missing one is chosen)
		<Container>
			<Row>
				<Col md={12} lg={6}>
					<Card>
						<CardHeader><h5>Active SDG:</h5> </CardHeader>
						<CardBody>
							<Form>
								<Row class="row-margin-bottom">
									<Col xs={12} sm={8}>
										<ToggleButtonGroup type="radio" name="sdg-fits" defaultValue={1}>
											<ToggleButton value={1} >
												fits
											</ToggleButton>
											<ToggleButton value={2} >
												does not
											</ToggleButton>
										</ToggleButtonGroup>
									</Col>
								</Row>
								<Row class="row-margin-bottom">
									<Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
										<Form.Label>please explain in short words why you think the active SDG is fitting or not fitting to the chosen module</Form.Label>
										<Form.Control type="text" placeholder="personal explanation" />
									</Form.Group>	
								</Row>
								<Row class="row-margin-bottom">
									<Col xs={12} sm={8}>
										<Button class="btn-custom btn btn-fill">
											Send feedback for active SDG
										</Button>
									</Col>
								</Row>
							</Form> 					
						</CardBody>
					</Card>
				</Col>
				<Col md={12} lg={6}>
					<Card>
						<CardHeader><h5>Missing SDGs</h5></CardHeader>
						<CardBody>
							<Form>
								<Row class="row-margin-bottom">
								{/*Missing SDG Section */}
								
								{missingSDGIcons.map(({key, sdgIcon}) => (
									<Col xs={3} md={2} xl={2} key={key} className="p-0">
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
											key === missingSdgActive
											? "grayscale(0%)" // if sdg is selected normal color
											: "grayscale(70%)" // not selected less color intensity
												
										}}
										onMouseEnter={() => setMissingSdgActive(key)}
										onMouseLeave={() => setMissingSdgActive(sdgClicked)}
										onClick={() => {
										setMissingSdgActive(key);
										changeSDGActiveDescription(key);
										setSdgClicked(key);
										}}
									/>
									
									</Col>
								))}
								</Row>
								<Row class="row-margin-bottom">
									<Card>
										<CardHeader>
											<Card.Title>Chosen SDG description</Card.Title>
										</CardHeader>
										<CardBody>{activeSdgDescription.description}</CardBody>
									</Card>
								</Row>	
								<Row class="row-margin-bottom">
									<Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
										<Form.Label>please explain in short words why you think the chosen SDG would have fitted to the chosen module</Form.Label>
										<Form.Control type="text" placeholder="personal explanation" />
									</Form.Group>		
								</Row>
								<Row class="row-margin-bottom">
									<Col xs={12} sm={8}>
										<Button class="btn-custom btn">
											Send feedback for active SDG
										</Button>
									</Col>
								</Row>

							</Form>
						</CardBody>
					</Card>
				</Col>
			</Row>
		</Container>
	);
 }
FeedbackSection.propTypes = {
  sdgActive: PropTypes.number,
  sdgMissing: PropTypes.array,
};

export default FeedbackSection;
