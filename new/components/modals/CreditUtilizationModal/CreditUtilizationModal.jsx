import React, { useState } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { Cancel } from 'iconoir-react';
import { triggerCreditNotification } from 'new/api';
import { USER_TYPES } from 'new/constants';
import Button, { SIZE, VARIANT } from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Input from 'new/ui-elements/Input/Input';
import Modal from 'new/ui-elements/Modal';

import ConfirmationModal from '../ConfirmationModal';
import ModalFooter from '../ModalFooter';

import styles from './CreditUtilizationModal.scss';

const CreditUtilizationModal = ({
  role,
  showCreditUtilizationModal,
  toggleShowCreditUtilizationModal,
  appActions,
  isCreditLow,
}) => {
  const numberSelectionArr = [100, 200, 500, 800, 1000, 2000, 5000];

  const isUserAdminOwner =
    role === USER_TYPES.admin || role === USER_TYPES.owner;

  const [credits, setCredits] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreditChange = (e) => {
    const {
      target: { value },
    } = e;

    setErrorMessage('');
    setCredits(value);
  };

  const handleAdditionalInfoChange = ({ target: { value } }) => {
    setAdditionalInfo(value);
  };

  const handleCloseModal = () => {
    setCredits(null);
    setAdditionalInfo('');
    toggleShowCreditUtilizationModal();
  };

  const handleSubmit = async () => {
    if (isUserAdminOwner) {
      if (!credits) {
        setErrorMessage('Please enter the credits required');
        return;
      }
    }

    let notificationType = '';
    if (isUserAdminOwner) {
      notificationType = 'request_credit';
    } else if (isCreditLow) {
      notificationType = 'low_credit';
    } else {
      notificationType = 'member_credit_request';
    }

    const payload = {
      queryParams: {
        notification_type: notificationType,
      },
      ...(isUserAdminOwner && {
        number_of_credits: credits,
        additional_comments: additionalInfo,
      }),
    };

    try {
      setIsLoading(true);

      const { responsePayload } = await triggerCreditNotification(payload);

      const { message = '' } = responsePayload;

      appActions.setToast({
        title: message || 'Our team will be in touch with you shortly',
        success: true,
      });
      handleCloseModal();
      appActions.setLocalConfigFlags({
        showLowCredit85Popup: false,
        showLowCredit75Popup: false,
      });
      appActions.setConfigFlags({
        showLowCredit85Popup: false,
        showLowCredit75Popup: false,
      });
    } catch (e) {
      const errorMsg = e?.responsePayload
        ? e.responsePayload.message
        : 'An error occurred while requesting for Credits';
      appActions.setToast({
        title: errorMsg,

        error: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isUserAdminOwner && showCreditUtilizationModal ? (
        <Modal show={true} onCloseHandler={handleCloseModal} className='p-6'>
          <div className='d-flex justify-content-between align-items-center'>
            <h6 className='heading-6 mr-4'>Request Credits</h6>
            <IconButton
              icon={Cancel}
              variant='ghost'
              onClick={handleCloseModal}
            />
          </div>
          <div className='text-sm clr-gray-800'>
            Our team will get in touch with you shortly after requesting
            credits.
          </div>
          <div className='my-6'>
            <div className='text-md clr-gray-900 mb-3'>
              How many credits would you like to purchase?
            </div>
            <Input
              type='number'
              placeholder='Enter the number of credits'
              className={styles.input}
              value={credits}
              onChange={handleCreditChange}
              onKeyDown={(e) =>
                ['e', 'E', '+', '-', '.', ','].includes(e.key) &&
                e.preventDefault()
              }
              hasError={errorMessage}
              errorText={errorMessage}
              min={0}
            />

            <div className={cx(styles.textBtn__wrapper, 'mt-3')}>
              {numberSelectionArr.map((credit) => (
                <Button
                  key={credit}
                  variant={VARIANT.OUTLINED}
                  size={SIZE.SMALL}
                  className={cx('clr-gray-800', styles.textBtn)}
                  onClick={() => setCredits(credit)}
                >
                  {credit}
                </Button>
              ))}
            </div>

            <div className='mt-5'>Additional information (Optional)</div>
            <Input
              placeholder='Add a note'
              className={cx('mt-2', styles.input)}
              value={additionalInfo}
              onChange={handleAdditionalInfoChange}
            />
          </div>
          <ModalFooter
            cancel='Cancel'
            confirm='Request Credits'
            handleCloseModal={handleCloseModal}
            handleConfirm={handleSubmit}
            loading={isLoading}
          />
        </Modal>
      ) : (
        ''
      )}
      {!isUserAdminOwner && showCreditUtilizationModal && isCreditLow ? (
        <ConfirmationModal
          modalTitle='Notify Admin'
          show={true}
          confirmBtnLabel='Yes'
          cancelBtnLabel='No, go back'
          modalBody='This action will send an email notification to your administrator about the credit balance. Do you want to proceed?'
          handleModalClose={handleCloseModal}
          handleConfirmBtnClick={handleSubmit}
          isLoading={isLoading}
        />
      ) : (
        ''
      )}
      {!isUserAdminOwner && showCreditUtilizationModal && !isCreditLow ? (
        <ConfirmationModal
          modalTitle='Request Credits'
          show={true}
          confirmBtnLabel='Yes'
          cancelBtnLabel='No, go back'
          modalBody='This action will send an email to your administrator about the request for additional credits. Do you want to proceed?'
          handleModalClose={handleCloseModal}
          handleConfirmBtnClick={handleSubmit}
          isLoading={isLoading}
        />
      ) : (
        ''
      )}
    </>
  );
};

const mapStateToProps = ({
  app: {
    user: { role },
    showCreditUtilizationModal,
    config: { showLowCredit85Popup, showLowCredit75Popup },
  },
}) => ({
  role,
  showCreditUtilizationModal,
  isCreditLow: showLowCredit75Popup || showLowCredit85Popup,
});

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreditUtilizationModal);
