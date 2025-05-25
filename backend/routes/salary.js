const express = require('express');
const router = express.Router();
const SalaryDetails = require('../models/SalaryDetails');

// Endpoint to save salary details
router.post('/save', async (req, res) => {
  try {
    const { employeeID, basicSalary, dailyRate, hourlyRate, perMinuteRate, employeeName } = req.body;

    console.log('Received data:', req.body); // Log received data

    // Check if salary details already exist for the employee
    let salaryDetails = await SalaryDetails.findOne({ employeeID });

    if (salaryDetails) {
      // Update existing record
      salaryDetails.basicSalary = basicSalary;
      salaryDetails.dailyRate = dailyRate;
      salaryDetails.hourlyRate = hourlyRate;
      salaryDetails.perMinuteRate = perMinuteRate;
      salaryDetails.employeeName = employeeName;
      await salaryDetails.save();
    } else {
      // Create new record
      salaryDetails = new SalaryDetails({
        employeeID,
        employeeName,
        basicSalary,
        dailyRate,
        hourlyRate,
        perMinuteRate,
      });
      await salaryDetails.save();
    }

    // Fetch and return the latest salary details after save
    const updatedSalaryDetails = await SalaryDetails.findOne({ employeeID });
    res.status(200).json(updatedSalaryDetails);
  } catch (error) {
    console.error('Error saving salary details:', error); // Log error
    res.status(500).json({ error: 'Failed to save salary details.' });
  }
});

// Endpoint to retrieve salary details
router.get('/:employeeID', async (req, res) => {
  try {
    const { employeeID } = req.params;
    console.log('Fetching salary details for:', employeeID); // Log the employeeID being fetched
    const salaryDetails = await SalaryDetails.findOne({ employeeID });
    console.log('Found salary details:', salaryDetails); // Log the result

    if (!salaryDetails) {
      return res.status(404).json({ error: 'Salary details not found.' });
    }

    res.status(200).json(salaryDetails);
  } catch (error) {
    console.error('Error fetching salary details:', error); // Log error
    res.status(500).json({ error: 'Failed to retrieve salary details.' });
  }
});

module.exports = router;
