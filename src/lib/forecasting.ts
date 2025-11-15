import { addMinutes, differenceInDays } from "date-fns";

export function depletionForecast(pillCount: number, dosesPerDay: number) {
  if (dosesPerDay <= 0) return null;
  const days = Math.floor(pillCount / dosesPerDay);
  return { daysRemaining: days };
}
