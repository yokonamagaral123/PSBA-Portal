import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Schedule.css";
import { useAdminData } from "../../admin/AdminDataContext";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Map calendar column index to EmployeeDetails.js day keys
const calendarDayToScheduleDay = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

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

const Schedule = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [schedule, setSchedule] = useState({});
  const [hoveredCell, setHoveredCell] = useState(null); // { weekIdx, dayIdx, rect, data }
  const { holidays, todos, year, setYear, refreshTodos } = useAdminData();

  // Fetch the schedule for the current user (employee)
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/employee/details",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSchedule((res.data.employee && res.data.employee.schedule) || {});
      } catch (err) {
        setSchedule({});
      }
    };
    fetchSchedule();
  }, []);

  // Sync holidays and todos with AdminDataContext
  useEffect(() => {
    if (year !== currentYear) setYear(currentYear);
    refreshTodos();
  }, [currentYear, year, setYear, refreshTodos]);

  // Get first day of the month (0=Sunday)
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  // Get number of days in the month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Generate calendar grid
  const weeks = [];
  let day = 1 - firstDay;
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++, day++) {
      if (day > 0 && day <= daysInMonth) {
        week.push(day);
      } else {
        week.push(null);
      }
    }
    weeks.push(week);
  }

  // Navigation handlers
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  function getCellInfo(date, dayIdx) {
    if (!date) return null;
    const scheduleInfo = schedule && schedule[calendarDayToScheduleDay[dayIdx]];
    return { date, scheduleInfo };
  }

  return (
    <>
      {/* Schedule Banner */}
      <div className="schedule-banner">
        <h1 className="schedule-banner-title">SCHEDULE</h1>
      </div>

      <div className="content">
        <div className="schedule-calendar-header">
          <button onClick={prevMonth}>&lt;</button>
          <span>
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button onClick={nextMonth}>&gt;</button>
        </div>
        <div className="schedule-calendar-table">
          <div className="schedule-calendar-row schedule-calendar-days">
            {/* Calendar header: SUN, MON, ... */}
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d, idx) => (
              <div
                className="schedule-calendar-cell schedule-calendar-day"
                key={d}
                data-daylabel={calendarDayToScheduleDay[idx]}
              >
                {d}
              </div>
            ))}
          </div>
          {weeks.map((week, i) => (
            <div className="schedule-calendar-row" key={i}>
              {week.map((date, j) => {
                let tooltip = '';
                let holiday = null;
                let todosForDay = [];
                if (date) {
                  tooltip += `${monthNames[currentMonth]} ${date}`;
                  if (
                    schedule &&
                    schedule[calendarDayToScheduleDay[j]] &&
                    schedule[calendarDayToScheduleDay[j]].start &&
                    schedule[calendarDayToScheduleDay[j]].end
                  ) {
                    tooltip += `\nTime: ${schedule[calendarDayToScheduleDay[j]].start} – ${schedule[calendarDayToScheduleDay[j]].end}`;
                  }
                  // Find holiday for this date
                  holiday = holidays.find(h => {
                    const hDate = new Date(h.date);
                    return hDate.getFullYear() === currentYear && hDate.getMonth() === currentMonth && hDate.getDate() === date;
                  });
                  if (holiday) {
                    tooltip += `\nEvent: ${holiday.localName}`;
                    if (holiday.type) {
                      tooltip += ` (${holiday.type})`;
                    }
                  }
                  // Find todos for this date
                  todosForDay = todos.filter(t => {
                    if (!t.dueDate) return false;
                    const todoDate = new Date(t.dueDate);
                    return (
                      todoDate.getDate() === date &&
                      todoDate.getMonth() === currentMonth &&
                      todoDate.getFullYear() === currentYear
                    );
                  });
                  if (todosForDay.length > 0) {
                    todosForDay.forEach(t => {
                      tooltip += `\nTo-Do: ${t.task} ${t.done ? '(Done)' : '(Pending)'}`;
                    });
                  }
                }
                // To-Do highlight color
                let todoHighlight = null;
                if (todosForDay.length > 0) {
                  if (todosForDay.every(t => t.done)) {
                    todoHighlight = '#e6ffed'; // green background for all done
                  } else {
                    todoHighlight = '#fffbe6'; // yellow background if any pending
                  }
                }
                return (
                  <div
                    className="schedule-calendar-cell schedule-calendar-date"
                    key={j}
                    style={{
                      position: 'relative',
                      border: holiday ? '2px solid #e74c3c' : undefined,
                      background: todoHighlight,
                      transition: 'background 0.2s',
                    }}
                    title={tooltip || undefined}
                    onMouseEnter={e => {
                      if (!date) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredCell({
                        weekIdx: i,
                        dayIdx: j,
                        rect,
                        data: getCellInfo(date, j),
                        holiday,
                        todosForDay,
                      });
                    }}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {date && (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <span className="schedule-calendar-date-number">{date}</span>
                        {date === today.getDate() &&
                          currentMonth === today.getMonth() &&
                          currentYear === today.getFullYear() && (
                            <span className="schedule-today-dot" style={{
                              position: 'absolute',
                              left: '450%',
                              
                              transform: 'translateX(-50%)',
                              width: 10,
                              height: 10,
                              background: '#1976d2',
                              borderRadius: '50%',
                              display: 'inline-block',
                              zIndex: 2
                            }}></span>
                          )}
                      </div>
                    )}
                    <div className="schedule-calendar-times">
                      {date &&
                        schedule &&
                        schedule[calendarDayToScheduleDay[j]] &&
                        schedule[calendarDayToScheduleDay[j]].start &&
                        schedule[calendarDayToScheduleDay[j]].end && (
                          <span>
                            {schedule[calendarDayToScheduleDay[j]].start} - {schedule[calendarDayToScheduleDay[j]].end}
                          </span>
                        )}
                      {/* Show holiday if exists for this date, styled below the schedule time */}
                      {holiday && (
                        <div
                          className="schedule-calendar-holiday"
                          style={{
                            color: '#e74c3c',
                            fontWeight: 600,
                            fontSize: 13,
                            marginTop: 6,
                            background: 'rgba(231,76,60,0.08)',
                            borderRadius: 5,
                            padding: '2px 6px',
                            display: 'inline-block',
                            letterSpacing: 0.2,
                            boxShadow: '0 1px 4px 0 rgba(231,76,60,0.07)'
                          }}
                          title={holiday.type || holidayTypeMap[holiday.localName] || holidayTypeMap[holiday.name] || undefined}
                        >
                          <span style={{ display: 'block', lineHeight: 1.2 }}>{holiday.localName}</span>
                          <span style={{ fontWeight: 400, fontSize: 11, color: '#b71c1c', display: 'block', marginTop: 1 }}>
                            {holiday.type || holidayTypeMap[holiday.localName] || holidayTypeMap[holiday.name]}
                          </span>
                        </div>
                      )}
                      {/* Show to-dos for this date, with status */}
                      {todosForDay.map((t, idx) => (
                        <span
                          key={idx}
                          className="schedule-calendar-todo"
                          style={{
                            color: t.done ? '#218838' : '#e6a700',
                            fontWeight: 500,
                            fontSize: 12,
                            display: 'block',
                            marginTop: 2,
                          }}
                        >
                          {t.task} {t.done ? '(Done)' : '(Pending)'}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Modal tooltip for hovered cell */}
      {hoveredCell && hoveredCell.data && (
        <div
          className="schedule-calendar-modal-tooltip"
          style={{
            position: 'fixed',
            top: hoveredCell.rect.bottom + 6,
            left: Math.min(
              hoveredCell.rect.left,
              window.innerWidth - 320
            ),
            zIndex: 9999,
            background: '#fff',
            border: '1px solid #1976d2',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(25, 118, 210, 0.13)',
            padding: 16,
            minWidth: 200,
            maxWidth: 320,
            fontSize: 15,
            color: '#222',
            pointerEvents: 'none',
            whiteSpace: 'pre-line',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
            {monthNames[currentMonth]} {hoveredCell.data.date}, {currentYear}
          </div>
          {hoveredCell.holiday && (
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: '#e74c3c', fontWeight: 600 }}>Event:</span> {hoveredCell.holiday.localName}
              {hoveredCell.holiday.type && (
                <span style={{ color: '#b71c1c', fontWeight: 400, fontSize: 13, marginLeft: 4 }}>
                  ({hoveredCell.holiday.type})
                </span>
              )}
            </div>
          )}
          {hoveredCell.data.scheduleInfo && hoveredCell.data.scheduleInfo.start && hoveredCell.data.scheduleInfo.end && (
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: '#1976d2', fontWeight: 600 }}>Time:</span> {hoveredCell.data.scheduleInfo.start} – {hoveredCell.data.scheduleInfo.end}
            </div>
          )}
          {hoveredCell.todosForDay && hoveredCell.todosForDay.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <span style={{ color: '#2583d8', fontWeight: 600 }}>To-Do(s):</span>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {hoveredCell.todosForDay.map((t, idx) => (
                  <li key={idx} style={{ color: t.done ? '#218838' : '#e6a700', fontWeight: 500, fontSize: 14 }}>
                    {t.task} {t.done ? '(Done)' : '(Pending)'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {/* Legend below the calendar */}
      <div style={{ marginTop: 18, fontSize: 14, display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#1976d2', display: 'inline-block' }}></span>
          <span>Today</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 18, height: 18, border: '2px solid #e74c3c', borderRadius: 4, display: 'inline-block', background: '#fff' }}></span>
          <span>Holiday</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 18, height: 18, borderRadius: 4, background: '#e6ffed', display: 'inline-block', border: '1px solid #b2dfdb' }}></span>
          <span>All To-Dos Done</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 18, height: 18, borderRadius: 4, background: '#fffbe6', display: 'inline-block', border: '1px solid #ffe082' }}></span>
          <span>Pending To-Do</span>
        </span>
      </div>
    </>
  );
};

export default Schedule;
