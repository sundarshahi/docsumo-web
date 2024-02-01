import React, { Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from '@redux/app/actions';
import { actions as documentActions } from '@redux/documents/actions';
import { showToast } from 'client/redux/helpers';
import { bindActionCreators } from 'redux';

import * as api from 'client/api';
import Dropdown from 'client/components/widgets/DropDown';
import * as apiConstants from 'client/constants/api';
import { PULL_DOCUMENT_PRODUCTION } from 'client/constants/modals/documentModals';
import { MIXPANEL_EVENTS } from 'client/thirdParty/mixpanel';
import { ReactComponent as CheckIcon } from 'images/icons/check.svg';
import { ReactComponent as CloseIcon } from 'images/icons/clear.svg';
import { ReactComponent as ErrorIcon } from 'images/icons/error_confidence.svg';
import mixpanel from 'mixpanel-browser';

import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';

import styles from './index.scss';

function SelectDocumentBody({ documents, setSelectedList, selectedList }) {
  const handleExpireInputChange = (e) => {
    setSelectedList(e);
  };

  return (
    <Fragment>
      <div className={styles.dspulldoc__container}>
        {documents.length > 0 ? (
          <label htmlFor='temp_token'>
            {PULL_DOCUMENT_PRODUCTION.DROPDOWN_LABEL}
          </label>
        ) : null}
        <div className={styles.dspulldoc__dropdownwidth}>
          {documents.length > 0 ? (
            <Dropdown
              className={styles.dspulldoc__dropdown}
              options={documents}
              selectedList={selectedList}
              handleValueSelection={handleExpireInputChange}
              isModalUsage
            />
          ) : (
            <span className={styles.dspulldoc__err}>
              <ErrorIcon class={styles['dspulldoc__err--icon']} />
              <p className={styles.dspulldoc__notFound}>
                There is no document type to pull into test environment
              </p>
            </span>
          )}
        </div>
      </div>
    </Fragment>
  );
}

function PullDocumentProModal({
  isShowPullDocProdModal,
  handleTogglePullDocProdModal,
  dynamicDocuments,
  fetchSucceeded,
  fetchFailed,
  errorMsg,
  user,
  documentActions,
  toggleUploadDocPopup,
  config,
}) {
  const [selectedList, setSelectedList] = useState({});
  const [isPulling, setIsPulling] = useState(false);
  const { canSwitchToOldMode = true } = config;

  const handlerConfirmPullDocument = async () => {
    try {
      setIsPulling(true);
      const response = await api.pullDocFromProd({
        docType: selectedList.value,
      });
      const { message = '' } = response?.responsePayload;
      showToast({
        title: message || 'Document types has been pulled successfully!',
        success: true,
      });
      documentActions.allDocumentsTypeFetch({
        queryParams: {
          sort_by: 'created_date.desc',
        },
      });
      toggleUploadDocPopup(false);
      handleTogglePullDocProdModal();
    } catch (e) {
      showToast({
        title:
          e?.responsePayload?.message ||
          'Failed to pull document types from production.Please try again later!',
        error: true,
      });
    } finally {
      setIsPulling(false);

      //Add mixpanel
      mixpanel.track(MIXPANEL_EVENTS.pull_doc_type_complete, {
        'work email': user.email,
        'organization ID': user.orgId,
        version: 'old',
        mode: user.mode,
        'doc type': selectedList.value,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    }
  };

  useEffect(() => {
    if (errorMsg && fetchFailed) {
      showToast({
        title:
          errorMsg ||
          'Failed to pull document types from production. Please try again later!',
        error: true,
      });
    }
  }, [errorMsg, fetchFailed]);

  return (
    <div>
      {isShowPullDocProdModal && fetchSucceeded ? (
        <ConfirmationModal
          modalContent={
            <SelectDocumentBody
              documents={dynamicDocuments.documents}
              setSelectedList={setSelectedList}
              selectedList={selectedList}
              fetchSucceeded={fetchSucceeded}
            />
          }
          modalHeading={PULL_DOCUMENT_PRODUCTION.HEADER_TEXT}
          proceedActionText={PULL_DOCUMENT_PRODUCTION.HEADER_TEXT}
          processIcon={CheckIcon}
          cancelIcon={CloseIcon}
          onConfirm={handlerConfirmPullDocument}
          isConfirmLoading={isPulling}
          confirmText={PULL_DOCUMENT_PRODUCTION.CONFIRM_TEXT}
          cancelActionText={PULL_DOCUMENT_PRODUCTION.CANCEL_TEXT}
          onCloseModal={handleTogglePullDocProdModal}
        />
      ) : null}
    </div>
  );
}

function mapStateToProp(state) {
  const { dynamicDocuments } = state.documents;
  const { fetchState, error } = state.documents?.dynamicDocuments;
  const { user, config } = state.app;
  const errorMsg = error || null;

  const fetchSucceeded = fetchState === apiConstants.FETCH_STATES.SUCCESS;
  const fetchFailed = fetchState === apiConstants.FETCH_STATES.FAILURE;

  return {
    dynamicDocuments,
    fetchSucceeded,
    fetchFailed,
    errorMsg,
    user,
    config,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
  };
}
export default connect(
  mapStateToProp,
  mapDispatchToProps
)(PullDocumentProModal);
