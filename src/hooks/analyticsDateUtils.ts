
import { 
  startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, 
  startOfQuarter, endOfQuarter, 
  startOfYear, endOfYear, 
  addDays 
} from 'date-fns';
import { TimePeriod } from "./analyticsTypes";

export function getPeriodDates(timePeriod: TimePeriod) {
  const currentDate = new Date();
  let startDate, endDate, previousStartDate, previousEndDate;
  switch(timePeriod) {
    case 'week':
      startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
      endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
      previousStartDate = addDays(startDate, -7);
      previousEndDate = addDays(endDate, -7);
      break;
    case 'month':
      startDate = startOfMonth(currentDate);
      endDate = endOfMonth(currentDate);
      previousStartDate = startOfMonth(addDays(startDate, -31));
      previousEndDate = endOfMonth(addDays(startDate, -1));
      break;
    case 'quarter':
      startDate = startOfQuarter(currentDate);
      endDate = endOfQuarter(currentDate);
      previousStartDate = startOfQuarter(addDays(startDate, -92));
      previousEndDate = endOfQuarter(addDays(startDate, -1));
      break;
    case 'year':
      startDate = startOfYear(currentDate);
      endDate = endOfYear(currentDate);
      previousStartDate = startOfYear(addDays(startDate, -366));
      previousEndDate = endOfYear(addDays(startDate, -1));
      break;
  }
  return { startDate, endDate, previousStartDate, previousEndDate };
}

export function calculatePercentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
