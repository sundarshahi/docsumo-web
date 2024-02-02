import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { actions as appActions } from 'new/redux/app/actions';
import { showToast } from 'new/redux/helpers';
import { actions as usersActions } from 'new/redux/users/actions';
import { bindActionCreators } from 'redux';

import _, { get } from 'lodash';
import * as api from 'new/api';
import { USER_TYPES } from 'new/constants';
import passwordRegex from 'new/constants/passwordRegex';

import { MODAL_TYPE } from '../..';

import UserModalForm from './UserModalForm';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/;

const AddUserModal = ({
  setActiveModal,
  currentLoggedinUser,
  usersActions,
  tempFormData,
  setTempFormData,
  canTransferOwnership,
  showModal,
  setPrevActiveModal,
  activeModal,
  setCanTransferOwnership,
}) => {
  const [formError, setFormError] = useState({});
  const [apiList, setApiList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isFetchingServices, setIsFetchingServices] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: USER_TYPES.member,
    password: '',
    authorizedDocTypes: [],
  });

  const setInitialFormData = () => {
    if (canTransferOwnership && !_.isEmpty(tempFormData)) {
      setFormData({ ...tempFormData, role: USER_TYPES.owner });
    } else if (!_.isEmpty(tempFormData)) {
      setFormData(tempFormData);
    }
  };

  useEffect(() => {
    if (!isFetchingServices) {
      setInitialFormData();
    }
  }, [canTransferOwnership, isFetchingServices]);

  useEffect(() => {
    fetchServices();
    setPrevActiveModal(MODAL_TYPE.addUser);
  }, []);

  const validateForm = () => {
    const { fullName, email, password } = formData;

    let validateError = { ...formError };

    // Validate name
    if (!fullName) {
      validateError.fullName = 'Please enter your name.';
    }

    // Validate email
    if (!email) {
      validateError.email = 'Please enter your email.';
    }

    // Validate password
    if (!password) {
      validateError.password = 'Please create a password.';
    } else if (password) {
      if (password.length < 8) {
        validateError.password =
          'Password must be 8 characters long and must include at least a capital, a small letter, a number and a special character.';
      } else if (!passwordRegex.upperCharacter.test(password)) {
        validateError.password =
          'Password must include at least a capital letter.';
      } else if (!passwordRegex.lowerCharacter.test(password)) {
        validateError.password =
          'Password must include at least a small letter.';
      } else if (!passwordRegex.number.test(password)) {
        validateError.password = 'Password must include at least a number.';
      } else if (!passwordRegex.specialCharacter.test(password)) {
        validateError.password =
          'Password must include at least a special character.';
      }
    }

    if (
      _.isEmpty(validateError) ||
      _.every(validateError, (val) => val === '' || _.isNull(val))
    ) {
      return false;
    } else {
      setFormError(validateError);
      return true;
    }
  };

  const fetchServices = async () => {
    let queryParams = {
      mode: 'prod',
    };
    const response = await api.getServices(queryParams);
    let apiList = response.responsePayload.data;
    let enabledApis = apiList
      .filter((item) => item.canUpload)
      .map((item) => ({ value: item.value, title: item.title }));

    setApiList([...enabledApis]);
    setFormData({ ...formData, authorizedDocTypes: enabledApis });
    setIsFetchingServices(false);
  };

  const handleInputChange = (e, customEvent = null) => {
    setApiError('');

    let { name, value } = e ? e.target : customEvent;
    if (typeof value === 'string') {
      value = name !== 'email' ? _.trimStart(value) : _.trim(value);
    }

    setFormData({ ...formData, [name]: value });

    if (formError && formError[name]) {
      const errors = { ...formError, [name]: '' };
      setFormError(errors);
    }
    const { role: currentLoggedinUserRole } = currentLoggedinUser;

    if (
      name === 'role' &&
      value === USER_TYPES.owner &&
      currentLoggedinUserRole !== USER_TYPES.owner
    ) {
      setFormError({
        ...formError,
        role: 'You do not have permission to update the role to owner. Please contact the owner.',
      });
      return;
    }
    if (
      name === 'role' &&
      value === USER_TYPES.owner &&
      currentLoggedinUserRole === USER_TYPES.owner &&
      canTransferOwnership === false
    ) {
      setActiveModal(MODAL_TYPE.transferOwnership);
      setTempFormData(formData);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const hasErrors = validateForm();
    if (hasErrors) return;
    const { fullName, email, password, role, authorizedDocTypes } = formData;
    const { companyName } = currentLoggedinUser;

    setIsSaving(true);
    const authorizedDocTypesPayload = authorizedDocTypes.map(
      (item) => item.value
    );

    const payload = {
      full_name: fullName.trim(),
      email: email.trim(),
      password: password,
      role: role,
      company_name: companyName,
      authorized_doc_types: authorizedDocTypesPayload,
    };

    try {
      await api.addMember({ payload });

      showToast({
        title: 'User created successfully!',
        success: true,
      });

      usersActions.usersFetch({});

      handleCloseModal();
    } catch (e) {
      const dError = get(e.responsePayload, 'message', 'Something went wrong!');

      setApiError(dError);

      return;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setFormData({});
    setCanTransferOwnership(false);
    setActiveModal('');
  };

  return (
    <>
      <UserModalForm
        formType={'Add User'}
        formData={formData}
        onInputChange={handleInputChange}
        onCloseModal={handleCloseModal}
        onSubmit={handleAddUser}
        formError={formError}
        apiList={apiList}
        apiError={apiError}
        showDeleteUser={() => false}
        showModal={showModal}
        isSaving={isSaving}
        showEmail={true}
        activeModal={activeModal}
        disableForm={isFetchingServices}
      />
    </>
  );
};

const mapStateToProps = ({ app: { user: currentLoggedinUser } }) => ({
  currentLoggedinUser,
});

const mapDispatchToProps = (dispatch) => ({
  usersActions: bindActionCreators(usersActions, dispatch),
  appActions: bindActionCreators(appActions, dispatch),
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AddUserModal)
);
