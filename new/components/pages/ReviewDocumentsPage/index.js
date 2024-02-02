import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as classifyActions } from 'new/redux/classification/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { bindActionCreators } from 'redux';

import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import MyDocumentsList from 'new/components/shared/MyDocumentsList/MyDocumentsList';
import * as apiConstants from 'new/constants/api';
import * as documentConstants from 'new/constants/document';
import routes from 'new/constants/routes';
import * as documentsHelper from 'new/helpers/documents';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import * as utils from 'new/utils';
import queryString from 'query-string';

class ReviewDocumentsPage extends Component {
  state = {
    pageQueryParams: null,
    queryParamSortValues: null,
  };

  constructor(props) {
    super(props);
    this.dropzoneRef = React.createRef();
  }

  UNSAFE_componentWillMount() {
    const pageQueryParams = this.getValidPageQueryParams(
      _.get(this.props, 'location.search')
    );

    this.updateParamStateKeys({
      pageQueryParams,
    });

    this.fetchDocuments(pageQueryParams);
  }

  componentDidMount() {}

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
      history.replace(
        folder_id ? `${routes.REVIEW}?folder_id=${folder_id}` : routes.REVIEW
      );
      this.updateParamStateKeys({
        pageQueryParams: {},
        queryParamSortValues,
      });
      this.fetchDocuments({ folder_id, ...currentPageQueryParams });
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
    this.props.documentActions.reviewDocumentsReset();
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
      folder_id: {
        type: 'string',
        default: '',
      },
      temp_token: {
        type: 'boolean',
        default: '',
      },
      user_id: {
        multiple: true,
        default: [],
      },
    });
  });

  fetchDocuments = (pageQueryParams) => {
    let searchQuery = utils.getValidPageQueryParams(
      _.get(this.props, 'location.search'),
      {
        q: {
          type: 'string',
          default: '',
        },
      }
    );
    const { q = '' } = searchQuery;
    this.props.documentActions.reviewDocumentsFetch({
      queryParams: {
        q,
        ...pageQueryParams,
        view: 'folder',
      },
    });
  };

  startReview = ({ docId = null } = {}) => {
    const { user, documents, config } = this.props;
    const doc = documents.find((i) => i.docId === docId);
    const { canSwitchToOldMode = true } = config;

    // Add mixpanel Event
    mixpanel.track(MIXPANEL_EVENTS.view_document, {
      origin: 'Review - My Documents',
      'work email': user.email,
      'doc type': doc.type,
      label: doc.title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    this.props.documentActions.rtStartReview({
      queryParams: {
        ...this.state.pageQueryParams,
        status: [
          documentConstants.STATUSES.REVIEW_REQUIRED,
          documentConstants.STATUSES.REVIEWING,
        ],
      },
      docId,
      doc_type: doc?.type,
      origin: 'Review - My Documents',
    });
  };

  startExcelView = ({ docId = null } = {}) => {
    this.props.documentActions.rtStartExcelView({
      queryParams: {
        ...this.state.pageQueryParams,
        excel_type: true,
        status: [
          documentConstants.STATUSES.REVIEW_REQUIRED,
          documentConstants.STATUSES.REVIEWING,
        ],
      },
      docId,
    });
  };

  handleReviewBtnClick = () => {
    this.startReview();
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

  handlePageNavigation = (page) => {
    const { history, match, location, meta } = this.props;

    const offset = meta.limit * (page - 1);
    const params = {
      ...queryString.parse(location.search),
      offset: offset,
    };

    history.push(`${match.url}?${queryString.stringify(params)}`);
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
          history.push(`${routes.REVIEW}?${queryString.stringify(params)}`);
        })();
      }
    }
    /* eslint-enable indent */
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
      documents,
      meta,
      isFetchingDocuments,
      fetchSucceeded,
      fetchFailed,
      slectedList,
    } = this.props;

    const { queryParamSortValues } = this.state;

    const hasDocuments = !_.isEmpty(documents);
    const showSkeletonView = isFetchingDocuments && !hasDocuments;
    const showZeroCase =
      !isFetchingDocuments && fetchSucceeded && !hasDocuments;
    const showFetchError = !isFetchingDocuments && fetchFailed;
    const showDocumentList =
      !showSkeletonView && !showZeroCase && !showFetchError && hasDocuments;
    const showPagination = !!showDocumentList;
    const showEmptyState = showZeroCase;

    return (
      <MyDocumentsList
        uid='review'
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
      />
    );
  }
}

function mapStateToProp(state) {
  const { documentsById, currentEditId } = state.documents;

  const {
    documentIds,
    meta,
    fetchState,
    selectedAll,
    slectedList = [],
  } = state.documents.reviewDocumentsPage;

  const { user, config } = state.app;

  const documents = documentIds.map((documentId) => {
    return documentsById[documentId];
  });

  const isFetchingDocuments = fetchState === apiConstants.FETCH_STATES.FETCHING;
  const fetchSucceeded = fetchState === apiConstants.FETCH_STATES.SUCCESS;
  const fetchFailed = fetchState === apiConstants.FETCH_STATES.FAILURE;

  return {
    documents,
    meta,
    fetchState,
    isFetchingDocuments,
    fetchSucceeded,
    fetchFailed,
    selectedAll,
    documentIds,
    slectedList,
    currentEditId,
    user,
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

export default connect(mapStateToProp, mapDispatchToProps)(ReviewDocumentsPage);
