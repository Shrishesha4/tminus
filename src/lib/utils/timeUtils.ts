// Default life expectancy in years (can be adjusted by user)
export const DEFAULT_LIFE_EXPECTANCY = 75;

export function calculateTimeRemaining(birthdate: string, birthTime?: string, lifeExpectancy?: number) {
  const birthDate = new Date(birthdate);
  if (birthTime) {
    const [hours, minutes] = birthTime.split(':').map(Number);
    birthDate.setHours(hours, minutes);
  }
  
  const now = new Date();
  const ageInMilliseconds = now.getTime() - birthDate.getTime();
  const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
  
  // Use custom life expectancy if provided, otherwise use default
  const effectiveLifeExpectancy = lifeExpectancy || DEFAULT_LIFE_EXPECTANCY;
  
  const remainingYears = effectiveLifeExpectancy - ageInYears;
  const remainingDays = remainingYears * 365.25;
  const remainingWeeks = remainingYears * 52.143;
  const remainingMonths = remainingYears * 12;
  
  return {
    years: Math.max(0, Math.floor(remainingYears)),
    months: Math.max(0, Math.floor(remainingMonths)),
    weeks: Math.max(0, Math.floor(remainingWeeks)),
    days: Math.max(0, Math.floor(remainingDays))
  };
}

// Get the current date in YYYY-MM-DD format
export function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Get the current week number in the year
export function getCurrentWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek) + 1;
}

// Get the current month number (1-12)
export function getCurrentMonth() {
  return new Date().getMonth() + 1;
}

// Get the current year
export function getCurrentYear() {
  return new Date().getFullYear();
}

// Generate a unique ID for a time period
export function generateTimePeriodId(type: 'day' | 'week' | 'month' | 'year') {
  const now = new Date();
  
  switch (type) {
    case 'day':
      // Include time with seconds for more precise day entries
      return `day-${now.toISOString().split('.')[0].replace(/[T:]/g, '-')}`;
    case 'week':
      return `week-${now.getFullYear()}-${getCurrentWeek()}`;
    case 'month':
      return `month-${now.getFullYear()}-${now.getMonth() + 1}`;
    case 'year':
      return `year-${now.getFullYear()}`;
    default:
      return '';
  }
}

// Format date with time including seconds
export function formatDateTime(date: Date) {
  return `${formatDate(date)} at ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}