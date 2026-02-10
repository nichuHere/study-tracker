// Date and Time Utilities

export const getTodayDateIST = () => {
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return istTime.toISOString().split('T')[0];
};

export const getISTNow = () => {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
};

export const convertTo12Hour = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getDayName = (dayNumber) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || '';
};

export const getShortDayName = (dayNumber) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayNumber] || '';
};

export const getDaysUntil = (targetDate) => {
  const today = getTodayDateIST();
  const target = new Date(targetDate);
  const current = new Date(today);
  const diffTime = target - current;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isToday = (dateString) => {
  return dateString === getTodayDateIST();
};

export const isTomorrow = (dateString) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIST = new Date(tomorrow.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return dateString === tomorrowIST.toISOString().split('T')[0];
};

export const formatDisplayDate = (dateString) => {
  if (isToday(dateString)) return 'Today';
  if (isTomorrow(dateString)) return 'Tomorrow';
  return formatDate(dateString);
};

// Calendar Utilities

export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

export const getMonthName = (monthIndex) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex] || '';
};

// Data Processing Utilities

export const sortByDate = (items, dateField = 'date', ascending = true) => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a[dateField]);
    const dateB = new Date(b[dateField]);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const filterByDateRange = (items, startDate, endDate, dateField = 'date') => {
  return items.filter(item => {
    const itemDate = new Date(item[dateField]);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return itemDate >= start && itemDate <= end;
  });
};

export const groupByDate = (items, dateField = 'date') => {
  return items.reduce((acc, item) => {
    const date = item[dateField];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});
};

// Validation Utilities

export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

export const isValidTime = (timeString) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

// String Utilities

export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Array Utilities

export const uniqueById = (items) => {
  const seen = new Set();
  return items.filter(item => {
    const duplicate = seen.has(item.id);
    seen.add(item.id);
    return !duplicate;
  });
};

export const removeItem = (items, id) => {
  return items.filter(item => item.id !== id);
};

export const updateItem = (items, id, updates) => {
  return items.map(item => 
    item.id === id ? { ...item, ...updates } : item
  );
};
