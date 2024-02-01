import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import { Cancel, Check, Edit } from 'iconoir-react';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Input from 'new/ui-elements/Input/Input';

import styles from './inputBox.scss';

class InputBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uiValue: '',
    };
  }
  UNSAFE_componentWillMount() {
    const { value, updateDocLabel, saveDocumentLabel } = this.props;
    if (value || value === 0) {
      this.setState({
        uiValue: value,
      });
    }
    if (saveDocumentLabel) {
      updateDocLabel(value);
    }
  }

  handleInputChange = (e) => {
    this.setState({
      uiValue: e.target.value,
    });
  };

  handleKeyDown = (e) => {
    const invalidKeys = ['+', '-', 'e', '.', 'E'];

    if (e.target.type === 'number' && invalidKeys.includes(e.key)) {
      e.preventDefault();
    }
  };
  handleBlur = () => {
    const { handleChangedValueSubmit, id, filterId, type, label } = this.props;

    if (handleChangedValueSubmit) {
      handleChangedValueSubmit({
        label,
        id: id,
        value:
          type === 'number' ? parseInt(this.state.uiValue) : this.state.uiValue,
        filterId: filterId,
      });
    }
  };

  render() {
    const {
      className,
      label,
      helpText,
      fieldClassName,
      type,
      mainField,
      link,
      defaultPlaceholder,
      editable,
      id,
      downloadConfirmationType,
      saveDocumentLabel,
      docLabel,
    } = this.props;
    const { uiValue } = this.state;
    let placeholder = '';
    switch (label) {
      case 'Round':
        placeholder = '0';
        break;
      case 'Confidence Greater Than':
        placeholder = '%';
        break;
      case 'Confidence Score':
        placeholder = '%';
        break;
      case 'Notification':
        placeholder = 'No. of hours';
        break;
      default:
        placeholder = ' ';
        break;
    }
    return (
      <Fragment>
        {mainField ? (
          <div
            className={cx(
              styles.inputBox,
              fieldClassName,
              id === 26 ? 'my-4' : 'mb-4'
            )}
          >
            <label className={cx(styles.inputBox__label)} htmlFor={label}>
              {label}
              <p className={cx(styles['inputBox__label--helper'], 'mt-2')}>
                {helpText}{' '}
                {link ? (
                  <a target='_blank' rel='noopener noreferrer' href={link}>
                    Learn More
                  </a>
                ) : null}
              </p>
            </label>
            <div
              className={cx(styles.inputWrap, {
                [styles.inputWrap__btn]: saveDocumentLabel,
              })}
            >
              <Input
                id={label}
                type={type || 'text'}
                name='name'
                placeholder={defaultPlaceholder || placeholder}
                value={uiValue}
                className={cx(styles.input, className)}
                disabled={
                  label.toLowerCase() === 'display label' ||
                  (saveDocumentLabel && this.props.disableInput)
                }
                onBlur={editable === false ? null : this.handleBlur}
                onChange={this.handleInputChange}
                onKeyDown={this.handleKeyDown}
              />
              {saveDocumentLabel &&
                (this.props.disableInput ? (
                  <Button
                    variant='outlined'
                    onClick={this.props.toggleDisableInput}
                    className='ml-4'
                    size='small'
                    icon={Edit}
                  >
                    Edit
                  </Button>
                ) : (
                  <span className={styles.docLabel}>
                    <IconButton
                      className={cx(
                        styles.docLabel__btn,
                        styles['docLabel__btn--success']
                      )}
                      isLoading={this.props.isLabelUpdated}
                      icon={Check}
                      onClick={() => {
                        this.props.saveDocumentLabel(
                          this.state.uiValue,
                          id,
                          downloadConfirmationType,
                          label
                        );
                      }}
                    />
                    <IconButton
                      className={cx(
                        styles.docLabel__btn,
                        styles['docLabel__btn--error']
                      )}
                      icon={Cancel}
                      onClick={() => {
                        this.props.toggleDisableInput();
                        this.setState({
                          uiValue: docLabel,
                        });
                      }}
                    />
                  </span>
                ))}
            </div>
          </div>
        ) : (
          <div
            className={cx(
              styles.inputBox,
              fieldClassName,
              id === 26 ? 'mt-4 mb-4' : 'mb-4'
            )}
          >
            <label className={cx(styles.inputBox__label)} htmlFor={label}>
              {label}
              <p className={cx(styles['inputBox__label--helper'], 'mt-2')}>
                {helpText}{' '}
                {link ? (
                  <a target='_blank' rel='noopener noreferrer' href={link}>
                    Learn More
                  </a>
                ) : null}
              </p>
            </label>
            <div className={styles.inputWrap}>
              <Input
                type={type || 'text'}
                name='name'
                placeholder={defaultPlaceholder || placeholder}
                value={uiValue}
                className={cx(styles.input, className)}
                onChange={this.handleInputChange}
                onBlur={this.handleBlur}
                onKeyDown={this.handleKeyDown}
              />
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}

export default InputBox;
