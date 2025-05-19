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

const EmployeeDashboard = () => {
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
  const [todos, setTodos] = useState([]);
  const [showTodoModal, setShowTodoModal] = useState(false);

  // Overlay state for calendar day details
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState("");
  const [selectedDayTasks, setSelectedDayTasks] = useState([]);

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

  // Overlay for calendar day details
  const handleCalendarDayClick = (day) => {
    const dateStr = `${calendar.year}-${String(calendar.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    // Match both YYYY-MM-DD and YYYY-MM-DDTHH:MM:SSZ formats
    const tasks = todos.filter(t => {
      if (!t.dueDate) return false;
      // Some dueDate may be in ISO format, so compare only the date part
      const tDate = t.dueDate.length > 10 ? t.dueDate.slice(0, 10) : t.dueDate;
      return tDate === dateStr;
    });
    setSelectedDayDate(dateStr);
    setSelectedDayTasks(tasks);
    setOverlayOpen(true);
  };
  const handleOverlayClose = () => setOverlayOpen(false);

  // Highlight days with due tasks (green if all done, orange if any not done)
  const dueDaysMap = {};
  todos.forEach(item => {
    if (!item.dueDate) return;
    // Always use only the date part for the map key
    const dateKey = item.dueDate.length > 10 ? item.dueDate.slice(0, 10) : item.dueDate;
    if (!dueDaysMap[dateKey]) dueDaysMap[dateKey] = { done: 0, total: 0 };
    dueDaysMap[dateKey].total++;
    if (item.done) dueDaysMap[dateKey].done++;
  });

  // Build calendar grid
  const daysInMonth = getDaysInMonth(calendar.month, calendar.year);
  const firstDayOfWeek = getFirstDayOfWeek(calendar.month, calendar.year);
  const calendarRows = [];
  let cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<td key={`empty-${i}`}></td>);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${calendar.year}-${String(calendar.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    let cellClass = "employee-calendar-cell";
    if (dueDaysMap[dateStr]) {
      if (dueDaysMap[dateStr].done === dueDaysMap[dateStr].total) cellClass += " employee-dashboard-done-task";
      else cellClass += " employee-dashboard-due-task";
    }
    const isToday =
      day === today.getDate() &&
      calendar.month === today.getMonth() &&
      calendar.year === today.getFullYear();
    const isSelected = selectedDayDate === dateStr;
    if (isSelected) cellClass += " employee-calendar-selected";
    cells.push(
      <td
        key={day}
        className={cellClass.trim()}
        style={{ cursor: 'pointer', position: 'relative' }}
        onClick={() => handleCalendarDayClick(day)}
      >
        {day}
        {isToday && (
          <span className="employee-calendar-today-dot"></span>
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
                  <button className="employee-todo-mark-done-btn" onClick={() => handleMarkAsDone(item._id || item.id)} title="Mark as done">✔</button>
                )}
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
                  <button
                    className="employee-modal-submit"
                    onClick={handleAddTodo}
                  >Add To-Do</button>
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
                Task for {selectedDayDate}
              </h2>
              <ul className="employee-modal-task-list">
                {selectedDayTasks.length === 0 && <li className="employee-modal-task-empty">No tasks for this day.</li>}
                {selectedDayTasks.map((item, idx) => {
                  const isPending = !item.done;
                  return (
                    <li
                      key={item._id || item.id || idx}
                      className={`employee-modal-task-card${isPending ? ' pending' : ' done'}`}
                    >
                      <div className="employee-modal-task-main">
                        <span className="employee-modal-task-title">{item.task || item.title}</span>
                        {(item.time || item.dueTime) && (
                          <span className="employee-modal-task-time">
                            | Time: {item.time ? new Date(`1970-01-01T${item.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : item.dueTime}
                          </span>
                        )}
                        <span className={`employee-modal-task-status${isPending ? ' pending' : ' done'}`}>
                          {isPending ? 'Pending' : 'Done'}
                        </span>
                      </div>
                      <button
                        className="employee-modal-task-check"
                        disabled={!isPending}
                        title={isPending ? 'Mark as done' : 'Done'}
                        onClick={async () => {
                          if (!isPending) return;
                          await handleMarkAsDone(item._id || item.id);
                          // Refresh modal tasks after marking as done
                          const dateStr = selectedDayDate;
                          const updatedTasks = todos.filter(t => {
                            if (!t.dueDate) return false;
                            const tDate = t.dueDate.length > 10 ? t.dueDate.slice(0, 10) : t.dueDate;
                            return tDate === dateStr;
                          });
                          setSelectedDayTasks(updatedTasks);
                        }}
                      >
                        <FaCheckCircle />
                      </button>
                    </li>
                  );
                })}
              </ul>
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