exports.monthDayToWeekDay=(monthDay, year, month)=> {
  // Validate monthDay input (1-31)
  if (monthDay < 1 || monthDay > 31) {
    throw new Error('Day of month must be between 1 and 31');
  }

  // Create a Date object (months are 0-indexed in JavaScript)
  const date = new Date(year, month - 1, monthDay);
  
  // Check if the date is valid (handles cases like Feb 30)
  if (date.getMonth() !== month - 1 || date.getDate() !== monthDay) {
    throw new Error('Invalid date for the specified month and year');
  }

  // Return day of week (0-6, Sunday-Saturday)
  return date.getDay();
}
exports.getMonthDaysForWeekday=(year, month, weekday)=> {
  // Validate inputs
  if (weekday < 0 || weekday > 6) {
    throw new Error('Weekday must be 0-6 (Sunday-Saturday)');
  }
  
  const days = [];
  const date = new Date(year, month - 1, 1); // month is 1-12
  
  // Find first occurrence of the weekday
  while (date.getDay() !== weekday) {
    date.setDate(date.getDate() + 1);
  }
  
  // Get all other occurrences in the month
  while (date.getMonth() === month - 1) {
    days.push(date.getDate()); // Get day of month (1-31)
    date.setDate(date.getDate() + 7); // Jump to next week
  }
  
  return days;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

exports.getDatesFromDayType=(dayType, day, options = {})=> {
  const { referenceDate = new Date(), count = 1 } = options;
  const result = [];
  const currentDate = new Date(referenceDate);

  // Validate inputs
  if (!['week', 'month'].includes(dayType)) {
    throw new Error("dayType must be either 'week' or 'month'");
  }

  if (dayType === 'week' && (day < 0 || day > 6)) {
    throw new Error("For week type, day must be 0-6 (Sunday-Saturday)");
  }

  if (dayType === 'month' && (day < 1 || day > 31)) {
    throw new Error("For month type, day must be 1-31");
  }

  // Find matching dates
  for (let i = 0; i < count; i++) {
    let foundDate;

    if (dayType === 'week') {
      // Find next occurrence of weekday
      foundDate = new Date(currentDate);
      const daysToAdd = (7 + day - foundDate.getDay()) % 7;
      foundDate.setDate(foundDate.getDate() + daysToAdd + (i * 7));
    } else {
      // Handle month day
      foundDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + i, // Move to next month if needed
        Math.min(day, getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth() + i))
      );
    }

    result.push(foundDate);
  }

  return result;
}
exports.getDateOfMonth=(day)=> {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), day);
}

exports.compareTimingDate=(startTime,endTime)=>{
  return [{ startTime: { $lte: startTime }, endTime: { $gt: startTime } },
{ startTime: { $lt: endTime }, endTime: { $gte: endTime } },
{ startTime: { $gte: startTime }, endTime: { $lte: endTime } }]
}