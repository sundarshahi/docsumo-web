import React, { Component } from 'react';

import cx from 'classnames';
import { InfoEmpty } from 'iconoir-react';
import { ReactComponent as ErrorIcon } from 'new/assets/images/icons/error_icon.svg';
import { ReactComponent as LoaderIcon } from 'new/assets/images/icons/loader.svg';
import { ReactComponent as SuccessIcon } from 'new/assets/images/icons/success_icon.svg';
import Button from 'new/ui-elements/Button/Button';
import Textarea from 'new/ui-elements/Textarea/Textarea';
import Tooltip from 'new/ui-elements/Tooltip';

import styles from './inputTextArea.scss';

class InputCustomArea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
    };
  }

  UNSAFE_componentWillMount() {
    const { value } = this.props;
    {
      value
        ? this.setState({
            keyword: value,
          })
        : null;
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      const { value } = this.props;

      this.setState({
        keyword: value === undefined ? '' : value,
      });
    }
  }
  handleChange = (e) => {
    this.setState({
      keyword: e.target.value,
    });
  };
  handleBlur = () => {
    const { handleChangedValueSubmit, id, filterId } = this.props;
    handleChangedValueSubmit({
      id: id,
      value: this.state.keyword,
      filterId: filterId,
    });
  };
  clickValidate = () => {
    const { handleValidate, id, handleDropDownValidate } = this.props;
    const { keyword } = this.state;
    if (id === 11) {
      handleDropDownValidate({
        id: id,
        value: keyword,
      });
      return;
    }
    handleValidate({
      id: id,
      value: keyword,
    });
  };
  render() {
    const {
      label,
      isLoading,
      isSuccess,
      isError,
      type,
      helpText,
      link,
      id,
      loadingId,
    } = this.props;
    let placeholder = '';
    if (type === 'line_item') {
      switch (label) {
        case 'Custom Processing':
          placeholder = 'LEFT(‘colname’, 5)';
          break;
        case 'Custom Post Processing':
          placeholder = 'Label Name1__0 * Label Name2__0';
          break;
        case 'Validation Rule':
          placeholder = 'SUM(‘colname 1’, ‘colname 2’) == SUM(‘colname 3’)';
          break;
        case 'Calculate Value':
          placeholder = 'Label Name1__0 * Label Name2__0';
          break;
        case 'Drop Down List URL':
          placeholder = 'URL,AUTH,DATA,POST_PROESSING,METHOD';
          break;
        default:
          placeholder = 'a\nb\nc';
          break;
      }
    } else {
      switch (label) {
        case 'Custom Processing':
          placeholder = 'LEFT(‘colname’, 5)';
          break;
        case 'Custom Post Processing':
          placeholder = 'Label Name1 * Label Name2';
          break;
        case 'Validation Rule':
          placeholder = 'SUM(‘colname 1’, ‘colname 2’) == SUM(‘colname 3’)';
          break;
        case 'Calculate Value':
          placeholder = 'Label Name1 * Label Name2';
          break;
        case 'Drop Down List URL':
          placeholder = 'URL,AUTH,DATA,POST_PROESSING,METHOD';
          break;
        default:
          placeholder = 'a\nb\nc';
          break;
      }
    }
    return (
      <>
        <div className={styles.content}>
          <label htmlFor={label}>
            {label}
            <Tooltip
              className={cx('ml-2', styles.tooltip)}
              label={
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  href={link}
                  className={cx('d-flex align-items-center')}
                >
                  Learn more
                </a>
              }
            >
              <InfoEmpty className={styles['tooltip-icon']} fontSize='14' />
            </Tooltip>
          </label>
          <p className={styles.helpText}>{helpText}</p>
          <div className={styles.generalField}>
            <Textarea
              id='names'
              placeholder={placeholder}
              className={styles.textarea}
              name='hard'
              value={this.state.keyword}
              cols={51}
              rows={5}
              onChange={this.handleChange}
              onBlur={this.handleBlur}
              wrap='hard'
            />
            {loadingId === id ? (
              <div className={styles.status}>
                {isLoading ? (
                  <div className={cx(styles.iconWrapper, styles.loader)}>
                    <LoaderIcon />
                  </div>
                ) : isSuccess ? (
                  <div className={cx(styles.iconWrapper, styles.icon)}>
                    <SuccessIcon />
                  </div>
                ) : isError ? (
                  <div className={cx(styles.iconWrapper, styles.icon)}>
                    <ErrorIcon />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className={styles.validate}>
            <Button
              variant='outlined'
              // className={styles.btn}
              size='small'
              // eslint-disable-next-line no-console
              onClick={this.clickValidate}
            >
              Validate
            </Button>
          </div>
        </div>
        {(label === 'Custom Processing' ||
          label === 'Custom Post Processing') && (
          <span className={styles.separator}></span>
        )}
      </>
    );
  }
}

export default InputCustomArea;
