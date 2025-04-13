// Average life expectancy in years (can be adjusted)
const LIFE_EXPECTANCY = 75;

export function calculateTimeRemaining(birthdate: string, birthTime?: string) {
  const birthDate = new Date(birthdate);
  if (birthTime) {
    const [hours, minutes] = birthTime.split(':').map(Number);
    birthDate.setHours(hours, minutes);
  }
  
  const now = new Date();
  const ageInMilliseconds = now.getTime() - birthDate.getTime();
  const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
  
  const remainingYears = LIFE_EXPECTANCY - ageInYears;
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

export function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}