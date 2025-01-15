import React, { useState } from "react";
import PropTypes, { number } from "prop-types";
import { Container, Row, Col, Card, CardHeader, CardBody} from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import axios from "axios";

function ActiveSdgFeedback ({sdgActive, moduleNr}){	

	//backend URL
	const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001"; 

	const sendFeedback = (active, sdg, explanation, modulnr) => {
		// eigentlich sowas:
		const feedback = {
			"chosen": active,
			"sdg": sdg,
			"explanation": explanation
		}

		// bspw so:
		/*const m = {
			"chosen": true,
			"sdg": 4,
			"explanation": "test"
		}*/
		try {
		  axios
			.post(`${backendUrl}/feedback/${modulnr}`, feedback)
			.then((result) =>{
			  console.log(result.data);
			});
			
		} catch (error) {
		  console.error("Req Fehler", error);
		}
	}
	

	//fit doesnt toggle
	const [fitToggle, setFitToggle] = useState('0');

	const fitRadios = [
		{ name: 'fits', value: '0' },
		{ name: 'does not fit', value: '1' },
	];

	const [textinput, setTextinput] = useState("");

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
					<Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
						<Form.Label>please explain in short words why you think the active SDG is fitting or not fitting to the chosen module</Form.Label>
						<Form.Control as="textarea" placeholder="personal explanation" value={textinput} onChange={handleTextinput} />
					</Form.Group>	
				</Row>
				<Row class="row-margin-bottom">
					<Col >
						<Button className="btn-custom"
						onClick={()=>
							sendFeedback(true,sdgActive,textinput,moduleNr)
						}
						>
							Send feedback for active SDG
						</Button>
					</Col>
				</Row>
			</Form> 					
		</Container>
	);
 }
ActiveSdgFeedback.propTypes = {
  sdgActive: PropTypes.number,
  moduleNr: PropTypes.number
};

export default ActiveSdgFeedback;
