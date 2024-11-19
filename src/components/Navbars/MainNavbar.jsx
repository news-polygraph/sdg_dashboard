import React from "react";
import { Navbar, Container, Nav, Dropdown, Button} from "react-bootstrap";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function MainNavbar({
  dashboardState,//State von Dashboard, bestimmt welche Cards angezeigt werden
  changeDashboardState
}) {
  return (
    <Navbar className="justify-content-between" style={{ backgroundColor: "#F7EFE5" }}>
      <Container fluid>
          <Row>
            <Col>
              <Navbar.Brand
                href="#home"
                onClick={(e) => e.preventDefault()}
                className="mr-2"
              >
                SDG Dashboard Test
              </Navbar.Brand>
            </Col>
            <Col xs="auto">
              <Button variant="outline-secondary" onclick={changeDashboardState(dashboardState==0?1:0)}>Change Mode</Button>
            </Col>
          </Row>
      </Container>
    </Navbar>
  );
}

export default MainNavbar;
