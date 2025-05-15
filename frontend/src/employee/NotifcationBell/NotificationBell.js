import React, { useState } from "react";
import "./NotificationBell.css";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = [
    "Your leave request has been approved.",
    "New company policy updates are available.",
    "Payroll for April 2025 has been processed.",
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="notification-bell">
      <button className="bell-icon" onClick={toggleDropdown}>
        🔔
        {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
      </button>
      {isOpen && (
        <div className="notification-dropdown">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div key={index} className="notification-item">
                {notification}
              </div>
            ))
          ) : (
            <div className="notification-item">No new notifications</div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;