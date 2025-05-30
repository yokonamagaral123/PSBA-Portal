import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./AdminViewRequisition.css";

const AdminViewRequisition = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editRows, setEditRows] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const location = useLocation();
  const requisitionId = location.state?.requisitionId;
  const rowRefs = useRef({});

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

  useEffect(() => {
    if (requisitionId && rowRefs.current[requisitionId]) {
      rowRefs.current[requisitionId].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [requisitionId, requisitions]);

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
        body: JSON.stringify({ status: row.status, remarks: row.remarks, leavePaymentStatus: row.leavePaymentStatus }),
      });
      const data = await response.json();
      if (response.ok) {
        setRequisitions(prev => prev.map(r =>
          r._id === id
            ? {
                ...r,
                status: row.status,
                remarks: row.remarks,
                leavePaymentStatus: row.leavePaymentStatus,
                lastModifiedByEmployeeID: data.requisition.lastModifiedByEmployeeID,
                lastModifiedByName: data.requisition.lastModifiedByName,
                lastModifiedDate: data.requisition.lastModifiedDate
              }
            : r
        ));
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
      (req.reason && req.reason.toLowerCase().includes(term)) ||
      (req.requestedByName && req.requestedByName.toLowerCase().includes(term)) ||
      (req.status && req.status.toLowerCase().includes(term)) ||
      (req.remarks && req.remarks.toLowerCase().includes(term)) ||
      (req.requestedByEmployeeID && req.requestedByEmployeeID.toLowerCase().includes(term)) ||
      (req.requestedBy && req.requestedBy.employeeID && req.requestedBy.employeeID.toLowerCase().includes(term)) ||
      (req.category && req.category.toLowerCase().includes(term))
    );
  });

  return (
    <>
      <div className="adminview-dashboard-banner">
        <h1 className="dashboard-banner-title">ADMIN VIEW REQUISITION</h1>
      </div>
      <div className="adminview-requisition-container">
        <div className="adminview-requisition-filters" style={{ justifyContent: 'flex-end', marginLeft: 'auto' }}>
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
              <th>Time</th>
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>Type</th>
              <th>Category</th>
              <th>Reason</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Date Requested</th>
              <th>Day Type</th>
              <th>Leave Payment Status</th>
              <th>Remarks</th>
              <th>Supervisor Approval Status</th>
              <th>Admin Approval Status</th>
              <th>Action</th>
              <th>Last Modified</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequisitions.length > 0 ? (
              filteredRequisitions.map((req, index) => {
                const edit = editRows[req._id] || {};
                const isEditing = edit.status !== undefined || edit.remarks !== undefined || edit.leavePaymentStatus !== undefined;
                const highlight = req._id === requisitionId;
                return (
                  <tr key={req._id} ref={el => rowRefs.current[req._id] = el} style={highlight ? { background: '#fffbe6', boxShadow: '0 0 0 2px #ffe082' } : {}}>
                    <td>{req.time ? (req.time.length > 5 ? new Date(`1970-01-01T${req.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : req.time) : ''}</td>
                    <td>{req.requestedByEmployeeID || (req.requestedBy && req.requestedBy.employeeID) || ''}</td>
                    <td>{req.requestedByName || (req.requestedBy && req.requestedBy.name) || (typeof req.requestedBy === "string" ? req.requestedBy : "N/A")}</td>
                    <td>{req.type}</td>
                    <td>{req.category}</td>
                    <td>{req.reason}</td>
                    <td>{req.startDate ? new Date(req.startDate).toLocaleDateString() : ''}</td>
                    <td>{req.endDate ? new Date(req.endDate).toLocaleDateString() : ''}</td>
                    <td>{req.dateRequested ? new Date(req.dateRequested).toLocaleDateString() : ''}</td>
                    <td>{req.dayType || "N/A"}</td>
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
                        className="adminview-requisition-remarks-input"
                      />
                    </td>
                    <td>
                      {/* HR Approval Status: display only, color-coded */}
                      <span
                        className={
                          req.hrApprovalStatus === 'approved'
                            ? 'status-approved'
                            : req.hrApprovalStatus === 'declined'
                            ? 'status-declined'
                            : 'status-pending'
                        }
                        style={{ fontWeight: 500 }}
                      >
                        {req.hrApprovalStatus
                          ? req.hrApprovalStatus.charAt(0).toUpperCase() + req.hrApprovalStatus.slice(1)
                          : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <select
                        value={isEditing ? edit.status : req.status || "pending"}
                        onChange={e => handleEditChange(req._id, "status", e.target.value)}
                        disabled={edit.loading || (isEditing ? (edit.hrApprovalStatus ?? req.hrApprovalStatus) !== "approved" : req.hrApprovalStatus !== "approved")}
                        className={
                          (isEditing ? edit.status : req.status) === 'approved'
                            ? 'status-approved'
                            : (isEditing ? edit.status : req.status) === 'declined'
                            ? 'status-declined'
                            : 'status-pending'
                        }
                        style={{ fontWeight: 500 }}
                      >
                        <option value="pending" className="status-pending">Pending</option>
                        <option value="approved" className="status-approved">Approved</option>
                        <option value="declined" className="status-declined">Declined</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => handleSave(req._id)}
                        disabled={edit.loading || (!isEditing)}
                        className="adminview-requisition-save-btn"
                      >
                        {edit.loading ? "Saving..." : "Save"}
                      </button>
                      {edit.error && <div className="adminview-requisition-error">{edit.error}</div>}
                      {edit.success && <div className="adminview-requisition-success">{edit.success}</div>}
                    </td>
                    <td style={{ minWidth: 120, fontSize: 16, lineHeight: 1.4, color: '#1a355e', background: '#f7fafc', borderLeft: '1px solid #e3e8ee', padding: '10px 8px' }}>
                      <div style={{ fontWeight: 700, fontSize: 17 }}>
                        {req.lastModifiedByEmployeeID || "-"}
                      </div>
                      <div style={{ fontSize: 16, color: '#1976d2', fontWeight: 600 }}>
                        {req.lastModifiedByName || "-"}
                      </div>
                      <div style={{ fontSize: 15, color: '#757575', fontWeight: 500 }}>
                        {req.lastModifiedDate ? new Date(req.lastModifiedDate).toLocaleString() : "-"}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="17">No requisitions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminViewRequisition;
