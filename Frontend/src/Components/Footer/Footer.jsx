import React from "react";
import { Container, Navbar } from "react-bootstrap";

const Footer = () => {
  return (
    <>
      <Navbar variant="dark" style={{ backgroundColor: "#3BB4A1" }}>
        <Container className="mx-auto w-100 d-flex justify-content-center">
          <div className="text-center" style={{ fontFamily: "Montserrat, sans-serif", color: "white" }}>
            Copyright &copy; 2025 SkillSwap. Made with love by Nishita, Keerti, Smriti.
          </div>
        </Container>
      </Navbar>
    </>
  );
};

export default Footer;
