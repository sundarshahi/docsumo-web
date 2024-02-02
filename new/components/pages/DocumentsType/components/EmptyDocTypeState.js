import React, { useState } from 'react';
import { connect } from 'react-redux';
import { actions as documentActions } from 'new/redux/documents/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { GitPullRequest, Plus } from 'iconoir-react';
import mixpanel from 'mixpanel-browser';
import { ReactComponent as DocumentTypeEmptyState } from 'new/assets/images/DocumentTypeEmptyState.svg';
import PullDocumentProdModal from 'new/components/modals/PullDocumentProdModal';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button from 'new/ui-elements/Button/Button';

import styles from './EmptyDocTypeState.scss';

function EmptyDocTypeState({
  isTestMode = false,
  documentActions,
  user,
  appConfig,
}) {
  const [isShowPullDocProdModal, setIsShowPullDocProdModal] = useState();
  const [showUploadDocPopup, setShowUploadDocPopup] = useState();

  const { canSwitchToOldMode = true } = appConfig;

  const handleAddNewDocumentType = () => {
    documentActions.displaySelectDocumentTypeModal(true);

    //Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.add_doc_type, {
      'work email': user.email,
      'organization ID': user.orgId,
      version: 'new',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
      origin: 'Document Type - empty state',
    });
  };

  const toggleDocPullFromProdModal = () => {
    if (!isShowPullDocProdModal) {
      documentActions.fetchDynamicDocumentTypes({
        queryParams: {
          mode: 'prod',
        },
      });

      //Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.pull_doc_type_click, {
        'work email': user.email,
        'organization ID': user.orgId,
        version: 'new',
        mode: user.mode,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    }
    setIsShowPullDocProdModal(!isShowPullDocProdModal);
  };

  const toggleUploadDocPopup = (value) => setShowUploadDocPopup(value);

  return (
    <>
      <div className={styles.emptyContainer}>
        <div className={styles.content}>
          <DocumentTypeEmptyState />

          <p className={styles.content__title_extract}>
            Extract data from any document type
          </p>
          <p className={styles.title_docs}>
            Choose from the{' '}
            <span className={styles.title_docs__doctitle}>
              50+ ready-to-use
            </span>{' '}
            document types to get started.
          </p>
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
          <div className={styles.buttonContainer}>
            <Button
              className={styles.buttonContainer__addbutton}
              onClick={() => handleAddNewDocumentType()}
            >
              <Plus className={styles.plusIcon} />
              <p className={styles.title}>Add document type</p>
            </Button>
            {isTestMode ? (
              <Button
                variant='outlined'
                className={cx('ml-4', styles.buttonContainer__pullbutton)}
                onClick={toggleDocPullFromProdModal}
              >
                <GitPullRequest className={styles.plusIcon} />
                <p className={styles.title}>Pull document type</p>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      <PullDocumentProdModal
        isShowPullDocProdModal={isShowPullDocProdModal}
        toggleDocPullFromProdModal={toggleDocPullFromProdModal}
        toggleUploadDocPopup={toggleUploadDocPopup}
      />
    </>
  );
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(EmptyDocTypeState);
