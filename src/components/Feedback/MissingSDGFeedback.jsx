import React, { useEffect, useState } from "react";
import PropTypes, { number } from "prop-types";
import { Container, Row, Col, Card, CardHeader, CardBody,InputGroup } from "react-bootstrap";
import { sdgIcons, sdgColors } from "../utils.js";
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function MissingSDGFeedback ({ sdgsMissing, moduleChosen}){
	//saves the iconObjects with the same key as listed in sdgsMissing
	const missingSDGIcons = sdgsMissing
        .map(number => sdgIcons.find(icon => icon.key === number))
        .filter(Boolean);
	
	//saves for which sdgs feedback was sent
	const [sdgsFeedbackSent, setSdgsFeedbackSent] = useState([]);
	const saveInFeedbackSent = (sdgNumber) =>{
	setSdgsFeedbackSent(sdgsFeedbackSent+sdgNumber);
	}
	
	const moduleNr = moduleChosen.modulinfos.modulnummer

	const [missingSdgActive, setMissingSdgActive] = React.useState(null);
	 //saves the descriptions to all sdgs
	 const [sdgDescriptions, setSdgDescriptions] = useState([]);
	 //saves which sdg was clicked to switch back after onMouseLeave
	 const [sdgClicked, setSdgClicked] = useState("");
	 
	// URL des Backends
	const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";  

	const sendFeedback = (active, sdg, explanation, modulnr) => {
		// eigentlich sowas:
		const feedback = {
			"chosen": active,
			"sdg": sdg,
			"explanation": explanation
		}

		try {
		  axios
			.post(`${backendUrl}/feedback/${modulnr}`, feedback)
			.then((result) =>{
				console.log("Feedback Missing SDG");
			  	console.log(result.data);
			});
			
		} catch (error) {
		  console.error("Req Fehler", error);
		}
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

	//for saving and handling form textarea-input
	const [textinput, setTextinput] = useState("");

	function handleTextinput(event){
		setTextinput(event.target.value);
	}


    return (
			//missing sdg section
			//icon list missing sdgs to choose one by clicking
			//eplanations field for displaying sdg description
			//text input personal explanation (show only when missing one is chosen)
			//button send feedback for missing sdgs (show only when missing one is chosen)
		<Container>
			<Form>
				<Row class="row-margin-bottom">
					<Card>
						<CardHeader>
							<p><strong>Please check if one of the following SDGS are missing and give short feedback why.</strong></p>
							<p>Give feedback for one SDG once a time. You can repeat this as often as you want to.</p>
						</CardHeader>
						<CardBody>
							<Row class="row-padding-side">
							{missingSDGIcons.map(({key, sdgIcon}) => (
								<Col xs={3} md={2} xl={1} key={key} className="p-0">
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
										sdgsFeedbackSent.includes(key)
										?"opacity(30%)"
										:
											key === missingSdgActive
											? "grayscale(0%)" // if sdg is selected normal color
											: "grayscale(50%)" // not selected less color intensity
											
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
						</CardBody>
					</Card>
				</Row>
				<Row class="row-margin-bottom">
					<Card>
						<CardHeader>
							<Card.Title><h5>Chosen SDG description:</h5></Card.Title>
						</CardHeader>
						<CardBody>
						{activeSdgDescription.description?activeSdgDescription.description
						:"please select a SDG to read the description"}
						</CardBody>
					</Card>
				</Row>
				<Row>
					<Card>
						<CardHeader>
							Feedback for SDG {missingSdgActive} missing in module {moduleChosen?.modulinfos?.titelde}/{moduleChosen?.modulinfos?.titelen}	
						</CardHeader>
						<CardBody>
							<Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
								<Form.Label>please explain in short words why you think the SDG {missingSdgActive} would have fitted in module {moduleChosen?.modulinfos?.titelde}/{moduleChosen?.modulinfos?.titelen}	</Form.Label>
								<Form.Control as="textarea" placeholder="personal explanation" value={textinput} onChange={handleTextinput} />
							</Form.Group>
							<Row>
								<Col xs={12} sm={8}>
									<Button className="btn-custom"
										onClick={()=>{
											sendFeedback(true,missingSdgActive,textinput,moduleNr);
											saveInFeedbackSent(missingSdgActive);
										}}
									>
										Send feedback for SDG {missingSdgActive}
									</Button>
								</Col>
							</Row>
						</CardBody>
					</Card>
				</Row>	
			</Form>
						
		</Container>
	);
 }
MissingSDGFeedback.propTypes = {
  sdgsMissing: PropTypes.array,
  moduleChosen: PropTypes.object,
};

export default MissingSDGFeedback;
