import React, { useEffect, useState } from "react";

import "./AdminRequisitionHistory.css";

const AdminRequisitionHistory = () => {
  const [requisitions, setRequisitions] = useState([]);

  useEffect(() => {
    const fetchRequisitions = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/requisitions/all", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setRequisitions(data.requisitions);
        } else {
          console.error("Failed to fetch requisitions:", data.message);
        }
      } catch (err) {
        console.error("Error fetching requisitions:", err);
      }
    };

    fetchRequisitions();
  }, []);

  return (
    <div className="content">
      <h1>All Employee Requisitions</h1>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Department/Leave Type</th>
            <th>Purpose</th>
            <th>Reason</th>
            <th>Date Requested</th>
            <th>Requested By</th>
          </tr>
        </thead>
        <tbody>
          {requisitions.length > 0 ? (
            requisitions.map((req, index) => (
              <tr key={index}>
                <td>{req.type}</td>
                <td>{req.department || req.leaveType}</td>
                <td>{req.purpose}</td>
                <td>{req.reason}</td>
                <td>{new Date(req.dateRequested).toLocaleDateString()}</td>
                <td>{req.requestedByName}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No requisitions found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminRequisitionHistory;