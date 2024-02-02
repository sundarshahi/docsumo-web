import React, { Component } from 'react';
// import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import cx from 'classnames';

import styles from './field.scss';
var flag = false;
class Field extends Component {
  state = {
    uiValue: '',
  };
  inputFieldRef = React.createRef();
  cursor = null;

  UNSAFE_componentWillMount() {
    const { value } = this.props;
    this.setState({
      uiValue: value,
    });
  }
  componentDidMount() {
    const { fieldId, inputId, rowIds } = this.props;
    const inputField = document.getElementById(
      `row-input-${fieldId}-${inputId}`
    );
    inputField.addEventListener('keydown', this.handleKeyDown);
    const focusField = document.getElementById(
      `row-input-${rowIds[rowIds.length - 1]}-0`
    );
    focusField.focus();
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { value } = this.props;
    const { value: nextValue } = nextProps;
    if (value !== nextValue) {
      this.setState({
        uiValue: nextValue,
      });
    }
  }

  handleKeyDown = (e) => {
    if (e.keyCode === 9) {
      this.handleFormSubmit(e);
    }
  };

  handleMoveFocus = (e) => {
    const { shiftKey } = e;
    let { fieldId = 0, inputId = 0, objectLength = 0 } = this.props;

    if (!shiftKey) {
      if (inputId + 1 >= objectLength) {
        fieldId = fieldId + 1;
        inputId = 0;
      } else {
        inputId = inputId + 1;
      }
    } else {
      if (inputId - 1 < 0) {
        fieldId = fieldId - 1;
        inputId = objectLength - 1;
      } else {
        inputId = inputId - 1;
      }
    }

    var universe = document.getElementById(`row-input-${fieldId}-${inputId}`);
    universe && universe.focus();
  };

  handleInputBlur = () => {
    this.setState({
      isInputFocussed: false,
    });
    if (flag) {
      return;
    }
    const { value, header, handleFieldUpdate, fieldId } = this.props;
    const { uiValue } = this.state;
    if (uiValue === value) {
      return;
    } else {
      handleFieldUpdate({
        id: fieldId,
        header: header,
        value: uiValue,
      });
    }
  };
  handleInputFocus = () => {
    this.setState(
      {
        isInputFocussed: true,
      },
      () => {
        if (this.props.isFieldSelected) {
          return;
        }

        this.props.handleFieldFocus({
          fieldId: this.props.fieldId,
        });
      }
    );
  };
  handleInputChange = (e) => {
    this.cursor = e.target.selectionStart;
    const value = e.target.value;

    this.setState({
      uiValue: value,
    });
  };

  handleFormSubmit = (e) => {
    e.preventDefault();
    flag = true;
    const { value, header, handleFieldUpdate, fieldId } = this.props;
    const { uiValue } = this.state;
    if (uiValue === value) {
      this.handleMoveFocus(e);
    } else {
      handleFieldUpdate({
        id: fieldId,
        header: header,
        value: uiValue,
      });
      this.handleMoveFocus(e);
    }
    flag = false;
  };

  renderInputField = () => {
    const { value, fieldId, inputId } = this.props;
    const { uiValue, isInputFocussed } = this.state;
    return (
      <form
        method='post'
        autoComplete='off'
        onSubmit={this.handleFormSubmit}
        className={styles.form}
      >
        <input
          ref={this.inputFieldRef}
          name={value}
          title={value}
          id={`row-input-${fieldId}-${inputId}`}
          type='text'
          value={uiValue}
          className={cx(styles.input, {
            [styles.isSelected]: isInputFocussed,
          })}
          onFocus={this.handleInputFocus}
          onBlur={this.handleInputBlur}
          tabIndex='-1'
          autoComplete='off'
          onChange={this.handleInputChange}
        />
      </form>
    );
  };

  render() {
    const { isInputFocussed } = this.state;
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
      <label
        className={cx(styles.root, {
          [styles.isSelected]: isInputFocussed,
        })}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex='0'
        onClick={this.handleClick}
      >
        {this.renderInputField()}
      </label>
    );
  }
}

function mapStateToProp(state, ownProps) {
  const { fieldId } = ownProps;
  const { selectedField } = state.csv;

  const isFieldSelected = fieldId === selectedField;

  return {
    isFieldSelected,
  };
}

export default connect(mapStateToProp)(Field);
