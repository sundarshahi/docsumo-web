import React, { Component } from 'react';

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

  handleStatus = (enabled) => {
    const { handleToggleAutoClassify } = this.props;
    handleToggleAutoClassify(enabled);
    // this.setState({
    //     switchValue: !this.state.switchValue
    // }, ()=>{
    //     handleToggleAutoClassify(this.state.switchValue);
    // });
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
              onChange={(e) => this.handleStatus(e)}
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
