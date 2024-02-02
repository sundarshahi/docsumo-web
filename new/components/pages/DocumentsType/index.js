import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as classifyActions } from 'new/redux/classification/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import * as reduxHelpers from 'new/redux/helpers';
import { actions as servicesActions } from 'new/redux/services/actions';
import { actions as uploadActions } from 'new/redux/upload/actions';
import { actions as usersActions } from 'new/redux/users/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { addDays, format } from 'date-fns';
import { GitPullRequest, Plus } from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import {
  PageMetadata,
  PageScrollableContent,
} from 'new/components/layout/page';
import HubspotMeetingPopup from 'new/components/modals/hubspot';
import PullDocumentProModal from 'new/components/modals/PullDocumentProdModal';
import PushDocumentProdModal from 'new/components/modals/PushDocumentProdModal';
import { DataFetchFailurePageError } from 'new/components/shared/PageError';
import { ACCOUNT_TYPES } from 'new/constants';
import * as apiConstants from 'new/constants/api';
import * as documentConstants from 'new/constants/document';
import { MIXPANEL_ORIGINS } from 'new/constants/mixpanel';
import ROUTES from 'new/constants/routes';
import routes from 'new/constants/routes';
import { getMemberPermissions } from 'new/helpers/permissions';
import {
  chameleonIdentifyUser,
  isUserIdentifiedInChameleon,
} from 'new/thirdParty/chameleon';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button from 'new/ui-elements/Button/Button';
import * as utils from 'new/utils';
import addToHSQ from 'new/utils/addToHSQ';
import { generateDuplicateName } from 'new/utils/generateDuplicateName';

import { DocumentList } from './components/DocumentList';
import DocumentTypesEmptyState from './components/DocumentTypesEmptyState';
import EmptyDocTypeState from './components/EmptyDocTypeState';
import SkeletonLoader from './components/SkeletonLoader';

import styles from './index.scss';
class DocumentsType extends Component {
  state = {
    pageQueryParams: null,
    queryParamSortValues: null,
    document: [],
    isChecked: false,
    showContactSalesPopup: false,
    showApiServices: true,
  };

  constructor(props) {
    super(props);
  }

  toggleUploadDocPopup = (value) =>
    this.setState({ showUploadDocPopup: value });

  uploadDocConfirmation = (doc, type = '') => {
    if (type === 'upload' || type === 'duplicate' || type === 'edit') {
      const isDuplicate = type === 'duplicate' ? true : false;
      let selectedDocumentType = {};

      const documents = this.props.appConfig?.documentTypes;

      const selectedDocType = Array.isArray(documents)
        ? documents?.find((item) => item.id === doc.id)
        : doc;

      if (isDuplicate) {
        const duplicateTitle = generateDuplicateName(
          documents,
          selectedDocType
        );

        selectedDocumentType = {
          ...selectedDocType,
          type: 'duplicate',
          title: duplicateTitle,
          showUploadMethods: false,
          showDocumentTypeRenameField: true,
          label: {
            title: `Duplicate ${doc?.title}`,
            confirmModalTitle: 'Cancel upload',
            confirmModalBody:
              'This will cancel upload and the files you have queued will be lost. Are you sure you want to do this?',
            save: 'Duplicate',
          },
        };
      } else {
        selectedDocumentType = {
          ...selectedDocType,
          type: 'uploadOnly',
          showUploadMethods: true,
          showDocumentTypeRenameField: false,
          shouldUploadOnDrop: true,
          label: {
            title: 'Upload document',
            subTitle:
              type === 'edit' && 'Please upload documents before edit fields',
            confirmModalTitle: 'Cancel upload',
            confirmModalBody:
              'This will cancel upload and the files you have queued will be lost. Are you sure you want to do this?',
            save: 'Upload',
          },
        };
      }

      this.props.documentActions.displayCreateDocumentTypeModal(true);
      this.props.documentActions.selectDocumentType(selectedDocumentType);
    } else {
      this.props.documentActions.uploadDocumentTypeConfirmation({
        docType: doc,
        payload: type,
      });
    }
  };

  docSettingConfirmation = (docType, config, docId, title) => {
    this.props.documentActions.settingDocTypeConfirmation({
      docType,
      config,
      docId,
      title,
    });
  };
  startReview = (payload) => {
    this.props.documentActions.rtStartReview({
      queryParams: {
        ...this.state.pageQueryParams,
        status: [
          documentConstants.STATUSES.REVIEW_REQUIRED,
          documentConstants.STATUSES.REVIEWING,
        ],
        doc_type: payload.docType,
      },
      doc_type: payload.docType,
      origin: payload.origin,
      check: true,
      redirect: routes.ROOT,
    });
  };
  startClassify = (payload) => {
    this.props.classifyActions.startClassify({
      queryParams: {
        ...this.state.pageQueryParams,
        status: [
          documentConstants.STATUSES.REVIEW_REQUIRED,
          documentConstants.STATUSES.REVIEWING,
        ],
        doc_type: payload.docType,
      },
      doc_type: payload.docType,
      origin: payload.origin,
      check: true,
    });
  };

  startExcelView = (payload) => {
    this.props.documentActions.rtStartExcelView({
      queryParams: {
        ...this.state.pageQueryParams,
        excel_type: true,
        doc_type: payload.docType,
        status: [
          documentConstants.STATUSES.REVIEW_REQUIRED,
          documentConstants.STATUSES.REVIEWING,
        ],
      },
      doc_type: payload.docType,
      origin: payload.origin,
    });
  };

  handleActionClick = (action, document = {}) => {
    const { docType: doc_type, title, id: docId } = document;
    let { config } = this.state;
    const { appConfig, documentActions, uploadSampleDocType } = this.props;
    config = {
      ...appConfig,
      ...config,
    };

    /* eslint-disable indent */
    switch (action) {
      case 'view': {
        return this.props.documentActions.openPreview({
          doc_type,
        });
      }
      case 'analytics': {
        return this.props.documentActions.showAnalytics({
          docType: doc_type,
          config,
          docId,
          to: format(new Date(), 'yyyy-MM-dd'),
          from: format(addDays(new Date(), -7), 'yyyy-MM-dd'),
        });
      }
      case 'duplicate': {
        this.uploadDocConfirmation(document, 'duplicate');
        break;
      }
      case 'delete': {
        return this.props.documentActions.deleteDocAfterConfirmation({
          docId: docId,
          flag: 'doc_type',
        });
      }
      case 'upload': {
        reduxHelpers.closeCSVUploadOverlay();
        this.uploadDocConfirmation(document, 'upload');
        break;
      }
      case 'settings': {
        this.docSettingConfirmation(doc_type, config, docId, title);
        break;
      }
      case 'edit': {
        this.uploadDocConfirmation(document, 'edit');
        break;
      }
      case 'mail': {
        this.uploadDocConfirmation(doc_type, 'mail');
        break;
      }
      case 'review': {
        // Reset sample file upload data
        // This was set for showing onboarding tooltip for sample file
        if (!_.isEmpty(uploadSampleDocType)) {
          documentActions.setUploadSampleDocType({
            docType: {},
          });
        }
        const { pathname } = this.props.location;
        const pathRoute = {
          pathname: pathname,
          fromReview: false,
        };
        return this.startReview({
          docType: doc_type,
          origin: MIXPANEL_ORIGINS.reviewDocType.value,
        });
      }
      case 'excelView': {
        return this.startExcelView({
          docType: doc_type,
          origin: MIXPANEL_ORIGINS.reviewDocType.value,
        });
      }
      case 'classifyView': {
        return this.startClassify({
          docType: doc_type,
          origin: MIXPANEL_ORIGINS.reviewDocType.value,
        });
      }
      case 'editFields': {
        return this.props.documentActions.rtStartEditField({
          docType: doc_type,
          docTypeCard: true,
          slug: 'editField',
          docId,
          origin: MIXPANEL_ORIGINS.editFields.value,
        });
      }
      case 'push-to-production': {
        this.handleTogglePushDocProdModal(document);
      }
    }
    /* eslint-enable indent */
  };

  getConfig = async () => {
    try {
      const configResponse = await api.getDocTypeConfig();
      const { documentTypes = [] } = _.get(
        configResponse.responsePayload,
        'data'
      );
      await this.props.appActions.updateConfig({
        updates: {
          documentTypes,
        },
      });
    } catch (e) {
      window.location = routes.ROOT;
    }
  };

  handleNewDocumentClick = () => {
    const { appConfig, user } = this.props;
    const { canSwitchToOldMode = true } = appConfig;

    if (
      appConfig &&
      appConfig.accountType &&
      appConfig.accountType === ACCOUNT_TYPES.FREE
    ) {
      this.setState({ showContactSalesPopup: true });

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.contact_sales_start, {
        'work email': user.email,
        origin: 'Create New Document Type',
        version: 'new',
        mode: user.mode,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    } else {
      this.props.documentActions.createDocTypeData({
        queryParams: {},
      });
      //Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.create_new_doc_type, {
        'work email': user.email,
        'organization ID': user.orgId,
        version: 'new',
        mode: user.mode,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    }
  };

  addThirdPartyTracking = () => {
    const { user, appConfig } = this.props;

    chameleonIdentifyUser(user, appConfig);
  };

  componentDidMount() {
    const { appConfig, history, location, user } = this.props;

    const pageQueryParams = this.getValidPageQueryParams(
      _.get(this.props, 'location.search')
    );
    this.props.documentActions.fetchDocumentCounts();
    this.updateParamStateKeys({
      pageQueryParams,
    });

    // Check for changePassword Flag
    if (appConfig && appConfig.flags && appConfig.flags.changePassword) {
      history.push(ROUTES.UPDATE_PASSWORD, { isNewMember: true });
    }

    this.fetchDocuments(pageQueryParams);

    // Sending to hubspot
    addToHSQ(user, location);
    const permissions = getMemberPermissions() || {};
    this.setState({
      ...permissions,
    });
  }

  handleHighlightedDocTypeRemoval = () => {
    const { documentActions } = this.props;

    if (_.isEmpty(this.props.highlightedDocumentType)) {
      return;
    }

    const { id } = this.props.highlightedDocumentType;
    const highlightedDocType = document.getElementById(`docType_${id}`);

    if (!highlightedDocType) return;

    highlightedDocType.style.borderColor = '#c1c4ca';
    highlightedDocType.style.boxShadow = 'none';

    documentActions.setHighlightedDocumentType({
      docType: {},
    });
  };

  componentDidUpdate(prevProps) {
    if (
      !_.isEmpty(this.props.highlightedDocumentType) &&
      !_.isEqual(
        prevProps.highlightedDocumentType,
        this.props.highlightedDocumentType
      )
    ) {
      const { id } = this.props.highlightedDocumentType;
      const highlightedDocType = document.getElementById(`docType_${id}`);

      if (!highlightedDocType) return;

      highlightedDocType.style.borderColor = '#4d61fc';
      highlightedDocType.style.boxShadow = '0px 8px 16px 0px #00000014';
      highlightedDocType.scrollIntoView({
        behavior: 'smooth',
      });

      document.addEventListener(
        'click',
        () => {
          this.handleHighlightedDocTypeRemoval();
        },
        true
      );
    }

    const { user, appConfig } = this.props;

    if (
      !_.isEmpty(user) &&
      !_.isEmpty(appConfig) &&
      !isUserIdentifiedInChameleon()
    ) {
      chameleonIdentifyUser(user, appConfig);
    }
  }

  componentWillUnmount() {
    this.props.documentActions.allDocumentsTypeReset();
    document.removeEventListener('click', this.handleHighlightedDocTypeRemoval);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      documents: nextDocuments,
      location: nextLocation,
      disabledDocuments: nextDisabledDocuments,
      globalDocumentCounts: nextDocumentCount,
    } = nextProps;
    const {
      documents: prevDocuments,
      disabledDocuments: prevDisabledDocuments,
      history,
      location,
      globalDocumentCounts: currentDocumentCount,
    } = this.props;

    if (
      nextDocuments.length > prevDocuments.length &&
      prevDocuments.length > 0 &&
      prevDisabledDocuments.length === nextDisabledDocuments.length // Don't show upload popup is user is re-enabling doc type
    ) {
      const element = document.getElementById('documentListId') || {};
      element.scrollTop = element && element.scrollHeight;
    } else if (
      nextProps.errorMsg !== this.props.errorMsg &&
      nextProps.errorMsg
    ) {
      this.props.documentActions.showAlertModal({
        modalPayload: {
          modalTitle: 'Processing Document',
          bodyText: nextProps.errorMsg,
          cancelText: 'Cancel',
          actionText: 'Retry',
        },
      });
    }
    const currentPageQueryParams = this.getValidPageQueryParams(
      location.search
    );
    const nextPageQueryParams = this.getValidPageQueryParams(
      nextLocation.search
    );
    const paramsChanged = utils.haveParamsChanged(
      currentPageQueryParams,
      nextPageQueryParams
    );

    if (nextDocuments.length !== prevDocuments.length) {
      this.getConfig();
    }

    if (
      (nextLocation.state && nextLocation.state.forceReload) ||
      nextDocumentCount.all !== currentDocumentCount.all ||
      nextDocumentCount.review !== currentDocumentCount.review
    ) {
      history.replace(routes.ROOT);
      this.updateParamStateKeys({
        pageQueryParams: {},
      });
      this.fetchDocuments({});
      return;
    }

    if (paramsChanged) {
      this.updateParamStateKeys({
        pageQueryParams: nextPageQueryParams,
      });
      this.fetchDocuments(nextPageQueryParams);
    }
  }

  updateParamStateKeys = ({ pageQueryParams, queryParamSortValues } = {}) => {
    if (!pageQueryParams) {
      pageQueryParams = this.getValidPageQueryParams(
        this.props.location.search
      );
    }

    if (!queryParamSortValues) {
      queryParamSortValues =
        utils.getQueryParamSortValuesAsObject(pageQueryParams);
    }

    this.setState({
      pageQueryParams,
      queryParamSortValues,
    });

    return {
      pageQueryParams,
      queryParamSortValues,
    };
  };

  getValidPageQueryParams = _.memoize((locationSearch) => {
    return utils.getValidPageQueryParams(locationSearch, {
      offset: {
        type: 'number',
        default: 0,
      },
      sort_by: {
        multiple: true,
        default: ['created_date.desc'],
      },
    });
  });

  fetchDocuments = (pageQueryParams) => {
    this.props.documentActions.allDocumentsTypeFetch({
      queryParams: {
        offset: pageQueryParams.offset,
        sort_by: pageQueryParams.sort_by,
      },
    });
  };

  handleContactSalesPopupClose = () => {
    this.setState({ showContactSalesPopup: false });
  };

  handleAddDocumentType = () => {
    const { user, appConfig } = this.props;
    const { canSwitchToOldMode = true } = appConfig;
    const { documentActions, uploadActions } = this.props;
    mixpanel.track(MIXPANEL_EVENTS.add_doc_type, {
      'work email': user.email,
      'organization ID': user.orgId,
      version: 'new',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
      origin: 'Document Type - header',
    });
    uploadActions.fileUploadOrigin({
      origin: MIXPANEL_EVENTS.doc_upload_success_add_btn,
    });
    documentActions.displaySelectDocumentTypeModal(true);
  };

  // Called in test mode only for prod document types
  toggleDocPullFromProdModal = () => {
    const { user, appConfig } = this.props;
    const { canSwitchToOldMode = true } = appConfig;

    if (!this.state.isShowPullDocProdModal) {
      this.props.documentActions.fetchDynamicDocumentTypes({
        queryParams: {
          mode: 'prod',
        },
      });
    }
    this.setState({
      isShowPullDocProdModal: !this.state.isShowPullDocProdModal,
    });
    //Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.pull_doc_type_click, {
      'work email': user.email,
      'organization ID': user.orgId,
      version: 'new',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  handlePullDocumentProModal = () => {
    const { isShowPullDocProdModal } = this.state;
    return (
      <PullDocumentProModal
        isShowPullDocProdModal={isShowPullDocProdModal}
        toggleDocPullFromProdModal={this.toggleDocPullFromProdModal}
        toggleUploadDocPopup={this.toggleUploadDocPopup}
      />
    );
  };

  handleTogglePushDocProdModal = (document) => {
    this.setState({
      isShowPushDocProdModal: !this.state.isShowPushDocProdModal,
      document,
    });
  };

  enableDocumentType = (docType) => {
    const { documentActions } = this.props;

    documentActions.updateDocumentTypeStatus({
      serviceId: docType.id,
      status: !docType.canUpload,
      uploadSample: false,
      refresh: true,
    });
  };

  renderDocumentList = () => {
    const {
      documents,
      disabledDocuments = [],
      user: currentUser,
      history = {},
      isTestMode,
      uploadSampleDocType,
      isModalOpen,
      user,
      appConfig,
    } = this.props;

    if (currentUser) {
      if (
        (!currentUser.authorizedDocTypes ||
          !currentUser.authorizedDocTypes.length) &&
        currentUser.role !== 'admin' &&
        currentUser.role !== 'owner'
      ) {
        return <DocumentTypesEmptyState />;
      } else {
        let updatedDocumentsList = documents;
        let updatedDisabledDocumentList = disabledDocuments;
        if (currentUser.role !== 'admin' && currentUser.role !== 'owner') {
          const authorizedDocTypesValues = currentUser.authorizedDocTypes;
          updatedDocumentsList = documents.filter((item) =>
            authorizedDocTypesValues.includes(item.docType)
          );
          updatedDisabledDocumentList = disabledDocuments.filter((item) =>
            authorizedDocTypesValues.includes(item.docType)
          );
        }

        return (
          <>
            {updatedDocumentsList?.length ||
            updatedDisabledDocumentList?.length ? (
              <>
                <div className={styles.section}>
                  <DocumentList
                    documents={updatedDocumentsList}
                    onNewDocumentClick={this.handleNewDocumentClick}
                    onActionClick={this.handleActionClick}
                    getConfig={this.getConfig}
                    history={history}
                    isTestMode={isTestMode}
                    toggleDocPullFromProdModal={this.toggleDocPullFromProdModal}
                    uploadSampleDocType={uploadSampleDocType}
                    isModalOpen={isModalOpen}
                  />
                </div>
                {!_.isEmpty(updatedDisabledDocumentList) && (
                  <div className={styles.sectionWrapper}>
                    <div className={styles.header}>
                      <h1 className={styles.heading}>Disabled</h1>
                    </div>
                    <div className={styles.section}>
                      <DocumentList
                        documents={updatedDisabledDocumentList}
                        history={history}
                        isTestMode={isTestMode}
                        isDisabled={true}
                        enableDocumentType={this.enableDocumentType}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyDocTypeState
                isTestMode={isTestMode}
                documentActions={documentActions}
                user={user}
                appConfig={appConfig}
              />
            )}
          </>
        );
      }
    }

    return null;
  };

  render() {
    const {
      isFetchingDocuments,
      fetchFailed,
      documents,
      user,
      isTestMode,
      appConfig,
      disabledDocuments = [],
      documentActions,
    } = this.props;
    const {
      showContactSalesPopup,
      isShowPullDocProdModal,
      isShowPushDocProdModal,
      showApiServices,
      document,
    } = this.state;
    const hasDocuments = !_.isEmpty(documents);
    const showFetchError = !isFetchingDocuments && fetchFailed;
    const showSkeletonView =
      isFetchingDocuments && !hasDocuments && !showFetchError;
    const showDocumentList = !showSkeletonView && !showFetchError;

    let isNotEmpty = documents?.length || disabledDocuments?.length;

    const handleFetchAllDocTypes = () => {
      documentActions.allDocumentsTypeFetch();
    };

    return (
      <>
        <PageMetadata title='Document Types' />
        <div className={styles.header}>
          <h1 className={styles.heading}>Document Types</h1>
          <div className={styles.header_right}>
            {documents?.length ? (
              <div>
                {isTestMode ? (
                  <Button
                    variant='outlined'
                    icon={<GitPullRequest />}
                    className='mr-4'
                    size='small'
                    onClick={this.toggleDocPullFromProdModal}
                  >
                    Pull document type
                  </Button>
                ) : null}
              </div>
            ) : null}
            {showApiServices && isNotEmpty ? (
              <Button
                variant='outlined'
                icon={<Plus />}
                size='small'
                onClick={this.handleAddDocumentType}
              >
                Add Document Type
              </Button>
            ) : null}
          </div>
        </div>
        <PageScrollableContent
          className={cx(styles.container)}
          id='documentsTypeScrollContainer'
        >
          <div>
            {showSkeletonView ? <SkeletonLoader className='flex-none' /> : null}
            {showFetchError ? (
              <DataFetchFailurePageError className='mt-12' />
            ) : null}
            {showDocumentList ? this.renderDocumentList() : null}
          </div>
        </PageScrollableContent>
        <HubspotMeetingPopup
          user={user}
          isOpen={showContactSalesPopup}
          handleClose={this.handleContactSalesPopupClose}
        />
        <PullDocumentProModal
          isShowPullDocProdModal={isShowPullDocProdModal}
          toggleDocPullFromProdModal={this.toggleDocPullFromProdModal}
          toggleUploadDocPopup={this.toggleUploadDocPopup}
        />
        <PushDocumentProdModal
          user={user}
          isTestMode={isTestMode}
          isShowPushDocProdModal={isShowPushDocProdModal}
          handleTogglePushDocProdModal={this.handleTogglePushDocProdModal}
          document={document}
          appConfig={appConfig}
          fetchAllDocTypes={handleFetchAllDocTypes}
        />
      </>
    );
  }
}

function mapStateToProp(state) {
  const {
    documentsById,
    globalDocumentCounts,
    uploadConfirmationDocType,
    showDoctypeSelectionModal,
    showCreateDocumentTypeModal,
    showAutoClassifyPopUpModal,
    downloadConfirmationType,
  } = state.documents;
  const {
    usersPage: { users },
  } = state.users;

  const { config: appConfig, user } = state.app;

  const isModalOpen =
    uploadConfirmationDocType ||
    showDoctypeSelectionModal ||
    showCreateDocumentTypeModal ||
    showAutoClassifyPopUpModal ||
    !_.isEmpty(downloadConfirmationType);

  const {
    fetchState,
    error,
    documentIds,
    highlightedDocumentType,
    disabledDocTypes = [],
    uploadSampleDocType = {},
  } = state.documents.allDocumentsTypePage;

  const documents =
    documentIds &&
    documentIds.map((documentId) => {
      return documentsById[documentId];
    });

  const errorMsg = error || null;

  const isFetchingDocuments = fetchState === apiConstants.FETCH_STATES.FETCHING;
  const fetchSucceeded = fetchState === apiConstants.FETCH_STATES.SUCCESS;
  const fetchFailed = fetchState === apiConstants.FETCH_STATES.FAILURE;

  const isTestMode = !!(user?.mode !== 'prod');

  return {
    documents,
    disabledDocuments: disabledDocTypes,
    fetchState,
    isFetchingDocuments,
    fetchSucceeded,
    fetchFailed,
    globalDocumentCounts,
    errorMsg,
    appConfig,
    users,
    user,
    isTestMode,
    uploadSampleDocType,
    highlightedDocumentType,
    isModalOpen,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
    usersActions: bindActionCreators(usersActions, dispatch),
    classifyActions: bindActionCreators(classifyActions, dispatch),
    servicesActions: bindActionCreators(servicesActions, dispatch),
    uploadActions: bindActionCreators(uploadActions, dispatch),
  };
}
export default connect(mapStateToProp, mapDispatchToProps)(DocumentsType);
