/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';

import cx from 'classnames';
import * as utils from 'new/utils';
import { LEFT_DOT, RIGHT_DOT } from 'new/utils/createPaginationRange';
import PropTypes from 'prop-types';

import { PaginationButton } from './PaginationButton';

import styles from './Pagination.scss';

/**
 * Pagination Component
 * @param {Object}                 paginationData                   - Object Containing parameters for Pagination
 * @param {Number}                 paginationData.totalPageCount    - Total number of Items
 * @param {Number}                 currentPage                      - Current Opened Page
 * @param {Number}                 [paginationData.leftRightOffset] - Number of age numbers to show between Navigating Arrows and Pagination Dots
 * @param {Number}                 [paginationData.siblings]        - Number of pagenumbers to show beside currentPage and between 2 pagination Dots.
 * @param {function(Number):void}  paginationData.onPageChange()    - Callback to update the Offset on page change
 */
const Pagination = ({
  totalPageCount,
  leftRightOffset = 3,
  siblings = 3,
  currentPage = 0,
  onPageChange,
}) => {
  const [paginationArr, setPaginationArr] = useState([]);

  const shiftByNumber = Math.floor(totalPageCount / 5);

  // Listens for pagination data changes and re computes pagination array
  useEffect(() => {
    setPaginationArr(
      utils.createPaginationRange({
        totalPageCount,
        currentPage,
        siblings,
        leftRightOffset,
      })
    );
  }, [currentPage, leftRightOffset, totalPageCount, siblings]);

  const handlePageChange = (currentPage) => {
    if (currentPage < 1) {
      currentPage = 1;
    }
    if (currentPage > totalPageCount) {
      currentPage = totalPageCount;
    }
    onPageChange(currentPage);
  };

  const calculateShiftByNumber = ({ pageNumber, currentPage }) => {
    if (pageNumber === LEFT_DOT) {
      return Math.floor((1 + currentPage) / 2);
    } else {
      return Math.floor((currentPage + totalPageCount) / 2);
    }
  };

  return (
    <div className={cx('d-flex', styles.paginationContainer)}>
      <PaginationButton
        type='back'
        title='Previous'
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      />

      {paginationArr.map((pageNumber) => {
        if (pageNumber === LEFT_DOT || pageNumber === RIGHT_DOT) {
          return (
            <PaginationButton
              id={JSON.stringify(pageNumber)}
              key={JSON.stringify(pageNumber)}
              type='dots'
              onClick={() =>
                handlePageChange(
                  calculateShiftByNumber({ pageNumber, currentPage })
                )
              }
            ></PaginationButton>
          );
        }

        return (
          <PaginationButton
            key={pageNumber}
            text={pageNumber}
            type='text'
            selected={pageNumber === currentPage}
            onClick={() => handlePageChange(pageNumber)}
          >
            {pageNumber}
          </PaginationButton>
        );
      })}
      <PaginationButton
        type='next'
        title='Next'
        disabled={currentPage === totalPageCount}
        onClick={() => handlePageChange(currentPage + 1)}
      />
    </div>
  );
};

Pagination.propTypes = {
  totalPageCount: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  leftRightOffset: PropTypes.number,
  siblings: PropTypes.number,
  onPageChange: PropTypes.func,
};

export default Pagination;
