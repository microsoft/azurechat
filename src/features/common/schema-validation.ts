export const refineFromEmpty = (value: string) => {
  if (value.length === 0) {
    return true;
  }
  return value.trim() !== "";
};
