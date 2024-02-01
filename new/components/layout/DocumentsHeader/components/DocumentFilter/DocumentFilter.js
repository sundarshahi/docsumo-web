import React, { useEffect, useRef, useState } from 'react';

import cx from 'classnames';
import Checkbox from 'new/ui-elements/Checkbox/Checkbox';
import InfiniteScroll from 'new/ui-elements/InfiniteScroll';

import styles from './DocumentFilter.scss';

function DocumentFilter(props) {
  const {
    options = [],
    appliedFilters = [],
    onFilterChange = null,
    filterTitle = '',
    userFilter = false,
    updateUsers = null,
    isLoading,
  } = props;
  const [checkedList, setCheckedList] = useState([]);
  useEffect(() => {
    setCheckedList(appliedFilters);
  }, [appliedFilters]);

  const handleCheckboxChange = (value) => {
    let updatedFilters = [];
    updatedFilters = appliedFilters.includes(value)
      ? appliedFilters.filter((item) => item !== value)
      : [...appliedFilters, value];
    setCheckedList(appliedFilters);
    onFilterChange(updatedFilters);
  };

  const handleFetchData = (page) => {
    updateUsers();
  };

  const scrollContainerRef = useRef(null);

  return (
    <div className={styles.container}>
      <div className={styles.title}>{filterTitle}</div>
      <div className={styles.list} ref={scrollContainerRef}>
        {userFilter ? (
          <InfiniteScroll fetchData={handleFetchData} isLoading={isLoading}>
            <>
              {options.map(({ title, value }) => (
                <div className={cx(styles.col, 'text-truncate')} key={value}>
                  <label className={styles.checkboxGroup}>
                    <Checkbox
                      name='role'
                      checked={checkedList.includes(value)}
                      onChange={() => handleCheckboxChange(value)}
                    />
                    <span className={styles.value} title={title}>
                      {title}
                    </span>
                  </label>
                </div>
              ))}
            </>
          </InfiniteScroll>
        ) : (
          options.map(({ title, value }) => (
            <div className={cx(styles.col, 'text-truncate')} key={value}>
              <label className={styles.checkboxGroup}>
                <Checkbox
                  name='role'
                  checked={checkedList.includes(value)}
                  onChange={() => handleCheckboxChange(value)}
                />
                <span className={styles.value} title={title}>
                  {title}
                </span>
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DocumentFilter;
