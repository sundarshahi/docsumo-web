/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { showToast } from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import DocumentProcessModal from 'new/components/shared/DocumentProcessModal';
import KeyboardShortcuts from 'new/components/shared/KeyboardShortcuts/KeyboardShortcuts';
import SpreadSheet from 'new/components/shared/Spreadsheet';
import SplitPDFDocument from 'new/components/shared/Spreadsheet/components/SplitPDFDocument/SplitPDFDocument';
import * as documentConstants from 'new/constants/document';
import routes from 'new/constants/routes';
import {
  CHAMELEON_TOUR_TYPES,
  chameleonIdentifyUser,
  chameleonTriggerTour,
  CHAMLEON_TOUR_IDS,
} from 'new/thirdParty/chameleon';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';

import SpreadsheetSkeleton from './components/Skeleton/SpreadsheetSkeleton';

import styles from './index.scss';

class SpreadsheetOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      download: false,
      closeOverlay: false,
      progressValue: 0,
      skippedDocs: [],
      lookupData: [],
    };
  }

  addMixpanelTrackingForTours = (mixpanelEvent) => {
    const {
      docMeta,
      user,
      config: { canSwitchToOldMode = true },
    } = this.props;

    const { fileUrl } = this.state;

    mixpanel.track(mixpanelEvent, {
      docId: docMeta.docId,
      label: docMeta.title,
      'document type': docMeta.type,
      'work email': user.email,
      version: 'new',
      type: _.isEmpty(fileUrl) ? 'excel' : 'pdf',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  async componentDidMount() {
    const { documentIds, location, match, documentsById, user, config } =
      this.props;

    let startDocId = _.get(location, 'state.startDocId');
    const docType = _.get(location, 'state.docType');
    startDocId =
      startDocId || _.get(match, 'params.docId') || _.keys(documentsById)[0];
    const origin = _.get(location, 'state.origin');

    if (!startDocId && (!documentIds || _.isEmpty(documentIds))) {
      return this.closeSpreadsheetScreen();
    }

    await this.setState({
      docType,
    });

    if (
      !startDocId ||
      (!_.isEmpty(documentIds) && !documentIds.includes(startDocId))
    ) {
      startDocId = documentIds[0];
    }

    //calling API only for review screen to get all documents
    // only call API if it's not have ids
    if (_.isEmpty(documentIds) && startDocId) {
      await this.props.documentActions.rtStartSingleExcelview({
        docId: startDocId,
        doc_type: docType,
        origin,
      });
    }

    if (!_.isEmpty(documentIds)) {
      await this.reviewGoToDocument({
        docId: startDocId,
        doc_type: docType,
        origin,
      });
    }

    const parsedUrl = new URL(window.location.href);
    if (sessionStorage.getItem('tempToken')) {
      this.setState({
        embedApp: true,
      });
    }

    // Identify user in Chameleon
    chameleonIdentifyUser(user, config);

    // Trigger spreadsheet review screen tour
    chameleonTriggerTour(
      CHAMLEON_TOUR_IDS.spreadsheetReviewPhase1,
      CHAMELEON_TOUR_TYPES.spreadsheetReviewPhase1,
      () =>
        this.addMixpanelTrackingForTours(
          MIXPANEL_EVENTS.spreadsheet_review_phase_1
        )
    );
  }

  handleFetchRetryBtnClick = () => {
    this.props.documentActions.rtGetExcelDocumentData({
      docId: this.props.docId,
    });
  };
  setAlertBoxText = (docId) => {
    let { progressValue } = this.state;
    let secondsToGo = 15;
    const interval = setInterval(() => {
      if (
        this.props.documentsById[docId] &&
        this.props.documentsById[docId].status ===
          documentConstants.STATUSES.NEW
      ) {
        if (secondsToGo) {
          progressValue += 2;
          secondsToGo -= 1;
        } else {
          progressValue = 70;
        }
        this.setState({
          progressValue,
        });
      } else {
        clearInterval(interval);
        this.setState({
          showAlertModal: false,
          progressValue: 100,
        });
        this.props.documentActions.rtStartSingleExcelview({
          docId,
        });
        this.reviewGoToDocument({ docId });
      }
    }, 1000);
  };

  reviewGoToDocument = async (params, navType = '') => {
    const { skippedDocs } = this.state;
    const document = this.props.documents.find(
      (e) => !e.docId || e.docId === params.docId
    );
    if (
      (document && document.status === documentConstants.STATUSES.NEW) ||
      (document && document.status === documentConstants.STATUSES.PROCESSING)
    ) {
      this.setState(
        {
          showAlertModal: true,
        },
        () => {
          if (this.state.showAlertModal) {
            sessionStorage.clear();
          }
        }
      );
    } else if (
      (document && document.status === documentConstants.STATUSES.ERRED) ||
      (document && document.status === documentConstants.STATUSES.DELETED)
    ) {
      const skippedDocsList = [...skippedDocs, document.title];
      this.setState({ skippedDocs: skippedDocsList });
      const toastMessage = (
        <span>
          The document <strong>{skippedDocsList.join(', ')}</strong> was skipped
          due to Erred status. Go to <Link to={routes.ALL}>My Documents</Link>{' '}
          to view all documents.
        </span>
      );
      showToast({
        title: toastMessage,
        duration: 4000,
        position: 'right',
        error: true,
      });
      this.goToNextDocument(
        {
          closeIfNotFound: true,
        },
        params.docId,
        navType
      );
    } else {
      this.setState({ skippedDocs: [] });
      await this.props.documentActions.rtGoToExcelDocument(params);
    }
  };

  fetchLookupData = async () => {
    const { type = '' } = this.props.docMeta;

    const response = (await api.getLookupData({ type })) || {};
    const { data = [] } = response.responsePayload;

    this.setState({ lookupData: { coa_classification: data } });
  };

  async componentDidUpdate(prevProps) {
    const {
      //docId,
      docMeta,
      documentIds,
      match,
    } = this.props;

    const {
      //docId: prevDocId,
      docMeta: prevDocMeta,
      documentIds: prevDocumentsId,
    } = prevProps;

    const startDocId = _.get(match, 'params.docId');

    if (startDocId && prevDocumentsId !== documentIds) {
      this.reviewGoToDocument({
        docId: startDocId,
      });
    }

    if (prevDocMeta !== docMeta) {
      this.fetchLookupData();
    }

    //Check if document has been deleted
    // if (docMeta && docMeta.deleted) {
    //     if (docId === prevDocId && !prevDocMeta.deleted) {
    //         setTimeout(() => {
    //             this.goToNextDocument({
    //                 closeIfNotFound: true,
    //             });
    //         }, 30);

    //         this.props.documentActions.rtRemoveSpreadsheetFromStack({
    //             docId,
    //         });

    //     }
    // }
  }

  closeSpreadsheetScreen = () => {
    const { location = {} } = this.props;
    // const { documentActions } = this.props;
    // documentActions.handleSpreadsheetView({ openSpreadsheetView : false });
    const { originLocation } = this.props;
    let path = routes.ROOT;
    if (originLocation) {
      if (originLocation.search) {
        path = originLocation.pathname + originLocation.search;
      } else if (location.pathname !== originLocation.pathname) {
        path = originLocation.pathname;
      }
    }
    this.props.history.push(path);
  };
  getNextDocId = (docId, navType = '') => {
    const { documentIds } = this.props;

    if (!docId || !documentIds) {
      return null;
    }

    const totalDocCount = documentIds.length;
    const currentDocIndex = documentIds.indexOf(docId);

    if (currentDocIndex >= 0 && currentDocIndex < totalDocCount - 1) {
      if (navType && navType === 'prev') {
        return documentIds[currentDocIndex - 1];
      } else {
        return documentIds[currentDocIndex + 1];
      }
    }

    return null;
  };
  closeReviewTool = () => {
    this.props.history.push(routes.ALL);
  };

  handleSpreadsheetNavigateBtnClick = async (docId, navType = '') => {
    this.props.appActions.showLoaderOverlay();
    this.props.history.push(`${routes.DOCUMENT_SPREADSHEET}/${docId}`);
    this.reviewGoToDocument(
      {
        docId,
      },
      navType
    );
    this.props.appActions.hideLoaderOverlay();
  };

  goToNextDocument = (
    { closeIfNotFound = false } = {},
    skippedDocId = '',
    navType = ''
  ) => {
    const { docId } = this.props;
    const id = skippedDocId || docId;
    const nextDocId = this.getNextDocId(id, navType);
    if (nextDocId) {
      this.reviewGoToDocument(
        {
          docId: nextDocId,
        },
        navType
      );
    } else {
      if (closeIfNotFound) {
        this.closeReviewTool();
      }
    }
  };

  render() {
    const {
      docMeta,
      docId,
      excelData,
      isFetchingData,
      documentActions,
      appActions,
      dataFetchFailed,
      config,
      summaryData,
      documentIds,
      user,
      toast,
    } = this.props;
    const { showAlertModal, progressValue, lookupData, embedApp } = this.state;

    return (
      <div className={styles.root}>
        {isFetchingData ? (
          <SpreadsheetSkeleton />
        ) : (
          <div className={styles.container}>
            <SpreadSheet
              className={styles.spreadsheet}
              closeButtonClick={this.closeSpreadsheetScreen}
              documentTitle={docMeta && docMeta.title}
              docMeta={docMeta}
              docId={docId}
              excelData={excelData}
              documentActions={documentActions}
              appActions={appActions}
              goToNextDocument={this.goToNextDocument}
              config={config}
              summaryData={summaryData}
              documentIds={documentIds}
              history={this.props.history}
              userEmail={user.email}
              toast={toast}
              lookupData={lookupData}
              user={user}
              dataFetchFailed={dataFetchFailed}
              SpreadsheetNavigateBtnClick={
                this.handleSpreadsheetNavigateBtnClick
              }
              addMixpanelTrackingForTours={this.addMixpanelTrackingForTours}
            />

            <DocumentProcessModal
              title={'Spreadsheet Document'}
              progressValue={progressValue}
              closeReviewTool={this.closeReviewTool}
              onCloseBtnClick={null}
              user={user}
              docMeta={docMeta}
              showModal={showAlertModal}
            />

            <SplitPDFDocument
              spreadsheetNavigateBtnClick={
                this.handleSpreadsheetNavigateBtnClick
              }
            />
            <KeyboardShortcuts
              type='spreadsheet'
              isClientTool={this.state.embedApp}
            />
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProp(state) {
  const {
    originLocation,
    fetchingDataForDocId,
    startingReviewForDocId,
    finishingReviewForDocId,
    skippingReviewForDocId,
    fetchDataFailedForDocId,
    docTypeId,
    documentsById,
    documentIds,
    docId,
    forceFinishingReviewForDocId,
    excelData,
    summaryData,
  } = state.documents.excelTool;

  const { documentsById: docDocumentsById } = state.documents;
  const { config, user, toast } = state.app;

  const isFetchingData = fetchingDataForDocId === docId;
  const isStartingReview = startingReviewForDocId === docId;
  const isFinishingReview = finishingReviewForDocId === docId;
  const isSkippingReview = skippingReviewForDocId === docId;
  const dataFetchFailed = fetchDataFailedForDocId === docId;
  const stateActionInProgress =
    isStartingReview || isFinishingReview || isSkippingReview || false;
  const isForceFinishingReview = forceFinishingReviewForDocId === docId;

  const documents = documentIds.map((documentId) => {
    return documentsById[documentId];
  });
  const docMeta = documentsById[docId] || null;
  let docReadOnly;
  let docSkipped;
  if (docMeta && docMeta.status) {
    docReadOnly = ![documentConstants.STATUSES.REVIEWING].includes(
      docMeta.status
    );
  }
  if (docMeta && docMeta.status) {
    docSkipped = [documentConstants.STATUSES.REVIEW_SKIPPED].includes(
      docMeta.status
    );
  }

  return {
    originLocation,

    isFetchingData,
    isStartingReview,
    isFinishingReview,
    isSkippingReview,
    isForceFinishingReview,

    dataFetchFailed,
    stateActionInProgress,
    docTypeId,
    documentIds,
    documentsById,
    documents,
    docDocumentsById,

    docId,
    docMeta,
    docReadOnly,
    docSkipped,
    excelData,
    summaryData,
    config,
    user,
    toast,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(SpreadsheetOverlay)
);
