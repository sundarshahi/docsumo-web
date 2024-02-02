import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { bindActionCreators } from 'redux';

import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import MyDocumentsList from 'new/components/shared/MyDocumentsList/MyDocumentsList';
import * as apiConstants from 'new/constants/api';
import * as documentConstants from 'new/constants/document';
import routes from 'new/constants/routes';
import * as documentsHelper from 'new/helpers/documents';
import { chameleonIdentifyUser } from 'new/thirdParty/chameleon';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import * as utils from 'new/utils';
import queryString from 'query-string';

class ProcessedDocumentsPage extends Component {
  state = {
    pageQueryParams: null,
    queryParamSortValues: null,
  };

  constructor(props) {
    super(props);
    this.dropzoneRef = React.createRef();
  }

  UNSAFE_componentWillMount() {
    this.dateFilterRanges = documentsHelper.generateDateFilterRanges();
    const defaultDateRange = this.dateFilterRanges[0];
    this.allowedParams = {
      offset: {
        type: 'number',
        default: 0,
      },
      sort_by: {
        multiple: true,
        default: ['created_date.desc', 'modified_date.desc'],
      },
      created_date: {
        multiple: true,
        default: defaultDateRange.queryParamValue,
      },
      modified_date: {
        multiple: true,
        default: defaultDateRange.queryParamValue,
      },
      q: {
        type: 'string',
        default: '',
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
      strict: {
        multiple: true,
        default: [],
      },
    };

    const pageQueryParams = this.getValidPageQueryParams(
      _.get(this.props, 'location.search')
    );
    const activeDateFilterRanges =
      this.getActiveDateFilterRanges(pageQueryParams);

    this.updateParamStateKeys({
      pageQueryParams,
      activeDateFilterRanges,
    });

    this.fetchDocuments(pageQueryParams);
  }

  componentDidMount() {
    const { user, config } = this.props;

    chameleonIdentifyUser(user, config);
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

    if (nextLocation.state && nextLocation.state.forceReload) {
      history.replace(
        folder_id
          ? `${routes.PROCESSED}?folder_id=${folder_id}`
          : routes.PROCESSED
      );
      this.updateParamStateKeys({
        pageQueryParams: {},
        queryParamSortValues,
      });
      this.fetchDocuments({ folder_id, ...currentPageQueryParams });
      return;
    }

    const paramsChanged = utils.haveParamsChanged(
      currentPageQueryParams,
      nextPageQueryParams
    );
    if (paramsChanged) {
      this.fetchDocuments(nextPageQueryParams);
      this.updateParamStateKeys({
        pageQueryParams: nextPageQueryParams,
        currentQueryParamSortValues: queryParamSortValues,
      });
    }
  }

  componentWillUnmount() {
    this.props.documentActions.processedDocumentsReset();
  }

  updateParamStateKeys = ({
    pageQueryParams,
    queryParamSortValues,
    activeDateFilterRanges,
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

    if (!activeDateFilterRanges) {
      activeDateFilterRanges = this.getActiveDateFilterRanges(pageQueryParams);
    }

    this.setState({
      pageQueryParams,
      queryParamSortValues: {
        ...currentQueryParamSortValues,
        ...queryParamSortValues,
      },
      activeDateFilterRanges,
    });
  };

  getValidPageQueryParams = _.memoize((locationSearch) => {
    return utils.getValidPageQueryParams(locationSearch, this.allowedParams);
  });

  getActiveDateFilterRanges = (pageQueryParams) => {
    return {
      created_date: documentsHelper.getActiveDateFilterRange(
        this.dateFilterRanges,
        pageQueryParams['created_date']
      ),
    };
  };

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
    this.props.documentActions.processedDocumentsFetch({
      queryParams: {
        q,
        ...pageQueryParams,
        view: 'folder',
      },
    });
  };

  applyParams = (params) => {
    const { history, match } = this.props;
    history.push(
      `${match.url}?${queryString.stringify(params, { encode: false })}`
    );
  };

  startReview = ({ docId = null } = {}) => {
    const { user, documents, config } = this.props;
    const doc = documents.find((i) => i.docId === docId);
    const { canSwitchToOldMode = true } = config;

    // Add mixpanel Event
    mixpanel.track(MIXPANEL_EVENTS.view_document, {
      origin: 'Processed - My Documents',
      'work email': user.email,
      'doc type': doc.type,
      label: doc.title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    this.props.documentActions.rtStartReview({
      queryParams: {
        ...this.state.pageQueryParams,
        status: [documentConstants.STATUSES.PROCESSED],
      },
      docId,
      doc_type: doc?.type,
      origin: 'Processed - My Documents',
      redirect: routes.PROCESSED,
    });
  };

  startExcelView = ({ docId = null } = {}) => {
    this.props.documentActions.rtStartExcelView({
      queryParams: {
        ...this.state.pageQueryParams,
        excel_type: true,
        status: [documentConstants.STATUSES.PROCESSED],
      },
      docId,
    });
  };

  handlePageNavigation = (page) => {
    const { location, meta } = this.props;

    const offset = meta.limit * (page - 1);
    const params = {
      ...queryString.parse(location.search),
      offset: offset,
    };

    this.applyParams(params);
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
          history.push(`${routes.PROCESSED}?${queryString.stringify(params)}`);
        })();
      }
    }
    /* eslint-enable indent */
  };

  handleListSort = (key, sortOrder) => {
    const { pageQueryParams } = this.state;
    const newQueryParamSortValues = {
      [key]: sortOrder,
    };

    const newPageQueryParams = {
      ...pageQueryParams,
      sort_by: utils.createQueryParamSortArray(newQueryParamSortValues || []),
    };

    this.applyParams(newPageQueryParams);
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
      columns,
      documents,
      slectedList,
      meta,
    } = this.props;

    const { queryParamSortValues } = this.state;

    const hasDocuments = !_.isEmpty(documents);
    const hasColumns = !_.isEmpty(columns);
    const showSkeletonView = isFetchingDocuments && !hasDocuments;
    const showZeroCase =
      !isFetchingDocuments && fetchSucceeded && !hasDocuments;
    const showFetchError = !isFetchingDocuments && fetchFailed;
    const showDocumentList =
      !showSkeletonView && !showZeroCase && !showFetchError && hasColumns;
    const showPagination = !!showDocumentList;
    const showEmptyState = showZeroCase;

    return (
      <MyDocumentsList
        uid='processed'
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

  const { user, config } = state.app;

  const {
    columns,
    documentIds,
    meta,
    fetchState,
    selectedAll,
    slectedList = [],
  } = state.documents.processedDocumentsPage;

  const documents = documentIds.map((documentId) => {
    return documentsById[documentId];
  });

  const isFetchingDocuments = fetchState === apiConstants.FETCH_STATES.FETCHING;
  const fetchSucceeded = fetchState === apiConstants.FETCH_STATES.SUCCESS;
  const fetchFailed = fetchState === apiConstants.FETCH_STATES.FAILURE;

  return {
    columns,
    documents,
    meta,
    fetchState,
    isFetchingDocuments,
    fetchSucceeded,
    fetchFailed,
    selectedAll,
    documentIds,
    slectedList,
    user,
    currentEditId,
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
)(ProcessedDocumentsPage);
