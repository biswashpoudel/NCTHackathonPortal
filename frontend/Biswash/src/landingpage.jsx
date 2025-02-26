import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronRight, FaChevronDown, FaUserLock, FaUserPlus, FaMapMarkedAlt, FaPhoneAlt, FaEnvelope, FaHome, FaSignInAlt } from "react-icons/fa"; 
import { AiOutlineDoubleRight } from "react-icons/ai";
import "./LandingPage.css";
import logo from "./assets/logo.png"; 


const LandingPage = () => {
  const [openFAQ, setOpenFAQ] = useState(null);


  const faqs = [
    { question: "What is a hackathon?", answer: "A hackathon is an event where individuals, typically programmers, designers, and problem-solvers, collaborate intensively over a short period of time to create software solutions or products. It encourages creativity, teamwork, and rapid prototyping, often centered around solving specific challenges or themes."
    },
    { question: "Who can participate?", answer: "Anyone currently attending Niagara College Canada or GUS Canada College with an interest in coding, design, innovation, or problem-solving is eligible to participate. Whether you're an experienced coder or just starting out, all skill levels are welcome." },
    { question: "Is there a participation fee?", answer: "The hackathon organized by Niagara College Toronto (NCT) is free to participate in. We believe in making the event accessible to all interested individuals without any financial barriers." },
    { question: "Do I need a team to participate?", answer: "Yes, you are required to form a team of 5 members to participate in this hackathon event. This encourages collaboration and diverse problem-solving approaches, as each member can contribute unique skills and perspectives." },
    { question: "What should I bring to a hackathon?", answer: "Participants should bring their laptop, charger, and any other tools or resources necessary for software development." },
    { question: "Are there prizes for winners?", answer: "Yes! We offer exciting prizes for the winning teams, which may include awards, mentorship opportunities, and potential job placements with partner companies." },
    { question: "Can beginners join?", answer: "Absolutely! Hackathons are a great way to learn and collaborate with others." },
    { question: "How do I register for a hackathon?", answer: "To register for the hackathon, simply visit our event portal and click on the 'Register' or 'Get Started' button. Fill out the required details, and you’ll be all set to participate." },
    { question: "Will food be provided?", answer: "Yes, we hackathons provide meals, snacks and refreshments to participants." },
    { question: "How long do hackathons last?", answer: "Hackathons typically last between 24 to 48 hours; however, we will provide details about the hackathons before they begin. " }
  ];

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="landing-container">
      <nav className="landing-navbar">
      <Link to="/" className="logo-wrapper">  
        <div className="logo-container">
         <img src={logo} alt="Hackathon Portal Logo" className="logo-image"/>
        </div>
      </Link>
        
        
        <div className="nav-buttons">
          {/* <Link to="/register" className="cta-button" style={{ display: "flex", alignItems: "center", gap: "5px" }}> 
          <FaUserPlus style={{ fontSize: "1.1rem" }} />
          Register
          </Link> */}
          
          <Link to="/login" className="cta-button" style={{ display: "flex", alignItems: "center", gap: "5px" }}> 
          <FaUserLock style={{ fontSize: "1.1rem" }} />
          Login 
          </Link>
        </div>
      </nav>

      <header className="hero">
        <h1>Welcome to NCT Coding Club Hackathon Portal</h1>
        <p> Participate in the hackathons and showcase your skills!</p>
        <div className="getstarted-button">  
          <Link to="/register" className="cta-button" style={{ display: "flex", alignItems: "center", gap: "5px" }}> 
          Get Started 
          <AiOutlineDoubleRight style={{fontSize:"1.2 rem", fontWeight:"bolder"}} />
          </Link>
        </div>
      </header>

  <section className="features">
  <div className="feature">
    <img src="https://media.istockphoto.com/id/1788138969/photo/senior-developers-in-a-coworking-space.jpg?s=612x612&w=0&k=20&c=Wk7OuPw8IcwtoxB2VtrTL0sRlLe3eFYXSZLbUwFARXM=" alt="Find Hackathons" />
    <h2>Find Hackathons</h2>
    <p>Discover and participate in exciting hackathons.</p>
  </div>

  <div className="feature">
    <img src="https://trafft.com/wp-content/uploads/2022/11/mentorship-768x404.jpg" alt="Team Collaboration" />
    <h2>Team Collaboration</h2>
    <p>Form teams, manage members, and collaborate effectively.</p>
  </div>

  <div className="feature">
    <img src="https://www.awa.asn.au/hs-fs/hubfs/mentoring%20banners.jpg?width=1300&height=495&name=mentoring%20banners.jpg" alt="Mentor Guidance" />
    <h2>Mentor Guidance</h2>
    <p>Get assigned to experienced mentors for project feedback.</p>
  </div>

  <div className="feature">
    <img src="https://img.freepik.com/premium-vector/progress-journey-success-achieve-goal-business-step-career-path-mission-challenge-succeed-improvement-concept-ambitious-businessman-run-progress-bar-achieve-success-flag_940574-224.jpg" alt="Live Leaderboard" />
    <h2>Live Leaderboard</h2>
    <p>Track your progress and see where your team stands.</p>
  </div>

  <div className="feature">
    <img src="https://www.bsr.org/images/jcogs/cache/2020-10-06-reporting-hero_-_28de80_-_abe2eb138c8e6d827e220418a09e903026804d11.jpg" alt="Post-Hackathon Reports" />
    <h2>Post-Hackathon Reports</h2>
    <p>Access team rankings, feedback summaries, and analytics.</p>
  </div>

  <div className="feature">
    <img src="https://img.freepik.com/premium-vector/employee-recognition-proud-workers-month-business-concept-flat-style-design-vector_503038-3930.jpg" alt="Certificates & Recognition" />
    <h2>Certificates & Recognition</h2>
    <p>Receive digital certificates for participation and achievements.</p>
  </div>
</section>

<section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <br></br>
        <div className="faq-container">
          {faqs.map((faq, index) => (
            <div className="faq-item" key={index}>
              <button className="faq-question" onClick={() => toggleFAQ(index)}>
                {faq.question}
                <span className={`arrow ${openFAQ === index ? "rotate" : ""}`}>
                  {openFAQ === index ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              </button>
              <div className={`faq-answer ${openFAQ === index ? "open" : ""}`}>
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </section>
  <footer className="footer">
  <div className="footer-container">
    <div className="footer-info">
      <h3>Contact Us</h3>
      <p><FaEnvelope /> support@hackathonportal.com</p>
      <p><FaPhoneAlt /> +1 (123) 456-7890</p>
      <p><FaMapMarkedAlt />740 Bathurst St, Toronto, ON M5S 2R6</p>
      
      <h3> Sitemap</h3>
      <div className="footer-nav">
        <Link to="/login"><FaSignInAlt /> Login</Link>
        <Link to="/register"><FaUserPlus /> Register</Link>
      </div>
    </div>
    <div className="footer-map">
      <h3>Find Us</h3>
      <iframe
        title="Directions to our campus"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d721.560374106449!2d-79.41224232397208!3d43.66394706369505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b35e6cf8a7dfb%3A0xd32ac461151e9041!2sNiagara%20College%20%E2%80%93%20Toronto%20Mirvish%20Campus!5e0!3m2!1sen!2sca!4v1682538965360!5m2!1sen!2sca"
        width="400"
        height="300"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  </div>
</footer>
    </div>
  );
};

export default LandingPage;