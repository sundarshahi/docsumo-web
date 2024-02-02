import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { actions as activityActions } from 'new/redux/activities/actions';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { format } from 'date-fns';
import { SortDown, SortUp } from 'iconoir-react';
import _ from 'lodash';
import { PageFooter, PageMetadata } from 'new/components/layout/page';
import { DataFetchFailurePageError } from 'new/components/shared/PageError';
//import * as fileConstants from 'new/constants/file';
import * as apiConstants from 'new/constants/api';
import routes from 'new/constants/routes';
import * as documentsHelper from 'new/helpers/documents';
import * as uploadHelper from 'new/helpers/upload';
import { chameleonIdentifyUser } from 'new/thirdParty/chameleon';
import Badges from 'new/ui-elements/Badge/Badge';
import Pagination from 'new/ui-elements/Pagination';
import Table from 'new/ui-elements/Table';
import * as utils from 'new/utils';
//import Dropzone from 'react-dropzone';
import queryString from 'query-string';

// import { ReactComponent as UploadIcon } from 'new/assets/images/icons/upload.svg';
import { DocumentListHeader } from './List';

import styles from './list.scss';

class DocumentActivityPage extends Component {
  state = {
    pageQueryParams: null,
    queryParamSortValues: null,
  };

  constructor(props) {
    super(props);
    this.dropzoneRef = React.createRef();
    document.toolTipRef = React.createRef();
  }

  componentDidMount() {
    const pageQueryParams = this.getValidPageQueryParams(
      _.get(this.props, 'location.search')
    );

    this.updateParamStateKeys({
      pageQueryParams,
    });
    this.fetchDocuments(pageQueryParams);

    const { user, config } = this.props;

    chameleonIdentifyUser(user, config);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const nextLocation = nextProps.location;
    const { location, history, meta } = this.props;

    if (!meta || _.isEmpty(meta)) {
      return;
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

    if (nextLocation.state && nextLocation.state.forceReload) {
      history.replace(routes.DOCUMENT);
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

  componentWillUnmount() {
    this.props.activityActions.documentActivityReset();
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
    this.dateFilterRanges = documentsHelper.generateDateFilterRanges();
    const defaultDateRange = this.dateFilterRanges[0];
    return utils.getValidPageQueryParams(locationSearch, {
      offset: {
        type: 'number',
        default: 0,
      },
      sort_by: {
        multiple: true,
        default: ['created_date.desc'],
      },
      q: {
        type: 'string',
        default: '',
      },
      created_date: {
        multiple: true,
        default: defaultDateRange.queryParamValue,
      },
      type: {
        multiple: true,
        default: [],
      },
      user_id: {
        multiple: true,
        default: [],
      },
      action: {
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
    let queryParams = {
      q,
      ...pageQueryParams,
    };
    const { activityActions } = this.props;
    activityActions.documentActivityFetch({
      queryParams,
    });
  };

  startReview = ({ docId = null } = {}) => {
    this.props.documentActions.rtStartReview({
      queryParams: {
        ...this.state.pageQueryParams,
      },
      docId,
      redirect: routes.DOCUMENT,
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
    this.documentType = documentType;
    this.dropzoneRef && this.dropzoneRef.current.open();
  };

  downloadDocConfirmation = (docId) => {
    this.props.documentActions.downloadDocConfirmation({
      docId,
    });
  };

  handleDocumentActionClick = (action, docId) => {
    /* eslint-disable indent */
    switch (action) {
      case 'view': {
        return this.props.documentActions.openPreview({
          docId,
        });
      }

      case 'review': {
        return this.startReview({
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
          this.props.history.push(`${routes.ALL}?folder_id=${docId}`);
        })();
      }
    }
    /* eslint-enable indent */
  };

  renderPagination = () => {
    const { meta } = this.props;

    const totalPageCount = Math.ceil(meta.total / meta.limit);
    const currentPage = Math.ceil((meta.offset + 1) / meta.limit);

    return (
      <Pagination
        totalPageCount={totalPageCount}
        currentPage={currentPage}
        leftRightOffset={1}
        siblings={1}
        onPageChange={this.handlePageNavigation}
      />
    );
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

  handleSortableHeaderItemClick = ({
    item,
    columnStructure,
    setColumnStructure,
  }) => {
    const { queryParamSortValues } = this.state;
    const existingValue = queryParamSortValues?.created_date;
    const newSortValue =
      utils.toggleStringValue(existingValue, 'asc', 'desc') || 'desc';
    this.handleListSort('created_date', newSortValue);
    const newColumnStructure = [...columnStructure];
    const itemIdx = newColumnStructure.findIndex((obj) => obj.key === item.key);
    newColumnStructure[itemIdx].sortOrder = newSortValue;
    setColumnStructure(newColumnStructure);
  };

  renderDocumentListHeader = () => {
    const { queryParamSortValues } = this.state;

    return (
      <DocumentListHeader
        sortOrderValues={queryParamSortValues}
        onSortableItemClick={this.handleSortableHeaderItemClick}
      />
    );
  };

  renderDateAddedHeader = ({
    cellData: { title, sortOrder, key },
    checkedRows,
    setCheckedRows,
  }) => {
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <span
        role='button'
        tabIndex={0}
        className={cx(
          'd-flex',
          'justify-content-between',
          'cursor-pointer',
          styles.dateSortHeaderCell
        )}
      >
        {title}
        {sortOrder ? sortOrder === 'asc' ? <SortUp /> : <SortDown /> : ''}
      </span>
    );
  };

  renderDateAddedBody = ({ cellData: { dateTime } }) => {
    let dateObject = new Date(dateTime).getTime();
    return (
      <div>
        <p>{format(dateObject, 'h:mma')}</p>
        <p className={styles.cellDate}>{format(dateObject, 'd LLL yyyy')}</p>
      </div>
    );
  };

  renderTypeBody = ({ cellData: { type } }) => {
    switch (type) {
      case 'document_action':
        return 'Document';
      case 'admin_action':
        return 'Credit';
      case 'user_action':
        return 'User';
      case 'webhook_action':
        return 'Webhook';
      default:
        return 'Document';
    }
  };

  renderDescriptionBody = ({
    cellData: { action, mode, downloadUrl = '' },
  }) => {
    return (
      <>
        <span className='d-inline-block mr-2 text-truncate' title={action}>
          {action}
        </span>
        {mode === 'test' && <Badges type='warning' title='Test Mode' />}
      </>
    );
  };

  renderDocumentList = ({ showSkeletonView }) => {
    const { documentActivity, appActions } = this.props;

    const columnStructure = () => [
      {
        key: 'action',
        title: 'Description',

        width: '48%',
        minWidth: '6.25rem',
        customBodyCell: this.renderDescriptionBody,
      },

      {
        key: 'type',
        title: 'Type',
        width: '16%',
        customBodyCell: this.renderTypeBody,
      },
      {
        key: 'name',
        title: 'User',
        width: '16%',
      },
      {
        key: 'dateTime',
        title: 'Date Added',
        width: '16%',
        maxWidth: '12.5rem',
        customHeaderCell: this.renderDateAddedHeader,
        onHeaderCellClick: this.handleSortableHeaderItemClick,
        customBodyCell: this.renderDateAddedBody,

        sortOrder: this.state.queryParamSortValues?.created_date || 'desc',
      },
    ];

    return (
      <Table
        data={documentActivity || []}
        initialColumnStructure={columnStructure}
        headerClassNames={styles.activityTableHeader}
        bodyClassNames={styles.activityTableBody}
        rowKey='listKey'
        showLoader={showSkeletonView}
      />
    );
  };
  render() {
    const {
      isFetchingDocuments,
      fetchFailed,
      fetchSucceeded,
      documentActivity,
    } = this.props;

    const hasDocuments = !_.isEmpty(documentActivity);
    const showSkeletonView = isFetchingDocuments && !hasDocuments;
    const showZeroCase =
      !isFetchingDocuments && fetchSucceeded && !hasDocuments;
    const showFetchError = !isFetchingDocuments && fetchFailed;
    const showPaginaiton = !showSkeletonView && !showFetchError && hasDocuments;
    return (
      <Fragment>
        <PageMetadata title='Document Activity' />

        {showZeroCase ? (
          <p className={styles.notFound}> No Activity To Show. </p>
        ) : null}
        {showFetchError ? (
          <DataFetchFailurePageError className='mt-12' />
        ) : null}
        {this.renderDocumentList({ showSkeletonView })}

        {showPaginaiton ? (
          <PageFooter className={styles.footer}>
            {this.renderPagination()}
          </PageFooter>
        ) : null}
      </Fragment>
    );
  }
}

function mapStateToProp(state) {
  const { documentActivity, meta, fetchState } =
    state.activities.documentActivity;

  const { user, config } = state.app;

  const isFetchingDocuments = fetchState === apiConstants.FETCH_STATES.FETCHING;
  const fetchSucceeded = fetchState === apiConstants.FETCH_STATES.SUCCESS;
  const fetchFailed = fetchState === apiConstants.FETCH_STATES.FAILURE;

  return {
    meta,
    fetchState,
    isFetchingDocuments,
    documentActivity,
    fetchSucceeded,
    fetchFailed,
    user,
    config,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
    activityActions: bindActionCreators(activityActions, dispatch),
  };
}

export default connect(
  mapStateToProp,
  mapDispatchToProps
)(DocumentActivityPage);
