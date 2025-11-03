
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useUser } from "../../util/UserContext";
import { toast } from "react-toastify";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import "./Profile.css";

const Profile = () => {
  const { user, setUser } = useUser();
  const [profileUser, setProfileUser] = useState(null);
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/user/registered/getDetails/${username}`);
        setProfileUser(data.data);
      } catch (error) {
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
          if (error.response.data.message === "Please Login") {
            localStorage.removeItem("userInfo");
            setUser(null);
            await axios.get("/auth/logout");
            navigate("/login");
          }
        }
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const convertDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", { month: "2-digit", year: "numeric" }).replace("/", "-");
  };

  const connectHandler = async () => {
    try {
      setConnectLoading(true);
      const { data } = await axios.post(`/request/create`, { receiverID: profileUser._id });
      toast.success(data.message);
      setProfileUser((prev) => ({ ...prev, status: "Pending" }));
    } catch (error) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
        if (error.response.data.message === "Please Login") {
          localStorage.removeItem("userInfo");
          setUser(null);
          await axios.get("/auth/logout");
          navigate("/login");
        }
      }
    } finally {
      setConnectLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-wrapper">
        <div className="loading-state">
          <Spinner animation="border" variant="primary" size="lg" />
          <span className="loading-text">Loading profile...</span>
        </div>
      </div>
    );
  }

  
// Replace your return statement with this structure:

return (
  <div className="profile-wrapper">
    {loading ? (
      <div className="loading-state">
        <Spinner animation="border" variant="primary" size="lg" />
        <span className="loading-text">Loading profile...</span>
      </div>
    ) : (
      <div className="profile-container">
        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-main">
            <img 
              src={profileUser?.picture} 
              alt="Profile" 
              className="profile-avatar" 
            />
            <div className="profile-info">
              <h1 className="profile-name">{profileUser?.name}</h1>
              <div className="profile-username">@{profileUser?.username}</div>
              
              <div className="rating">
                <div className="stars">
                  {Array.from({ length: profileUser?.rating || 5 }, (_, i) => (
                    <span key={i} className="star">⭐</span>
                  ))}
                </div>
                <span className="rating-value">{profileUser?.rating || "5"}.0</span>
              </div>

              {profileUser?.bio && (
                <p className="profile-bio">{profileUser.bio}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            {user?.username !== username ? (
              <div className="action-buttons">
                <button
                  className={`btn btn-primary ${profileUser?.status !== "Connect" ? "btn-disabled" : ""}`}
                  onClick={profileUser?.status === "Connect" ? connectHandler : undefined}
                  disabled={connectLoading || profileUser?.status !== "Connect"}
                >
                  {connectLoading ? (
                    <>
                      <Spinner size="sm" animation="border" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    profileUser?.status
                  )}
                </button>
                <Link to={`/rating/${profileUser.username}`} className="btn btn-success">
                  <span>⭐</span> Rate
                </Link>
                <Link to={`/report/${profileUser.username}`} className="btn btn-outline">
                  <span>⚠</span> Report
                </Link>
              </div>
            ) : (
              <Link to="/edit_profile" className="btn btn-edit">
                <span>✏</span> Edit Profile
              </Link>
            )}
          </div>

          {/* Portfolio Links */}
          {(profileUser?.githubLink || profileUser?.linkedinLink || profileUser?.portfolioLink) && (
            <div className="portfolio-section">
              <h3>Connect</h3>
              <div className="portfolio-links">
                {profileUser?.githubLink && (
                  <a href={profileUser.githubLink} target="_blank" rel="noopener noreferrer" title="GitHub">
                    <img src="/assets/images/github.png" alt="GitHub" />
                  </a>
                )}
                {profileUser?.linkedinLink && (
                  <a href={profileUser.linkedinLink} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                    <img src="/assets/images/linkedin.png" alt="LinkedIn" />
                  </a>
                )}
                {profileUser?.portfolioLink && (
                  <a href={profileUser.portfolioLink} target="_blank" rel="noopener noreferrer" title="Portfolio">
                    <img src="/assets/images/link.png" alt="Portfolio" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="profile-content">
          {/* Skills Section */}
          {profileUser?.skillsProficientAt?.length > 0 && (
            <div className="content-card">
              <h2>
                <span className="icon">🔧</span>
                Skills
              </h2>
              <div className="skills-grid">
                {profileUser.skillsProficientAt.map((skill, i) => (
                  <span key={i} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {profileUser?.education?.length > 0 && (
            <div className="content-card">
              <h2>
                <span className="icon">🎓</span>
                Education
              </h2>
              <div className="timeline">
                {profileUser.education.map((edu, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h4>{edu?.institution}</h4>
                      <div className="timeline-meta">
                        <span className="degree">{edu?.degree}</span>
                        {edu?.score && <span className="score">({edu.score})</span>}
                      </div>
                      <div className="timeline-date">
                        {convertDate(edu?.startDate)} - {convertDate(edu?.endDate)}
                      </div>
                      {edu?.description && <p className="timeline-desc">{edu.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {profileUser?.projects?.length > 0 && (
            <div className="content-card full-width">
              <h2>
                <span className="icon">🚀</span>
                Projects
              </h2>
              <div className="projects-grid">
                {profileUser.projects.map((project, i) => (
                  <div key={i} className="project-card">
                    <div className="project-header">
                      <h4>{project?.title}</h4>
                      <span className="project-date">
                        {convertDate(project?.startDate)} - {convertDate(project?.endDate)}
                      </span>
                    </div>
                    <p className="project-desc">{project?.description}</p>
                    {project?.techStack?.length > 0 && (
                      <div className="tech-stack">
                        {project.techStack.map((tech, j) => (
                          <span key={j} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
};

export default Profile;