import React, { useEffect, useState } from "react";
import "./AdminViewRequisition.css";

const AdminViewRequisition = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editRows, setEditRows] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchRequisitions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setRequisitions([]);
          return;
        }
        const response = await fetch("http://localhost:5000/api/requisitions/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setRequisitions(data.requisitions);
        } else {
          setRequisitions([]);
        }
      } catch {
        setRequisitions([]);
      }
    };
    fetchRequisitions();
  }, []);

  const handleEditChange = (id, field, value) => {
    setEditRows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
        error: undefined,
        success: undefined
      }
    }));
  };

  const handleSave = async (id) => {
    const row = editRows[id];
    if (!row) return;
    setEditRows(prev => ({ ...prev, [id]: { ...row, loading: true, error: undefined, success: undefined } }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/requisitions/update/${id}` , {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: row.status, remarks: row.remarks }),
      });
      const data = await response.json();
      if (response.ok) {
        setRequisitions(prev => prev.map(r => r._id === id ? { ...r, status: row.status, remarks: row.remarks } : r));
        setEditRows(prev => ({ ...prev, [id]: { ...row, loading: false, success: "Saved!" } }));
      } else {
        setEditRows(prev => ({ ...prev, [id]: { ...row, loading: false, error: data.message || "Failed to update" } }));
      }
    } catch (err) {
      setEditRows(prev => ({ ...prev, [id]: { ...row, loading: false, error: "Network error" } }));
    }
  };

  const filteredRequisitions = requisitions.filter(req => {
    if (statusFilter !== "all" && req.status !== statusFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (req.type && req.type.toLowerCase().includes(term)) ||
      (req.department && req.department.toLowerCase().includes(term)) ||
      (req.leaveType && req.leaveType.toLowerCase().includes(term)) ||
      (req.purpose && req.purpose.toLowerCase().includes(term)) ||
      (req.reason && req.reason.toLowerCase().includes(term)) ||
      (req.requestedByName && req.requestedByName.toLowerCase().includes(term)) ||
      (req.status && req.status.toLowerCase().includes(term)) ||
      (req.remarks && req.remarks.toLowerCase().includes(term)) ||
      (req.requestedByEmployeeID && req.requestedByEmployeeID.toLowerCase().includes(term)) ||
      (req.requestedBy && req.requestedBy.employeeID && req.requestedBy.employeeID.toLowerCase().includes(term))
    );
  });

  return (
    <>
      <div className="adminview-dashboard-banner">
        <h1 className="dashboard-banner-title">ADMIN VIEW REQUISITION</h1>
      </div>
      <div className="adminview-requisition-container">
        <div className="adminview-requisition-filters">
          <input
            type="text"
            placeholder="Search by Type, Department, Purpose, Status, etc."
            className="adminview-requisition-input"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="adminview-requisition-status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>
        </div>
        <table className="adminview-requisition-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Type</th>
              <th>Department/Leave Type</th>
              <th>Purpose</th>
              <th>Reason</th>
              <th>Date Requested</th>
              <th>Requested By</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequisitions.length > 0 ? (
              filteredRequisitions.map((req, index) => {
                const edit = editRows[req._id] || {};
                const isEditing = edit.status !== undefined || edit.remarks !== undefined;
                return (
                  <tr key={req._id}>
                    <td>{req.requestedByEmployeeID || (req.requestedBy && req.requestedBy.employeeID) || ''}</td>
                    <td>{req.type}</td>
                    <td>{req.department || req.leaveType}</td>
                    <td>{req.purpose}</td>
                    <td>{req.reason}</td>
                    <td>{req.dateRequested ? new Date(req.dateRequested).toLocaleDateString() : ''}</td>
                    <td>{req.requestedByName || (req.requestedBy && req.requestedBy.name) || (typeof req.requestedBy === "string" ? req.requestedBy : "N/A")}</td>
                    <td>
                      <select
                        value={isEditing ? edit.status : req.status || "pending"}
                        onChange={e => handleEditChange(req._id, "status", e.target.value)}
                        disabled={edit.loading}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="declined">Declined</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={isEditing ? edit.remarks ?? "" : req.remarks ?? ""}
                        onChange={e => handleEditChange(req._id, "remarks", e.target.value)}
                        disabled={edit.loading}
                        placeholder="Add remarks"
                        style={{ width: "120px" }}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => handleSave(req._id)}
                        disabled={edit.loading || (!isEditing)}
                        style={{ minWidth: 60 }}
                      >
                        {edit.loading ? "Saving..." : "Save"}
                      </button>
                      {edit.error && <div style={{ color: "red", fontSize: 12 }}>{edit.error}</div>}
                      {edit.success && <div style={{ color: "green", fontSize: 12 }}>{edit.success}</div>}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10">No requisitions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminViewRequisition;
