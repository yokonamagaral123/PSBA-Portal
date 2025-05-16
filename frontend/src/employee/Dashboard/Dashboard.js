import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import bannerImage from '../../assets/image.png';
import schoolImage from '../../assets/school.png';
import school2Image from '../../assets/school2.png';

const images = [bannerImage, schoolImage, school2Image];

const Dashboard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Announcements state and handlers
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncementInput, setShowAnnouncementInput] = useState(false);
  const [announcementInput, setAnnouncementInput] = useState("");

  const handleAnnouncementAddClick = () => {
    setShowAnnouncementInput(true);
  };

  const handleAnnouncementInputChange = (e) => {
    setAnnouncementInput(e.target.value);
  };

  const handleAnnouncementInputKeyDown = (e) => {
    if (e.key === "Enter" && announcementInput.trim() !== "") {
      setAnnouncements([...announcements, announcementInput.trim()]);
      setAnnouncementInput("");
      setShowAnnouncementInput(false);
    } else if (e.key === "Escape") {
      setShowAnnouncementInput(false);
      setAnnouncementInput("");
    }
  };

  // To-Do state and handlers
  const [todos, setTodos] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [todoInput, setTodoInput] = useState("");

  const handleAddClick = () => {
    setShowInput(true);
  };

  const handleInputChange = (e) => {
    setTodoInput(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && todoInput.trim() !== "") {
      setTodos([...todos, todoInput.trim()]);
      setTodoInput("");
      setShowInput(false);
    } else if (e.key === "Escape") {
      setShowInput(false);
      setTodoInput("");
    }
  };

  // Automatically change the image every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <>
      {/* Dashboard Banner */}
      <div className="dashboard-banner">
        <h1 className="dashboard-banner-title">DASHBOARD</h1>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-widgets">
        {/* Image Carousel */}
        <div className="image-carousel">
          <button className="carousel-button left" onClick={goToPrevious}>
            &#8249;
          </button>
          <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} />
          <button className="carousel-button right" onClick={goToNext}>
            &#8250;
          </button>
          <div className="carousel-dots">
            {images.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(index)}
              ></span>
            ))}
          </div>
        </div>

        <div className="calendar">
          <h3>December 2024</h3>
          <table>
            <thead>
              <tr>
                <th>Sun</th>
                <th>Mon</th>
                <th>Tue</th>
                <th>Wed</th>
                <th>Thu</th>
                <th>Fri</th>
                <th>Sat</th>
              </tr>
            </thead>
            <tbody>
              {/* Calendar cells can be added here */}
            </tbody>
          </table>
        </div>

        {/* Announcements Section */}
        <div className="announcements">
          <div className="announcements-header">
            <h3>Announcements</h3>
            <button onClick={handleAnnouncementAddClick}>+</button>
          </div>
          {showAnnouncementInput && (
            <input
              type="text"
              className="announcement-input"
              value={announcementInput}
              onChange={handleAnnouncementInputChange}
              onKeyDown={handleAnnouncementInputKeyDown}
              autoFocus
              placeholder="Enter announcement and press Enter"
            />
          )}
          <ul className="announcement-list">
            {announcements.length === 0 && <li>No announcements yet.</li>}
            {announcements.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* To-Do Section */}
        <div className="todo">
          <div className="todo-header">
            <h3>To-Do</h3>
            <button onClick={handleAddClick}>+</button>
          </div>
          {showInput && (
            <input
              type="text"
              className="todo-input"
              value={todoInput}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              autoFocus
              placeholder="Enter your task and press Enter"
            />
          )}
          <ul className="todo-list">
            {todos.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Dashboard;