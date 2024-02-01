import React, { Fragment, useState } from 'react';
import { showToast } from 'client/redux/helpers';

import * as api from 'client/api';
import InputField from 'client/components/widgets/InputField';
import { PUSH_DOCUMENT_PRODUCTION } from 'client/constants/modals/documentModals';
import { useAutofocus } from 'client/hooks/useAutofocus';
import { MIXPANEL_EVENTS } from 'client/thirdParty/mixpanel';
import { ReactComponent as CheckIcon } from 'images/icons/check.svg';
import { ReactComponent as CloseIcon } from 'images/icons/clear.svg';
import mixpanel from 'mixpanel-browser';

import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';

import styles from './index.scss';

function SelectDocumentBody({
  docTypeName,
  setDocTypeName,
  showError,
  setShowError,
  errorMessage,
}) {
  const documentTypeRef = useAutofocus();

  const handleInputChange = (e) => {
    setShowError(false);
    const { value } = e.target;
    setDocTypeName(value);
  };

  return (
    <Fragment>
      <div className={styles.dspushdoc__container}>
        <div className={styles.dspushdoc__input}>
          <InputField
            ref={documentTypeRef}
            name='document-type-name'
            type='text'
            placeholder='Enter name'
            value={docTypeName}
            label='Enter name of your Document type'
            id='document-type-name'
            onChange={handleInputChange}
            errorMsg={showError && errorMessage}
            showErrorIcon
          />
        </div>
      </div>
    </Fragment>
  );
}

function PushDocumentProdModal({
  user,
  isShowPushDocProdModal,
  handleTogglePushDocProdModal,
  pushDocType,
  appConfig,
}) {
  const [docTypeName, setDocTypeName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  const handlerConfirmPushDocument = async () => {
    const { canSwitchToOldMode = true } = appConfig;
    const payload = {
      doc_type: pushDocType,
      doc_title: docTypeName,
    };
    try {
      if (!docTypeName) {
        setShowError(true);
        setErrorMessage('Name cannot be empty!');
        return;
      }
      setIsPushing(true);
      await api.pushDocFromProd(payload);
      showToast({
        title: 'Changes have been pushed to production successfully',
        success: true,
      });
      setDocTypeName('');
      handleTogglePushDocProdModal();
    } catch (e) {
      setShowError(true);
      setErrorMessage(
        e?.responsePayload?.message ||
          'Failed to push changes to production. Please try again later'
      );
    } finally {
      setIsPushing(false);
      //Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.push_doc_type_complete, {
        'work email': user.email,
        'organization ID': user.orgId,
        version: 'old',
        mode: user.mode,
        'doc type': pushDocType,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    }
  };

  const resetDocTypeName = () => {
    setDocTypeName('');
    setShowError(false);
    setErrorMessage('');
  };

  return (
    <div>
      {isShowPushDocProdModal && (
        <ConfirmationModal
          modalContent={
            <SelectDocumentBody
              setDocTypeName={setDocTypeName}
              docTypeName={docTypeName}
              showError={showError}
              setShowError={setShowError}
              errorMessage={errorMessage}
            />
          }
          modalHeading={PUSH_DOCUMENT_PRODUCTION.HEADER_TEXT}
          proceedActionText={PUSH_DOCUMENT_PRODUCTION.HEADER_TEXT}
          processIcon={CheckIcon}
          cancelIcon={CloseIcon}
          onConfirm={handlerConfirmPushDocument}
          confirmText={PUSH_DOCUMENT_PRODUCTION.CONFIRM_TEXT}
          isConfirmLoading={isPushing}
          cancelActionText={PUSH_DOCUMENT_PRODUCTION.CANCEL_TEXT}
          onCloseModal={() => {
            resetDocTypeName();
            handleTogglePushDocProdModal();
          }}
        />
      )}
    </div>
  );
}

export default PushDocumentProdModal;
