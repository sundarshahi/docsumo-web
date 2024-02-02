import React, { Component } from 'react';

import Textarea from 'new/ui-elements/Textarea/Textarea';

import styles from './inputTextArea.scss';

class InputTextArea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      keywordList: [],
    };
  }

  UNSAFE_componentWillMount() {
    const { value } = this.props;
    {
      value
        ? this.setState({
            keywordList: value,
          })
        : null;
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      const { value } = this.props;

      this.setState({
        keywordList: value === undefined ? '' : value,
      });
    }
  }

  handleChange = (e) => {
    let list = [];
    this.setState(
      {
        keyword: e.target.value,
      },
      () => {
        list = this.state.keyword.split(/\r?\n/);
        this.setState({
          keywordList: list,
        });
      }
    );
  };
  handleBlur = () => {
    const { handleChangedValueSubmit, id, filterId } = this.props;
    handleChangedValueSubmit({
      id: id,
      value: this.state.keywordList,
      filterId: filterId,
    });
  };

  render() {
    const { label, helpText, link } = this.props;
    let placeholder = 'a\nb\nc';

    return (
      <>
        <div className={styles.content}>
          <label htmlFor={label}>
            {label}
            <p className={styles.helpText}>
              {helpText}{' '}
              {link ? (
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  href={link}
                  tabIndex='-1'
                >
                  Learn more
                </a>
              ) : null}
            </p>
          </label>
          <div className={styles.generalField}>
            <Textarea
              placeholder={placeholder}
              className={styles.textarea}
              name='hard'
              value={
                this.state.keyword ||
                (this.state.keywordList && this.state.keywordList.join('\n'))
              }
              cols={51}
              rows={5}
              onChange={this.handleChange}
              onBlur={this.handleBlur}
            />
            <div className={styles.status}></div>
          </div>
        </div>
      </>
    );
  }
}

export default InputTextArea;
