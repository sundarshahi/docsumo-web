import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import { ReactComponent as RestoreIcon } from 'images/icons/restore.svg';

import { Button } from 'components/widgets/buttons';

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
      label,
      helpText,
      fieldClassName,
      mainField,
      link,
      showResetBtn = false,
      handleReset = () => {},
      isResetting = false,
    } = this.props;

    return (
      <Fragment>
        {mainField === true ? (
          <div className={cx(styles.generalMainField, fieldClassName)}>
            <label htmlFor={label}>
              {label}
              <p className={styles.helpText}>
                {helpText}{' '}
                {link ? (
                  <a target='_blank' rel='noopener noreferrer' href={link}>
                    Learn More
                  </a>
                ) : null}
              </p>
            </label>
            {showResetBtn ? (
              <Button
                isLoading={isResetting}
                disabled={isResetting}
                iconLeft={RestoreIcon}
                className={styles.restoreBtn}
                onClick={handleReset}
              >
                <span>Reset to default</span>
              </Button>
            ) : null}
          </div>
        ) : (
          <div className={cx(styles.generalSubField, fieldClassName)}>
            <label htmlFor={label}>
              {label}
              <p className={styles.helpText}>
                {helpText}{' '}
                {link ? (
                  <a target='_blank' rel='noopener noreferrer' href={link}>
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
