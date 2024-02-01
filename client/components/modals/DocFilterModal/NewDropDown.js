import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import { ReactComponent as AddIcon } from 'images/icons/add.svg';
import _ from 'lodash';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'reactstrap';

import { Button } from 'components/widgets/buttons';

import styles from './dropdown.scss';

export default class NewDropDown extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false,
      dropDownValue: null,
    };
  }
  UNSAFE_componentWillMount() {
    const { options, value } = this.props;
    const option = value && _.find(options, { id: value });
    const { label } = option || {};
    this.setState({
      dropDownValue: label || (options && options[0].label),
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.conditionalFilters !== this.props.conditionalFilters) {
      this.createConditionalFilter();
    }
  }

  getConditionalFilters = (conditionalFilters) => {
    return (
      conditionalFilters &&
      conditionalFilters.map((idx) => {
        return idx;
      })
    );
  };

  createConditionalFilter() {
    const { options, value } = this.props;
    const option = _.find(options, { id: value });
    const condition = this.getConditionalFilters(
      option && option.conditionalFilters
    );
    condition && this.props.setConditionalFilterList({ condition });
  }
  removeConditionalFilterFromList = () => {
    const { options, value } = this.props;
    const option = _.find(options, { id: value });
    const condition = this.getConditionalFilters(
      option && option.conditionalFilters
    );
    condition && this.props.removeConditionalFilter({ condition });
  };

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }
  changeValue = (item) => {
    const { id } = this.props;
    const { label, conditionalFilters } = item;

    this.setState({
      dropDownValue: label,
    });
    this.props.handleChangedValueSubmit({ uiValue: item.id, id });
    const condition =
      conditionalFilters && this.getConditionalFilters(conditionalFilters);
    condition && this.props.setConditionalFilterList({ condition });
    this.removeConditionalFilterFromList();
  };

  render() {
    const { options, value } = this.props;
    const option = value && _.find(options, { id: value });
    const { label } = option || {};
    return (
      <Fragment>
        <Dropdown
          isOpen={this.state.dropdownOpen}
          toggle={this.toggle}
          className={styles.btnGroup}
        >
          {this.state.dropDownValue && (
            <DropdownToggle
              caret
              className={cx(styles.btn, styles.dropdownToggle)}
            >
              {this.state.dropDownValue || label}
            </DropdownToggle>
          )}
          {this.state.dropdownOpen && (
            <DropdownMenu
              className={cx(styles.dropdownMenu, styles[this.props.mode])}
            >
              {options &&
                options.map((item) => {
                  return (
                    <DropdownItem
                      key={item.label}
                      className={styles.dropdownItem}
                      onClick={() => this.changeValue(item)}
                    >
                      {item.label}
                    </DropdownItem>
                  );
                })}
            </DropdownMenu>
          )}
        </Dropdown>
      </Fragment>
    );
  }
}

export class AddNewFilterDropdown extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false,
    };
  }

  handleClick = (item) => {
    this.props.handleMenuItemClick(item);
  };

  notToggle = () => {
    return;
  };

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }
  render() {
    const options = this.props.options;
    return (
      <Fragment>
        <Button
          iconLeft={AddIcon}
          className={styles.btnClassName}
          onClick={this.toggle}
        >
          Add Filter
        </Button>
        <Dropdown
          isOpen={this.state.dropdownOpen}
          toggle={this.state.dropdownOpen ? this.toggle : this.notToggle}
          className={styles.btnGroup}
        >
          {this.state.dropdownOpen && (
            <DropdownMenu
              className={cx(styles.dropdownMenu, styles[this.props.mode])}
              onChange={this.handleClick}
            >
              {options &&
                options.map((item) => {
                  return (
                    <DropdownItem
                      key={item.title}
                      className={styles.dropdownItem}
                      onClick={() => this.handleClick(item)}
                    >
                      {item.title}
                    </DropdownItem>
                  );
                })}
            </DropdownMenu>
          )}
        </Dropdown>
      </Fragment>
    );
  }
}
