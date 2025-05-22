
export const getTriesDisplayString = (tries: number): string => {
  if (tries === 1) return "Flash (1 try)";
  if (tries === 2) return "2 tries";
  if (tries === 3) return "3 tries";
  if (tries >= 4) return "4+ tries";
  return `${tries} tries`; // Fallback, though should ideally be one of the above
};
