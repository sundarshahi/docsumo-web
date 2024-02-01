import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { showToast } from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import { Cancel } from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import * as apiConstants from 'new/constants/api';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel.js';
import { Dropdown } from 'new/ui-elements/Dropdown/Dropdown';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Modal from 'new/ui-elements/Modal';

import ModalFooter from '../ModalFooter';

import styles from './PullDocumentProdModal.scss';

function SelectDocumentBody({ documents = [], setSelectedList, selectedList }) {
  const handleSelectionChange = (e) => {
    setSelectedList(e);
  };

  return (
    <div className={styles.content}>
      {documents.length > 0 ? (
        <>
          <span>Select document type</span>
          <Dropdown
            data={documents}
            onChange={handleSelectionChange}
            optionLabelKey='label'
            value={selectedList?.value}
            size='large'
          />
        </>
      ) : (
        <p className={styles.error}>
          There is no document type to pull into test environment
        </p>
      )}
    </div>
  );
}

function PullDocumentProModal({
  isShowPullDocProdModal,
  toggleDocPullFromProdModal,
  dynamicDocuments = {},
  fetchSucceeded,
  fetchFailed,
  errorMsg,
  user,
  documentActions,
  toggleUploadDocPopup,
  config,
}) {
  const [selectedList, setSelectedList] = useState({});
  const [isPullingDocType, setDocTypePullStatus] = useState(false);
  const { canSwitchToOldMode = true } = config;
  const handlerConfirmPullDocument = async () => {
    setDocTypePullStatus(true);
    try {
      await api.pullDocFromProd({
        docType: selectedList.value,
      });
      showToast({
        title: 'Document types has been pulled successfully!',
        success: true,
      });
      documentActions.allDocumentsTypeFetch({
        queryParams: {
          sort_by: 'created_date.desc',
        },
      });
      toggleUploadDocPopup(false);
      toggleDocPullFromProdModal();
    } catch (e) {
      showToast({
        title:
          e?.responsePayload?.message ||
          'Failed to pull document types from production.Please try again later!',
        error: true,
      });
    } finally {
      setDocTypePullStatus(false);

      //Add mixpanel
      mixpanel.track(MIXPANEL_EVENTS.pull_doc_type_complete, {
        'work email': user.email,
        'organization ID': user.orgId,
        version: 'new',
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

  useEffect(() => {
    const { documents = [] } = dynamicDocuments;
    if (documents.length && _.isEmpty(selectedList)) {
      setSelectedList(dynamicDocuments.documents[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dynamicDocuments]);

  return (
    <>
      {isShowPullDocProdModal && fetchSucceeded ? (
        <Modal
          show={true}
          className={styles.modal}
          onCloseHandler={toggleDocPullFromProdModal}
        >
          <div className={styles.modalHeader}>
            <h1 className={styles.heading}>Pull Documents</h1>
            <IconButton
              variant='text'
              size='small'
              icon={<Cancel />}
              className={styles.closeBtn}
              onClick={toggleDocPullFromProdModal}
            />
          </div>
          <div className={styles.modalBody}>
            <SelectDocumentBody
              documents={dynamicDocuments.documents}
              setSelectedList={setSelectedList}
              selectedList={selectedList}
            />
          </div>

          <ModalFooter
            cancel='Cancel'
            confirm='Pull'
            handleCloseModal={toggleDocPullFromProdModal}
            loading={isPullingDocType}
            handleConfirm={handlerConfirmPullDocument}
          />
        </Modal>
      ) : null}
    </>
  );
}

function mapStateToProp(state) {
  const { dynamicDocuments } = state.documents;
  const { fetchState, error } = state.documents?.dynamicDocuments || {};
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
