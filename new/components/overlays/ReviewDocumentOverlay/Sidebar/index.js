/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { matchPath, withRouter } from 'react-router-dom';
import { chatAIActions } from 'new/redux/chatai/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { showToast } from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import copy from 'clipboard-copy';
import download from 'downloadjs';
import {
  ArrowRight,
  Cancel,
  Check,
  CheckCircle,
  DoubleCheck,
  Download,
  EyeEmpty,
  InfoEmpty,
  MoreVert,
  NavArrowLeft,
  NavArrowRight,
  Page,
  PageFlip,
  Refresh,
  Settings,
  ShareAndroid,
  SkipNext,
  Table2Columns,
  TextAlt,
  Trash,
} from 'iconoir-react';
import { ArrowLeft } from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { ReactComponent as PoweredByDocsumo } from 'new/assets/images/poweredbydocsumo.svg';
import Chat from 'new/components/overlays/ReviewDocumentOverlay/Sidebar/Chat';
import * as documentConstants from 'new/constants/document';
import ttConstants from 'new/constants/helpTooltips';
import { MIXPANEL_ORIGINS } from 'new/constants/mixpanel';
import routes from 'new/constants/routes';
import { SUPPORT_LINK } from 'new/constants/urllink';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Badges from 'new/ui-elements/Badge/Badge';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import { IconMenuPortal } from 'new/ui-elements/IconMenu';
import Modal from 'new/ui-elements/Modal/Modal';
import FullPageLoader from 'new/ui-elements/PageLoader/PageLoader';
import Tabs from 'new/ui-elements/Tabs/Tabs';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import { getOS } from 'new/utils';
import canAccessEditField from 'new/utils/canAccessEditField';
import { mixpanelTrackingAllEvents } from 'new/utils/mixpanel';
import OutsideClickHandler from 'react-outside-click-handler';

import SectionList, {
  FooterSkeleton,
  SectionListSkeleton,
} from './SectionList';

import styles from './index.scss';

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDrop: false,
      downloadEmbeddedModal: false,
      moveToEdit: false,
      downloadingType: '',
    };
    this.docTitleClickCount = 0;
    this.isMacOS = getOS() === 'MacOS';

    this.keyCommand = this.isMacOS ? 'Cmd' : 'Ctrl';

    this.shareActions = () => {
      const { embeddedApp, clientApp } = this.props;

      if (embeddedApp) {
        return { key: 'share', title: 'Share', icon: <ShareAndroid /> };
      } else if (clientApp) {
        return [];
      } else {
        return [
          { key: 'share', title: 'Share', icon: <ShareAndroid /> },
          {
            key: 'delete',
            title: 'Delete',
            icon: <Trash />,
            classNames: styles.footer__delete,
          },
        ];
      }
    };

    this.shareActionsHandler = ({ key }) => {
      const { onDocDeleteBtnClick, embeddedApp } = this.props;
      switch (key) {
        case 'share':
          embeddedApp
            ? this.copyShareableLink()
            : this.copyShareableClientLink();
          break;
        case 'delete':
          onDocDeleteBtnClick();
          break;
      }
    };

    (this.sideBarTabHeaders = [
      {
        header: 'Extraction',
        isActive: true,
        url: 'extract',
        actionIcon:
          this.props.embeddedApp || this.props.clientApp ? null : <Settings />,
        actionIconHandler: this.props.moveToEditHandler,
        actionTitle: `Edit Fields (${this.keyCommand} + Shift + E)`,
        actionIconClassname: 'UFMoreActions',
      },
      {
        header: 'Chat AI',

        url: 'chat',
        badge: <Badges title='New' type='primary' />,
      },
    ]),
      (this.contentRef = React.createRef());
  }

  handleScroll = (e) => {
    this.props.onScroll(e);

    const floatingInput = document.getElementById('js-floating-input');
    if (floatingInput) {
      floatingInput.style.display = 'none';
    }
  };

  downloadToggle = () => {
    this.setState((prevState) => ({
      showDrop: !prevState.showDrop,
    }));
  };

  componentDidUpdate(prevProps) {
    const { status } = (this.props && this.props.docMeta) || {};
    const { status: prevStatus } = (prevProps && prevProps.docMeta) || {};
    if (status && prevStatus && prevStatus !== status) {
      this.setState({
        changed: true,
      });
    }

    /**
     * Resetting all state on chat ai store to ensure no stale data of previous docId lefts
     */
    if (prevProps.docId !== this.props.docId) {
      this.props.chatAIActions.resetChatAIState();
    }
  }

  componentWillUnmount() {
    this.props.chatAIActions.resetChatAIState();
  }

  handleMouseDown = (e) => {
    var box = this.contentRef.current;
    var pos = 0,
      pos1 = 0;
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup
    pos1 = e.clientX;
    /* stop moving when mouse button is released:*/
    document.onmouseup = () => {
      this.updateFieldArrowPosition();

      document.onmouseup = null;
      document.onmousemove = null;
    };
    // call a function whenever the cursor moves:
    document.onmousemove = (e) => {
      e = e || window.event;
      e.preventDefault();
      pos = e.clientX - pos1;
      pos1 = e.clientX;
      let right = pos;
      let boxWidth = box.clientWidth;
      var finalWidth = boxWidth + right;
      box.style.flexBasis = `${finalWidth}px`;

      this.props.onSidebarResize();

      this.updateFieldArrowPosition();
    };
  };

  updateFieldArrowPosition = () => {
    if (!this.props.selectedField?.uiPosition) return;

    if (this.props.onScroll) {
      this.props.onScroll();
    }
    this.props.updateDocumentDomRectDataThrottled();
  };

  handleDownloadBtnClick = async ({ key: type }) => {
    const {
      docId,
      docMeta,
      user,
      canSwitchToOldMode,
      history: {
        location: { state, pathname },
      },
    } = this.props;

    this.setState({
      showDrop: false,
    });

    showToast({
      title: 'Downloading...',
      duration: 6000,
    });

    const docTitle = _.get(docMeta, 'title') || '';

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
      'work email': user.email,
      'document type': document.type,
      'download option': type,
      label: docTitle,
      origin: originType.value || 'Shareable Link',
      docId: docId,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    try {
      let response = {};
      if (type === 'original_file') {
        response = await api.downloadDocumentByFormat({
          type: type,
          doc_id: docId,
        });
      } else {
        response = await api.downlaodMultiDocs({
          type: type,
          doc_ids: [docId],
        });
      }
      const { responsePayload } = response;
      const downloadUrl = _.get(responsePayload, 'data.downloadUrl');
      download(downloadUrl);
    } catch (e) {
      showToast({
        title:
          e?.responsePayload?.message ||
          'An error occurred while downloading document',
        error: true,
        duration: 3000,
      });
    } finally {
      // Do nothing
    }
  };
  handleDownloadTextBtnClick = async () => {
    showToast({
      title: 'Downloading...',
      duration: 3000,
    });
    this.setState({
      showDrop: false,
    });
    const { docId } = this.props;
    try {
      let response = {};

      response = await api.downloadTextDocument({
        doc_id: docId,
      });

      const { responsePayload } = response;
      const downloadUrl = _.get(responsePayload, 'data.downloadUrl');
      download(downloadUrl);
    } catch (e) {
      // Do nothing
    } finally {
      // Do nothing
    }
  };

  renderFooterPagination = () => {
    const {
      documentIds,
      docId,
      onDocNavigateBtnClick,
      email,
      location: { state },
    } = this.props;

    const totalDocCount = documentIds.length;
    const currentDocIndex = documentIds.indexOf(docId);

    if (currentDocIndex < 0) {
      return null;
    }

    const currentDocPosition = currentDocIndex + 1;
    let prevDocId;
    let nextDocId;

    if (currentDocIndex > 0) {
      prevDocId = documentIds[currentDocIndex - 1];
    }

    if (currentDocIndex < totalDocCount - 1) {
      nextDocId = documentIds[currentDocIndex + 1];
    }

    const handlePrevBtnClick = () => {
      onDocNavigateBtnClick(prevDocId, 'prev');
    };

    const handleNextBtnClick = () => {
      onDocNavigateBtnClick(nextDocId, 'next');
    };

    return (
      <div className={cx(styles.nav)}>
        <IconButton
          variant='text'
          size='extra-small'
          icon={<NavArrowLeft height={24} width={24} />}
          disabled={!prevDocId}
          onClick={handlePrevBtnClick}
          className={styles.paginationBtn}
        />
        <div className={cx('non-selectable', styles.content, 'mr-1', 'ml-1')}>
          {totalDocCount >= 500 ? (
            <p>
              {currentDocPosition} of {`${totalDocCount}+`}
            </p>
          ) : (
            <p>
              {currentDocPosition} of {totalDocCount}
            </p>
          )}
        </div>

        <IconButton
          variant='text'
          size='extra-small'
          icon={<NavArrowRight height={24} width={24} />}
          disabled={!nextDocId}
          onClick={handleNextBtnClick}
          className={styles.paginationBtn}
        />
      </div>
    );
  };

  copyShareableLink = () => {
    const { urlName } = this.props;
    copy(urlName);
    showToast({
      title: 'Link copied to clipboard',
      success: true,
      duration: 3000,
    });
  };

  copyShareableClientLink = async () => {
    const appEnvironment = global.window.location.origin;
    const { docId } = this.props;

    showToast({
      title: 'Please wait. Generating link',
      success: true,
      duration: 3000,
    });

    try {
      const response = await api.getTempToken({ docId });
      const temporaryToken = response?.responsePayload?.token || {};

      const clientUrl = `${appEnvironment}/review-document/${docId}?token=${temporaryToken}&client=true`;
      copy(clientUrl);
    } catch (e) {
      //do nothing
    }

    showToast({
      title: 'Link copied to clipboard',
      success: true,
      duration: 3000,
    });
  };

  renderFooter = ({ showOnlyPagination = false }) => {
    const {
      docMeta,
      isFetchingData,
      dataFetchFailed,
      isStartingReview,
      isFinishingReview,
      isSkippingReview,
      stateActionInProgress,
      onStartReviewBtnClick,
      onFinishReviewBtnClick,
      onSkipReviewBtnClick,
      onDocDeleteBtnClick,
      onForceFinishReviewBtnClick,
      isForceFinishingReview,
      errorStatus,
      errorMessage,
      onOutsideClick,
      embeddedApp,
      clientApp,
      isRetryingValidation,
      retryValidation,
      reRunErrorMessage,
      reRunErrorStatus,
      onReRunOutsideClick,
      docReadOnly,
      docSkipped,
    } = this.props;
    const { showDrop } = this.state;
    const modifierKey = this.isMacOS ? 'Opt' : 'Alt';
    let nodes;

    if (isFetchingData || dataFetchFailed) {
      nodes = (
        <Fragment>
          <div className={cx(styles.row2)}>
            {embeddedApp || clientApp ? '' : this.renderFooterPagination()}
          </div>
        </Fragment>
      );
    } else {
      const showStartReviewBtn = [
        documentConstants.STATUSES.PROCESSED,
        documentConstants.STATUSES.REVIEW_REQUIRED,
        documentConstants.STATUSES.REVIEW_SKIPPED,
      ].includes(_.get(docMeta, 'status'));

      const showFinishReviewBtn =
        !showStartReviewBtn &&
        [documentConstants.STATUSES.REVIEWING].includes(
          _.get(docMeta, 'status')
        );

      const showSkipBtn = [
        documentConstants.STATUSES.REVIEW_REQUIRED,
        documentConstants.STATUSES.REVIEWING,
      ].includes(_.get(docMeta, 'status'));

      let startReviewBtnNode = null;
      let finishReviewBtnNode = null;
      let forceApprovedBtnNode = null;
      let refreshBtnNode = null;
      let skipReviewBtnNode = null;
      let downloadActions = null;
      let downloadEmbeddedApp = null;
      const approveReviewAgain = docReadOnly && !docSkipped;

      if (showStartReviewBtn) {
        const btnDisabled = !!stateActionInProgress;
        startReviewBtnNode = (
          <Tooltip placement={'top'} label='Click To Start Review'>
            <Button
              className={styles['footer__approveReview--btn']}
              onClick={onStartReviewBtnClick}
              variant='outlined'
              size='small'
              icon={EyeEmpty}
              disabled={btnDisabled}
              isLoading={isStartingReview}
            >
              {isStartingReview ? 'Starting Review' : 'Review Again'}
            </Button>
          </Tooltip>
        );
      }

      if (showFinishReviewBtn) {
        const btnDisabled = !!stateActionInProgress;
        finishReviewBtnNode = (
          <OutsideClickHandler onOutsideClick={onOutsideClick}>
            <Tooltip
              displayOnHover={false}
              showTooltip={errorStatus}
              placement='top'
              label={`${errorMessage} \n Click on double check icon to force confirm with error`}
              className={styles.errMessage}
              size='lg'
            >
              <div id={ttConstants.TT_REVIEW_SCRREN_GRID_APPROVE_DOC}>
                {/* Helptooltip removed */}
                <Tooltip
                  className={cx(styles.approveTooltip, 'text-center')}
                  placement={'top'}
                  label={
                    errorStatus
                      ? `${errorMessage} \n Click on right double check icon to force confirm with error`
                      : `Approve The Document (${this.keyCommand} + Shift + Enter)`
                  }
                  displayOnHover={!errorStatus}
                  visible={errorStatus}
                >
                  <Button
                    size='small'
                    variant='contained'
                    icon={Check}
                    disabled={btnDisabled}
                    isLoading={isFinishingReview}
                    onClick={onFinishReviewBtnClick}
                    className={cx(
                      styles.footer__strictApprove,
                      'UFTooltipReviewApprove'
                      // Not to remove UFTooltipReviewApprove
                    )}
                  >
                    {isFinishingReview ? 'Confirming' : 'Confirm'}
                  </Button>
                </Tooltip>
              </div>
            </Tooltip>
          </OutsideClickHandler>
        );
      }
      if (showFinishReviewBtn) {
        const btnDisabled = !!stateActionInProgress;
        forceApprovedBtnNode = (
          <Tooltip placement='top' label='Confirm With Error'>
            <IconButton
              variant='text'
              className={cx(
                styles.iconBtn,
                styles.forceApprove,
                { [styles.finishingApprove]: isFinishingReview },
                { [styles.forceEmbeddedApp]: embeddedApp },
                { [styles.forceClientApp]: clientApp }
              )}
              icon={<DoubleCheck height={20} width={20} />}
              disabled={btnDisabled}
              onClick={onForceFinishReviewBtnClick}
              isLoading={isForceFinishingReview}
            />
          </Tooltip>
        );
      }

      if (showSkipBtn) {
        const btnDisabled = !!stateActionInProgress;

        skipReviewBtnNode = (
          <Tooltip
            label={
              <span className={styles.tooltipLabel}>
                <span>Skip ({this.keyCommand} + </span>
                <ArrowRight width={16} height={16} />)
              </span>
            }
            placement='top'
            variant='text'
          >
            <IconButton
              variant='text'
              disabled={btnDisabled}
              onClick={onSkipReviewBtnClick}
              icon={<SkipNext height={20} width={20} />}
              isLoading={isSkippingReview}
            />
          </Tooltip>
        );
      }

      const btnDisabled = !!stateActionInProgress;
      refreshBtnNode = (
        <OutsideClickHandler onOutsideClick={onReRunOutsideClick}>
          <Tooltip
            visible={reRunErrorStatus}
            placement='top'
            label={`${reRunErrorMessage}`}
            displayOnHover={false}
            size='lg'
            className={cx(styles.reRunErrorMessage)}
          >
            <Tooltip
              placement='top'
              label={`Re Run Validation (${this.keyCommand} + ${modifierKey} + R)`}
            >
              <IconButton
                variant='text'
                disabled={btnDisabled}
                onClick={retryValidation}
                className={cx(
                  { [styles.forceEmbeddedApp]: embeddedApp },
                  { [styles.refreshClientApp]: clientApp },
                  {
                    [styles.readOnly]: showStartReviewBtn && clientApp,
                  },
                  {
                    [styles.readOnlyApp]:
                      showStartReviewBtn && !clientApp && !embeddedApp,
                  },
                  {
                    [styles.freeToolProcessed]:
                      showStartReviewBtn && !clientApp,
                  }
                )}
                isLoading={isRetryingValidation}
                icon={<Refresh height={20} width={20} />}
              />
            </Tooltip>
          </Tooltip>
        </OutsideClickHandler>
      );

      // const menuOptionsFn = () => {
      //   if (embeddedApp) {
      //     return [
      //       {
      //         key: 2,
      //         title: 'Share',
      //         icon: <ShareAndroid />,
      //       },
      //     ];
      //   } else if (clientApp) {
      //     return [];
      //   } else {
      //     return [
      //       {
      //         key: 1,
      //         title: 'Edit Fields',
      //         icon: <EditPencil />,
      //       },
      //       {
      //         key: 2,
      //         title: 'Download',
      //         icon: <Download />,
      //       },
      //       {
      //         key: 3,
      //         title: 'Share',
      //         icon: <ShareAndroid />,
      //       },
      //       {
      //         key: 4,
      //         title: 'Delete',
      //         icon: <Trash />,
      //         classNames: styles.footer__delete,
      //       },
      //     ];
      //   }
      // };

      // const menuClickHandler = ({ title }) => {
      //   switch (title) {
      //     case 'Download':
      //       onDocDownloadBtnClick();
      //       break;
      //     case 'Share':
      //       embeddedApp
      //         ? this.copyShareableLink()
      //         : this.copyShareableClientLink();
      //       break;
      //     case 'Delete':
      //       onDocDeleteBtnClick();
      //       break;
      //     case 'Edit Fields':
      //       onEditFieldOpen();
      //       break;
      //   }
      // };

      const downloadMenuOptions = [
        {
          key: 'original_file',
          title: 'Original File',
          icon: <Page />,
        },
        {
          key: 'csv_long',
          title: 'XLS',
          icon: <Table2Columns />,
        },
        {
          key: 'json',
          title: 'JSON',
          icon: <PageFlip />,
        },
      ];

      downloadActions = (
        <>
          {clientApp || embeddedApp ? null : (
            <IconMenuPortal
              position='top-right'
              menuIcon={<Download className={styles.footer__vertColor} />}
              options={downloadMenuOptions}
              tooltipPlacement='top'
              tooltipText='Download'
              // className={cx('UFMoreActions')}
              onDropdownItemClick={this.handleDownloadBtnClick}
            />
          )}
        </>
      );

      const approveReviewAgainSection = (
        <div className={styles.footer__approveReview}>
          <div className={styles['footer__approveReview--first']}>
            <div className={styles['footer__approveReview--section']}>
              <div className={styles['footer__approveReview--approval-text']}>
                <CheckCircle />
                <p>Approved</p>
              </div>
            </div>
            <Tooltip placement={'top'} label='Click To Start Review'>
              <Button
                className={styles['footer__approveReview--btn']}
                onClick={onStartReviewBtnClick}
                variant='outlined'
                size='small'
                icon={EyeEmpty}
                isLoading={isStartingReview}
                disabled={!!stateActionInProgress}
              >
                {isStartingReview ? 'Starting Review' : 'Review Again'}
              </Button>
            </Tooltip>
          </div>
          <div className={'ml-4'}>{downloadActions}</div>
        </div>
      );

      downloadEmbeddedApp = (
        <Button
          size='small'
          variant='contained'
          icon={<Download />}
          onClick={() => this.setState({ downloadEmbeddedModal: true })}
          className={cx(styles.footer__strictApprove)}
        >
          Download
        </Button>
      );

      nodes = (
        <Fragment>
          {!showOnlyPagination ? (
            clientApp ? (
              <div
                className={cx(styles.row1, {
                  [styles.rowReview]: showStartReviewBtn,
                })}
              >
                {showStartReviewBtn && docSkipped ? (
                  <>{startReviewBtnNode}</>
                ) : (
                  ''
                )}
                {finishReviewBtnNode}
                <div className={styles.row1__cta}>
                  {forceApprovedBtnNode}
                  {showStartReviewBtn ? '' : skipReviewBtnNode}
                  {refreshBtnNode}
                  {downloadActions}
                </div>
              </div>
            ) : embeddedApp ? (
              <div className={cx(styles.row1, styles.actionEmbedded__footer)}>
                <div>{downloadEmbeddedApp}</div>
                <div className={styles['actionEmbedded__footer--other']}>
                  {refreshBtnNode}
                  {downloadActions}
                </div>
              </div>
            ) : (
              <div className={cx(styles.row1)}>
                {approveReviewAgain
                  ? approveReviewAgainSection
                  : startReviewBtnNode}
                {finishReviewBtnNode}
                {approveReviewAgain ? (
                  ''
                ) : (
                  <div className={styles.row1__cta}>
                    {forceApprovedBtnNode}
                    {skipReviewBtnNode}
                    {refreshBtnNode}
                    {approveReviewAgain ? '' : downloadActions}
                  </div>
                )}
              </div>
            )
          ) : (
            ''
          )}

          {clientApp || embeddedApp ? (
            <div className={cx(styles.row2)}>
              <div>{this.renderFooterPagination()}</div>
              <a
                href={SUPPORT_LINK.DOCSUMO_ROOT}
                target='_blank'
                rel='noopener noreferrer'
              >
                <PoweredByDocsumo />
              </a>
            </div>
          ) : (
            <div
              className={cx(
                styles.row2,
                { [styles.embeddedRow]: embeddedApp },
                { [styles.rowClient]: clientApp }
              )}
            >
              <div>{this.renderFooterPagination()}</div>
            </div>
          )}
        </Fragment>
      );
    }

    return (
      <footer
        className={cx(styles.footer, {
          [styles.clientEmbedded__footer]: clientApp || embeddedApp,
          [styles.footer__borderTop]:
            !showOnlyPagination && (!dataFetchFailed || isFetchingData),
          [styles.footer_showOnlyPagination]: showOnlyPagination,
        })}
      >
        {isFetchingData ? <FooterSkeleton /> : !dataFetchFailed ? nodes : null}
      </footer>
    );
  };

  handleTabChange = (activeTab) => {
    this.props.documentActions.setActiveSidebarTab(activeTab);
  };

  handleGoBackClick = () => {
    const { history } = this.props;
    const searchParams = new URLSearchParams(history?.location?.search);

    mixpanelTrackingAllEvents(MIXPANEL_EVENTS.reviewscreen_close_backbtn);

    const redirect = searchParams.get('redirect') || routes.ROOT;

    history.push(redirect);
  };

  handleDocTitleClick = (docTitle) => {
    this.docTitleClickCount++;

    if (this.docTitleClickCount === 1) {
      setTimeout(() => {
        this.docTitleClickCount = 0;
      }, 400);
    } else if (this.docTitleClickCount === 2) {
      // Copy just the file name (without extension) when double clicked
      setTimeout(() => {
        if (this.docTitleClickCount === 2) {
          const value = docTitle?.slice(0, docTitle?.lastIndexOf('.'));
          copy(value);
          showToast({
            title: `Copied '${value}' to clipboard!`,
            success: true,
            duration: 3000,
          });
        }
      }, 200);
    } else if (this.docTitleClickCount === 3) {
      // Copy whole file name on triple click
      copy(docTitle);
      showToast({
        title: `Copied '${docTitle}' to clipboard!`,
        success: true,
        duration: 3000,
      });
    }
  };

  renderExtraction = () => {
    const {
      isFetchingData,
      dataFetchFailed,
      docReadOnly,
      sections,
      onSidebarLineItemFieldClick,
      onSidebarFieldInputFocus,
      onSidebarReadOnlyFieldClick,
      onSidebarFieldInputValueChange,
      onSidebarFieldInputFormSubmit,
      onRegionFieldInputValueChange,
      onRegionFieldInputRemoveBtnClick,
      onRegionFieldInputSubmitBtnClick,
      onRegionFieldInputFormSubmit,
      scrollSectionFieldIntoView,
      user,
      config,
      docId,
      docMeta,
    } = this.props;

    const showSkeleton = isFetchingData;
    const showSections = !showSkeleton && !dataFetchFailed;
    return (
      <>
        {showSkeleton ? <SectionListSkeleton /> : null}
        {showSections ? (
          <SectionList
            sections={sections}
            docReadOnly={docReadOnly}
            onSidebarLineItemFieldClick={onSidebarLineItemFieldClick}
            onSidebarFieldInputFocus={onSidebarFieldInputFocus}
            onSidebarReadOnlyFieldClick={onSidebarReadOnlyFieldClick}
            onSidebarFieldInputValueChange={onSidebarFieldInputValueChange}
            onSidebarFieldInputFormSubmit={onSidebarFieldInputFormSubmit}
            onRegionFieldInputValueChange={onRegionFieldInputValueChange}
            onRegionFieldInputRemoveBtnClick={onRegionFieldInputRemoveBtnClick}
            onRegionFieldInputSubmitBtnClick={onRegionFieldInputSubmitBtnClick}
            onRegionFieldInputFormSubmit={onRegionFieldInputFormSubmit}
            scrollSectionFieldIntoView={scrollSectionFieldIntoView}
            user={user}
            config={config}
            docId={docId}
            docMeta={docMeta}
          />
        ) : null}
      </>
    );
  };

  render() {
    const {
      docMeta,
      activeSidebarTab,
      embeddedApp,
      clientApp,
      chataiAccess,
      documentsById,
      docId,
      config,
      docReadOnly,
      moveToEdit,
      isGridEdited,
      overlayClicked,
    } = this.props;
    const allowEditFields = canAccessEditField(config);
    const currentDocument = documentsById[docId] || {};
    let isEditable = !currentDocument?.type?.includes('table_vision');

    let editFieldAccess = allowEditFields && isEditable && !docReadOnly;

    const docTitle = _.get(docMeta, 'title') || '';

    return (
      <aside
        id={'rt-sidebar'}
        className={cx(styles.reviewSidebar, {
          [styles['reviewSidebar--docReadOnly']]: docReadOnly,
        })}
        ref={this.contentRef}
      >
        <div
          className={styles.reviewSidebar__shadow}
          id='js-rt-sidebar-shadow'
        ></div>
        {isGridEdited && (
          <div
            className={styles.sidebarOverlay}
            role='presentation'
            onClick={(e) => {
              e.preventDefault();
              overlayClicked();
            }}
          ></div>
        )}
        <div className={styles.drag} onMouseDown={this.handleMouseDown}>
          <span></span>
          <span></span>
        </div>
        <header className={styles.reviewSidebar__header}>
          <div className={styles['reviewSidebar__header--subheader']}>
            {clientApp || embeddedApp ? (
              <Page className={cx(styles['reviewSidebar__header--iconpage'])} />
            ) : (
              <IconButton
                icon={<ArrowLeft height={17} width={17} strokeWidth={2} />}
                variant='ghost'
                onClick={!moveToEdit && this.handleGoBackClick}
                className={cx(styles['reviewSidebar__header--icon'])}
              />
            )}

            {/* Icon before the title page icon */}
            {docTitle && (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
              <h1
                className={cx(styles['reviewSidebar__header--title'])}
                title={docTitle}
                onClick={() => this.handleDocTitleClick(docTitle)}
                role='presentation'
              >
                <p
                  className={cx(
                    styles['reviewSidebar__header--titleName'],
                    'text-truncate'
                  )}
                >
                  {docTitle?.slice(0, docTitle?.lastIndexOf('.'))}
                </p>
                <p
                  className={styles['reviewSidebar__header--titleExt']}
                >{`.${docTitle?.slice(docTitle?.lastIndexOf('.') + 1)}`}</p>
              </h1>
            )}
          </div>
          <div>
            {embeddedApp || clientApp ? (
              <Tooltip
                placement='right'
                label={
                  embeddedApp
                    ? 'Read more about free tool'
                    : 'Read more about client review tool'
                }
              >
                <a
                  className={cx(styles['reviewSidebar__header--info'])}
                  rel='noopener noreferrer'
                  target='_blank'
                  href={SUPPORT_LINK.CLIENT_REVIEW_TOOL}
                >
                  <InfoEmpty
                    className={styles['reviewSidebar__header--icon2']}
                  />
                </a>
              </Tooltip>
            ) : (
              <IconMenuPortal
                showTooltip={false}
                position='bottom-right'
                menuIcon={<MoreVert height='1.25rem' width='1.25rem' />}
                options={this.shareActions()}
                onDropdownItemClick={this.shareActionsHandler}
              />
            )}
          </div>
        </header>
        {moveToEdit ? (
          <div className={styles.reviewSidebar__loader}>
            <FullPageLoader
              className={cx(styles['reviewSidebar__loader--icon'])}
            />
            <div className={cx(styles['reviewSidebar__loader--text'], 'mt-5')}>
              Please wait, loading Edit Fields...
            </div>
          </div>
        ) : (
          <main
            className={styles.reviewSidebar__content}
            id={'rt-sidebar-content'}
            onScroll={this.handleScroll}
          >
            {chataiAccess ? (
              <Tabs
                tabHeaders={this.sideBarTabHeaders}
                activeTab={activeSidebarTab}
                onTabChange={this.handleTabChange}
                className={styles.reviewSidebar__tabs}
                editFieldAccess={editFieldAccess}
              />
            ) : (
              ''
            )}

            {activeSidebarTab === 'extract' ? this.renderExtraction() : ''}
            {activeSidebarTab === 'chat' ? <Chat /> : ''}
          </main>
        )}
        {this.renderFooter({ showOnlyPagination: activeSidebarTab === 'chat' })}
        <Modal
          size='md'
          className={cx(styles.downloadModal)}
          show={this.state.downloadEmbeddedModal}
          onCloseHandler={() => this.setState({ downloadEmbeddedModal: false })}
        >
          <div className={styles.header}>
            <p>Download</p>
            <IconButton
              variant='text'
              onClick={() => this.setState({ downloadEmbeddedModal: false })}
              icon={Cancel}
              size='small'
              className={styles.header__close}
            />
          </div>
          <div className={cx(styles.headerContent)}>
            <p>Document Name: &nbsp;</p>{' '}
            <span className='text-truncate'>{docTitle}</span>
          </div>
          <div className={styles.modalContent}>
            <div className={cx(styles.download)}>
              <button
                className={styles.download__col}
                onClick={() =>
                  this.handleDownloadBtnClick({ key: 'original_file' })
                }
              >
                <div className={styles.download__iconWrap}>
                  <Page />
                </div>
                <span className={styles.download__label}>Download File</span>
              </button>
            </div>
            <div className={cx(styles.download)}>
              <button
                className={styles.download__col}
                onClick={() => this.handleDownloadBtnClick({ key: 'csv_long' })}
              >
                <div className={styles.download__iconWrap}>
                  <Table2Columns />
                </div>
                <span className={styles.download__label}>Download XLS</span>
              </button>
            </div>
            <div className={cx(styles.download)}>
              <button
                className={styles.download__col}
                onClick={() => this.handleDownloadBtnClick({ key: 'json' })}
              >
                <div className={styles.download__iconWrap}>
                  <PageFlip />
                </div>
                <span className={styles.download__label}>Download JSON</span>
              </button>
            </div>
            <div className={cx(styles.download)}>
              <button
                className={styles.download__col}
                onClick={() => this.handleDownloadTextBtnClick()}
              >
                <div className={styles.download__iconWrap}>
                  <TextAlt />
                </div>
                <span className={styles.download__label}>Download Text</span>
              </button>
            </div>
          </div>
        </Modal>
      </aside>
    );
  }
}

const mapStateToProps = ({
  app: {
    config: { chataiAccess = true, canSwitchToOldMode = true } = {},
    user,
    config,
  },
  documents: { reviewTool = {}, activeSidebarTab = 'extract' } = {},
}) => {
  let selectedField = null;

  if (reviewTool.selectedSectionFieldId) {
    selectedField =
      reviewTool.fieldsById[reviewTool.selectedSectionFieldId] || null;
  }

  return {
    chataiAccess,
    documentsById: reviewTool?.documentsById,
    docId: reviewTool?.docId,
    activeSidebarTab,
    user,
    canSwitchToOldMode,
    config,
    selectedField,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    chatAIActions: bindActionCreators(chatAIActions, dispatch),
    documentActions: bindActionCreators(documentActions, dispatch),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Sidebar)
);
