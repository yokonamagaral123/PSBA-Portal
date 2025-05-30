import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import { FaUsers, FaBuilding, FaFileAlt, FaCheckCircle, FaHourglassHalf, FaTimesCircle } from "react-icons/fa";
import schoolImage from '../../assets/school.png';
import school2Image from '../../assets/school2.png';
import { useAdminData } from "../AdminDataContext";

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
  const [showTodoModal, setShowTodoModal] = useState(false);

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

  // Add Holiday modal state
  const [showAddHolidayModal, setShowAddHolidayModal] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayType, setHolidayType] = useState("Regular Holiday");

  // Use context for holidays and todos
  const { holidays, todos, year, setYear, refreshTodos } = useAdminData();

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

    // Fetch announcements from backend on mount
    fetch("http://localhost:5000/api/announcements")
      .then(res => res.json())
      .then(data => {
        if (data.success) setAnnouncements(data.announcements);
      })
      .catch(err => console.error("Failed to fetch announcements:", err));

    // Fetch todos and holidays from context (refresh if year changes)
    // Only update context year if it actually changed
    if (year !== calendar.year) setYear(calendar.year);
    refreshTodos();
  }, [calendar.year, year, setYear, refreshTodos]);

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
    let tdClass = "";
    if (hasDue && allDone) tdClass = "admindashboard-done-task";
    else if (anyPending) tdClass = "admindashboard-due-task";
    if (isToday) tdClass += (tdClass ? " " : "") + "admindashboard-today-dot";

    const holiday = holidays.find(h => {
      const holidayDate = new Date(h.date);
      return (
        holidayDate.getDate() === day &&
        holidayDate.getMonth() === calendar.month &&
        holidayDate.getFullYear() === calendar.year
      );
    });

    cells.push(
      <td
        key={day}
        className={tdClass}
        onClick={() => handleCalendarDayClick(day)}
        style={{ cursor: hasDue || holiday ? "pointer" : "default" }}
        title={holiday ? `${holiday.localName} (${holiday.type || ''})` : undefined}
      >
        <span style={{ fontWeight: 400, fontSize: 20, display: 'inline-block', width: 28, height: 28 }}>
          {day}
        </span>
        {isToday && (
          <span className="admindashboard-today-dot"></span>
        )}
        {holiday && (
          <div style={{
            fontSize: 12,
            color: '#e74c3c',
            fontWeight: 600,
            marginTop: 2,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            lineHeight: 1.2
          }}>
            {holiday.localName}
            {(holiday.type || holidayTypeMap[holiday.localName]) && (
              <span style={{ fontWeight: 400, color: '#b71c1c', fontSize: 11, display: 'block' }}>
                {holiday.type || holidayTypeMap[holiday.localName]}
              </span>
            )}
            {holiday.note && (
              <span style={{ fontWeight: 400, color: '#b71c1c', fontSize: 11, display: 'block' }}>
                {holiday.note}
              </span>
            )}
          </div>
        )}
      </td>
    );
    if ((cells.length) % 7 === 0 || day === daysInMonth) {
      calendarRows.push(<tr key={`row-${day}`}>{cells}</tr>);
      cells = [];
    }
  }

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
    // Pre-fill due date with today
    const todayStr = new Date().toISOString().slice(0, 10);
    setShowTodoModal(true);
    setDueDate(todayStr);
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
  const handleAddTodo = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to add a to-do.");
      return;
    }
    if (!todoInput.trim()) return;
    // Default dueDate to today if empty
    let due = dueDate;
    if (!due) {
      due = new Date().toISOString().slice(0, 10);
      setDueDate(due);
    }
    fetch("http://localhost:5000/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ task: todoInput.trim(), dueDate: due || null, time: todoTime || undefined })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          refreshTodos();
        }
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
  const handleAnnouncementInputKeyDown = async (e) => {
    if (e.key === "Enter" && announcementInput.trim()) {
      let createdBy = "Admin";
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
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

  // Holiday handlers
  const handleAddHoliday = async () => {
    if (!holidayName || !holidayDate) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/holidays", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: holidayName, date: holidayDate, type: holidayType })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Failed to add holiday.");
        return;
      }
      // After adding, force a context year change to trigger holiday refresh
      setYear(y => y + 1); // bump year to force effect
      setTimeout(() => setYear(calendar.year), 100); // restore to current year after short delay
      refreshTodos();
    } catch (err) {
      console.error("Failed to add holiday:", err);
    }
    setShowAddHolidayModal(false);
    setHolidayName("");
    setHolidayDate("");
    setHolidayType("Regular Holiday");
  };

  // Calendar day click handler
  const handleCalendarDayClick = (day) => {
    const dateObj = new Date(calendar.year, calendar.month, day);
    setSelectedDayDate(dateObj.toLocaleDateString());
    setSelectedDayTasks(getTasksForDay(day));
    setOverlayOpen(true);
  };

  // Dashboard stats
  const totalEmployees = employees.length; // Use employees array for count
  const totalDepartments = Array.from(new Set(employees.map(e => e.department).filter(Boolean))).length;
  const leaveApplied = requisitions.filter(r => r.type === "General Request" || r.type === "Leave Request").length;
  const leaveApproved = requisitions.filter(r => r.status === "approved").length;
  const leavePending = requisitions.filter(r => r.status === "pending").length;
  const leaveRejected = requisitions.filter(r => r.status === "declined").length;

  // Add handleMarkAsDone function (copied from HrDashboard)
  const handleMarkAsDone = async (id) => {
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
          refreshTodos();
        }
      })
      .catch(err => console.error("Failed to mark as done:", err));
  };

  // Add handleDeleteTodo function (copied and adapted from HrDashboard)
  const handleDeleteTodo = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/todos/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        refreshTodos();
      }
    } catch (err) {
      console.error("Failed to delete todo:", err);
    }
  };

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
          <div className="admindashboard-calendar-header" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <button onClick={prevMonth}>&lt;</button>
            <h3 style={{ display: "inline", margin: "0 10px" }}>
              {monthNames[calendar.month]} {calendar.year}
            </h3>
            <button onClick={nextMonth}>&gt;</button>
            <button
              className="admindashboard-add-holiday-btn"
              style={{ position: 'absolute', right: 0, top: 0, height: 40, minWidth: 130, background: '#2583d8', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37, 131, 216, 0.10)' }}
              onClick={() => setShowAddHolidayModal(true)}
            >
              Add Holiday
            </button>
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
          {/* One-liner View Full Calendar button below the calendar */}
          <div className="admindashboard-view-calendar-btn-row">
  <button
    className="admindashboard-view-calendar-btn"
    onClick={() => window.location.href = '/admin-schedule'}
  >
    View Full Calendar
  </button>
</div>
        </div>
        {/* Overlay for selected day */}
        {overlayOpen && (
          <div className="admindashboard-modal-overlay">
            <div className="admindashboard-modal">
              <button className="admindashboard-modal-close" onClick={() => setOverlayOpen(false)}>&times;</button>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>
                Task for {selectedDayDate}
              </div>
              {/* Holidays for the selected day */}
              {(() => {
                const selectedDate = new Date(selectedDayDate);
                const holidaysForDay = holidays.filter(h => {
                  const hDate = new Date(h.date);
                  return (
                    hDate.getDate() === selectedDate.getDate() &&
                    hDate.getMonth() === selectedDate.getMonth() &&
                    hDate.getFullYear() === selectedDate.getFullYear()
                  );
                });
                return holidaysForDay.length > 0 ? (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 600, color: '#e74c3c', marginBottom: 4 }}>Holiday(s):</div>
                    <div>
                      {holidaysForDay.map((h, idx) => (
                        <div key={idx} style={{
                          background: '#ffeaea',
                          color: '#e74c3c',
                          fontWeight: 600,
                          borderRadius: 6,
                          padding: '6px 8px',
                          marginBottom: 6,
                          display: 'inline-block',
                          fontSize: 15
                        }}>
                          {h.localName}
                          <span style={{ fontWeight: 400, color: '#b71c1c', fontSize: 12, display: 'block', marginTop: 2 }}>
                            {h.note || h.type || 'Holiday'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
              {/* To-Do(s) for the selected day */}
              <div style={{ fontWeight: 600, color: '#2583d8', marginBottom: 4 }}>To-Do(s):</div>
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
                    background: !task.done ? '#fffbe6' : '#e6ffed',
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
                        className="admindashboard-todo-mark-done-btn"
                        onClick={async () => {
                          setSelectedDayTasks(prev => prev.map(t => t._id === task._id ? { ...t, done: true } : t));
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
        <div className="admindashboard-announcements">
          <div className="admindashboard-announcements-header">
            <h3>Announcements</h3>
            <button onClick={handleAnnouncementAddClick}>+</button>
          </div>
          {/* Modal for Announcement Input */}
          {showAnnouncementModal && (
            <div className="admindashboard-modal-overlay">
              <div className="admindashboard-modal">
                <button className="admindashboard-modal-close" onClick={handleAnnouncementModalClose}>&times;</button>
                <h2 style={{ marginBottom: 16 }}>Add Announcement</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input
                    type="text"
                    className="admindashboard-announcement-input"
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
                    className="admindashboard-announcement-input"
                    value={announcementDate}
                    onChange={e => setAnnouncementDate(e.target.value)}
                    onKeyDown={handleAnnouncementInputKeyDown}
                    placeholder="Date"
                    style={{ fontSize: 15, padding: 7 }}
                  />
                  <label style={{ fontWeight: 500, marginBottom: 2 }}>Time</label>
                  <input
                    type="time"
                    className="admindashboard-announcement-input"
                    value={announcementTime}
                    onChange={e => setAnnouncementTime(e.target.value)}
                    onKeyDown={handleAnnouncementInputKeyDown}
                    placeholder="Time"
                    style={{ fontSize: 15, padding: 7 }}
                  />
                  <button
                    className="admindashboard-modal-submit"
                    style={{ marginTop: 16, padding: '10px 0', fontWeight: 600, fontSize: 16, background: '#218838', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                    onClick={async () => {
                      await handleAnnouncementInputKeyDown({ key: 'Enter' });
                    }}
                  >Post Announcement</button>
                </div>
              </div>
            </div>
          )}
          <div className="admindashboard-announcement-list">
            {announcements.length === 0 && <div className="admindashboard-announcement-item">No announcements yet.</div>}
            {announcements.map((item, idx) => {
              let dateStr = item.date ? new Date(item.date).toLocaleDateString() : "";
              let timeStr = item.time ? new Date(`1970-01-01T${item.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
              return (
                <div className="admindashboard-announcement-item" key={item._id || idx}>
                  <span className="admindashboard-announcement-bullet">&#8226;</span>
                  <div className="admindashboard-announcement-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{item.createdBy || "Unknown User"}</strong>
                    </div>
                    <div>{item.message}</div>
                    {(dateStr || timeStr) && (
                      <div className="admindashboard-announcement-date" style={{ color: '#111', marginTop: 2 }}>
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
        <div className="admindashboard-todo">
          <div className="admindashboard-todo-header">
            <h3>To-Do</h3>
            <button onClick={handleAddClick}>+</button>
          </div>
          {/* Modal for To-Do Input */}
          {showTodoModal && (
            <div className="admindashboard-modal-overlay">
              <div className="admindashboard-modal">
                <button className="admindashboard-modal-close" onClick={handleTodoModalClose}>&times;</button>
                <h2 style={{ marginBottom: 16 }}>Add To-Do</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input
                    type="text"
                    className="admindashboard-todo-input"
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
                    className="admindashboard-todo-input"
                    value={dueDate}
                    onChange={handleDueDateChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Due date"
                    style={{ fontSize: 15, padding: 7 }}
                  />
                  <label style={{ fontWeight: 500, marginBottom: 2 }}>Time</label>
                  <input
                    type="time"
                    className="admindashboard-todo-input"
                    value={todoTime}
                    onChange={handleTodoTimeChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Time"
                    style={{ fontSize: 15, padding: 7 }}
                  />
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button
                      className="admindashboard-modal-submit"
                      style={{ flex: 1, padding: '10px 0', fontWeight: 600, fontSize: 16, background: '#0056b3', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                      onClick={async () => {
                        await handleInputKeyDown({ key: 'Enter' });
                      }}
                    >Add To-Do</button>
                    <button
                      type="button"
                      style={{ flex: 1, padding: '10px 0', fontWeight: 600, fontSize: 16, background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                      onClick={() => {
                        setTodoInput("");
                        setDueDate("");
                        setTodoTime("");
                      }}
                    >Clear</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <ul className="admindashboard-todo-list">
            {todos.map((item, idx) => (
              <li
                key={item._id || idx}
                className={item.done ? "done" : ""}
                data-due={!item.done && item.dueDate ? "true" : undefined}
              >
                <span className="admindashboard-todo-bullet">&#8226;</span>
                <div
                  className="admindashboard-todo-task-box"
                  style={item.done ? { textDecoration: "line-through", color: "#888" } : {}}
                >
                  <div className="admindashboard-todo-task-title">{item.task}</div>
                  {(item.dueDate || item.time) && (
                    <div className="admindashboard-todo-task-due" style={{ color: '#111' }}>
                      {item.dueDate ? `Due: ${new Date(item.dueDate).toLocaleDateString()}` : ''}
                      {item.dueDate && item.time ? ' | ' : ''}
                      {item.time ? `Time: ${new Date(`1970-01-01T${item.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                    </div>
                  )}
                </div>
                {!item.done && (
                  <button
                    className="admindashboard-todo-mark-done-btn"
                    onClick={() => handleMarkAsDone(item._id)}
                    title="Mark as done"
                    style={{ background: 'none', padding: 0 }}
                  >
                    <FaCheckCircle style={{ color: "#218838", background: 'none' }} />
                  </button>
                )}
                {/* Add clear (delete) button for all todos */}
                <button
                  className="admindashboard-todo-delete-btn"
                  onClick={() => handleDeleteTodo(item._id)}
                  title="Delete To-Do"
                  style={{ background: 'none', padding: 0, marginLeft: 8, color: '#e74c3c', fontSize: 18 }}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Admin Overview and Leave Details */}
      <div className="admindashboard-section-title">Overview</div>
      <div className="admindashboard-overview">
        <div className="admindashboard-card">
          <div className="admindashboard-card-icon" style={{ background: "#009688" }}>
            <FaUsers />
          </div>
          <div className="admindashboard-card-content">
            <div className="admindashboard-card-title">Employees</div>
            <div className="admindashboard-card-value">{totalEmployees}</div>
          </div>
        </div>
        <div className="admindashboard-card">
          <div className="admindashboard-card-icon" style={{ background: "#f7c948", color: "#fff" }}>
            <FaBuilding />
          </div>
          <div className="admindashboard-card-content">
            <div className="admindashboard-card-title">Total Departments</div>
            <div className="admindashboard-card-value">{totalDepartments}</div>
          </div>
        </div>
      </div>
      <div className="admindashboard-section-title">Leave Details</div>
      <div className="admindashboard-leave-details-cards">
        <div className="admindashboard-leave-card applied">
          <div className="admindashboard-leave-card-icon" style={{ background: "#009688", color: "#fff" }}>
            <FaFileAlt />
          </div>
          <div className="admindashboard-leave-card-content">
            <div className="admindashboard-leave-card-title">Leave Applied</div>
            <div className="admindashboard-leave-card-value">{leaveApplied}</div>
          </div>
        </div>
        <div className="admindashboard-leave-card approved">
          <div className="admindashboard-leave-card-icon" style={{ background: "#3bb77e", color: "#fff" }}>
            <FaCheckCircle />
          </div>
          <div className="admindashboard-leave-card-content">
            <div className="admindashboard-leave-card-title approved">Leave Approved</div>
            <div className="admindashboard-leave-card-value">{leaveApproved}</div>
          </div>
        </div>
        <div className="admindashboard-leave-card pending">
          <div className="admindashboard-leave-card-icon" style={{ background: "#e6b800", color: "#fff" }}>
            <FaHourglassHalf />
          </div>
          <div className="admindashboard-leave-card-content">
            <div className="admindashboard-leave-card-title pending">Leave Pending</div>
            <div className="admindashboard-leave-card-value">{leavePending}</div>
          </div>
        </div>
        <div className="admindashboard-leave-card rejected">
          <div className="admindashboard-leave-card-icon" style={{ background: "#e74c3c", color: "#fff" }}>
            <FaTimesCircle />
          </div>
          <div className="admindashboard-leave-card-content">
            <div className="admindashboard-leave-card-title rejected">Leave Rejected</div>
            <div className="admindashboard-leave-card-value">{leaveRejected}</div>
          </div>
        </div>
      </div>

      {/* Modal for Add Holiday */}
      {showAddHolidayModal && (
        <div className="admindashboard-modal-overlay">
          <div className="admindashboard-modal">
            <button className="admindashboard-modal-close" onClick={() => setShowAddHolidayModal(false)}>&times;</button>
            <h2 style={{ marginBottom: 16 }}>Add Holiday</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontWeight: 500 }}>Holiday Name</label>
              <input
                type="text"
                value={holidayName}
                onChange={e => setHolidayName(e.target.value)}
                placeholder="e.g. Independence Day"
                style={{ fontSize: 16, padding: 8 }}
              />
              <label style={{ fontWeight: 500 }}>Date</label>
              <input
                type="date"
                value={holidayDate}
                onChange={e => setHolidayDate(e.target.value)}
                style={{ fontSize: 16, padding: 8 }}
              />
              <label style={{ fontWeight: 500 }}>Type</label>
              <select
                value={holidayType}
                onChange={e => setHolidayType(e.target.value)}
                style={{ fontSize: 16, padding: 8 }}
              >
                <option value="Regular Holiday">Regular Holiday</option>
                <option value="Special Non-Working Holiday">Special Non-Working Holiday</option>
              </select>
              <button
                className="admindashboard-modal-submit"
                style={{ marginTop: 16, padding: '10px 0', fontWeight: 600, fontSize: 16, background: '#2583d8', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                onClick={handleAddHoliday}
              >Add Holiday</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Add missing helper functions from HrDashboard
function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(month, year) {
  return new Date(year, month, 1).getDay();
}

// Map of PH holidays to their types
const holidayTypeMap = {
  "New Year's Day": "Regular Holiday",
  "Maundy Thursday": "Regular Holiday",
  "Good Friday": "Regular Holiday",
  "Araw ng Kagitingan": "Regular Holiday",
  "Labor Day": "Regular Holiday",
  "Independence Day": "Regular Holiday",
  "National Heroes Day": "Regular Holiday",
  "Bonifacio Day": "Regular Holiday",
  "Christmas Day": "Regular Holiday",
  "Rizal Day": "Regular Holiday",
  "Feast of Ramadhan": "Regular Holiday",
  "Day of Valor": "Regular Holiday",
  "Last day of the year": "Regular Holiday",
  "Black Saturday": "Special Non-Working Holiday",
  "Ninoy Aquino Day": "Special Non-Working Holiday",
  "All Saints' Day Eve": "Special Non-Working Holiday",
  "All Saints' Day": "Special Non-Working Holiday",
  "Christmas Eve": "Special Non-Working Holiday",
  "New Year's Eve": "Special Non-Working Holiday",
  "Holy Saturday": "Special Non-Working Holiday",
  "Chinese New Year": "Special Non-Working Holiday",
  "Feast of the Immaculate Conception of Mary": "Special Non-Working Holiday",
  // Add more as needed
};

export default AdminDashboard;