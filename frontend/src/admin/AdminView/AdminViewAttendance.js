import React, { useState } from "react";
import "./AdminViewAttendance.css";

const AdminViewAttendance = () => {
  const initialData = [
    {
      id: '000789',
      date: '3/13/25',
      name: 'Geguna, Arvin Joseph',
      schedule: '8:00 - 17:00',
      timeIn: '8:39',
      timeOut: '16:30',
      remarks: 'Late/UT',
    },
    {
      id: '000789',
      date: '3/12/25',
      name: 'Geguna, Arvin Joseph',
      schedule: '8:00 - 17:00',
      timeIn: '7:59',
      timeOut: '17:02',
      remarks: '',
    },
    {
      id: '000789',
      date: '3/11/25',
      name: 'Geguna, Arvin Joseph',
      schedule: '8:00 - 17:00',
      timeIn: '7:52',
      timeOut: '17:10',
      remarks: '',
    },
    {
      id: '000789',
      date: '3/10/25',
      name: 'Geguna, Arvin Joseph',
      schedule: '8:00 - 17:00',
      timeIn: '8:00',
      timeOut: '17:00',
      remarks: '',
    },
    {
      id: '000789',
      date: '3/9/25',
      name: 'Geguna, Arvin Joseph',
      schedule: 'RESTDAY',
      timeIn: '',
      timeOut: '',
      remarks: 'RESTDAY',
    },
  ];

  const editableColumns = [
    { key: 'schedule', label: 'Work Schedule' },
    { key: 'timeIn', label: 'Time In' },
    { key: 'timeOut', label: 'Time Out' },
    { key: 'remarks', label: 'Remarks' },
  ];

  const [attendanceData, setAttendanceData] = useState(initialData);
  const [editCol, setEditCol] = useState(null);
  const [editData, setEditData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");

  const handleEditClick = (colKey) => {
    setEditCol(colKey);
    setEditData(attendanceData.map(row => ({ ...row })));
  };

  const handleInputChange = (rowIdx, colKey, value) => {
    setEditData(prev => prev.map((row, idx) => idx === rowIdx ? { ...row, [colKey]: value } : row));
  };

  const handleSave = () => {
    setAttendanceData(editData);
    setEditCol(null);
  };

  return (
    <>
      <div className="admindashboard-banner">
        <h1 className="dashboard-banner-title">ADMIN VIEW ATTENDANCE</h1>
      </div>
      <div className="adminviewattendance-container">
        <div className="hrviewattendance-searchbar">
          <span role="img" aria-label="filter" style={{ marginRight: 8, fontSize: 18 }}>🔍</span>
          <input
            type="text"
            placeholder="Search by Employee ID, Name, or Date"
            className="hrviewattendance-input"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <table className="adminviewattendance-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Date</th>
              <th>Employee</th>
              {editableColumns.map(({ key, label }) => (
                <th key={key}>
                  <div className="hrviewattendance-header-content">
                    {label}
                    {editCol === key ? (
                      <button
                        type="button"
                        className="hrviewattendance-edit-btn"
                        onClick={handleSave}
                        title={`Save ${label}`}
                      >
                        <span role="img" aria-label="save">💾</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="hrviewattendance-edit-btn"
                        onClick={() => handleEditClick(key)}
                        title={`Edit ${label}`}
                      >
                        <span role="img" aria-label="edit">✏️</span>
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attendanceData
              .filter(row => {
                if (!searchTerm) return true;
                const term = searchTerm.toLowerCase();
                return (
                  row.id.toLowerCase().includes(term) ||
                  row.name.toLowerCase().includes(term) ||
                  row.date.toLowerCase().includes(term)
                );
              })
              .map((row, idx) => (
                <tr key={idx}>
                  <td>{row.id}</td>
                  <td>{row.date}</td>
                  <td>{row.name}</td>
                  {editableColumns.map(({ key }) => (
                    <td key={key}>
                      {editCol === key ? (
                        <input
                          type="text"
                          value={editData[idx][key]}
                          onChange={e => handleInputChange(idx, key, e.target.value)}
                          className="hrviewattendance-input"
                        />
                      ) : (
                        row[key]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            {[...Array(5)].map((_, i) => (
              <tr key={`empty-${i}`}>
                {Array(7).fill().map((_, j) => (
                  <td key={j}>&nbsp;</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminViewAttendance;
