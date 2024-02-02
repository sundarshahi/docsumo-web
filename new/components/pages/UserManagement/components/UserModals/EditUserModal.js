import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as usersActions } from 'new/redux/users/actions';
import { bindActionCreators } from 'redux';

import _ from 'lodash';
import * as api from 'new/api';
import { USER_TYPES } from 'new/constants';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/;

import { showToast } from 'new/redux/helpers';

import mixpanel from 'mixpanel-browser';
import passwordRegex from 'new/constants/passwordRegex';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';

import { MODAL_TYPE } from '../..';

import UserModalForm from './UserModalForm';

const EditUserModal = ({
  setActiveModal,
  editUserData,
  currentLoggedinUser,
  appActions,
  usersActions,
  tempFormData,
  setTempFormData,
  canTransferOwnership,
  showModal,
  config,
  setPrevActiveModal,
  activeModal,
  setCanTransferOwnership,
}) => {
  const {
    userId: editUserId,
    role: editUserRole,
    email: editUserEmail,
    authorizedDocTypes: editUserAuthorizedDocTypes,
  } = editUserData;
  const [formError, setFormError] = useState({});
  const [apiList, setApiList] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    role: '',
    password: '',
    authorizedDocTypes: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingMfa, setIsResettingMfa] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isFetchingServices, setIsFetchingServices] = useState(false);
  const {
    userId: currentLoggedinUserId = '',
    role: currentLoggedinUserRole,
    email: currentLoggedinUserEmail,
  } = currentLoggedinUser;

  const setFormRoleData = () => {
    if (canTransferOwnership) {
      setFormData({ ...formData, role: USER_TYPES.owner });
    }
  };
  useEffect(() => {
    fetchServices();
    setPrevActiveModal(MODAL_TYPE.editUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchServices = async () => {
    setIsFetchingServices(true);
    const initialData = _.isEmpty(tempFormData) ? editUserData : tempFormData;
    setFormData({ ...formData, ...initialData });
    let queryParams = {
      mode: 'prod',
    };
    const response = await api.getServices(queryParams);
    let apiList = response.responsePayload.data;
    let enabledApis = apiList
      .filter((item) => item.canUpload === true)
      .map((item) => ({ value: item.value, title: item.title }));

    setApiList([...enabledApis]);
    setFormData({
      ...initialData,
      authorizedDocTypes: editUserAuthorizedDocTypes || [],
    });
    setIsFetchingServices(false);
  };

  useEffect(() => {
    if (!isFetchingServices) {
      setFormRoleData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canTransferOwnership, isFetchingServices]);

  const handleInputChange = (e, customEvent = null) => {
    let { name, value } = e ? e.target : customEvent;
    if (typeof value === 'string') {
      value = name !== 'email' ? _.trimStart(value) : _.trim(value);
    }

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
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateConfig = async () => {
    const responseData = await api.getServices();
    const data = _.get(responseData.responsePayload, 'data', {});
    await appActions.updateConfig({
      updates: {
        documentTypes: data,
      },
    });
  };

  const validateForm = () => {
    const { fullName, email, password } = formData;

    let validateError = { ...formError };

    // Validate name
    if (!fullName) {
      validateError.fullName = 'Please enter your name.';
    }

    // Validate password
    if (password) {
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

  const handleEditUser = async (e) => {
    e.preventDefault();
    const hasErrors = validateForm();

    if (hasErrors) return;

    const { fullName, email, role, password, authorizedDocTypes } = formData;

    const authorizedDocTypesPayload = authorizedDocTypes.map(
      (item) => item.value
    );

    setIsSaving(true);

    const payload = {
      user_id: editUserId,
      full_name: fullName.trim(),
      email: email.trim(),
      role: role,
      password: password,
      authorized_doc_types: authorizedDocTypesPayload,
    };

    try {
      await api.editMember({ payload });
      if (editUserId === currentLoggedinUserId) {
        await handleUpdateConfig();
      }

      showToast({
        title: 'User edited successfully!',
        success: true,
      });

      usersActions.usersFetch({});

      handleCloseModal();
    } catch (e) {
      const { message } = e.responsePayload || {};

      setApiError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const showDeleteUser = () => {
    if (currentLoggedinUserId === editUserId) {
      return false;
    }
    if (
      currentLoggedinUserRole === USER_TYPES.admin &&
      editUserRole === USER_TYPES.owner
    ) {
      return false;
    }
    return true;
  };

  const handleMFAReset = async (e) => {
    e.preventDefault();

    const { userId, fullName } = editUserData;
    const { canSwitchToOldMode = true } = config;

    setIsResettingMfa(true);
    try {
      await api.resetMfaOfUser({
        payload: {
          user_id: userId,
        },
      });
      showToast({
        title: `MFA reset successfully for ${fullName}`,
        success: true,
      });
      mixpanel.track(MIXPANEL_EVENTS.reset_user_mfa, {
        'work email': currentLoggedinUser?.email || '',
        role: currentLoggedinUser?.role || '',
        version: 'new',
        canSwitchUIVersion: canSwitchToOldMode,
      });
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'message') ||
        `Failed to reset MFA for ${fullName}`;
      showToast({
        title: error,
        error: true,
      });
    } finally {
      setIsResettingMfa(false);
    }
  };

  const handleCloseModal = () => {
    setCanTransferOwnership(false);
    setActiveModal('');
    setTempFormData({});
  };

  return (
    <>
      <UserModalForm
        formType={'Edit User'}
        formData={formData}
        onInputChange={handleInputChange}
        onCloseModal={handleCloseModal}
        onSubmit={handleEditUser}
        formError={formError}
        apiList={apiList}
        apiError={apiError}
        showDeleteUser={showDeleteUser}
        setActiveModal={setActiveModal}
        showModal={showModal}
        showEmail={false}
        showMfa={editUserEmail !== currentLoggedinUserEmail}
        onMfaReset={handleMFAReset}
        isSaving={isSaving}
        isResettingMfa={isResettingMfa}
        activeModal={activeModal}
        disableForm={isFetchingServices}
      />
    </>
  );
};

const mapStateToProps = ({ app: { user: currentLoggedinUser, config } }) => ({
  currentLoggedinUser,
  config,
});

const mapDispatchToProps = (dispatch) => ({
  usersActions: bindActionCreators(usersActions, dispatch),
  appActions: bindActionCreators(appActions, dispatch),
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(EditUserModal)
);
