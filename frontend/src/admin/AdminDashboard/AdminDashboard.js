import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import { FaUsers, FaBuilding, FaFileAlt, FaCheckCircle, FaHourglassHalf, FaTimesCircle } from "react-icons/fa";
import schoolImage from '../../assets/school.png';
import school2Image from '../../assets/school2.png';

const images = [schoolImage, school2Image];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]); // Add employees state
  const [requisitions, setRequisitions] = useState([]);

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);

  // Calendar state: use a single Date object for robust navigation
  const today = new Date();
  const [calendarDate, setCalendarDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // To-Do state
  const [showInput, setShowInput] = useState(false);
  const [todoInput, setTodoInput] = useState("");
  const [todos, setTodos] = useState([]);

  // Announcements state
  const [showAnnouncementInput, setShowAnnouncementInput] = useState(false);
  const [announcementInput, setAnnouncementInput] = useState("");
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    // Fetch all employees (for count and departments)
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/admin/employees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errText = await res.text();
          console.error("Failed to fetch employees:", res.status, errText);
        }
        const data = await res.json();
        setEmployees(data.employees || []);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setEmployees([]);
      }
    };
    fetchEmployees();

    // Fetch all requisitions
    const fetchRequisitions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/requisitions/all", { 
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errText = await res.text();
          console.error("Failed to fetch requisitions:", res.status, errText);
        }
        const data = await res.json();
        setRequisitions(data.requisitions || []);
      } catch (err) {
        console.error("Error fetching requisitions:", err);
        setRequisitions([]);
      }
    };
    fetchRequisitions();
  }, []);

  // Carousel auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Carousel handlers
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Calendar navigation (robust, single state)
  const prevMonth = () => {
    setCalendarDate((prevDate) => {
      const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setCalendarDate((prevDate) => {
      const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1);
      return newDate;
    });
  };

  // Generate calendar days
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const currentMonth = calendarDate.getMonth();
  const currentYear = calendarDate.getFullYear();
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayOfWeek = getFirstDayOfWeek(currentMonth, currentYear);

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
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear();

    cells.push(
      <td key={day} className={isToday ? "today" : ""}>{day}</td>
    );
    if ((cells.length) % 7 === 0 || day === daysInMonth) {
      calendarRows.push(<tr key={`row-${day}`}>{cells}</tr>);
      cells = [];
    }
  }

  // To-Do handlers
  const handleAddClick = () => setShowInput(true);
  const handleInputChange = (e) => setTodoInput(e.target.value);
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && todoInput.trim()) {
      setTodos([...todos, todoInput.trim()]);
      setTodoInput("");
      setShowInput(false);
    }
    if (e.key === "Escape") {
      setShowInput(false);
      setTodoInput("");
    }
  };

  // Announcement handlers
  const handleAnnouncementAddClick = () => setShowAnnouncementInput(true);
  const handleAnnouncementInputChange = (e) => setAnnouncementInput(e.target.value);
  const handleAnnouncementInputKeyDown = (e) => {
    if (e.key === "Enter" && announcementInput.trim()) {
      setAnnouncements([...announcements, announcementInput.trim()]);
      setAnnouncementInput("");
      setShowAnnouncementInput(false);
    }
    if (e.key === "Escape") {
      setShowAnnouncementInput(false);
      setAnnouncementInput("");
    }
  };

  // Dashboard stats
  const totalEmployees = employees.length; // Use employees array for count
  const totalDepartments = Array.from(new Set(employees.map(e => e.department).filter(Boolean))).length;
  const leaveApplied = requisitions.filter(r => r.type === "General Request" || r.type === "Leave Request").length;
  const leaveApproved = requisitions.filter(r => r.status === "approved").length;
  const leavePending = requisitions.filter(r => r.status === "pending").length;
  const leaveRejected = requisitions.filter(r => r.status === "declined").length;

  return (
    <>
      {/* Admin Dashboard Banner */}
      <div className="admindashboard-banner">
        <h1 className="admindashboard-banner-title">ADMIN DASHBOARD</h1>
      </div>

      {/* Dashboard Content */}
      <div className="admindashboard-widgets">
        {/* Image Carousel */}
        <div className="admindashboard-image-carousel">
          <button className="admindashboard-carousel-button left" onClick={goToPrevious}>
            &#8249;
          </button>
          <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} />
          <button className="admindashboard-carousel-button right" onClick={goToNext}>
            &#8250;
          </button>
          <div className="admindashboard-carousel-dots">
            {images.map((_, index) => (
              <span
                key={index}
                className={`dot${index === currentIndex ? " active" : ""}`}
                onClick={() => setCurrentIndex(index)}
              ></span>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="admindashboard-calendar">
          <div className="admindashboard-calendar-header">
            <button onClick={prevMonth}>&lt;</button>
            <h3 style={{ display: "inline", margin: "0 10px" }}>
              {monthNames[currentMonth]} {currentYear}
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
        <div className="admindashboard-announcements">
          <div className="admindashboard-announcements-header">
            <h3>Announcements</h3>
            <button onClick={handleAnnouncementAddClick}>+</button>
          </div>
          {showAnnouncementInput && (
            <input
              type="text"
              className="admindashboard-announcement-input"
              value={announcementInput}
              onChange={handleAnnouncementInputChange}
              onKeyDown={handleAnnouncementInputKeyDown}
              autoFocus
              placeholder="Enter announcement and press Enter"
            />
          )}
          <ul className="admindashboard-announcement-list">
            {announcements.length === 0 && <li>No announcements yet.</li>}
            {announcements.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* To-Do Section */}
        <div className="admindashboard-todo">
          <div className="admindashboard-todo-header">
            <h3>To-Do</h3>
            <button onClick={handleAddClick}>+</button>
          </div>
          {showInput && (
            <input
              type="text"
              className="admindashboard-todo-input"
              value={todoInput}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              autoFocus
              placeholder="Enter your task and press Enter"
            />
          )}
          <ul className="admindashboard-todo-list">
            {todos.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Admin Overview and Leave Details */}
      <div className="admindashboard-section-title">Admin Overview</div>
      <div className="admindashboard-overview">
        <div className="admindashboard-card">
          <div className="admindashboard-card-icon" style={{ background: "#009688" }}>
            <FaUsers />
          </div>
          <div className="admindashboard-card-content">
            <div className="admindashboard-card-title">Total Admin Employees</div>
            <div className="admindashboard-card-value">{totalEmployees}</div>
          </div>
        </div>
        <div className="admindashboard-card">
          <div className="admindashboard-card-icon" style={{ background: "#f7c948", color: "#fff" }}>
            <FaBuilding />
          </div>
          <div className="admindashboard-card-content">
            <div className="admindashboard-card-title">Total Admin Departments</div>
            <div className="admindashboard-card-value">{totalDepartments}</div>
          </div>
        </div>
      </div>
      <div className="admindashboard-section-title">Admin Leave Details</div>
      <div className="admindashboard-leave-details-cards">
        <div className="admindashboard-leave-card applied">
          <div className="admindashboard-leave-card-icon" style={{ background: "#009688", color: "#fff" }}>
            <FaFileAlt />
          </div>
          <div className="admindashboard-leave-card-content">
            <div className="admindashboard-leave-card-title">Admin Leave Applied</div>
            <div className="admindashboard-leave-card-value">{leaveApplied}</div>
          </div>
        </div>
        <div className="admindashboard-leave-card approved">
          <div className="admindashboard-leave-card-icon" style={{ background: "#3bb77e", color: "#fff" }}>
            <FaCheckCircle />
          </div>
          <div className="admindashboard-leave-card-content">
            <div className="admindashboard-leave-card-title approved">Admin Leave Approved</div>
            <div className="admindashboard-leave-card-value">{leaveApproved}</div>
          </div>
        </div>
        <div className="admindashboard-leave-card pending">
          <div className="admindashboard-leave-card-icon" style={{ background: "#e6b800", color: "#fff" }}>
            <FaHourglassHalf />
          </div>
          <div className="admindashboard-leave-card-content">
            <div className="admindashboard-leave-card-title pending">Admin Leave Pending</div>
            <div className="admindashboard-leave-card-value">{leavePending}</div>
          </div>
        </div>
        <div className="admindashboard-leave-card rejected">
          <div className="admindashboard-leave-card-icon" style={{ background: "#e74c3c", color: "#fff" }}>
            <FaTimesCircle />
          </div>
          <div className="admindashboard-leave-card-content">
            <div className="admindashboard-leave-card-title rejected">Admin Leave Rejected</div>
            <div className="admindashboard-leave-card-value">{leaveRejected}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;