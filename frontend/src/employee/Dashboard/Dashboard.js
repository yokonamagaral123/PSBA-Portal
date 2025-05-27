import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import bannerImage from '../../assets/image.png';
import schoolImage from '../../assets/school.png';
import school2Image from '../../assets/school2.png';
import { FaFileAlt, FaCheckCircle, FaHourglassHalf, FaTimesCircle } from "react-icons/fa";

const images = [bannerImage, schoolImage, school2Image];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

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
};

const EmployeeDashboard = () => {
  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);

  // Calendar state
  const today = new Date();
  const [calendar, setCalendar] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });
  const [holidays, setHolidays] = useState([]);

  // To-Do state
  const [todoInput, setTodoInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [todoTime, setTodoTime] = useState("");
  const [todos, setTodos] = useState([]);
  const [showTodoModal, setShowTodoModal] = useState(false);

  // Overlay state for calendar day details
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState(""); // Reintroduced state

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);

  // Requisitions state
  const [requisitions, setRequisitions] = useState([]);

  // Fetch announcements and requisitions from backend on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/announcements")
      .then(res => res.json())
      .then(data => {
        if (data.success) setAnnouncements(data.announcements);
      })
      .catch(err => console.error("Failed to fetch announcements:", err));
    // Fetch employee requisitions (use /api/requisitions/all for consistency with RequisitionHistory)
    const fetchRequisitions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setRequisitions([]);
          return;
        }
        const res = await fetch("http://localhost:5000/api/requisitions/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setRequisitions(data.requisitions || []);
        } else {
          setRequisitions([]);
        }
      } catch (err) {
        setRequisitions([]);
      }
    };
    fetchRequisitions();
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
            time: t.time,
            done: t.done
          })));
        })
        .catch(err => console.error("Failed to fetch todos:", err));
    }
  }, []);

  // Fetch holidays from Nager.Date API and custom holidays from backend for the selected year
  useEffect(() => {
    const fetchAllHolidays = async (year) => {
      let apiHolidays = [];
      let customHolidays = [];
      try {
        // Fetch API holidays
        const apiRes = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/PH`);
        const apiData = await apiRes.json();
        apiHolidays = apiData.map(h => ({
          localName: h.name || h.localName,
          date: h.date,
          type: h.type,
        }));
      } catch (err) {
        console.error("Error fetching API holidays:", err);
      }
      try {
        // Fetch custom holidays from backend
        const customRes = await fetch(`http://localhost:5000/api/holidays/${year}`);
        const customData = await customRes.json();
        customHolidays = (customData.holidays || []).map(h => ({
          localName: h.name,
          date: h.date.length > 10 ? h.date.slice(0, 10) : h.date,
          type: h.type,
          isCustom: true
        }));
      } catch (err) {
        console.error("Error fetching custom holidays:", err);
      }
      // Merge, avoiding duplicates (by date)
      const allHolidays = [...apiHolidays];
      customHolidays.forEach(custom => {
        if (!allHolidays.some(api => new Date(api.date).toDateString() === new Date(custom.date).toDateString())) {
          allHolidays.push(custom);
        }
      });
      setHolidays(allHolidays);
    };
    fetchAllHolidays(calendar.year);
  }, [calendar.year]);

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

  // Calendar navigation
  const prevMonth = () => {
    setCalendar((prev) => {
      let month = prev.month - 1;
      let year = prev.year;
      if (month < 0) {
        month = 11;
        year--;
      }
      return { month, year };
    });
  };
  const nextMonth = () => {
    setCalendar((prev) => {
      let month = prev.month + 1;
      let year = prev.year;
      if (month > 11) {
        month = 0;
        year++;
      }
      return { month, year };
    });
  };

  // To-Do handlers (with modal)
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
  const handleInputChange = (e) => setTodoInput(e.target.value);
  const handleDueDateChange = (e) => setDueDate(e.target.value);
  const handleTodoTimeChange = (e) => setTodoTime(e.target.value);
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
      e.preventDefault();
      handleAddTodo();
    } else if (e.key === "Escape") {
      setShowTodoModal(false);
      setTodoInput("");
      setDueDate("");
      setTodoTime("");
    }
  };
  // Mark as done handler (API)
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

  // Add handleDeleteTodo function (like AdminDashboard)
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
        setTodos((prev) => prev.filter((todo) => todo._id !== id && todo.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete todo:", err);
    }
  };

  // Overlay for calendar day details
  const handleOverlayClose = () => setOverlayOpen(false);

  // Highlight days with due tasks (green if all done, yellow if any not done)
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

  // Build calendar grid (with today dot, holiday, and task highlights)
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
    // Find holiday for this day
    const holiday = holidays.find(h => {
      const hDate = new Date(h.date);
      return hDate.getFullYear() === calendar.year && hDate.getMonth() === calendar.month && hDate.getDate() === day;
    });
    // Use holidayTypeMap if holiday type is missing
    let holidayType = holiday && holiday.type;
    if (holiday && !holidayType && (holiday.localName || holiday.name)) {
      holidayType = holidayTypeMap[holiday.localName] || holidayTypeMap[holiday.name] || '';
    }
    // Class logic: green if all done, yellow if any not done, red if holiday
    let tdClass = "";
    if (hasDue && allDone) tdClass = "employee-dashboard-done-task";
    else if (anyPending) tdClass = "employee-dashboard-due-task";
    else if (holiday) tdClass = "employee-dashboard-holiday";
    cells.push(
      <td
        key={day}
        className={tdClass}
        onClick={() => {
          if (hasDue || holiday) {
            const dateObj = new Date(calendar.year, calendar.month, day);
            setSelectedDayDate(dateObj.toLocaleDateString());
            setOverlayOpen(true);
          }
        }}
        style={{ cursor: hasDue || holiday ? "pointer" : "default" }}
        title={holiday ? `${holiday.localName || holiday.name}${holidayType ? ` (${holidayType})` : ''}` : undefined}
      >
        <span style={{ fontWeight: 400, fontSize: 20, position: 'relative', display: 'inline-block', width: 28, height: 28 }}>
          {day}
          {isToday && (
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-8px',
              width: '10px',
              height: '10px',
              background: '#2583d8',
              borderRadius: '50%',
              zIndex: 2,
              boxShadow: '0 0 2px #2583d8',
              pointerEvents: 'none',
              display: 'inline-block',
            }}></span>
          )}
        </span>
        {holiday && (
          <div className="holiday-name" style={{ color: '#e74c3c', fontWeight: 600, fontSize: 13, marginTop: 2 }}>
            {holiday.localName || holiday.name}
            {holidayType && (
              <span style={{ fontWeight: 400, color: holidayType === 'Regular Holiday' ? '#b71c1c' : '#b71c1c', fontSize: 12, display: 'block', marginTop: 1 }}>
                {holidayType}
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

  // Dashboard stats for employee (match RequisitionHistory logic)
  const leaveApplied = requisitions.filter(r => r.type === "General Request" || r.type === "Leave Request").length;
  const leaveApproved = requisitions.filter(r => r.status === "approved").length;
  const leavePending = requisitions.filter(r => r.status === "pending").length;
  const leaveRejected = requisitions.filter(r => r.status === "declined").length;

  return (
    <>
      {/* Dashboard Banner */}
      <div className="employee-dashboard-banner">
        <h1 className="employee-dashboard-banner-title">DASHBOARD</h1>
      </div>
      <div className="employee-dashboard-widgets">
        {/* Image Carousel */}
        <div className="employee-image-carousel">
          <button className="employee-carousel-button left" onClick={goToPrevious}>
            &#8249;
          </button>
          <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} />
          <button className="employee-carousel-button right" onClick={goToNext}>
            &#8250;
          </button>
          <div className="employee-carousel-dots">
            {images.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(index)}
              ></span>
            ))}
          </div>
        </div>
        {/* Calendar */}
        <div className="employee-calendar">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button className="employee-calendar-nav-btn" onClick={prevMonth}>&lt;</button>
            <h3>{monthNames[calendar.month]} {calendar.year}</h3>
            <button className="employee-calendar-nav-btn" onClick={nextMonth}>&gt;</button>
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
            <tbody>{calendarRows}</tbody>
          </table>
          <div className="employee-dashboard-view-calendar-btn-row">
            <button
              className="employee-dashboard-view-calendar-btn"
              onClick={() => window.location.href = '/schedule'}
              style={{ marginTop: 12, minWidth: 130, background: '#2583d8', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37, 131, 216, 0.10)', height: 40 }}
            >
              View Full Calendar
            </button>
          </div>
        </div>
        {/* Announcements Section */}
        <div className="employee-announcements">
          <div className="employee-announcements-header">
            <h3>Announcements</h3>
            {/* No add button for employees */}
          </div>
          <ul className="employee-announcement-list">
            {announcements.length === 0 && <li>No announcements yet.</li>}
            {announcements.map((item, idx) => {
              let dateStr = item.date ? new Date(item.date).toLocaleDateString() : "";
              let timeStr = item.time ? new Date(`1970-01-01T${item.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
              return (
                <li className="employee-announcement-item" key={item._id || idx}>
                  <span className="employee-announcement-bullet" style={{ color: '#2583d8', fontSize: '1.5rem', marginRight: 10, flexShrink: 0 }}>&#8226;</span>
                  <div className="employee-announcement-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{item.createdBy || "Unknown User"}</strong>
                    </div>
                    <div>{item.message}</div>
                    {(dateStr || timeStr) && (
                      <div className="employee-announcement-date" style={{ color: '#111', marginTop: 2 }}>
                        {dateStr && `Due: ${dateStr}`}
                        {dateStr && timeStr ? ' | ' : ''}
                        {timeStr && `Time: ${timeStr}`}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {/* No announcement modal for employees */}
        </div>
        {/* To-Do Section */}
        <div className="employee-todo">
          <div className="employee-todo-header">
            <h3>To-Do</h3>
            <button onClick={handleAddClick}>+</button>
          </div>
          <ul className="employee-todo-list">
            {todos.length === 0 && <li>No tasks yet.</li>}
            {todos.map((item, idx) => (
              <li key={item._id || item.id || idx} className={item.done ? "done" : ""} data-due={item.dueDate && !item.done ? "true" : undefined}>
                <span className="employee-todo-bullet" style={{ color: '#2583d8', fontSize: '1.5rem', marginRight: 10, flexShrink: 0 }}>&#8226;</span>
                <div className="employee-todo-task-box" style={item.done ? { textDecoration: "line-through", color: "#888" } : {}}>
                  <span className="employee-todo-task-title">{item.task || item.title}</span>
                  {(item.dueDate || item.time || item.dueTime) && (
                    <span className="employee-todo-task-due">
                      {item.dueDate ? `Due: ${new Date(item.dueDate).toLocaleDateString()}` : (item.dueTime ? `Due: ${item.dueDate}` : "")}
                      {(item.dueDate || item.dueTime) && (item.time || item.dueTime) ? ' | ' : ''}
                      {item.time ? `Time: ${new Date(`1970-01-01T${item.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : (item.dueTime ? `Time: ${item.dueTime}` : "")}
                    </span>
                  )}
                </div>
                {!item.done && (
                  <button className="employee-todo-mark-done-btn" onClick={() => handleMarkAsDone(item._id || item.id)} title="Mark as done">
                    <FaCheckCircle style={{ color: "#218838", background: 'none' }} />
                  </button>
                )}
                {/* Add clear (delete) button for all todos */}
                <button
                  className="employee-todo-delete-btn"
                  onClick={() => handleDeleteTodo(item._id || item.id)}
                  title="Delete To-Do"
                  style={{ background: 'none', padding: 0, marginLeft: 8, color: '#e74c3c', fontSize: 18 }}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
          {showTodoModal && (
            <div className="employee-modal-overlay" onClick={handleTodoModalClose}>
              <div className="employee-modal" onClick={e => e.stopPropagation()}>
                <button className="employee-modal-close" onClick={handleTodoModalClose}>&times;</button>
                <h2 style={{ marginBottom: 24, fontWeight: 700, fontSize: 28 }}>Add To-Do</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <input
                    type="text"
                    className="employee-todo-input"
                    value={todoInput}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Enter your task"
                    autoFocus
                  />
                  <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 17 }}>Due Date</label>
                  <input
                    type="date"
                    className="employee-todo-input"
                    value={dueDate}
                    onChange={handleDueDateChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder="dd / mm / yyyy"
                  />
                  <label style={{ fontWeight: 500, marginBottom: 2, fontSize: 17 }}>Time</label>
                  <input
                    type="time"
                    className="employee-todo-input"
                    value={todoTime}
                    onChange={handleTodoTimeChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder="--:-- --"
                  />
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <button
                      className="employee-modal-submit"
                      style={{ flex: 1 }}
                      onClick={handleAddTodo}
                    >Add To-Do</button>
                    <button
                      type="button"
                      className="employee-modal-submit"
                      style={{ flex: 1, background: '#e74c3c', color: '#fff' }}
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
        </div>
        {/* Calendar Day Overlay */}
        {overlayOpen && (
          <div className="employee-modal-overlay" onClick={handleOverlayClose}>
            <div className="employee-modal" onClick={e => e.stopPropagation()}>
              <button
                className="employee-modal-close"
                onClick={handleOverlayClose}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="employee-modal-title">
                {(() => {
                  const dateObj = new Date(selectedDayDate);
                  return `Details for ${dateObj.toLocaleDateString()}`;
                })()}
              </h2>
              {(() => {
                const dateObj = new Date(selectedDayDate);
                const day = dateObj.getDate();
                const month = dateObj.getMonth();
                const year = dateObj.getFullYear();
                const tasks = getTasksForDay(day);
                const holiday = holidays.find(h => {
                  const hDate = new Date(h.date);
                  return hDate.getFullYear() === year && hDate.getMonth() === month && hDate.getDate() === day;
                });
                // Use holidayTypeMap if holiday type is missing
                let holidayType = holiday && holiday.type;
                if (holiday && !holidayType && holiday.localName) {
                  holidayType = holidayTypeMap[holiday.localName] || holidayTypeMap[holiday.name] || '';
                }
                return (
                  <>
                    {holiday && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontWeight: 600, color: '#e74c3c', marginBottom: 4 }}>Holiday:</div>
                        <div style={{
                          background: '#ffeaea',
                          color: '#e74c3c',
                          fontWeight: 600,
                          borderRadius: 6,
                          padding: '6px 8px',
                          marginBottom: 6,
                          display: 'inline-block',
                          fontSize: 15
                        }}>
                          {holiday.localName || holiday.name}
                          <span style={{ fontWeight: 400, color: holidayType === 'Regular Holiday' ? '#1976d2' : '#b71c1c', fontSize: 12, display: 'block', marginTop: 2 }}>
                            {holidayType}
                          </span>
                        </div>
                      </div>
                    )}
                    <div style={{ fontWeight: 600, color: '#2583d8', marginBottom: 4 }}>To-Do(s):</div>
                    <ul className="employee-modal-task-list">
                      {tasks.length === 0 && <li>No tasks due on this day.</li>}
                      {tasks.map((item, idx) => (
                        <li key={idx} style={{
                          marginBottom: 10,
                          listStyle: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: !item.done ? '#fffbe6' : '#e6ffed',
                          borderRadius: 6,
                          padding: '6px 8px',
                          transition: 'background 0.2s'
                        }}>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ fontWeight: 600 }}>{item.task}</div>
                            {item.time && (
                              <div style={{ color: '#111', fontSize: 15 }}>
                                | Time: {new Date(`1970-01-01T${item.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                            {item.done ? (
                              <span style={{ color: '#218838', marginLeft: 8, fontWeight: 600 }}>Done</span>
                            ) : (
                              <span style={{ color: '#e6a700', marginLeft: 8, fontWeight: 600 }}>Pending</span>
                            )}
                          </div>
                          {!item.done && (
                            <button
                              className="employee-todo-mark-done-btn"
                              onClick={async () => {
                                setTodos(prev => prev.map(t => t._id === item._id ? { ...t, done: true } : t));
                                await handleMarkAsDone(item._id);
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
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
      {/* Employee Leave Details */}
      <div className="employee-section-title">Leave Details</div>
      <div className="employee-leave-details-cards">
        <div className="employee-leave-card applied">
          <div className="employee-leave-card-icon" style={{ background: "#009688", color: "#fff" }}>
            <FaFileAlt />
          </div>
          <div className="employee-leave-card-content">
            <div className="employee-leave-card-title">Leave Applied</div>
            <div className="employee-leave-card-value">{leaveApplied}</div>
          </div>
        </div>
        <div className="employee-leave-card approved">
          <div className="employee-leave-card-icon" style={{ background: "#3bb77e", color: "#fff" }}>
            <FaCheckCircle />
          </div>
          <div className="employee-leave-card-content">
            <div className="employee-leave-card-title approved">Leave Approved</div>
            <div className="employee-leave-card-value">{leaveApproved}</div>
          </div>
        </div>
        <div className="employee-leave-card pending">
          <div className="employee-leave-card-icon" style={{ background: "#e6b800", color: "#fff" }}>
            <FaHourglassHalf />
          </div>
          <div className="employee-leave-card-content">
            <div className="employee-leave-card-title pending">Leave Pending</div>
            <div className="employee-leave-card-value">{leavePending}</div>
          </div>
        </div>
        <div className="employee-leave-card rejected">
          <div className="employee-leave-card-icon" style={{ background: "#e74c3c", color: "#fff" }}>
            <FaTimesCircle />
          </div>
          <div className="employee-leave-card-content">
            <div className="employee-leave-card-title rejected">Leave Rejected</div>
            <div className="employee-leave-card-value">{leaveRejected}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboard;