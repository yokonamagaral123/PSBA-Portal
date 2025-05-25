import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminSchedule.css";

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

const AdminSchedule = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [schedule, setSchedule] = useState({});

  // Fetch the schedule for the current user (admin or employee)
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const token = localStorage.getItem("token");
        // Use the correct endpoint for EmployeeDetails
        const res = await axios.get(
          "http://localhost:5000/api/employee/details",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // The schedule is inside res.data.employee.schedule
        setSchedule((res.data.employee && res.data.employee.schedule) || {});
      } catch (err) {
        setSchedule({});
      }
    };
    fetchSchedule();
  }, []);

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

  return (
    <>
      {/* Schedule Banner */}
      <div className="admin-schedule-banner">
        <h1 className="admin-schedule-banner-title">SCHEDULE</h1>
      </div>

      <div className="content">
        <div className="admin-calendar-header">
          <button onClick={prevMonth}>&lt;</button>
          <span>
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button onClick={nextMonth}>&gt;</button>
        </div>
        <div className="admin-calendar-table">
          <div className="admin-calendar-row admin-calendar-days">
            {/* Calendar header: SUN, MON, ... */}
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d, idx) => (
              <div
                className="admin-calendar-cell admin-calendar-day"
                key={d}
                data-daylabel={calendarDayToScheduleDay[idx]}
              >
                {d}
              </div>
            ))}
          </div>
          {weeks.map((week, i) => (
            <div className="admin-calendar-row" key={i}>
              {week.map((date, j) => (
                <div className="admin-calendar-cell admin-calendar-date" key={j}>
                  {date && (
                    <div className="admin-calendar-date-number">{date}</div>
                  )}
                  {/* Show schedule time for this day of week */}
                  <div className="admin-calendar-times">
                    {date &&
                      schedule &&
                      schedule[calendarDayToScheduleDay[j]] &&
                      schedule[calendarDayToScheduleDay[j]].start &&
                      schedule[calendarDayToScheduleDay[j]].end && (
                        <span>
                          {schedule[calendarDayToScheduleDay[j]].start} - {schedule[calendarDayToScheduleDay[j]].end}
                        </span>
                      )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminSchedule;