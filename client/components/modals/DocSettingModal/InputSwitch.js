import React, { Component } from 'react';

import _ from 'lodash';
import Switch from 'react-switch';

import styles from './inputSwitch.scss';

class InputSwitch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      switchValue: false,
    };
  }
  UNSAFE_componentWillMount() {
    //const { value }=this.props;
    const { option, value } = this.props;
    const optionValue = value && _.find(option, { id: value });
    const { value: status } = optionValue || {};
    this.setState({
      switchValue: status,
      //switchValue:value
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
        const { id: itemId } = _.find(option, {
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
    const { labelText, helpText, link } = this.props;

    return (
      <>
        <div className={styles.generalField}>
          <label htmlFor='switch'>
            {labelText}
            <p className={styles.helpText}>
              {helpText}{' '}
              {link ? (
                <a target='_blank' rel='noopener noreferrer' href={link}>
                  Learn more
                </a>
              ) : null}
            </p>
          </label>

          <div className={styles.inputWrap}>
            <Switch
              onColor={'#405089'}
              offColor={'#e8eaed'}
              height={15}
              width={40}
              checkedIcon={null}
              uncheckedIcon={null}
              //disabled = {}
              checked={this.state.switchValue}
              onChange={this.handleStatus}
              handleDiameter={20}
              className={styles.switch}
              boxShadow={'0 2px 3px rgba(109, 109, 109, 0.5)'}
              activeBoxShadow={'0 2px 3px rgba(109, 109, 109, 0.5)'}
            />
          </div>
        </div>
      </>
    );
  }
}

export default InputSwitch;
