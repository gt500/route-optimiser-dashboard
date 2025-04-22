
import { format } from 'date-fns';
import { TimePeriod } from "./analyticsTypes";

export function formatPeriodKey(dateString: string, timePeriod: TimePeriod) {
  const routeDate = new Date(dateString);
  switch(timePeriod) {
    case 'week':
      return format(routeDate, 'E'); // Mon, Tue, etc.
    case 'month':
      return format(routeDate, 'd MMM'); // 1 Jan, 2 Jan, etc.
    case 'quarter':
    case 'year':
      return format(routeDate, 'MMM'); // Jan, Feb, etc.
    default:
      return format(routeDate, 'MMM d');
  }
}

export function sortByPeriod(periodData: [string, number][], timePeriod: TimePeriod) {
  if (timePeriod === 'week') {
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    periodData.sort((a, b) => dayOrder.indexOf(a[0]) - dayOrder.indexOf(b[0]));
  }
  return periodData;
}
