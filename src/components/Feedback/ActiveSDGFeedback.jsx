import React, { useState, useEffect } from "react";
import PropTypes, { number } from "prop-types";
import { Container, Row, Col, Card, CardHeader, CardBody} from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import axios from "axios";

/**this component is the blue Feedback section in Xai Featueres
 * Users can Choose if the chosen sdg (sdgActive) is fitting or not and send their feedback with an explanation
 * Feedback is sent by hitting the send feedback Button
 */

function ActiveSdgFeedback ({sdgActive, moduleNr, feedbackSent, moduleChosen, editorinfos, setModuleChosen}){

	//backend URL
	const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001"; 

	//calls backend function which sends feedback to database
	const sendFeedback = (active, sdg, explanation, modulnr) => {
		//feedback object is sent like this
		const feedback = {
			"chosen": active,
			"sdg": sdg,
			"explanation": explanation
		}
		try {
		  axios
			.post(`${backendUrl}/feedback/${modulnr}`, feedback)
			.then((result) =>{
				setModuleChosen((m) => ({
					...m,
					editorinfos: result.data,
				}));
			})
		} catch (error) {
		  console.error("Req Fehler", error);
		}
	}
	
	//"fit/ doesnt fit" toggle
	const [fitToggle, setFitToggle] = useState(true);
	const fitRadios = [
		{ name: 'fits', value: true},
		{ name: 'does not fit', value: false},
	];

	useEffect(() => {
		const m = moduleChosen.editorinfos.filter(e => e.sdg === sdgActive);
		if(m.length === 0) {
			setTextinput("");
			setFitToggle(true);  
			return;
		}
		setFitToggle(m[0].chosen);
		setTextinput(m[0].explanation);
	}, [sdgActive]);

	//explanation in textinput field
	const [textinput, setTextinput] = useState();
	function handleTextinput(event){
		setTextinput(event.target.value);
	}

    return (
	//(show only when sdg Active is not [])
		//button fits/not
		//text input personal explanation
		//button send feedback for active sdg 
		<Container>
			<Form>
				<Row class="row-margin-bottom">
					<Col xs={12} sm={8}>
						<ButtonGroup>
							{fitRadios.map((radio) => (
							<ToggleButton
								className="toggle-button"
								type="radio"
								value={radio.value}
								checked={fitToggle === radio.value}
								onClick={() => 
								setFitToggle(radio.value)
								}
								
							>
								{radio.name}
							</ToggleButton>
							))}
						</ButtonGroup>
					</Col>
				</Row>
				<Row class="row-margin-bottom">
					{/**Explanation textinput field*/}
					<Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
						<Form.Label>please explain briefly why you think SDG {sdgActive} fits/doesn't fit to the chosen module</Form.Label>
						<Form.Control as="textarea" placeholder="personal explanation" value={textinput} onChange={handleTextinput} />
					</Form.Group>	
				</Row>
				<Row class="row-margin-bottom">
					<Col >
						<Button className="btn-custom"
						onClick={()=>{
							sendFeedback(fitToggle,sdgActive,textinput,moduleNr);
							feedbackSent(sdgActive);
						}}
						>
							Send feedback for SDG {sdgActive}
						</Button>
					</Col>
				</Row>
			</Form> 					
		</Container>
	);
 }
ActiveSdgFeedback.propTypes = {
  sdgActive: PropTypes.number,
  moduleNr: PropTypes.number,
  feedbackSent: PropTypes.func.isRequired,
  moduleChosen: PropTypes.object,
  editorinfos: PropTypes.array.isRequired,
  setModuleChosen: PropTypes.func.isRequired,
};

export default ActiveSdgFeedback;
