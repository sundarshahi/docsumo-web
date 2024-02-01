import React, { Component, Fragment } from 'react';

import TagsInput from 'react-tagsinput';

import 'react-tagsinput/react-tagsinput.css';
import styles from './inputBox.scss';

export default class InputBox extends Component {
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

  componentDidMount() {
    const option = this.props.option;
    this.setState({
      uiValue: option.value,
    });
  }

  handleInputChange = (event) => {
    this.setState({
      uiValue: event.target.value,
    });
  };

  handleBlur = () => {
    const { uiValue } = this.state;
    const {
      option: { id },
    } = this.props;
    this.props.onInputBlur({ uiValue, id });
  };

  handleKeyDown = (e) => {
    const { keyCode } = e;
    if (keyCode === 13) {
      document.getElementById('input-text').blur();
    }
  };

  render() {
    const { className, option } = this.props;
    return (
      <Fragment>
        <input
          placeholder={option.defaultMessage}
          id='input-text'
          value={this.state.uiValue}
          className={className}
          onKeyDown={this.handleKeyDown}
          onFocus={this.handleFocus}
          onChange={this.handleInputChange}
          onBlur={this.handleBlur}
        />
      </Fragment>
    );
  }
}

export class InputTags extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tags: [], blur: false };
  }

  handleChange(tags) {
    this.setState({ tags });
  }

  componentDidMount() {
    const { option } = this.props;
    const tags = option && option.value ? option.value.split(',') : [];
    this.setState({
      tags: tags,
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { id } = this.props.option;
    const tags = this.state.tags.join(',');
    this.setState({
      blur: true,
    });
    this.props.handleChangedValueSubmit({ uiValue: tags, id });
  };

  handleKeyDown = (e) => {
    const { keyCode } = e;
    if (keyCode === 9) {
      this.handleSubmit(e);
    }
  };

  render() {
    return (
      <div onKeyDown={this.handleKeyDown} role='presentation'>
        <form onSubmit={(e) => this.handleSubmit(e)}>
          <TagsInput
            onBlur={this.handleSubmit}
            addOnBlur={true}
            value={this.state.tags}
            onChange={(tags) => this.handleChange(tags)}
            inputValue={this.state.tag}
            addKeys={[188]}
            tagProps={{
              className: styles.tagsInputTag,
              classNameRemove: styles.tagsInputRemove,
            }}
            inputProps={{
              className: styles.tagsInputBox,
              placeholder: 'Add New Tag',
            }}
            className={styles.tagsInput}
          />
        </form>
      </div>
    );
  }
}
