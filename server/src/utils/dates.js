export const parseDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + Number(n));
  return d;
};
