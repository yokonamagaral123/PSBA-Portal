import React, { useState, useEffect, useCallback } from 'react';
import PayrollSidebar from './PayrollSidebar';
import './BasicSalary.css';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const BasicSalary = () => {
  const location = useLocation();
  const employee = location.state?.employee;

  const [isEditing, setIsEditing] = useState(false);
  const [basicSalary, setBasicSalary] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [perMinuteRate, setPerMinuteRate] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    // Calculate derived rates
    const daily = (basicSalary / 30).toFixed(2);
    const hourly = (daily / 8).toFixed(2);
    const perMinute = (hourly / 60).toFixed(2);

    setDailyRate(daily);
    setHourlyRate(hourly);
    setPerMinuteRate(perMinute);

    setIsEditing(false);

    try {
      console.log('Sending data to backend:', {
        employeeID: employee.employeeID,
        employeeName: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
        basicSalary,
        dailyRate: daily,
        hourlyRate: hourly,
        perMinuteRate: perMinute,
      }); // Log data being sent

      // Save to backend API
      await axios.post('/api/salary/save', {
        employeeID: employee.employeeID,
        employeeName: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
        basicSalary,
        dailyRate: daily,
        hourlyRate: hourly,
        perMinuteRate: perMinute,
      });

      // Fetch updated salary details
      const response = await axios.get(`/api/salary/${employee.employeeID}`);
      const { basicSalary: updatedBasicSalary, dailyRate: updatedDailyRate, hourlyRate: updatedHourlyRate, perMinuteRate: updatedPerMinuteRate } = response.data;

      console.log('Fetched updated data:', response.data); // Log fetched data

      // Update state with the fetched data
      setBasicSalary(updatedBasicSalary);
      setDailyRate(updatedDailyRate);
      setHourlyRate(updatedHourlyRate);
      setPerMinuteRate(updatedPerMinuteRate);

      console.log('Salary details saved and updated successfully.');
    } catch (error) {
      console.error('Failed to save or fetch salary details:', error);
    }
  };

  const fetchSalaryDetails = useCallback(async () => {
    try {
      const response = await axios.get(`/api/salary/${employee.employeeID}`);
      const { basicSalary, dailyRate, hourlyRate, perMinuteRate } = response.data;
      setBasicSalary(basicSalary);
      setDailyRate(dailyRate);
      setHourlyRate(hourlyRate);
      setPerMinuteRate(perMinuteRate);
    } catch (error) {
      console.error('Failed to fetch salary details:', error);
    }
  }, [employee]);

  useEffect(() => {
    if (employee) {
      fetchSalaryDetails();
    }
  }, [employee, fetchSalaryDetails]);

  return (
    <div className="payroll-management-layout">
      <PayrollSidebar />
      <div className="payroll-management-content">
        {employee ? (
          <div className="employee-info-horizontal">
            <span><strong>Employee ID:</strong> {employee.employeeID}</span>
            <span className="employee-info-separator">I</span>
            <span><strong>Name:</strong> {employee.firstName} {employee.middleName} {employee.lastName}</span>
            <span className="employee-info-separator">I</span>
            <span><strong>Department:</strong> {employee.department}</span>
          </div>
        ) : (
          <div className="employee-info">No employee selected.</div>
        )}
        <h1>Basic Salary</h1>
        <div className="salary-form">
          <label>
            Basic Salary:
            <input
              type="number"
              value={basicSalary}
              onChange={(e) => setBasicSalary(e.target.value)}
              disabled={!isEditing}
            />
          </label>
          <label>
            Daily Rate:
            <input type="text" value={dailyRate} disabled />
          </label>
          <label>
            Hourly Rate:
            <input type="text" value={hourlyRate} disabled />
          </label>
          <label>
            Per Minute Rate:
            <input type="text" value={perMinuteRate} disabled />
          </label>
          {isEditing ? (
            <button onClick={handleSave}>Save</button>
          ) : (
            <button onClick={handleEdit}>Edit</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicSalary;
