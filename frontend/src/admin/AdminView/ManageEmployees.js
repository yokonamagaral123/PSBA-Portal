import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ManageEmployees.css";

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalType, setModalType] = useState(null); // 'view' | 'edit' | null
  const [editForm, setEditForm] = useState({});
  const [removingId, setRemovingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data.employees || []);
    } catch (err) {
      alert("Failed to fetch employees");
    }
  };

  // --- LOGIC FOR PAGINATION ---
  const rowsPerPage = 50;
  const totalRows = employees.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const paginatedEmployees = employees.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 1) return pages;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    if (currentPage <= 2) {
      end = Math.min(totalPages, 5);
    }
    if (currentPage >= totalPages - 1) {
      start = Math.max(1, totalPages - 4);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  useEffect(() => { setCurrentPage(1); }, [employees]);

  const openModal = (employee, type) => {
    setSelectedEmployee(employee);
    setModalType(type);
    setEditForm(employee);
  };
  const closeModal = () => {
    setSelectedEmployee(null);
    setModalType(null);
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/admin/employees/${editForm._id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEmployees();
      closeModal();
      alert("Employee updated successfully!");
    } catch (err) {
      alert("Failed to update employee");
    }
  };
  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to remove this employee?")) return;
    setRemovingId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/admin/employees/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
      alert("Employee removed successfully!");
    } catch (err) {
      alert("Failed to remove employee");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <div className="adminviewattendance-banner">
        <h1 className="dashboard-banner-title">MANAGE EMPLOYEES</h1>
      </div>
      <div className="adminviewattendance-import-searchbar-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button
            className="manage-employees-add-btn"
            onClick={() => navigate("/admin-view/account-creation")}
            style={{ marginBottom: 0 }}
          >
            + Add Employee
          </button>
        </div>
        <div className="adminviewattendance-pagination-bar" style={{ marginLeft: 'auto' }}>
          <button onClick={() => goToPage(Math.max(1, currentPage - 10))} disabled={currentPage === 1} className="adminviewattendance-page-btn">{'<<'}</button>
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="adminviewattendance-page-btn">{'<'}</button>
          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`adminviewattendance-page-btn${page === currentPage ? ' adminviewattendance-page-current' : ''}`}
              disabled={page === currentPage}
            >
              {page}
            </button>
          ))}
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="adminviewattendance-page-btn">{'>'}</button>
          <button onClick={() => goToPage(Math.min(totalPages, currentPage + 10))} disabled={currentPage === totalPages || totalPages === 0} className="adminviewattendance-page-btn">{'>>'}</button>
        </div>
      </div>
      <div className="adminviewattendance-container">
        <div className="table-container">
          <table className="adminviewattendance-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.length === 0 ? (
                <tr><td colSpan={5} className="no-employees">No employees found.</td></tr>
              ) : (
                paginatedEmployees.map((emp, idx) => (
                  <tr key={emp._id}>
                    <td>{(currentPage - 1) * rowsPerPage + idx + 1}</td>
                    <td>{emp.firstName} {emp.middleName} {emp.lastName}</td>
                    <td>{emp.employeeID}</td>
                    <td>{emp.department}</td>
                    <td style={{ position: 'relative' }}>
                      <button
                        className="menu-btn"
                        onClick={() => setOpenMenuId(openMenuId === emp._id ? null : emp._id)}
                        aria-label="Open actions menu"
                      >
                        <span style={{ fontSize: 22, letterSpacing: -2, verticalAlign: 'middle' }}>⋮</span>
                      </button>
                      {openMenuId === emp._id && (
                        <div className="menu-dropdown" ref={menuRef}>
                          <button className="view-btn" onClick={() => { openModal(emp, 'view'); setOpenMenuId(null); }}>View</button>
                          <button className="edit-btn" onClick={() => { openModal(emp, 'edit'); setOpenMenuId(null); }}>Edit</button>
                          <button className="remove-btn" onClick={() => { handleRemove(emp._id); setOpenMenuId(null); }} disabled={removingId === emp._id}>
                            {removingId === emp._id ? "Removing..." : "Remove"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal for View/Edit */}
      {modalType && selectedEmployee && (
        <div className="manage-employees-modal-overlay" onClick={closeModal}>
          <div className="manage-employees-modal" onClick={e => e.stopPropagation()}>
            <button className="manage-employees-modal-close" onClick={closeModal}>&times;</button>
            {modalType === 'view' ? (
              <>
                <h2>Employee Profile</h2>
                <ul className="manage-employees-profile-list">
                  <li><strong>Name:</strong> {selectedEmployee.firstName} {selectedEmployee.middleName} {selectedEmployee.lastName}</li>
                  <li><strong>Employee ID:</strong> {selectedEmployee.employeeID}</li>
                  <li><strong>Department:</strong> {selectedEmployee.department}</li>
                  <li><strong>Email:</strong> {selectedEmployee.email}</li>
                  <li><strong>Mobile Number:</strong> {selectedEmployee.mobileNumber}</li>
                  <li><strong>Job Title:</strong> {selectedEmployee.jobTitle}</li>
                  <li><strong>Employment Type:</strong> {selectedEmployee.employmentType}</li>
                  <li><strong>Status:</strong> {selectedEmployee.employmentStatus}</li>
                  <li><strong>Start Date:</strong> {selectedEmployee.startDate ? selectedEmployee.startDate.slice(0,10) : "N/A"}</li>
                  <li><strong>Home Address:</strong> {selectedEmployee.homeAddress}</li>
                  <li><strong>Nationality:</strong> {selectedEmployee.nationality}</li>
                  <li><strong>Civil Status:</strong> {selectedEmployee.civilStatus}</li>
                  <li><strong>Emergency Contact:</strong> {selectedEmployee.emergencyContactName} ({selectedEmployee.emergencyContactRelation}) - {selectedEmployee.emergencyContactNumber}</li>
                </ul>
              </>
            ) : (
              <>
                <h2>Edit Employee</h2>
                <form className="manage-employees-edit-form" onSubmit={handleEditSave}>
                  <div className="manage-employees-edit-grid">
                    <label>First Name:<input name="firstName" value={editForm.firstName || ''} onChange={handleEditChange} required /></label>
                    <label>Middle Name:<input name="middleName" value={editForm.middleName || ''} onChange={handleEditChange} /></label>
                    <label>Last Name:<input name="lastName" value={editForm.lastName || ''} onChange={handleEditChange} required /></label>
                    <label>Department:<input name="department" value={editForm.department || ''} onChange={handleEditChange} /></label>
                    <label>Job Title:<input name="jobTitle" value={editForm.jobTitle || ''} onChange={handleEditChange} /></label>
                    <label>Email:<input name="email" value={editForm.email || ''} onChange={handleEditChange} required /></label>
                    <label>Mobile Number:<input name="mobileNumber" value={editForm.mobileNumber || ''} onChange={handleEditChange} required /></label>
                    <label>Employment Type:<input name="employmentType" value={editForm.employmentType || ''} onChange={handleEditChange} /></label>
                    <label>Status:<input name="employmentStatus" value={editForm.employmentStatus || ''} onChange={handleEditChange} /></label>
                  </div>
                  <div className="manage-employees-modal-actions">
                    <button type="submit" className="edit-btn">Save</button>
                    <button type="button" className="remove-btn" onClick={closeModal}>Cancel</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ManageEmployees;
