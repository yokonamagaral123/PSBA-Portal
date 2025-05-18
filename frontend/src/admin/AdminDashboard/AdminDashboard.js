import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import { FaUsers, FaBuilding, FaMoneyBillWave, FaFileAlt, FaCheckCircle, FaHourglassHalf, FaTimesCircle } from "react-icons/fa";
import bannerImage from '../../assets/blue.png';
import schoolImage from '../../assets/school.png';
import school2Image from '../../assets/school2.png';

const images = [schoolImage, school2Image,];

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState(0);

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);

  // Calendar state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Announcements state
  const [announcements] = useState([]); // Static for now

  // To-Do state
  const [todos] = useState([]); // Static for now

  useEffect(() => {
    fetch("/api/admin/user-count")
      .then((res) => res.json())
      .then((data) => setUserCount(data.count))
      .catch(() => setUserCount(0));
  }, []);

  // Carousel handlers
  const goToPrevious = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const goToNext = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  // Calendar helpers
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfWeek = (month, year) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayOfWeek = getFirstDayOfWeek(currentMonth, currentYear);

  // Build calendar grid
  const calendarRows = [];
  let cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(<td key={`empty-${i}`}></td>);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(<td key={day}>{day}</td>);
    if ((cells.length) % 7 === 0 || day === daysInMonth) {
      calendarRows.push(<tr key={day}>{cells}</tr>);
      cells = [];
    }
  }

  return (
    <div className="admin-dashboard-container">
      {/* Banner */}
      <div className="dashboard-banner" style={{
        background: `url(${bannerImage}) no-repeat center`,
        backgroundSize: "cover",
        textAlign: "center",
        padding: "110px 0",
        color: "white",
        borderRadius: "10px",
        marginBottom: "20px"
      }}>
        <h1 className="dashboard-banner-title">DASHBOARD</h1>
      </div>

      {/* Widgets */}
      <div className="dashboard-widgets" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
        {/* Image Carousel */}
        <div className="widget image-carousel" style={{ background: "#fff", borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <img src={images[currentIndex]} alt="School" style={{ width: "100%", height: "300px", objectFit: "cover" }} />
          <button className="carousel-button left" onClick={goToPrevious}>&lt;</button>
          <button className="carousel-button right" onClick={goToNext}>&gt;</button>
        </div>

        {/* Calendar */}
        <div className="widget calendar" style={{ background: "#fff", borderRadius: "10px", padding: "20px" }}>
          <h3>{monthNames[currentMonth]} {currentYear}</h3>
          <table>
            <thead>
              <tr>
                <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>
              </tr>
            </thead>
            <tbody>{calendarRows}</tbody>
          </table>
        </div>

        {/* Announcements */}
        <div className="widget announcements" style={{ background: "#fff", borderRadius: "10px", padding: "20px" }}>
          <h3>Announcements</h3>
          {announcements.length === 0 ? (
            <p>No announcements yet.</p>
          ) : (
            <ul>
              {announcements.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          )}
        </div>

        {/* To-Do */}
        <div className="widget todo" style={{ background: "#fff", borderRadius: "10px", padding: "20px" }}>
          <h3>To-Do</h3>
          <button style={{ background: "#2196f3", color: "#fff", border: "none", borderRadius: "5px", width: "40px", height: "40px", fontSize: "1.5rem" }}>+</button>
          {todos.length === 0 ? (
            <p></p>
          ) : (
            <ul>
              {todos.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          )}
        </div>
      </div>

      {/* Existing Overview and Leave Details */}
      <div className="dashboard-section-title">Dashboard Overview</div>
      <div className="dashboard-overview">
        <div className="dashboard-card">
          <div className="dashboard-card-icon" style={{ background: "#009688" }}>
            <FaUsers />
          </div>
          <div className="dashboard-card-content">
            <div className="dashboard-card-title">Total Employees</div>
            <div className="dashboard-card-value">{userCount}</div>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-icon" style={{ background: "#f7c948", color: "#fff" }}>
            <FaBuilding />
          </div>
          <div className="dashboard-card-content">
            <div className="dashboard-card-title">Total Departments</div>
            <div className="dashboard-card-value">3</div>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-icon" style={{ background: "#e74c3c", color: "#fff" }}>
            <FaMoneyBillWave />
          </div>
          <div className="dashboard-card-content">
            <div className="dashboard-card-title">Monthly Pay</div>
            <div className="dashboard-card-value">${1900}</div>
          </div>
        </div>
      </div>
      <div className="dashboard-section-title">Leave Details</div>
      <div className="leave-details-cards">
        <div className="leave-card applied">
          <div className="leave-card-icon" style={{ background: "#009688", color: "#fff" }}>
            <FaFileAlt />
          </div>
          <div className="leave-card-content">
            <div className="leave-card-title">Leave Applied</div>
            <div className="leave-card-value">2</div>
          </div>
        </div>
        <div className="leave-card approved">
          <div className="leave-card-icon" style={{ background: "#3bb77e", color: "#fff" }}>
            <FaCheckCircle />
          </div>
          <div className="leave-card-content">
            <div className="leave-card-title approved">Leave Approved</div>
            <div className="leave-card-value">2</div>
          </div>
        </div>
        <div className="leave-card pending">
          <div className="leave-card-icon" style={{ background: "#e6b800", color: "#fff" }}>
            <FaHourglassHalf />
          </div>
          <div className="leave-card-content">
            <div className="leave-card-title pending">Leave Pending</div>
            <div className="leave-card-value">1</div>
          </div>
        </div>
        <div className="leave-card rejected">
          <div className="leave-card-icon" style={{ background: "#e74c3c", color: "#fff" }}>
            <FaTimesCircle />
          </div>
          <div className="leave-card-content">
            <div className="leave-card-title rejected">Leave Rejected</div>
            <div className="leave-card-value">1</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;