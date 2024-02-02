/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import cx from 'classnames';
import { Cancel, NavArrowDown, OpenNewWindow } from 'iconoir-react';
import mixpanel from 'mixpanel-browser';
import { ReactComponent as DefaultSplitIcon } from 'new/assets/images/icons/default_split_icon.svg';
import { ReactComponent as HorizSplitIcon } from 'new/assets/images/icons/horiz_split_icon.svg';
import { ReactComponent as LoaderIcon } from 'new/assets/images/icons/loader.svg';
import { ReactComponent as VerticalSplitIcon } from 'new/assets/images/icons/vertical_split_icon.svg';
import { Button } from 'new/components/widgets/buttons';
import { KEY_CODES } from 'new/constants/keyboard';
import routes from 'new/constants/routes';
import {
  CHAMELEON_TOUR_TYPES,
  chameleonTriggerTour,
  CHAMLEON_TOUR_IDS,
} from 'new/thirdParty/chameleon';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import { getOS } from 'new/utils';
import Popover from 'react-tiny-popover';

import styles from './DocumentTitleHeader.scss';

const SPLIT_ICON_TYPES = {
  fullScreen: <DefaultSplitIcon />,
  horizontal: <HorizSplitIcon />,
  vertical: <VerticalSplitIcon />,
};
class DocumentTitleHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabs: [],
      splitView: false,
      splitModesPopoverShow: true,
      splitMode: 'fullScreen',
      showLoader: true,
    };
    this.wrapperRef = React.createRef();
    this.wrapperDropRef = React.createRef();
  }

  UNSAFE_componentWillMount() {
    this.setSplitData(this.props);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  componentDidMount() {
    const { tabs = [], splitView } = this.props;
    document.addEventListener('mousedown', this.handleClickOutside);
    this.setState({ tabs, splitView });
    document.addEventListener('keydown', this.handleKeyDown);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setSplitData(nextProps);
  }

  handleKeyDown = (e) => {
    const { keyCode, ctrlKey, metaKey, shiftKey } = e;

    const isMacOS = getOS() === 'MacOS';
    if (
      keyCode === KEY_CODES.S &&
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey)) &&
      shiftKey
    ) {
      this.handleSplitModes('horizontal');
    }
  };

  handleClickOutside = (event) => {
    if (
      this.wrapperRef &&
      this.wrapperDropRef.current &&
      !this.wrapperRef.current.contains(event.target) &&
      this.wrapperDropRef &&
      this.wrapperDropRef.current &&
      !this.wrapperDropRef.current.contains(event.target)
    ) {
      if (this.state.splitModesPopoverShow && !this.state.showLoader) {
        this.setState({
          splitModesPopoverShow: false,
        });
      }
    }
  };

  setSplitData = (props) => {
    const {
      tabs = [],
      splitView,
      splitMode,
      showLoader,
      dataFetchFailed,
    } = props;
    let stateProps = {
      tabs,
      splitView,
      splitMode,
      showLoader,
      splitModesPopoverShow: showLoader,
    };
    if (!splitView) {
      stateProps = {
        ...stateProps,
        showLoader: false,
        splitModesPopoverShow: false,
      };
    }
    if (dataFetchFailed && splitView) {
      stateProps = {
        ...stateProps,
        splitView: false,
      };
    }
    this.setState({ ...stateProps });
  };

  handleSplitView = (value, mode) => {
    const { config, userEmail = '', addMixpanelTrackingForTours } = this.props;
    this.props.handleSplitView({ splitView: value, mode });
    const { canSwitchToOldMode = true } = config;

    //add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.split_view, {
      'work email': userEmail,
      origin: 'dropdown',
      version: 'new',
      view: mode,
      canSwitchUIVersion: canSwitchToOldMode,
    });

    chameleonTriggerTour(
      CHAMLEON_TOUR_IDS.spreadsheetReviewPhase2,
      CHAMELEON_TOUR_TYPES.spreadsheetReviewPhase2,
      () =>
        addMixpanelTrackingForTours(MIXPANEL_EVENTS.spreadsheet_review_phase_2)
    );
  };

  handleTabChange = (e, id) => {
    e.preventDefault();
    let { tabs } = this.state;
    const { userEmail = '', config } = this.props;
    const { canSwitchToOldMode = true } = config;

    // Add mixpanel tracking
    if (id === 2) {
      mixpanel.track(MIXPANEL_EVENTS.view_original_file, {
        'work email': userEmail,
        version: 'new',
        canSwitchUIVersion: canSwitchToOldMode,
      });
    }

    (tabs = tabs.map((item) => ({
      ...item,
      active: !!(item.id === id),
    }))),
      this.setState({ tabs }, () =>
        this.props.tabEventHandler({ tabIndex: id })
      );
  };

  setStorageData = () => {
    const {
      fileUrl = '',
      docHasExcelType,
      clientApp,
      highlights = [],
      highlightRanges = [],
    } = this.props;
    let { excelData } = this.props;

    localStorage.removeItem('originalFileProps');

    if (!docHasExcelType) {
      localStorage.setItem(
        'originalFileProps',
        JSON.stringify({
          fileUrl,
          docHasExcelType,
          clientApp,
          highlights,
        })
      );
    } else {
      excelData = excelData.map((item, index) => ({
        ...item,
        columns: index !== 0 ? [] : item.columns,
        rows: index !== 0 ? [] : item.rows,
      }));
      try {
        localStorage.setItem(
          'originalFileProps',
          JSON.stringify({
            excelData,
            fileUrl,
            docHasExcelType,
            clientApp,
            highlightRanges,
          })
        );
      } catch (e) {
        /* eslint-disable no-console */
        if (this.isQuotaExceeded(e)) {
          console.log('localstoragefull');
        }
      }
    }
  };

  isQuotaExceeded = (e) => {
    var quotaExceeded = false;
    if (e) {
      if (e.code) {
        switch (e.code) {
          case 22:
            quotaExceeded = true;
            break;
          case 1014:
            // Firefox
            if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
              quotaExceeded = true;
            }
            break;
        }
      } else if (e.number === -2147024882) {
        // Internet Explorer 8
        quotaExceeded = true;
      }
    }
    return quotaExceeded;
  };

  handleOpenInNewWindow = (e) => {
    const { userEmail = '', config } = this.props;
    let url = e.currentTarget && e.currentTarget.getAttribute('dataurl');
    const { canSwitchToOldMode = true } = config;
    // Add mixpanel tracking
    mixpanel.track(MIXPANEL_EVENTS.open_new_window, {
      'work email': userEmail,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    this.setState({ splitModesPopoverShow: false }, () =>
      this.setStorageData()
    );
    window.open(url, '_blank');
  };

  handleSplitModes = (mode) => {
    const { splitMode } = this.state;

    if (splitMode === mode) {
      return;
    }

    switch (mode) {
      case 'fullScreen':
        this.handleSplitView(false, mode);
        break;
      case 'horizontal':
        this.handleSplitView(true, mode);
        break;
      case 'vertical':
        this.handleSplitView(true, mode);
        break;
      default:
        break;
    }

    this.setState({ splitMode: mode, showLoader: true });
  };

  splitModesDropdownPopOver = (children) => {
    const { splitModesPopoverShow, showLoader, splitMode } = this.state;
    const isFullScreenMode = splitMode === 'fullScreen';
    const isHorizontalMode = splitMode === 'horizontal';
    const isVerticalMode = splitMode === 'vertical';

    return (
      <Popover
        isOpen={splitModesPopoverShow}
        position={['right', 'bottom']}
        align={'end'}
        padding={-8}
        containerClassName={styles.popContainer}
        content={() => (
          <div className={styles.content} ref={this.wrapperDropRef}>
            <Button
              className={cx(
                styles.contentListItem,
                { [styles.activeMode]: isFullScreenMode },
                {
                  [styles.disable]: showLoader && !isFullScreenMode,
                }
              )}
              iconLeft={DefaultSplitIcon}
              iconRight={isFullScreenMode && showLoader ? LoaderIcon : ''}
              iconClassName={styles.extraPad}
              iconRightClassName={styles.loader}
              disabled={showLoader}
              onClick={() => this.handleSplitModes('fullScreen')}
            >
              Default View
            </Button>
            <Button
              className={cx(
                styles.contentListItem,
                { [styles.activeMode]: isHorizontalMode },
                {
                  [styles.disable]: showLoader && !isHorizontalMode,
                }
              )}
              iconLeft={HorizSplitIcon}
              iconRight={isHorizontalMode && showLoader ? LoaderIcon : ''}
              iconClassName={styles.extraPad}
              iconRightClassName={styles.loader}
              disabled={showLoader}
              onClick={() => this.handleSplitModes('horizontal')}
            >
              Horizontal
            </Button>
            <Button
              className={cx(
                styles.contentListItem,
                { [styles.activeMode]: isVerticalMode },
                {
                  [styles.disable]: showLoader && !isVerticalMode,
                }
              )}
              iconLeft={VerticalSplitIcon}
              iconRight={isVerticalMode && showLoader ? LoaderIcon : ''}
              iconClassName={styles.extraPad}
              iconRightClassName={styles.loader}
              disabled={showLoader}
              onClick={() => this.handleSplitModes('vertical')}
            >
              Vertical
            </Button>
          </div>
        )}
      >
        {children}
      </Popover>
    );
  };

  getSplittedIcon = (mode) => {
    return SPLIT_ICON_TYPES[mode];
  };

  getNewWindowElement = () => {
    const { clientApp } = this.props;
    const queryParams = clientApp ? window.location.search : '';
    const queryUrl = `${routes.ORIGINAL_FILE_PREVIEW}${queryParams}`;

    return (
      <Link
        to=''
        title='Original File Preview'
        target={'_blank'}
        dataurl={queryUrl}
        onClick={(e) => this.handleOpenInNewWindow(e)}
      >
        <OpenNewWindow height={20} width={20} color='#6B7280' />
      </Link>
    );
  };

  getTabContent = (item) => {
    const { splitView } = this.state;
    return (
      <div
        className={cx(styles.tabContent_tabs, {
          [styles.activeTab]: item.active,
          [styles.blueBar]: item.active && !splitView,
        })}
        title={item.documentTitle}
        key={item.id}
        onClick={(e) => this.handleTabChange(e, item.id)}
      >
        <div>
          <span>{item.icon}</span>
          <span>{item.documentTitle}</span>
          {item.id === 2 && <span>{this.getNewWindowElement()}</span>}
        </div>
      </div>
    );
  };

  handleMultiSplitView = (e) => {
    const { splitModesPopoverShow } = this.state;
    const { user } = this.props;
    e.stopPropagation();
    this.setState({ splitModesPopoverShow: !splitModesPopoverShow });
  };

  getSplitModeElement = () => {
    const { splitMode, splitModesPopoverShow } = this.state;
    const { dataFetchFailed } = this.props;
    const icon = this.getSplittedIcon(splitMode);

    return (
      <div
        className={cx(
          styles.splitContent,
          { [styles['splitContent--disabled']]: dataFetchFailed },
          {
            [styles.active]: splitModesPopoverShow,
          }
        )}
        ref={this.wrapperRef}
      >
        <Tooltip label='Split View' placement='bottom'>
          <button
            className={cx(styles.splitContent__btn, 'UFSplitScreenButton')}
            onClick={this.handleMultiSplitView}
          >
            <span
              className={cx(styles['splitContent__btn--splitIcon'], {
                [styles.active]: splitModesPopoverShow,
              })}
            >
              {icon}
            </span>
            <span className={styles['splitContent__btn--arrowIcon']}>
              {
                <NavArrowDown
                  height={14}
                  width={14}
                  color={
                    splitModesPopoverShow
                      ? 'var(--ds-clr-primary)'
                      : 'var(--ds-clr-gray-800)'
                  }
                />
              }
            </span>
          </button>
        </Tooltip>
      </div>
    );
  };

  render() {
    const { isSidebarOpen, clientApp, hideActions, handleClose } = this.props;
    const { tabs } = this.state;
    const splitModeElements = this.getSplitModeElement();

    return (
      <>
        <div
          className={cx(styles.mainHeader, {
            [styles.mainHeaderSidebarOpen]: isSidebarOpen,
          })}
        >
          <div className={styles.tabContent}>
            {tabs.map((item) => this.getTabContent(item))}
          </div>
          {!hideActions && (
            <div className={styles.actionContent}>
              {this.splitModesDropdownPopOver(splitModeElements)}
              {clientApp ? null : (
                <>
                  <IconButton
                    variant='ghost'
                    icon={<Cancel height={20} width={20} />}
                    size='small'
                    onClick={handleClose}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </>
    );
  }
}

export default DocumentTitleHeader;
