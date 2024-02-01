import React, { Component } from 'react';

import cx from 'classnames';
import { ReactComponent as ErrorIcon } from 'images/icons/error_icon.svg';
import { ReactComponent as LoaderIcon } from 'images/icons/loader.svg';
import { ReactComponent as SuccessIcon } from 'images/icons/success_icon.svg';

import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'components/widgets/buttons';

import styles from './customDownloadArea.scss';

class CustomDownloadArea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      errorMsg: '',
    };

    this.textareaRef = React.createRef(null);
  }

  componentDidMount() {
    if (this.textareaRef && this.textareaRef.current) {
      this.textareaRef.current.focus();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const { value, errorMsg } = this.props;
      {
        value || value === ''
          ? this.setState({
              keyword: value,
            })
          : null;
      }
      this.setState({ errorMsg });
    }
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

  handleChange = (e) => {
    this.setState({
      keyword: e.target.value,
      errorMsg: '',
    });
  };
  handleBlur = () => {
    const { handleChangedValueSubmit, id, filterId, label } = this.props;
    handleChangedValueSubmit({
      value: this.state.keyword,
      id: id,
      filterId,
      label,
    });
  };
  clickValidate = () => {
    const { handleValidate, id } = this.props;
    const { keyword } = this.state;
    // var word = keyword.replace(/[\r\n]+/g,' ');
    // console.log('value', word);
    handleValidate({
      id: id,
      value: keyword,
    });
  };
  render() {
    const { errorMsg } = this.state;
    const {
      label,
      isLoading,
      isSuccess,
      isError,
      className = '',
      btnGroupClassName = '',
      validate = true,
    } = this.props;
    let placeholder = '';
    /* eslint-disable indent */
    switch (label) {
      case 'Custom processing':
        placeholder =
          'def custom_post_processing_json(data): \n    return data';
        break;
      case 'Validation Rule':
        placeholder = 'sum(data[‘key_name_2’], data[‘key_name_2’])';
        break;
      case 'Custom Code':
        placeholder =
          'function customSummaryCode(data){\n    return calculatedData;\n}';
        break;
      default:
        placeholder = 'a\nb\nc';
        break;
    }
    /* eslint-enable indent */
    return (
      <div className={cx(className)}>
        <div className={styles.content}>
          <div className={styles.fieldWrapper}>
            <div className={styles.generalField}>
              <textarea
                id='names'
                placeholder={placeholder}
                className={styles.area}
                name='hard'
                value={this.state.keyword}
                cols={71}
                rows={14}
                onChange={this.handleChange}
                onBlur={this.handleBlur}
                wrap='hard'
                ref={this.textareaRef}
              ></textarea>
              <div className={styles.status}>
                {validate && isLoading ? (
                  <div className={cx(styles.iconWrapper, styles.loader)}>
                    <LoaderIcon />
                  </div>
                ) : isSuccess ? (
                  <div className={cx(styles.iconWrapper, styles.icon)}>
                    <SuccessIcon />
                  </div>
                ) : validate && isError ? (
                  <div className={cx(styles.iconWrapper, styles.icon)}>
                    <ErrorIcon />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          {validate && (
            <div className={cx(styles.validate, btnGroupClassName)}>
              <span className={styles.errorMsg}>{errorMsg}</span>
              <Button
                key={`${label}`}
                text='Validate'
                appearance={BUTTON_APPEARANCES.PRIMARY}
                className={styles.btn}
                // eslint-disable-next-line no-console
                onClick={this.clickValidate}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default CustomDownloadArea;
