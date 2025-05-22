import React, { useEffect, useState } from "react";
import "./HrViewRequisition.css";
const HrViewRequisition = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editRows, setEditRows] = useState({}); // { [requisitionId]: { status, remarks, loading, error, success } }
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
        body: JSON.stringify({
          status: row.status,
          remarks: row.remarks,
          hrApprovalStatus: row.hrApprovalStatus // <-- ensure this is sent
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setRequisitions(prev => prev.map(r => r._id === id ? { ...r, status: row.status, remarks: row.remarks, hrApprovalStatus: row.hrApprovalStatus } : r));
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
      <div className="dashboard-banner">
        <h1 className="dashboard-banner-title">HR VIEW REQUISITION</h1>
      </div>
      <div className="hrviewattendance-container">
        <div className="hrviewattendance-searchbar" style={{ gap: 12 }}>
          <input
            type="text"
            placeholder="Search by Type, Department, Purpose, Status, etc."
            className="hrviewattendance-input"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="hrviewattendance-status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: 8, border: '1.5px solid #b0bec5', fontSize: '1rem', background: '#f7fafc' }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>
        </div>
        <table className="hrviewattendance-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>Type</th>
              <th>Department/Leave Type</th>
              <th>Purpose</th>
              <th>Reason</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Date Requested</th>
              <th>Day Type</th>
              <th>Leave Payment Status</th>
              <th>Remarks</th>
              <th>HR Approval Status</th>
              <th>Admin Approval Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequisitions.length > 0 ? (
              filteredRequisitions.map((req, index) => {
                const edit = editRows[req._id] || {};
                const isEditing = edit.status !== undefined || edit.remarks !== undefined || edit.hrApprovalStatus !== undefined;
                // Color coding for statuses
                const getStatusClass = (status) => {
                  if (!status || status === 'pending') return 'status-pending';
                  if (status === 'approved') return 'status-approved';
                  if (status === 'declined') return 'status-declined';
                  return '';
                };
                return (
                  <tr key={req._id}>
                    <td>{req.time ? (req.time.length > 5 ? new Date(`1970-01-01T${req.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : req.time) : ''}</td>
                    <td>{req.requestedByEmployeeID || (req.requestedBy && req.requestedBy.employeeID) || ''}</td>
                    <td>{req.requestedByName || (req.requestedBy && req.requestedBy.name) || (typeof req.requestedBy === "string" ? req.requestedBy : "N/A")}</td>
                    <td>{req.type}</td>
                    <td>{req.department || req.leaveType}</td>
                    <td>{req.purpose}</td>
                    <td>{req.reason}</td>
                    <td>{req.startDate ? new Date(req.startDate).toLocaleDateString() : ''}</td>
                    <td>{req.endDate ? new Date(req.endDate).toLocaleDateString() : ''}</td>
                    <td>{req.dateRequested ? new Date(req.dateRequested).toLocaleDateString() : ''}</td>
                    <td>{req.dayType || 'N/A'}</td>
                    <td>
                      <select
                        value={isEditing ? (edit.leavePaymentStatus ?? req.leavePaymentStatus ?? "N/A") : (req.leavePaymentStatus ?? "N/A")}
                        onChange={e => handleEditChange(req._id, "leavePaymentStatus", e.target.value)}
                        disabled={edit.loading}
                      >
                        <option value="N/A">N/A</option>
                        <option value="with pay">With Pay</option>
                        <option value="without pay">Without Pay</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={isEditing ? edit.remarks ?? "" : req.remarks ?? ""}
                        onChange={e => handleEditChange(req._id, "remarks", e.target.value)}
                        disabled={edit.loading}
                        placeholder="Add remarks"
                        className="hrviewattendance-remarks-input"
                      />
                    </td>
                    <td>
                      <select
                        value={isEditing ? edit.hrApprovalStatus ?? req.hrApprovalStatus ?? "pending" : req.hrApprovalStatus ?? "pending"}
                        onChange={e => handleEditChange(req._id, "hrApprovalStatus", e.target.value)}
                        disabled={edit.loading}
                        className={getStatusClass(isEditing ? edit.hrApprovalStatus ?? req.hrApprovalStatus : req.hrApprovalStatus)}
                        style={{ fontWeight: 500 }}
                      >
                        <option value="pending" className="status-pending">Pending</option>
                        <option value="approved" className="status-approved">Approved</option>
                        <option value="declined" className="status-declined">Declined</option>
                      </select>
                    </td>
                    <td>
                      {/* Admin Approval Status: view only, color-coded */}
                      <span
                        className={getStatusClass(req.status)}
                        style={{ fontWeight: 500 }}
                      >
                        {req.status ? req.status.charAt(0).toUpperCase() + req.status.slice(1) : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleSave(req._id)}
                        disabled={edit.loading || (!isEditing)}
                        className="hrviewattendance-save-btn"
                        style={{ display: isEditing ? undefined : 'none' }}
                      >
                        {edit.loading ? "Saving..." : "Save"}
                      </button>
                      {edit.error && <div className="hrviewattendance-error">{edit.error}</div>}
                      {edit.success && <div className="hrviewattendance-success">{edit.success}</div>}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="16">No requisitions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default HrViewRequisition;
