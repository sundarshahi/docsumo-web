/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { matchPath, withRouter } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { actions as usersActions } from 'new/redux/users/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { format } from 'date-fns';
import download from 'downloadjs';
import {
  Calendar,
  DeleteCircle,
  Download,
  EditPencil,
  EyeEmpty,
  Filter,
  MultiplePages,
  NavArrowDown,
  RefreshDouble,
  StatsUpSquare,
  SubmitDocument,
  Trash,
  User,
  UserSquare,
  WarningTriangle,
} from 'iconoir-react';
import _, { get } from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { PageMetadata } from 'new/components/layout/page';
import DeleteConfirmationModal from 'new/components/modals/DeleteConfirmationModal/DeleteConfirmationModal';
import { FullDatePicker } from 'new/components/widgets/DateRangePicker';
import Popover from 'new/components/widgets/popover';
import { CHECKBOX_STATES } from 'new/constants';
import * as documentConstants from 'new/constants/document';
import { MIXPANEL_ORIGINS } from 'new/constants/mixpanel';
import routes from 'new/constants/routes';
import * as documentsHelper from 'new/helpers/documents';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Badge from 'new/ui-elements/Badge';
import Button from 'new/ui-elements/Button/Button';
import Checkbox from 'new/ui-elements/Checkbox/Checkbox';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Tooltip from 'new/ui-elements/Tooltip';
import * as utils from 'new/utils';
import { mixpanelTrackingAllEvents } from 'new/utils/mixpanel';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import ChangeTypeDownload from './components/ChangeTypeDownload/ChangeTypeDownload';
import ChangeUserType from './components/ChangeUserType/ChangeUserType';
import DocumentFilter from './components/DocumentFilter/DocumentFilter';
import MoveInFiles from './components/MoveinFiles/MoveInFiles';
import UpdateDocumentType from './components/UpdateDocumentType/UpdateDocumentType';

import styles from './index.scss';

const currentDate = new Date();
let countDateSelection = 0;

const statusType = [
  { id: 1, title: 'Erred', value: 'erred' },
  { id: 2, title: 'Processed', value: 'processed' },
  { id: 3, title: 'Skipped', value: 'review_skipped' },
  { id: 4, title: 'Reviewing', value: 'reviewing' },
];
const errorType = [
  { id: 1, title: 'With Error', value: 'false' },
  { id: 2, title: 'Without Error', value: 'true' },
];

const accessDenied = 'Access Denied. Please contact admin to provide access.';
class TabNavbar extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  constructor(props) {
    super(props);
    this.state = {
      typeFilterd: [],
      statusFilter: [],
      errorFilter: [],
      userFilter: [],
      dateRange: [
        {
          startDate: currentDate,
          endDate: new Date(),
          key: 'selection',
        },
      ],
      dateSelected: false,
      deleteConfirmation: {},
      isDownloading: false,
      deleteLoading: false,
      showMoveInFolderModal: false,
      users: [],
      userTotal: 0,
      userOffset: 0,
    };
  }

  UNSAFE_componentWillMount() {
    const pageQueryParams = this.getValidPageQueryParams(
      _.get(this.props, 'location.search')
    );
    this.updateParamStateKeys({
      pageQueryParams,
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const nextLocation = nextProps.location;
    const { location } = this.props;

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
    if (paramsChanged) {
      this.updateParamStateKeys({
        pageQueryParams: nextPageQueryParams,
      });
    }
  }

  async componentDidMount() {
    const { location, documentActions } = this.props;
    const {
      folder_id,
      q = '',
      created_date,
      strict = [],
      doc_type = [],
      status = [],
      user_id = [],
    } = utils.getValidPageQueryParams(location.search, {
      folder_id: {
        type: 'string',
        default: '',
      },
      q: {
        type: 'string',
        default: '',
      },
      created_date: {
        multiple: true,
        default: [],
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
      strict: {
        multiple: true,
        default: [],
      },
    });
    documentActions.storeClickedFolderInfo({
      selectedFolderId: folder_id,
    });
    documentActions.storeClickedFolderId({
      selectedFolderId: folder_id,
    });
    const queryParams = {
      created_date,
      strict,
      doc_type,
      status,
      user_id,
      q,
    };
    if (folder_id) {
      documentActions.fetchDocumentCounts({
        queryParams: {
          ...queryParams,
          folder_id,
        },
      });
    } else {
      documentActions.fetchDocumentCounts({
        queryParams: {
          ...queryParams,
        },
      });
    }
    this.props.usersActions.usersFetch({
      queryParams: {
        q,
      },
    });

    if (doc_type.length) {
      this.setState({ typeFilterd: doc_type });
    }
    if (status.length) {
      this.setState({ statusFilter: status });
    }
    if (strict.length) {
      this.setState({ errorFilter: strict });
    }
    if (user_id.length) {
      this.setState({ userFilter: user_id });
    }

    if (created_date.length) {
      let [startDate, endDate] = created_date;
      startDate = startDate && startDate.replace('gte:', '');
      endDate = endDate && endDate.replace('lte:', '');
      this.setState({
        dateRange: [
          {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          },
        ],
        dateSelected: true,
      });
    }

    const userResponse = await api.getMembers({
      queryParams: { offset: this.state.userOffset },
    });

    const { users: userList, total: userTotal } = get(
      userResponse,
      'responsePayload.data'
    );

    this.setState({ users: [...this.state.users, ...userList], userTotal });
  }

  componentWillUnmount() {
    const { documentActions } = this.props;
    documentActions.storeClickedFolderInfo({
      selectedFolderId: null,
    });
    documentActions.storeClickedFolderId({
      selectedFolderId: null,
    });
  }

  componentDidUpdate(prevProps) {
    const prevLocation = prevProps.location;
    const {
      location,
      tab: { uid },
      documentActions,
    } = this.props;
    const { q, folder_id, created_date, doc_type, status, user_id, strict } =
      utils.getValidPageQueryParams(location.search, {
        folder_id: {
          type: 'string',
          default: '',
        },
        q: {
          type: 'string',
          default: '',
        },
        created_date: {
          multiple: true,
          default: [],
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
        strict: {
          multiple: true,
          default: [],
        },
      });
    const {
      q: prevQuery,
      folder_id: prevFolderId,
      strict: prevStrict,
      created_date: prev_created_date,
      doc_type: prev_docType,
      status: prevStatus,
      user_id: prevUserId,
    } = utils.getValidPageQueryParams(prevLocation.search, {
      folder_id: {
        type: 'string',
        default: '',
      },
      q: {
        type: 'string',
        default: '',
      },
      created_date: {
        multiple: true,
        default: [],
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
      strict: {
        multiple: true,
        default: [],
      },
    });
    const queryParams = {
      created_date,
      strict,
      doc_type,
      status,
      user_id,
      q,
    };
    if (folder_id !== prevFolderId) {
      if (!folder_id) {
        documentActions.storeClickedFolderInfo({
          selectedFolderId: null,
        });
        documentActions.storeClickedFolderId({
          selectedFolderId: null,
        });

        documentActions.fetchDocumentCounts({
          queryParams: {
            ...queryParams,
            q,
          },
        });
      } else {
        documentActions.storeClickedFolderInfo({
          selectedFolderId: folder_id,
        });
        documentActions.storeClickedFolderId({
          selectedFolderId: folder_id,
        });
        documentActions.fetchDocumentCounts({
          queryParams: {
            ...queryParams,
            folder_id,
            q,
          },
        });
      }
      documentActions.setTypWiseSelectionALL({
        uid,
        checked: false,
      });
      documentActions.setTypeWiseSelections({
        uid,
        checked: [],
      });
    }
    // if(created_date.length !== prev_created_date.length){
    if (!_.isEqual(created_date, prev_created_date)) {
      if (!created_date.length) {
        const dateNow = new Date();
        this.setState({
          dateRange: [
            {
              startDate: dateNow,
              endDate: new Date(),
              key: 'selection',
            },
          ],
        });
      }
      this.setState({
        dateSelected: !!created_date.length,
      });
      this.getFilteredCount({ date: created_date });
    }
    if (doc_type.length !== prev_docType.length) {
      this.handleFilterChange(doc_type);
      this.getFilteredCount();
    }
    if (status.length !== prevStatus.length) {
      this.handleStatusFilterChange(status);
      this.getFilteredCount();
      //this.fetchDocuments();
    }
    if (user_id.length !== prevUserId.length) {
      this.handleUserFilterChange(user_id);
      this.getFilteredCount();
      //this.fetchDocuments();
    }
    if (strict.length !== prevStrict.length) {
      this.handleErrorFilterChange(strict);
      this.getFilteredCount();
      //this.fetchDocuments();
    }
    if (q !== prevQuery) {
      this.getFilteredCount();
    }
  }

  getFilteredCount = ({ date } = {}) => {
    const { documentActions, location } = this.props;
    const {
      folder_id,
      created_date,
      q = '',
      strict = [],
      doc_type = [],
      status = [],
      user_id = [],
    } = utils.getValidPageQueryParams(location.search, {
      folder_id: {
        type: 'string',
        default: '',
      },
      created_date: {
        multiple: true,
        default: [],
      },
      q: {
        type: 'string',
        default: '',
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
      strict: {
        multiple: true,
        default: [],
      },
    });
    documentActions.fetchDocumentCounts({
      queryParams: {
        created_date: date ? date : created_date,
        strict,
        doc_type,
        status,
        user_id,
        folder_id,
        q,
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
      strict: {
        multiple: true,
        default: [],
      },
    });
  });

  applyParams = (params) => {
    const {
      history,
      location: { pathname, search },
    } = this.props;
    const currentQuery = queryString.parse(search);
    let query = {
      ...currentQuery,
      ...params,
    };
    query = queryString.stringify(query, { encode: false });
    history.push(`${pathname}?${query}`);
  };

  fetchDocuments = () => {
    const {
      documentActions,
      tab: { uid },
    } = this.props;
    const pageQueryParams = this.getValidPageQueryParams(
      _.get(this.props, 'location.search')
    );
    let { q = '', folder_id } = utils.getValidPageQueryParams(
      _.get(this.props, 'location.search'),
      {
        q: {
          type: 'string',
          default: '',
        },
        folder_id: {
          type: 'string',
          default: '',
        },
      }
    );
    documentActions[`${uid}DocumentsFetch`]({
      queryParams: {
        q,
        created_date: pageQueryParams.created_date,
        doc_type: pageQueryParams.doc_type,
        offset: pageQueryParams.offset,
        sort_by: pageQueryParams.sort_by,
        view: 'folder',
        folder_id,
        status: pageQueryParams.status,
        user_id: pageQueryParams.user_id,
        strict: pageQueryParams.strict,
      },
    });
  };

  /*   componentDidMount(){
    api.createNewFolder({'folder_name': 'Document Folder'});
  } */

  updateParamStateKeys = ({ pageQueryParams } = {}) => {
    if (!pageQueryParams) {
      pageQueryParams = this.getValidPageQueryParams(
        this.props.location.search
      );
    }

    this.setState({
      pageQueryParams,
    });

    return {
      pageQueryParams,
    };
  };

  startReviewButton = ({ docId = null } = {}) => {
    this.props.documentActions.rtStartReview({
      queryParams: {
        ...this.state.pageQueryParams,
        status: [
          documentConstants.STATUSES.REVIEW_REQUIRED,
          documentConstants.STATUSES.REVIEWING,
        ],
      },
      docId,
      origin: 'Review - My Documents',
      redirect: routes.ROOT,
    });
  };

  handleReviewBtnClick = () => {
    const { user, config } = this.props;
    const { canSwitchToOldMode = true } = config;
    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.start_review_doc, {
      origin: 'My Documents',
      'work email': user.email,
      version: 'new',
      canSwithUIVersion: canSwitchToOldMode,
    });

    this.startReviewButton();
  };

  handleDownloadBtnClick = async (type) => {
    const {
      tab: { uid },
      appActions,
      documentActions,
      user,
      history,
      location: { pathname },
      config,
    } = this.props;

    const { canSwitchToOldMode = true } = config;
    this.handleClosePopover();
    appActions.setToast({
      title: 'Downloading...',
      duration: 3000,
    });
    const result = this.getByfurcatedList();
    const { folder_ids, doc_ids } = result;
    if (folder_ids.length && doc_ids.length) {
      appActions.setToast({
        title: 'Combination of file and folder cannot be downloaded.',
        duration: 4000,
        error: true,
      });
      return;
    }
    try {
      let response;
      if (folder_ids.length) {
        response = await api.downloadFolderDocs({
          folder_ids,
          type: type,
          status: this.props?.tab?.uid,
        });
      } else {
        response = await api.downlaodMultiDocs({
          doc_ids,
          type: type,
        });
      }
      const downloadUrl = _.get(response, 'responsePayload.data.downloadUrl');
      download(downloadUrl);

      const originType =
        Object.values(MIXPANEL_ORIGINS).find((i) => {
          const match =
            matchPath(pathname, {
              path: i.path,
              isExact: true,
            }) || {};
          return match.isExact;
        }) || {};

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.document_download, {
        origin: originType.value || 'Documents Selection Bar',
        'work email': user.email,
        'document type': 'Selected documents',
        'download option': type,
        docId: 'Selected documents',
        label: 'Documents Selection Bar',
        version: 'new',
        canSwithUIVersion: canSwitchToOldMode,
      });
    } catch (e) {
      // Do nothing
      const { responsePayload, statusCode } = e || {};
      const { error = '', message = '' } = responsePayload || {};

      const handleRedirect = () => {
        const { history } = this.props;
        history.push(`${routes.ALL_ACTIVITY}?action=bulk_download`);
        appActions.removeAllToast();
      };

      appActions.setToast({
        title: statusCode === 403 ? accessDenied : message,
        duration: error === 'DOWNLOAD_TIMEOUT' ? null : 3000,
        description:
          error === 'DOWNLOAD_TIMEOUT' ? (
            <span className={styles.toastLink} onClick={handleRedirect}>
              Go to all activity logs page
            </span>
          ) : (
            ''
          ),
        error: error === 'DOWNLOAD_TIMEOUT' ? false : true,
      });
    } finally {
      documentActions.setTypWiseSelectionALL({
        uid,
        checked: false,
      });
      documentActions.setTypeWiseSelections({
        uid,
        checked: [],
      });
    }
  };

  handleCheckboxChange = (checkboxStatus) => {
    const {
      tab: { uid },
      documentActions,
    } = this.props;

    let checked = false;

    switch (checkboxStatus) {
      case CHECKBOX_STATES.checked:
        checked = false;
        break;
      case CHECKBOX_STATES.unchecked:
        checked = true;
        break;
      case CHECKBOX_STATES.partialChecked:
        checked = false;
        break;
      default:
        checked = false;
    }

    mixpanelTrackingAllEvents(MIXPANEL_EVENTS.persist_selection_selection_tag, {
      origin: 'My Documents',
    });

    documentActions.setTypWiseSelectionALL({
      uid,
      checked: checked,
    });
  };

  handleDateRangeChange = (dateRange) => {
    countDateSelection += 1;
    let [{ startDate, endDate } = {}] = dateRange;
    // eslint-disable-next-line quotes
    startDate = format(startDate, "'gte:'yyyy-MM-dd");
    // eslint-disable-next-line quotes
    endDate = format(endDate, "'lte:'yyyy-MM-dd");
    const {
      tab: { uid },
      documentActions,
    } = this.props;
    documentActions.setTypWiseSelectionALL({
      uid,
      checked: false,
    });
    documentActions.setTypeWiseSelections({
      uid,
      checked: [],
    });
    this.applyParams({ created_date: [startDate, endDate] });
    this.setState({ dateRange });
    if (countDateSelection === 2) {
      this.handleClosePopover();
    }
  };

  clearCountDateSelection = () => {
    countDateSelection = 0;
  };

  handleFilterChange = (typeFilterd) => {
    const {
      tab: { uid },
      documentActions,
    } = this.props;
    documentActions.setTypWiseSelectionALL({
      uid,
      checked: false,
    });
    documentActions.setTypeWiseSelections({
      uid,
      checked: [],
    });
    this.applyParams({ doc_type: [...typeFilterd], offset: 0 });
    this.setState({ typeFilterd });
    //this.handleClosePopover();
  };

  handleClearFilters = () => {
    this.applyParams({ doc_type: [] });
    this.setState({ typeFilterd: [] });
  };
  handleStatusFilterChange = (statusFilter) => {
    const {
      tab: { uid },
      documentActions,
    } = this.props;
    documentActions.setTypWiseSelectionALL({
      uid,
      checked: false,
    });
    documentActions.setTypeWiseSelections({
      uid,
      checked: [],
    });
    this.applyParams({ status: [...statusFilter], offset: 0 });
    this.setState({ statusFilter });
    //this.handleClosePopover();
  };
  handleErrorFilterChange = (errorFilter) => {
    const {
      tab: { uid },
      documentActions,
    } = this.props;
    documentActions.setTypWiseSelectionALL({
      uid,
      checked: false,
    });
    documentActions.setTypeWiseSelections({
      uid,
      checked: [],
    });
    this.applyParams({ strict: [...errorFilter], offset: 0 });
    this.setState({ errorFilter });

    //this.handleClosePopover();
  };
  handleClearErrorFilterChange = () => {
    this.applyParams({ strict: [] });
    this.setState({ errorFilter: [] });
    //this.handleClosePopover();
  };

  handleClearStatusFilters = () => {
    this.applyParams({ status: [] });
    this.setState({ statusFilter: [] });
  };
  handleUserFilterChange = (userFilter) => {
    const {
      tab: { uid },
      documentActions,
    } = this.props;
    documentActions.setTypWiseSelectionALL({
      uid,
      checked: false,
    });
    documentActions.setTypeWiseSelections({
      uid,
      checked: [],
    });
    this.applyParams({ user_id: [...userFilter], offset: 0 });
    this.setState({ userFilter });
    //this.handleClosePopover();
  };

  handleClearUserFilters = () => {
    this.applyParams({ user_id: [] });
    this.setState({ userFilter: [] });
  };

  handleClearDateFilters = () => {
    this.setState({ dateSelected: false });
    this.applyParams({ created_date: [] });
  };

  // Clear all selections across every page
  handleSelectionsRemoval = () => {
    const {
      tab: { uid },
      documentActions,
    } = this.props;
    documentActions.setTypWiseSelectionALL({
      uid,
      checked: false,
      clearAll: true,
    });
  };

  handleClearAll = () => {
    const { dateSelected, typeFilterd, statusFilter, userFilter, errorFilter } =
      this.state;
    const {
      tab: { uid },
      documentActions,
      documents = [],
    } = this.props;
    const {
      slectedList = [], // consists of the doc ids that are selected
    } = documents[`${uid}DocumentsPage`] ?? {};

    if (
      dateSelected ||
      typeFilterd.length ||
      statusFilter.length ||
      userFilter.length ||
      errorFilter.length
    ) {
      this.applyParams({
        doc_type: [],
        created_date: [],
        status: [],
        user_id: [],
        strict: [],
      });
      this.setState({
        typeFilterd: [],
        dateSelected: false,
        statusFilter: [],
        userFilter: [],
        errorFilter: [],
      });
    }

    if (slectedList.length) {
      documentActions.setTypWiseSelectionALL({
        uid,
        checked: false,
        clearAll: true,
      });
    }

    mixpanelTrackingAllEvents(MIXPANEL_EVENTS.persist_selection_clearall, {
      origin: 'My Documents',
    });
  };
  clearIndividualUserFilter = (filter) => {
    let filtered = this.state.userFilter.filter((value) => value !== filter);
    this.handleUserFilterChange(filtered);
  };

  clearIndividualStatusFilter = (filter) => {
    let filtered = this.state.statusFilter.filter((value) => value !== filter);
    this.handleStatusFilterChange(filtered);
  };

  clearIndividualErrorFilter = (filter) => {
    let filtered = this.state.errorFilter.filter((value) => value !== filter);
    this.handleErrorFilterChange(filtered);
  };
  clearIndividualFilter = (filter) => {
    let filtered = this.state.typeFilterd.filter((value) => value !== filter);
    this.handleFilterChange(filtered);
  };

  handleUpdateUsers = async () => {
    const { users, userTotal, userOffset } = this.state;
    if (users.length >= userTotal) return;
    const userResponse = await api.getMembers({
      queryParams: { offset: userOffset + 20 },
    });
    const userList = get(userResponse, 'responsePayload.data.users');

    this.setState((prevState) => ({
      users: [...prevState.users, ...userList],
      userOffset: prevState.userOffset + 20,
    }));
  };

  getByfurcatedList = () => {
    const {
      documents = [],
      tab: { uid },
    } = this.props;
    const { slectedList = [] } = documents[`${uid}DocumentsPage`] ?? {};
    const { documentsById } = documents;

    const bifurcateBy = (arr, fn) =>
      arr.reduce((acc, val) => (acc[fn(val) ? 0 : 1].push(val), acc), [[], []]);

    const [folderIds, docIds] = bifurcateBy(
      slectedList,
      (id) => documentsById[id] && documentsById[id].displayType === 'folder'
    );

    return {
      folder_ids: folderIds,
      doc_ids: docIds,
    };
  };

  handleClosePopover() {
    countDateSelection = 0;
    const app = document.getElementById('app');
    app && app.click();
  }

  handleSelectedRefresh = async () => {
    const {
      tab: { uid },
      appActions,
      documentActions,
    } = this.props;
    appActions.showLoaderOverlay();
    const result = this.getByfurcatedList();

    mixpanelTrackingAllEvents(MIXPANEL_EVENTS.persist_selection_retry, {
      origin: 'My Documents',
    });

    try {
      await api.retryDocuments({
        ...result,
        status: this.props?.tab?.uid,
      });
      documentActions.fetchDocumentCounts({
        queryParams: { ...this.state.pageQueryParams },
      });
      appActions.setToast({
        title: 'Documents Refreshed',
        success: true,
      });
      this.fetchDocuments();
    } catch (e) {
      const { responsePayload = {}, statusCode = '' } = e || {};
      appActions.setToast({
        title:
          statusCode === 403 ? accessDenied : responsePayload?.message || '',
        rootClassName: styles.toastDownloadClass,
        error: true,
      });
    } finally {
      documentActions.setTypWiseSelectionALL({
        uid,
        checked: false,
      });
      documentActions.setTypeWiseSelections({
        uid,
        checked: [],
      });
      this.handleClosePopover();

      appActions.hideLoaderOverlay();
    }
  };

  handleSelectedChangeType = async (docTypeId) => {
    const {
      tab: { uid },
      appActions,
      documentActions,
    } = this.props;
    const result = this.getByfurcatedList();
    appActions.setToast({
      title: 'Documents type changing...',
      success: true,
      duration: 3000,
    });

    mixpanelTrackingAllEvents(
      MIXPANEL_EVENTS.persist_selection_change_doctype,
      { origin: 'My Documents' }
    );

    try {
      await api.changeDocType({
        ...result,
        doc_type_id: docTypeId,
        status: this.props?.tab?.uid,
      });
      appActions.setToast({
        title: 'Document type changed.',
        success: true,
      });
      this.fetchDocuments();
    } catch (e) {
      const { responsePayload: { message = '' } = {}, statusCode } = e || {};
      appActions.setToast({
        title: statusCode === 403 ? accessDenied : message,
        rootClassName: styles.toastDownloadClass,
        error: true,
      });
    } finally {
      documentActions.setTypWiseSelectionALL({
        uid,
        checked: false,
      });
      documentActions.setTypeWiseSelections({
        uid,
        checked: [],
      });
      this.handleClosePopover();
    }
  };

  handleChangeUser = async (userId) => {
    const {
      tab: { uid },
      appActions,
      documentActions,
      user,
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config;
    const result = this.getByfurcatedList();

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.assign_mydoc, {
      origin: 'My Documents',
      'work email': user.email,
      version: 'new',
      canSwithUIVersion: canSwitchToOldMode,
    });

    try {
      await api.changeUserType({
        ...result,
        user_id: userId,
        status: this.props?.tab?.uid,
      });
      documentActions.setTypWiseSelectionALL({
        uid,
        checked: false,
      });
      documentActions.setTypeWiseSelections({
        uid,
        checked: [],
      });
      this.handleClosePopover();
      appActions.setToast({
        title: 'Document permission given.',
        success: true,
      });
      this.fetchDocuments();
    } catch (e) {
      const { statusCode = '' } = e;
      const errorMsg = e.responsePayload
        ? e.responsePayload.message
        : 'An error occurred while assigning user.';
      appActions.setToast({
        title: statusCode === 403 ? accessDenied : errorMsg,
        rootClassName: styles.toastClass,
        error: true,
      });
      this.handleClosePopover();
    }
  };

  handleGetConfirmation = () => {
    const {
      documents: { documentsById },
      tab: { uid },
    } = this.props;
    const { folder_ids = [], doc_ids = [] } = this.getByfurcatedList();
    const folder_doc_counts = folder_ids.reduce((acc, val) => {
      var document = documentsById[val] || {};
      var count = document?.docCounts?.[uid];
      return acc + parseInt(count, 10);
    }, 0);
    this.setState({
      deleteConfirmation: {
        folders: folder_ids.length,
        docs: doc_ids.length,
        total: folder_doc_counts + doc_ids.length,
      },
    });
  };

  handleCancelConfirmation = () => {
    this.setState({ deleteConfirmation: {} });
  };

  handleSelectedDelete = async () => {
    const {
      tab: { uid },
      appActions,
      documentActions,
      user,
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config;
    const result = this.getByfurcatedList();
    this.setState({
      deleteLoading: true,
    });

    // Add mixpanel event
    mixpanelTrackingAllEvents(MIXPANEL_EVENTS.persist_selection_delete, {
      origin: 'My Documents',
    });

    try {
      //appActions.showLoaderOverlay();
      await api.deleteDocAndFolder({
        ...result,
        status: this.props?.tab?.uid,
      });
      documentActions.setTypWiseSelectionALL({
        uid,
        checked: false,
      });
      documentActions.setTypeWiseSelections({
        uid,
        checked: [],
      });
      this.handleClosePopover();
      const type = result?.doc_ids?.length ? 'document' : 'folder';
      const total = result?.doc_ids?.length || result?.folder_ids?.length;
      appActions.setToast({
        title: `${total} ${
          total > 1 ? type + 's' : type
        } deleted successfully!`,
        success: true,
      });
      this.setState({ deleteConfirmation: {} });
      documentActions.fetchDocumentCounts({
        queryParams: { ...this.state.pageQueryParams },
      });
      this.fetchDocuments();
    } catch (e) {
      const { statusCode = '' } = e;
      const errorMsg = e.responsePayload
        ? e.responsePayload.message
        : 'An error occurred while deleting the documents.';
      appActions.setToast({
        title: statusCode === 403 ? accessDenied : errorMsg,
        rootClassName: styles.toastClass,
        error: true,
      });
    } finally {
      this.setState({
        deleteLoading: false,
      });
    }
  };

  handleSelectedDownlaod = async (type) => {
    const { appActions, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;
    this.handleClosePopover();

    this.setState({
      isDownloading: true,
    });
    let params = { ...this.state.pageQueryParams, type };
    //const result = this.getByfurcatedList();
    try {
      const { responsePayload } = await api.downloadAllDocs({
        queryParams: params,
      });
      const downloadUrl = _.get(responsePayload, 'data.downloadUrl');
      const { message = '' } = responsePayload;
      if (message) {
        appActions.setToast({
          title: message,
          error: true,
        });
        return;
      }
      appActions.setToast({
        title: 'Downloading...',
        duration: 3000,
      });

      download(downloadUrl);

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.document_download, {
        'work email': user.email,
        'document type': 'all documents',
        'download option': type,
        label: 'Processed tab',
        origin: 'Processed tab',
        docId: 'all documents',
        version: 'new',
        canSwithUIVersion: canSwitchToOldMode,
      });
    } catch (e) {
      // Do nothing
      const { responsePayload: { message = '' } = {} } = e || {};
      appActions.setToast({
        title: message,
        rootClassName: styles.toastDownloadClass,
        error: true,
      });
    } finally {
      this.setState({
        isDownloading: false,
      });
    }
  };

  handleFolderAction(type, { folderId }) {
    const {
      tab: { url },
      history,
      appActions,
    } = this.props;
    /* eslint-disable indent */
    switch (type) {
      case 'rename':
        return appActions.setFolderOption({
          renameFolderId: folderId,
          addNewFolder: false,
        });
      case 'delete':
        (async () => {
          await api.deleteDocAndFolder({
            folder_ids: [folderId],
          });
          history.push(url);
          appActions.setToast({
            title: 'Folder Deleted.',
            success: true,
          });
          documentActions.fetchDocumentCounts();
        })();
    }
    /* eslint-enable indent */
  }

  handleBakcToRoot(url) {
    this.props.history.push(url);
  }

  handleSelectedEditName = () => {
    const {
      tab: { uid },
      documents = [],
      documentActions,
    } = this.props;
    const { slectedList = [] } = documents[`${uid}DocumentsPage`] ?? {};

    if (slectedList.length !== 1) return;

    documentActions.setEditDocId({ docId: slectedList[0] });

    mixpanelTrackingAllEvents(MIXPANEL_EVENTS.persist_selection_rename, {
      origin: 'My Documents',
    });
  };

  handleMoveInFolderClick = () => {
    mixpanelTrackingAllEvents(MIXPANEL_EVENTS.persist_selection_move, {
      origin: 'My Documents',
    });
    this.setState({ showMoveInFolderModal: true });
  };

  closeMoveInModalHandler = () => {
    this.setState({ showMoveInFolderModal: false });
    this.fetchDocuments();
    this.getFilteredCount();
    this.handleClearAll();
  };

  getSelectAllStatus = () => {
    const {
      tab: { uid },
      documents = [],
    } = this.props;
    const {
      slectedList = [], // consists of the doc ids that are selected
      documentIds = [], // consists of the doc ids in the current page
    } = documents[`${uid}DocumentsPage`] ?? {};

    if (!slectedList.length) return CHECKBOX_STATES.unchecked;

    let count = 0;
    for (let i = 0; i < documentIds.length; i++) {
      if (slectedList.includes(documentIds[i])) {
        count++;
      }
    }

    let checkboxStatus = CHECKBOX_STATES.unchecked;

    if (count > 0 && count < documentIds.length) {
      // if ids in slectedList but not all of the current page -> partial check
      checkboxStatus = CHECKBOX_STATES.partialChecked;
    } else if (count > 0 && count === documentIds.length) {
      // if ids in slectedList and has all of the current page -> check
      checkboxStatus = CHECKBOX_STATES.checked;
    } else {
      // if no ids in slectedList or no ids of current page in slectedList -> uncheck
      checkboxStatus = CHECKBOX_STATES.unchecked;
    }

    return checkboxStatus;
  };

  getSelectionLabel = () => {
    const {
      tab: { uid },
      documents = [],
    } = this.props;
    const {
      slectedList = [], // consists of the doc ids that are selected
      meta = {}, // contains info of total no. of items in each tab
    } = documents[`${uid}DocumentsPage`] ?? {};

    if (!slectedList.length) return '';

    const label = `${slectedList.length} of ${meta.total} items`;

    return label;
  };

  renderSelectAllSection = () => {
    const checkboxStatus = this.getSelectAllStatus();

    return (
      <Checkbox
        name='selectAll'
        className='UFTooltipSelectFiles'
        state={checkboxStatus}
        checked={checkboxStatus === CHECKBOX_STATES.unchecked ? false : true}
        onChange={() => this.handleCheckboxChange(checkboxStatus)}
      />
    );
  };

  renderSelectionsFilter = () => {
    const {
      tab: { uid },
      documents = [],
      config: { documentTypes },
      selectedFolderData,
    } = this.props;

    const { users } = this.state;
    const { slectedList = [] } = documents[`${uid}DocumentsPage`] ?? {};

    const { documentsById = [] } = documents;

    if (_.isEmpty(slectedList)) return <></>;

    const selectedDocuments = slectedList.map((documentId) => {
      return documentsById[documentId];
    });

    const selectedFileIds = selectedDocuments
      .filter((documents) => documents?.displayType === 'files')
      .map((file) => file.docId);

    const showMoveInFolder = selectedDocuments.every(
      ({ displayType }) => displayType === 'files'
    );

    const singleSelectedFileName = selectedDocuments[0]?.title;

    const uploadableDocumentTypes =
      documentTypes.filter((item) => item.canUpload) || [];
    const { folder_id } = this.getValidPageQueryParams(
      get(this.props, 'location.search')
    );

    const {
      folderId: currentFolderId = documentConstants.ROOT_FOLDER_ID,
      folderName: currentFolderName = 'My Documents',
    } = selectedFolderData;

    return (
      <div className={styles.selectionFilters}>
        <MoveInFiles
          showMoveInFolderModal={this.state.showMoveInFolderModal}
          closeMoveInModalHandler={this.closeMoveInModalHandler}
          selectedFileIds={selectedFileIds}
          sourceFolderId={currentFolderId}
          currentFolderName={currentFolderName}
          singleSelectedFileName={singleSelectedFileName}
        />
        <Popover
          content={<ChangeTypeDownload onClick={this.handleDownloadBtnClick} />}
          uid='document-change-type-section'
          className={styles.actionPopover}
          containerClassName={styles.actionPopover_container}
          contentClassName={styles.actionPopover_content}
          openClassName={styles.actionPopover__open}
        >
          <Tooltip label='Download' className={styles.iconTooltip}>
            <div className={styles.iconDropdownButton}>
              <span className={styles.actionIcon}>
                <Download />
              </span>
              <span className={styles.dropIcon}>
                <NavArrowDown />
              </span>
            </div>
          </Tooltip>
        </Popover>
        <Popover
          content={
            <ChangeUserType
              options={users}
              onUserSelection={this.handleChangeUser}
              onFetchUser={this.handleUpdateUsers}
              isLoading={this.state.users.length < this.state.userTotal}
            />
          }
          uid='document-change-user-section'
          className={styles.actionPopover}
          openClassName={styles.actionPopover__open}
          containerClassName={cx(
            styles.actionPopover_container,
            styles.actionPopover_container__lg
          )}
        >
          <Tooltip label='Assign user' className={styles.iconTooltip}>
            <div className={styles.iconDropdownButton}>
              <span className={styles.actionIcon}>
                <UserSquare />
              </span>
              <span className={styles.dropIcon}>
                <NavArrowDown />
              </span>
            </div>
          </Tooltip>
        </Popover>
        <Popover
          content={
            <UpdateDocumentType
              options={uploadableDocumentTypes}
              onDocTypeSelection={this.handleSelectedChangeType}
            />
          }
          uid='document-change-type-section'
          className={styles.actionPopover}
          openClassName={styles.actionPopover__open}
          containerClassName={cx(
            styles.actionPopover_container,
            styles.actionPopover_container__lg
          )}
        >
          <Tooltip label='Change Document Type' className={styles.iconTooltip}>
            <div className={styles.iconDropdownButton}>
              <span className={styles.actionIcon}>
                <MultiplePages />
              </span>
              <span className={styles.dropIcon}>
                <NavArrowDown />
              </span>
            </div>
          </Tooltip>
        </Popover>
        <Tooltip
          label='Delete'
          className={cx(styles.iconTooltip, styles.iconTooltip__btn)}
        >
          <IconButton
            icon={<Trash />}
            className={cx(styles.actionButton, styles.actionButton__delete)}
            iconClassName={styles.actionButton_icon}
            variant='ghost'
            onClick={this.handleGetConfirmation}
          />
        </Tooltip>

        {showMoveInFolder ? (
          <Tooltip
            label='Move'
            className={cx(styles.iconTooltip, styles.iconTooltip__btn)}
          >
            <IconButton
              icon={<SubmitDocument />}
              className={styles.actionButton}
              iconClassName={styles.actionButton_icon}
              variant='ghost'
              onClick={this.handleMoveInFolderClick}
            />
          </Tooltip>
        ) : (
          ''
        )}

        <Tooltip
          label='Retry'
          className={cx(styles.iconTooltip, styles.iconTooltip__btn)}
        >
          <IconButton
            icon={<RefreshDouble />}
            className={styles.actionButton}
            iconClassName={styles.actionButton_icon}
            variant='ghost'
            onClick={this.handleSelectedRefresh}
          />
        </Tooltip>
        {slectedList.length === 1 && (
          <Tooltip
            label='Edit'
            className={cx(styles.iconTooltip, styles.iconTooltip__btn)}
          >
            <IconButton
              icon={<EditPencil />}
              className={styles.actionButton}
              iconClassName={styles.actionButton_icon}
              variant='ghost'
              onClick={this.handleSelectedEditName}
            />
          </Tooltip>
        )}
      </div>
    );
  };

  renderDocumentListFilter = () => {
    const {
      typeFilterd,
      statusFilter,
      userFilter,
      errorFilter,
      dateRange,
      dateSelected,
    } = this.state;
    const {
      tab: { uid },
      config: { documentTypes },
      user,
    } = this.props;

    const { users } = this.state;

    const isMemberUser = user.role === 'member';
    const showUserFilter = !isMemberUser;

    const uploadableDocumentTypes =
      documentTypes.filter((item) => item.canUpload) || [];

    let totalUsers = [];
    users?.forEach((d, index) => {
      let temp = {};
      temp.id = index;
      temp.title = d.fullName;
      temp.value = d.userId;
      totalUsers.push(temp);
    });

    return (
      <>
        <Popover
          content={
            <>
              <DocumentFilter
                options={uploadableDocumentTypes}
                appliedFilters={typeFilterd}
                onFilterChange={this.handleFilterChange}
                filterTitle={'Select Document Type:'}
              />
            </>
          }
          footer={
            typeFilterd.length ? (
              <div className={styles.actionPopover_footer}>
                <Button
                  size='small'
                  variant='outlined'
                  className={styles.actionPopover_footerBtn}
                  onClick={() => this.handleClearFilters()}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              ''
            )
          }
          uid='document-type-filter-section'
          className={cx(styles.actionPopover, {
            [styles.actionPopover__active]: typeFilterd.length,
          })}
          openClassName={styles.actionPopover__open}
          containerClassName={cx(
            styles.actionPopover_container,
            styles.actionPopover_container__lg,
            styles.actionPopover_container__inverted
          )}
        >
          <Tooltip
            label='Filter By Document Type'
            className={styles.iconTooltip}
          >
            <div className={styles.iconDropdownButton}>
              <span className={styles.actionIcon}>
                <Filter />
              </span>
              <span className={styles.dropIcon}>
                <NavArrowDown />
              </span>
            </div>
          </Tooltip>
          {typeFilterd.length ? (
            <Tooltip label='Clear filters' className={styles.removeBtn}>
              {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
              <span
                className={styles.removeBtn_icon}
                onClick={() => this.handleClearFilters()}
              >
                <DeleteCircle />
              </span>
            </Tooltip>
          ) : (
            <></>
          )}
        </Popover>
        {uid === 'all' && (
          <Popover
            content={
              <>
                <DocumentFilter
                  options={statusType}
                  appliedFilters={statusFilter}
                  onFilterChange={this.handleStatusFilterChange}
                  filterTitle={'Select Status Type:'}
                />
              </>
            }
            footer={
              statusFilter.length ? (
                <div className={styles.actionPopover_footer}>
                  <Button
                    size='small'
                    variant='outlined'
                    className={styles.actionPopover_footerBtn}
                    onClick={() => this.handleClearStatusFilters()}
                  >
                    Clear all filters
                  </Button>
                </div>
              ) : (
                ''
              )
            }
            className={cx(styles.actionPopover, {
              [styles.actionPopover__active]: statusFilter.length,
            })}
            openClassName={styles.actionPopover__open}
            containerClassName={cx(
              styles.actionPopover_container,
              styles.actionPopover_container__md,
              styles.actionPopover_container__inverted
            )}
          >
            <Tooltip
              label='Filter By Status Type'
              className={styles.iconTooltip}
            >
              <div className={styles.iconDropdownButton}>
                <span className={styles.actionIcon}>
                  <StatsUpSquare />
                </span>
                <span className={styles.dropIcon}>
                  <NavArrowDown />
                </span>
              </div>
            </Tooltip>
            {statusFilter.length ? (
              <Tooltip label='Clear filters' className={styles.removeBtn}>
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                <span
                  className={styles.removeBtn_icon}
                  onClick={() => this.handleClearStatusFilters()}
                >
                  <DeleteCircle />
                </span>
              </Tooltip>
            ) : (
              <></>
            )}
          </Popover>
        )}
        {uid === 'processed' ? (
          <Popover
            content={
              <DocumentFilter
                options={errorType}
                appliedFilters={errorFilter}
                onFilterChange={this.handleErrorFilterChange}
                filterTitle={'Select Error Type:'}
              />
            }
            onToggle={() =>
              mixpanelTrackingAllEvents(
                MIXPANEL_EVENTS.documents_tab_click_processed_filter_error,
                { origin: 'My Documents' }
              )
            }
            footer={
              errorFilter.length ? (
                <div className={styles.actionPopover_footer}>
                  <Button
                    size='small'
                    variant='outlined'
                    className={styles.actionPopover_footerBtn}
                    onClick={() => this.handleClearErrorFilterChange()}
                  >
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <></>
              )
            }
            uid='document-type-filter-section'
            className={cx(styles.actionPopover, {
              [styles.actionPopover__active]: errorFilter.length,
            })}
            openClassName={styles.actionPopover__open}
            containerClassName={cx(
              styles.actionPopover_container,
              styles.actionPopover_container__md,
              styles.actionPopover_container__inverted
            )}
          >
            <Tooltip
              label='Filter By Error Type'
              className={styles.iconTooltip}
            >
              <div className={styles.iconDropdownButton}>
                <span className={styles.actionIcon}>
                  <WarningTriangle />
                </span>
                <span className={styles.dropIcon}>
                  <NavArrowDown />
                </span>
              </div>
            </Tooltip>
            {errorFilter.length ? (
              <Tooltip label='Clear filters' className={styles.removeBtn}>
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                <span
                  className={styles.removeBtn_icon}
                  onClick={() => this.handleClearErrorFilterChange()}
                >
                  <DeleteCircle />
                </span>
              </Tooltip>
            ) : (
              <></>
            )}
          </Popover>
        ) : (
          <></>
        )}
        <Popover
          content={
            <FullDatePicker
              onChange={(item) => this.handleDateRangeChange([item.selection])}
              showSelectionPreview={true}
              moveRangeOnFirstSelection={false}
              months={2}
              ranges={dateRange}
              startDate={new Date()}
              direction='horizontal'
            />
          }
          uid='document-type-date-range-section'
          className={cx(styles.actionPopover, {
            [styles.actionPopover__active]: dateSelected,
          })}
          openClassName={styles.actionPopover__open}
          containerClassName={cx(
            styles.actionPopover_container,
            styles.actionPopover_container__xl,
            styles.actionPopover_container__inverted
          )}
          contentClassName={styles.actionPopover_content__date}
        >
          <Tooltip label='Filter By Date' className={styles.iconTooltip}>
            <div className={styles.iconDropdownButton}>
              <span className={styles.actionIcon}>
                <Calendar />
              </span>
              <span className={styles.dropIcon}>
                <NavArrowDown />
              </span>
            </div>
          </Tooltip>
          {dateSelected ? (
            <Tooltip label='Clear filters' className={styles.removeBtn}>
              {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
              <span
                className={styles.removeBtn_icon}
                onClick={() => this.handleClearDateFilters()}
              >
                <DeleteCircle />
              </span>
            </Tooltip>
          ) : (
            <></>
          )}
        </Popover>
        {showUserFilter && (
          <Popover
            content={
              <DocumentFilter
                options={totalUsers}
                appliedFilters={userFilter}
                onFilterChange={this.handleUserFilterChange}
                filterTitle={'Select Uploader:'}
                userFilter={true}
                updateUsers={this.handleUpdateUsers}
                isLoading={this.state.users.length < this.state.userTotal}
              />
            }
            footer={
              userFilter.length ? (
                <div className={styles.actionPopover_footer}>
                  <Button
                    size='small'
                    variant='outlined'
                    className={styles.actionPopover_footerBtn}
                    onClick={() => this.handleClearUserFilters()}
                  >
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <></>
              )
            }
            uid='document-type-filter-section'
            className={cx(styles.actionPopover, {
              [styles.actionPopover__active]: userFilter.length,
            })}
            openClassName={styles.actionPopover__open}
            containerClassName={cx(
              styles.actionPopover_container,
              styles.actionPopover_container__lg,
              styles.actionPopover_container__inverted
            )}
          >
            <Tooltip label='Filter By Uploader' className={styles.iconTooltip}>
              <div className={styles.iconDropdownButton}>
                <span className={styles.actionIcon}>
                  <User />
                </span>
                <span className={styles.dropIcon}>
                  <NavArrowDown />
                </span>
              </div>
            </Tooltip>
            {userFilter.length ? (
              <Tooltip label='Clear filters' className={styles.removeBtn}>
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                <span
                  className={styles.removeBtn_icon}
                  onClick={() => this.handleClearUserFilters()}
                >
                  <DeleteCircle />
                </span>
              </Tooltip>
            ) : (
              <></>
            )}
          </Popover>
        )}
        <div className={styles.ctaContainer}>
          {uid === 'processed' ? (
            <Popover
              content={
                <ChangeTypeDownload onClick={this.handleSelectedDownlaod} />
              }
              uid='document-change-type-section'
              className={cx(styles.actionPopover)}
              containerClassName={cx(
                styles.actionPopover_container,
                styles.actionPopover_container__right
              )}
            >
              <Button
                size='small'
                variant='contained'
                isLoading={this.state.isDownloading}
                icon={<Download />}
                className={cx('UFTooltipDownload')}
              >
                Download
              </Button>
            </Popover>
          ) : (
            <Button
              size='small'
              variant='contained'
              icon={<EyeEmpty />}
              onClick={this.handleReviewBtnClick}
              className={'tt-start_reviewing_all_doc'}
            >
              Start Reviewing
            </Button>
          )}
        </div>
      </>
    );
  };

  renderSelectionsInfo = () => {
    const {
      config: { documentTypes },
    } = this.props;
    const {
      typeFilterd,
      dateRange,
      statusFilter,
      userFilter,
      errorFilter,
      dateSelected,
      users,
    } = this.state;

    const selectionStatus = this.getSelectionLabel();

    if (
      !typeFilterd.length &&
      !dateSelected &&
      !statusFilter.length &&
      !userFilter.length &&
      !errorFilter.length &&
      !selectionStatus
    ) {
      return <div className={styles.selectionsContent} />;
    }

    const uploadableDocumentTypes =
      documentTypes.filter((item) => item.canUpload) || [];

    let totalUser = [];
    users?.forEach((d, index) => {
      let temp = {};
      temp.id = index;
      temp.title = d.fullName;
      temp.value = d.userId;
      totalUser.push(temp);
    });

    return (
      <div className={styles.selectionsContent}>
        {selectionStatus ? (
          <div className={styles.selectionGroup}>
            <span className={styles.selectionLabel}>Selections:</span>
            <div className={styles.selectionList}>
              <Badge
                className={styles.selectionTag}
                title={selectionStatus}
                iconType='close'
                iconDirection='right'
                badgeIconHandler={this.handleSelectionsRemoval}
              />
            </div>
          </div>
        ) : null}
        {dateSelected ? (
          <div className={styles.selectionGroup}>
            <span className={styles.selectionLabel}>Date Range Type:</span>
            <div className={styles.selectionList}>
              <Badge
                className={styles.selectionTag}
                title={`${dateRange[0].startDate.toDateString()} - ${dateRange[0].endDate.toDateString()}`}
                iconType='close'
                iconDirection='right'
                badgeIconHandler={this.handleClearDateFilters}
              />
            </div>
          </div>
        ) : null}
        {typeFilterd.length ? (
          <div className={styles.selectionGroup}>
            <span className={styles.selectionLabel}>Document Type:</span>
            <div className={styles.selectionList}>
              {typeFilterd.map((filter, idx) => {
                const docType = uploadableDocumentTypes.find(
                  (doc) => doc.value === filter
                );
                return (
                  <Badge
                    key={idx}
                    className={styles.selectionTag}
                    title={docType.title}
                    iconType='close'
                    iconDirection='right'
                    badgeIconHandler={() => this.clearIndividualFilter(filter)}
                  />
                );
              })}
            </div>
          </div>
        ) : null}
        {statusFilter.length ? (
          <div className={styles.selectionGroup}>
            <span className={styles.selectionLabel}>Status:</span>
            <div className={styles.selectionList}>
              {statusFilter.map((filter, idx) => {
                const status = statusType.find((itm) => itm.value === filter);
                return (
                  <Badge
                    key={idx}
                    className={styles.selectionTag}
                    title={status.title}
                    iconType='close'
                    iconDirection='right'
                    badgeIconHandler={() =>
                      this.clearIndividualStatusFilter(filter)
                    }
                  />
                );
              })}
            </div>
          </div>
        ) : null}
        {errorFilter.length ? (
          <div className={styles.selectionGroup}>
            <span className={styles.selectionLabel}>Error Type:</span>
            <div className={styles.selectionList}>
              {errorFilter.map((filter, idx) => {
                const status = errorType.find((itm) => itm.value === filter);
                return (
                  <Badge
                    key={idx}
                    className={styles.selectionTag}
                    title={status.title}
                    iconType='close'
                    iconDirection='right'
                    badgeIconHandler={() =>
                      this.clearIndividualErrorFilter(filter)
                    }
                  />
                );
              })}
            </div>
          </div>
        ) : null}
        {userFilter.length ? (
          <div className={styles.selectionGroup}>
            <span className={styles.selectionLabel}>User:</span>
            <div className={styles.selectionList}>
              {userFilter.map((filter, idx) => {
                const user = totalUser.find((itm) => itm.value === filter);
                return (
                  <Badge
                    key={idx}
                    className={styles.selectionTag}
                    title={user?.title}
                    iconType='close'
                    iconDirection='right'
                    badgeIconHandler={() =>
                      this.clearIndividualUserFilter(filter)
                    }
                  />
                );
              })}
            </div>
          </div>
        ) : null}
        <Button variant='text' size='small' onClick={this.handleClearAll}>
          Clear all
        </Button>
      </div>
    );
  };

  getDeleteConfirmationModalText = () => {
    const { deleteConfirmation = {} } = this.state;
    const { total: totalDeleteDoc, folders } = deleteConfirmation;

    const totalCount = totalDeleteDoc || folders || 0;

    const type = totalDeleteDoc ? 'document' : 'folder';

    return (
      <span>
        Are you sure you want to delete{' '}
        {totalCount <= 1 ? `this ${type}` : `these ${totalCount} ${type}s`}?
      </span>
    );
  };

  render() {
    const {
      tab: { title },
    } = this.props;
    const { deleteConfirmation = {}, deleteLoading } = this.state;

    const { typeFilterd, statusFilter, userFilter, errorFilter, dateSelected } =
      this.state;

    const { total: totalDeleteDoc, folders } = deleteConfirmation;

    const selectionStatus = this.getSelectionLabel();

    const isFiltersApplied =
      typeFilterd.length ||
      dateSelected ||
      statusFilter.length ||
      userFilter.length ||
      errorFilter.length ||
      selectionStatus;

    return (
      <>
        <PageMetadata title={title} />
        <div className={styles.filterContainer}>
          <div className={styles.filterContainer__left}>
            {this.renderSelectAllSection()}
            {this.renderSelectionsFilter()}
          </div>
          <div className={styles.filterContainer__right}>
            {this.renderDocumentListFilter()}
          </div>
        </div>
        <div
          className={cx(styles.selectionsContainer, {
            [styles.selectionsContainer__open]: isFiltersApplied,
          })}
        >
          {this.renderSelectionsInfo()}
        </div>
        <DeleteConfirmationModal
          show={totalDeleteDoc || folders}
          onCloseHandler={this.handleCancelConfirmation}
          handleDeleteBtnClick={this.handleSelectedDelete}
          modalTitle='Delete Documents'
          isLoading={deleteLoading}
          modalBody={this.getDeleteConfirmationModalText()}
        />
      </>
    );
  }
}

function mapStateToProp({ app, documents, users }) {
  const { config, user } = app;
  const { selectedFolderData } = documents;

  return {
    user: user,
    config: config,
    globalDocumentCounts: documents.globalDocumentCounts,
    users: users?.usersPage,
    selectedFolderData,
    documents,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
    usersActions: bindActionCreators(usersActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(TabNavbar)
);
