/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as classifyActions } from 'new/redux/classification/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { storeFolderId } from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import MyDocumentsList from 'new/components/shared/MyDocumentsList/MyDocumentsList';
import { DataFetchFailurePageError } from 'new/components/shared/PageError';
import * as apiConstants from 'new/constants/api';
import * as documentConstants from 'new/constants/document';
import * as fileConstants from 'new/constants/file';
import { MIXPANEL_ORIGINS } from 'new/constants/mixpanel';
import routes from 'new/constants/routes';
import * as documentsHelper from 'new/helpers/documents';
import * as uploadHelper from 'new/helpers/upload';
import { chameleonIdentifyUser } from 'new/thirdParty/chameleon';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import * as utils from 'new/utils';
import addToHSQ from 'new/utils/addToHSQ';
import queryString from 'query-string';
import Dropzone from 'react-dropzone';

import ZeroCaseV2 from './ZeroCaseV2';

import styles from './index.scss';

class AllDocumentsPage extends Component {
  state = {
    pageQueryParams: null,
    queryParamSortValues: null,
  };

  constructor(props) {
    super(props);
    this.dropzoneRef = React.createRef();
    this.inputRef = React.createRef();
    document.toolTipRef = React.createRef();
  }

  addMixpanelTracker = () => {
    const {
      location: { search },
      user,
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config;

    if (!search) return;

    const urlParams = new URLSearchParams(search);

    if (
      urlParams.get('utm_medium') &&
      urlParams.get('utm_medium').toLowerCase() === 'email'
    ) {
      mixpanel.track(MIXPANEL_EVENTS.login_email, {
        'work email': user.email,
        'account region': user.region,
        version: 'new',
        canSwitchUIVersion: canSwitchToOldMode,
      });
    }

    return;
  };

  componentDidMount() {
    const pageQueryParams = this.getValidPageQueryParams(
      _.get(this.props, 'location.search')
    );
    this.addMixpanelTracker();

    this.updateParamStateKeys({
      pageQueryParams,
    });
    this.fetchDocuments(pageQueryParams);

    const { user, location, config } = this.props;

    chameleonIdentifyUser(user, config);
    addToHSQ(user, location);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const nextLocation = nextProps.location;
    const { location, history, meta } = this.props;
    const { queryParamSortValues } = this.state;

    if (!meta || _.isEmpty(meta)) {
      return;
    }

    const currentPageQueryParams = this.getValidPageQueryParams(
      location.search
    );
    const { folder_id } = utils.getValidPageQueryParams(location.search, {
      folder_id: {
        type: 'string',
        default: '',
      },
    });

    const nextPageQueryParams = this.getValidPageQueryParams(
      nextLocation.search
    );
    const paramsChanged = utils.haveParamsChanged(
      currentPageQueryParams,
      nextPageQueryParams
    );

    if (nextLocation.state && nextLocation.state.forceReload) {
      (async () => {
        await history.replace(`${routes.ALL}${nextLocation.search}`);
        this.updateParamStateKeys({
          pageQueryParams: nextPageQueryParams,
          queryParamSortValues,
        });
        this.fetchDocuments({ folder_id, ...currentPageQueryParams });
      })();
      return;
    }

    if (paramsChanged) {
      this.fetchDocuments(nextPageQueryParams);
      this.updateParamStateKeys({
        pageQueryParams: nextPageQueryParams,
        currentQueryParamSortValues: queryParamSortValues,
      });
    }
  }

  componentWillUnmount() {
    this.props.documentActions.allDocumentsReset();
  }

  updateParamStateKeys = ({
    pageQueryParams,
    queryParamSortValues,
    currentQueryParamSortValues,
  } = {}) => {
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
      queryParamSortValues: {
        ...currentQueryParamSortValues,
        ...queryParamSortValues,
      },
    });
  };

  getValidPageQueryParams = _.memoize((locationSearch) => {
    this.dateFilterRanges = documentsHelper.generateDateFilterRanges();
    const defaultDateRange = this.dateFilterRanges[0];
    return utils.getValidPageQueryParams(locationSearch, {
      offset: {
        type: 'number',
        default: 0,
      },
      sort_by: {
        multiple: true,
        default: ['created_date.desc', 'modified_date.desc'],
      },
      q: {
        type: 'string',
        default: '',
      },
      created_date: {
        multiple: true,
        default: defaultDateRange.queryParamValue,
      },
      modified_date: {
        multiple: true,
        default: defaultDateRange.queryParamValue,
      },
      doc_type: {
        multiple: true,
        default: [],
      },
      status: {
        multiple: true,
        default: [],
      },
      user_id: {
        multiple: true,
        default: [],
      },
      folder_id: {
        type: 'string',
        default: '',
      },
      temp_token: {
        type: 'boolean',
        default: '',
      },
    });
  });

  fetchDocuments = (pageQueryParams) => {
    let searchQuery = utils.getValidPageQueryParams(
      _.get(this.props, 'history.location.search'),
      {
        q: {
          type: 'string',
          default: '',
        },
      }
    );
    const { q = '' } = searchQuery;
    let queryParams = {
      q,
      ...pageQueryParams,
      view: 'folder',
    };
    this.props.documentActions.allDocumentsFetch({
      queryParams,
    });
  };

  startReview = ({ docId = null } = {}) => {
    const { documents, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const doc = documents.find((i) => i.docId === docId);

    // Add mixpanel Event
    mixpanel.track(MIXPANEL_EVENTS.view_document, {
      origin: 'My Documents',
      'work email': user.email,
      'doc type': doc.type,
      label: doc.title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    this.props.documentActions.rtStartReview({
      queryParams: {
        ...this.state.pageQueryParams,
      },
      docId,
      doc_type: doc.type,
      origin: 'My Documents',
      redirect: routes.ALL,
    });
  };

  startClassify = ({ docId = null } = {}) => {
    const { documents, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;
    const doc = documents.find((i) => i.docId === docId);

    // Add mixpanel Event
    mixpanel.track(MIXPANEL_EVENTS.view_document, {
      origin: 'My Documents',
      'work email': user.email,
      'doc type': doc.type,
      label: doc.title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    this.props.classifyActions.startClassify({
      queryParams: {
        ...this.state.pageQueryParams,
        status: [
          documentConstants.STATUSES.REVIEW_REQUIRED,
          documentConstants.STATUSES.REVIEWING,
        ],
        doc_type: doc.type,
      },
      docId,
      doc_type: doc.type,
      origin: 'Review - My Documents',
    });
  };

  startExcelView = ({ docId = null } = {}) => {
    this.props.documentActions.rtStartExcelView({
      queryParams: {
        ...this.state.pageQueryParams,
        excel_type: true,
      },
      docId,
      origin: 'Review - My Documents',
    });

    const { documents, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const doc = documents.find((i) => i.docId === docId);

    // Add mixpanel Event
    mixpanel.track(MIXPANEL_EVENTS.view_document, {
      origin: 'My Documents',
      'work email': user.email,
      'doc type': doc.type,
      label: doc.title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  handlePageNavigation = (page) => {
    const { history, match, location, meta } = this.props;

    const offset = meta.limit * (page - 1);
    const params = {
      ...queryString.parse(location.search),
      offset: offset,
    };

    history.push(`${match.url}?${queryString.stringify(params)}`);
  };

  handleDropAccepted = (files) => {
    this.documentType &&
      uploadHelper.handleFileDrop({
        files: files,
        dropAccepted: true,
        documentType: this.documentType,
      });
  };

  handleDropRejected = (files) => {
    this.documentType &&
      uploadHelper.handleFileDrop({
        files: files,
        dropAccepted: false,
        documentType: this.documentType,
      });
  };

  handleFileDialogCancel = () => {
    // this.props.onNewDropdownOutsideClick();
  };

  handleUploadFileBtnClick = (documentType) => {
    const {
      user,
      history: {
        location: { pathname },
      },
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config;

    // Add mixpanel event
    const originType =
      Object.values(MIXPANEL_ORIGINS).find((i) => i.path === pathname)?.value ||
      '';
    mixpanel.track(MIXPANEL_EVENTS.upload_document_type, {
      'work email': user.email,
      'document type': documentType || '',
      origin: originType ? originType : '',
      location: 'Navigation - New button',
      version: 'new',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
    });

    const selectedDocumentType = {
      ...documentType,
      showUploadMethods: true,
      shouldUploadOnDrop: true,
      label: {
        title: 'Upload document',
        confirmModalTitle: 'Cancel upload?',
        confirmModalBody:
          'This will cancel upload, are you sure you want to do this?',
        save: 'Upload',
      },
    };

    this.props.documentActions.displayCreateDocumentTypeModal(true);
    this.props.documentActions.selectDocumentType(selectedDocumentType);
  };

  handleUploadFolderBtnClick = (documentType) => {
    this.documentType = documentType;
    this.inputRef && this.inputRef.current.click();
  };

  downloadDocConfirmation = (docId) => {
    this.props.documentActions.downloadDocConfirmation({
      docId,
    });
  };

  handleDocumentActionClick = (action, docId) => {
    const { currentEditId, history } = this.props;

    if (currentEditId) return;

    /* eslint-disable indent */
    switch (action) {
      case 'view': {
        return this.props.documentActions.openPreview({
          docId,
        });
      }

      case 'review': {
        const { pathname, search } = this.props.location;
        const pathNameURL = search ? pathname + search : pathname;
        const pathRoute = {
          pathname: pathNameURL,
          fromReview: false,
        };
        return this.startReview({
          docId,
        });
      }

      case 'classifyView': {
        return this.startClassify({
          docId,
        });
      }

      case 'excelView': {
        const { pathname, search } = this.props.location;
        const pathNameURL = search ? pathname + search : pathname;
        const pathRoute = {
          pathname: pathNameURL,
        };
        return this.startExcelView({
          docId,
        });
      }

      case 'delete': {
        return this.props.documentActions.deleteDocAfterConfirmation({
          docId,
        });
      }

      case 'download': {
        return this.props.documentActions.downloadDocConfirmation({
          docId,
        });
      }

      case 'folderView': {
        (async () => {
          await this.props.documentActions.storeClickedFolderInfo({
            selectedFolderId: docId,
          });
          const params = {
            ...queryString.parse(history.location.search),
            folder_id: docId,
          };
          history.push(`${routes.ALL}?${queryString.stringify(params)}`);
        })();
      }
    }
    /* eslint-enable indent */
  };

  renderZeroCase = () => {
    const { user } = this.props;
    return (
      <div className={styles.zeroCaseContainer}>
        <ZeroCaseV2
          onUploadFileBtnClick={this.handleUploadFileBtnClick}
          onUploadFolderBtnClick={this.handleUploadFolderBtnClick}
        />
      </div>
    );
  };

  handleDropFolderAccepted = () => {
    let { files } = this.inputRef.current;
    let fileData = Array.from(files).filter((item) =>
      fileConstants.SUPPORTED_MIME_TYPES.includes(item?.type)
    );
    let folderName =
      files[0].webkitRelativePath && files[0].webkitRelativePath.split('/')[0];
    (async () => {
      const response = await api.createNewFolder({
        payload: {
          folder_name: folderName,
        },
      });
      const createdFolderId = _.get(
        response.responsePayload,
        'data.folderId',
        {}
      );
      storeFolderId({
        folderId: createdFolderId,
      });

      this.documentType &&
        uploadHelper.handleFileDrop({
          files: fileData,
          dropAccepted: true,
          documentType: this.documentType,
        });
    })();
  };

  handleListSort = (key, sortOrder) => {
    const { pageQueryParams } = this.state;
    const { history, match } = this.props;
    const newQueryParamSortValues = {
      [key]: sortOrder,
    };

    const newPageQueryParams = {
      ...pageQueryParams,
      sort_by: utils.createQueryParamSortArray(newQueryParamSortValues || []),
    };

    history.push(`${match.url}?${queryString.stringify(newPageQueryParams)}`);
  };

  handleSortableHeaderItemClick = (key) => {
    const { queryParamSortValues } = this.state;
    const existingValue = queryParamSortValues[key];
    const newSortValue =
      utils.toggleStringValue(existingValue, 'asc', 'desc') || 'desc';
    this.handleListSort(key, newSortValue);
  };

  render() {
    const {
      isFetchingDocuments,
      fetchSucceeded,
      fetchFailed,
      documents,
      usersList,
      slectedList,
      meta,
      user,
      config,
    } = this.props;

    const { queryParamSortValues } = this.state;

    const hasDocuments = !_.isEmpty(documents);

    const showFetchError = !isFetchingDocuments && fetchFailed;

    const showSkeletonView =
      isFetchingDocuments && !hasDocuments && !showFetchError;

    const showZeroCase =
      !isFetchingDocuments && fetchSucceeded && !hasDocuments;

    const showDocumentList =
      !showSkeletonView && !showZeroCase && !showFetchError && hasDocuments;

    const showPagination = !!showDocumentList;
    const showEmptyState = showZeroCase;

    const currentUser =
      usersList && usersList.length
        ? usersList.find((item) => item.default)
        : null;
    const showPermissionDenied =
      (!documents || !documents.length) &&
      currentUser &&
      currentUser.role !== 'owner' &&
      currentUser.role !== 'admin';
    return (
      <Fragment>
        {showFetchError ? (
          <DataFetchFailurePageError className='mt-12' />
        ) : null}
        {showDocumentList || showSkeletonView || showEmptyState ? (
          <MyDocumentsList
            uid='all'
            isLoading={showSkeletonView}
            documents={documents}
            selectedList={slectedList}
            sortOrderValues={queryParamSortValues}
            onSortableItemClick={this.handleSortableHeaderItemClick}
            showPagination={showPagination}
            meta={meta}
            onPageChange={this.handlePageNavigation}
            onDocumentActionChange={this.handleDocumentActionClick}
            showEmptyState={showEmptyState}
            showPermissionDenied={showPermissionDenied}
            user={user}
            config={config}
            onUploadFileBtnClick={this.handleUploadFileBtnClick}
            onUploadFolderBtnClick={this.handleUploadFolderBtnClick}
          />
        ) : null}
        <input
          ref={this.inputRef}
          id='folder-upload-input'
          directory=''
          webkitdirectory=''
          type='file'
          onChange={this.handleDropFolderAccepted}
          style={{ display: 'none' }}
        />
        <Dropzone
          ref={this.dropzoneRef}
          disableClick
          accept={fileConstants.SUPPORTED_MIME_TYPES}
          className={styles.hiddenDropzone}
          activeClassName={styles.dropzoneActive}
          rejectClassName={styles.dropzoneReject}
          onDropAccepted={this.handleDropAccepted}
          onDropRejected={this.handleDropRejected}
          onFileDialogCancel={this.handleFileDialogCancel}
        />
      </Fragment>
    );
  }
}

function mapStateToProp(state) {
  const { user, config } = state.app;

  const { documentsById, currentEditId, globalDocumentCounts } =
    state.documents;

  const {
    usersPage: { users },
  } = state.users;

  const {
    documentIds,
    meta,
    fetchState,
    selectedAll,
    slectedList = [],
  } = state.documents.allDocumentsPage;

  const documents = documentIds.map((documentId) => {
    return documentsById[documentId];
  });

  const isFetchingDocuments = fetchState === apiConstants.FETCH_STATES.FETCHING;
  const fetchSucceeded = fetchState === apiConstants.FETCH_STATES.SUCCESS;
  const fetchFailed = fetchState === apiConstants.FETCH_STATES.FAILURE;

  return {
    user,
    documents,
    meta,
    fetchState,
    isFetchingDocuments,
    fetchSucceeded,
    fetchFailed,
    selectedAll,
    documentIds,
    slectedList,
    usersList: users,
    currentEditId,
    globalDocumentCounts,
    config,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
    classifyActions: bindActionCreators(classifyActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(AllDocumentsPage);
