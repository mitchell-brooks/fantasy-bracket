export const formatPointValue = (
  points: number,
  currency: string | null,
  point_value: number
) => {
  if (currency === 'cent') {
    return `$${(points * point_value * 0.01).toFixed(2)}`;
  } else {
    return `${points * point_value} ${currency}`;
  }
};
