import React, { Component } from 'react';
// import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import cx from 'classnames';

// import _ from 'lodash';
// import { actions as documentActions } from 'new/redux/documents/actions';
import LineItemRow from './LineItemRow';

import styles from './index.scss';

class TableView extends Component {
  constructor(props) {
    super(props);
  }

  renderRows = () => {
    const {
      tableView,
      selectedDocuments,
      handleSelectionDocList,
      handleFieldUpdate,
      handleFieldFocus,
    } = this.props;
    const { rowIds, datas } = tableView;
    const rowNodes = rowIds.map((row, index) => {
      return (
        <LineItemRow
          key={index}
          id={row}
          rowIds={rowIds}
          row={datas.filter((data) => {
            if (data.id === row) return data;
          })}
          onSelctionChange={handleSelectionDocList}
          checked={selectedDocuments.includes(row)}
          handleFieldUpdate={handleFieldUpdate}
          handleFieldFocus={handleFieldFocus}
        />
      );
    });

    return rowNodes;
  };

  render() {
    const { tableView } = this.props;

    const { headers, datas } = tableView;

    return (
      <>
        <div className={styles.root}>
          <div className={cx(styles.tableHeader)}>
            {headers.map((header, index) => {
              return (
                <p className={styles.item} key={index}>
                  {header}
                </p>
              );
            })}
          </div>
          <div className={styles.tableContent}>
            {datas.length !== 0 ? (
              this.renderRows()
            ) : (
              <div className={styles.noContent}> No CSV row. </div>
            )}
          </div>
        </div>
      </>
    );
  }
}

function mapStateToProp(state) {
  const { currentCSVDocId, documentsById, tableView } = state.csv;

  const currentDocument = currentCSVDocId && documentsById[currentCSVDocId];

  return {
    currentCSVDocId,
    currentDocument,
    tableView,
  };
}

export default connect(mapStateToProp)(TableView);
