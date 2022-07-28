export let handleStr = (value, limit) => {
  if (!limit) {
    limit = 40;
  }
  if (!value) return "";
  if (value.length > limit) {
    value = value.substring(0, limit) + "...";
  }
  return value;
};
