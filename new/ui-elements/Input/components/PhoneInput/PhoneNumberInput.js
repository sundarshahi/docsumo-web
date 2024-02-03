/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';

import cx from 'classnames';
import Flags from 'country-flag-icons/react/3x2';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { NavArrowDown, NavArrowUp } from 'iconoir-react';
import _ from 'lodash';
import OutsideClickHandler from 'react-outside-click-handler';
import Input, {
  getCountries,
  getCountryCallingCode,
} from 'react-phone-number-input/input';
import en from 'react-phone-number-input/locale/en';

import ErrorText from '../ErrorText/ErrorText';

import 'react-phone-number-input/style.css';
import styles from './PhoneNumberInput.scss';

class PhoneNumberInput extends Component {
  state = {
    showCountryDropdown: false,
    country: '',
    countries: [],
    countriesList: [],
    searchValue: '',
    valueIndex: 0,
    searchIndex: 0,
    isDropdownDisplayFocused: false,
  };

  dropdownListRef = React.createRef();

  componentDidMount() {
    const { defaultCountry = 'US' } = this.props;
    const countries = getCountries() || [];

    let valueIndex = 0;

    const list = countries.map((country) => {
      return {
        abbr: country,
        code: getCountryCallingCode(country),
        flag: getUnicodeFlagIcon(country),
        name: en[country],
      };
    });

    const countriesList = _.orderBy(list, ['name'], ['asc']);

    valueIndex = countriesList.findIndex(
      (item) => item.abbr === defaultCountry
    );

    this.setState({
      countries,
      countriesList,
      valueIndex,
      searchIndex: valueIndex,
      country: defaultCountry,
    });
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener(
      'keydown',
      this.handleSpaceKeyDownOnDropdownText
    );
  }

  handleKeyDown = (e) => {
    const { searchIndex, countriesList } = this.state;
    const { keyCode, key } = e;

    const dropdownContainer = document.getElementById('dropdown-container');

    if (!dropdownContainer) return;

    if (
      (keyCode >= 48 && keyCode <= 57) || // 0-9
      (keyCode >= 96 && keyCode <= 105) || //0-9
      (keyCode >= 65 && keyCode <= 90) // alphabets
    ) {
      const search = key;
      this.setState({ searchValue: search.toLowerCase() });

      this.handleSearch(search);
    } else if (keyCode === 13) {
      // on enter
      this.handleCountrySelection(countriesList[searchIndex].abbr, searchIndex);
    } else if (keyCode === 38) {
      // on arrow up
      if (searchIndex === 0) {
        return;
      } else {
        this.setState({ searchIndex: searchIndex - 1 });
        dropdownContainer.scrollTo({
          top: searchIndex * 34 - 68,
          left: 0,
          behavior: 'smooth',
        });
      }
    } else if (keyCode === 40) {
      // on arrow down
      if (searchIndex === countriesList.length - 1) {
        return;
      } else {
        this.setState({ searchIndex: searchIndex + 1 });
        dropdownContainer.scrollTo({
          top: searchIndex * 34,
          left: 0,
          behavior: 'smooth',
        });
      }
    } else {
      return;
    }
  };

  handleSearch = (value) => {
    const { countriesList } = this.state;

    const index = countriesList.findIndex((item) => {
      return item.name.charAt(0).toLowerCase() === value.charAt(0);
    });

    this.setState({ searchIndex: index });

    this.showListItem(index);
  };

  showListItem = (index) => {
    const listItem = document.getElementById(`country-item-${index}`);

    listItem?.scrollIntoView({
      block: 'center',
      inline: 'nearest',
    });
  };

  toggleCountrySelection = (value) => {
    const { valueIndex } = this.state;

    this.setState({
      showCountryDropdown: value,
      searchValue: '',
    });

    if (value) {
      document.addEventListener('keydown', this.handleKeyDown);
      setTimeout(() => {
        this.showListItem(valueIndex);
      }, 50);
    } else {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
  };

  handleCountrySelection = (countryAbbr, index) => {
    const { onChange } = this.props;

    onChange('');

    this.setState({
      country: countryAbbr,
      showCountryDropdown: false,
      valueIndex: index,
      searchValue: '',
      searchIndex: index,
    });
  };

  getCountryFlag = (value) => {
    let Flag = Flags[value];
    return (
      <Flag
        style={{ display: 'inline-block', height: '20px', width: '20px' }}
      />
    );
  };

  handleSpaceKeyDownOnDropdownValue = (e) => {
    const dropdownText = document.getElementById('dropdown-value');

    const { keyCode } = e;

    if (keyCode === 32) {
      // On space
      this.toggleCountrySelection(true);
      dropdownText.blur();
    }
  };

  handleDropdownTextFocus = (e) => {
    this.setState({ isDropdownDisplayFocused: true });

    document.addEventListener(
      'keydown',
      this.handleSpaceKeyDownOnDropdownValue
    );
  };

  handleDropdownTextBlur = () => {
    this.setState({
      isDropdownDisplayFocused: false,
    });

    document.removeEventListener(
      'keydown',
      this.handleSpaceKeyDownOnDropdownValue
    );
  };

  renderCountrySelection = () => {
    const {
      showCountryDropdown,
      country,
      countriesList,
      valueIndex,
      searchIndex,
    } = this.state;

    return (
      <div className={styles.selectionDropdown}>
        <OutsideClickHandler
          onOutsideClick={() => this.toggleCountrySelection(false)}
        >
          <div
            className={cx(styles.selectionDropdown_display, {
              [styles.selectionDropdown_display__open]: showCountryDropdown,
            })}
            id='dropdown-value'
            tabIndex={0}
            onFocus={this.handleDropdownTextFocus}
            onBlur={this.handleDropdownTextBlur}
            onClick={() => this.toggleCountrySelection(!showCountryDropdown)}
          >
            {this.getCountryFlag(country)}
            {showCountryDropdown ? (
              <NavArrowUp width={20} height={20} />
            ) : (
              <NavArrowDown width={20} height={20} />
            )}
          </div>
          {showCountryDropdown && (
            <div
              className={styles.selectionDropdown_content}
              id='dropdown-container'
            >
              <ul className={styles.selectionDropdown_list}>
                {countriesList.map((country, index) => (
                  <li
                    id={`country-item-${index}`}
                    key={country.abbr}
                    onClick={() =>
                      this.handleCountrySelection(country.abbr, index)
                    }
                    className={cx(
                      {
                        [styles.option]: index === searchIndex,
                      },
                      { [styles.selected]: index === valueIndex }
                    )}
                  >
                    {this.getCountryFlag(country.abbr)}
                    <div style={{ marginLeft: '10px' }}>
                      <span>{country.name}</span>
                      <span>&nbsp;(+{country.code})</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </OutsideClickHandler>
      </div>
    );
  };

  render() {
    const {
      className,
      inputGroupClassName,
      name,
      placeholder = '',
      value = '',
      hasError = false,
      onChange,
      errorText,
      autoComplete = 'on',
    } = this.props;
    const { country } = this.state;

    if (!country) {
      return null;
    }

    return (
      <div className={cx(styles.container, inputGroupClassName)}>
        <div className={styles.inputContainer}>
          {this.renderCountrySelection()}
          <Input
            name={name}
            international={true}
            placeholder={placeholder}
            value={value}
            autoComplete={autoComplete}
            onChange={onChange}
            className={cx(styles.input, styles.input__phone, {
              [styles.input__error]: hasError,
              className,
            })}
            withCountryCallingCode
            country={country}
          />
        </div>
        {hasError ? <ErrorText>{errorText}</ErrorText> : ''}
      </div>
    );
  }
}

export default PhoneNumberInput;
