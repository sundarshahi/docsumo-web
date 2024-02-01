import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import { Refresh } from 'iconoir-react';
import Button from 'new/ui-elements/Button/Button';

import styles from './textField.scss';

class TextField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uiValue: '',
    };
  }
  UNSAFE_componentWillMount() {
    const { value } = this.props;
    {
      value || value === 0
        ? this.setState({
            //dropDownValue:label || option && option[0].label,
            uiValue: value,
          })
        : null;
    }
  }

  render() {
    const {
      id,
      label,
      helpText,
      fieldClassName,
      mainField,
      link,
      showResetBtn = false,
      handleReset = () => {},
      isResetting = false,
      className,
      labelColorDark,
    } = this.props;

    return (
      <Fragment>
        {mainField ? (
          <div
            className={
              label === 'COA Categorization' || label === 'Choose a Model'
                ? cx('mb-4')
                : cx(
                    styles.processing,
                    fieldClassName,
                    className ? className : 'mb-5'
                  )
            }
          >
            <label
              htmlFor={label}
              className={cx(styles.processing__label, {
                [styles.processingFilledColor]: labelColorDark,
              })}
            >
              {label}
              <p className={cx(styles['processing--helper'], 'mt-1')}>
                {helpText}{' '}
                {link ? (
                  <a
                    target='_blank'
                    className={styles['processing--helper--link']}
                    rel='noopener noreferrer'
                    href={link}
                  >
                    Learn More
                  </a>
                ) : null}
              </p>
            </label>
            {showResetBtn ? (
              <Button
                isLoading={isResetting}
                variant='text'
                icon={Refresh}
                disabled={isResetting}
                onClick={handleReset}
              >
                Reset to default
              </Button>
            ) : null}
          </div>
        ) : (
          <div className={cx(styles.processing, fieldClassName)}>
            <label
              htmlFor={label}
              className={cx(styles.processing__label, 'mb-2')}
            >
              {label}
              <p className={cx(styles['processing--helper'], 'pt-1')}>
                {helpText}{' '}
                {link ? (
                  <a
                    target='_blank'
                    rel='noopener noreferrer'
                    className={styles['processing--helper--link']}
                    href={link}
                  >
                    Learn more
                  </a>
                ) : null}
              </p>
            </label>
          </div>
        )}
      </Fragment>
    );
  }
}

export default TextField;
