import React, { Component } from 'react';

import cx from 'classnames';
import { Cancel } from 'iconoir-react';
import OutsideClickHandler from 'react-outside-click-handler';

import styles from './style.scss';

class DropDown extends Component {
  state = {
    isDropdownOpen: false,
    option: 34534,
    options: [1244, 422, 234234],
    searchText: '',
  };
  inputRef = React.createRef();

  setDefaultValue() {
    const { defaultValue } = this.props;
    this.setState({
      option: defaultValue,
      searchText: '',
    });
  }

  componentDidMount() {
    this.setDefaultValue();
  }

  componentDidUpdate({ defaultValue: prevDefaultValue }) {
    const { defaultValue } = this.props;
    if (defaultValue !== prevDefaultValue) {
      this.setDefaultValue();
    }
  }
  componentWillUnmount() {}

  openDropdown = () => {
    this.setState({
      isDropdownOpen: true,
    });
  };

  closeDropdown = () => {
    this.setState({
      isDropdownOpen: false,
      searchText: '',
    });
  };

  handleBtnClick = () => {
    this.openDropdown();
    /*  this.props.onBtnClick(); */
  };

  handleOutsideClick = () => {
    this.closeDropdown();
  };

  handleOptionClick = async (option) => {
    const { onChange, onClose } = this.props;
    this.setState({ option, searchText: '' }, () => {
      onChange(option);
      onClose();
    });
  };

  render() {
    const { className, open, onClose, options, activatedHeaders, buttonKey } =
      this.props;
    const { option, searchText } = this.state;
    const filteredOption = options.filter(
      (op) => op && op.toLowerCase().includes(searchText.toLowerCase())
    );
    if (open) {
      setTimeout(() => {
        if (this.inputRef && this.inputRef.current) {
          this.inputRef.current.focus();
        }
      }, 100);
    }
    return open ? (
      <div className={cx(styles.root, className)}>
        <OutsideClickHandler onOutsideClick={onClose}>
          <div className={styles.dropdownRoot}>
            <div className={styles.searchRoot}>
              <div className={styles.searchable}>
                <div className={styles.searchbox}>
                  <input
                    className={styles.searchInput}
                    id={`button-${buttonKey}`}
                    placeholder='Search'
                    ref={this.inputRef}
                    onClick={(e) => e.target.focus()}
                    onChange={(e) => {
                      this.setState({
                        searchText: e.target.value,
                      });
                    }}
                    value={searchText}
                  />
                </div>
              </div>
            </div>
            <div className={styles.dropdown}>
              <ol>
                {filteredOption.map((range) => {
                  return (
                    <li key={range}>
                      <button
                        className={cx('unstyled-btn', {
                          [styles.activeItem]: range === option,
                        })}
                        onMouseDown={() => {
                          range !== option && this.handleOptionClick(range);
                        }}
                      >
                        {range}
                        {range === option ||
                        activatedHeaders.includes(range) ? (
                          <Cancel
                            className={styles.closeIcon}
                            onClick={() => this.handleOptionClick()}
                          />
                        ) : (
                          ''
                        )}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </OutsideClickHandler>
      </div>
    ) : null;
  }
}

export default DropDown;
