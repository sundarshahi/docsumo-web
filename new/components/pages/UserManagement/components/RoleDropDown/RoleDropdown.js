/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import React from 'react';
import { connect } from 'react-redux';

import cx from 'classnames';
import { DoubleCheck } from 'iconoir-react';
import { USER_TYPES } from 'new/constants';
import { Dropdown } from 'new/ui-elements/Dropdown/Dropdown';
import ErrorText from 'new/ui-elements/Input/components/ErrorText/ErrorText';

import { MODAL_TYPE } from '../..';

import { USER_TYPES_LIST } from './constants';

import styles from './RoleDropdown.scss';

const RoleDropDown = ({
  errorMsg,
  onInputChange,
  value,
  currentLoggedinUser,
  formData,
  activeModal,
}) => {
  const handleValueChange = ({ value }) => {
    let event = { name: 'role', value };
    onInputChange(null, event);
  };

  const { email, role } = formData;

  const dropdownDisabled =
    activeModal === MODAL_TYPE.editUser &&
    (email === currentLoggedinUser.email ||
      (role === USER_TYPES.owner &&
        currentLoggedinUser.role !== USER_TYPES.owner &&
        !errorMsg));

  const dropdownDisabledTooltipLabel = () => {
    if (email === currentLoggedinUser.email)
      return 'Cannot change your own role.';
    if (currentLoggedinUser.role === USER_TYPES.owner)
      return 'Contact Owner to change role';
    return '';
  };

  return (
    <>
      <Dropdown
        data={USER_TYPES_LIST}
        formatOptionLabel={CustomDropdownLabel}
        optionLabelKey='value'
        onChange={handleValueChange}
        value={value}
        disabled={dropdownDisabled}
        className={styles.dropdown}
        optionClassNames={styles.dropdownOption}
        dropdownDisabledTooltipLabel={dropdownDisabledTooltipLabel()}
      />
      <ErrorText>{errorMsg}</ErrorText>
    </>
  );
};

const CustomDropdownLabel = ({ value, description }, dropdownValue) => {
  return (
    <div className={styles.dropdownListItemWrapper}>
      <div
        style={{ visibility: value === dropdownValue ? 'visible' : 'hidden' }}
      >
        <DoubleCheck color='var(--ds-clr-primary)' />
      </div>
      <div className={styles.dropdownListItem}>
        <div>
          <span className={cx(styles.dropdownListValue)}>{value}</span>
        </div>
        <p className={styles.dropdownListDesc}>{description}</p>
      </div>
    </div>
  );
};

const mapStateToProps = ({ app: { user: currentLoggedinUser } }) => ({
  currentLoggedinUser,
});

// export default RoleDropDown;

export default connect(mapStateToProps)(RoleDropDown);
