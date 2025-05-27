import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AdminDataContext = createContext();

export const useAdminData = () => useContext(AdminDataContext);

export const AdminDataProvider = ({ children }) => {
  const today = new Date();
  const [holidays, setHolidays] = useState([]);
  const [todos, setTodos] = useState([]);
  const [year, setYear] = useState(today.getFullYear());

  // Fetch holidays (API + custom)
  const fetchAllHolidays = useCallback(async (fetchYear = year) => {
    let apiHolidays = [];
    let customHolidays = [];
    try {
      const apiRes = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${fetchYear}/PH`);
      const apiData = await apiRes.json();
      apiHolidays = apiData.map(h => ({
        localName: h.name || h.localName,
        date: h.date,
        type: h.type,
      }));
    } catch (err) {
      console.error("Error fetching API holidays:", err);
    }
    try {
      const customRes = await fetch(`http://localhost:5000/api/holidays/${fetchYear}`);
      const customData = await customRes.json();
      customHolidays = (customData.holidays || []).map(h => ({
        localName: h.name,
        date: h.date,
        type: h.type,
        isCustom: true
      }));
    } catch (err) {
      console.error("Error fetching custom holidays:", err);
    }
    // Merge, avoiding duplicates (by date)
    const allHolidays = [...apiHolidays];
    customHolidays.forEach(custom => {
      if (!allHolidays.some(api => new Date(api.date).toDateString() === new Date(custom.date).toDateString())) {
        allHolidays.push(custom);
      }
    });
    setHolidays(allHolidays);
  }, [year]);

  // Fetch todos
  const fetchTodos = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await fetch("http://localhost:5000/api/todos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setTodos(data.todos);
      } catch (err) {
        console.error("Failed to fetch todos:", err);
      }
    }
  }, []);

  // Initial fetch and on year change
  useEffect(() => {
    fetchAllHolidays(year);
  }, [year, fetchAllHolidays]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Expose methods to refresh data
  const setYearAndFetch = (newYear) => {
    setYear(newYear);
  };
  const refreshTodos = () => {
    fetchTodos();
  };

  return (
    <AdminDataContext.Provider value={{ holidays, todos, year, setYear: setYearAndFetch, refreshTodos }}>
      {children}
    </AdminDataContext.Provider>
  );
};
