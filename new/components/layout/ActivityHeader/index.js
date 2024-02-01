import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as activityActions } from 'new/redux/activities/actions.js';
import { actions as appActions } from 'new/redux/app/actions.js';
import { actions as documentActions } from 'new/redux/documents/actions.js';
import { actions as usersActions } from 'new/redux/users/actions.js';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { format } from 'date-fns';
import {
  Calendar,
  DeleteCircle,
  Filter,
  Link,
  MoneySquare,
  MultiMacOsWindow,
  NavArrowDown,
  Page,
  User,
} from 'iconoir-react';
import _, { get } from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api/index.js';
import { PageMetadata } from 'new/components/layout/page/index.js';
import { FullDatePicker } from 'new/components/widgets/DateRangePicker/index.js';
import Popover from 'new/components/widgets/popover/index.js';
import * as documentsHelper from 'new/helpers/documents/index.js';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel.js';
import Badge from 'new/ui-elements/Badge';
import Button from 'new/ui-elements/Button/Button.js';
import Tooltip from 'new/ui-elements/Tooltip';
import * as utils from 'new/utils/index.js';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import DocumentFilter from '../DocumentsHeader/components/DocumentFilter/DocumentFilter.js';

import { ActivityType } from './components/ActivityTypeFilter/ActivityType.js';

import styles from './index.scss';

const currentDate = new Date();

let countDateSelection = 0;
class ActivityHeader extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  constructor(props) {
    super(props);
    this.state = {
      userFilter: [],
      activityFilter: [],
      dateRange: [
        {
          startDate: currentDate,
          endDate: new Date(currentDate.setDate(currentDate.getDate())),
          key: 'selection',
        },
      ],
      dateSelected: false,
      modeFilter: [],
      modeFilterOptions: [],
      users: [],
      userOffset: 0,
      userTotal: 0,
    };
  }

  async UNSAFE_componentWillMount() {
    const pageQueryParams = this.getValidPageQueryParams(
      _.get(this.props, 'location.search')
    );
    this.updateParamStateKeys({
      pageQueryParams,
    });

    const response = await api.getFilterDataList();
    const { data = [] } = response.responsePayload || {};
    let filterType = [
      {
        title: 'Document',
        icon: <Page />,
        type: 'document_action',
        uid: 'document',
      },
      {
        title: 'User',
        icon: <User />,
        type: 'user_action',
        uid: 'user',
      },
      {
        title: 'Credit',
        icon: <MoneySquare />,
        type: 'admin_action',
        uid: 'credit',
      },
      {
        title: 'Webhook',
        icon: <Link />,
        type: 'webhook_action',
        uid: 'webhook',
      },
    ];

    const modeFilterType = {
      title: 'Environment',
      icon: <Link />,
      type: 'environment_action',
      uid: 'mode',
    };

    const modifiedFilterData = data.map((item) => {
      return {
        ...item,
        value: item.action,
        title: item.name,
      };
    });

    const modeFilterOptions = {
      ...modeFilterType,
      subType: modifiedFilterData.filter(
        (itm) => itm.category === modeFilterType.type
      ),
    };
    let mFilterData = filterType.map((item) => {
      return {
        ...item,
        subType: modifiedFilterData.filter((itm) => itm.category === item.type),
      };
    });
    this.setState({
      mFilterData,
      modifiedFilterData,
      modeFilterOptions,
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
    const { location, usersActions, activityActions } = this.props;
    const {
      q = '',
      created_date,
      user_id = [],
      action,
    } = utils.getValidPageQueryParams(location.search, {
      q: {
        type: 'string',
        default: '',
      },
      created_date: {
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

    usersActions.usersFetch({
      queryParams: {
        q,
      },
    });

    activityActions.fetchActivityCounts({
      queryParams: {
        q,
        created_date,
        user_id,
        action,
      },
    });

    if (user_id.length) {
      this.setState({ userFilter: user_id });
    }
    if (action.length) {
      this.setState({ activityFilter: action });
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

  componentWillUnmount() {}

  componentDidUpdate(prevProps) {
    const prevLocation = prevProps.location;
    const { location } = this.props;
    const { q, created_date, user_id, action } = utils.getValidPageQueryParams(
      location.search,
      {
        created_date: {
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
      }
    );
    const {
      q: prev_query,
      created_date: prev_created_date,
      user_id: prev_user_id,
      action: prev_action,
    } = utils.getValidPageQueryParams(prevLocation.search, {
      created_date: {
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

    if (created_date.length !== prev_created_date.length) {
      if (!created_date.length) {
        const dateNow = new Date();
        this.setState({
          dateRange: [
            {
              startDate: dateNow,
              endDate: new Date(dateNow.setDate(dateNow.getDate())),
              key: 'selection',
            },
          ],
        });
      }
      this.setState({
        dateSelected: !!created_date.length,
      });
      this.getActivityFilterCount({ date: created_date });
    }

    if (location.pathname !== prevLocation.pathname) {
      this.setState({
        userFilter: [],
        activityFilter: [],
        modeFilter: [],
        dateRange: [
          {
            startDate: currentDate,
            endDate: new Date(currentDate.setDate(currentDate.getDate())),
            key: 'selection',
          },
        ],
        dateSelected: false,
      });
    }
    if (user_id.length !== prev_user_id.length) {
      this.getActivityFilterCount();
    }
    if (action.length !== prev_action.length) {
      this.getActivityFilterCount();
    }
    if (q !== prev_query) {
      this.getActivityFilterCount();
    }
  }

  getActivityFilterCount = ({ date } = {}) => {
    const { activityActions, location } = this.props;
    const {
      q = '',
      created_date,
      user_id = [],
      action,
    } = utils.getValidPageQueryParams(location.search, {
      q: {
        type: 'string',
        default: '',
      },
      created_date: {
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
    activityActions.fetchActivityCounts({
      queryParams: {
        q,
        created_date: date || created_date,
        user_id,
        action,
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
      activityActions,
      tab: { uid },
    } = this.props;
    const pageQueryParams = this.getValidPageQueryParams(
      _.get(this.props, 'location.search')
    );
    let { q = '' } = utils.getValidPageQueryParams(
      _.get(this.props, 'location.search'),
      {
        q: {
          type: 'string',
          default: '',
        },
      }
    );
    activityActions[`${uid}ActivityFetch`]({
      queryParams: {
        q,
        created_date: pageQueryParams.created_date,
        offset: pageQueryParams.offset,
        sort_by: pageQueryParams.sort_by,
        user_id: pageQueryParams.user_id,
      },
    });
  };

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

  handleDateRangeChange = (dateRange) => {
    const {
      user,
      tab: { url, uid, title },
      canSwitchToOldMode,
    } = this.props;
    let [{ startDate, endDate } = {}] = dateRange;
    countDateSelection += 1;
    // eslint-disable-next-line quotes
    startDate = format(startDate, "'gte:'yyyy-MM-dd");
    // eslint-disable-next-line quotes
    endDate = format(endDate, "'lte:'yyyy-MM-dd");
    this.applyParams({ created_date: [startDate, endDate] });
    mixpanel.track(MIXPANEL_EVENTS.all_activity_date_filter_select, {
      origin: title || url,
      'work email': user.email,
      uid: uid,
      value: { startDate: startDate, endDate: endDate },
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    this.setState({ dateRange });
    if (countDateSelection === 2) {
      this.handleClosePopover();
    }
  };

  clearCountDateSelection = () => {
    countDateSelection = 0;
  };

  handleUserFilterChange = (userFilter) => {
    const {
      user,
      tab: { url, uid, title },
      canSwitchToOldMode,
    } = this.props;
    this.applyParams({ user_id: [...userFilter], offset: 0 });
    mixpanel.track(MIXPANEL_EVENTS.all_activity_user_filter_select, {
      origin: title || url,
      'work email': user.email,
      uid: uid,
      value: { ...userFilter },
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    this.setState({ userFilter });
    //this.handleClosePopover();
  };

  singleFilterSubTypeChangeHandler = (activityFilter) => {
    this.applyParams({ action: [...activityFilter], offset: 0 });

    this.setState({ activityFilter });
  };

  handleModeFilterChange = (modeFilter) => {
    this.applyParams({ mode: [...modeFilter], offset: 0 });
    this.setState({ modeFilter });
  };

  handleChangeFilterSubType = (aFilter) => {
    let activityFilterList = [];
    const { activityFilter } = this.state;
    const { checked, value } = aFilter;
    const included = activityFilter.includes(value);
    if (checked && !included) {
      activityFilterList = [...activityFilter, value];
    } else if (!checked && included) {
      const result = activityFilter.filter((e) => e !== value);
      activityFilterList = result;
    }
    this.applyParams({ action: [...activityFilterList], offset: 0 });
    this.setState({ activityFilter: [...activityFilterList] });
    //this.handleClosePopover();
  };

  handleClearUserFilters = () => {
    this.applyParams({ user_id: [] });
    this.setState({ userFilter: [] });
  };

  handleClearActivityFilters = () => {
    this.applyParams({ action: [] });
    this.setState({ activityFilter: [] });
  };

  handleClearDateFilters = () => {
    this.setState({ dateSelected: false });
    this.applyParams({ created_date: [] });
  };

  clearModeFilters = () => {
    this.applyParams({ mode: [] });
    this.setState({ modeFilter: [] });
  };

  handleClearAll = () => {
    const { dateSelected, userFilter, activityFilter, modeFilter } = this.state;
    if (
      dateSelected ||
      userFilter.length ||
      activityFilter.length ||
      modeFilter.length
    ) {
      this.applyParams({
        created_date: [],
        user_id: [],
        action: [],
        modeFilter: [],
      });
      this.setState({
        dateSelected: false,
        userFilter: [],
        activityFilter: [],
        modeFilter: [],
      });
    }
  };

  clearIndividualUserFilter = (filter) => {
    let filtered = this.state.userFilter.filter((value) => value !== filter);
    this.handleUserFilterChange(filtered);
  };

  clearIndividualModeFilter = (filter) => {
    let filtered = this.state.modeFilter.filter((value) => value !== filter);
    this.handleModeFilterChange(filtered);
  };

  clearIndividualActivityFilter = (filter) => {
    let filtered = this.state.activityFilter.filter(
      (value) => value !== filter
    );
    this.singleFilterSubTypeChangeHandler(filtered);
  };

  handleClosePopover() {
    this.clearCountDateSelection();
    const app = document.getElementById('app');
    app && app.click();
  }

  handleBakcToRoot(url) {
    this.props.history.push(url);
  }

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

  render() {
    const {
      tab: { title, uid },
      // users: { users },
    } = this.props;
    const {
      userFilter,
      modeFilter,
      modeFilterOptions,
      dateRange,
      dateSelected,
      mFilterData,
      activityFilter,
      modifiedFilterData,
      users,
    } = this.state;
    let totalUser = [];
    users?.forEach((d, index) => {
      let temp = {};
      temp.id = index;
      temp.title = d.fullName;
      temp.value = d.userId;
      totalUser.push(temp);
    });
    const singleFilterData =
      (mFilterData && mFilterData.find((item) => item.uid === uid)) || {};
    return (
      <>
        <PageMetadata title={title} />

        <div className={styles.filterContainer}>
          <div className={styles.rightbox}>
            {uid === 'all' ? (
              <Popover
                content={
                  <ActivityType
                    activityOptions={mFilterData}
                    uid={uid}
                    isAll={uid === 'all'}
                    activityFilter={activityFilter}
                    handleChangeFilterSubType={this.handleChangeFilterSubType}
                  />
                }
                uid='activity-type-filter-section'
                className={cx(styles.actionPopover, {
                  [styles.actionPopover__active]: activityFilter.length,
                })}
                containerClassName={cx(
                  styles.actionPopover_container,
                  styles.actionPopover_container__xl,
                  styles.actionPopover_container__activity
                )}
                openClassName={styles.openClassName}
                contentClassName={styles.contentActivityFilter}
                titleClassName={styles.titleUser}
              >
                <Tooltip
                  label='Filter By Activity'
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
                {activityFilter.length ? (
                  <Tooltip label='Clear filters' className={styles.removeBtn}>
                    {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
                    <span
                      className={styles.removeBtn_icon}
                      onClick={() => this.handleClearActivityFilters()}
                    >
                      <DeleteCircle />
                    </span>
                  </Tooltip>
                ) : (
                  ''
                )}
              </Popover>
            ) : null}
            {uid !== 'all' ? (
              <Popover
                content={
                  <>
                    <DocumentFilter
                      options={singleFilterData?.subType || []}
                      appliedFilters={activityFilter}
                      onFilterChange={this.singleFilterSubTypeChangeHandler}
                      filterTitle={'Select Activity Filter:'}
                    />
                  </>
                }
                uid='single-activity-type-filter-section'
                className={cx(styles.actionPopover, {
                  [styles.actionPopover__active]: activityFilter.length,
                })}
                openClassName={styles.actionPopover__open}
                containerClassName={cx(
                  styles.actionPopover_container,
                  styles.actionPopover_container__lg,
                  styles.actionPopover_container__inverted
                )}
              >
                <Tooltip
                  label='Filter By Activity'
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
                {activityFilter.length ? (
                  <Tooltip label='Clear filters' className={styles.removeBtn}>
                    {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
                    <span
                      className={styles.removeBtn_icon}
                      onClick={() => this.handleClearActivityFilters()}
                    >
                      <DeleteCircle />
                    </span>
                  </Tooltip>
                ) : (
                  ''
                )}
              </Popover>
            ) : null}
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
                  {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
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

            <Popover
              content={
                <>
                  <DocumentFilter
                    options={totalUser}
                    appliedFilters={userFilter}
                    onFilterChange={this.handleUserFilterChange}
                    filterTitle={'Select User:'}
                    userFilter={true}
                    updateUsers={this.handleUpdateUsers}
                    isLoading={this.state.users.length < this.state.userTotal}
                  />
                </>
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
                  ''
                )
              }
              uid='document-type-user-filter-section'
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
              <Tooltip label='Filter By User' className={styles.iconTooltip}>
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
                  {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
                  <span
                    className={styles.removeBtn_icon}
                    onClick={() => this.handleClearUserFilters()}
                  >
                    <DeleteCircle />
                  </span>
                </Tooltip>
              ) : (
                ''
              )}
            </Popover>

            <Popover
              content={
                <>
                  <DocumentFilter
                    options={modeFilterOptions.subType}
                    appliedFilters={modeFilter}
                    onFilterChange={this.handleModeFilterChange}
                    filterTitle={'Select Mode:'}
                  />
                </>
              }
              footer={
                userFilter.length ? (
                  <div className={styles.actionPopover_footer}>
                    <Button
                      size='small'
                      variant='outlined'
                      className={styles.actionPopover_footerBtn}
                      onClick={() => this.clearModeFilters()}
                    >
                      Clear all filters
                    </Button>
                  </div>
                ) : (
                  ''
                )
              }
              uid='document-type-mode-filter-section'
              className={cx(styles.actionPopover, {
                [styles.actionPopover__active]: modeFilter.length,
              })}
              openClassName={styles.actionPopover__open}
              containerClassName={cx(
                styles.actionPopover_container,
                styles.actionPopover_container__lg,
                styles.actionPopover_container__inverted
              )}
            >
              <Tooltip
                label='Filter By Mode'
                className={cx(styles.iconTooltip, 'mr-4')}
              >
                <div className={styles.iconDropdownButton}>
                  <span className={styles.actionIcon}>
                    <MultiMacOsWindow />
                  </span>
                  <span className={styles.dropIcon}>
                    <NavArrowDown />
                  </span>
                </div>
              </Tooltip>
              {modeFilter.length ? (
                <Tooltip label='Clear filters' className={styles.removeBtn}>
                  {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
                  <span
                    className={styles.removeBtn_icon}
                    onClick={() => this.clearModeFilters()}
                  >
                    <DeleteCircle />
                  </span>
                </Tooltip>
              ) : (
                ''
              )}
            </Popover>
          </div>
        </div>
        {dateSelected ||
        userFilter.length ||
        activityFilter.length ||
        modeFilter.length ? (
          <div className={styles.selectionsContent}>
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
            {activityFilter.length ? (
              <div className={styles.selectionGroup}>
                <span className={styles.selectionLabel}> Activity:</span>
                <div className={styles.selectionList}>
                  <div>
                    {activityFilter.map((filter, idx) => {
                      const action = modifiedFilterData?.find(
                        (item) => item.action === filter
                      );
                      return (
                        <Badge
                          key={idx}
                          title={action?.name}
                          className={styles.selectionTag}
                          iconType='close'
                          iconDirection='right'
                          badgeIconHandler={() =>
                            this.clearIndividualActivityFilter(filter)
                          }
                        ></Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            {modeFilter.length ? (
              <div className={styles.selectionGroup}>
                <span className={styles.selectionLabel}>Environment:</span>
                <div className={styles.selectionList}>
                  {modeFilter.map((filter, idx) => {
                    const mode = modeFilterOptions?.subType?.map((item) => {
                      if (item.action === filter) return item.name;
                    });
                    return (
                      <Badge
                        key={idx}
                        className={styles.selectionTag}
                        title={mode}
                        iconType='close'
                        iconDirection='right'
                        badgeIconHandler={() =>
                          this.clearIndividualModeFilter(filter)
                        }
                      />
                    );
                  })}
                </div>
              </div>
            ) : null}
            <Button
              variant='text'
              size='small'
              onClick={() => this.handleClearAll()}
            >
              Clear All
            </Button>
          </div>
        ) : (
          ''
        )}
      </>
    );
  }
}

function mapStateToProp({ app, documents, users }) {
  const { config, user } = app;
  const { canSwitchToOldMode = true } = config;
  return {
    user: user,
    config: config,
    globalDocumentCounts: documents.globalDocumentCounts,
    users: users?.usersPage,
    canSwitchToOldMode,
    documents,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
    activityActions: bindActionCreators(activityActions, dispatch),
    usersActions: bindActionCreators(usersActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(ActivityHeader)
);
