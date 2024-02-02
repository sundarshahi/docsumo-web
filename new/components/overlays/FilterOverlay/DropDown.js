import React, { Component, Fragment } from 'react';

import * as api from 'new/api';
import { Dropdown } from 'new/ui-elements/Dropdown/Dropdown';

import styles from './dropDown.scss';

class DropDown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tableOptions: [],
    };
  }

  componentDidMount() {
    const { optionTable = {} } = this.props;
    if (optionTable?.value) {
      this.getTableColumns(optionTable?.value);
    }
  }

  componentDidUpdate(prevProps) {
    const { optionTable } = this.props;
    const { optionTable: prevOptionTable } = prevProps;
    if (
      prevOptionTable &&
      optionTable?.value &&
      prevOptionTable.value !== optionTable.value
    ) {
      this.getTableColumns(optionTable.value);
    }
  }

  getTableColumns = async (dropDownId) => {
    let response = await api.getCSVHeader({
      dropDownId,
    });

    this.setState({
      tableOptions: response?.responsePayload?.data || [],
    });
  };

  changeValue = (item) => {
    const { handleChangedValueSubmit, id, filterId } = this.props;
    const { id: itemId, label, type } = item;

    handleChangedValueSubmit({
      id: id,
      value: itemId,
      filterId: filterId,
      label: label,
      uiValue: filterId === 1 ? type : label.toLowerCase(),
    });
  };

  render() {
    const {
      option,
      value,
      mainField,
      labelText,
      helpText,
      icons,
      link,
      id,
      optionTable,
      indexCheck,
      changeDataTypeFromSettings,
    } = this.props;

    if (indexCheck?.value === 302 && id === 13) {
      return null;
    }

    if (indexCheck?.value === 301 && id === 11) {
      return null;
    }

    const { tableOptions } = this.state;

    return (
      <Fragment>
        {mainField === true ? (
          <div className={styles.generalMainField}>
            <label htmlFor={labelText}>
              {labelText}
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

            <Dropdown
              data={optionTable ? this.state.tableOptions : option}
              optionLabelKey='label'
              optionValueKey='id'
              value={value}
              optionClassNames={styles.dropdown}
              className={styles.dropdownLabel}
              disabled={
                (indexCheck?.value === 302 && id === 12) ||
                (id !== 2 && changeDataTypeFromSettings)
              }
              onChange={(value) => this.changeValue(value)}
              formatOptionLabel={(item) => (
                <div className='d-flex align-items-center w-100'>
                  <span className={styles.icon}>
                    {icons.find((icon) => icon.id === item.id)?.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
              )}
            />
          </div>
        ) : (
          <div className={styles.generalSubField}>
            <label htmlFor={labelText}>
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

            <Dropdown
              data={optionTable ? tableOptions : option}
              optionLabelKey='label'
              optionValueKey='id'
              value={value}
              optionClassNames={styles.dropdown}
              className={styles.dropdownLabel}
              disabled={
                (indexCheck?.value === 302 && id === 12) ||
                (id !== 2 && changeDataTypeFromSettings)
              }
              onChange={(value) => this.changeValue(value)}
              formatOptionLabel={(item) => (
                <div className='d-flex align-items-center w-100'>
                  {item.icon && (
                    <span className={styles.icon}>{item.icon}</span>
                  )}
                  <span>
                    {' '}
                    {id === 12 && item.label !== 'None'
                      ? item.label.split('.').slice(0, -1).join('.')
                      : item.label}
                  </span>
                </div>
              )}
            />
          </div>
        )}
      </Fragment>
    );
  }
}

export default DropDown;
