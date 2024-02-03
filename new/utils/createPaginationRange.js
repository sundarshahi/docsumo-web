// util
const range = (start, end) => {
  let length = end - start + 1;
  return Array.from(
    {
      length,
    },
    (_, idx) => idx + start
  );
};

export const LEFT_DOT = { LEFT_DOT: 'left_dot' };
export const RIGHT_DOT = { RIGHT_DOT: 'right_dot' };

/**
 *
 * @param {Object}  paginationData
 * @param {Integer} paginationData.pages           Total Pages
 * @param {Integer} paginationData.currentPage     Current Page (offset + 1)
 * @param {Integer} paginationData.leftRightOffset Number of age numbers to show between Navigating Arrows and Pagination Dots
 * @returns {Array} pageNumbers                    Page Numbers in array form to display
 */
const createPaginationRange = ({
  totalPageCount,
  currentPage,
  siblings = 2,
  leftRightOffset = 3,
}) => {
  const optionsPerPage = leftRightOffset * 2 + siblings * 2 + 1;

  if (totalPageCount <= optionsPerPage) {
    return range(1, totalPageCount);
  } else {
    const showLeftDot = currentPage - siblings > leftRightOffset;
    const showRightDot =
      currentPage + siblings < totalPageCount - leftRightOffset + 1;

    let siblingsArr = range(
      showLeftDot ? currentPage - siblings : leftRightOffset + 1,
      showRightDot ? currentPage + siblings : totalPageCount - leftRightOffset
    );

    const isSiblingsArrShort = siblingsArr.length < siblings * 2 + 1;

    let leftPadding = [];
    let rightPadding = [];

    if (isSiblingsArrShort) {
      if (siblingsArr.length === 0) {
        if (currentPage === 1) {
          siblingsArr = range(
            leftRightOffset + 1,
            leftRightOffset + siblings * 2 + 1
          );
        } else {
          siblingsArr = range(
            totalPageCount - siblings * 2 + 1 - leftRightOffset,
            totalPageCount - leftRightOffset
          );
        }
      }
      if (siblingsArr[0] === leftRightOffset + 1) {
        rightPadding = range(
          siblingsArr[siblingsArr.length - 1] + 1,
          siblingsArr[siblingsArr.length - 1] +
            siblings * 2 +
            1 -
            siblingsArr.length
        );
      } else {
        leftPadding = range(
          siblingsArr[0] - (siblings * 2 + 1 - siblingsArr.length),
          siblingsArr[0] - 1
        );
      }
    }

    const rangeArray = [
      ...range(1, leftRightOffset),
      ...(showLeftDot ? [LEFT_DOT] : []),
      ...leftPadding,
      ...siblingsArr,
      ...rightPadding,
      ...(showRightDot ? [RIGHT_DOT] : []),
      ...range(totalPageCount - leftRightOffset + 1, totalPageCount),
    ];
    return rangeArray;
  }
};

export default createPaginationRange;
