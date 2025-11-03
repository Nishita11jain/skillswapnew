
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "react-bootstrap/Spinner";
import { skills } from "./Skills";
import axios from "axios";
import "./Register.css";
import { v4 as uuidv4 } from "uuid";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    portfolioLink: "",
    githubLink: "",
    linkedinLink: "",
    skillsProficientAt: [],
    skillsToLearn: [],
    education: [
      {
        id: uuidv4(),
        institution: "",
        degree: "",
        startDate: "",
        endDate: "",
        score: "",
        description: "",
      },
    ],
    bio: "",
    projects: [],
  });
  const [skillsProficientAt, setSkillsProficientAt] = useState("Select some skill");
  const [skillsToLearn, setSkillsToLearn] = useState("Select some skill");
  const [techStack, setTechStack] = useState([]);

  const [activeKey, setActiveKey] = useState("registration");

  useEffect(() => {
    setLoading(true);
    const getUser = async () => {
      try {
        const { data } = await axios.get("/user/unregistered/getDetails");
        console.log("User Data: ", data.data);
        const edu = data?.data?.education;
        edu.forEach((ele) => {
          ele.id = uuidv4();
        });
        if (edu.length === 0) {
          edu.push({
            id: uuidv4(),
            institution: "",
            degree: "",
            startDate: "",
            endDate: "",
            score: "",
            description: "",
          });
        }
        const proj = data?.data?.projects;
        proj.forEach((ele) => {
          ele.id = uuidv4();
        });
        console.log(proj);
        if (proj) {
          setTechStack(proj.map((item) => "Select some Tech Stack"));
        }
        setForm((prevState) => ({
          ...prevState,
          name: data?.data?.name,
          email: data?.data?.email,
          username: data?.data?.username,
          skillsProficientAt: data?.data?.skillsProficientAt,
          skillsToLearn: data?.data?.skillsToLearn,
          linkedinLink: data?.data?.linkedinLink,
          githubLink: data?.data?.githubLink,
          portfolioLink: data?.data?.portfolioLink,
          education: edu,
          bio: data?.data?.bio,
          projects: proj ? proj : prevState.projects,
        }));
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
          navigate("/login");
        } else {
          toast.error("Some error occurred");
        }
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const handleNext = () => {
    const tabs = ["registration", "education", "longer-tab", "Preview"];
    const currentIndex = tabs.indexOf(activeKey);
    if (currentIndex < tabs.length - 1) {
      setActiveKey(tabs[currentIndex + 1]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prevState) => ({
        ...prevState,
        [name]: checked ? [...prevState[name], value] : prevState[name].filter((item) => item !== value),
      }));
    } else {
      if (name === "bio" && value.length > 500) {
        toast.error("Bio should be less than 500 characters");
        return;
      }
      setForm((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleAddSkill = (e) => {
    const { name } = e.target;
    if (name === "skill_to_learn") {
      if (skillsToLearn === "Select some skill") {
        toast.error("Select a skill to add");
        return;
      }
      if (form.skillsToLearn.includes(skillsToLearn)) {
        toast.error("Skill already added");
        return;
      }
      if (form.skillsProficientAt.includes(skillsToLearn)) {
        toast.error("Skill already added in skills proficient at");
        return;
      }
      setForm((prevState) => ({
        ...prevState,
        skillsToLearn: [...prevState.skillsToLearn, skillsToLearn],
      }));
    } else {
      if (skillsProficientAt === "Select some skill") {
        toast.error("Select a skill to add");
        return;
      }
      if (form.skillsProficientAt.includes(skillsProficientAt)) {
        toast.error("Skill already added");
        return;
      }
      if (form.skillsToLearn.includes(skillsProficientAt)) {
        toast.error("Skill already added in skills to learn");
        return;
      }
      setForm((prevState) => ({
        ...prevState,
        skillsProficientAt: [...prevState.skillsProficientAt, skillsProficientAt],
      }));
    }
  };

  const handleRemoveSkill = (e, temp) => {
    const skill = e.target.innerText.split(" ")[0];
    if (temp === "skills_proficient_at") {
      setForm((prevState) => ({
        ...prevState,
        skillsProficientAt: prevState.skillsProficientAt.filter((item) => item !== skill),
      }));
    } else {
      setForm((prevState) => ({
        ...prevState,
        skillsToLearn: prevState.skillsToLearn.filter((item) => item !== skill),
      }));
    }
  };

  const handleRemoveEducation = (e, tid) => {
    const updatedEducation = form.education.filter((item, i) => item.id !== tid);
    setForm((prevState) => ({
      ...prevState,
      education: updatedEducation,
    }));
  };

  const handleEducationChange = (e, index) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      education: prevState.education.map((item, i) => (i === index ? { ...item, [name]: value } : item)),
    }));
  };

  const handleAdditionalChange = (e, index) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      projects: prevState.projects.map((item, i) => (i === index ? { ...item, [name]: value } : item)),
    }));
  };

  const validateRegForm = () => {
    if (!form.username) {
      toast.error("Username is empty");
      return false;
    }
    if (!form.skillsProficientAt.length) {
      toast.error("Enter atleast one Skill you are proficient at");
      return false;
    }
    if (!form.skillsToLearn.length) {
      toast.error("Enter atleast one Skill you want to learn");
      return false;
    }
    if (!form.portfolioLink && !form.githubLink && !form.linkedinLink) {
      toast.error("Enter atleast one link among portfolio, github and linkedin");
      return false;
    }
    const githubRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+(?:\/)?$/;
    if (form.githubLink && githubRegex.test(form.githubLink) === false) {
      toast.error("Enter a valid github link");
      return false;
    }
    const linkedinRegex = /^(?:http(?:s)?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+(?:\/)?$/;
    if (form.linkedinLink && linkedinRegex.test(form.linkedinLink) === false) {
      toast.error("Enter a valid linkedin link");
      return false;
    }
    if (form.portfolioLink && form.portfolioLink.includes("http") === false) {
      toast.error("Enter a valid portfolio link");
      return false;
    }
    return true;
  };

  const validateEduForm = () => {
    form.education.forEach((edu, index) => {
      if (!edu.institution) {
        toast.error(`Institution name is empty in education field ${index + 1}`);
        return false;
      }
      if (!edu.degree) {
        toast.error("Degree is empty");
        return false;
      }
      if (!edu.startDate) {
        toast.error("Start date is empty");
        return false;
      }
      if (!edu.endDate) {
        toast.error("End date is empty");
        return false;
      }
      if (!edu.score) {
        toast.error("Score is empty");
        return false;
      }
    });
    return true;
  };

  const validateAddForm = () => {
    if (!form.bio) {
      toast.error("Bio is empty");
      return false;
    }
    if (form.bio.length > 500) {
      toast.error("Bio should be less than 500 characters");
      return false;
    }
    var flag = true;
    form.projects.forEach((project, index) => {
      if (!project.title) {
        toast.error(`Title is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.techStack.length) {
        toast.error(`Tech Stack is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.startDate) {
        toast.error(`Start Date is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.endDate) {
        toast.error(`End Date is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.projectLink) {
        toast.error(`Project Link is empty in project ${index + 1}`);
        flag = false;
      }
      if (!project.description) {
        toast.error(`Description is empty in project ${index + 1}`);
        flag = false;
      }
      if (project.startDate > project.endDate) {
        toast.error(`Start Date should be less than End Date in project ${index + 1}`);
        flag = false;
      }
      if (!project.projectLink.match(/^(http|https):\/\/[^ "]+$/)) {
        toast.error(`Please provide valid project link in project ${index + 1}`);
        flag = false;
      }
    });
    return flag;
  };

  const handleSaveRegistration = async () => {
    const check = validateRegForm();
    if (check) {
      setSaveLoading(true);
      try {
        const { data } = await axios.post("/user/unregistered/saveRegDetails", form);
        toast.success("Details saved successfully");
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Some error occurred");
        }
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const handleSaveEducation = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    if (check1 && check2) {
      setSaveLoading(true);
      try {
        const { data } = await axios.post("/user/unregistered/saveEduDetail", form);
        toast.success("Details saved successfully");
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Some error occurred");
        }
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const handleSaveAdditional = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    const check3 = validateAddForm();
    if (check1 && check2 && check3) {
      setSaveLoading(true);
      try {
        const { data } = await axios.post("/user/unregistered/saveAddDetail", form);
        toast.success("Details saved successfully");
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Some error occurred");
        }
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    const check1 = validateRegForm();
    const check2 = validateEduForm();
    const check3 = validateAddForm();
    if (check1 && check2 && check3) {
      setSaveLoading(true);
      try {
        const { data } = await axios.post("/user/registerUser", form);
        toast.success("Registration Successful");
        navigate("/discover");
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Some error occurred");
        }
      } finally {
        setSaveLoading(false);
      }
    }
  };

  return (
    <div className="register_page">
      <h1>Complete Your Registration</h1>
      {loading ? (
        <div className="loading-container">
          <Spinner animation="border" variant="primary" size="lg" />
          <span className="loading-text">Loading your registration...</span>
        </div>
      ) : (
        <div className="register_section">
          <Tabs
            defaultActiveKey="registration"
            id="registration-tabs"
            className="mb-3"
            activeKey={activeKey}
            onSelect={(k) => setActiveKey(k)}
          >
            <Tab eventKey="registration" title="Basic Info">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  onChange={handleInputChange}
                  className="form-input"
                  value={form.name}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  onChange={handleInputChange}
                  className="form-input"
                  value={form.email}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  onChange={handleInputChange}
                  value={form.username}
                  className="form-input"
                  placeholder="Enter your username"
                />
              </div>

              <div className="form-group">
                <label className="form-label">LinkedIn Profile</label>
                <input
                  type="url"
                  name="linkedinLink"
                  value={form.linkedinLink}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div className="form-group">
                <label className="form-label">GitHub Profile</label>
                <input
                  type="url"
                  name="githubLink"
                  value={form.githubLink}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="https://github.com/yourusername"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Portfolio Website</label>
                <input
                  type="url"
                  name="portfolioLink"
                  value={form.portfolioLink}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="https://yourportfolio.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills You're Proficient At</label>
                <select
                  className="form-select"
                  value={skillsProficientAt}
                  onChange={(e) => setSkillsProficientAt(e.target.value)}
                >
                  <option>Select some skill</option>
                  {skills.map((skill, index) => (
                    <option key={index} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>

                {form.skillsProficientAt.length > 0 && (
                  <div className="skills-container">
                    {form.skillsProficientAt.map((skill, index) => (
                      <span
                        key={index}
                        className="skill-badge"
                        onClick={(event) => handleRemoveSkill(event, "skills_proficient_at")}
                      >
                        {skill}
                        <span className="remove-icon">×</span>
                      </span>
                    ))}
                  </div>
                )}

                <button className="btn-modern btn-primary-modern" name="skill_proficient_at" onClick={handleAddSkill}>
                  Add Skill
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Skills You Want to Learn</label>
                <select
                  className="form-select"
                  value={skillsToLearn}
                  onChange={(e) => setSkillsToLearn(e.target.value)}
                >
                  <option>Select some skill</option>
                  {skills.map((skill, index) => (
                    <option key={index} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>

                {form.skillsToLearn.length > 0 && (
                  <div className="skills-container">
                    {form.skillsToLearn.map((skill, index) => (
                      <span
                        key={index}
                        className="skill-badge"
                        onClick={(event) => handleRemoveSkill(event, "skills_to_learn")}
                      >
                        {skill}
                        <span className="remove-icon">×</span>
                      </span>
                    ))}
                  </div>
                )}

                <button className="btn-modern btn-primary-modern" name="skill_to_learn" onClick={handleAddSkill}>
                  Add Skill
                </button>
              </div>

              <div className="action-buttons">
                <button className="btn-modern btn-warning-modern" onClick={handleSaveRegistration} disabled={saveLoading}>
                  {saveLoading ? <Spinner animation="border" size="sm" /> : "Save Progress"}
                </button>
                <button onClick={handleNext} className="btn-modern btn-primary-modern">
                  Next Step
                </button>
              </div>
            </Tab>

            <Tab eventKey="education" title="Education">
              {form.education.map((edu, index) => (
                <div className="form-card" key={edu.id}>
                  <div className="form-card-header">
                    <h4 className="form-card-title">Education {index + 1}</h4>
                    {index !== 0 && (
                      <button className="btn-remove" onClick={(e) => handleRemoveEducation(e, edu.id)}>
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Institution Name</label>
                    <input
                      type="text"
                      name="institution"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(e, index)}
                      className="form-input"
                      placeholder="Enter your institution name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Degree</label>
                    <input
                      type="text"
                      name="degree"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(e, index)}
                      className="form-input"
                      placeholder="e.g., Bachelor of Computer Science"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Grade/Percentage</label>
                    <input
                      type="text"
                      name="score"
                      value={edu.score}
                      onChange={(e) => handleEducationChange(e, index)}
                      className="form-input"
                      placeholder="e.g., 8.5 CGPA or 85%"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={edu.startDate ? new Date(edu.startDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => handleEducationChange(e, index)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={edu.endDate ? new Date(edu.endDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => handleEducationChange(e, index)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={edu.description}
                      onChange={(e) => handleEducationChange(e, index)}
                      className="form-input"
                      placeholder="Any achievements or notable experiences"
                    />
                  </div>
                </div>
              ))}

              <button
                className="btn-add"
                onClick={() => {
                  setForm((prevState) => ({
                    ...prevState,
                    education: [
                      ...prevState.education,
                      {
                        id: uuidv4(),
                        institution: "",
                        degree: "",
                        startDate: "",
                        endDate: "",
                        score: "",
                        description: "",
                      },
                    ],
                  }));
                }}
              >
                + Add Another Education
              </button>

              <div className="action-buttons">
                <button className="btn-modern btn-warning-modern" onClick={handleSaveEducation} disabled={saveLoading}>
                  {saveLoading ? <Spinner animation="border" size="sm" /> : "Save Progress"}
                </button>
                <button onClick={handleNext} className="btn-modern btn-primary-modern">
                  Next Step
                </button>
              </div>
            </Tab>

            <Tab eventKey="longer-tab" title="Projects & Bio">
              <div className="form-group">
                <label className="form-label">Bio (Max 500 characters)</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Tell others about yourself, your interests, and what you're passionate about..."
                />
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  {form.bio.length}/500 characters
                </div>
              </div>

              {form.projects.map((project, index) => (
                <div className="form-card" key={project.id}>
                  <div className="form-card-header">
                    <h4 className="form-card-title">Project {index + 1}</h4>
                    <button
                      className="btn-remove"
                      onClick={() => {
                        setForm((prevState) => ({
                          ...prevState,
                          projects: prevState.projects.filter((item) => item.id !== project.id),
                        }));
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Project Title</label>
                    <input
                      type="text"
                      name="title"
                      value={project.title}
                      onChange={(e) => handleAdditionalChange(e, index)}
                      className="form-input"
                      placeholder="Enter your project title"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tech Stack</label>
                    <select
                      className="form-select"
                      value={techStack[index] || "Select some Tech Stack"}
                      onChange={(e) => {
                        setTechStack((prevState) => prevState.map((item, i) => (i === index ? e.target.value : item)));
                      }}
                    >
                      <option>Select some Tech Stack</option>
                      {skills.map((skill, skillIndex) => (
                        <option key={skillIndex} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </select>

                    {project.techStack && project.techStack.length > 0 && (
                      <div className="skills-container">
                        {project.techStack.map((skill, i) => (
                          <span
                            key={i}
                            className="skill-badge"
                            onClick={() => {
                              setForm((prevState) => ({
                                ...prevState,
                                projects: prevState.projects.map((item, projIndex) =>
                                  projIndex === index
                                    ? { ...item, techStack: item.techStack.filter((tech) => tech !== skill) }
                                    : item
                                ),
                              }));
                            }}
                          >
                            {skill}
                            <span className="remove-icon">×</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      className="btn-modern btn-primary-modern"
                      onClick={() => {
                        if (!techStack[index] || techStack[index] === "Select some Tech Stack") {
                          toast.error("Select a tech stack to add");
                          return;
                        }
                        if (project.techStack && project.techStack.includes(techStack[index])) {
                          toast.error("Tech Stack already added");
                          return;
                        }
                        setForm((prevState) => ({
                          ...prevState,
                          projects: prevState.projects.map((item, projIndex) =>
                            projIndex === index 
                              ? { ...item, techStack: [...(item.techStack || []), techStack[index]] } 
                              : item
                          ),
                        }));
                      }}
                    >
                      Add Tech Stack
                    </button>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => handleAdditionalChange(e, index)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : ""}
                        onChange={(e) => handleAdditionalChange(e, index)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Project Link</label>
                    <input
                      type="url"
                      name="projectLink"
                      value={project.projectLink}
                      onChange={(e) => handleAdditionalChange(e, index)}
                      className="form-input"
                      placeholder="https://github.com/username/project or live demo link"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      value={project.description}
                      onChange={(e) => handleAdditionalChange(e, index)}
                      className="form-textarea"
                      placeholder="Describe what the project does, challenges faced, and your role"
                    />
                  </div>
                </div>
              ))}

              <button
                className="btn-add"
                onClick={() => {
                  setTechStack((prevState) => [...prevState, "Select some Tech Stack"]);
                  setForm((prevState) => ({
                    ...prevState,
                    projects: [
                      ...prevState.projects,
                      {
                        id: uuidv4(),
                        title: "",
                        techStack: [],
                        startDate: "",
                        endDate: "",
                        projectLink: "",
                        description: "",
                      },
                    ],
                  }));
                }}
              >
                + Add Project
              </button>

              <div className="action-buttons">
                <button className="btn-modern btn-warning-modern" onClick={handleSaveAdditional} disabled={saveLoading}>
                  {saveLoading ? <Spinner animation="border" size="sm" /> : "Save Progress"}
                </button>
                <button onClick={handleNext} className="btn-modern btn-primary-modern">
                  Preview & Submit
                </button>
              </div>
            </Tab>

            <Tab eventKey="Preview" title="Review & Submit">
              <div className="preview-container">
                <h3 className="preview-title">Review Your Registration</h3>

                <div className="preview-item">
                  <span className="preview-label">Name:</span>
                  <span className={`preview-value ${!form.name ? 'empty' : ''}`}>
                    {form.name || "Yet to be filled"}
                  </span>
                </div>

                <div className="preview-item">
                  <span className="preview-label">Email:</span>
                  <span className={`preview-value ${!form.email ? 'empty' : ''}`}>
                    {form.email || "Yet to be filled"}
                  </span>
                </div>

                <div className="preview-item">
                  <span className="preview-label">Username:</span>
                  <span className={`preview-value ${!form.username ? 'empty' : ''}`}>
                    {form.username || "Yet to be filled"}
                  </span>
                </div>

                <div className="preview-item">
                  <span className="preview-label">Portfolio Link:</span>
                  <span className={`preview-value ${!form.portfolioLink ? 'empty' : ''}`}>
                    {form.portfolioLink || "Yet to be filled"}
                  </span>
                </div>

                <div className="preview-item">
                  <span className="preview-label">GitHub Link:</span>
                  <span className={`preview-value ${!form.githubLink ? 'empty' : ''}`}>
                    {form.githubLink || "Yet to be filled"}
                  </span>
                </div>

                <div className="preview-item">
                  <span className="preview-label">LinkedIn Link:</span>
                  <span className={`preview-value ${!form.linkedinLink ? 'empty' : ''}`}>
                    {form.linkedinLink || "Yet to be filled"}
                  </span>
                </div>

                <div className="preview-item">
                  <span className="preview-label">Skills Proficient At:</span>
                  <span className={`preview-value ${!form.skillsProficientAt.length ? 'empty' : ''}`}>
                    {form.skillsProficientAt.length > 0 ? form.skillsProficientAt.join(", ") : "Yet to be filled"}
                  </span>
                </div>

                <div className="preview-item">
                  <span className="preview-label">Skills To Learn:</span>
                  <span className={`preview-value ${!form.skillsToLearn.length ? 'empty' : ''}`}>
                    {form.skillsToLearn.length > 0 ? form.skillsToLearn.join(", ") : "Yet to be filled"}
                  </span>
                </div>

                <div className="preview-item">
                  <span className="preview-label">Bio:</span>
                  <span className={`preview-value ${!form.bio ? 'empty' : ''}`}>
                    {form.bio || "Yet to be filled"}
                  </span>
                </div>

                <div className="preview-item">
                  <span className="preview-label">Education:</span>
                  <span className={`preview-value ${!form.education.length ? 'empty' : ''}`}>
                    {form.education.length > 0 ? `${form.education.length} education entries` : "Yet to be filled"}
                  </span>
                </div>

                <div className="preview-item">
                  <span className="preview-label">Projects:</span>
                  <span className={`preview-value ${!form.projects.length ? 'empty' : ''}`}>
                    {form.projects.length > 0 ? `${form.projects.length} projects` : "Yet to be filled"}
                  </span>
                </div>

                <div className="action-buttons">
                  <button className="btn-modern btn-success-modern" onClick={handleSubmit} disabled={saveLoading}>
                    {saveLoading ? <Spinner animation="border" size="sm" /> : "Complete Registration ✓"}
                  </button>
                </div>
              </div>
            </Tab>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Register;
