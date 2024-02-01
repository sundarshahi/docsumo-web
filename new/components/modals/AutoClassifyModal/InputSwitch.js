import React, { Component } from 'react';

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
    const { canUpload } = this.props;
    this.setState({
      switchValue: canUpload,
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.canUpload !== this.props.canUpload) {
      this.setState({
        switchValue: this.props.canUpload,
      });
    }
  }

  handleStatus = () => {
    const { handleToggleAutoClassify } = this.props;
    const { switchValue } = this.state;
    handleToggleAutoClassify(switchValue);
    // TODO: remove later
    // this.setState(
    //   {
    //     switchValue: !switchValue,
    //   },
    //   () => {
    //     handleToggleAutoClassify(switchValue);
    //   }
    // );
  };

  render() {
    return (
      <>
        <div className={styles.generalSubField}>
          <div className={styles.generalSubField__header}>
            <span className={styles['generalSubField__header--title']}>
              Enable auto classification
            </span>
          </div>

          <ToggleControl
            checked={this.state.switchValue}
            handleStatus={this.handleStatus}
            className={styles.switch}
            size='small'
          />
        </div>
      </>
    );
  }
}

export default InputSwitch;
