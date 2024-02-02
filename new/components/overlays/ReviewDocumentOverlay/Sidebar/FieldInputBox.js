import React, { Component } from 'react';

import { Cancel, Check } from 'iconoir-react';
import _ from 'lodash';
import { WithTrackingContext } from 'new/components/contexts/tracking';
import { FIELD_TRACKING_KEYS } from 'new/components/contexts/trackingConstants';
import IconButton from 'new/ui-elements/IconButton/IconButton';

import styles from './fieldInputBox.scss';

class FieldInputBox extends Component {
  state = {
    rows: 2,
    prevLabel: '',
    prevValue: '',
  };
  textareaRef = React.createRef();
  floatingInputRef = React.createRef();
  cursor = null;

  UNSAFE_componentWillMount() {
    const { field } = this.props;
    this.setState({
      prevLabel: field.uiLabel,
      prevValue: field.uiValue,
    });
  }

  componentDidMount() {
    if (this.textareaRef && this.textareaRef.current) {
      this.updateTextareaRows(this.textareaRef.current);
      !this.props.slug && this.textareaRef.current.focus();
      this.textareaRef.current.selectionStart =
        this.textareaRef.current.value.length;
      this.textareaRef.current.selectionEnd =
        this.textareaRef.current.value.length;
    }

    this.calculateFloaingInputStyle();
  }

  componentDidUpdate(prevProps) {
    if (this.textareaRef.current) {
      if (
        _.isNumber(this.cursor) &&
        prevProps.field.uiValue !== this.props.field.uiValue
      ) {
        this.textareaRef.current.selectionEnd = this.cursor;
      }
    }

    if (this.props.field.uiValue !== prevProps.field.uiValue) {
      this.updateTextareaRows();
    }
  }

  calculateFloaingInputStyle = () => {
    const labelElement = document.getElementById(
      `sidebar-section-field-${this.props.field.id}`
    );
    const { top, bottom } = labelElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    let popupStyles = {};

    if (top < windowHeight / 2) {
      popupStyles = {
        top: `${top}px`,
        bottom: 'initial',
      };
    } else {
      popupStyles = {
        bottom: `calc(100% - ${bottom}px)`,
        top: 'initial',
      };
    }

    if (this.floatingInputRef.current) {
      this.floatingInputRef.current.style.display = 'block';
      this.floatingInputRef.current.style.top = popupStyles.top;
      this.floatingInputRef.current.style.bottom = popupStyles.bottom;
    }
  };

  updateTextareaRows = (domNode) => {
    if (!domNode) {
      domNode = this.textareaRef && this.textareaRef.current;
    }

    if (!domNode) return;

    const textareaLineHeight = 22;
    const minRows = 1;
    const maxRows = 9;
    domNode.rows = minRows; // reset number of rows in textarea

    const previousRows = this.state.rows;
    const contentRows = ~~(domNode.scrollHeight / textareaLineHeight);
    if (contentRows === previousRows) {
      // No change
      domNode.rows = contentRows;
    } else {
      let newRows = contentRows;
      if (newRows <= maxRows) {
        domNode.rows = newRows;
      } else {
        newRows = maxRows;
        domNode.rows = newRows;
        domNode.scrollTop = domNode.scrollHeight;
      }

      this.setState({
        rows: newRows,
      });
    }
  };

  handleCancelBtnClick = () => {
    const { field } = this.props;
    this.props.onRemoveBtnClick({
      fieldId: field.id,
      prevUiLabel: this.state.prevLabel,
      prevUiValue: this.state.prevValue,
    });
  };

  handleSubmitBtnClick = (e) => {
    const { field, isLabelSelected } = this.props;
    this.props.onSubmitBtnClick({
      fieldId: field.id,
      isLabelSelected,
      e,
    });
  };

  handleFormSubmit = (e) => {
    const { isLabelSelected } = this.props;
    e.preventDefault();
    this.props.onFormSubmit({
      fieldId: this.props.field.id,
      isLabelSelected,
    });
  };

  handleTextareaKeyPress = (e) => {
    if (this.props.readOnly) {
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.props.onFormSubmit({
        fieldId: this.props.field.id,
      });
    }
  };

  handleTextareaChange = (e) => {
    const { field, isLabelSelected, handleTrackingStart } = this.props;
    const value = e.target.value;
    handleTrackingStart({
      name: field.id,
      fieldLabel: field.label,
      valueToSave: value,
      key: FIELD_TRACKING_KEYS.fieldValue,
      valueToCompare: {
        text: value,
        ...{ position: field.uiPosition },
        ...{ rect: field.uiRectangle },
      },
    });
    this.cursor = e.target.selectionStart;
    this.updateTextareaRows(e.target);
    this.props.onInputValueChange({
      fieldId: field.id,
      value: !isLabelSelected ? value : field.uiValue,
      label: isLabelSelected ? value : field.uiLabel,
    });
  };

  handleTextareaBlur = (e) => {
    const value = e.target.value;
    const { handleTrackingEnd, field } = this.props;
    handleTrackingEnd({
      name: field.id,
      fieldLabel: field.label,
      key: FIELD_TRACKING_KEYS.fieldValue,
      valueToSave: value,
      valueToCompare: {
        text: value,
        ...{ position: field.uiPosition },
        ...{ rect: field.uiRectangle },
      },
    });
  };

  render() {
    const { field, style, readOnly = false, isLabelSelected } = this.props;

    const { uiLabel, uiValue, uiIsValidFormat, label, formatMessage } = field;

    const error =
      !uiIsValidFormat && !isLabelSelected
        ? formatMessage || 'The format is not valid '
        : null;

    return (
      <div
        className={styles['floating-input-wrapper']}
        ref={this.floatingInputRef}
        id='js-floating-input'
      >
        <div
          className={styles.ReviewSidebarFloatedBox}
          style={style}
          id='rt-field-input-box'
        >
          <div className={styles.ReviewSidebarFloatedBox__action}>
            <p className={styles['ReviewSidebarFloatedBox__action--label']}>
              {label}
            </p>
            <form
              method='post'
              autoComplete='off'
              onSubmit={this.handleFormSubmit}
            >
              <textarea
                ref={this.textareaRef}
                rows={this.state.rows}
                value={isLabelSelected ? uiLabel : uiValue}
                readOnly={readOnly}
                className={styles['ReviewSidebarFloatedBox__action--area']}
                onKeyPress={this.handleTextareaKeyPress}
                onChange={this.handleTextareaChange}
                onBlur={this.handleTextareaBlur}
                data-hj-allow
              />
            </form>
            {error ? (
              <p className={styles['ReviewSidebarFloatedBox__action--err']}>
                {error}
              </p>
            ) : null}
          </div>

          {readOnly ? null : (
            <div className={styles.btnsContainer}>
              <IconButton
                variant='outlined'
                icon={<Cancel />}
                onClick={this.handleCancelBtnClick}
                className={styles.btnsContainer__btn}
              />
              <IconButton
                icon={<Check />}
                className={styles.btnsContainer__btn}
                onClick={(e) => this.handleSubmitBtnClick(e)}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default WithTrackingContext(FieldInputBox);
