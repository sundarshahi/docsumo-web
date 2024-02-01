import React, { Component } from 'react';
import { connect } from 'react-redux';
import { matchPath, withRouter } from 'react-router-dom';
import { actions as appActions } from '@redux/app/actions';
import { actions as documentActions } from '@redux/documents/actions';
import { actions as usersActions } from '@redux/users/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import * as api from 'client/api';
import { CheckboxGroup } from 'client/components/widgets/checkbox';
import CustomCheckbox from 'client/components/widgets/CustomCheckbox';
import Popover from 'client/components/widgets/popover';
//import { ReactComponent as RightIcon } from 'images/icons/right-ceret.svg';
import {
  DropIconTooltip,
  HelpTooltip,
  IconTooltip,
} from 'client/components/widgets/tooltip';
import { CHECKBOX_STATES } from 'client/constants';
import * as documentConstants from 'client/constants/document';
import ttConstants from 'client/constants/helpTooltips';
import { MIXPANEL_ORIGINS } from 'client/constants/mixpanel';
import { MIXPANEL_EVENTS } from 'client/thirdParty/mixpanel';
import * as utils from 'client/utils';
import { format } from 'date-fns';
import download from 'downloadjs';
import * as documentsHelper from 'helpers/documents';
import { ReactComponent as DropIcon } from 'images/icons/arrow-dropdown.svg';
import { ReactComponent as TypeIcon } from 'images/icons/changedoc.svg';
import { ReactComponent as CheckIcon } from 'images/icons/check.svg';
import { ReactComponent as CloseIcon } from 'images/icons/clear.svg';
import { ReactComponent as DatePickerIcon } from 'images/icons/DatePicker.svg';
import { ReactComponent as DeleteIcon } from 'images/icons/deletebin.svg';
import { ReactComponent as DownloadFileIcon } from 'images/icons/download.svg';
import { ReactComponent as EditIcon } from 'images/icons/edit.svg';
import { ReactComponent as DownloadIcon } from 'images/icons/filedownload.svg';
import { ReactComponent as FilterIcon } from 'images/icons/filter-flat.svg';
import { ReactComponent as RefreshIcon } from 'images/icons/retry.svg';
//import { PageClickTitle } from 'components/widgets/typography';
//import TitledDropDown from 'client/components/widgets/TitledDropDown';
import { ReactComponent as ReviewIcon } from 'images/icons/review.svg';
import { ReactComponent as UserIcon } from 'images/icons/selectuser.svg';
import { ReactComponent as StatusIcon } from 'images/icons/sfilter.svg';
import { ReactComponent as ErrorFilterIcon } from 'images/icons/sfilter.svg';
import { ReactComponent as UserFilterIcon } from 'images/icons/user-filter.svg';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import { PageHeader, PageMetadata } from 'components/layout/page';
import ConfirmationModal from 'components/shared/FiledConfirmationModal';
import { Button } from 'components/widgets/buttons';
import { FullDatePicker } from 'components/widgets/DateRangePicker';

import ChangeTypeDD from './ChangeTypeDD';
import ChangeTypeDownload from './ChangeTypeDownload';
import ChangeUserType from './ChangeUserType';

import styles from './index.scss';

const currentDate = new Date();
var countDateSelection = 0;

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
          //endDate: new Date(currentDate.setDate(currentDate.getDate() + 7)),
          key: 'selection',
        },
      ],
      dateSelected: false,
      deleteConfirmation: {},
      isDownloading: false,
      deleteLoading: false,
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
      if (!nextPageQueryParams.q) {
        this.updateParamStateKeys({
          pageQueryParams: nextPageQueryParams,
        });
      } else {
        this.updateParamStateKeys({
          pageQueryParams: nextPageQueryParams,
        });
      }
    }
  }

  componentDidMount() {
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
              //endDate: new Date(dateNow.setDate(dateNow.getDate() + 7)),
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
    });
  };

  handleReviewBtnClick = () => {
    const { user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.start_review_doc, {
      origin: 'My Documents',
      'work email': user.email,
      version: 'old',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    this.startReviewButton();
  };

  handleDownloadBtnClick = async (type) => {
    const {
      tab: { uid },
      appActions,
      documentActions,
      user,
      history: {
        location: { pathname },
      },
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config;

    this.handleClosePopover();
    appActions.setToast({
      title: 'Downloading...',
      timeout: 3,
    });
    const result = this.getByfurcatedList();
    const { folder_ids, doc_ids } = result;
    if (folder_ids.length && doc_ids.length) {
      appActions.setToast({
        title: 'Combination of file and folder cannot be downloaded.',
        timeout: 4,
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
        version: 'old',
        canSwitchUIVersion: canSwitchToOldMode,
      });
    } catch (e) {
      // Do nothing
      const { responsePayload: { error = '', message = '' } = {}, statusCode } =
        e || {};
      appActions.setToast({
        title: statusCode === 403 ? accessDenied : message,
        redirectLink: !!(error === 'DOWNLOAD_TIMEOUT'), //addition of background download link
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
    }
  };

  handleCheckboxChange = (data) => {
    const {
      tab: { uid },
      documentActions,
    } = this.props;
    documentActions.setTypWiseSelectionALL({
      uid,
      checked: data.checked,
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
      timeout: 3,
    });
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
      version: 'old',
      canSwitchUIVersion: canSwitchToOldMode,
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
        : 'An error occured while assigning user.';
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
    mixpanel.track(MIXPANEL_EVENTS.delete_mydoc, {
      origin: 'My Documents',
      'work email': user.email,
      version: 'old',
      canSwitchUIVersion: canSwitchToOldMode,
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
      appActions.setToast({
        title: 'Documents Deleted',
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
        : 'An error occured while deleting the documents.';
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
        timeout: 3,
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
        version: 'old',
        canSwitchUIVersion: canSwitchToOldMode,
      });
    } catch (e) {
      // Do nothing
      const { responsePayload: { message = '' } = {} } = e || {};
      appActions.setToast({
        title: message,
        rootClassName: styles.toastClass,
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
      <CustomCheckbox
        name='selectAll'
        className='UFTooltipSelectFiles'
        status={checkboxStatus}
        onChange={this.handleCheckboxChange}
      />
    );
  };

  render() {
    const {
      tab: { title, uid },
      config: { documentTypes },
      documents = [],
      users: { users },
      user,
    } = this.props;
    const {
      typeFilterd,
      statusFilter,
      userFilter,
      errorFilter,
      dateRange,
      dateSelected,
      deleteConfirmation = {},
      deleteLoading,
    } = this.state;
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
    const {
      selectedAll,
      slectedList = [],
      documentIds,
    } = documents[`${uid}DocumentsPage`] ?? {};
    //const  { selectedFolderData = {} } = documents;
    const { total: totalDeleteDoc, folders } = deleteConfirmation;
    const isMemberUser = user.role === 'member';
    const showUserFilter = !isMemberUser;

    const selectionStatus = this.getSelectionLabel();

    return (
      <>
        <PageMetadata title={title} />

        <PageHeader>
          <div className={styles.titlebox}>
            {this.renderSelectAllSection()}
            {slectedList.length ? (
              <div className={styles.action_box}>
                <Popover
                  content={
                    <ChangeTypeDownload
                      className={styles.downloadContent}
                      onClick={this.handleDownloadBtnClick}
                    />
                  }
                  uid='document-change-type-section'
                  //className={cx(styles.action_icon)}
                  className={cx(styles.action_drop_icon)}
                  openClassName={styles.openDropClass}
                  containerClassName={styles.containerClassName}
                  contentClassName={styles.contentClassName}
                  titleClassName={styles.titleClassName}
                >
                  <DropIconTooltip
                    name='download'
                    label='Download'
                    icon={<DownloadIcon />}
                    dropicon={<DropIcon />}
                  />
                </Popover>

                <Popover
                  content={
                    <ChangeUserType
                      options={users}
                      onClick={this.handleChangeUser}
                    />
                  }
                  uid='document-change-user-section'
                  className={cx(styles.action_drop_icon)}
                  //className={cx(styles.action_icon)}
                  title='Assign Doc To:'
                  openClassName={styles.openDropClass}
                  containerClassName={cx(
                    styles.containerClassName,
                    styles.userTypeContainer
                  )}
                  contentClassName={styles.contentClassName}
                  titleClassName={styles.titleClassName}
                >
                  <DropIconTooltip
                    name='changeType'
                    label='Assign User'
                    icon={<UserIcon />}
                    dropicon={<DropIcon />}
                  />
                </Popover>

                <Popover
                  content={
                    <ChangeTypeDD
                      options={uploadableDocumentTypes}
                      onClick={this.handleSelectedChangeType}
                    />
                  }
                  uid='document-change-type-section'
                  //className={cx(styles.action_icon)}
                  className={cx(styles.action_drop_icon)}
                  title='Change Doc Type To:'
                  openClassName={styles.openDropClass}
                  containerClassName={cx(
                    styles.containerClassName,
                    styles.docTypeContainer
                  )}
                  contentClassName={styles.contentClassName}
                  titleClassName={styles.titleClassName}
                >
                  <DropIconTooltip
                    name='changeType'
                    label='Change Type'
                    icon={<TypeIcon />}
                    dropicon={<DropIcon />}
                  />
                </Popover>
                <IconTooltip
                  name='delete'
                  label='Delete'
                  icon={<DeleteIcon />}
                  className={cx(styles.action_icon)}
                  onClick={this.handleGetConfirmation}
                />
                <IconTooltip
                  name='retryIcon'
                  label='Retry'
                  icon={<RefreshIcon />}
                  className={cx(styles.action_icon)}
                  onClick={this.handleSelectedRefresh}
                />
                {slectedList.length === 1 ? (
                  <IconTooltip
                    name='editIcon'
                    label='Edit name'
                    icon={<EditIcon />}
                    className={cx(styles.action_icon)}
                    onClick={this.handleSelectedEditName}
                  />
                ) : null}
              </div>
            ) : // <div className={styles.sub_titlebox}>
            //     <PageClickTitle className={styles.title} onClick={() => this.handleBakcToRoot(url)}>{title}</PageClickTitle>

            //     { selectedFolderData.folderName && (
            //     <>
            //     <div className={styles.rightArrow}>
            //         <RightIcon />
            //     </div>
            //     <TitledDropDown onAction={(type) => this.handleFolderAction(type, selectedFolderData)}>
            //         {selectedFolderData.folderName}
            //     </TitledDropDown>
            //     </>
            //     )}
            // </div>
            null}
          </div>
          <div className={styles.rightbox}>
            <Popover
              content={
                <>
                  <CheckboxGroup
                    options={uploadableDocumentTypes}
                    checked={typeFilterd}
                    onChange={this.handleFilterChange}
                    labelClassName={styles.typefilterlabel}
                  />
                </>
              }
              footer={
                typeFilterd.length ? (
                  <button
                    className={styles.clearBtn}
                    onClick={() => this.handleClearFilters()}
                  >
                    {' '}
                    Clear all filters{' '}
                  </button>
                ) : (
                  ''
                )
              }
              uid='document-type-filter-section'
              className={cx(styles.action_icon, {
                [styles.active]: typeFilterd.length,
              })}
              title='Select Doc Type:'
              openClassName={styles.openClassName}
              containerClassName={styles.filterContainerClassName}
              contentClassName={styles.filterContentClassName}
              titleClassName={styles.filterTitleClassName}
            >
              <IconTooltip
                name='filter'
                label='Doc Type Filter'
                icon={<FilterIcon />}
              />
              {typeFilterd.length ? (
                <button
                  className={styles.badge}
                  onClick={() => this.handleClearFilters()}
                  title='Clear Filters'
                >
                  <CloseIcon className={styles.badgeIcon} />
                </button>
              ) : (
                ''
              )}
            </Popover>
            {uid === 'all' ? (
              <Popover
                content={
                  <>
                    <CheckboxGroup
                      options={statusType}
                      checked={statusFilter}
                      onChange={this.handleStatusFilterChange}
                      labelClassName={styles.typefilterlabel}
                    />
                  </>
                }
                footer={
                  statusFilter.length ? (
                    <button
                      className={styles.clearBtn}
                      onClick={() => this.handleClearStatusFilters()}
                    >
                      {' '}
                      Clear all filters{' '}
                    </button>
                  ) : (
                    ''
                  )
                }
                uid='document-type-filter-section'
                className={cx(styles.action_icon, {
                  [styles.active]: statusFilter.length,
                })}
                title='Select Status Type:'
                openClassName={styles.openClassName}
                containerClassName={styles.filterContainerClassName}
                contentClassName={styles.filterContentClassName}
                titleClassName={styles.filterTitleClassName}
              >
                <IconTooltip
                  name='filter'
                  label='Status Filter'
                  icon={<StatusIcon />}
                />
                {statusFilter.length ? (
                  <button
                    className={styles.badge}
                    onClick={() => this.handleClearStatusFilters()}
                    title='Clear Filters'
                  >
                    <CloseIcon className={styles.badgeIcon} />
                  </button>
                ) : (
                  ''
                )}
              </Popover>
            ) : (
              ''
            )}

            {uid === 'processed' ? (
              <Popover
                content={
                  <>
                    <CheckboxGroup
                      options={errorType}
                      checked={errorFilter}
                      onChange={this.handleErrorFilterChange}
                      labelClassName={styles.typefilterlabel}
                    />
                  </>
                }
                footer={
                  errorFilter.length ? (
                    <button
                      className={styles.clearBtn}
                      onClick={() => this.handleClearErrorFilterChange()}
                    >
                      {' '}
                      Clear all filters{' '}
                    </button>
                  ) : (
                    ''
                  )
                }
                uid='document-type-filter-section'
                className={cx(styles.action_icon, {
                  [styles.active]: statusFilter.length,
                })}
                title='Select Error Type:'
                openClassName={styles.openClassName}
                containerClassName={styles.filterContainerClassName}
                contentClassName={styles.filterContentClassName}
                titleClassName={styles.filterTitleClassName}
              >
                <IconTooltip
                  name='filter'
                  label='Error Filter'
                  icon={<ErrorFilterIcon />}
                  className={styles.errorFilter}
                />
                {errorFilter.length ? (
                  <button
                    className={styles.badge}
                    onClick={() => this.handleClearErrorFilterChange()}
                    title='Clear Filters'
                  >
                    <CloseIcon className={styles.badgeIcon} />
                  </button>
                ) : (
                  ''
                )}
              </Popover>
            ) : (
              ''
            )}

            <Popover
              content={
                <FullDatePicker
                  onChange={(item) =>
                    this.handleDateRangeChange([item.selection])
                  }
                  showSelectionPreview={true}
                  moveRangeOnFirstSelection={false}
                  months={2}
                  ranges={dateRange}
                  startDate={new Date()}
                  direction='horizontal'
                />
              }
              uid='document-type-date-range-section'
              className={cx(styles.action_icon, {
                [styles.active]: dateSelected,
              })}
              openClassName={styles.openClassName}
              containerClassName={styles.containerClassName}
              contentClassName={styles.dateContentClassName}
              widepop={true}
              openDatePop={this.clearCountDateSelection}
            >
              <IconTooltip
                name='dateRange'
                label='Date Added Filter'
                icon={<DatePickerIcon />}
              />
              {dateSelected ? (
                <button
                  className={styles.badge}
                  onClick={() => this.handleClearDateFilters()}
                  title='Clear Filters'
                >
                  <CloseIcon className={styles.badgeIcon} />
                </button>
              ) : (
                ''
              )}
            </Popover>

            {showUserFilter && (
              <Popover
                content={
                  <>
                    <CheckboxGroup
                      options={totalUser}
                      checked={userFilter}
                      onChange={this.handleUserFilterChange}
                      labelClassName={styles.typefilterlabel}
                    />
                  </>
                }
                footer={
                  userFilter.length ? (
                    <button
                      className={styles.clearBtn}
                      onClick={() => this.handleClearUserFilters()}
                    >
                      {' '}
                      Clear all filters{' '}
                    </button>
                  ) : (
                    ''
                  )
                }
                uid='document-type-filter-section'
                className={cx(styles.action_icon, {
                  [styles.active]: userFilter.length,
                })}
                title='Select User:'
                openClassName={styles.openClassName}
                containerClassName={styles.filterContainerClassName}
                contentClassName={styles.filterContentClassName}
                titleClassName={styles.filterTitleClassName}
              >
                <IconTooltip
                  name='filter'
                  className={styles.action_ficon}
                  label='Uploaded By Filter'
                  icon={<UserFilterIcon />}
                />
                {userFilter.length ? (
                  <button
                    className={styles.badge}
                    onClick={() => this.handleClearUserFilters()}
                    title='Clear Filters'
                  >
                    <CloseIcon className={styles.badgeIcon} />
                  </button>
                ) : (
                  ''
                )}
              </Popover>
            )}

            <HelpTooltip
              id={ttConstants.TT_ALL_DOC_REVIEWING_ALL}
              onNext={this.handleReviewBtnClick}
            >
              {uid === 'processed' ? (
                <Popover
                  content={
                    <ChangeTypeDownload
                      className={styles.downloadContent}
                      onClick={this.handleSelectedDownlaod}
                    />
                  }
                  uid='document-change-type-section'
                  //className={cx(styles.action_icon)}
                  className={cx(styles.action_drop_icon)}
                  openClassName={styles.openDropClass}
                  containerClassName={styles.containerClassName}
                  contentClassName={styles.contentClassName}
                  titleClassName={styles.titleClassName}
                >
                  <HelpTooltip id={ttConstants.TT_APPROVED_DOWNLOAD_ALL}>
                    <Button
                      isLoading={this.state.isDownloading}
                      iconLeft={DownloadFileIcon}
                      className={cx('UFTooltipDownload')}
                    >
                      Download
                    </Button>
                  </HelpTooltip>
                </Popover>
              ) : (
                <Button
                  iconLeft={ReviewIcon}
                  onClick={this.handleReviewBtnClick}
                  className={ttConstants.TT_ALL_DOC_REVIEWING_ALL}
                >
                  Start Reviewing
                </Button>
              )}
            </HelpTooltip>
          </div>
          {totalDeleteDoc || folders ? (
            <ConfirmationModal
              title={'Delete documents'}
              bodyText={`Are you sure you want to delete ${
                totalDeleteDoc || folders
              } ${totalDeleteDoc ? 'document' : 'folder'}?`}
              proceedActionText='Delete'
              processIcon={CheckIcon}
              cancelIcon={CloseIcon}
              cancelActionText='Cancel'
              onProceedActionBtnClick={this.handleSelectedDelete}
              onCancelActionBtnClick={this.handleCancelConfirmation}
              onCloseBtnClick={this.handleCancelConfirmation}
              processingBtn={deleteLoading}
            />
          ) : (
            ''
          )}
        </PageHeader>
        {typeFilterd.length ||
        dateSelected ||
        statusFilter.length ||
        userFilter.length ||
        errorFilter.length ||
        selectionStatus ? (
          <div className={styles.filterStat}>
            <div className={styles.text}>
              {selectionStatus ? (
                <div>
                  Selections:
                  <span className={styles.inputValue}>
                    {selectionStatus}
                    <button
                      className={styles.badge}
                      onClick={() => this.handleSelectionsRemoval()}
                      title='Clear Selections'
                    >
                      <CloseIcon className={styles.badgeIcon} />
                    </button>
                  </span>
                </div>
              ) : null}
              {dateSelected ? (
                <div>
                  Date Range Type:
                  <span className={styles.inputValue}>
                    {dateRange[0].startDate.toDateString()} -{' '}
                    {dateRange[0].endDate.toDateString()}
                    <button
                      className={styles.badge}
                      onClick={() => this.handleClearDateFilters()}
                      title='Clear Filters'
                    >
                      <CloseIcon className={styles.badgeIcon} />
                    </button>
                  </span>
                </div>
              ) : null}
              {typeFilterd.length ? (
                <div>
                  Document Type:
                  {typeFilterd.map((filter, idx) => (
                    <span className={styles.inputValue} key={idx}>
                      {uploadableDocumentTypes.map((docType) => {
                        if (docType.value === filter) return docType.title;
                      })}
                      <button
                        className={styles.badge}
                        onClick={() => this.clearIndividualFilter(filter)}
                        title='Clear Filters'
                      >
                        <CloseIcon className={styles.badgeIcon} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
              {statusFilter.length ? (
                <div>
                  Status:
                  {statusFilter.map((filter, idx) => (
                    <span className={styles.inputValue} key={idx}>
                      {statusType.map((type) => {
                        if (type.value === filter) return type.title;
                      })}
                      <button
                        className={styles.badge}
                        onClick={() => this.clearIndividualStatusFilter(filter)}
                        title='Clear Filters'
                      >
                        <CloseIcon className={styles.badgeIcon} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
              {errorFilter.length ? (
                <div>
                  Error Type:
                  {errorFilter.map((filter, idx) => (
                    <span className={styles.inputValue} key={idx}>
                      {errorType.map((type) => {
                        if (type.value === filter) return type.title;
                      })}
                      <button
                        className={styles.badge}
                        onClick={() => this.clearIndividualErrorFilter(filter)}
                        title='Clear Filters'
                      >
                        <CloseIcon className={styles.badgeIcon} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
              {userFilter.length ? (
                <div>
                  User:
                  {userFilter.map((filter, idx) => (
                    <span className={styles.inputValue} key={idx}>
                      {totalUser.map((user) => {
                        if (user.value === filter) return user.title;
                      })}
                      <button
                        className={styles.badge}
                        onClick={() => this.clearIndividualUserFilter(filter)}
                        title='Clear Filters'
                      >
                        <CloseIcon className={styles.badgeIcon} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
              <button
                className={styles.clearAll}
                onClick={() => this.handleClearAll()}
                title='Clear All'
              >
                Clear All
              </button>
            </div>
          </div>
        ) : null}
      </>
    );
  }
}

function mapStateToProp({ app, documents, users }) {
  const { config, user } = app;
  return {
    user: user,
    config: config,
    globalDocumentCounts: documents.globalDocumentCounts,
    users: users?.usersPage,

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
