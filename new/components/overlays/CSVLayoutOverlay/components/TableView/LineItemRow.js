import React from 'react';
//import { ErrorTooltip } from 'new/components/widgets/tooltip/';
//import { ReactComponent as ErrorIcon } from 'new/assets/images/icons/error.svg';
import { connect } from 'react-redux';

import cx from 'classnames';
import Checkbox from 'new/ui-elements/Checkbox/Checkbox';

import Field from './Field';

import styles from './lineItemRow.scss';

class LineItemRow extends React.Component {
  render() {
    const {
      row,
      id,
      onSelctionChange,
      checked,
      rowIds,
      handleFieldUpdate,
      handleFieldFocus,
      isFieldSelected,
    } = this.props;
    const allowed = ['id'];
    const filteredRow = Object.keys(row[0])
      .filter((key) => !allowed.includes(key))
      .reduce((obj, key) => {
        obj[key] = row[0][key];
        return obj;
      }, {});
    return (
      <div
        className={cx(styles.root, {
          [styles.isSelected]: isFieldSelected,
        })}
      >
        <Checkbox
          name={id}
          value={id}
          className={styles.checkbox}
          checked={checked}
          onChange={onSelctionChange}
        />
        {Object.keys(filteredRow).map((item, index) => {
          return (
            <Field
              key={index}
              inputId={index}
              objectLength={Object.keys(filteredRow).length}
              fieldId={id}
              value={row[0][item]}
              header={item}
              rowIds={rowIds}
              handleFieldUpdate={handleFieldUpdate}
              handleFieldFocus={handleFieldFocus}
            />
          );
        })}
      </div>
    );
  }
}

function mapStateToProp(state, ownProps) {
  const { id } = ownProps;
  const { selectedField } = state.csv;

  const isFieldSelected = id === selectedField;

  return {
    isFieldSelected,
  };
}

export default connect(
  mapStateToProp
  // mapDispatchToProps,
)(LineItemRow);
