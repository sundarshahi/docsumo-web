import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { addDays, format } from 'date-fns';
import { differenceInDays } from 'date-fns';
import {
  Calendar,
  Cancel,
  Check,
  DeleteCircle,
  DoubleCheck,
  Download,
  EyeEmpty,
  NavArrowDown,
  PcCheck,
  RightRoundArrow,
  SkipNext,
  UploadSquare,
  WarningTriangle,
} from 'iconoir-react';
import _ from 'lodash';
import * as api from 'new/api';
import { FullDatePicker } from 'new/components/widgets/DateRangePicker/index.js';
import Popover from 'new/components/widgets/popover';
import routes from 'new/constants/routes';
import Button from 'new/ui-elements/Button/Button';
import { Dropdown } from 'new/ui-elements/Dropdown/Dropdown';
import Tooltip from 'new/ui-elements/Tooltip';
import { defaults } from 'react-chartjs-2';
import { defaultStaticRanges } from 'react-date-range';

import AverageGraph from './components/AverageGraph/AverageGraph';
import AverageTimeCard from './components/AverageTimeCard/AverageTimeCard';
import NumberCard from './components/NumberCard/NumberCard';
import ProgressAccuracy from './components/ProgressAccuracy/ProgressAccuracy';
import TableChart from './components/TableChart/TableChart';
import UsageGraph from './components/UsageGraph/UsageGraph';

import styles from './index.scss';

defaults.global.defaultFontFamily = 'inter';
defaults.global.defaultFontColor = 'rgb(17, 24, 39)';
defaults.global.defaultFontWeight = '400';
const THIS_MONTH = 'This Month';

const newDefaultStaticRanges = defaultStaticRanges.filter(
  (item) => item.label !== THIS_MONTH
);

let countDateSelection = 0;
class AnalyticOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      analyticsData: {
        accuracy: [],
        averageAccuracy: null,
        counts: {},
        averageTimePerDoc: null,
        averageApiTimePerDoc: {},
        averageTurnaroundTime: {},
        averageCorrection: {},
        usage: {},
      },
      docTypeOption: null,
      isDownloading: false,
      dateRange: [
        {
          startDate: addDays(new Date(), -7),
          endDate: new Date(),
          key: 'selection',
        },
      ],
      dateSelected: true,
      currentDate: new Date(),
    };
  }

  componentDidMount() {
    // Listen to Navigation: Back
    window.addEventListener('popstate', this.closeAnalyticsOnNavigation);
  }

  closeAnalyticsOnNavigation = () => {
    const { documentActions, analyticsDocument } = this.props;

    if (analyticsDocument) {
      documentActions.hideAnalytics({
        docType: analyticsDocument,
      });
    }
  };

  componentDidUpdate() {
    window.onpopstate = () => {
      this.handleCloseBtnClick();
      this.props.history.push(routes.ROOT);
    };
  }

  UNSAFE_componentWillMount() {
    const {
      docConfig: { documentTypes },
    } = this.props;
    const documentType = documentTypes.filter(
      (item) => item.canUpload === true
    );
    this.setState({
      docTypeOption: documentType,
    });
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { analyticsData } = nextProps;
    if (this.props !== nextProps) {
      if (analyticsData) {
        this.setState({
          analyticsData,
        });
      }
    }
  }

  changeAnalyticsType = ({ value }) => {
    const { documentActions, analyticsDocument } = this.props;
    documentActions.newAnalytics({
      docType: analyticsDocument,
      type: value,
    });
  };

  changeAnalyticsDocType = ({ value, id }) => {
    const { documentActions, config } = this.props;
    const { dateRange } = this.state;
    let [{ startDate, endDate } = {}] = dateRange;
    documentActions.showAnalytics({
      docType: value,
      config,
      docId: id,
      from: format(new Date(startDate), 'yyyy-MM-dd'),
      to: format(new Date(endDate), 'yyyy-MM-dd'),
    });
  };
  handleClosePopover() {
    this.clearCountDateSelection();
    const app = document.getElementById('app');
    app && app.click();
  }

  handleDownloadBtnClick = async () => {
    const { appActions } = this.props;
    const { dateRange } = this.state;
    let [{ startDate, endDate } = {}] = dateRange;
    this.handleClosePopover();
    const {
      document: { docType },
    } = this.props;
    this.setState({
      isDownloading: true,
    });
    try {
      const response = await api.getDownloadReport({
        type: 'range',
        docType: docType,
        from: format(new Date(startDate), 'yyyy-MM-dd'),
        to: format(new Date(endDate), 'yyyy-MM-dd'),
      });
      if (response.responsePayload.statusCode === 200) {
        appActions.setToast({
          title: 'Please check your mail for the report.',
          success: true,
        });
        return;
      }
    } catch (e) {
      appActions.setToast({
        title: 'Download failed',
        error: true,
      });
    } finally {
      this.setState({
        isDownloading: false,
      });
    }
  };
  handleCloseBtnClick = () => {
    const { documentActions, analyticsDocument } = this.props;
    if (!analyticsDocument) return;
    documentActions.hideAnalytics({
      docType: analyticsDocument,
    });
  };
  componentWillUnmount() {
    this.handleCloseBtnClick();
  }

  handleDateRangeChange = (dateRange) => {
    const { documentActions, analyticsDocument, appActions } = this.props;
    let [{ startDate, endDate } = {}] = dateRange;
    // eslint-disable-next-line quotes
    const sDate = format(startDate, 'yyyy-MM-dd');
    // eslint-disable-next-line quotes
    const eDate = format(endDate, 'yyyy-MM-dd');
    if (differenceInDays(endDate, startDate) > 29) {
      appActions.setToast({
        title: 'Please select date range of 30 days!',
        error: true,
      });
      return;
    }
    countDateSelection += 1;
    this.setState({
      dateSelected: true,
      dateRange,
    });
    documentActions.newAnalytics({
      docType: analyticsDocument,
      type: 'range',
      from: sDate,
      to: eDate,
    });
    if (countDateSelection === 2) {
      this.handleClosePopover();
    }
  };

  clearCountDateSelection = () => {
    countDateSelection = 0;
  };

  handleClearDateFilters = () => {
    const { documentActions, analyticsDocument } = this.props;
    this.setState({
      dateSelected: false,
      dateRange: [
        {
          startDate: null,
          endDate: this.getFixedDate(new Date()),
          key: 'selection',
        },
      ],
    });
    documentActions.newAnalytics({
      docType: analyticsDocument,
    });
  };

  returnFormattedDate = (date) => date && format(date, 'EEE MMM dd yyyy');

  getSixMonthPrior = () => addDays(new Date(), -179);

  getFixedDate = (date) => date && new Date(date.getDate(date.getDate() + 30));

  getDifferenceDate = () => {
    const { dateRange } = this.state;
    const initialDate = dateRange[0]?.startDate;
    const currentDay = new Date();
    const differenceDays = Math.floor(
      Math.abs((currentDay - initialDate) / (1000 * 60 * 60 * 24))
    );
    return differenceDays;
  };

  getMinDifferenceDate = () => {
    const { dateRange } = this.state;
    const initialDate = dateRange[0]?.startDate;
    const sixthMonthDay = this.getSixMonthPrior();
    const differenceDays = Math.floor(
      Math.abs((sixthMonthDay - initialDate) / (1000 * 60 * 60 * 24))
    );
    return differenceDays;
  };

  getMaxDate = () => {
    const { dateRange, currentDate } = this.state;
    const initialDate = dateRange[0]?.startDate;
    if (initialDate) {
      let maxDate = currentDate;
      if (this.getDifferenceDate() < 30) {
        maxDate = currentDate;
      } else {
        maxDate = addDays(initialDate, 29);
      }
      return maxDate;
    } else {
      return currentDate;
    }
  };

  getMinDate = () => {
    const { dateRange } = this.state;
    const initialDate = dateRange[0]?.startDate;
    if (initialDate) {
      let minDate = this.getSixMonthPrior();
      if (this.getMinDifferenceDate() > 30) {
        minDate = addDays(initialDate, -29);
      }
      return minDate;
    } else {
      return this.getSixMonthPrior();
    }
  };

  render() {
    const {
      analyticsData,
      docTypeOption,
      dateRange,
      dateSelected,
      currentDate,
    } = this.state;

    const {
      accuracy,
      averageAccuracy,
      counts,
      averageTimePerDoc,
      averageApiTimePerDoc,
      averageTurnaroundTime,
      averageCorrection,
      usage,
    } = analyticsData;
    const {
      document: { title, docType },
    } = this.props;
    const usageGraphOption = [
      {
        id: 1,
        status: 'Review',
        icon: EyeEmpty,
        color: '#B0D2D8',
        number: counts.reviewing || 0,
      },
      {
        id: 2,
        status: 'Skipped',
        icon: SkipNext,
        color: '#E0CFA8',
        number: counts.reviewSkipped || 0,
      },
      {
        id: 3,
        status: 'Approved',
        icon: Check,
        color: '#C9E0A8',
        number: counts.processed || 0,
      },
      {
        id: 4,
        status: 'STP Approved',
        icon: PcCheck,
        color: '#A8B3E0',
        number: counts.stpApproved || 0,
      },
      {
        id: 5,
        status: 'Approve With Error',
        icon: DoubleCheck,
        color: '#F8CA98',
        number: counts.approvedWithError || 0,
      },
      {
        id: 6,
        status: 'Error',
        icon: WarningTriangle,
        color: '#D1ACBB',
        number: counts.erred || 0,
      },
    ];
    const analyticsNumberData = [
      {
        title: 'Total Uploaded',
        icon: UploadSquare,
        totalNumber: counts.totalCount || 0,
      },
      {
        title: 'Successfully Processed',
        icon: DoubleCheck,
        totalNumber:
          (counts.processed || 0) +
            (counts.stpApproved || 0) +
            (counts.approvedWithError || 0) || 0,
      },
      {
        title: 'Total Straight Through',
        icon: RightRoundArrow,
        totalNumber: counts.stpCount || 0,
      },
      {
        title: 'Total Review Pending',
        icon: EyeEmpty,
        totalNumber: counts.reviewing || 0,
      },
    ];
    return (
      <>
        <div className={styles.analyticsWrapper}>
          <div className={styles.topSection}>
            <div className={styles.topSection_header}>
              <div className={styles.topSection_title}>Analytics</div>
              <div className={styles.topSection_close}>
                <button
                  title='Close'
                  className={cx('unstyled-btn', styles.topSection_closeBtn)}
                  onClick={this.handleCloseBtnClick}
                >
                  <Cancel />
                </button>
              </div>
            </div>
            <div className={styles.topSection_controlfirst}>
              <div className={styles.topSection_doctype}>
                <span className={styles.topSection_placeholder}>
                  Document Type
                </span>
                &nbsp;&nbsp;&nbsp;
                <span className={styles.topSection_doctypeDropdown}>
                  <Dropdown
                    value={docType}
                    data={docTypeOption}
                    onChange={this.changeAnalyticsDocType}
                  />
                </span>
              </div>
              <div className={styles.topSection__download}>
                {dateSelected && (
                  <div className={styles.filterSection}>
                    <p className={styles.filterSection__text}>
                      {this.returnFormattedDate(
                        dateRange.length && dateRange[0]?.startDate
                      )}{' '}
                      -{' '}
                      {this.returnFormattedDate(
                        dateRange.length && dateRange[0]?.endDate
                      )}
                    </p>
                    <p
                      role='presentation'
                      className={cx(styles.filterSection__close, 'pointer')}
                      onClick={() => this.handleClearDateFilters()}
                    >
                      <Cancel width='1rem' height='1rem' />
                    </p>
                  </div>
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
                      maxDate={currentDate}
                      ranges={dateRange}
                      direction='horizontal'
                      minDate={this.getSixMonthPrior()}
                      staticRanges={newDefaultStaticRanges}
                    />
                  }
                  uid='document-type-date-range-section'
                  className={styles.actionPopover}
                  openClassName={styles.actionPopover__open}
                  containerClassName={cx(
                    styles.actionPopover__container,
                    styles.actionPopover__container__xl,
                    styles.actionPopover__container__inverted
                  )}
                  contentClassName={styles.actionPopover__content__date}
                >
                  <div className={styles.actionPopover__iconBtns}>
                    <span
                      className={cx(styles.actionPopover__iconBtns__mainIcon)}
                    >
                      <Tooltip
                        label='Filter By Date'
                        className={styles.actionPopover__iconTooltip}
                        placement='bottom'
                      >
                        <Calendar
                          height='1.5rem'
                          width='1.5rem'
                          color={
                            dateSelected
                              ? 'var(--ds-clr-primary)'
                              : 'var(--ds-clr-gray-800)'
                          }
                        />
                      </Tooltip>
                    </span>
                    <span className={styles.actionPopover__iconBtns__dropIcon}>
                      <NavArrowDown height='0.8rem' width='0.8rem' />
                    </span>
                  </div>

                  {dateSelected ? (
                    <span
                      role='presentation'
                      className={styles.removeBtn}
                      onClick={() => this.handleClearDateFilters()}
                    >
                      <DeleteCircle width='0.75rem' height='0.75rem' />
                    </span>
                  ) : (
                    <></>
                  )}
                </Popover>

                <Button
                  isLoading={this.state.isDownloading}
                  onClick={this.handleDownloadBtnClick}
                  icon={Download}
                  variant='contained'
                  size='small'
                  disabled={!dateSelected}
                >
                  Download Report
                </Button>
              </div>
            </div>
            <div className={styles.topSection_controlsecond}>
              <div className={styles.topSection_overview}>Overview</div>
            </div>
          </div>
          <div className={styles.content}>
            <div className={styles.content_numberStatistics}>
              {analyticsNumberData.map((item, idx) => {
                const { title, icon, totalNumber } = item;
                return (
                  <NumberCard
                    key={idx}
                    title={title}
                    icon={icon}
                    totalNumber={totalNumber}
                  />
                );
              })}
            </div>
            <div className={styles.content_progressGraph}>
              <div className={styles.content_usageGraph}>
                <UsageGraph
                  title={'Usage'}
                  usage={usage}
                  option={usageGraphOption}
                />
              </div>
              <div className={styles.content_progressStatistics}>
                <ProgressAccuracy
                  title={'Average Accuracy'}
                  percentage={averageAccuracy}
                />
                <AverageTimeCard
                  title={'Average Time Per Document'}
                  time={averageTimePerDoc}
                />
              </div>
            </div>
            <div className={styles.content_analyticsContent}>
              <AverageGraph
                title={'Average API Time Per Document'}
                labelX={'Weekly'}
                labelY={'Seconds'}
                data={averageApiTimePerDoc}
              />
              <AverageGraph
                title={'Average Turnaround Time '}
                labelX={'Weekly'}
                labelY={'Hours'}
                data={averageTurnaroundTime}
              />
              <TableChart title={'Accuracy Per Field'} accuracy={accuracy} />
              <AverageGraph
                title={'Average Corrections Per Document'}
                labelX={'Weekly'}
                labelY={'No. of documents'}
                data={averageCorrection}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}

const Container = (props) => {
  const { analyticsDocument } = props;
  if (!analyticsDocument) {
    return null;
  }

  return <AnalyticOverlay {...props} />;
};

function mapStateToProp(state) {
  const {
    analyticsDocument,
    config,
    documentsById,
    docId,
    reviewTool,
    analyticsData,
  } = state.documents;
  const allDocuments =
    documentsById && _.keys(documentsById).length
      ? documentsById
      : reviewTool.documentsById;

  const document = allDocuments[docId] || {};
  const { config: docConfig } = state.app;

  return {
    analyticsDocument,
    config,
    document,
    analyticsData,
    docConfig,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(Container)
);
