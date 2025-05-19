import React, { useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import bannerImage from '../../assets/image.png';
import schoolImage from '../../assets/school.png';
import school2Image from '../../assets/school2.png';
import "./HrDashboard.css";

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
  const [showInput, setShowInput] = useState(false);
  const [todoInput, setTodoInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [todos, setTodos] = useState([]);

  // Overlay state for calendar day details
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

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
          if (data.success) setTodos(data.todos.map(t => ({
            _id: t._id,
            task: t.task,
            dueDate: t.dueDate,
            done: t.done
          })));
        })
        .catch(err => console.error("Failed to fetch todos:", err));
    }
  }, []);

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

    // Class logic: green if all done, orange if any not done
    let tdClass = "";
    if (isToday && hasDue && allDone) tdClass = "today done-task";
    else if (isToday && hasDue) tdClass = "today due-task";
    else if (isToday) tdClass = "today";
    else if (hasDue && allDone) tdClass = "done-task";
    else if (hasDue) tdClass = "due-task";

    cells.push(
      <td
        key={day}
        className={tdClass}
        onClick={() => {
          setSelectedDay(day);
          setOverlayOpen(true);
        }}
        style={{ cursor: "pointer" }}
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
    setShowInput(true);
    setDueDate("");
    setTodoInput("");
  };

  const handleInputChange = (e) => {
    setTodoInput(e.target.value);
  };

  const handleDueDateChange = (e) => {
    setDueDate(e.target.value);
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
      body: JSON.stringify({ task: todoInput.trim(), dueDate: dueDate || null })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setTodos(prev => [{
          _id: data.todo._id,
          task: data.todo.task,
          dueDate: data.todo.dueDate,
          done: data.todo.done
        }, ...prev]);
      })
      .catch(err => console.error("Failed to add todo:", err));
    setTodoInput("");
    setDueDate("");
    setShowInput(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddTodo();
    }
    if (e.key === "Escape") {
      setShowInput(false);
      setTodoInput("");
      setDueDate("");
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

        {/* Overlay for selected day */}
        {overlayOpen && (
          <div className="calendar-overlay">
            <div className="calendar-overlay-content">
              <button className="calendar-overlay-close" onClick={() => setOverlayOpen(false)}>
                &times;
              </button>
              <h2>
                {monthNames[calendar.month]} {selectedDay}, {calendar.year}
              </h2>
              <h4>Tasks Due:</h4>
              <ul>
                {getTasksForDay(selectedDay).length === 0 && (
                  <li>No tasks due on this day.</li>
                )}
                {getTasksForDay(selectedDay).map((task, idx) => (
                  <li key={idx}>
                    {task.task}
                    {task.done && (
                      <span style={{ color: "#218838", marginLeft: 8 }}>(Done)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

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
        <div className="hrdashboard-todo">
          <div className="hrdashboard-todo-header">
            <h3>To-Do</h3>
            <button onClick={handleAddClick}>+</button>
          </div>
          {showInput && (
            <div className="hrdashboard-todo-input-row">
              <input
                type="text"
                className="hrdashboard-todo-input"
                value={todoInput}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                autoFocus
                placeholder="Enter your task"
                style={{ flex: 2 }}
              />
              <input
                type="date"
                className="hrdashboard-todo-input"
                value={dueDate}
                onChange={handleDueDateChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Due date"
                style={{ flex: 1 }}
              />
              <button
                className="hrdashboard-todo-btn hrdashboard-todo-check-btn"
                onClick={handleAddTodo}
                title="Add To-Do"
              >
                <FaCheckCircle />
              </button>
            </div>
          )}
          <ul className="hrdashboard-todo-list">
            {todos.map((item, idx) => (
              <li key={item._id || idx} className={item.done ? "done" : ""}>
                <span className="hrdashboard-todo-bullet">&#8226;</span>
                <div
                  className="hrdashboard-todo-task-box"
                  style={item.done ? { textDecoration: "line-through", color: "#888" } : {}}
                >
                  <div className="hrdashboard-todo-task-title">{item.task}</div>
                  {item.dueDate && (
                    <div className="hrdashboard-todo-task-due">
                      (Due: {new Date(item.dueDate).toLocaleDateString()})
                    </div>
                  )}
                </div>
                {!item.done && (
                  <button
                    className="hrdashboard-todo-mark-done-btn"
                    onClick={() => handleMarkAsDone(item._id)}
                    title="Mark as done"
                  >
                    <FaCheckCircle style={{ color: "#218838" }} />
                  </button>
                )}
                {/* No check icon when done */}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default HrDashboard;