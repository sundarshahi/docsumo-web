import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as activityActions } from '@redux/activities/actions';
import { actions as appActions } from '@redux/app/actions';
import { actions as documentActions } from '@redux/documents/actions';
import { actions as usersActions } from '@redux/users/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import * as api from 'client/api';
import { CheckboxGroup } from 'client/components/widgets/checkbox';
import Popover from 'client/components/widgets/popover';
import { IconTooltip } from 'client/components/widgets/tooltip';
import { MIXPANEL_EVENTS } from 'client/thirdParty/mixpanel';
import * as utils from 'client/utils';
import { format } from 'date-fns';
import * as documentsHelper from 'helpers/documents';
import { ReactComponent as CloseIcon } from 'images/icons/clear.svg';
import { ReactComponent as CreditIcon } from 'images/icons/credit-activity.svg';
import { ReactComponent as DatePickerIcon } from 'images/icons/DatePicker.svg';
import { ReactComponent as DocumentIcon } from 'images/icons/document-activity.svg';
import { ReactComponent as EnvironmentIcon } from 'images/icons/environment.svg';
import { ReactComponent as FilterIcon } from 'images/icons/filter-flat.svg';
import { ReactComponent as UserIcon } from 'images/icons/user-activity.svg';
import { ReactComponent as UserFilterIcon } from 'images/icons/user-filter.svg';
import { ReactComponent as WebhookIcon } from 'images/icons/webhook.svg';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import { PageHeader, PageMetadata } from 'components/layout/page';
import { FullDatePicker } from 'components/widgets/DateRangePicker';

import { ActivityType } from './components/ActivityTypeFilter/ActivityType.js';

import styles from './index.scss';

const currentDate = new Date();

class ActivityHeader extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  constructor(props) {
    super(props);
    this.state = {
      userFilter: [],
      activityFilter: [],
      modeFilter: [],
      modeFilterData: [],
      dateRange: [
        {
          startDate: currentDate,
          endDate: new Date(currentDate.setDate(currentDate.getDate() + 7)),
          key: 'selection',
        },
      ],
      dateSelected: false,
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
    let actionFilterType = [
      {
        title: 'Document',
        icon: <DocumentIcon />,
        type: 'document_action',
        uid: 'document',
      },
      {
        title: 'User',
        icon: <UserIcon />,
        type: 'user_action',
        uid: 'user',
      },
      {
        title: 'Credit',
        icon: <CreditIcon />,
        type: 'admin_action',
        uid: 'credit',
      },
      {
        title: 'Webhook',
        icon: <WebhookIcon />,
        type: 'webhook_action',
        uid: 'webhook',
      },
    ];

    const modeFilterType = {
      title: 'Environment',
      icon: <WebhookIcon />,
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

    const modeFilterData = {
      ...modeFilterType,
      subType: modifiedFilterData.filter(
        (itm) => itm.category === modeFilterType.type
      ),
    };
    let mFilterData = actionFilterType.map((item) => {
      return {
        ...item,
        subType: modifiedFilterData.filter((itm) => itm.category === item.type),
      };
    });
    this.setState({
      mFilterData,
      modifiedFilterData,
      modeFilterData,
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
    const { location, usersActions, activityActions } = this.props;
    const {
      q = '',
      created_date,
      user_id = [],
      action,
      mode,
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
      mode: {
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
        mode,
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
  }

  componentWillUnmount() {}

  componentDidUpdate(prevProps) {
    const prevLocation = prevProps.location;
    const { location } = this.props;
    const { q, created_date, user_id, action, mode } =
      utils.getValidPageQueryParams(location.search, {
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
        mode: {
          multiple: true,
          default: [],
        },
      });
    const {
      q: prev_query,
      created_date: prev_created_date,
      user_id: prev_user_id,
      action: prev_action,
      mode: prev_mode,
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
      mode: {
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
              endDate: new Date(dateNow.setDate(dateNow.getDate() + 7)),
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
            endDate: new Date(currentDate.setDate(currentDate.getDate() + 7)),
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
    if (mode !== prev_mode) {
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
      mode,
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
      mode: {
        multiple: true,
        default: [],
      },
    });
    activityActions.fetchActivityCounts({
      queryParams: {
        q,
        created_date: date ? date : created_date,
        user_id,
        action,
        mode,
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
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config;

    let [{ startDate, endDate } = {}] = dateRange;
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
      version: 'old',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    this.setState({ dateRange });
    this.handleClosePopover();
  };

  handleUserFilterChange = (userFilter) => {
    const {
      user,
      tab: { url, uid, title },
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config;

    this.applyParams({ user_id: [...userFilter], offset: 0 });
    mixpanel.track(MIXPANEL_EVENTS.all_activity_user_filter_select, {
      origin: title || url,
      'work email': user.email,
      uid: uid,
      value: { ...userFilter },
      version: 'old',
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
    this.setState({ modeFilter: [...modeFilter] });
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

  handleClearModeFilters = () => {
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
    const app = document.getElementById('app');
    app && app.click();
  }

  handleBakcToRoot(url) {
    this.props.history.push(url);
  }

  render() {
    const {
      tab: { title, uid },
      users: { users },
    } = this.props;
    const {
      userFilter,
      modeFilter,
      modeFilterData,
      dateRange,
      dateSelected,
      mFilterData,
      activityFilter,
      modifiedFilterData,
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

        <PageHeader className={styles.root}>
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
                className={cx(styles.action_icon, {
                  [styles.active]: activityFilter.length,
                })}
                containerClassName={styles.containerActivityFilter}
                openClassName={styles.openClassName}
                contentClassName={styles.contentActivityFilter}
                titleClassName={styles.titleUser}
                widepop={true}
              >
                <IconTooltip
                  name='filter'
                  label='Filter By Activity'
                  icon={<FilterIcon />}
                />
                {activityFilter.length ? (
                  <button
                    className={styles.badge}
                    onClick={() => this.handleClearActivityFilters()}
                    title='Clear Filters'
                  >
                    <CloseIcon className={styles.badgeIcon} />
                  </button>
                ) : (
                  ''
                )}
              </Popover>
            ) : null}
            {uid !== 'all' ? (
              <Popover
                content={
                  <>
                    <CheckboxGroup
                      options={
                        (singleFilterData && singleFilterData.subType) || []
                      }
                      checked={activityFilter}
                      onChange={this.singleFilterSubTypeChangeHandler}
                      labelClassName={styles.typefilterlabel}
                    />
                  </>
                }
                uid='single-activity-type-filter-section'
                className={cx(styles.action_icon, {
                  [styles.active]: activityFilter.length,
                })}
                containerClassName={styles.containerActivitySingleFilter}
                title='Select Activity Filter:'
                openClassName={styles.openClassName}
                contentClassName={styles.contentActivitySingleFilter}
                titleClassName={styles.titleUser}
                widepop={true}
              >
                <IconTooltip
                  name='filter'
                  label='Filter By Activity'
                  icon={<FilterIcon />}
                />
                {activityFilter.length ? (
                  <button
                    className={styles.badge}
                    onClick={() => this.handleClearActivityFilters()}
                    title='Clear Filters'
                  >
                    <CloseIcon className={styles.badgeIcon} />
                  </button>
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
              className={cx(styles.action_icon, {
                [styles.active]: dateSelected,
              })}
              openClassName={styles.openClassName}
              containerClassName={styles.containerClassName}
              contentClassName={styles.dateContentClassName}
              widepop={true}
            >
              <IconTooltip
                name='dateRange'
                label='Filter By Date'
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
                  <button onClick={() => this.handleClearUserFilters()}>
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
              containerClassName={cx(styles.containerUser)}
              title='Select User:'
              openClassName={styles.openClassName}
              contentClassName={styles.contentUser}
              titleClassName={styles.titleUser}
            >
              <IconTooltip
                name='filter'
                className={styles.action_ficon}
                label='Filter By User'
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
            <Popover
              content={
                <>
                  <CheckboxGroup
                    options={modeFilterData.subType}
                    checked={modeFilter}
                    onChange={this.handleModeFilterChange}
                    labelClassName={styles.typefilterlabel}
                  />
                </>
              }
              footer={
                modeFilter.length ? (
                  <button onClick={this.handleClearModeFilters}>
                    Clear all filters
                  </button>
                ) : (
                  ''
                )
              }
              uid='mode-filter-section'
              className={cx(styles.action_icon, {
                [styles.active]: modeFilter.length,
              })}
              containerClassName={cx(styles.containerUser)}
              title='Select Environment:'
              openClassName={styles.openClassName}
              contentClassName={styles.contentUser}
              titleClassName={styles.titleUser}
            >
              <IconTooltip
                name='filter'
                className={styles.mode_ficon}
                label='Filter By Environment'
                icon={<EnvironmentIcon />}
              />
              {modeFilter.length ? (
                <button
                  className={styles.badge}
                  onClick={this.handleClearModeFilters}
                  title='Clear Filters'
                >
                  <CloseIcon className={styles.badgeIcon} />
                </button>
              ) : (
                ''
              )}
            </Popover>
          </div>
        </PageHeader>
        {dateSelected ||
        userFilter.length ||
        activityFilter.length ||
        modeFilter.length ? (
          <div className={styles.filterStat}>
            <div className={styles.text}>
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
              {activityFilter.length ? (
                <div>
                  Activity:
                  {activityFilter.map((filter, idx) => (
                    <span className={styles.inputValue} key={idx}>
                      {modifiedFilterData &&
                        modifiedFilterData.map((item) => {
                          if (item.action === filter) return item.name;
                        })}
                      <button
                        className={styles.badge}
                        onClick={() =>
                          this.clearIndividualActivityFilter(filter)
                        }
                        title='Clear Filters'
                      >
                        <CloseIcon className={styles.badgeIcon} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
              {modeFilter.length ? (
                <div>
                  Environment:
                  {modeFilter.map((filter, idx) => (
                    <span className={styles.inputValue} key={idx}>
                      {modeFilterData?.subType?.map((item) => {
                        if (item.action === filter) return item.name;
                      })}
                      <button
                        className={styles.badge}
                        onClick={() => this.clearIndividualModeFilter(filter)}
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
    activityActions: bindActionCreators(activityActions, dispatch),
    usersActions: bindActionCreators(usersActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(ActivityHeader)
);
