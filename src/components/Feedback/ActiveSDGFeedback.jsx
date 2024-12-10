import React, { useState } from "react";
import PropTypes, { number } from "prop-types";
import { Container, Row, Col, Card, CardHeader, CardBody} from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

function ActiveSdgFeedback ({sdgActive}){	
	

	//fit doesnt toggle
	const [fitToggle, setFitToggle] = useState('0');

	const fitRadios = [
		{ name: 'fits', value: '0' },
		{ name: 'does not fit', value: '1' },
	];


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
						<Form.Control type="text" placeholder="personal explanation" />
					</Form.Group>	
				</Row>
				<Row class="row-margin-bottom">
					<Col >
						<Button className="btn-custom">
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
};

export default ActiveSdgFeedback;
