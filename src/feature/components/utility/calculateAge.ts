export function calculateAge(dob?: string | null): string | number {
  if (!dob) return "--";
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return "--";
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return isNaN(age) || age < 0 ? "--" : age;
}