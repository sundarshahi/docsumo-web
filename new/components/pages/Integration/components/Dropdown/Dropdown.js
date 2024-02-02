/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component } from 'react';

import cx from 'classnames';
import { Cancel, NavArrowDown } from 'iconoir-react';
import Checkbox from 'new/ui-elements/Checkbox/Checkbox';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import OutsideClickHandler from 'react-outside-click-handler';

import styles from './dropDown.scss';

export default class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      isDropdownOpen: false,
      dropDownValue: null,
    };
  }
  UNSAFE_componentWillMount() {
    const { selectedList } = this.props;
    this.setState({
      selectedList: selectedList,
    });
  }
  componentDidUpdate(prevProps) {
    const { selectedList: prevSelectedList } = prevProps;
    const { selectedList } = this.props;
    if (selectedList !== prevSelectedList) {
      this.setState({
        selectedList: selectedList,
      });
    }
  }
  handleCheckboxChange = (data) => {
    const { handleSelectionList } = this.props;
    handleSelectionList(data);
  };

  toggle = () => {
    this.setState({
      isDropdownOpen: !this.state.isDropdownOpen,
    });
  };

  convertLabel = (labelValue) => {
    let newString = labelValue
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return newString;
  };

  render() {
    const { isDropdownOpen, selectedList = [] } = this.state;
    const { option, handleSelectionList } = this.props;
    const viewSelected =
      selectedList.length < 3 ? selectedList : selectedList.slice(0, 2);
    const hideSelected =
      selectedList.length > 2
        ? selectedList.slice(2, selectedList.length)
        : null;
    return (
      <OutsideClickHandler
        onOutsideClick={() => {
          this.setState({
            isDropdownOpen: false,
          });
        }}
      >
        <div
          className={cx('unstyled-btn', styles.dropdownBtn)}
          onClick={this.toggle}
        >
          {selectedList.length > 0 ? (
            <>
              {viewSelected.map((item) => {
                let label = '';
                label = option.find((itm) => itm.id === item)?.label || '';
                return (
                  <div key={item} className={styles.selectedValue}>
                    {label}
                    <button
                      className={cx('unstyled-btn', styles.badge)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectionList({
                          target: {
                            checked: false,
                            value: item,
                          },
                        });
                      }}
                      title='Clear Filters'
                    >
                      <Cancel className={styles.badgeIcon} />
                    </button>
                  </div>
                );
              })}
              {hideSelected && hideSelected.length ? (
                <Tooltip
                  label={`${hideSelected.map(
                    (item) => option.find((itm) => itm.id === item)?.label || ''
                  )}`}
                >
                  <div
                    style={{
                      marginLeft: '10px',
                    }}
                    className={styles.selectedValue}
                  >
                    {`+ ${hideSelected.length} more`}
                  </div>
                </Tooltip>
              ) : null}
            </>
          ) : (
            <p className={styles.selectValue}>
              <span className={cx(styles.title)}>Choose Events</span>
            </p>
          )}
          <NavArrowDown
            className={cx(styles.icon, {
              [styles.iconInvert]: isDropdownOpen,
            })}
          />
        </div>
        {isDropdownOpen ? (
          <div className={styles.dropdownBox}>
            {option.map(({ label: title, id }) => (
              <label key={id} className={styles.checkbox}>
                <Checkbox
                  key={id}
                  checked={selectedList.includes(id) || false}
                  value={id}
                  onChange={this.handleCheckboxChange}
                />
                <div className={styles.checkbox_label}>{title}</div>
              </label>
            ))}
          </div>
        ) : null}
      </OutsideClickHandler>
    );
  }
}
