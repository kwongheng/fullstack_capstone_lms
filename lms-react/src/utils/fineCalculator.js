// src/utils/fineCalculator.js
export const calculateFineAmount = (dueDate, finePerDay = 0.50, maxFine = 20.00) => {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  if (today <= due) return 0;

  const daysOverdue = Math.floor((today - due) / (1000 * 60 * 60 * 24));
  const rawFine = daysOverdue * finePerDay;
  return Math.min(rawFine, maxFine);
};