import React, { Component } from 'react';

import cx from 'classnames';
import find from 'lodash/find';
import Badge from 'new/ui-elements/Badge';
import ToggleControl from 'new/ui-elements/ToggleControl/ToggleControl';

import styles from './inputSwitch.scss';

class InputSwitch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      switchValue: false,
    };
  }
  UNSAFE_componentWillMount() {
    const { option, value } = this.props;
    const optionValue = value && find(option, { id: value });
    const { value: status } = optionValue || {};
    this.setState({
      switchValue: status,
    });
  }
  handleStatus = () => {
    this.setState(
      {
        switchValue: !this.state.switchValue,
      },
      () => {
        const { handleChangedValueSubmit, id, filterId, labelText } =
          this.props;
        const { option } = this.props;
        const { id: itemId } = find(option, {
          value: this.state.switchValue,
        });
        handleChangedValueSubmit({
          id: id,
          value: itemId,
          filterId: filterId,
          label: labelText,
        });
      }
    );
  };

  render() {
    const {
      labelText,
      helpText,
      link,
      className,
      displayType = '',
      id,
      tags,
    } = this.props;

    return (
      <>
        <div
          className={cx(styles.switchExtraction, className || 'mb-4', {
            [styles[displayType]]: displayType,
          })}
        >
          <label htmlFor='switch' className={styles.switchExtraction__label}>
            <span className='mr-2'>{labelText}</span>
            {tags?.length ? (
              <Badge type='primary' title={tags[0]} size='lg' />
            ) : null}
            <p
              className={cx(styles['switchExtraction__label--helper'], 'mt-2')}
            >
              {helpText}{' '}
              {link ? (
                <a target='_blank' rel='noopener noreferrer' href={link}>
                  Learn more
                </a>
              ) : null}
            </p>
          </label>
          <div className={styles.toggle}>
            <ToggleControl
              checked={this.state.switchValue}
              handleStatus={this.handleStatus}
              className={styles.switch}
              size='small'
            />
          </div>
        </div>
      </>
    );
  }
}

export default InputSwitch;
