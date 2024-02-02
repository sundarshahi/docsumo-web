import React from 'react';

import cx from 'classnames';
import { Cancel, Refresh, RemoveUser } from 'iconoir-react';
import { PageMetadata } from 'new/components/layout/page';
import ErrorMessageBlock from 'new/components/widgets/ErrorMessageBlock/ErrorMessageBlock';
import Button, { SIZE, VARIANT } from 'new/ui-elements/Button/Button';
import { COLOR_SCHEME } from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Modal from 'new/ui-elements/Modal/Modal';

import { MODAL_TYPE } from '../..';
import ApiList from '../ApiList/ApiList';
import UserFormInputField from '../UserFormInputField/UserFormInputField';

import styles from './UserModal.scss';

const UserModalForm = ({
  formData,
  onInputChange,
  onCloseModal,
  onSubmit,
  formError,
  showDeleteUser,
  isSaving,
  apiList,
  apiError,
  formType,
  setActiveModal,
  showModal,
  showEmail,
  showMfa,
  onMfaReset,
  isResettingMfa,
  activeModal,
  disableForm = false,
}) => {
  return (
    <>
      <Modal onCloseHandler={onCloseModal} show={showModal}>
        <PageMetadata title={formType} />
        <div className={styles.header}>
          <span className={styles.title}>{formType}</span>
          <span>
            <IconButton
              icon={<Cancel />}
              variant='ghost'
              onClick={onCloseModal}
              size={SIZE.SMALL}
            />
          </span>
        </div>
        {apiError ? (
          <div className={styles.error}>
            <ErrorMessageBlock content={apiError} />
          </div>
        ) : (
          ''
        )}
        <form onSubmit={(e) => onSubmit(e)}>
          <div className={styles.row}></div>
          <div className={styles.inputWrap}>
            <div className={styles.row}>
              <UserFormInputField
                formData={formData}
                fieldName='fullName'
                label='Full Name'
                type='text'
                formError={formError}
                onInputChange={onInputChange}
                placeholder='John Doe'
              />
            </div>
            {showEmail ? (
              <div className={styles.row}>
                <UserFormInputField
                  formData={formData}
                  fieldName='email'
                  label='Email'
                  type='text'
                  formError={formError}
                  onInputChange={onInputChange}
                  placeholder='ex: joemarcos@docsumo.com'
                />
              </div>
            ) : (
              ''
            )}
            <div className={styles.row}>
              <UserFormInputField
                formData={formData}
                fieldName='password'
                label='Password'
                type='password'
                formError={formError}
                onInputChange={onInputChange}
                placeholder='Abc#123'
              />
            </div>
            <div className={styles.row}>
              <UserFormInputField
                formData={formData}
                fieldName='role'
                label='Role'
                type='role'
                formError={formError}
                onInputChange={onInputChange}
                placeholder='ex: joemarcos@docsumo.com'
                activeModal={activeModal}
              />
            </div>
            {showMfa ? (
              <div
                className={cx(
                  styles.row,
                  styles.ctaSection,
                  'd-flex',
                  'align-items-center'
                )}
              >
                <span className={cx(styles.formLabel)}>
                  Multi-factor Authentication
                </span>
                <Button
                  icon={<Refresh />}
                  disabled={isResettingMfa}
                  variant={VARIANT.OUTLINED}
                  size={SIZE.SMALL}
                  onClick={onMfaReset}
                >
                  Reset
                </Button>
              </div>
            ) : (
              ''
            )}
            <ApiList
              apiList={apiList}
              authorizedDocTypes={formData.authorizedDocTypes}
              onInputChange={onInputChange}
            />
            {showDeleteUser() && (
              <div className={cx(styles.row, styles.ctaSection)}>
                <span
                  className={cx(
                    styles.formLabel,
                    'd-flex',
                    'align-items-center'
                  )}
                >
                  Delete User
                </span>
                <Button
                  icon={<RemoveUser />}
                  variant={VARIANT.OUTLINED}
                  onClick={() => setActiveModal(MODAL_TYPE.deleteUser)}
                  size={SIZE.SMALL}
                  colorScheme={COLOR_SCHEME.danger}
                  className={styles.deleteBtn}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
          <div className={styles.footer}>
            <div>
              <Button
                disabled={isSaving}
                variant={VARIANT.OUTLINED}
                size={SIZE.SMALL}
                onClick={onCloseModal}
              >
                Cancel
              </Button>
              <Button
                disabled={isSaving || disableForm}
                size={SIZE.SMALL}
                isLoading={isSaving}
                variant={VARIANT.CONTAINED}
                className={styles.footerBtn}
                onClick={onSubmit}
              >
                Save
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default UserModalForm;
