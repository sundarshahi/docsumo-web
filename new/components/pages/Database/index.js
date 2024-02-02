import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as csvActions } from 'new/redux/csv/actions';
import * as reduxHelpers from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import { format } from 'date-fns';
import download from 'downloadjs';
import { Download, EmptyPage, Plus, Trash } from 'iconoir-react';
import _, { memoize } from 'lodash';
import * as api from 'new/api';
import {
  PageMetadata,
  /* PageFooter, */
} from 'new/components/layout/page';
import DeleteConfirmationModal from 'new/components/modals/DeleteConfirmationModal/DeleteConfirmationModal';
import { DataFetchFailurePageError } from 'new/components/shared/PageError';
import * as apiConstants from 'new/constants/api';
import ROUTES from 'new/constants/routes';
import Button from 'new/ui-elements/Button/Button';
import Checkbox from 'new/ui-elements/Checkbox/Checkbox';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Pagination from 'new/ui-elements/Pagination';
import Table from 'new/ui-elements/Table';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import * as utils from 'new/utils';
import queryString from 'query-string';

import ZeroCase from './ZeroCase';

import styles from './index.scss';

class DatabaseComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'Database',
      deleteConfirmation: {},
      deleteLoading: false,
    };
  }

  componentDidMount() {
    const { history } = this.props;
    this.unlisten = history.listen(this.fetchDocuments);
  }

  UNSAFE_componentWillMount() {
    this.fetchDocuments();
  }

  getValidPageQueryParams = memoize((locationSearch) => {
    return utils.getValidPageQueryParams(locationSearch, {
      offset: {
        type: 'number',
        default: 0,
      },
    });
  });

  fetchDocuments = () => {
    const { pathname = '', search = '' } = location;
    const { isFetchingDocuments } = this.props;

    if (!isFetchingDocuments && pathname === ROUTES.DATABASE_TABLES) {
      let queryParams = this.getValidPageQueryParams(search, {
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
      });
      this.props.csvActions.csvFetch({
        queryParams,
      });
    }
  };

  componentWillUnmount() {
    const { csvActions } = this.props;
    csvActions.setCheckBoxSelectionAll({
      checked: false,
    });
    this.unlisten();
  }

  handleCheckboxChange = ({ target }) => {
    const { checked } = target;
    const { csvActions } = this.props;
    csvActions.setCheckBoxSelectionAll({
      checked: checked,
    });
  };

  getDocIdList = () => {
    const { slectedList = [] } = this.props;
    const bifurcateBy = (arr) => {
      return arr.reduce((acc, val) => (acc.push(val), acc), []);
    };

    const docIds = bifurcateBy(slectedList);

    return {
      dd_ids: docIds,
    };
  };

  handleCsvUpload = () => {
    reduxHelpers.closeUploadOverlay();
    const { csvActions } = this.props;
    csvActions.showUploadCsvModal();
  };

  handleDownload = async () => {
    const { slectedList = [], appActions } = this.props;
    if (!slectedList.length) {
      appActions.setToast({
        title: 'Please select at least one file.',
        error: true,
      });
      return;
    }
    appActions.setToast({
      title: 'Downloading...',
      duration: 3000,
    });
    const result = this.getDocIdList();
    try {
      const { responsePayload } = await api.downloadCsv({
        ...result,
        type: 'data',
      });
      const downloadUrl = _.get(responsePayload, 'data');
      download(downloadUrl);
    } catch (e) {
      // Do nothing
    }
  };

  handleCancelConfirmation = () => {
    this.setState({ deleteConfirmation: {} });
  };

  handleSelectedDelete = async () => {
    const { appActions, csvActions } = this.props;
    const result = this.getDocIdList();
    this.setState({
      deleteLoading: true,
    });
    try {
      //appActions.showLoaderOverlay();
      await api.deleteCsv({
        ...result,
      });
      csvActions.setCheckBoxSelectionAll({
        checked: false,
      });
      csvActions.setCheckBoxSelectionIndividual({
        checked: [],
      });
      this.handleCancelConfirmation();
      //appActions.hideLoaderOverlay();
      appActions.setToast({
        title: 'CSV File Deleted',
        success: true,
      });
      this.setState({ deleteConfirmation: {} });
    } finally {
      this.setState({
        deleteLoading: false,
      });
    }
    this.fetchDocuments();
  };

  handleGetConfirmation = () => {
    const { dd_ids = [] } = this.getDocIdList();
    const { slectedList = [], appActions } = this.props;
    if (!slectedList.length) {
      appActions.setToast({
        title: 'Please select at least one file.',
        error: true,
      });
      return;
    }

    this.setState({
      deleteConfirmation: {
        docs: dd_ids.length,
      },
    });
  };
  renderZeroCase = () => {
    return (
      <div className={styles.zeroCaseContainer}>
        <ZeroCase handleCsvUpload={this.handleCsvUpload} />
      </div>
    );
  };

  handleDocumentActionClick = ({ item }) => {
    const { ddId = '' } = item;
    this.props.csvActions.openTableView({
      ddId,
    });
    return this.props.csvActions.storeCSVDocumentId({
      currentCSVDocId: ddId,
    });
  };

  renderTypeDate = ({ cellData: { createdAtIso } }) => {
    return (
      <div>
        <p>{format(createdAtIso, 'h:mma')}</p>
        <p
          className={{
            color: 'var(--ds-clr-gray-700)',
            fontSize: 'var(--ds-fontSize-12)',
          }}
        >
          {format(createdAtIso, 'd LLL yyyy')}
        </p>
      </div>
    );
  };

  renderTitle = ({ cellData: { title } }) => {
    return (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <EmptyPage style={{ marginRight: 'var(--ds-spacing-2)' }} />
        {title}
      </span>
    );
  };

  renderUploadedBy = ({ cellData: { uploadedBy } }) => {
    return (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {uploadedBy?.fullName}
      </span>
    );
  };

  handleCheckboxSelectionList = ({ checked, value }) => {
    const { csvActions, slectedList = [] } = this.props;
    const optionChecked = !checked;
    const included = slectedList.includes(value);
    if (optionChecked && !included) {
      csvActions.setCheckBoxSelectionIndividual({
        checked: [...slectedList, value],
      });
    } else if (!optionChecked && included) {
      const result = slectedList.filter((e) => e !== value);
      csvActions.setCheckBoxSelectionIndividual({
        checked: [...result],
      });
    }
  };

  handlePageNavigation = (page) => {
    const { history, match, location, meta } = this.props;

    const offset = meta.limit * (page - 1);
    const params = {
      ...queryString.parse(location.search),
      offset: offset,
    };
    // this.props.documentActions.setTypWiseSelectionALL({
    //     uid:'all', checked: false
    // });

    history.push(`${match.url}?${queryString.stringify(params)}`);
  };

  renderPagination = () => {
    const { isFetchingDocuments } = this.props;
    if (isFetchingDocuments) return <></>;
    const { meta } = this.props;

    const totalPageCount = Math.ceil(meta.total / meta.limit);
    const currentPage = Math.ceil((meta.offset + 1) / meta.limit);

    return (
      <div className={styles.paginationContainer}>
        <Pagination
          totalPageCount={totalPageCount}
          currentPage={currentPage}
          leftRightOffset={1}
          siblings={1}
          onPageChange={this.handlePageNavigation}
        />
      </div>
    );
  };

  renderDocumentList = () => {
    const { csv, slectedList, isFetchingDocuments } = this.props;
    const columnStructure = [
      {
        key: 'name',
        title: 'Name',
        customBodyCell: this.renderTitle,
      },
      {
        key: 'uploadedBy',
        title: 'Uploaded By',
        customBodyCell: this.renderUploadedBy,
      },
      {
        key: 'dateModified',
        title: 'Date Modified',
        customBodyCell: this.renderTypeDate,
      },
      {
        key: 'dateAdded',
        title: 'Date Added',
        customBodyCell: this.renderTypeDate,
      },
    ];
    return (
      <div className={styles.csvList}>
        <Table
          data={csv}
          initialColumnStructure={columnStructure}
          headerClassNames={styles.activityTableHeader}
          bodyClassNames={styles.activityTableBody}
          checkedRows={slectedList}
          showCheckbox={true}
          setCheckedRows={this.handleCheckboxSelectionList}
          rowKey={'ddId'}
          onRowClick={this.handleDocumentActionClick}
          showLoader={isFetchingDocuments}
        />
        {this.renderPagination()}
      </div>
    );
  };

  render() {
    const {
      isFetchingDocuments,
      fetchSucceeded,
      fetchFailed,
      csv,
      selectedAll,
      slectedList = [],
    } = this.props;
    const { deleteConfirmation, deleteLoading } = this.state;

    const { docs } = deleteConfirmation;

    const hasCSV = !_.isEmpty(csv);
    const showSkeletonView = isFetchingDocuments && !hasCSV;
    const showZeroCase = !isFetchingDocuments && fetchSucceeded && !hasCSV;
    const showFetchError = !isFetchingDocuments && fetchFailed;
    const showDocumentList =
      !showSkeletonView && !showZeroCase && !showFetchError && hasCSV;
    return (
      <Fragment>
        <PageMetadata title='Database Table' />
        <div className={styles.title}>Database Tables</div>

        <div className={styles.header}>
          <div className={styles.header_left}>
            <Checkbox
              name='selectAll'
              checked={selectedAll || false}
              value='Normal'
              onChange={this.handleCheckboxChange}
            />

            <Tooltip label='Download'>
              <IconButton
                variant={'text'}
                icon={<Download />}
                iconClassName={styles.icon}
                disabled={slectedList.length > 1 || !hasCSV}
                onClick={this.handleDownload}
              >
                Download
              </IconButton>
            </Tooltip>
            <Tooltip label='Delete'>
              <IconButton
                variant='ghost'
                colorScheme='danger'
                disabled={!hasCSV}
                icon={<Trash />}
                onClick={this.handleGetConfirmation}
              >
                Delete
              </IconButton>
            </Tooltip>
          </div>
          <div className={styles.header_right}>
            <Button
              variant='contained'
              icon={<Plus height={20} width={20} />}
              size='small'
              onClick={this.handleCsvUpload}
            >
              Import
            </Button>
          </div>
        </div>
        {showZeroCase ? this.renderZeroCase() : null}
        {showFetchError ? (
          <DataFetchFailurePageError className='mt-12' />
        ) : null}
        {showDocumentList || showSkeletonView
          ? this.renderDocumentList()
          : null}
        <DeleteConfirmationModal
          show={docs}
          onCloseHandler={this.handleCancelConfirmation}
          handleDeleteBtnClick={this.handleSelectedDelete}
          modalTitle='Delete Documents'
          isLoading={deleteLoading}
          modalBody={`Are you sure you want to delete ${docs || ''} csv file?`}
        />
      </Fragment>
    );
  }
}
function mapStateToProp(state) {
  const {
    csv,
    meta,
    fetchState,
    selectedAll,
    slectedList = [],
  } = state.csv.csvPage;

  const { documentsById } = state.csv;

  const isFetchingDocuments = fetchState === apiConstants.FETCH_STATES.FETCHING;
  const fetchSucceeded = fetchState === apiConstants.FETCH_STATES.SUCCESS;
  const fetchFailed = fetchState === apiConstants.FETCH_STATES.FAILURE;

  return {
    csv,
    meta,
    fetchState,
    isFetchingDocuments,
    fetchSucceeded,
    fetchFailed,
    selectedAll,
    slectedList,
    documentsById,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    csvActions: bindActionCreators(csvActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(DatabaseComponent)
);
