import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import bannerImage from '../../assets/image.png';
import schoolImage from '../../assets/school.png';
import school2Image from '../../assets/school2.png';

const images = [bannerImage, schoolImage, school2Image];

const Dashboard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Automatically change the image every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <>
      {/* Dashboard Banner */}
      <div className="dashboard-banner">
        <h1 className="dashboard-banner-title">DASHBOARD</h1>
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

        <div className="calendar">
          <h3>December 2024</h3>
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
              {/* Calendar cells can be added here */}
            </tbody>
          </table>
        </div>

        <div className="announcements">
          <h3>Announcements</h3>
          <p>No announcements yet.</p>
        </div>

        <div className="todo">
          <h3>To-Do</h3>
          <button>+</button>
        </div>
      </div>
    </>
  );
};

export default Dashboard;