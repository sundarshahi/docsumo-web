import React, { Component } from 'react';
import { connect } from 'react-redux';

import cx from 'classnames';
import { Check, EyeEmpty, WarningTriangle } from 'iconoir-react';
import { ReactComponent as GridIcon } from 'new/assets/images/icons/grid.svg';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';

import styles from './field.scss';

class LineItemField extends Component {
  handleClick = () => {
    this.props.onSidebarLineItemFieldClick({
      fieldId: this.props.fieldId,
    });
  };

  render() {
    const { field, isFieldSelected, classNames } = this.props;

    const { label, lineItemRowIds } = field;
    let lineItemField = field.children;

    let showErrorIcon = false;
    for (let i = 0; i < lineItemField.length; i++) {
      if (lineItemField[i] && lineItemField[i].length) {
        for (let j = 0; j < lineItemField[i].length; j++) {
          if (lineItemField[i][j].content.isValidFormat === false) {
            showErrorIcon = true;
            break;
          }
        }
      } else {
        showErrorIcon = false;
      }
    }
    let showReviewIcon = false;
    for (let i = 1; i < lineItemField.length; i++) {
      if (lineItemField[i] && lineItemField[i].length) {
        for (let j = 0; j < lineItemField[i].length; j++) {
          if (!showErrorIcon && lineItemField[i][j].lowConfidence === true) {
            showReviewIcon = true;
            break;
          }
        }
      } else {
        showReviewIcon = false;
      }
    }

    const lineItemRowCount = lineItemRowIds.length;

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
      <label
        id={`sidebar-section-field-${field.id}`}
        className={cx(
          styles.root,
          styles.ReviewLineItem,
          { [styles.isSelected]: isFieldSelected },
          { [classNames]: classNames }
        )}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex='0'
        onClick={this.handleClick}
      >
        <div className={styles.ReviewLineItem__iconBox}>
          {showErrorIcon ? (
            <Tooltip
              placement='right'
              colorScheme='error'
              label='There is error in line item. \n Please open line item to view error.'
            >
              <WarningTriangle
                className={styles['ReviewLineItem__iconBox--icon']}
              />
            </Tooltip>
          ) : null}

          {showReviewIcon ? (
            <Tooltip
              placement='right'
              label='Some of the field in line item have low confidence'
              colorScheme='warning'
            >
              <EyeEmpty className={styles['ReviewLineItem__iconBox--icon']} />
            </Tooltip>
          ) : null}
          {!showErrorIcon && !showReviewIcon && lineItemRowCount ? (
            <Tooltip
              placement='right'
              label='The confidence score is good'
              colorScheme='success'
            >
              <Check className={styles['ReviewLineItem__iconBox--icon']} />
            </Tooltip>
          ) : null}
        </div>
        <p className={cx('text-truncate', styles.label)}>{label}</p>

        <div className={styles.lineItemInfo}>
          <p className={styles.count}>{lineItemRowCount}</p>
          <GridIcon className={styles.icon} />
        </div>
      </label>
    );
  }
}

function mapStateToProp(state, ownProps) {
  const { fieldId } = ownProps;
  const { fieldsById, lineItemRowsById, selectedSectionFieldId } =
    state.documents.reviewTool;

  const field = fieldsById[fieldId];
  const isFieldSelected = fieldId === selectedSectionFieldId;

  return {
    field,
    lineItemRowsById,
    isFieldSelected,
  };
}

export default connect(mapStateToProp)(LineItemField);
