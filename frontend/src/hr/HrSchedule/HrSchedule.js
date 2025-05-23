import React, { useState } from "react";
import "./HrSchedule.css";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const HrSchedule = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

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
      {/* Schedule Banner (copied from Attendance) */}
      <div className="hr-schedule-banner">
        <h1 className="hr-schedule-banner-title">SCHEDULE</h1>
      </div>

      <div className="content">
        <div className="hr-calendar-header">
          <button onClick={prevMonth}>&lt;</button>
          <span>
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button onClick={nextMonth}>&gt;</button>
        </div>
        <div className="hr-calendar-table">
          <div className="hr-calendar-row hr-calendar-days">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
              <div className="hr-calendar-cell hr-calendar-day" key={d}>{d}</div>
            ))}
          </div>
          {weeks.map((week, i) => (
            <div className="hr-calendar-row" key={i}>
              {week.map((date, j) => (
                <div className="hr-calendar-cell hr-calendar-date" key={j}>
                  {date && (
                    <div className="hr-calendar-date-number">{date}</div>
                  )}
                  {/* Space for schedule times */}
                  <div className="hr-calendar-times"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HrSchedule;