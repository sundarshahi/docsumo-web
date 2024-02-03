import React, { useState } from 'react';

import PropTypes from 'prop-types';

import TableBody from './TableBody';
import { TableContext } from './tableContext';
import TableHeader from './TableHeader';
import TableLoader from './TableLoader';

import styles from './Table.scss';

const Table = (props) => {
  const {
    data,
    initialColumnStructure,
    headerClassNames,
    bodyClassNames,
    checkedRows,
    setCheckedRows,
    showCheckbox,
    rowKey,
    setRowKey,
    onRowClick,
    setRowClickableStatus,
    custom = false,
    tableHeaderCellProps = {},
    tableBodyCellProps = {},
    showLoader = false,
    emptyState = null,
  } = props;

  const [columnStructure, setColumnStructure] = useState(
    initialColumnStructure
  );

  const renderTableBody = () => {
    if (showLoader) {
      return <TableLoader />;
    }

    if (emptyState) {
      return emptyState;
    }

    return (
      <TableBody
        custom={custom}
        data={data}
        bodyClassNames={bodyClassNames}
        className={styles.tableBody}
      />
    );
  };

  return (
    /**
     * Table Context
     * get/set for header structure
     * get/set for body structure
     * get/set for checkedRows - checkedRows is array for Checkbox's state. It contains the value from tableData with key of @constant rowKey
     *                           Example: tableBody : { title: 'abc', date: '12-21-1222', docId:'1222121122' }, if rowKey is 'docId' then
     *                           checkedRows array will keep track of selected docIds
     * showCheckbox - boolean to show checkbox or not.
     */
    <TableContext.Provider
      value={{
        columnStructure,
        setColumnStructure,
        checkedRows,
        setCheckedRows,
        rowKey: rowKey,
        setRowKey,
        showCheckbox: showCheckbox,
        onRowClick,
        setRowClickableStatus,
        tableHeaderCellProps,
        tableBodyCellProps,
      }}
    >
      <div className={styles.table}>
        <TableHeader headerClassNames={headerClassNames} />
        {renderTableBody()}
      </div>
    </TableContext.Provider>
  );
};

Table.propTypes = {
  data: PropTypes.array,
  initialColumnStructure: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.func,
  ]),
  headerClassNames: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  bodyClassNames: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  rowKey: PropTypes.string.isRequired,
  checkedRows: PropTypes.array,
  setCheckedRows: PropTypes.func,
  showCheckbox: PropTypes.bool,
  onRowClick: PropTypes.func,
};

export default Table;
