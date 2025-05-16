import React, { useState, useEffect } from "react";
import bannerImage from '../../assets/image.png';
import schoolImage from '../../assets/school.png';
import school2Image from '../../assets/school2.png';
import "./HrDashboard.css";

const images = [bannerImage, schoolImage, school2Image];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const HrDashboard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Calendar state
  const today = new Date();
  const [calendar, setCalendar] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });

  // To-Do state
  const [showInput, setShowInput] = useState(false);
  const [todoInput, setTodoInput] = useState("");
  const [todos, setTodos] = useState([]);

  // Announcements state
  const [showAnnouncementInput, setShowAnnouncementInput] = useState(false);
  const [announcementInput, setAnnouncementInput] = useState("");
  const [announcements, setAnnouncements] = useState([]);

  // Fetch announcements from backend on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/announcements")
      .then(res => res.json())
      .then(data => {
        if (data.success) setAnnouncements(data.announcements);
      })
      .catch(err => console.error("Failed to fetch announcements:", err));
  }, []);

  // Fetch todos for this user on mount (user-specific by token)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/api/todos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setTodos(data.todos.map(t => t.task));
        })
        .catch(err => console.error("Failed to fetch todos:", err));
    }
  }, []);

  // Carousel auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Calendar navigation
  const prevMonth = () => {
    setCalendar(({ month, year }) => {
      if (month === 0) {
        return { month: 11, year: year - 1 };
      }
      return { month: month - 1, year };
    });
  };

  const nextMonth = () => {
    setCalendar(({ month, year }) => {
      if (month === 11) {
        return { month: 0, year: year + 1 };
      }
      return { month: month + 1, year };
    });
  };

  // Generate calendar days
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(calendar.month, calendar.year);
  const firstDayOfWeek = getFirstDayOfWeek(calendar.month, calendar.year);

  // Build calendar grid
  const calendarRows = [];
  let cells = [];

  // Fill initial empty cells
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<td key={`empty-start-${i}`}></td>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isToday =
      day === today.getDate() &&
      calendar.month === today.getMonth() &&
      calendar.year === today.getFullYear();

    cells.push(
      <td key={day} className={isToday ? "today" : ""}>{day}</td>
    );
    if ((cells.length) % 7 === 0 || day === daysInMonth) {
      calendarRows.push(<tr key={`row-${day}`}>{cells}</tr>);
      cells = [];
    }
  }

  // To-Do handlers
  const handleAddClick = () => {
    setShowInput(true);
  };

  const handleInputChange = (e) => {
    setTodoInput(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && todoInput.trim()) {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to add a to-do.");
        return;
      }
      fetch("http://localhost:5000/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ task: todoInput.trim() })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setTodos(prev => [data.todo.task, ...prev]);
        })
        .catch(err => console.error("Failed to add todo:", err));
      setTodoInput("");
      setShowInput(false);
    }
    if (e.key === "Escape") {
      setShowInput(false);
      setTodoInput("");
    }
  };

  // Announcement handlers
  const handleAnnouncementAddClick = () => {
    setShowAnnouncementInput(true);
  };

  const handleAnnouncementInputChange = (e) => {
    setAnnouncementInput(e.target.value);
  };

  // Post new announcement to backend and update state
  const handleAnnouncementInputKeyDown = (e) => {
    if (e.key === "Enter" && announcementInput.trim()) {
      // Announcements may or may not need token, adjust as needed
      fetch("http://localhost:5000/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: announcementInput.trim() })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAnnouncements(prev => [data.announcement, ...prev]);
          }
        })
        .catch(err => console.error("Failed to post announcement:", err));
      setAnnouncementInput("");
      setShowAnnouncementInput(false);
    }
    if (e.key === "Escape") {
      setShowAnnouncementInput(false);
      setAnnouncementInput("");
    }
  };

  return (
    <>
      {/* Dashboard Banner */}
      <div className="dashboard-banner">
        <h1 className="dashboard-banner-title">HR DASHBOARD</h1>
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

        {/* Functional Calendar */}
        <div className="calendar">
          <div className="calendar-header">
            <button onClick={prevMonth}>&lt;</button>
            <h3 style={{ display: "inline", margin: "0 10px" }}>
              {monthNames[calendar.month]} {calendar.year}
            </h3>
            <button onClick={nextMonth}>&gt;</button>
          </div>
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
              {calendarRows}
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
          <div className="announcement-list">
            {announcements.length === 0 && <div className="announcement-item">No announcements yet.</div>}
            {announcements.map((item, idx) => (
              <div className="announcement-item" key={item._id || idx}>
                <span className="announcement-bullet">&#8226;</span>
                <div className="announcement-content">
                  <div>
                    <strong>{item.createdBy || "Unknown User"}</strong>
                  </div>
                  <div>{item.message}</div>
                  <div className="announcement-date">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
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

export default HrDashboard;