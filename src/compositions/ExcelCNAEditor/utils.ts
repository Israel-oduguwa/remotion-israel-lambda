export const hexToRgba = (hex: string, alpha: number): string => {
  const normalized = hex.replace("#", "");
  const safe =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const bigint = Number.parseInt(safe, 16);
  const red = (bigint >> 16) & 255;
  const green = (bigint >> 8) & 255;
  const blue = bigint & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const stringHash = (input: string): number => {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
};

export const seededIndex = (seed: string, length: number): number => {
  if (length <= 1) {
    return 0;
  }

  return stringHash(seed) % length;
};
