import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaUsers, FaBuilding, FaFileAlt, FaHourglassHalf, FaTimesCircle } from "react-icons/fa";
import bannerImage from '../../assets/image.png';
import schoolImage from '../../assets/school.png';
import school2Image from '../../assets/school2.png';
import "./HrDashboard.css";
import axios from "axios";

const images = [bannerImage, schoolImage, school2Image];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Helper: Get number of days in a month
function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

// Helper: Get the first day of the week for a month (0=Sunday, 1=Monday, ...)
function getFirstDayOfWeek(month, year) {
  return new Date(year, month, 1).getDay();
}

const HrDashboard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Calendar state
  const today = new Date();
  const [calendar, setCalendar] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });

  // To-Do state
  const [todoInput, setTodoInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [todoTime, setTodoTime] = useState("");
  const [todos, setTodos] = useState([]);

  // Overlay state for calendar day details
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState("");
  const [selectedDayTasks, setSelectedDayTasks] = useState([]);

  // Announcements state
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementInput, setAnnouncementInput] = useState("");
  const [announcementDate, setAnnouncementDate] = useState("");
  const [announcementTime, setAnnouncementTime] = useState("");
  const [announcements, setAnnouncements] = useState([]);

  // New state for To-Do modal
  const [showTodoModal, setShowTodoModal] = useState(false);

  // --- Overview and Leave Details Data ---
  // Fetch total employees and departments
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [leaveApplied, setLeaveApplied] = useState(0);
  const [leaveApproved, setLeaveApproved] = useState(0);
  const [leavePending, setLeavePending] = useState(0);
  const [leaveRejected, setLeaveRejected] = useState(0);

  useEffect(() => {
    // Fetch employees for overview
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/admin/employees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const employees = res.data.employees || [];
        setTotalEmployees(employees.length);
        setTotalDepartments(Array.from(new Set(employees.map(e => e.department).filter(Boolean))).length);
      } catch {
        setTotalEmployees(0);
        setTotalDepartments(0);
      }
    };
    fetchEmployees();
    // Fetch leave stats for leave details
    const fetchLeaveStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/requisitions/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          const reqs = data.requisitions || [];
          setLeaveApplied(reqs.filter(r => r.type === "General Request" || r.type === "Leave Request").length);
          setLeaveApproved(reqs.filter(r => r.status === "approved").length);
          setLeavePending(reqs.filter(r => r.status === "pending").length);
          setLeaveRejected(reqs.filter(r => r.status === "declined").length);
        } else {
          setLeaveApplied(0); setLeaveApproved(0); setLeavePending(0); setLeaveRejected(0);
        }
      } catch {
        setLeaveApplied(0); setLeaveApproved(0); setLeavePending(0); setLeaveRejected(0);
      }
    };
    fetchLeaveStats();
  }, []);

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
          if (data.success) setTodos(data.todos.map(t => ({
            _id: t._id,
            task: t.task,
            dueDate: t.dueDate,
            time: t.time, // <-- Add this line to ensure time is loaded from backend
            done: t.done
          })));
        })
        .catch(err => console.error("Failed to fetch todos:", err));
    }
  }, []);

  // Remove unused HR-specific state

  // Mark as done handler (with backend response)
  const handleMarkAsDone = (id) => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/todos/${id}/done`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.todo) {
          setTodos(prev =>
            prev.map(todo =>
              todo._id === id ? { ...todo, ...data.todo } : todo
            )
          );
        }
      })
      .catch(err => console.error("Failed to mark as done:", err));
  };

  // Highlight days with due tasks (green if all done, orange if any not done)
  const dueDaysMap = {};
  todos.forEach(item => {
    if (!item.dueDate) return;
    const date = new Date(item.dueDate);
    if (
      date.getMonth() === calendar.month &&
      date.getFullYear() === calendar.year
    ) {
      const day = date.getDate();
      if (!dueDaysMap[day]) dueDaysMap[day] = [];
      dueDaysMap[day].push(item);
    }
  });

  // Helper: Get tasks for a specific day
  const getTasksForDay = (day) => {
    return todos.filter(item => {
      if (!item.dueDate) return false;
      const date = new Date(item.dueDate);
      return (
        date.getDate() === day &&
        date.getMonth() === calendar.month &&
        date.getFullYear() === calendar.year
      );
    });
  };

  // Build calendar grid
  const daysInMonth = getDaysInMonth(calendar.month, calendar.year);
  const firstDayOfWeek = getFirstDayOfWeek(calendar.month, calendar.year);
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

    const tasksForDay = dueDaysMap[day] || [];
    const hasDue = tasksForDay.length > 0;
    const allDone = hasDue && tasksForDay.every(t => t.done);
    const anyPending = hasDue && tasksForDay.some(t => !t.done);

    // Class logic: green if all done, yellow if any not done, blue if today only
    let tdClass = "";
    if (isToday && hasDue && allDone) tdClass = "hrdashboard-today hrdashboard-done-task";
    else if (isToday && anyPending) tdClass = "hrdashboard-today hrdashboard-due-task";
    else if (isToday) tdClass = "hrdashboard-today";
    else if (hasDue && allDone) tdClass = "hrdashboard-done-task";
    else if (anyPending) tdClass = "hrdashboard-due-task";

    cells.push(
      <td
        key={day}
        className={tdClass}
        onClick={() => handleCalendarDayClick(day)}
        style={{ cursor: hasDue ? "pointer" : "default" }}
      >
        {day}
      </td>
    );
    if ((cells.length) % 7 === 0 || day === daysInMonth) {
      calendarRows.push(<tr key={`row-${day}`}>{cells}</tr>);
      cells = [];
    }
  }

  // Carousel navigation
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

  // To-Do handlers
  const handleAddClick = () => {
    setShowTodoModal(true);
    setDueDate("");
    setTodoInput("");
    setTodoTime("");
  };

  const handleTodoModalClose = () => {
    setShowTodoModal(false);
    setTodoInput("");
    setDueDate("");
    setTodoTime("");
  };

  const handleInputChange = (e) => {
    setTodoInput(e.target.value);
  };

  const handleDueDateChange = (e) => {
    setDueDate(e.target.value);
  };

  const handleTodoTimeChange = (e) => {
    setTodoTime(e.target.value);
  };

  const handleAddTodo = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to add a to-do.");
      return;
    }
    if (!todoInput.trim()) return;
    fetch("http://localhost:5000/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ task: todoInput.trim(), dueDate: dueDate || null, time: todoTime || undefined })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setTodos(prev => [{
          _id: data.todo._id,
          task: data.todo.task,
          dueDate: data.todo.dueDate,
          time: data.todo.time,
          done: data.todo.done
        }, ...prev]);
      })
      .catch(err => console.error("Failed to add todo:", err));
    setTodoInput("");
    setDueDate("");
    setTodoTime("");
    setShowTodoModal(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddTodo();
      setShowTodoModal(false);
    }
    if (e.key === "Escape") {
      setShowTodoModal(false);
      setTodoInput("");
      setDueDate("");
      setTodoTime("");
    }
  };

  // Announcement handlers
  const handleAnnouncementAddClick = () => {
    setShowAnnouncementModal(true);
  };

  const handleAnnouncementModalClose = () => {
    setShowAnnouncementModal(false);
    setAnnouncementInput("");
    setAnnouncementDate("");
    setAnnouncementTime("");
  };

  const handleAnnouncementInputChange = (e) => {
    setAnnouncementInput(e.target.value);
  };

  // Post new announcement to backend and update state
  const handleAnnouncementInputKeyDown = async (e) => {
    if (e.key === "Enter" && announcementInput.trim()) {
      let createdBy = "HR";
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          // Prefer name and role, fallback to HR
          if (payload.name && payload.role) {
            createdBy = `${payload.name} (${payload.role})`;
          } else if (payload.name) {
            createdBy = payload.name;
          } else if (payload.role) {
            createdBy = payload.role;
          }
        }
      } catch {}
      let customDateTime;
      if (announcementDate) {
        customDateTime = announcementDate;
        if (announcementTime) customDateTime += 'T' + announcementTime;
      }
      try {
        const res = await fetch("http://localhost:5000/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: announcementInput.trim(),
            createdBy,
            createdAt: customDateTime ? new Date(customDateTime) : undefined,
            date: announcementDate || undefined,
            time: announcementTime || undefined
          })
        });
        const data = await res.json();
        if (data.success) {
          setAnnouncements(prev => [data.announcement, ...prev]);
        }
      } catch (err) {
        console.error("Failed to post announcement:", err);
      }
      setAnnouncementInput("");
      setAnnouncementDate("");
      setAnnouncementTime("");
      setShowAnnouncementModal(false);
    }
    if (e.key === "Escape") {
      setShowAnnouncementModal(false);
      setAnnouncementInput("");
      setAnnouncementDate("");
      setAnnouncementTime("");
    }
  };

  // Calendar day click handler
  const handleCalendarDayClick = (day) => {
    const dateObj = new Date(calendar.year, calendar.month, day);
    setSelectedDayDate(dateObj.toLocaleDateString());
    setSelectedDayTasks(getTasksForDay(day));
    setOverlayOpen(true);
  };

  // Overview and Leave Details Data
  useEffect(() => {
    // Fetch employees for overview
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/admin/employees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const employees = res.data.employees || [];
        setTotalEmployees(employees.length);
        setTotalDepartments(Array.from(new Set(employees.map(e => e.department).filter(Boolean))).length);
      } catch {
        setTotalEmployees(0);
        setTotalDepartments(0);
      }
    };
    fetchEmployees();
    // Fetch leave stats for leave details
    const fetchLeaveStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/requisitions/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          const reqs = data.requisitions || [];
          setLeaveApplied(reqs.filter(r => r.type === "General Request" || r.type === "Leave Request").length);
          setLeaveApproved(reqs.filter(r => r.status === "approved").length);
          setLeavePending(reqs.filter(r => r.status === "pending").length);
          setLeaveRejected(reqs.filter(r => r.status === "declined").length);
        } else {
          setLeaveApplied(0); setLeaveApproved(0); setLeavePending(0); setLeaveRejected(0);
        }
      } catch {
        setLeaveApplied(0); setLeaveApproved(0); setLeavePending(0); setLeaveRejected(0);
      }
    };
    fetchLeaveStats();
  }, []);

  return (
    <>
      {/* Dashboard Banner */}
      <div className="hrdashboard-banner">
        <h1 className="hrdashboard-banner-title">HR DASHBOARD</h1>
      </div>

      {/* Dashboard Content */}
      <div className="hrdashboard-widgets">
        {/* Image Carousel */}
        <div className="hrdashboard-image-carousel">
          <button className="hrdashboard-carousel-button left" onClick={goToPrevious}>
            &#8249;
          </button>
          <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} />
          <button className="hrdashboard-carousel-button right" onClick={goToNext}>
            &#8250;
          </button>
          <div className="hrdashboard-carousel-dots">
            {images.map((_, index) => (
              <span
                key={index}
                className={`hrdashboard-dot ${index === currentIndex ? "hrdashboard-active" : ""}`}
                onClick={() => setCurrentIndex(index)}
              ></span>
            ))}
          </div>
        </div>

        {/* Functional Calendar */}
        <div className="hrdashboard-calendar">
          <div className="hrdashboard-calendar-header">
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

        {/* Overlay for selected day */}
        {overlayOpen && (
          <div className="hrdashboard-modal-overlay">
            <div className="hrdashboard-modal">
              <button className="hrdashboard-modal-close" onClick={() => setOverlayOpen(false)}>&times;</button>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>
                Task for {selectedDayDate}
              </div>
              <ul style={{ paddingLeft: 0, marginBottom: 0 }}>
                {selectedDayTasks.length === 0 && (
                  <li>No tasks due on this day.</li>
                )}
                {selectedDayTasks.map((task, idx) => (
                  <li key={idx} style={{
                    marginBottom: 10,
                    listStyle: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: !task.done ? '#fffbe6' : '#e6ffed', // yellow for pending, green for done
                    borderRadius: 6,
                    padding: '6px 8px',
                    transition: 'background 0.2s'
                  }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontWeight: 600 }}>{task.task}</div>
                      {task.time && (
                        <div style={{ color: '#111', fontSize: 15 }}>
                          | Time: {new Date(`1970-01-01T${task.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      {task.done ? (
                        <span style={{ color: '#218838', marginLeft: 8, fontWeight: 600 }}>Done</span>
                      ) : (
                        <span style={{ color: '#e6a700', marginLeft: 8, fontWeight: 600 }}>Pending</span>
                      )}
                    </div>
                    {!task.done && (
                      <button
                        className="hrdashboard-todo-mark-done-btn"
                        onClick={async () => {
                          setSelectedDayTasks(prev => prev.map(t => t._id === task._id ? { ...t, done: true } : t));
                          setTodos(prev => prev.map(t => t._id === task._id ? { ...t, done: true } : t));
                          await handleMarkAsDone(task._id);
                        }}
                        title="Mark as done"
                        style={{ background: 'none', padding: 0, marginLeft: 10 }}
                      >
                        <FaCheckCircle style={{ color: "#218838", background: 'none' }} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Announcements Section */}
        <div className="hrdashboard-announcements">
          <div className="hrdashboard-announcements-header">
            <h3>Announcements</h3>
            <button onClick={handleAnnouncementAddClick}>+</button>
          </div>
          {/* Modal for Announcement Input */}
          {showAnnouncementModal && (
            <div className="hrdashboard-modal-overlay">
              <div className="hrdashboard-modal">
                <button className="hrdashboard-modal-close" onClick={handleAnnouncementModalClose}>&times;</button>
                <h2 style={{ marginBottom: 16 }}>Add Announcement</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input
                    type="text"
                    className="hrdashboard-announcement-input"
                    value={announcementInput}
                    onChange={handleAnnouncementInputChange}
                    onKeyDown={handleAnnouncementInputKeyDown}
                    autoFocus
                    placeholder="Enter announcement and press Enter"
                    style={{ fontSize: 16, padding: 8 }}
                  />
                  <label style={{ fontWeight: 500, marginBottom: 2 }}>When</label>
                  <input
                    type="date"
                    className="hrdashboard-announcement-input"
                    value={announcementDate}
                    onChange={e => setAnnouncementDate(e.target.value)}
                    onKeyDown={handleAnnouncementInputKeyDown}
                    placeholder="Date"
                    style={{ fontSize: 15, padding: 7 }}
                  />
                  <label style={{ fontWeight: 500, marginBottom: 2 }}>Time</label>
                  <input
                    type="time"
                    className="hrdashboard-announcement-input"
                    value={announcementTime}
                    onChange={e => setAnnouncementTime(e.target.value)}
                    onKeyDown={handleAnnouncementInputKeyDown}
                    placeholder="Time"
                    style={{ fontSize: 15, padding: 7 }}
                  />
                  <button
                    className="hrdashboard-modal-submit"
                    style={{ marginTop: 16, padding: '10px 0', fontWeight: 600, fontSize: 16, background: '#218838', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                    onClick={async () => {
                      await handleAnnouncementInputKeyDown({ key: 'Enter' });
                    }}
                  >Post Announcement</button>
                </div>
              </div>
            </div>
          )}
          <div className="hrdashboard-announcement-list">
            {announcements.length === 0 && <div className="hrdashboard-announcement-item">No announcements yet.</div>}
            {announcements.map((item, idx) => {
              let dateStr = item.date ? new Date(item.date).toLocaleDateString() : "";
              let timeStr = item.time ? new Date(`1970-01-01T${item.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
              return (
                <div className="hrdashboard-announcement-item" key={item._id || idx}>
                  <span className="hrdashboard-announcement-bullet">&#8226;</span>
                  <div className="hrdashboard-announcement-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{item.createdBy || "Unknown User"}</strong>
                    </div>
                    <div>{item.message}</div>
                    {(dateStr || timeStr) && (
                      <div className="hrdashboard-announcement-date" style={{ color: '#111', marginTop: 2 }}>
                        {dateStr && `Due: ${dateStr}`}
                        {dateStr && timeStr ? ' | ' : ''}
                        {timeStr && `Time: ${timeStr}`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* To-Do Section */}
        <div className="hrdashboard-todo">
          <div className="hrdashboard-todo-header">
            <h3>To-Do</h3>
            <button onClick={handleAddClick}>+</button>
          </div>
          {/* Modal for To-Do Input */}
          {showTodoModal && (
            <div className="hrdashboard-modal-overlay">
              <div className="hrdashboard-modal">
                <button className="hrdashboard-modal-close" onClick={handleTodoModalClose}>&times;</button>
                <h2 style={{ marginBottom: 16 }}>Add To-Do</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input
                    type="text"
                    className="hrdashboard-todo-input"
                    value={todoInput}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    autoFocus
                    placeholder="Enter your task"
                    style={{ fontSize: 16, padding: 8 }}
                  />
                  <label style={{ fontWeight: 500, marginBottom: 2 }}>Due Date</label>
                  <input
                    type="date"
                    className="hrdashboard-todo-input"
                    value={dueDate}
                    onChange={handleDueDateChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Due date"
                    style={{ fontSize: 15, padding: 7 }}
                  />
                  <label style={{ fontWeight: 500, marginBottom: 2 }}>Time</label>
                  <input
                    type="time"
                    className="hrdashboard-todo-input"
                    value={todoTime}
                    onChange={handleTodoTimeChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Time"
                    style={{ fontSize: 15, padding: 7 }}
                  />
                  <button
                    className="hrdashboard-modal-submit"
                    style={{ marginTop: 16, padding: '10px 0', fontWeight: 600, fontSize: 16, background: '#0056b3', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                    onClick={async () => {
                      await handleInputKeyDown({ key: 'Enter' });
                    }}
                  >Add To-Do</button>
                </div>
              </div>
            </div>
          )}
          <ul className="hrdashboard-todo-list">
            {todos.map((item, idx) => (
              <li
                key={item._id || idx}
                className={item.done ? "done" : ""}
                data-due={!item.done && item.dueDate ? "true" : undefined}
              >
                <span className="hrdashboard-todo-bullet">&#8226;</span>
                <div
                  className="hrdashboard-todo-task-box"
                  style={item.done ? { textDecoration: "line-through", color: "#888" } : {}}
                >
                  <div className="hrdashboard-todo-task-title">{item.task}</div>
                  {(item.dueDate || item.time) && (
                    <div className="hrdashboard-todo-task-due" style={{ color: '#111' }}>
                      {item.dueDate ? `Due: ${new Date(item.dueDate).toLocaleDateString()}` : ''}
                      {item.dueDate && item.time ? ' | ' : ''}
                      {item.time ? `Time: ${new Date(`1970-01-01T${item.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                    </div>
                  )}
                </div>
                {!item.done && (
                  <button
                    className="hrdashboard-todo-mark-done-btn"
                    onClick={() => handleMarkAsDone(item._id)}
                    title="Mark as done"
                    style={{ background: 'none', padding: 0 }}
                  >
                    <FaCheckCircle style={{ color: "#218838", background: 'none' }} />
                  </button>
                )}
                {/* No check icon when done */}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Overview Section */}
      <div className="hrdashboard-section-title">Overview</div>
      <div className="hrdashboard-overview">
        <div className="hrdashboard-card">
          <div className="hrdashboard-card-icon" style={{ background: "#009688" }}>
            <FaUsers />
          </div>
          <div className="hrdashboard-card-content">
            <div className="hrdashboard-card-title">Total Employees</div>
            <div className="hrdashboard-card-value">{totalEmployees}</div>
          </div>
        </div>
        <div className="hrdashboard-card">
          <div className="hrdashboard-card-icon" style={{ background: "#f7c948", color: "#fff" }}>
            <FaBuilding />
          </div>
          <div className="hrdashboard-card-content">
            <div className="hrdashboard-card-title">Total Departments</div>
            <div className="hrdashboard-card-value">{totalDepartments}</div>
          </div>
        </div>
      </div>
      {/* Leave Details Section */}
      <div className="hrdashboard-section-title">Leave Details</div>
      <div className="hrdashboard-leave-details-cards">
        <div className="hrdashboard-leave-card applied">
          <div className="hrdashboard-leave-card-icon" style={{ background: "#009688", color: "#fff" }}>
            <FaFileAlt />
          </div>
          <div className="hrdashboard-leave-card-content">
            <div className="hrdashboard-leave-card-title">Leave Applied</div>
            <div className="hrdashboard-leave-card-value">{leaveApplied}</div>
          </div>
        </div>
        <div className="hrdashboard-leave-card approved">
          <div className="hrdashboard-leave-card-icon" style={{ background: "#3bb77e", color: "#fff" }}>
            <FaCheckCircle />
          </div>
          <div className="hrdashboard-leave-card-content">
            <div className="hrdashboard-leave-card-title approved">Leave Approved</div>
            <div className="hrdashboard-leave-card-value">{leaveApproved}</div>
          </div>
        </div>
        <div className="hrdashboard-leave-card pending">
          <div className="hrdashboard-leave-card-icon" style={{ background: "#e6b800", color: "#fff" }}>
            <FaHourglassHalf />
          </div>
          <div className="hrdashboard-leave-card-content">
            <div className="hrdashboard-leave-card-title pending">Leave Pending</div>
            <div className="hrdashboard-leave-card-value">{leavePending}</div>
          </div>
        </div>
        <div className="hrdashboard-leave-card rejected">
          <div className="hrdashboard-leave-card-icon" style={{ background: "#e74c3c", color: "#fff" }}>
            <FaTimesCircle />
          </div>
          <div className="hrdashboard-leave-card-content">
            <div className="hrdashboard-leave-card-title rejected">Leave Rejected</div>
            <div className="hrdashboard-leave-card-value">{leaveRejected}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HrDashboard;