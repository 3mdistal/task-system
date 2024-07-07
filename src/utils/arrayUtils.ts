export function* generatePermutations<T>(array: T[]): Generator<T[]> {
  const n = array.length;
  const c = new Array(n).fill(0);
  yield [...array];

  let i = 1;
  while (i < n) {
    if (c[i] < i) {
      const swapIndex = i % 2 === 0 ? 0 : c[i];
      [array[i], array[swapIndex]] = [array[swapIndex], array[i]];
      yield [...array];
      c[i]++;
      i = 1;
    } else {
      c[i] = 0;
      i++;
    }
  }
}

export const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const getAllShuffledPermutations = <T>(array: T[]): T[][] =>
  shuffleArray(Array.from(generatePermutations(array)));
