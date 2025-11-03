import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="aboutus-page">
      <div className="aboutus-wrapper">
        <div className="aboutus-content">
          {/* Text Section */}
          <div className="aboutus-left">
            <h1 className="aboutus-heading">About Us</h1>
            
            <p className="aboutus-paragraph">
              At <strong className="brand-name"> SkillSwap</strong>, we understand how expensive upskilling can be. That's
            </p>

            <p className="aboutus-paragraph">
            why we built this platform where you can exchange knowledge,  
            </p>

            <p className="aboutus-paragraph">
          grow your expertise, and network with verious like-minded learners!
            </p>

            <div className="mission-box">
              <h3 className="mission-heading">Our Mission</h3>
              <p className="mission-text">
                To make upskilling simple, accessible, and fun for everyone.
              </p>
            </div>
          </div>

          {/* Image Section */}
          <div className="aboutus-right">
            <img 
              src="/assets/images/about us.png" 
              alt="About SkillSwap" 
              className="aboutus-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;