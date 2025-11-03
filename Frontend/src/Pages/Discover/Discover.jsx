import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../util/UserContext";
import axios from "axios";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import ProfileCard from "./ProfileCard";
import "./Discover.css";
import Search from "./Search";
import Spinner from "react-bootstrap/Spinner";

const Discover = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [discoverUsers, setDiscoverUsers] = useState([]);
  const [webDevUsers, setWebDevUsers] = useState([]);
  const [mlUsers, setMlUsers] = useState([]);
  const [otherUsers, setOtherUsers] = useState([]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await axios.get(`/user/registered/getDetails`);
        console.log(data.data);
        setUser(data.data);
        localStorage.setItem("userInfo", JSON.stringify(data.data));
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        }
        localStorage.removeItem("userInfo");
        setUser(null);
        await axios.get("/auth/logout");
        navigate("/login");
      }
    };

    const getDiscoverUsers = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/user/discover");
        console.log(data);
        setDiscoverUsers(data.data.forYou || []);
        setWebDevUsers(data.data.webDev || []);
        setMlUsers(data.data.ml || []);
        setOtherUsers(data.data.others || []);
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        }
        localStorage.removeItem("userInfo");
        setUser(null);
        await axios.get("/auth/logout");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();
    getDiscoverUsers();
  }, [navigate, setUser]);

  const NoUsersMessage = ({ message }) => (
    <div className="no-users-message">
      <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
      <div>{message}</div>
      <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
        Check back later for more users to connect with!
      </div>
    </div>
  );

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (loading) {
    return (
      <div className="discover-page">
        <div className="loading-container">
          <Spinner animation="border" variant="primary" style={{ width: "2.5rem", height: "2.5rem" }} />
          <div className="loading-text">Discovering amazing people for you...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="discover-page">
      <div className="content-container">
        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          style={{
            display: 'none',
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 9999,
            background: '#3bb4a1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          ☰ Menu
        </button>

        <div className={`nav-bar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Nav defaultActiveKey="/home" className="flex-column">
            <Nav.Link href="#for-you" className="navlink" id="foryou">
              For You
            </Nav.Link>
            <Nav.Link href="#popular" className="navlink" id="popular1">
              Popular
            </Nav.Link>
            <Nav.Link href="#web-development" className="navlink">
              Web Development
            </Nav.Link>
            <Nav.Link href="#machine-learning" className="navlink">
              Machine Learning
            </Nav.Link>
            <Nav.Link href="#others" className="navlink">
              Others
            </Nav.Link>
          </Nav>
        </div>
        
        <div className="heading-container">
          {/* Search Bar */}
          <Search />

          {/* For You Section */}
          <h1 id="for-you" className="section-title for-you">
            For You
          </h1>
          <div className="profile-cards">
            {discoverUsers && discoverUsers.length > 0 ? (
              discoverUsers.map((user, index) => (
                <ProfileCard
                  key={`foryou-${index}`}
                  profileImageUrl={user?.picture}
                  name={user?.name}
                  rating={user?.rating || 5}
                  bio={user?.bio}
                  skills={user?.skillsProficientAt || []}
                  username={user?.username}
                />
              ))
            ) : (
              <NoUsersMessage message="No personalized recommendations yet" />
            )}
          </div>

          {/* Popular Section */}
          <h1 id="popular" className="section-title">
            Popular
          </h1>

          {/* Web Development Section */}
          <h2 id="web-development" className="section-subtitle">
            Web Development
          </h2>
          <div className="profile-cards">
            {webDevUsers && webDevUsers.length > 0 ? (
              webDevUsers.map((user, index) => (
                <ProfileCard
                  key={`webdev-${index}`}
                  profileImageUrl={user?.picture}
                  name={user?.name}
                  rating={4}
                  bio={user?.bio}
                  skills={user?.skillsProficientAt || []}
                  username={user?.username}
                />
              ))
            ) : (
              <NoUsersMessage message="No web developers found" />
            )}
          </div>

          {/* Machine Learning Section */}
          <h2 id="machine-learning" className="section-subtitle">
            Machine Learning
          </h2>
          <div className="profile-cards">
            {mlUsers && mlUsers.length > 0 ? (
              mlUsers.map((user, index) => (
                <ProfileCard
                  key={`ml-${index}`}
                  profileImageUrl={user?.picture}
                  name={user?.name}
                  rating={4}
                  bio={user?.bio}
                  skills={user?.skillsProficientAt || []}
                  username={user?.username}
                />
              ))
            ) : (
              <NoUsersMessage message="No machine learning experts found" />
            )}
          </div>

          {/* Others Section */}
          <h2 id="others" className="section-subtitle">
            Others
          </h2>
          <div className="profile-cards">
            {otherUsers && otherUsers.length > 0 ? (
              otherUsers.map((user, index) => (
                <ProfileCard
                  key={`others-${index}`}
                  profileImageUrl={user?.picture}
                  name={user?.name}
                  rating={4}
                  bio={user?.bio}
                  skills={user?.skillsProficientAt || []}
                  username={user?.username}
                />
              ))
            ) : (
              <NoUsersMessage message="No other specialists found" />
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Discover;