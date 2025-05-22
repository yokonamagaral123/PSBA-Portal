import React, { useEffect, useState } from "react";
import "./HrRequisitionHistory.css";

const HrRequisitionHistory = () => {
  const [requisitions, setRequisitions] = useState([]);

  useEffect(() => {
    const fetchRequisitions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error("No token found. Please log in.");
          setRequisitions([]);
          return;
        }
        const response = await fetch("http://localhost:5000/api/requisitions/admin-hr-history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setRequisitions(data.requisitions);
        } else {
          console.error("Failed to fetch requisitions:", data.message);
          setRequisitions([]);
        }
      } catch (err) {
        console.error("Error fetching requisitions:", err);
        setRequisitions([]);
      }
    };

    fetchRequisitions();
  }, []);

  return (
    <>
      {/* HR Requisition History Banner */}
      <div className="requisition-history-banner">
        <h1 className="requisition-history-banner-title">HR REQUISITION HISTORY</h1>
      </div>

      {/* HR Requisition History Content */}
      <div className="content">
        <h1>Requisition History</h1>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>HR Name</th>
              <th>Type</th>
              <th>Department/Leave Type</th>
              <th>Purpose</th>
              <th>Reason</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Date Requested</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Day Type</th>
              <th>Leave Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {requisitions.length > 0 ? (
              requisitions.map((req, index) => (
                <tr key={index}>
                  <td>{req.time ? (req.time.length > 5 ? new Date(`1970-01-01T${req.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : req.time) : ''}</td>
                  <td>{req.requestedByName ||
                    (req.requestedBy && req.requestedBy.name) ||
                    (req.requestedBy && typeof req.requestedBy === "string" ? req.requestedBy : "N/A")}
                  </td>
                  <td>{req.type}</td>
                  <td>{req.department || req.leaveType}</td>
                  <td>{req.purpose}</td>
                  <td>{req.reason}</td>
                  <td>{req.startDate ? new Date(req.startDate).toLocaleDateString() : ''}</td>
                  <td>{req.endDate ? new Date(req.endDate).toLocaleDateString() : ''}</td>
                  <td>{new Date(req.dateRequested).toLocaleDateString()}</td>
                  <td style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                    {req.status || 'Pending'}
                  </td>
                  <td>{req.remarks || ''}</td>
                  <td>{req.dayType || 'N/A'}</td>
                  <td>{req.leavePaymentStatus || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13">No requisitions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default HrRequisitionHistory;
