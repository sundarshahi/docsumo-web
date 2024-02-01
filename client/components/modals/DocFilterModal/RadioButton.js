import React, { Component } from 'react';

import { Cell, Row } from 'components/shared/tabularList';

import 'react-tagsinput/react-tagsinput.css';
import styles from './index.scss';

export default class RadioButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uiValue: '',
    };
  }
  componentWillUnmount() {
    this.setState({
      uiValue: '',
    });
  }

  handleChange = (id) => {
    this.setState(
      {
        uiValue: id,
      },
      () => {
        const { uiValue } = this.state;
        const { option } = this.props;
        this.props.handleChangedValueSubmit({ uiValue, id: option.id });
      }
    );
  };
  render() {
    const options = this.props.option && this.props.option.options;
    const value = this.props.option && this.props.option.value;

    return (
      <Row className={styles.radioFilterRow}>
        {options.map((opt) => (
          <Cell key={opt.id} className={styles.radioContainer}>
            <input
              type='radio'
              id={`option-${opt.type}`}
              name='selector'
              checked={this.state.uiValue === opt.id || value === opt.id}
              onClick={() => this.handleChange(opt.id)}
            />
            <label htmlFor={`option-${opt.type}`}>{opt.label} &nbsp; :</label>
            <div className={styles.check} />
          </Cell>
        ))}
      </Row>
    );
  }
}
