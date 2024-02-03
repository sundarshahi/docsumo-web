/**
 *
 * @param {number[]} elPosition - The position of elements in array format
 * @param {{height: number, width: number}} docSize - the height and width of the document
 * @returns {Array}
 */
export function getBoundingBoxPercentageValue(elPosition, docSize) {
  const [x1, y1, x2, y2] = elPosition;

  const { width: docWidth, height: docHeight } = docSize;

  return [
    (x1 / docWidth) * 100,
    (y1 / docHeight) * 100,
    (x2 / docWidth) * 100,
    (y2 / docHeight) * 100,
  ];
}
