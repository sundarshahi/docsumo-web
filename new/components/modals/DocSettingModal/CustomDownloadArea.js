import React, { Component } from 'react';

import cx from 'classnames';
import { CheckCircle, InfoEmpty, Refresh } from 'iconoir-react';
import Button from 'new/ui-elements/Button/Button';
import Textarea from 'new/ui-elements/Textarea/Textarea';

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
      validate = true,
      expandAreaVertically,
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
        <div className={styles.textWrapper}>
          <div className={styles.textWrapper__field}>
            <Textarea
              ref={this.textareaRef}
              className={cx(styles.textWrapper__field__input, {
                [styles.textWrapper__field__expandAreaVertically]:
                  expandAreaVertically,
              })}
              name='hard'
              value={this.state.keyword}
              placeholder={placeholder}
              onChange={this.handleChange}
              onBlur={this.handleBlur}
            />
            <div className={styles.textWrapper__status}>
              {validate && isLoading ? (
                <div className={cx(styles.iconWrapper, styles.loaderIcon)}>
                  <Refresh />
                </div>
              ) : isSuccess ? (
                <div className={cx(styles.iconWrapper, styles.successIcon)}>
                  <CheckCircle />
                </div>
              ) : validate && isError ? (
                <div className={cx(styles.iconWrapper, styles.errorIcon)}>
                  <InfoEmpty />
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {validate && (
          <div className={cx(styles.validateAction, 'mt-2')}>
            <span className={styles['validateAction--err']}>{errorMsg}</span>
            <Button
              onClick={this.clickValidate}
              size='small'
              variant='contained'
            >
              Validate
            </Button>
          </div>
        )}
      </div>
    );
  }
}

export default CustomDownloadArea;
