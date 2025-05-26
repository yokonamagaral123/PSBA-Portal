import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminViewPayroll.css";
import { useNavigate } from "react-router-dom";

const AdminViewPayroll = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/admin/employees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(res.data.employees || []);
      } catch (err) {
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Get unique departments and positions for filter dropdowns
  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));
  const positions = Array.from(new Set(employees.map(e => e.jobTitle).filter(Boolean)));

  // Filtered and searched employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.employeeID?.toLowerCase().includes(search.toLowerCase()) ||
      `${emp.firstName} ${emp.middleName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept ? emp.department === filterDept : true;
    const matchesPosition = filterPosition ? emp.jobTitle === filterPosition : true;
    return matchesSearch && matchesDept && matchesPosition;
  });

  const handleRowClick = (employee) => {
    navigate('/payroll-management/basic-salary', { state: { employee } });
  };

  return (
    <>
      <div className="adminviewpayroll-header">
        <h1>PAYROLL MANAGEMENT</h1>
      </div>
      <div className="payroll-section payroll-employee-list">
        <h2>Employee List</h2>
        <div className="filters">
          <input
            className="adminviewpayroll-input"
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="adminviewpayroll-select" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((dept, idx) => (
              <option key={idx} value={dept}>{dept}</option>
            ))}
          </select>
          <select className="adminviewpayroll-select" value={filterPosition} onChange={e => setFilterPosition(e.target.value)}>
            <option value="">All Positions</option>
            {positions.map((pos, idx) => (
              <option key={idx} value={pos}>{pos}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-container">
            <table className="payroll-employee-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Position</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp, idx) => (
                  <tr key={emp._id} onClick={() => handleRowClick(emp)}>
                    <td>{idx + 1}</td>
                    <td>{emp.employeeID}</td>
                    <td>{emp.firstName} {emp.middleName} {emp.lastName}</td>
                    <td>{emp.department}</td>
                    <td>{emp.jobTitle}</td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr><td colSpan={5} className="no-employees">No employees found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminViewPayroll;
