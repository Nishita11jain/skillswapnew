import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "../../util/UserContext";
import Spinner from "react-bootstrap/Spinner";
import { Link, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import ScrollableFeed from "react-scrollable-feed";
import RequestCard from "./RequestCard";
import "./Chats.css";
import Modal from "react-bootstrap/Modal";

var socket;
const Chats = () => {
  const [showChatHistory, setShowChatHistory] = useState(true);
  const [showRequests, setShowRequests] = useState(null);
  const [requests, setRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [acceptRequestLoading, setAcceptRequestLoading] = useState(false);

  const [scheduleModalShow, setScheduleModalShow] = useState(false);
  const [requestModalShow, setRequestModalShow] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});

  // to store selected chat
  const [selectedChat, setSelectedChat] = useState(null);
  // to store chat messages
  const [chatMessages, setChatMessages] = useState([]);
  // to store chats
  const [chats, setChats] = useState([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [chatMessageLoading, setChatMessageLoading] = useState(false);
  // to store message
  const [message, setMessage] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);

  const { user, setUser } = useUser();

  const navigate = useNavigate();

  const [scheduleForm, setScheduleForm] = useState({
    date: "",
  time: "",
  meetLink: "",
  });

  // Set axios defaults for authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("userInfo");
    
    if (!token && !userInfo) {
      navigate("/login");
      return;
    }

    // Set authorization header if token exists
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    
    // Set withCredentials for session-based auth
    axios.defaults.withCredentials = true;
  }, [navigate]);

  useEffect(() => {
    // Only fetch chats if user is authenticated
    if (user || localStorage.getItem("userInfo")) {
      fetchChats();
    }
  }, [user]);

  useEffect(() => {
  if (user || localStorage.getItem("userInfo")) {
    getRequests();
  }
}, [user]);

  useEffect(() => {
  socket = io(axios.defaults.baseURL);
  if (user) {
    socket.emit("setup", user);
  }
  socket.on("message recieved", (newMessageRecieved) => {
    console.log("New Message Recieved: ", newMessageRecieved);
    if (selectedChat && selectedChat.id === newMessageRecieved.chatId._id) {
      setChatMessages((prevState) => [...prevState, newMessageRecieved]);
    } else {
      // Increment unread count for this chat
      setUnreadMessages((prev) => ({
        ...prev,
        [newMessageRecieved.chatId._id]: (prev[newMessageRecieved.chatId._id] || 0) + 1
      }));
    }
  });
  return () => {
    socket.off("message recieved");
  };
}, [selectedChat, user]);

  const fetchChats = async () => {
    try {
      setChatLoading(true);
      const tempUser = JSON.parse(localStorage.getItem("userInfo"));
      
      if (!tempUser) {
        navigate("/login");
        return;
      }

      // Use relative URL instead of absolute
      const { data } = await axios.get("/chat");
      
      if (data.success !== false) {
        toast.success(data.message || "Chats loaded successfully");
        
        if (tempUser?._id && data.data) {
          const temp = data.data.map((chat) => {
            return {
              id: chat._id,
              name: chat?.users.find((u) => u?._id !== tempUser?._id)?.name || "Unknown User",
              picture: chat?.users.find((u) => u?._id !== tempUser?._id)?.picture,
              username: chat?.users.find((u) => u?._id !== tempUser?._id)?.username,
            };
          });
          setChats(temp);
        }
      }
    } catch (err) {
      console.error("Fetch chats error:", err);
      
      // More specific error handling
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        toast.error("Please login again");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
      } else if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Something went wrong loading chats");
      }
    } finally {
      setChatLoading(false);
    }
  };

  const handleScheduleClick = () => {
    setScheduleModalShow(true);
  };

  const handleChatClick = async (chatId) => {
  try {
    setChatMessageLoading(true);
    const { data } = await axios.get(`/message/getMessages/${chatId}`);
    setChatMessages(data.data || []);
    setMessage("");
    
    const chatDetails = chats.find((chat) => chat.id === chatId);
    setSelectedChat(chatDetails);
    
    // Clear unread count for this chat
    setUnreadMessages((prev) => {
      const newUnread = { ...prev };
      delete newUnread[chatId];
      return newUnread;
    });
    
    socket.emit("join chat", chatId);
    toast.success(data.message || "Chat loaded");
  } catch (err) {
    console.error("Chat click error:", err);
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      toast.error("Please login again");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");
    } else {
      toast.error("Failed to load chat messages");
    }
  } finally {
    setChatMessageLoading(false);
  }
};

  const sendMessage = async (e) => {
    e?.preventDefault();
    
    try {
      if (!selectedChat) {
        toast.error("Please select a chat first");
        return;
      }
      
      if (message.trim() === "") {
        toast.error("Message cannot be empty");
        return;
      }

      socket.emit("stop typing", selectedChat.id);
      
      const { data } = await axios.post("/message/sendMessage", { 
        chatId: selectedChat.id, 
        content: message.trim() 
      });
      
      socket.emit("new message", data.data);
      setChatMessages((prevState) => [...prevState, data.data]);
      setMessage("");
      toast.success(data.message || "Message sent");
    } catch (err) {
      console.error("Send message error:", err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        toast.error("Please login again");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
      } else {
        toast.error("Failed to send message");
      }
    }
  };

  const getRequests = async () => {
    try {
      setRequestLoading(true);
      const { data } = await axios.get("/request/getRequests");
      setRequests(data.data || []);
      toast.success(data.message || "Requests loaded");
    } catch (err) {
      console.error("Get requests error:", err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        toast.error("Please login again");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
      } else {
        toast.error("Failed to load requests");
      }
    } finally {
      setRequestLoading(false);
    }
  };

  const handleTabClick = async (tab) => {
    if (tab === "chat") {
      setShowChatHistory(true);
      setShowRequests(false);
      await fetchChats();
    } else if (tab === "requests") {
      setShowChatHistory(false);
      setShowRequests(true);
      await getRequests();
    }
  };

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setRequestModalShow(true);
  };

  const handleRequestAccept = async (e) => {
    e?.preventDefault();
    
    try {
      setAcceptRequestLoading(true);
      const { data } = await axios.post("/request/acceptRequest", { 
        requestId: selectedRequest._id 
      });
      
      toast.success(data.message || "Request accepted");
      setRequests((prevState) => prevState.filter((request) => request._id !== selectedRequest._id));
    } catch (err) {
      console.error("Accept request error:", err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        toast.error("Please login again");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
      } else {
        toast.error("Failed to accept request");
      }
    } finally {
      setAcceptRequestLoading(false);
      setRequestModalShow(false);
    }
  };

  const handleRequestReject = async () => {
    try {
      setAcceptRequestLoading(true);
      const { data } = await axios.post("/request/rejectRequest", { 
        requestId: selectedRequest._id 
      });
      
      toast.success(data.message || "Request rejected");
      setRequests((prevState) => prevState.filter((request) => request._id !== selectedRequest._id));
    } catch (err) {
      console.error("Reject request error:", err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        toast.error("Please login again");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
      } else {
        toast.error("Failed to reject request");
      }
    } finally {
      setAcceptRequestLoading(false);
      setRequestModalShow(false);
    }
  };

  // Handle Enter key press for sending messages
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  return (
    <div className="container-overall">
      <div className="container-right">
        {/* Chat History */}
        <div className="container-left">
          {/* Tabs */}
          <div className="tabs">
            <Button
              className="chatButton"
              variant="secondary"
              style={{
                borderTop: showChatHistory ? "1px solid lightgrey" : "1px solid lightgrey",
                borderRight: showChatHistory ? "1px solid lightgrey" : "1px solid lightgrey",
                borderLeft: showChatHistory ? "1px solid lightgrey" : "1px solid lightgrey",
                borderBottom: "none",
                backgroundColor: showChatHistory ? "#3bb4a1" : "#2d2d2d",
                color: showChatHistory ? "black" : "white",
                cursor: "pointer",
                minWidth: "150px",
                padding: "10px",
                borderRadius: "5px 5px 0 0",
              }}
              onClick={() => handleTabClick("chat")}
            >
              Chat History
            </Button>
            <Button
  className="requestButton"
  variant="secondary"
  style={{
    borderTop: showRequests ? "1px solid lightgrey" : "1px solid lightgrey",
    borderRight: showRequests ? "1px solid lightgrey" : "1px solid lightgrey",
    borderLeft: showRequests ? "1px solid lightgrey" : "1px solid lightgrey",
    borderBottom: "none",
    backgroundColor: showChatHistory ? "#2d2d2d" : "#3bb4a1",
    color: showChatHistory ? "white" : "black",
    cursor: "pointer",
    minWidth: "150px",
    padding: "10px",
    borderRadius: "5px 5px 0 0",
    position: "relative",
  }}
  onClick={() => handleTabClick("requests")}
>
  Requests
  {requests.length > 0 && (
    <span className="tab-badge">{requests.length}</span>
  )}
</Button>

          </div>

          {/* Chat History or Requests List */}
          {showChatHistory && (
            <div className="container-left">
              <ListGroup className="chat-list">
                {chatLoading ? (
                  <div className="row m-auto mt-5">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : (
                  <>
                    {chats && chats.length > 0 ? (
  chats.map((chat) => (
    <ListGroup.Item
      key={chat.id}
      onClick={() => handleChatClick(chat.id)}
      style={{
        cursor: "pointer",
        marginBottom: "10px",
        padding: "10px 15px",
        backgroundColor: selectedChat?.id === chat?.id ? "#3BB4A1" : "lightgrey",
        borderRadius: "5px",
        color: selectedChat?.id === chat?.id ? "white" : "black",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ flex: 1 }}>{chat.name}</span>
      {unreadMessages[chat.id] > 0 && (
        <span className="unread-badge">
          {unreadMessages[chat.id]}
        </span>
      )}
    </ListGroup.Item>
  ))
) : (
  <div className="text-center mt-4">
    <p style={{color: "white"}}>No chats available</p>
  </div>
)}
                  </>
                )}
              </ListGroup>
            </div>
          )}
          
          {showRequests && (
            <div className="container-left">
              <ListGroup style={{ padding: "10px" }}>
                {requestLoading ? (
                  <div className="row m-auto mt-5">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : (
                  <>
                    {requests && requests.length > 0 ? (
                      requests.map((request) => (
                        <ListGroup.Item
                          key={request._id}
                          onClick={() => handleRequestClick(request)}
                          style={{
                            cursor: "pointer",
                            marginBottom: "10px",
                            padding: "10px",
                            backgroundColor:
                              selectedRequest && selectedRequest._id === request._id ? "#3BB4A1" : "lightgrey",
                            borderRadius: "5px",
                            color: selectedRequest && selectedRequest._id === request._id ? "white" : "black",
                          }}
                        >
                          {request.name || request.username}
                        </ListGroup.Item>
                      ))
                    ) : (
                      <div className="text-center mt-4">
                        <p style={{color: "white"}}>No requests available</p>
                      </div>
                    )}
                  </>
                )}
              </ListGroup>
            </div>
          )}
          
          {requestModalShow && selectedRequest && (
            <div className="modalBG" onClick={() => setRequestModalShow(false)}>
              <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                <h2 style={{ textAlign: "center" }}>Confirm your choice?</h2>
                <RequestCard
                  name={selectedRequest?.name}
                  skills={selectedRequest?.skillsProficientAt || []}
                  rating="4"
                  picture={selectedRequest?.picture}
                  username={selectedRequest?.username}
                  onClose={() => setSelectedRequest(null)}
                />
                <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                  <button 
                    className="connect-button" 
                    style={{ 
                      marginLeft: "0",
                      backgroundColor: "#3bb4a1",
                      color: "white",
                      border: "1px solid #3bb4a1",
                      padding: "10px 20px",
                      borderRadius: "5px",
                      cursor: "pointer"
                    }} 
                    onClick={handleRequestAccept}
                    disabled={acceptRequestLoading}
                  >
                    {acceptRequestLoading ? (
                      <Spinner animation="border" size="sm" variant="light" />
                    ) : (
                      "Accept!"
                    )}
                  </button>
                  <button 
                    className="report-button" 
                    onClick={handleRequestReject}
                    disabled={acceptRequestLoading}
                    style={{ 
                      backgroundColor: "#f56664",
                      color: "white",
                      border: "1px solid #f56664",
                      padding: "10px 20px",
                      borderRadius: "5px",
                      cursor: "pointer"
                    }}
                  >
                    {acceptRequestLoading ? (
                      <Spinner animation="border" size="sm" variant="light" />
                    ) : (
                      "Reject"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Section - Chat Interface */}
        <div className="container-chat">
          {/* Profile Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              borderBottom: "1px solid #2d2d2d",
              minHeight: "70px",
              backgroundColor: "white",
            }}
          >
            {selectedChat ? (
              <>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={selectedChat?.picture || "https://via.placeholder.com/40"}
                    alt="Profile"
                    style={{ 
                      width: "40px", 
                      height: "40px", 
                      borderRadius: "50%", 
                      marginRight: "10px",
                      objectFit: "cover"
                    }}
                  />
                  <span style={{ 
                    fontFamily: "Montserrat, sans-serif", 
                    color: "#2d2d2d",
                    fontWeight: "500"
                  }}>
                    {selectedChat?.name || selectedChat?.username}
                  </span>
                </div>
                <Button 
                  variant="info" 
                  onClick={handleScheduleClick}
                  style={{
                    backgroundColor: "#3bb4a1",
                    borderColor: "#3bb4a1",
                    fontFamily: "Montserrat, sans-serif"
                  }}
                >
                  Request Video Call
                </Button>
              </>
            ) : (
              <div style={{ 
                width: "100%", 
                textAlign: "center", 
                color: "#666",
                fontFamily: "Montserrat, sans-serif"
              }}>
                Select a chat to start messaging
              </div>
            )}
          </div>

          {/* Chat Interface */}
          <div style={{ flex: "7", position: "relative", height: "calc(100vh - 160px)" }}>
            {/* Chat Messages */}
            <div
              style={{
                height: "calc(100% - 50px)",
                color: "#3BB4A1",
                padding: "20px",
                overflowY: "auto",
                position: "relative",
                backgroundColor: "#f8f9fa",
              }}
            >
              {selectedChat ? (
                <>
                  {chatMessageLoading ? (
                    <div className="row h-100 d-flex justify-content-center align-items-center">
                      <Spinner animation="border" variant="primary" />
                    </div>
                  ) : (
                    <ScrollableFeed forceScroll="true">
                      {chatMessages && chatMessages.length > 0 ? (
                        chatMessages.map((message, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              justifyContent: message.sender._id === user._id ? "flex-end" : "flex-start",
                              marginBottom: "10px",
                            }}
                          >
                            <div
                              style={{
                                backgroundColor: message.sender._id === user._id ? "#3BB4A1" : "#2d2d2d",
                                color: "#ffffff",
                                padding: "10px 15px",
                                borderRadius: "15px",
                                maxWidth: "70%",
                                textAlign: message.sender._id === user._id ? "right" : "left",
                                wordWrap: "break-word",
                                fontFamily: "Montserrat, sans-serif"
                              }}
                            >
                              {message.content}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center">
                          <p style={{color: "#666"}}>No messages yet. Start the conversation!</p>
                        </div>
                      )}
                    </ScrollableFeed>
                  )}
                </>
              ) : (
                <div className="row w-100 h-100 d-flex justify-content-center align-items-center">
                  <h3 style={{ 
                    color: "#666",
                    fontFamily: "Montserrat, sans-serif",
                    textAlign: "center"
                  }}>
                    Select a chat to start messaging
                  </h3>
                </div>
              )}
            </div>

            {/* Chat Input */}
            {selectedChat && (
              <div
                style={{
                  position: "absolute",
                  bottom: "0",
                  left: "0",
                  right: "0",
                  padding: "15px",
                  borderTop: "1px solid #ddd",
                  backgroundColor: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  style={{
                    flex: "1",
                    padding: "12px 15px",
                    borderRadius: "20px",
                    border: "1px solid #ddd",
                    outline: "none",
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "14px"
                  }}
                />
                <Button 
                  variant="success" 
                  style={{ 
                    padding: "12px 25px", 
                    borderRadius: "20px",
                    backgroundColor: "#3bb4a1",
                    borderColor: "#3bb4a1",
                    fontFamily: "Montserrat, sans-serif"
                  }} 
                  onClick={sendMessage}
                  disabled={!message.trim()}
                >
                  Send
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Video Call Modal */}
      {scheduleModalShow && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: "1000",
          }}
          onClick={() => setScheduleModalShow(false)}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#2d2d2d",
              color: "#3BB4A1",
              padding: "40px",
              borderRadius: "15px",
              minWidth: "400px",
              fontFamily: "Montserrat, sans-serif"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ textAlign: "center", marginBottom: "30px" }}>Request a Meeting</h3>
            <Form>
              <Form.Group controlId="formDate" style={{ marginBottom: "20px" }}>
                <Form.Label>Preferred Date</Form.Label>
                <Form.Control
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                  style={{
                    backgroundColor: "#3a3a3a",
                    borderColor: "#3bb4a1",
                    color: "white"
                  }}
                />
              </Form.Group>

              <Form.Group controlId="formTime" style={{ marginBottom: "30px" }}>
                <Form.Label>Preferred Time</Form.Label>
                <Form.Control
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                  style={{
                    backgroundColor: "#3a3a3a",
                    borderColor: "#3bb4a1",
                    color: "white"
                  }}
                />
              </Form.Group>

              <Form.Group controlId="formMeetLink" style={{ marginBottom: "30px" }}>
                <Form.Label>Google Meet Link (optional)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  value={scheduleForm.meetLink}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, meetLink: e.target.value })}
                  style={{
                    backgroundColor: "#3a3a3a",
                    borderColor: "#3bb4a1",
                    color: "white"
                  }}
                />
              </Form.Group>

              <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
                <Button
                  variant="success"
                  type="submit"
                  onClick={async (e) => {
                    e.preventDefault();
                    if (scheduleForm.date === "" || scheduleForm.time === "") {
                      toast.error("Please fill all the fields");
                      return;
                    }

                    // Validate Google Meet link if provided
                    if (scheduleForm.meetLink && scheduleForm.meetLink.trim() !== "") {
                      const meetRegex = /^https?:\/\/(meet\.google\.com)\/[A-Za-z0-9-]+(\/.*)?$/;
                      if (!meetRegex.test(scheduleForm.meetLink.trim())) {
                        toast.error("Please enter a valid Google Meet link (e.g. https://meet.google.com/xxx-xxxx-xxx)");
                        return;
                      }
                    }

                    const requestData = {
                      ...scheduleForm,
                      username: selectedChat.username,
                    };

                    try {
                      const { data } = await axios.post("/user/sendScheduleMeet", requestData);
                      toast.success("Request mail has been sent successfully!");
                      setScheduleForm({
                        date: "",
                        time: "",
                        meetLink: "",
                      });
                      setScheduleModalShow(false);
                    } catch (error) {
                      console.error("Schedule meeting error:", error);
                      if (error?.response?.status === 401 || error?.response?.status === 403) {
                        toast.error("Please login again");
                        localStorage.removeItem("userInfo");
                        localStorage.removeItem("token");
                        setUser(null);
                        navigate("/login");
                      } else if (error?.response?.data?.message) {
                        toast.error(error.response.data.message);
                      } else {
                        toast.error("Something went wrong");
                      }
                    }
                  }}
                  style={{
                    backgroundColor: "#3bb4a1",
                    borderColor: "#3bb4a1",
                    padding: "10px 25px",
                  }}
                >
                  Submit
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => setScheduleModalShow(false)} 
                  style={{ 
                    backgroundColor: "#f56664",
                    borderColor: "#f56664",
                    padding: "10px 25px"
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chats;