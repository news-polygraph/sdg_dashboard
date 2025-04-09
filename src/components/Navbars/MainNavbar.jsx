import React from "react";
import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";

function MainNavbar() {
  return (
    <Navbar expand="lg" style={{ backgroundColor: "#F7EFE5" }}>
      <Container fluid>
        <div className="d-flex justify-content-center align-items-center ml-2 ml-lg-0">
          <Navbar.Brand
            href="#home"
            onClick={(e) => e.preventDefault()}
            className="mr-2"
          >
            SDG Demonstrator
          </Navbar.Brand>
        </div>
      </Container>
    </Navbar>
  );
}

export default MainNavbar;
