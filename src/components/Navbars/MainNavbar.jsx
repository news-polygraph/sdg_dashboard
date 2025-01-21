import React from "react";
import { Navbar, Container, Nav, Dropdown, Button, Stack, Row, Col} from "react-bootstrap";

function MainNavbar({
  dashboardState,//State von Dashboard, bestimmt welche Cards angezeigt werden
  changeDashboardState,
}) {
  return (
    
      <Navbar style={{ backgroundColor: "#F7EFE5" }} expanded="true" variant="dark" class="navbar" >
        
          
            <Navbar.Brand
              href="#home"
              onClick={(e) => e.preventDefault()}
              
            >
              SDG Dashboard Test
            </Navbar.Brand>
          
          
            <Button  variant="outline-secondary" onClick={() => changeDashboardState(dashboardState === 0 ? 1 : 0)}>Change Mode</Button>
          
        
      </Navbar>
   
  );
}

export default MainNavbar;
