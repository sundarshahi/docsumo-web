/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import {
  // actionTypes as documentActionTypes,
  actions as documentActions,
} from 'new/redux/documents/actions';
import { showToast } from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import FocusTrap from 'focus-trap-react';
import { ArrowLeft, Cancel, InfoEmpty } from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { ReactComponent as CheckIcon } from 'new/assets/images/icons/check.svg';
import { ReactComponent as CloseIcon } from 'new/assets/images/icons/clear.svg';
import { ReactComponent as DataFetchErrorIcon } from 'new/assets/images/icons/fetch_error.svg';
import { WithTrackingContext } from 'new/components/contexts/tracking';
import {
  TABLE_TRACKING_KEYS,
  TRACKING_HELPER_KEYS,
} from 'new/components/contexts/trackingConstants';
import { default as ErrorConfirmationModal } from 'new/components/modals/ConfirmationModal';
import DeleteConfirmationModal from 'new/components/modals/DeleteConfirmationModal/DeleteConfirmationModal';
import ReviewCompleteModal from 'new/components/modals/ReviewCompleteModal/ReviewCompleteModal';
import SplitScreenOverlay from 'new/components/overlays/SplitScreenOverlay';
import DocumentProcessModal from 'new/components/shared/DocumentProcessModal';
import ConfirmationModal from 'new/components/shared/FiledConfirmationModal';
import KeyboardShortcuts from 'new/components/shared/KeyboardShortcuts/KeyboardShortcuts';
import PageError, {
  DataFetchFailurePageError,
} from 'new/components/shared/PageError';
import * as documentConstants from 'new/constants/document';
import { KEY_CODES } from 'new/constants/keyboard';
import routes from 'new/constants/routes';
import * as documentHelpers from 'new/helpers/documents';
import * as uploadHelper from 'new/helpers/upload';
import {
  CHAMELEON_TOUR_TYPES,
  chameleonGetUserProperty,
  chameleonIdentifyUser,
  chameleonTriggerTour,
  chameleonUpdateUserData,
  CHAMLEON_TOUR_IDS,
} from 'new/thirdParty/chameleon';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import { getOS } from 'new/utils';
import canAccessEditField from 'new/utils/canAccessEditField';
import {
  customMixpanelTracking,
  mixpanelTrackingAllEvents,
} from 'new/utils/mixpanel';

import EditFieldSidebar from './EditFieldSidebar/EditFieldSidebar';
import DocumentViewer from './DocumentViewer';
import FieldArrow from './FieldArrow';
import Footer from './Footer';
import Sidebar from './Sidebar';
import StaticDocumentViewer from './StaticDocumentViewer';

import styles from './index.scss';

const data = [
  {
    childrens: [
      // {
      //     'description': 'Select the value on the document or edit on the value on the left.',
      //     'id': 'tt_review_screen-lable_value',
      //     'position': 'right',
      //     'sequence': 1
      // },
      {
        description:
          'Click on Line Item to review and edit the extracted table.',
        id: 'tt_review_screen-line_item_section',
        position: 'right',
        sequence: 1,
      },
      {
        description:
          'If table is not extracted correctly or at all then click on use table grid.',
        id: 'tt_review_screen-line_item-grid_button',
        position: 'top',
        sequence: 2,
      },
      {
        description:
          'Click and drag table region on the document to capture table.',
        id: 'tt_review_screen-auto_extract_table',
        img: 'autoExtract',
        gif: true,
        position: 'top',
        sequence: 3,
      },
      {
        description: 'Stretch table grid to add missing rows or columns.',
        id: 'tt_review_screen-line_grid-stretching',
        img: 'stretch',
        gif: true,
        position: null,
        sequence: 4,
      },
      {
        description:
          'Click anywhere on this selector to add a column separator',
        id: 'tt_review_screen-line_grid-add_column',
        img: 'addColumn',
        gif: true,
        position: 'left',
        sequence: 5,
      },
      {
        description: 'Click anywhere on this selector to add a row separator',
        id: 'tt_review_screen-line_grid-add_row',
        img: 'addRow',
        gif: true,
        position: 'bottom',
        sequence: 6,
      },
      // {
      //     'description': 'Hover over row and click on X to ignore any row data while extracting out from grid.',
      //     'id': 'tt_review_screen-line_grid-ignore_row_data',
      //     'img': 'ignore',
      //     'gif': true,
      //     'position': 'bottom',
      //     'sequence': 8
      // },
      {
        description: 'Click on link icon to assign column header.',
        id: 'tt_review_screen-line_grid-header_of_column',
        img: 'assignHeader',
        gif: true,
        position: 'top',
        sequence: 7,
      },
      {
        description: 'Click on render data from table to extract the data.',
        id: 'tt_review_screen-line_grid-extract_data',
        position: 'top',
        sequence: 8,
      },
      {
        description: 'Download the file in desired format.',
        id: 'tt_review_screen_download_format',
        sidebar: true,
        position: 'top',
        sequence: 9,
      },
    ],
    sequence: 1,
    title: 'Review Document',
  },
];

const ocrData = [
  {
    childrens: [
      {
        description:
          'Select the value on the document or edit on the value on the left.',
        id: 'tt_review_screen-lable_value',
        position: 'right',
        img: 'selectRegion',
        gif: 'true',
        sequence: 1,
      },
      {
        description: 'Download the file in desired format.',
        id: 'tt_review_screen_download_format',
        sidebar: true,
        position: 'top',
        sequence: 2,
      },
    ],
    sequence: 1,
    title: 'Review Document',
  },
];
const querySearchParams = new URLSearchParams(window.location.search);
const customDocType = querySearchParams.get('customDocType') || false;
class ReviewDocumentOverlay extends Component {
  constructor(props) {
    super(props);
    this.defaultDocState = {
      documentDomRect: null,
      sectionFieldDomRectById: {},

      documentPageImagesLoaded: [],
      documentPageImagesErred: [],

      // To be updated
      region: null,

      allDocumentImagesLoaded: false,
      reviewConfirmation: false,
    };
    // Move the query parameter check inside the constructor
    const querySearchParams = new URLSearchParams(window.location.search);
    const customDocType = querySearchParams.get('customDocType') || false;

    // Entire state
    this.state = {
      windowInnerWidth: null,
      windowInnerHeight: null,
      ...this.defaultDocState,
      isLabelSelected: true,
      isTab: false,
      slug: null,
      section: {
        p_title: null,
        id: null,
      },
      key: {
        fieldId: null,
        label: null,
      },
      value: {
        fieldId: null,
      },
      slugs: {
        sectionSlug: null,
        keySlug: null,
        valueSlug: null,
      },
      showAlertModal: false,
      alertContent: '',
      alertResponse: null,
      gridView: false,
      currentPage: 1,
      embeddedApp: false,
      clientApp: false,
      allDocument: false,
      oneDocument: false,
      deleteDoc: false,
      isDeleting: false,
      confirmErrorMessage: '',
      progressValue: 0,
      skippedDocs: [],
      userflowStart: false,
      prevActionList: [],
      nextActionList: [],
      showKeyboardTip: false,
      fieldErrorMessage: false,
      allPageHeights: [0],
      bboxClickType: 'field_click',
      isRegionChanging: false,
      showUnsavedChangesModal: false,
      customDocType,
    };

    // For field input edit GA event
    this.gaLastFieldEditEventFieldId = null;
    this.gaLastFieldEditEventSection = null;

    this.redirectTimer = null;
    this.closeKeyboardTimer = null;
    this.undoTimer = null;
    this.redoTimer = null;
    this.singleReviewTimer = null;
    this.enterEventTimeoutRef = null;
    this.reviewGoToDocTimer = null;
    this.scrollFieldRegionBboxIntoViewTimer = null;
    this.removeDocFromStackTimer = null;
    this.focusDomElTimer = null;
    this.scrollDomElIntoViewTimer = null;
    this.updateFieldDataTimer = null;
    this.getDocDataTimer1 = null;
    this.getDocDataTimer2 = null;
    this.regionFieldInputRemoveTimer = null;
    this.finishDocReviewTimer = null;
  }

  addMixpanelTrackingForTours = (mixpanelEvent) => {
    const { userflowStart } = this.state;
    const {
      docMeta = {},
      user,
      config: { canSwitchToOldMode = true },
    } = this.props;

    mixpanel.track(mixpanelEvent, {
      docId: docMeta?.docId,
      label: docMeta?.title,
      'document type': docMeta?.type,
      'work email': user.email,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
      startReviewTour: userflowStart,
    });
  };

  startProductTour = () => {
    const {
      user,
      docMeta = {},
      config: { canSwitchToOldMode = true },
    } = this.props;
    this.setState({ userflowStart: true });

    mixpanel.track(MIXPANEL_EVENTS.start_review_tour, {
      docId: docMeta?.docId,
      label: docMeta?.title,
      'document type': docMeta?.type,
      'work email': user.email,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    // Reset all onboarding tooltips for review screen
    chameleonUpdateUserData(
      user.userId,
      {
        [CHAMELEON_TOUR_TYPES.reviewScreenPhase1]: true,
        [CHAMELEON_TOUR_TYPES.reviewScreenPhase2]: true,
        [CHAMELEON_TOUR_TYPES.reviewScreenPhase3_noGrids]: true,
        [CHAMELEON_TOUR_TYPES.reviewScreenPhase3_tableGrid]: true,
        [CHAMELEON_TOUR_TYPES.reviewScreenPhase4]: true,
        [CHAMELEON_TOUR_TYPES.reviewScreenPhase5]: true,
        [CHAMELEON_TOUR_TYPES.reviewScreenPhase6]: true,
      },
      true
    );

    // Start review screen tour
    chameleonTriggerTour(
      CHAMLEON_TOUR_IDS.reviewScreenPhase1,
      CHAMELEON_TOUR_TYPES.reviewScreenPhase1,
      () =>
        this.addMixpanelTrackingForTours(MIXPANEL_EVENTS.review_screen_phase_1)
    );
  };

  popupOnce = () => {
    const { appActions } = this.props;
    this.handleCloseGrid();
    // eslint-disable-next-line compat/compat
    const parsedUrl = new URL(window.location.href);
    const client = parsedUrl.searchParams.get('client');
    const { documentsById, documentIds } = this.props;
    const documents = documentIds.map((documentId) => {
      return documentsById[documentId];
    });
    const {
      setHelpTTSequence,
      setLocalConfigFlags,
      setTooltipFlowModal,
      setFreetoolTooltipData,
    } = appActions;
    if (sessionStorage.getItem('tempToken') && !client) {
      if (sessionStorage.getItem('popupOnce') !== 'true') {
        if (documents[0].type === 'others__frYRR') {
          setFreetoolTooltipData({
            data: ocrData,
          });
        } else {
          setFreetoolTooltipData({
            data,
          });
        }
        setLocalConfigFlags({
          showTooltipFlow: true,
        });
        setTooltipFlowModal(true);
        setHelpTTSequence({ sequence: 1, childSequence: 1 });
      }
      if (documents[0].type === 'others__frYRR') {
        setFreetoolTooltipData({
          data: ocrData,
        });
      } else {
        setFreetoolTooltipData({
          data,
        });
      }
      sessionStorage.setItem('popupOnce', 'true');
    }
  };

  UNSAFE_componentWillMount() {
    this.setWindowDimensions();

    const appEnvironment = global.window.location.origin;
    const { pathname, search } = this.props.history.location;

    // eslint-disable-next-line compat/compat
    const parsedUrl = new URL(window.location.href);
    const client = parsedUrl.searchParams.get('client');
    const disableBbox = parsedUrl.searchParams.get('bbox_disable');
    if (disableBbox) {
      this.setState({
        bboxDisable: true,
      });
    }
    if (sessionStorage.getItem('tempToken') && !client) {
      this.setState({
        embeddedApp: true,
        urlName: `${appEnvironment}${pathname}${search}`,
      });
    } else if (sessionStorage.getItem('tempToken') && client) {
      this.setState({
        embeddedApp: false,
        clientApp: true,
      });
    }
  }

  handlePopState = () => {
    //browser back button on review screen

    const { location } = this.props;
    const searchParams = new URLSearchParams(location?.search);
    if (searchParams?.get('slug')) {
      this.props.history.goBack();
    } else {
      const newDocId = location.pathname.split('/')[2];

      this.reviewGoToDocument({ docId: newDocId });
    }
  };

  async componentDidMount() {
    const {
      documentIds,
      location,
      match,
      documentsById,
      user,
      config,
      docMeta,
    } = this.props;

    let startDocId = _.get(location, 'state.startDocId');
    const searchParams = new URLSearchParams(location?.search);
    const slug = _.get(location, 'state.slug') || searchParams?.get('slug');
    const docType =
      _.get(location, 'state.docType') || searchParams?.get('docType');
    const origin = _.get(location, 'state.origin');
    startDocId =
      startDocId || _.get(match, 'params.docId') || _.keys(documentsById)[0];

    if (!startDocId && (!documentIds || _.isEmpty(documentIds))) {
      return this.handleCloseBtnClick();
    }
    window.addEventListener('popstate', this.handlePopState);

    await this.setState(
      {
        docType: docType || docMeta?.type,
        slug,
      },
      () => {
        !this.state.slug &&
          this.setState({
            isLabelSelected: false,
          });
      }
    );

    if (
      !startDocId ||
      (!_.isEmpty(documentIds) && !documentIds.includes(startDocId))
    ) {
      startDocId = documentIds[0];
    }

    document.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('resize', this.handleWindowResize);
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    // indentify user in Chameleon
    // in case user data is gone
    chameleonIdentifyUser(user, config);

    //calling API only for review screen to get all documents
    // only call API if it's not have ids
    if (!slug && startDocId) {
      if (!_.isEmpty(documentIds)) {
        await this.reviewGoToDocument({
          docId: startDocId,
          slug,
          doc_type: docType || docMeta?.type,
          origin: 'Review Document',
        });
      } else {
        await this.props.documentActions.rtStartSignleReview({
          docId: startDocId,
          onSuccess: () => {
            this.reviewGoToDocument({
              docId: startDocId,
              slug,
              doc_type: docType || docMeta?.type,
              origin: 'Review Document',
            });
          },
        });
      }
    } else if (slug && _.isEmpty(documentIds) && startDocId) {
      if (!this.state.customDocType) {
        await this.props.documentActions.rtStartEditField({
          docType: docType || docMeta?.type,
          slug: 'editField',
          docId: startDocId,
          origin: 'Edit Document',
          shouldPushHistory: false,
          afterAction: () => {
            this.props.documentActions.rtGetLoadDocumentData({
              docId: startDocId,
              docType: docType,
              slug: slug,
              handleInputFocus: () => {
                this.handleTabKeyDown({
                  shiftKey: false,
                });
              },
            });
          },
        });
      }

      // Start tour for Edit fields screen
      // When user reloads Edit Fields screen
      if (this.state.customDocType) {
        chameleonTriggerTour(
          CHAMLEON_TOUR_IDS.customDoctype,
          CHAMELEON_TOUR_TYPES.customDoctype
        );
      } else {
        chameleonTriggerTour(
          CHAMLEON_TOUR_IDS.editFieldsPhase1,
          CHAMELEON_TOUR_TYPES.editFieldsPhase1,
          () =>
            this.addMixpanelTrackingForTours(
              MIXPANEL_EVENTS.edit_fields_phase_1
            )
        );
      }
    } else if (!_.isEmpty(documentIds)) {
      if (!this.state.customDocType) {
        await this.reviewGoToDocument({
          docId: startDocId,
          slug,
          doc_type: docType,
          origin: 'Review Document',
        });
      }

      if (slug === 'editField') {
        // Start tour for Edit fields screen
        // When user clicks on Edit button in Doc type card

        if (this.state.customDocType) {
          chameleonTriggerTour(
            CHAMLEON_TOUR_IDS.customDoctype,
            CHAMELEON_TOUR_TYPES.customDoctype
          );
        } else {
          chameleonTriggerTour(
            CHAMLEON_TOUR_IDS.editFieldsPhase1,
            CHAMELEON_TOUR_TYPES.editFieldsPhase1,
            () =>
              this.addMixpanelTrackingForTours(
                MIXPANEL_EVENTS.edit_fields_phase_1
              )
          );
        }
      } else {
        // Start tour for review screen only
        const showStep1 = chameleonGetUserProperty(
          CHAMELEON_TOUR_TYPES.reviewScreenPhase1
        );
        const showStep2 = chameleonGetUserProperty(
          CHAMELEON_TOUR_TYPES.reviewScreenPhase2
        );

        if (showStep1 === undefined || showStep2 === undefined) {
          // undefined value is for old users
          return;
        } else if (!showStep1 && showStep2) {
          chameleonTriggerTour(
            CHAMLEON_TOUR_IDS.reviewScreenPhase2,
            CHAMELEON_TOUR_TYPES.reviewScreenPhase2,
            () =>
              this.addMixpanelTrackingForTours(
                MIXPANEL_EVENTS.review_screen_phase_2
              )
          );
        } else {
          chameleonTriggerTour(
            CHAMLEON_TOUR_IDS.reviewScreenPhase1,
            CHAMELEON_TOUR_TYPES.reviewScreenPhase1,
            () =>
              this.addMixpanelTrackingForTours(
                MIXPANEL_EVENTS.review_screen_phase_1
              )
          );
        }
      }
    }

    // Start tour for review screen only
    const showStep1 = chameleonGetUserProperty(
      CHAMELEON_TOUR_TYPES.reviewScreenPhase1
    );
    const showStep2 = chameleonGetUserProperty(
      CHAMELEON_TOUR_TYPES.reviewScreenPhase2
    );

    if (showStep1 === undefined || showStep2 === undefined) {
      // undefined value is for old users
      return;
    } else if (!showStep1 && showStep2) {
      chameleonTriggerTour(
        CHAMLEON_TOUR_IDS.reviewScreenPhase2,
        CHAMELEON_TOUR_TYPES.reviewScreenPhase2,
        () =>
          this.addMixpanelTrackingForTours(
            MIXPANEL_EVENTS.review_screen_phase_2
          )
      );
    } else {
      chameleonTriggerTour(
        CHAMLEON_TOUR_IDS.reviewScreenPhase1,
        CHAMELEON_TOUR_TYPES.reviewScreenPhase1,
        () =>
          this.addMixpanelTrackingForTours(
            MIXPANEL_EVENTS.review_screen_phase_1
          )
      );
    }
  }

  setAlertBoxText = (docId) => {
    const { documents } = this.props;
    let { progressValue } = this.state;
    let secondsToGo = 15;
    const interval = setInterval(() => {
      if (
        this.props.documentsById[docId] &&
        this.props.documentsById[docId].status ===
          documentConstants.STATUSES.NEW
      ) {
        if (secondsToGo) {
          progressValue += 2;
          secondsToGo -= 1;
        } else {
          progressValue = 70;
        }
        this.setState({
          progressValue,
        });
      } else {
        clearInterval(interval);
        this.setState({
          showAlertModal: false,
          progressValue: 100,
        });
        if (documents && documents.length === 1) {
          this.props.documentActions.rtStartSignleReview({
            docId,
          });
        } else {
          this.props.documentActions.updateReview({
            docId,
          });
        }
        this.reviewGoToDocTimer = setTimeout(() => {
          this.reviewGoToDocument({ docId });
        }, 1000);
      }
    }, 1000);
  };

  reviewGoToDocument = async (params, navType = '') => {
    const { skippedDocs } = this.state;
    const document = this.props.documents.find(
      (e) => !e.docId || e.docId === params.docId
    );
    if (
      (document && document.status === documentConstants.STATUSES.NEW) ||
      (document && document.status === documentConstants.STATUSES.PROCESSING)
    ) {
      this.setState({
        showAlertModal: true,
      });
      this.setAlertBoxText(document && document.docId);
    } else if (
      (document && document.status === documentConstants.STATUSES.ERRED) ||
      (document && document.status === documentConstants.STATUSES.DELETED)
    ) {
      const skippedDocsList = [...skippedDocs, document.title];
      this.setState({ skippedDocs: skippedDocsList });
      const toastMessage = (
        <span>
          The document <strong>{skippedDocsList.join(', ')}</strong> was skipped
          due to Erred status. Go to{' '}
          <Link
            to={routes.ALL}
            className={cx(styles.text, 'text-sm font-semi-bold')}
          >
            My Documents
          </Link>{' '}
          to view all documents.
        </span>
      );
      showToast({
        title: toastMessage,
        duration: 6000,
        position: 'right',
        error: true,
      });
      this.goToNextDocument(
        {
          closeIfNotFound: true,
        },
        params.docId,
        navType
      );
    } else {
      this.setState({ skippedDocs: [] });
      await this.props.documentActions.rtGoToDocument(params);
    }
  };

  handleGridView = (gridView, index = '') => {
    const { config } = this.props;
    const { canSwitchToOldMode = true } = config || {};
    this.handleRegionChange({
      x: -100,
      y: -100,
      width: 0,
      height: 0,
    });
    if (gridView) {
      const {
        documentActions,
        selectedSectionFieldId: parentId,
        docId,
        selectedSectionField: { parentId: pid },
        docMeta,
        user,
      } = this.props;

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.edit_grid, {
        docId: docId,
        label: docMeta?.title,
        docType: docMeta?.type,
        role: user?.role,
        'work email': user?.email,
        'line item id': parentId,
        'grid id': index, // To Replace this with grid id if data from backend is sent
        version: 'new',
        companyName: user?.companyName,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    }

    this.setState({
      gridView,
    });
  };

  setGridViewMode = (value) => {
    this.setState({ gridView: value });
  };

  handleRemoveGrid = (query) => {
    const {
      selectedSectionFieldId: parentId,
      documentActions,
      handleDelayedTableTracking,
      grids,
      fieldsById,
    } = this.props;
    const { index = 0, page } = query;

    documentActions.rtUpdateGridData({
      grids: page === -1 ? [] : grids?.filter((_, idx) => idx !== index),
    });

    handleDelayedTableTracking({
      name: parentId,
      fieldLabel: fieldsById[parentId]?.label,
      key: TABLE_TRACKING_KEYS.tableGrid,
      action: TRACKING_HELPER_KEYS.deleted,
      gridValue: { ...query },
    });
  };

  handleCloseGrid = () =>
    this.setState({ gridView: false }, () => {
      const { documentActions, originalGrids } = this.props;
      documentActions.rtUpdateGridData({
        grids: _.cloneDeep(originalGrids),
        copiedPage: null,
      });
    });

  async componentDidUpdate(prevProps, prevState) {
    const {
      docId,
      docMeta,
      selectedSectionFieldId,
      selectedFieldId,
      sections,
      isFetchingData,
      match,
      selectedSectionField,
      location,
      documentActions,
      config: { flags } = {},
      fieldsById,
    } = this.props;

    const { showKeyboardNavigationTipsPopup = true } = flags || {};
    const searchParams = new URLSearchParams(location?.search);
    const { zoom } = this.state;
    const {
      docId: prevDocId,
      docMeta: prevDocMeta,
      selectedSectionFieldId: prevSelectedSectionFieldId,
      selectedFieldId: prevSelectedFieldId,
      isFetchingData: prevIsFetchingData,
      documentIds: prevDocumentsId,
      selectedSectionField: prevSelectedSectionField,
      location: prevLocation,
    } = prevProps;

    /**
     * Whenever switch between review document and edit fields happens, it triggers refetch that is respective of their page
     */
    const docType =
      this.props.docMeta?.type ||
      _.get(location, 'state.docType') ||
      searchParams?.get('docType');

    if (location.search !== prevLocation.search) {
      const searchParams = new URLSearchParams(location.search);
      const isEditField = searchParams.get('slug') === 'editField';
      /* Reset loader flag once moved to edit field from the review screen*/
      isEditField &&
        this.setState({
          moveToEdit: false,
        });

      !isEditField &&
        this.setState({
          isLabelSelected: false,
        });

      this.reviewGoToDocument({
        docId,
        slug: isEditField ? 'editField' : '',
        doc_type: docType,
      });
    }

    const slug = _.get(location, 'state.slug') || searchParams?.get('slug');

    if (location && prevLocation && location !== prevLocation) {
      this.setState({
        slug,
        reviewConfirmation: false,
        cancelConfirmation: false,
        fieldErrorMessage: false,
      });
    }

    const { zoom: prevZoom } = prevState;

    if (sections.length > prevProps.sections.length && prevProps.sections) {
      const section = _.last(sections);
      const offsetPos =
        document.getElementById(section && section.id) &&
        document.getElementById(section && section.id).offsetTop;
      document.getElementById('rt-sidebar-content') &&
        document.getElementById('rt-sidebar-content').scroll({
          top: offsetPos,
          left: 0,
          behavior: 'instant',
        });
    }

    if (docId && docId !== prevDocId) {
      let currentPage = 1;
      this.handlePageChange(currentPage);

      // Document has changed
      this.setState(this.defaultDocState);

      // If there are no section field Ids, it will
      // reset the state to empty object
      this.setSectionFieldsDomRectData();

      // Reset GA event tracking
      this.gaLastFieldEditEventFieldId = null;
      this.gaLastFieldEditEventSection = null;

      // Update grid copied page and gridId
      documentActions.setCopiedPage({
        copiedPage: null,
        copiedGridId: null,
      });

      return;
    }

    if (docMeta && prevDocMeta && docMeta.status !== prevDocMeta.status) {
      if (docMeta.status === documentConstants.STATUSES.REVIEWING) {
        const { locations } = this.getPrevAndNextLocations();
        const firstLocation = locations[0];
        firstLocation && this.moveToLocation(firstLocation);
      }
    }

    if (zoom !== prevZoom) {
      // Zoom has changed in same document
      this.setDocumentDomRectData();
      // TODO
      // Scroll region into view
    }

    if (isFetchingData !== prevIsFetchingData) {
      // Now all document elements are being displayed
      this.setSectionFieldsDomRectData();
      this.setDocumentDomRectData();

      if (!selectedFieldId) {
        // Select the first field
        const { locations } = this.getPrevAndNextLocations();
        const firstLocation = locations[0];
        firstLocation && this.moveToLocation(firstLocation);
      }
    }

    // if (_.isEmpty(prevSectionFieldIds) && !_.isEmpty(sectionFieldIds)) {
    //     // Data has been fetched for a document
    //     this.setSectionFieldsDomRectData();
    // }

    if (
      selectedSectionFieldId &&
      selectedSectionFieldId !== prevSelectedSectionFieldId
    ) {
      // A new section field has been selected
      this.props.documentActions.rtUpdateFieldData({
        fieldId: prevSelectedSectionFieldId,
        updates: {
          isExpand: false,
        },
      });
      const { type = '' } = fieldsById[selectedSectionFieldId] || {};
      if (type !== 'line_item') {
        documentActions.rtSetCurrentGridId({
          gridId: null,
        });
      }
      this.setSectionFieldsDomRectData();
      this.scrollSectionFieldIntoView(selectedSectionFieldId);
    }

    if (selectedFieldId !== prevSelectedFieldId) {
      // A new field field has been selected
      this.scrollFieldRegionBboxIntoViewTimer = setTimeout(() => {
        // Delay to let the focus event complete
        this.scrollFieldRegionAndBboxIntoView(
          selectedSectionFieldId,
          selectedFieldId
        );
      }, 100);
    }

    // Check if document has been deleted
    if (docMeta && docMeta.deleted) {
      if (docId === prevDocId && !prevDocMeta.deleted) {
        this.goToNextDocument({
          closeIfNotFound: true,
        });

        this.removeDocFromStackTimer = setTimeout(() => {
          this.props.documentActions.rtRemoveDocumentFromStack({
            docId,
          });
        }, 30);
      }
    }

    if (
      selectedSectionField &&
      prevSelectedSectionField &&
      selectedSectionField.type !== prevSelectedSectionField.type
    ) {
      this.handleGridView(false);
    }

    if (selectedSectionFieldId !== prevSelectedSectionFieldId) {
      this.handleGridView(false);
      let manualAnnotation = localStorage.getItem('manualAnnotation') || 0;
      if (showKeyboardNavigationTipsPopup) {
        if (this.state.showKeyboardTip || parseInt(manualAnnotation) < 5) {
          return;
        } else {
          this.setState({ showKeyboardTip: true });
          this.closeKeyboardTimer = setTimeout(() => {
            this.closeKeyboardTip();
          }, 8000);
        }
      }
    }
  }

  closeKeyboardTip = async () => {
    const { appActions } = this.props;
    await api.updateConfigFlags({
      payload: { show_keyboard_navigation_tips_popup: false },
    });
    appActions.setLocalConfigFlags({
      showKeyboardNavigationTipsPopup: false,
    });
    localStorage.setItem('manualAnnotation', 0);
    this.setState({ showKeyboardTip: false });
  };

  componentWillUnmount() {
    const { userflowStart } = this.state;
    const { user } = this.props;
    window.removeEventListener('resize', this.handleWindowResize);
    window.removeEventListener('popstate', this.handlePopState);
    document.removeEventListener('keydown', this.handleKeyDown);

    window.removeEventListener('beforeunload', this.handleBeforeUnload);

    this.props.documentActions.setActiveSidebarTab('extract');
    this.props.documentActions.resetReviewTool();

    const { handleTrackingSubmit } = this.props;
    handleTrackingSubmit();

    // Update grid copied page and grid id
    documentActions.setCopiedPage({
      copiedPage: null,
      copiedGridId: null,
    });

    if (userflowStart) {
      // Hide all onboarding tooltips for review screen
      // if user leaves page after starting tour manually
      chameleonUpdateUserData(
        user.userId,
        {
          [CHAMELEON_TOUR_TYPES.reviewScreenPhase1]: false,
          [CHAMELEON_TOUR_TYPES.reviewScreenPhase2]: false,
          [CHAMELEON_TOUR_TYPES.reviewScreenPhase3_noGrids]: false,
          [CHAMELEON_TOUR_TYPES.reviewScreenPhase3_tableGrid]: false,
          [CHAMELEON_TOUR_TYPES.reviewScreenPhase4]: false,
          [CHAMELEON_TOUR_TYPES.reviewScreenPhase5]: false,
          [CHAMELEON_TOUR_TYPES.reviewScreenPhase6]: false,
        },
        true
      );
    }
    clearTimeout(this.redirectTimer);
    clearTimeout(this.closeKeyboardTimer);
    clearTimeout(this.undoTimer);
    clearTimeout(this.redoTimer);
    clearTimeout(this.singleReviewTimer);
    clearTimeout(this.enterEventTimeoutRef);
    clearTimeout(this.removeDocFromStackTimer);
    clearTimeout(this.scrollFieldRegionBboxIntoViewTimer);
    clearTimeout(this.focusDomElTimer);
    clearTimeout(this.scrollDomElIntoViewTimer);
    clearTimeout(this.updateFieldDataTimer);
    clearTimeout(this.getDocDataTimer1);
    clearTimeout(this.getDocDataTimer2);
    clearTimeout(this.regionFieldInputRemoveTimer);
    clearTimeout(this.finishDocReviewTimer);
    clearTimeout(this.reviewGoToDocTimer);
  }

  gaTrackFieldValueEdit = ({ fieldId, section }) => {
    if (
      this.gaLastFieldEditEventFieldId === fieldId &&
      this.gaLastFieldEditEventSection === section
    ) {
      return;
    }

    this.gaLastFieldEditEventFieldId = fieldId;
    this.gaLastFieldEditEventSection = section;
  };

  handleWindowResize = _.throttle(
    () => {
      this.setWindowDimensions();
      this.handleSidebarResize();

      // Update doc dom rect if there is an existing value
      if (this.state.documentDomRect) {
        this.setDocumentDomRectData();
      }
    },
    60,
    { trailing: true }
  );

  setWindowDimensions = () => {
    this.setState({
      windowInnerWidth: window.innerWidth,
      windowInnerHeight: window.innerHeight,
    });
  };

  getNextDocId = (docId, navType = '') => {
    const { documentIds } = this.props;

    if (!docId || !documentIds) {
      return null;
    }

    const totalDocCount = documentIds.length;
    const currentDocIndex = documentIds.indexOf(docId);

    if (currentDocIndex >= 0 && currentDocIndex < totalDocCount - 1) {
      if (navType && navType === 'prev') {
        return documentIds[currentDocIndex - 1];
      } else {
        return documentIds[currentDocIndex + 1];
      }
    }

    return null;
  };

  goToNextDocument = async (
    { closeIfNotFound = false } = {},
    skippedDocId = '',
    navType = ''
  ) => {
    const {
      history: { location },
      docId,
    } = this.props;
    const id = skippedDocId || docId;
    const nextDocId = this.getNextDocId(id, navType);

    // Don't move to next document when Onboarding flow is in progress
    if (location && location.pathname && location.pathname === routes.ALL) {
      return;
    }

    if (nextDocId) {
      if (this.state.slug && this.state.slug === 'editField') {
        await this.props.documentActions.rtGetLoadDocumentData({
          docId: nextDocId,
          slug: this.state.slug,
          docType: this.state.docType,
          handleInputFocus: () => {
            this.handleTabKeyDown({
              shiftKey: false,
            });
          },
        });
      }
      this.reviewGoToDocument(
        {
          docId: nextDocId,
        },
        navType
      );
    } else {
      if (closeIfNotFound) {
        this.closeReviewTool();
      }
    }
  };
  handleBeforeUnload = async (event) => {
    const { editFieldChanges, handleTrackingSubmit } = this.props;
    if (editFieldChanges && this.state.slug === 'editField') {
      event.preventDefault();
      event.returnValue = '';
    }
    await handleTrackingSubmit();
  };

  closeReviewTool = () => {
    const { originLocation } = this.props;
    const { slug } = this.state;
    if (slug === 'editField') {
      this.props.history.goBack();
      return;
    }
    if (originLocation) {
      this.props.history.push(originLocation.pathname + originLocation.search);
    } else {
      this.props.history.push(routes.ROOT);
    }
  };

  fieldHasRegion = ({ fieldId }) => {
    const field = this.props.fieldsById[fieldId];
    if (field && field.uiRectangle && !_.isEmpty(field.uiRectangle)) {
      return true;
    }
    return false;
  };

  generateLocationList = () => {
    const {
      docReadOnly,
      sectionFieldIds,
      fieldsById,
      lineItemRowsById,
      collapsedSectionIds,
      sectionsById,
      hideFooterEmptyColumn,
    } = this.props;

    const locations = [];

    sectionFieldIds.forEach((sectionFieldId) => {
      const sectionField = fieldsById[sectionFieldId];

      const currentSection = Object.values(sectionsById).find((section) =>
        section?.fieldIds.includes(sectionFieldId)
      );
      const currentFieldIndexInSection =
        currentSection?.fieldIds.indexOf(sectionFieldId);

      const isSectionCollapsed = collapsedSectionIds.includes(
        currentSection?.id
      );

      /**
       * push only one sectionId for collapsed sections
       */
      if (isSectionCollapsed) {
        if (currentFieldIndexInSection === 0) {
          locations.push({
            sectionId: currentSection.id,
            sectionFieldId: null,
            lineItemRowId: null,
            fieldId: null,
            lineItemFooterBtn: null,
          });
        }

        if (currentFieldIndexInSection > -1) return;
      }

      if (sectionField.type === documentConstants.FIELD_TYPES.LINE_ITEM) {
        const columnIds = sectionField.lineItemColumns;

        this.state.slug &&
          columnIds &&
          columnIds.forEach((column) => {
            locations.push({
              sectionFieldId,
              lineItemRowId: column.id,
              fieldId: column.id,
              lineItemFooterBtn: null,
            });
          });

        const gridIds = sectionField?.gridIds || [];

        gridIds.length &&
          gridIds.forEach((gridId) => {
            const rowIds = this.props.footerGridsById[gridId]?.rowIds || [];

            rowIds &&
              rowIds.forEach((rowId) => {
                const rowFieldIds = lineItemRowsById[rowId].fieldIds;

                rowFieldIds.forEach((rowFieldId) => {
                  if (hideFooterEmptyColumn) {
                    const field = fieldsById[rowFieldId];
                    const column = field.label;

                    const isColumnVisible =
                      sectionField.columnFieldIds[column].length > 0;

                    if (isColumnVisible) {
                      locations.push({
                        sectionFieldId,
                        lineItemRowId: rowId,
                        fieldId: rowFieldId,
                        gridId: gridId,
                        lineItemFooterBtn: null,
                      });
                    }
                  } else {
                    locations.push({
                      sectionFieldId,
                      lineItemRowId: rowId,
                      fieldId: rowFieldId,
                      gridId: gridId,
                      lineItemFooterBtn: null,
                    });
                  }
                });
              });
          });

        // if (!docReadOnly) {
        //   // Add new line button
        //   locations.push({
        //     sectionFieldId,
        //     sidebarItemId: null,
        //     lineItemRowId: null,
        //     fieldId: null,
        //     lineItemFooterBtn: 'add-new-line',
        //   });
        // }
      } else {
        locations.push({
          sectionFieldId,
          lineItemRowId: null,
          fieldId: sectionFieldId,
          lineItemFooterBtn: null,
        });
      }
    });

    return locations;
  };

  getPrevAndNextLocations = () => {
    const {
      selectedSectionFieldId,
      selectedLineItemRowId,
      selectedFieldId,
      selectedLineItemFooterBtn,
      selectedSectionId,
    } = this.props;
    let prevLocation = null;
    let nextLocation = null;
    const locations = this.generateLocationList();

    let currentLocationIndex = -1;
    let lineItem = false;
    for (const [index, location] of locations.entries()) {
      const {
        sectionFieldId,
        lineItemRowId,
        fieldId,
        lineItemFooterBtn,
        sectionId = null,
      } = location;

      if (
        sectionFieldId === selectedSectionFieldId &&
        lineItemRowId === selectedLineItemRowId &&
        fieldId === selectedFieldId &&
        lineItemFooterBtn === selectedLineItemFooterBtn &&
        sectionId === selectedSectionId
      ) {
        if (lineItemRowId) {
          lineItem = true;
        } else {
          lineItem = false;
        }
        currentLocationIndex = index;
        break;
      }
    }

    if (currentLocationIndex > -1) {
      const isFirstLocation = currentLocationIndex === 0;
      const isLastLocation = currentLocationIndex === locations.length - 1;

      if (isFirstLocation) {
        prevLocation = _.last(locations);
        nextLocation = locations[currentLocationIndex + 1];
      } else if (isLastLocation) {
        prevLocation = locations[currentLocationIndex - 1];
        nextLocation = _.first(locations);
      } else {
        prevLocation = locations[currentLocationIndex - 1];
        nextLocation = locations[currentLocationIndex + 1];
      }
    } else {
      prevLocation =
        locations[
          locations.findIndex(
            (item) => item.sectionFieldId === selectedFieldId
          ) || 0
        ];
      nextLocation =
        locations[
          locations.findIndex(
            (item) => item.sectionFieldId === selectedFieldId
          ) + 1 || 1
        ];
    }

    return {
      locations,
      currentLocationIndex,
      prevLocation,
      nextLocation,
    };
  };

  focusDomElementById = (elementId, tryCount = 1) => {
    const domEl = document.getElementById(elementId);

    const fieldId = elementId.split('-').reverse()[0];
    const isFirstFieldId =
      fieldId && this.props.sectionFieldIds[0] === Number(fieldId);

    if (domEl) {
      /**
       * Scrolling to top only for first elements
       */
      if (isFirstFieldId) {
        this.scrollDomElementIntoViewById(elementId);
      }
      domEl.focus();
    } else {
      if (tryCount < 2) {
        this.focusDomElTimer = setTimeout(() => {
          this.focusDomElementById(elementId, ++tryCount);
        }, 1000);
      }
    }
  };

  scrollDomElementIntoViewById = (elementId, tryCount = 1) => {
    const domEl = document.getElementById(elementId);
    if (domEl) {
      domEl.scrollIntoView(false);
    } else {
      if (tryCount < 2) {
        this.scrollDomElIntoViewTimer = setTimeout(() => {
          this.scrollDomElementIntoViewById(elementId, ++tryCount);
        }, 50);
      }
    }
  };

  handleUpdateLabelSlug = ({ isLabelSelected }) => {
    this.setState({
      isLabelSelected,
    });
  };

  focusSidebarFieldInput = ({ fieldId, disableInputFocus }) => {
    if (disableInputFocus) return;

    this.focusDomElementById(`sidebar-field-input-${fieldId}`);
  };

  focusLineItemFieldInput = ({ fieldId }, isTab) => {
    const { slug } = this.state;
    if (slug === 'editField' || isTab) {
      this.focusDomElementById(`line-item-field-input-${fieldId}`);
    }
  };

  // To remove
  focusFieldRegionInput = ({ fieldId }) => {
    this.focusDomElementById(`bbox-field-input-${fieldId}`);
  };

  scrollSectionFieldIntoView = (sectionFieldId) => {
    const { fieldsById } = this.props;
    let field = fieldsById[sectionFieldId];
    if (!(field && field.uiPosition) || _.isEmpty(field && field.uiPosition)) {
      return;
    }
    const sidebarContentNode = document.getElementById('rt-sidebar-content');
    if (sidebarContentNode?.scrollHeight <= sidebarContentNode?.offsetHeight) {
      // Entire sidebar is already visible
      // No need to scroll
      return;
    }

    const sectionFieldNode = document.getElementById(
      `sidebar-section-field-${sectionFieldId}`
    );
    const sidebarContentDomRect = sidebarContentNode
      ? sidebarContentNode.getBoundingClientRect()
      : {};
    const sectionFieldDomRect = sectionFieldNode
      ? sectionFieldNode.getBoundingClientRect()
      : {};

    const topEdgeVisible =
      sectionFieldDomRect.top >= sidebarContentDomRect.top &&
      sectionFieldDomRect.top <= sidebarContentDomRect.bottom;

    const bottomEdgeVisible =
      sectionFieldDomRect.bottom <= sidebarContentDomRect.bottom &&
      sectionFieldDomRect.bottom >= sidebarContentDomRect.top;
    const extraVerticalScroll = 10;

    if (!topEdgeVisible && !bottomEdgeVisible) {
      // Completely out of view

      if (sectionFieldDomRect.bottom < sidebarContentDomRect.top) {
        // Its on the top
        const diff = Math.abs(
          sidebarContentDomRect.top - sectionFieldDomRect.top
        );
        sidebarContentNode.scrollTop = Math.max(
          0,
          sidebarContentNode.scrollTop - diff - extraVerticalScroll
        );
      } else {
        // Its below
        const diff = Math.abs(
          sectionFieldDomRect.bottom - sidebarContentDomRect.bottom
        );
        sidebarContentNode.scrollTop = Math.min(
          sidebarContentNode.scrollHeight,
          sidebarContentNode.scrollTop + diff + extraVerticalScroll
        );
      }
    } else if (topEdgeVisible && !bottomEdgeVisible) {
      // Top part in view.
      // Increase scrollTop by height of section.
      // Shouldn't go higher than scrollHeight
      sidebarContentNode.scrollTop = Math.min(
        sidebarContentNode.scrollHeight,
        sidebarContentNode.scrollTop +
          sectionFieldNode.offsetHeight +
          extraVerticalScroll
      );
    } else if (!topEdgeVisible && bottomEdgeVisible) {
      // Bottom part in view.
      // Decrease scrollTop by height of section.
      // Shouldn't go lesser than 0
      sidebarContentNode.scrollTop = Math.max(
        0,
        sidebarContentNode.scrollTop -
          sectionFieldNode.offsetHeight -
          extraVerticalScroll
      );
    } else {
      // Already in view. Do nothing
    }
  };

  scrollFieldRegionAndBboxIntoView = (sectionId, fieldId) => {
    if (this.state.slug) {
      return;
    }
    const { fieldsById } = this.props;
    const { documentDomRect } = this.state;

    let field = fieldsById[sectionId];

    if (!(field && field.uiPosition) || _.isEmpty(field && field.uiPosition)) {
      field = fieldsById[fieldId];
    }

    if (!field) {
      return;
    }

    if (!documentDomRect && _.isEmpty(documentDomRect)) {
      return;
    }
    const targetDiv = document.getElementById('rt-field-input-box');
    if (field.uiPosition && !_.isEmpty(field.uiPosition)) {
      let styleTopAbs = (field.uiPosition.top / 100) * documentDomRect.height;
      let styleLeftAbs = (field.uiPosition.left / 100) * documentDomRect.width;
      const documentWrapperNode = document.getElementById(
        'rt-document-wrapper'
      );

      let scrollX = styleLeftAbs;
      let scrollY = styleTopAbs;

      if (scrollX > 100) {
        scrollX -= 100;
      }

      if (scrollY > 80) {
        scrollY -= 80;
      }
      if (!targetDiv) {
        documentWrapperNode && documentWrapperNode.scrollTo(scrollX, scrollY);
      }
    } else {
      // Nothing to do
    }
  };

  handleDocumentNavigation = (type = '') => {
    const { documentIds, docId } = this.props;

    const totalDocCount = documentIds.length;
    const currentDocIndex = documentIds.indexOf(docId);

    if (currentDocIndex < 0) {
      return;
    }

    if (type === 'prev') {
      let prevDocId;

      if (currentDocIndex > 0) {
        prevDocId = documentIds[currentDocIndex - 1];
      }

      if (prevDocId) {
        this.handleDocNavigateBtnClick(prevDocId, 'prev');
      }
    } else if (type === 'next') {
      let nextDocId;

      if (currentDocIndex >= 0 && currentDocIndex < totalDocCount - 1) {
        nextDocId = documentIds[currentDocIndex + 1];
      }

      if (nextDocId) {
        this.handleDocNavigateBtnClick(nextDocId, 'next');
      }
    } else {
      return;
    }
  };

  // Handle key events for navigating through the document
  handleKeyDown = (e) => {
    const { keyCode, shiftKey, ctrlKey, altKey, metaKey } = e;

    const { docMeta, config, documentsById, docId, docReadOnly } = this.props;
    const { embeddedApp, clientApp, slug } = this.state;

    let isFreeTool = embeddedApp;
    let isClientTool = clientApp;

    const allowEditFields = canAccessEditField(config);

    const currentDocument = documentsById[docId] || {};
    let isEditable = !currentDocument?.type?.includes('table_vision');

    let editFieldAccess = allowEditFields && isEditable && !docReadOnly;
    if (!docMeta) {
      // No document
      return;
    }

    const isMacOS = getOS() === 'MacOS';

    if (keyCode === KEY_CODES.TAB) {
      // Go to next focusable item
      e.preventDefault();
      this.setState({
        isTab: true,
      });
      this.handleTabKeyDown({
        keyCode,
        shiftKey,
      });
    } else if (
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey)) &&
      shiftKey &&
      keyCode === KEY_CODES.ENTER
    ) {
      // Confirm document
      if (!isFreeTool) {
        this.handleFinishReviewBtnClick();
      }
    } else if (
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey)) &&
      !shiftKey &&
      keyCode === KEY_CODES.ARROW_RIGHT
    ) {
      // Skip document
      if (!isFreeTool) {
        this.handleSkipReviewBtnClick();
      }
    } else if (
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey)) &&
      altKey &&
      keyCode === KEY_CODES.R
    ) {
      // Rerun
      if (!isFreeTool) {
        this.retryValidation();
      }
    } else if (
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey)) &&
      keyCode === KEY_CODES.ARROW_RIGHT &&
      shiftKey
    ) {
      // Next document
      this.handleDocumentNavigation('next');
    } else if (
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey)) &&
      shiftKey &&
      keyCode === KEY_CODES.ARROW_LEFT
    ) {
      // Previous document
      this.handleDocumentNavigation('prev');
    } else if (
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey)) &&
      shiftKey &&
      keyCode === KEY_CODES.E
    ) {
      if (
        !(isClientTool || isFreeTool) &&
        editFieldAccess &&
        !(slug === 'editField')
      ) {
        // Edit fields
        this.moveToEditHandler();
      }
    } else if (
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey)) &&
      !shiftKey &&
      keyCode === KEY_CODES.Z
    ) {
      // Undo last action
      this.handleUndoAction();
    } else if (
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey)) &&
      shiftKey &&
      keyCode === KEY_CODES.Z
    ) {
      // Undo redo action
      this.handleRedoAction();
    } else if (keyCode === KEY_CODES.ESC) {
      if (!(isClientTool || isFreeTool)) {
        this.deselectField();
      }
    } else if (keyCode === KEY_CODES.ENTER) {
      this.handleEnterKeyDown();
    }
  };

  handleEnterKeyDown = async () => {
    const { nextLocation, currentLocationIndex, locations } =
      this.getPrevAndNextLocations();

    //Open collapsed section and focused first element
    if (nextLocation?.sectionId) {
      await this.props.documentActions.updateCollapsedSectionIds({
        collapsedSectionIds: this.props.collapsedSectionIds.filter(
          (item) => item !== nextLocation.sectionId
        ),
      });

      const {
        locations,
        currentLocationIndex,
        nextLocation: nextUpdatedLocation,
      } = this.getPrevAndNextLocations();

      if (currentLocationIndex < 0) {
        const firstLocation = locations[0];
        if (firstLocation) {
          return this.moveToLocation(firstLocation, true);
        }
      }

      this.enterEventTimeoutRef = setTimeout(() => {
        this.moveToLocation(nextUpdatedLocation, true);
      }, 0);
    }

    //Move from collapsed section to opened section and highlight next element
    if (
      locations[currentLocationIndex]?.sectionId &&
      !nextLocation?.sectionId
    ) {
      if (currentLocationIndex < 0) {
        const firstLocation = locations[0];
        if (firstLocation) {
          return this.moveToLocation(firstLocation, true);
        }
      } else {
        const { isLabelSelected } = this.state;
        this.persistSelectedFieldData({ isLabelSelected });

        this.enterEventTimeoutRef = setTimeout(() => {
          this.moveToLocation(nextLocation, true);
        }, 0);
      }
    }
  };

  deselectField = () => {
    var inputElement = document.getElementById(
      `sidebar-field-input-${this.props?.selectedFieldId}`
    );
    // Trigger the blur event
    inputElement?.blur();
    this.props.documentActions.rtSetSelectedFieldId({
      sectionFieldId: null,
      lineItemRowId: null,
      fieldId: null,
      lineItemFooterBtn: null,
    });
  };

  moveToEditHandler = () => {
    const { moveToEdit } = this.state;
    if (!moveToEdit) this.handleEditFieldOpen();
    this.props.documentActions.setEditFieldChanges(false);
    this.setState({
      moveToEdit: true,
    });
  };

  handleTabKeyDown = ({ shiftKey }) => {
    const { locations, currentLocationIndex, prevLocation, nextLocation } =
      this.getPrevAndNextLocations();

    if (currentLocationIndex < 0) {
      const firstLocation = locations[0];
      if (firstLocation) {
        return this.moveToLocation(firstLocation, true);
      }
    } else {
      const { isLabelSelected } = this.state;
      this.persistSelectedFieldData({ isLabelSelected });

      if (shiftKey) {
        // Go to previous location
        return this.moveToLocation(prevLocation, true);
      } else {
        // Go to next location
        return this.moveToLocation(nextLocation, true);
      }
    }
  };

  moveToPrevLocation = () => {
    const { prevLocation } = this.getPrevAndNextLocations();

    if (prevLocation) {
      this.moveToLocation(prevLocation);
    }
  };

  moveToNextLocation = () => {
    const { nextLocation } = this.getPrevAndNextLocations();

    if (nextLocation) {
      this.moveToLocation(nextLocation);
    }
  };

  moveToLocation = (options = {}, isTab) => {
    const { docReadOnly, fieldsById } = this.props;

    const {
      sectionId,
      sectionFieldId,
      lineItemRowId,
      fieldId,
      lineItemFooterBtn,
      disableInputFocus,
      gridId,
    } = options;

    this.setState({
      region: null,
    });

    if (this.props.activeSidebarTab === 'chat') return;

    this.props.documentActions
      .rtSetSelectedFieldId({
        sectionFieldId,
        lineItemRowId,
        fieldId,
        lineItemFooterBtn,
        sectionId,
        gridId,
      })
      .then(() => {
        if (sectionId) {
          this.focusDomElementById(`js-section-arrow-${sectionId}`);
          return;
        }

        if (!fieldId) {
          if (lineItemFooterBtn) {
            this.focusDomElementById(`footer-add-line-btn-${sectionFieldId}`);

            //Commented below block to prevent set true value on add line in review screen.
            /* this.setState({
                        isLabelSelected:true,
                      }); */
          }
          return;
        }

        const field = fieldsById[fieldId] || {};
        if (
          (!this.state.isLabelSelected && field.uiPosition) ||
          (this.state.isLabelSelected && field.uiLabelPosition)
        ) {
          const { top, left, width, height } = !this.state.isLabelSelected
            ? field.uiPosition
            : field.uiLabelPosition;
          if (!docReadOnly) {
            this.setState({
              region: {
                x: left,
                y: top,
                width,
                height,
                fieldId: field.id,
              },
            });
            if (lineItemRowId) {
              // Is a line item field
              this.focusLineItemFieldInput({ fieldId }, isTab);
            } else {
              // Is a section field
              this.focusSidebarFieldInput({
                fieldId,
                disableInputFocus,
              });
            }
          }
        } else {
          if (!docReadOnly) {
            if (lineItemRowId) {
              // Is a line item field
              this.focusLineItemFieldInput({ fieldId }, isTab);
            } else {
              // Is a section field
              this.focusSidebarFieldInput({
                fieldId,
                disableInputFocus,
              });
            }
          }
        }
      });
  };

  handleUndoAction = async () => {
    const { prevActionList } = this.state;

    if (_.isEmpty(prevActionList)) {
      return;
    }

    const action = prevActionList.pop();

    this.setState({ prevActionList });

    const { fieldId, field } = action;

    let locationData = {
      sectionFieldId: fieldId,
      fieldId,
    };
    if (field?._parentType === 'line_item_section_field') {
      const locations = this.generateLocationList();
      locationData = locations.find((i) => i.fieldId === fieldId) || {};
      this.moveToLocation(locationData, true);
    } else {
      this.moveToLocation(locationData);
    }

    this.undoTimer = setTimeout(async () => {
      await this.handleFieldDataUpdateRequest(action, true);
    }, 100);
  };

  handleRedoAction = async () => {
    const { nextActionList } = this.state;

    if (_.isEmpty(nextActionList)) {
      return;
    }

    const action = nextActionList.pop();

    this.setState({ nextActionList });

    const { fieldId, field } = action;

    let locationData = {
      sectionFieldId: fieldId,
      fieldId,
    };
    if (field?._parentType === 'line_item_section_field') {
      const locations = this.generateLocationList();
      locationData = locations.find((i) => i.fieldId === fieldId) || {};
      this.moveToLocation(locationData, true);
    } else {
      this.moveToLocation(locationData);
    }

    this.redoTimer = setTimeout(async () => {
      await this.handleFieldDataUpdateRequest(action, true);
    }, 100);
  };

  persistFieldData = ({ fieldId, throwErrorOnFailure }) => {
    if (this.state.isUpdatingFromBbox) {
      this.updateFieldDataTimer = setTimeout(() => {
        this.delayPersistFieldData({ fieldId, throwErrorOnFailure });
      }, 1000);
    } else {
      this.delayPersistFieldData({ fieldId, throwErrorOnFailure });
    }
  };

  // Returns an object with details of the payload of last field update
  // For tracking changes for Undo action
  getCurrentFieldData = (fieldId) => {
    const { slug, docType } = this.state;
    const { docId, fieldsById, docMeta } = this.props;

    const field = fieldsById[fieldId];
    const {
      content: { origValue, position, value, isValidFormat } = {},
      lastUpdated = {},
    } = field || {};

    let payloadValue = value;
    let payloadPosition = position;
    let payloadFormatValidation = isValidFormat;

    if (!_.isEmpty(lastUpdated)) {
      payloadValue = lastUpdated.lastUpdatedValue;
      payloadPosition = lastUpdated.lastUpdatedPosition;
      payloadFormatValidation = lastUpdated.lastUpdatedFormatValidation;
    }

    const editFieldsPayload = slug ? { docType: docType } : {};

    const actionPayload = {
      docId,
      payload: {
        docId,
        fieldId,
        payload: {
          value: payloadValue,
          time_spent: 1,
          doc_type: docMeta.type,
          is_valid_format: payloadFormatValidation,
          position: payloadPosition || [],
          orig_value: origValue,
        },
        ...editFieldsPayload,
      },
      fieldId,
      field,
      view: slug ? 'edit' : 'review',
    };

    return actionPayload;
  };

  handleRealtimeUpdate = async (fieldId = null, docId = null, payload = {}) => {
    const {
      value = '',
      doc_type = '',
      position = [],
      is_valid_format = false,
      orig_value = '',
    } = payload;
    const response = await api.realTimeUpdateField({
      docId,
      itemId: fieldId,
      payload: {
        value: value,
        time_spent: 1,
        doc_type,
        is_valid_format,
        position,
        orig_value,
      },
    });
    this.props.documentActions.rtRealTimeUpdate({
      docId,
      response: response?.responsePayload?.data,
    });
  };

  handleFieldDataUpdateRequest = async (fieldData, throwErrorOnFailure) => {
    const { docId, payload, fieldId } = fieldData;
    const { documentActions, rtUpdateFields, selectedLineItemRowId } =
      this.props;
    const { slug } = this.state;
    try {
      documentActions.rtFieldDataPersistanceStart({
        docId,
        fieldId,
      });
      let response = await api.updateFieldData(payload);
      const fieldItemData = response?.responsePayload?.data?.item || {};

      !slug &&
        documentActions.rtFieldDataPersistanceFulfilled({
          docId,
          fieldId,
          response,
          selectedLineItemRowId,
        });

      return fieldItemData;
    } catch (error) {
      documentActions.rtFieldDataPersistanceRejected({
        docId,
        fieldId,
        error,
      });
      if (throwErrorOnFailure) {
        throw error;
      }
    } finally {
      documentActions.setEditFieldChanges(true);
      // if (this.state.slug) {
      //   const { nextLocation } = this.getPrevAndNextLocations();
      //   if (
      //     field.pType !== 'line_item' &&
      //     !(nextLocation && nextLocation.lineItemRowId)
      //   ) {
      //     this.setState({
      //       isLabelSelected: this.state.isLabelSelected,
      //     });
      //   }
      // }
    }
  };

  delayPersistFieldData = async ({ fieldId, throwErrorOnFailure = false }) => {
    const {
      docId,
      docReadOnly,
      fieldsById,
      documentActions,
      docMeta,
      rtUpdateFields,
    } = this.props;
    const { slug, prevActionList } = this.state;

    if (slug || !docId || docReadOnly) {
      return;
    }

    const field = fieldsById[fieldId];

    if (!field) {
      return;
    }

    const {
      content: { origValue, value } = {},
      isIndex,
      type,
      uiValue,
      lowConfidence,
      uiRectangle,
      isValidFormat,
    } = field || {};

    if (['drop_down'].includes(field.type)) {
      field.uiRectangle = [];
    }
    let response = null;
    if (type === 'drop_down_map' && !isIndex) {
      return;
    }
    if (
      !lowConfidence &&
      uiValue === value &&
      uiRectangle?.length &&
      isValidFormat
    ) {
      return;
    }

    const updatedStack = () => {
      if (uiValue !== value) {
        // Update action in prevActionList
        const action = this.getCurrentFieldData(fieldId);
        if (prevActionList.length < 10) {
          prevActionList.push(action);
          this.setState({ prevActionList });
        }
      }
    };

    if (rtUpdateFields.includes(field.id) && !isIndex) {
      const response = await api.realTimeUpdateField({
        docId,
        itemId: field.id,
        payload: {
          value: field.uiValue,
          time_spent: 1,
          doc_type: docMeta.type,
          is_valid_format: field.uiIsValidFormat,
          position: field.uiRectangle || [],
          orig_value: origValue,
        },
      });
      this.props.documentActions.rtRealTimeUpdate({
        docId,
        response: response.responsePayload.data,
      });
      this.props.documentActions.setEditFieldChanges(true);
      updatedStack();
      return;
    }

    updatedStack();

    const payload = slug
      ? {
          docId,
          fieldId,
          docType: this.state.docType,
          payload: {
            value: field.uiValue,
            id: fieldId,
            time_spent: 1,
            doc_type: this.state.docType,
            is_valid_format: field.uiIsValidFormat,
            position: field.uiRectangle || [],
            orig_value: origValue,
          },
        }
      : {
          docId,
          fieldId,
          payload: {
            value: field.uiValue,
            id: fieldId,
            time_spent: 1,
            doc_type: docMeta.type,
            is_valid_format: field.uiIsValidFormat,
            position: field.uiRectangle || [],
            orig_value: origValue,
          },
        };

    const responsePayload = await this.handleFieldDataUpdateRequest(
      {
        docId,
        payload,
        fieldId,
        isIndex,
      },
      throwErrorOnFailure
    );

    const action = {
      docId,
      payload,
      fieldId,
      field: responsePayload,
      view: slug ? 'edit' : 'review',
    };

    const updatedNewActionList = [...this.state.nextActionList, action];
    this.setState({ nextActionList: updatedNewActionList.slice(-10) });
  };

  persistFieldLabel = async ({ fieldId, throwErrorOnFailure = false }) => {
    const { docId, docReadOnly, documentActions, fieldsById } = this.props;
    const field = fieldsById[fieldId];
    const fieldLabel = field?.label;
    const isLineIemField = field?.subPType === 'line_item';
    if (!docId || docReadOnly) {
      return;
    }
    //todo - revert back the line below
    if (!field) {
      return;
    }

    if (!field.uiLabel) {
      showToast({
        title: `${
          isLineIemField ? 'Column' : 'Field'
        } title cannot be left blank. The ${
          isLineIemField ? 'column' : 'field'
        } title has been reverted to its previous name.`,
        error: true,
      });
      documentActions.rtUpdateFieldValue({
        fieldId,
        label: fieldLabel,
        value: fieldLabel,
      });
      documentActions.resetLoadingFieldId();
      documentActions.rtFieldDataPersistanceStart({
        docId,
        fieldId,
      });
      return;
    }

    try {
      documentActions.rtFieldDataPersistanceStart({
        docId,
        fieldId,
      });
      return await api.updateSectionField({
        fieldId,
        docType: this.state.docType,
        payload: {
          label: field.uiLabel,
          time_spent: 1,
          position: field.uiLabelRectangle || [],
          type: field.type,
        },
      });
    } catch (error) {
      documentActions.rtFieldDataPersistanceRejected({
        docId,
        fieldId,
        error,
      });
      if (throwErrorOnFailure) {
        throw error;
      }
    } finally {
      field.pType !== 'line_item' &&
        this.state.slug &&
        this.setState({
          isLabelSelected: this.state.isLabelSelected,
        });
      this.props.documentActions.resetLoadingFieldId();
      this.props.documentActions.setEditFieldChanges(true);
    }
  };

  afterUpdateFieldData = async (fieldId, field) => {
    this.props.documentActions.rtUpdateFieldValue({
      fieldId,
      label: field.uiLabel,
      value: field.uiValue,
    });
  };

  persistSelectedFieldData = ({
    isLabelSelected,
    throwErrorOnFailure = false,
  } = {}) => {
    const { selectedFieldId } = this.props;
    if (!selectedFieldId) {
      return;
    }
    if (!isLabelSelected) {
      return this.persistFieldData({
        fieldId: selectedFieldId,
        throwErrorOnFailure,
      });
    } else {
      return this.persistFieldLabel({
        fieldId: selectedFieldId,
        throwErrorOnFailure,
      });
    }
  };

  handleSidebarLineItemFieldClick = ({ fieldId }) => {
    const {
      fieldsById,
      lineItemRowsById,
      selectedSectionFieldId,
      docId,
      docMeta = {},
      user,
      config,
      grids,
      gridBboxIds,
    } = this.props;
    // this.persistSelectedFieldData({isLabelSelected:false});
    const { canSwitchToOldMode = true } = config || {};
    if (selectedSectionFieldId === fieldId) {
      return;
    }
    if (this.state.bboxClickType !== 'field_click') {
      this.handleBboxViewer('field_click');
    }
    this.persistSelectedFieldData({ isLabelSelected: false });
    const sectionField = fieldsById[fieldId];
    const { lineItemRowIds } = sectionField;

    const lineItemRowId = _.isUndefined(lineItemRowIds)
      ? null
      : lineItemRowIds[0];
    const lineItemFieldId = lineItemRowId
      ? lineItemRowsById[lineItemRowId]?.fieldIds[0] || null
      : null;

    this.moveToLocation({
      sectionFieldId: fieldId,
      lineItemRowId,
      selectedFieldId: null,
      fieldId: lineItemFieldId,
      lineItemFooterBtn: null,
    });

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.view_line_item, {
      docId: docId,
      label: docMeta?.title,
      'document type': docMeta?.type,
      'work email': user?.email,
      'line item id': fieldId,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  handleSidebarFieldInputFocus = (
    { sectionFieldId, fieldId, lineItemRowId, isLabelSelected } = null
  ) => {
    this.setState({
      isLabelSelected,
    });
    !this.state.slug && this.persistSelectedFieldData({ isLabelSelected });
    const hasRegion = this.fieldHasRegion({ fieldId });
    const isAlreadySelected = this.props.selectedFieldId === fieldId;
    if (hasRegion) {
      if (isAlreadySelected && !this.state.slug) {
        this.focusSidebarFieldInput({ fieldId });
        return;
      }
    }

    this.moveToLocation({
      sectionFieldId: sectionFieldId || fieldId,
      lineItemRowId: lineItemRowId || null,
      fieldId,
      lineItemFooterBtn: null,
    });

    this.mixpanelTracking(MIXPANEL_EVENTS.click_line_item);
  };

  handleOnInputSelect = ({ isLabelSelected }) => {
    this.setState({
      isLabelSelected,
    });
  };

  handleSidebarReadOnlyFieldClick = ({ fieldId, disableInputFocus }) => {
    this.moveToLocation({
      sectionFieldId: fieldId,
      lineItemRowId: null,
      selectedFieldId: null,
      fieldId,
      lineItemFooterBtn: null,
      disableInputFocus,
    });
  };

  handleSidebarFieldInputValueChange = ({ fieldId, value, label }) => {
    this.props.documentActions.rtUpdateFieldValue({
      fieldId,
      value,
      label,
    });
    this.gaTrackFieldValueEdit({
      fieldId,
      section: 'sidebar',
    });
  };
  handleFooterFieldInputValueChange = ({ fieldId, label }) => {
    this.props.documentActions.rtUpdateFieldValue({
      fieldId,
      label,
    });
    this.gaTrackFieldValueEdit({
      fieldId,
      section: 'footer',
    });
  };
  setSectionNameValue = ({ value, id } = '') => {
    this.setState({
      section: {
        p_title: value,
        id: id,
      },
      slugs: {
        ...this.state.slugs,
        sectionSlug: value ? 'section' : '',
      },
    });
  };
  setFieldKey = ({ fieldId, value } = '') => {
    this.setState({
      key: {
        label: value,
        fieldId: fieldId,
      },
      slugs: {
        ...this.state.slugs,
        keySlug: value ? 'key' : '',
      },
    });
  };
  setFieldValue = ({ fieldId } = '') => {
    this.setState({
      value: {
        fieldId: fieldId,
      },
      slugs: {
        ...this.state.slugs,
        valueSlug: fieldId ? 'value' : '',
      },
    });
  };

  handleSidebarFieldInputFormSubmit = ({ fieldId, next = false }) => {
    if (this.state.slug) {
      if (this.state.isTab) {
        this.setState({
          isTab: false,
        });
      } else {
        this.persistFieldData({
          fieldId,
        });
        next && this.moveToNextLocation();
      }
    } else {
      this.persistFieldData({
        fieldId,
      });
      this.moveToNextLocation();
    }
  };
  handleSidebarFieldLabelFormSubmit = ({ fieldId, next = false }) => {
    if (this.state.isTab) {
      this.setState({
        isTab: false,
      });
    } else {
      (async () => {
        await this.persistFieldLabel({
          fieldId,
        });
        next && this.moveToNextLocation();
      })();
    }
  };
  handleUpdateSectionTitle = async () => {
    const { section, docType } = this.state;
    try {
      const response = await api.updateSectionTitle({
        payload: {
          p_title: section.p_title,
          doc_type: docType,
          id: section.id,
        },
      });
      const data = _.get(response.responsePayload, 'data.data');
      this.setState({
        data,
      });
      this.props.documentActions.updateSectionTitle({
        data,
      });
    } catch (e) {
      showToast({ title: `Failed to update title${e}`, error: true });
    }
  };
  handleSaveLastChange = (props = {}) => {
    const {
      slugs,
      key: { fieldId },
      value: { fieldId: valueFieldId },
    } = this.state;
    const slugsArr = Object.values(slugs);
    const next = props.section ? false : true;
    slugsArr
      ? slugsArr.map((slug) => {
          /* eslint-disable indent */
          switch (slug) {
            case 'section':
              this.handleUpdateSectionTitle();
              break;
            case 'key':
              this.handleSidebarFieldLabelFormSubmit({
                fieldId,
                next,
              });
              break;
            case 'value':
              this.handleSidebarFieldInputFormSubmit({
                fieldId: valueFieldId,
                next,
              });
              break;
          }
          /* eslint-enable indent */
        })
      : null;
  };

  handleSaveCloseBtnClick = async (type) => {
    // this.props.appActions.showLoaderOverlay();
    if (type === 'all') {
      this.setState({
        allDocument: true,
      });
    } else if (type === 'one') {
      this.setState({
        oneDocument: true,
      });
    }

    const searchParams = new URLSearchParams(location?.search);

    const docType =
      this.props.docMeta?.type ||
      _.get(location, 'state.docType') ||
      searchParams?.get('docType');

    const { docTypeId, docId } = this.props;
    await api.saveAndCloseData({
      docTypeId,
      type,
      docId,
      doc_type: docType,
    });
    this.setState({
      reviewConfirmation: false,
      allDocument: false,
      oneDocument: false,
    });
    this.setState(
      {
        isReviewLoading: true,
      },
      () => {
        //to update the review screen change flow from edit field screen
        this.redirectTimer = setTimeout(() => {
          const searchParams = new URLSearchParams(
            this.props.history.location.search
          );
          const redirect = searchParams.get('redirect');

          this.props.documentActions.rtStartReview({
            queryParams: {
              doc_type: this.state.docType,
              sort_by: 'created_data.desc',
            },
            docId: this.props.docId,
            doc_type: this.state.docType,
            redirectFromEditField: true,
            origin: 'Edit Field',
            redirect: redirect,
            afterAction: () => {
              this.props.documentActions.rtGoToDocument({
                docId: this.props.docId,
                doc_type: this.state.docType,
                redirect: false,
              });
            },
          });

          this.setState({
            isReviewLoading: false,
          });
          this.props.documentActions.rtSetSelectedFieldId({
            sectionFieldId: null,
            lineItemRowId: null,
            fieldId: this.props?.sections[0]?.children[0]?.id,
            lineItemFooterBtn: null,
          });
          var firstField = document.getElementById(
            `sidebar-field-input-${this.props?.sections[0]?.children[0]?.id}`
          );
          firstField?.focus();
        }, 5000);
      }
    );
    this.handleSaveLastChange();
    // this.closeReviewTool();
    // this.props.appActions.hideLoaderOverlay();
  };

  handleOnAddSectionBtnClick = (sectionType) => {
    this.handleSaveLastChange();
    const { docType } = this.state;
    const { docId } = this.props;
    this.props.documentActions.rtAddSection({
      docType,
      docId,
      sectionType: sectionType,
    });
  };

  handleOnAddFieldBtnClick = ({ docType, id, label = '' }) => {
    this.handleSaveLastChange();
    this.props.documentActions.rtAddFieldInSection({
      docType,
      id,
      label,
      afterAction: (fieldId) => {
        const { fieldsById } = this.props;
        const field = fieldsById[fieldId];
        const { fieldIds } = field;
        this.handleSidebarFieldInputFocus({
          fieldId,
          isLabelSelected: true,
        });
      },
    });
  };
  handleOnDeleteSectionField = ({ docType, id: fieldId }) => {
    const { docId, fieldsById } = this.props;
    const field = fieldsById[fieldId];
    const { type = '', subPType = '' } = field;
    this.props.documentActions.rtDeleteFieldInSection({
      docType,
      docId,
      fieldId,
      type,
      subPType,
    });
  };
  handleShowFilterBtnClick = async ({ docType, fieldId, filterType }) => {
    const { fieldsById } = this.props;
    const { pType, subPType } = fieldsById[fieldId];
    await this.props.documentActions.rtShowFiterInField({
      docTypeId: this.props.docTypeId,
      fieldId,
      docType,
      pType,
      filterType,
      subPType,
    });
  };
  handleFooterFieldLabelSubmit = ({ fieldId, next }) => {
    this.persistFieldLabel({
      fieldId,
    });
    next && this.moveToNextLocation();
  };
  handleSectionDeleteBtnClick = ({ docType, id, afterAction }) => {
    const { docId } = this.props;
    this.props.documentActions.editFieldDeleteSection({
      docId,
      docType,
      id,
      afterAction,
    });
  };

  handleFooterLineItemReadOnlyFieldClick = ({ rowId, fieldId } = {}) => {
    this.props.documentActions.rtSetSelectedFieldId({
      lineItemRowId: rowId,
      fieldId,
    });
  };

  handleFooterLineFieldInputFocus = ({ isLabelSelected, rowId, fieldId }) => {
    this.setState({
      isLabelSelected: !!isLabelSelected,
    });
    this.persistSelectedFieldData({ isLabelSelected });
    const hasRegion = this.fieldHasRegion({ fieldId });
    const isAlreadySelected = this.props.selectedFieldId === fieldId;

    if (hasRegion) {
      if (isAlreadySelected) {
        this.focusLineItemFieldInput({ fieldId });
        return;
      }
    }

    this.moveToLocation({
      // sectionFieldId: this.props.selectedSectionFieldId,
      lineItemRowId: rowId,
      fieldId,
      lineItemFooterBtn: null,
    });
  };

  handleFooterLineFieldInputValueChange = ({ fieldId, value }) => {
    this.props.documentActions.rtUpdateFieldValue({
      fieldId,
      value,
    });

    this.gaTrackFieldValueEdit({
      fieldId,
      section: 'footer',
    });
  };

  handleFooterLineFieldInputSubmit = async ({ fieldId }) => {
    await this.persistFieldData({
      fieldId,
    });
    this.moveToNextLocation();
  };

  handleFooterAddLineBtnClick = ({ sectionFieldId }) => {
    const { docId, documentActions, selectedGridId = '' } = this.props;
    this.props.documentActions.rtAddLine({
      docId: this.props.docId,
      sectionFieldId,
      gridId: selectedGridId,
      onSave: async () => await this.persistSelectedFieldData(),
      onSuccess: ({ rows }) => {
        try {
          const lastRow = _.last(rows);
          const firstField = lastRow.fields[0];
          const { fields = [] } = lastRow;
          this.moveToLocation({
            sectionFieldId,
            lineItemRowId: lastRow.id,
            fieldId: firstField.id,
            lineItemFooterBtn: null,
          });
          const { gridId = '' } = firstField || {};
          this.focusDomElementById(`line-item-field-input-${firstField?.id}`);
          if (rows.length === 1) {
            documentActions.rtSetCurrentGridId({
              gridId: fields[0]?.gridId,
            });
          }
        } catch (e) {
          // Do nothing
        }
      },
    });

    this.getDocDataTimer1 = setTimeout(async () => {
      const response = await api.getDocumentData({
        docId,
      });

      await documentActions.fetchDropdown({
        sections:
          _.get(response, 'responsePayload.data.sections') ||
          _.get(response, 'responsePayload.data.annotatedData') ||
          [],
        docId,
      });
    }, 500);
  };

  handleRowOptionAddLineBtnClick = async ({ sectionFieldId, baseItemId }) => {
    const { docId, documentActions, selectedGridId } = this.props;
    (await this.state.slug) && this.handleSaveLastChange();
    await this.persistSelectedFieldData();

    this.props.documentActions.rtAddLine({
      docId: this.props.docId,
      sectionFieldId,
      baseItemId,
      gridId: selectedGridId,
      onSuccess: async () => {
        const response = await api.getDocumentData({
          docId,
        });

        await documentActions.fetchDropdown({
          sections:
            _.get(response, 'responsePayload.data.sections') ||
            _.get(response, 'responsePayload.data.annotatedData') ||
            [],
          docId,
        });
      },
    });
  };

  handleFooterAddSimilarLinesBtnClick = async ({ sectionFieldId }) => {
    this.state.slug && this.handleSaveLastChange();
    const { docId, documentActions } = this.props;

    try {
      await documentActions.rtAddSimilarLinesStart({
        docId,
        sectionFieldId,
      });
      await this.persistSelectedFieldData({
        throwErrorOnFailure: true,
      });
      documentActions.rtAddSimilarLines({
        docId,
        sectionFieldId,
      });
    } catch (e) {
      documentActions.rtAddSimilarLinesReject({
        docId,
        sectionFieldId,
      });
    }
  };

  handleFooterDeleteAllRowsBtnClick = ({ sectionFieldId, gridIds }) => {
    this.props.documentActions.rtDeleteAllRows({
      docId: this.props.docId,
      sectionFieldId,
      gridIds,
      onSuccess: () => {
        // this.props.documentActions.rtSetSelectedFieldId({
        //   fieldId: null,
        // });
      },
    });
  };

  handleAddColumnBtnClick = async ({ sectionFieldId }) => {
    const { docType } = this.state;
    const { docId, appActions, fieldsById } = this.props;
    const field = fieldsById[sectionFieldId];
    //const field = fieldsById[fieldId];
    const { type } = field;
    await this.props.documentActions.addFooterColumn({
      sectionFieldId,
      docType,
      docId,
      type,
      afterAction: () => {
        //this.afterUpdateFieldData(fieldId, field);
        this.handleSaveLastChange({ section: true });
        const { locations } = this.getPrevAndNextLocations();
        const lineitems = locations.filter(
          (l) => l.lineItemRowId && l.sectionFieldId === sectionFieldId
        );
        locations &&
          this.moveToLocation(lineitems[lineitems.length - 1]) &&
          this.moveToNextLocation();
      },
      errorAfterAction: () => {
        appActions.setToast({
          // eslint-disable-next-line quotes
          title: "The column couldn't be added.",
          error: true,
        });
      },
    });
  };

  handleExtractData = async () => {
    const {
      documentActions,
      grids,
      selectedSectionFieldId: parentId,
      sectionField: { parentId: pid },
      docId,
      docMeta,
      handleDelayedTableTracking,
      fieldsById,
    } = this.props;

    handleDelayedTableTracking({
      name: parentId,
      fieldLabel: fieldsById[parentId]?.label,
      key: TABLE_TRACKING_KEYS.tableExtractedData,
      action: TRACKING_HELPER_KEYS.updated,
    });

    const formattedGrids = grids?.map(({ staticId, id, ...rest }) => {
      if (staticId) {
        return { ...rest };
      }
      return { id, ...rest };
    });

    await documentActions.rtAddSimilarLines({
      docId,
      sectionFieldId: parentId,
      data: formattedGrids,
      fromGrid: true,
      docType: docMeta.type,
      afterAction: () => {
        this.setState({ showUnsavedChangesModal: false });
        this.getDocDataTimer2 = setTimeout(async () => {
          const response = await api.getDocumentData({
            docId,
          });

          await documentActions.fetchDropdown({
            sections:
              _.get(response, 'responsePayload.data.sections') ||
              _.get(response, 'responsePayload.data.annotatedData') ||
              [],
            docId,
          });

          await documentActions.rtManageGridData({
            docId,
            parentId,
            pid,
            method: 'GET',
          });
        });
      },
      afterError: () => {
        this.setState({ showUnsavedChangesModal: false });
      },
    });

    // Trigger next step in tooltip
    chameleonTriggerTour(
      CHAMLEON_TOUR_IDS.reviewScreenPhase5,
      CHAMELEON_TOUR_TYPES.reviewScreenPhase5,
      () =>
        this.addMixpanelTrackingForTours(MIXPANEL_EVENTS.review_screen_phase_5)
    );
  };

  setSelectedFieldRegion = async (data = {}) => {
    const { docId, docMeta, selectedField, rtUpdateFields } = this.props;
    const { isLabelSelected } = this.state;

    const field = selectedField;
    if (['drop_down'].includes(field && field.type)) {
      return;
    }

    const fieldId = field && field.id;
    const { width: docWidth, height: docHeight } = docMeta;

    const { rectangle, rectanglePercentages, position } = data;
    const { content: { origValue } = {} } = field || {};
    !isLabelSelected
      ? this.props.documentActions.rtUpdateFieldData({
          fieldId: fieldId,
          updates: {
            uiRectangle: rectangle,
            uiRectanglePercentages: rectanglePercentages,
            uiPosition: position,
          },
        })
      : this.props.documentActions.rtUpdateFieldData({
          fieldId: fieldId,
          updates: {
            uiLabelRectangle: null,
            uiLabelRectanglePercentages: null,
            uiLabelPosition: null,
          },
        });

    try {
      this.setState({
        isUpdatingFromBbox: true,
      });
      const response = await api.getTextFromBbox({
        docId,
        key: isLabelSelected ? 'label' : 'value',
        bbox: rectangle,
        format: field.format,
        item_id: fieldId,
        update: true,
        doc_type: docMeta.type,
        orig_value: origValue,
      });

      const data = _.get(response.responsePayload, 'data', {});
      const text = isLabelSelected
        ? _.get(data, 'label', '')
        : _.get(data, 'content.value', '');
      const content = _.get(data, 'content');
      const responseRectangle = _.get(data, 'content.position', '');
      const isValidValue = _.get(data, 'content.isValidFormat', '');
      const formatMessage = _.get(data, 'formatMessage', '');
      const lowConfidence = _.get(data, 'lowConfidence', false);

      if (rtUpdateFields.includes(field.id)) {
        const response = await api.realTimeUpdateField({
          docId,
          itemId: field.id,
          payload: {
            value: text,
            time_spent: 1,
            doc_type: docMeta.type,
            is_valid_format: field.uiIsValidFormat,
            position: field.uiRectangle || [],
            orig_value: origValue,
          },
        });
        this.props.documentActions.rtRealTimeUpdate({
          currentId: field.id,
          docId,
          response: response.responsePayload.data,
        });
      }

      //this.moveToNextLocation();

      /* eslint-disable-next-line no-console */
      // console.info(JSON.stringify({
      //     originalBbox: rectangle,
      //     responseBbox: responseRectangle,
      //     text,
      // }));

      let updates = {
        content: content,
        uiValue: !isLabelSelected ? text : field.uiValue,
        uiLabel: isLabelSelected ? text : field.uiLabel,
        uiIsValidFormat: isLabelSelected ? true : isValidValue,
        formatMessage,
        lowConfidence,
      };

      if (text && position && !_.isEmpty(position)) {
        if (!_.isEqual(rectangle, responseRectangle)) {
          const fieldPositions = documentHelpers.computeFieldPositions({
            docWidth,
            docHeight,
            rectangle: isLabelSelected ? rectangle : responseRectangle,
          });

          const { top, left, width, height } = fieldPositions.position;
          if (!this.state.slug) {
            this.setState({
              region: {
                x: left,
                y: top,
                width: width,
                height: height,
                fieldId: this.props.selectedFieldId,
              },
            });
          } else {
            this.setState({
              region: null,
            });
          }

          updates = {
            ...updates,
            uiRectangle: fieldPositions.rectangle,
            uiRectanglePercentages: fieldPositions.rectanglePercentages,
            uiPosition: fieldPositions.position,
          };
        }
      }

      this.props.documentActions.rtUpdateFieldData({
        fieldId: fieldId,
        updates,
      });
    } catch (e) {
      // Do nothing
      // console.error(e);
    } finally {
      this.setState({
        isUpdatingFromBbox: false,
      });
      this.mixpanelTracking(MIXPANEL_EVENTS.draw_boxes);
    }
  };

  mixpanelTracking = (evt) => {
    const {
      config: { accountType = '', canSwitchToOldMode = true } = {},
      user: { email = '', role = '', companyName = '' } = {},
      docMeta: { docId = '', title = '' } = {},
    } = this.props || {};
    const { docType = '' } = this.state;
    customMixpanelTracking(evt, {
      plan: accountType,
      canSwitchUIVersion: canSwitchToOldMode,
      role,
      label: title,
      docType,
      email,
      docId,
      companyName,
    });
  };

  handleSuggestionBboxClick = (bbox, isLabelSelected) => {
    const { position, rectangle, rectanglePercentages } = bbox;
    const { top, left, width, height } = position;

    this.setState({
      region: {
        x: left,
        y: top,
        width: width,
        height: height,
        fieldId: this.props.selectedFieldId,
      },
      isRegionChanging: false,
    });

    this.setSelectedFieldRegion({
      rectangle,
      rectanglePercentages,
      position,
      isLabelSelected,
    });
  };

  handleRegionChange = (region) => {
    if (region.isChanging) {
      this.setState({
        region: {
          ...region,
          fieldId: this.props.selectedFieldId,
        },
        isRegionChanging: true,
      });
      return;
    }

    this.setState({ isRegionChanging: false });
    const { x: left, y: top, width, height } = region;

    if (!width && !height) {
      // No area selected. It was just a click.
      this.setState({
        region: null,
      });
      return;
    } else {
      this.setState({
        region: {
          ...region,
          fieldId: this.props.selectedFieldId,
        },
      });
    }

    const { docMeta } = this.props;
    const { width: docWidth, height: docHeight } = docMeta;

    const position = {
      top,
      left,
      width,
      height,
    };

    const x1Percentage = left;
    const y1Percentage = top;
    const x2Percentage = left + width;
    const y2Percentage = top + height;

    const x1 = _.round((x1Percentage / 100) * docWidth, 1);
    const y1 = _.round((y1Percentage / 100) * docHeight, 1);
    const x2 = _.round((x2Percentage / 100) * docWidth, 1);
    const y2 = _.round((y2Percentage / 100) * docHeight, 1);

    const rectangle = [x1, y1, x2, y2];
    const rectanglePercentages = [
      x1Percentage,
      y1Percentage,
      x2Percentage,
      y2Percentage,
    ];

    this.setSelectedFieldRegion({
      rectangle,
      rectanglePercentages,
      position,
    });
  };

  handleRegionFieldInputValueChange = ({ fieldId, value, label }) => {
    this.props.documentActions.rtUpdateFieldValue({
      fieldId,
      value,
      label,
    });

    this.gaTrackFieldValueEdit({
      fieldId,
      section: 'region',
    });
  };

  handleRegionFieldInputRemoveBtnClick = async ({
    fieldId,
    prevUiLabel,
    prevUiValue,
  }) => {
    this.setState({
      region: null,
    });
    this.props.documentActions.rtUpdateFieldData({
      fieldId: fieldId,
      updates: {
        uiValue: this.state.isLabelSelected ? prevUiValue : '',
        uiLabel: this.state.isLabelSelected ? '' : prevUiLabel,
        uiIsValidFormat: true,
        uiRectangle: [],
        uiRectanglePercentages: null,
        uiPosition: null,
        uiLabelRectangle: [],
        uiLabelRectanglePercentages: null,
        uiLabelPosition: null,
      },
    });
    this.regionFieldInputRemoveTimer = setTimeout(() => {
      !this.state.isLabelSelected
        ? this.persistFieldData({
            fieldId,
          })
        : this.persistFieldLabel({
            fieldId,
          });
    }, 50);
  };

  handleRegionFieldInputSubmitBtnClick = ({ fieldId, isLabelSelected }) => {
    isLabelSelected
      ? this.persistFieldLabel({
          fieldId,
        })
      : this.persistFieldData({
          fieldId,
        });
    this.setState(
      {
        region: null,
      },
      () => {
        this.moveToNextLocation();
      }
    );
  };

  handleRegionFieldInputFormSubmit = ({ fieldId, isLabelSelected }) => {
    isLabelSelected
      ? this.persistFieldLabel({
          fieldId,
        })
      : this.persistFieldData({
          fieldId,
        });
    this.setState(
      {
        region: null,
      },
      () => {
        this.moveToNextLocation();
      }
    );
  };

  handleCloseBtnClick = async () => {
    const { docId, docMeta, editFieldChanges } = this.props;
    const { slug } = this.state;

    if (slug === 'editField' && editFieldChanges) {
      this.setState({ cancelConfirmation: true });
      return;
    } else if (slug === 'editField') {
      this.cancelChangesMade();
      return;
    }
    const { embeddedApp, clientApp } = this.state;
    if (clientApp) {
      window.open('https://www.docsumo.com', '_top');

      //window.close();
    } else if (embeddedApp) {
      window.close();
      window.open('https://www.docsumo.com', '_top');
    }
    this.props.appActions.showLoaderOverlay();

    await this.persistSelectedFieldData();
    try {
      if (docMeta.status === 'reviewing') {
        await api.updateOnClose({
          docId,
          docType: docMeta.type,
        });
        this.props.documentActions.resetReviewTool();
      }
    } catch (e) {
      //do nothing
    } finally {
      this.props.appActions.hideLoaderOverlay();
    }

    //this.props.appActions.hideLoaderOverlay();
    this.closeReviewTool();

    this.props.documentActions.setEditFieldChanges(false);
  };

  handleCancelClick = () => {
    this.handleCloseBtnClick();
    this.mixpanelTracking(MIXPANEL_EVENTS.editfield_sidebar_cancel_button);
  };

  handleStartReviewBtnClick = () => {
    const { docId, docMeta } = this.props;

    this.props.documentActions.rtStartDocumentReview({
      docId,
      docType: docMeta.type,
    });
  };

  handleConfirmFinishReviewBtnClick = async () => {
    // eslint-disable-next-line compat/compat
    const parsedUrl = new URL(window.location.href);
    const ext_user = parsedUrl.searchParams.get('ext_user');
    const { embeddedApp, clientApp } = this.state;
    const {
      docId,
      documentActions,
      docMeta = {},
      user,
      location: { state },
      handleTrackingSubmit,
    } = this.props;

    handleTrackingSubmit();

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.approve_error_document, {
      origin: state && state.origin ? state.origin : 'Shareable Link',
      'work email': user.email,
      'document type': docMeta?.type,
      label: docMeta?.title,
    });

    try {
      documentActions.rtForceFinishDocumentReview({
        docId,
      });

      await this.persistSelectedFieldData({
        throwErrorOnFailure: true,
      });

      const response = await api.finishDocumentReview({
        docId,
        docType: docMeta.type,
        strict: true,
        ext_user: ext_user ? ext_user : null,
        forced: true,
      });
      documentActions.rtForceFinishDocumentReviewFulfilled({
        docId,
        response,
      });

      if (clientApp) {
        global.window.location.reload();
        return;
      }
      if (embeddedApp) {
        window.location = 'https://www.docsumo.com';
      }

      this.goToNextDocument({
        closeIfNotFound: true,
      });
    } catch (e) {
      const errorMessage = _.get(
        e.responsePayload,
        'message',
        'Something went wrong'
      );
      await documentActions.rtForceFinishDocumentReviewRejected();
      this.setState({
        confirmErrorMessage: errorMessage,
        showConfirmReview: true,
      });
      const dataResponse = await api.getDocumentData({
        docId,
      });

      await documentActions.fetchDropdown({
        sections:
          _.get(dataResponse, 'responsePayload.data.sections') ||
          _.get(dataResponse, 'responsePayload.data.annotatedData') ||
          [],
        docId,
      });
    }
  };

  handleReviewCancelBtnClick = () => {
    this.setState({
      showConfirmReview: false,
    });
  };

  handleFinishReviewBtnClick = async () => {
    // eslint-disable-next-line compat/compat
    const parsedUrl = new URL(window.location.href);
    const ext_user = parsedUrl.searchParams.get('ext_user');
    const { embeddedApp, clientApp, userflowStart } = this.state;
    this.onOutsideClick();

    const {
      docId,
      documentActions,
      docMeta = {},
      location: { state },
      user,
      config,
      handleTrackingSubmit,
    } = this.props;
    const { canSwitchToOldMode = true } = config || {};
    if (userflowStart) {
      this.setState({ userflowStart: false });
    }

    handleTrackingSubmit();

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.approve_document, {
      origin: state && state.origin ? state.origin : 'Shareable Link',
      'work email': user.email,
      'document type': docMeta?.type,
      label: docMeta?.title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    documentActions.rtFinishDocumentReview({
      docId,
    });

    await this.persistSelectedFieldData({
      throwErrorOnFailure: true,
    });
    this.finishDocReviewTimer = setTimeout(async () => {
      try {
        const response = await api.finishDocumentReview({
          docId,
          docType: docMeta.type,
          strict: true,
          ext_user: ext_user ? ext_user : null,
          forced: false,
        });

        documentActions.rtFinishDocumentReviewFulfilled({
          docId,
          response,
        });

        if (clientApp) {
          global.window.location.reload();
          return;
        }

        if (embeddedApp) {
          window.location = 'https://www.docsumo.com';
        }

        const showFirstReviewCompleteModal = chameleonGetUserProperty(
          CHAMELEON_TOUR_TYPES.reviewScreenPhase6
        );

        if (showFirstReviewCompleteModal) {
          documentActions.rtShowFirstReviewCompleteModal({
            showFirstReviewCompleteModal,
          });
          this.addMixpanelTrackingForTours(
            MIXPANEL_EVENTS.review_screen_phase_6
          );
          return;
        } else {
          this.goToNextDocument({
            closeIfNotFound: true,
          });
        }
      } catch (error) {
        const { responsePayload = {} } = error;
        let message = responsePayload && responsePayload.message;
        await documentActions.rtFinishDocumentReviewRejected({
          docId,
          error,
        });
        this.setState({
          errorMessage: message,
          errorStatus: true,
        });
        const dataResponse = await api.getDocumentData({
          docId,
        });

        await documentActions.fetchDropdown({
          sections:
            _.get(dataResponse, 'responsePayload.data.sections') ||
            _.get(dataResponse, 'responsePayload.data.annotatedData') ||
            [],
          docId,
        });
      }
    }, 1200);
  };

  retryValidation = async () => {
    this.onReRunOutsideClick();
    const {
      docId,
      docMeta = {},
      documentActions,
      location: { state },
      user,
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config || {};
    this.setState({
      isRetryingValidation: true,
    });

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.rerun_validation, {
      origin: state && state.origin ? state.origin : 'Shareable Link',
      'work email': user.email,
      'document type': docMeta?.type,
      label: docMeta?.title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    //this.props.appActions.showLoaderOverlay();
    await this.persistSelectedFieldData();

    try {
      const response = await api.updateOnClose({
        docId,
        docType: docMeta.type,
        refresh: true,
      });
      documentActions.rtRetryValidation({
        docId,
        response,
      });
      const { message } = response.responsePayload;
      if (message) {
        this.setState({
          reRunErrorMessage: message,
          reRunErrorStatus: true,
        });
      }

      const dataResponse = await api.getDocumentData({
        docId,
      });

      await documentActions.fetchDropdown({
        sections:
          _.get(dataResponse, 'responsePayload.data.sections') ||
          _.get(dataResponse, 'responsePayload.data.annotatedData') ||
          [],
        docId,
      });

      await documentActions.dropdownMapFetch({
        sections:
          _.get(dataResponse, 'responsePayload.data.sections') ||
          _.get(dataResponse, 'responsePayload.data.annotatedData') ||
          [],
        docId,
      });
    } catch (e) {
      //do nothing
    } finally {
      //this.props.appActions.hideLoaderOverlay();
      this.setState({
        isRetryingValidation: false,
      });
    }

    //this.props.appActions.hideLoaderOverlay();
    //global.window.location.reload();
  };

  onOutsideClick = () => {
    if (this.state.errorStatus) {
      this.setState({
        errorMessage: '',
        errorStatus: false,
      });
    }
  };
  onReRunOutsideClick = () => {
    if (this.state.reRunErrorStatus) {
      this.setState({
        reRunErrorStatus: false,
        reRunErrorMessage: '',
      });
    }
  };

  handleForceFinishReviewBtnClick = async () => {
    // eslint-disable-next-line compat/compat
    const parsedUrl = new URL(window.location.href);
    const ext_user = parsedUrl.searchParams.get('ext_user');
    const { embeddedApp, clientApp } = this.state;
    const { docId, documentActions, docMeta } = this.props;

    try {
      this.setState({
        isConfirming: true,
      });
      documentActions.rtForceFinishDocumentReview({
        docId,
      });

      await this.persistSelectedFieldData({
        throwErrorOnFailure: true,
      });

      const response = await api.finishDocumentReview({
        docId,
        docType: docMeta.type,
        ext_user: ext_user ? ext_user : null,
        strict: false,
      });
      documentActions.rtForceFinishDocumentReviewFulfilled({
        docId,
        response,
      });
      if (clientApp) {
        global.window.location.reload();
        return;
      }
      {
        embeddedApp
          ? (window.location = 'https://www.docsumo.com')
          : this.goToNextDocument({
              closeIfNotFound: true,
            });
      }
    } catch (e) {
      _.get(e.responsePayload);
      documentActions.rtForceFinishDocumentReviewRejected();
    } finally {
      this.setState({
        isConfirming: false,
      });
      this.handleReviewCancelBtnClick();
    }
  };

  handleSkipReviewBtnClick = async () => {
    const { docId, documentActions, handleTrackingSubmit } = this.props;
    const { clientApp } = this.state;
    // eslint-disable-next-line compat/compat
    const parsedUrl = new URL(window.location.href);
    const ext_user = parsedUrl.searchParams.get('ext_user');

    handleTrackingSubmit();

    try {
      documentActions.rtSkipDocumentReview({
        docId,
      });

      await this.persistSelectedFieldData({
        throwErrorOnFailure: true,
      });

      const response = await api.skipDocumentReview({
        docId,
        ext_user: ext_user ? ext_user : null,
      });
      documentActions.rtSkipDocumentReviewFulfilled({
        docId,
        response,
      });
      if (clientApp) {
        global.window.location.reload();
        return;
      }
      if (!clientApp) {
        this.goToNextDocument({
          closeIfNotFound: true,
        });
      }
    } catch (error) {
      documentActions.rtSkipDocumentReviewRejected({
        docId,
        error,
      });
    }
  };

  handleDocNavigateBtnClick = async (docId, type = '') => {
    if (this.state.slug && this.state.slug === 'editField') {
      await this.handleEditDocNavigateBtnClick(docId);
      this.props.appActions.hideLoaderOverlay();
      return;
    }

    const { handleTrackingSubmit } = this.props;

    handleTrackingSubmit();

    await this.persistSelectedFieldData();
    !this.state.slug &&
      this.props.history.push(
        `${routes.REVIEW_DOC}${docId}${this.props.history.location.search}`
      );

    this.reviewGoToDocument(
      {
        docId,
      },
      type
    );
    this.props.appActions.hideLoaderOverlay();
  };

  handleEditDocNavigateBtnClick = async (docId) => {
    const {
      location: { state },
      customDocTypeFiles: files,
    } = this.props;
    // if (!this.state.customDocType) {
    this.props.documentActions.updateDocId({
      docId,
      docType: this.state.docType,
      origin: state && state.origin ? state.origin : 'Review Document',
      customDocType: this.state.customDocType,
    });
    // } else {
    // const transformedFiles = await Promise.all(
    //   files.map(async (file) => await imageLoader(file))
    // );
    // let payload = {
    //   files,
    //   transformedFiles,
    //   title: '',
    // };
    // this.props.documentActions.customDocTypeEditFieldFlow(payload);
    //   console.log('here');
    // }
    // this.props.documentActions.rtStartEditField({
    //     docType:this.state.docType,
    //     slug:'editField',
    //     docId
    // });
    // setTimeout(() => this.props.documentActions.rtGoToDocument({
    //     docId,
    //     slug:'editField',
    //     doc_type: this.state.docType,
    // }), 3000);
  };

  handleFetchRetryBtnClick = () => {
    this.props.documentActions.rtGetDocumentData({
      docId: this.props.docId,
    });
  };

  // handleDocDeleteBtnClick = () => {
  //     this.props.documentActions.deleteDocAfterConfirmation({
  //         docId: this.props.docId,
  //     });
  // };
  handleDocDeleteBtnClick = () => {
    this.setState({
      deleteDoc: true,
    });
  };

  handleDocDeleteProceedBtnClick = async () => {
    const {
      docId,
      documentActions,
      location: { state },
      user,
      docMeta = {},
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config || {};
    this.setState({
      isDeleting: true,
    });

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.delete_doc, {
      origin: state && state.origin ? state.origin : 'Shareable Link',
      'work email': user.email,
      'document type': docMeta?.type,
      label: docMeta?.title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    try {
      await api.deleteDocument({
        docId,
      });
    } finally {
      await documentActions.updateDocData({
        docId: docId,
      });
      await documentActions.deleteDocFulfilled({ docId });
      await documentActions.fetchDocumentCounts();
      this.setState({ isDeleting: false, deleteDoc: false });
    }
  };

  handleDocDeleteCancelBtnClick = () => {
    this.setState({
      deleteDoc: false,
    });
  };

  handleDocDownloadBtnClick = () => {
    this.props.documentActions.downloadDocConfirmation({
      docId: this.props.docId,
    });
  };

  handleDocZoomChange = ({ value }) => {
    this.setState({
      zoom: value,
    });
  };

  getDocPageImageUrls = () => {
    const imageUrls = [];
    const pages = _.get(this.props.docMeta, 'pages') || [];
    pages.forEach((page) => {
      imageUrls.push(page.image.url);
    });
    return imageUrls;
  };

  handleDocPageImageLoadSuccess = (imgUrl) => {
    const docPageImageUrls = this.getDocPageImageUrls();
    if (!docPageImageUrls.includes(imgUrl)) {
      // Image not part of current document
      return;
    }

    const documentPageImagesLoaded = [
      ...this.state.documentPageImagesLoaded,
      imgUrl,
    ];
    const allDocumentImagesLoaded =
      documentPageImagesLoaded.length >= 3 || docPageImageUrls.length;

    this.setState({
      documentPageImagesLoaded,
      allDocumentImagesLoaded,
    });
  };

  handleDocPageImageLoadError = (imgUrl) => {
    const docPageImageUrls = this.getDocPageImageUrls();
    if (!docPageImageUrls.includes(imgUrl)) {
      // Image not part of current document
      return;
    }

    this.setState({
      documentPageImagesErred: [...this.state.documentPageImagesErred, imgUrl],
    });
  };

  getDomElementRectById = (elementId) => {
    const domEl = document.getElementById(elementId);
    if (!domEl) {
      return null;
    }

    const { top, bottom, left, right, width, height } =
      domEl.getBoundingClientRect();

    return {
      top,
      bottom,
      left,
      right,
      width,
      height,
    };
  };

  getSectionFieldDomRect = (sectionFieldId) => {
    return this.getDomElementRectById(
      `sidebar-section-field-${sectionFieldId}`
    );
  };

  getFieldValueBboxDomRect = (fieldId) => {
    return this.getDomElementRectById(`field-value-bbox-${fieldId}`);
  };

  setDocumentDomRectData = () => {
    const domRect = this.getDomElementRectById('rt-document');
    this.setState({
      documentDomRect: domRect,
    });
  };

  setSectionFieldsDomRectData = () => {
    const sectionFieldDomRectById = {};
    const { sectionFieldIds, selectedSectionFieldId } = this.props;

    // Only calculating DomRectData for selectedSectionField
    if (
      sectionFieldIds &&
      _.isArray(sectionFieldIds) &&
      selectedSectionFieldId
    ) {
      const domRect = this.getSectionFieldDomRect(selectedSectionFieldId);
      sectionFieldDomRectById[selectedSectionFieldId] = domRect;
    }

    this.setState({
      sectionFieldDomRectById,
    });
  };

  updateSectionFieldsDomRectDataThrottled = _.throttle(
    () => {
      this.setSectionFieldsDomRectData();
    },
    50,
    { leading: true, trailing: true }
  );

  updateDocumentDomRectDataThrottled = _.throttle(
    () => {
      this.setDocumentDomRectData();
    },
    50,
    { leading: true, trailing: true }
  );

  handleSidebarScroll = () => {
    this.updateSectionFieldsDomRectDataThrottled();
  };

  handleDocumentWrapperScroll = () => {
    this.updateDocumentDomRectDataThrottled();
  };

  handlePageChange = (currentPage) => {
    return this.setState({
      currentPage,
    });
  };

  getSelectedFieldBboxDomRectFromUiPosition = () => {
    const { selectedField } = this.props;
    const { documentDomRect } = this.state;
    let domRect = null;

    if (
      documentDomRect &&
      !_.isEmpty(documentDomRect) &&
      selectedField &&
      selectedField.uiPosition &&
      !_.isEmpty(selectedField.uiPosition)
    ) {
      domRect = {
        top:
          documentDomRect.top +
          (selectedField.uiPosition.top / 100) * documentDomRect.height,
        left:
          documentDomRect.left +
          (selectedField.uiPosition.left / 100) * documentDomRect.width,
        width: (selectedField.uiPosition.width / 100) * documentDomRect.width,
        height:
          (selectedField.uiPosition.height / 100) * documentDomRect.height,
      };
    }

    return domRect;
  };

  getSelectedFieldBboxDomRectFromStateRegion = () => {
    const { selectedFieldId } = this.props;
    const { documentDomRect, region } = this.state;
    let domRect = null;

    if (
      documentDomRect &&
      !_.isEmpty(documentDomRect) &&
      region &&
      region.fieldId === selectedFieldId
    ) {
      domRect = {
        top: documentDomRect.top + (region.y / 100) * documentDomRect.height,
        left: documentDomRect.left + (region.x / 100) * documentDomRect.width,
        width: (region.width / 100) * documentDomRect.width,
        height: (region.height / 100) * documentDomRect.height,
      };
    }

    return domRect;
  };

  openEditScreenPlay = (triggerLocation = '') => {
    const {
      appActions,
      location: { state },
      user,
      docMeta = {},
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config || {};
    const mixpanelEvent =
      triggerLocation === 'banner'
        ? MIXPANEL_EVENTS.watch_tutorial
        : MIXPANEL_EVENTS.play_video;
    // Add mixpanel event
    mixpanel.track(mixpanelEvent, {
      origin: state && state.origin ? state.origin : 'Shareable Link',
      'work email': user.email,
      'document type': docMeta?.type,
      label: docMeta?.title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    appActions.showEditScreenPlay(true);
  };

  renderFieldBoxAndArrow = () => {
    const {
      docReadOnly,
      selectedSectionFieldId,
      selectedLineItemRowId,
      selectedFieldId,
      selectedField,
    } = this.props;
    const { region } = this.state;

    const { windowInnerWidth, windowInnerHeight, sectionFieldDomRectById } =
      this.state;

    const sectionFieldDomRect = sectionFieldDomRectById[selectedSectionFieldId];
    let fieldBboxDomRect = null;

    if (docReadOnly) {
      fieldBboxDomRect = this.getSelectedFieldBboxDomRectFromUiPosition();
    } else {
      fieldBboxDomRect = this.getSelectedFieldBboxDomRectFromStateRegion();
    }
    if (region?.height < 1 && region?.width < 1) {
      return null;
    }

    let skipRendering = false;
    if (!docReadOnly) {
      if (!this.state.region || this.state.region.fieldId !== selectedFieldId) {
        skipRendering = true;
      }
    }

    return (
      <FieldArrow
        docReadOnly={docReadOnly}
        sectionFieldId={selectedSectionFieldId}
        lineItemRowId={selectedLineItemRowId}
        fieldId={selectedFieldId}
        field={selectedField}
        sectionFieldDomRect={sectionFieldDomRect}
        fieldBboxDomRect={fieldBboxDomRect}
        skipRendering={skipRendering}
        windowInnerWidth={windowInnerWidth}
        windowInnerHeight={windowInnerHeight}
      />
    );
  };

  handleSaveAndCloseClick = () => {
    const {
      location: { state },
      user,
      docMeta,
      config: { canSwitchToOldMode = false },
    } = this.props;
    const { docType = '', customDocType } = this.state;

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.save_close_field, {
      origin: state && state.origin ? state.origin : 'Shareable Link',
      'work email': user.email,
      docType: docType,
      docId: docMeta?.docId,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    const fieldHasErrors = Object.values(this.props.fieldsById).find(
      (field) => field.errorMessage && !field.isHidden
    );
    if (!fieldHasErrors) {
      if (customDocType) {
        this.handleCustomDocTypeUpload();
        mixpanelTrackingAllEvents(MIXPANEL_EVENTS.custom_doctype_applychanges, {
          origin: 'Upload Document Modal',
          docType,
        });
      } else {
        this.setState({ reviewConfirmation: true });
      }
    } else {
      this.setState({
        fieldErrorMessage: true,
      });
    }
  };

  handleCustomDocTypeUpload = async () => {
    const { docTypeId, customDocTypeFiles, appActions, history } = this.props;
    appActions.showLoaderOverlay();
    try {
      await api.saveAndCloseData({
        docTypeId,
        type: 'one',
        docId: '',
        doc_type: this?.state?.docType,
      });
      uploadHelper.handleFileDrop({
        files: customDocTypeFiles,
        dropAccepted: true,
        documentType: this?.state?.docType,
      });
      history.push('/');
    } catch (e) {
      //error
      appActions.setToast({
        title: e?.responsePayload?.message || 'Something went wrong!',
        error: true,
      });
    } finally {
      appActions.hideLoaderOverlay();
    }
  };

  handleEditDocCloseClick = () => {
    const {
      location: { state },
      user,
      docMeta = {},
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config || {};

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.close_edit_field, {
      origin: state && state.origin ? state.origin : 'Shareable Link',
      'work email': user.email,
      'document type': docMeta?.type,
      label: docMeta?.title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    this.handleCloseBtnClick();
  };

  handleReviewDocCloseClick = () => {
    const {
      location: { state },
      user = {},
      docMeta,
      config = {},
      isGridEdited,
    } = this.props;
    const { canSwitchToOldMode = true } = config || {};
    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.close_review, {
      origin: state && state.origin ? state.origin : 'Shareable Link',
      'work email': user?.email,
      docType: docMeta?.type,
      label: docMeta?.title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
      role: user?.role,
      docId: docMeta?.docId,
      companyName: user?.companyName,
    });

    if (isGridEdited) {
      this.handleOverlayClick();
      return;
    }

    this.handleCloseBtnClick();
  };

  handleEditFieldOpen = () => {
    const { docType } = this.state;
    const {
      docId,
      sort_by,
      docMeta,
      user,
      config: { canSwitchToOldMode = true } = {},
    } = this.props;

    let queryParams = {
      sort_by: sort_by || 'created_date.desc',
      doc_id: docId,
    };

    mixpanel.track(MIXPANEL_EVENTS.edit_field_from_review, {
      docId: docMeta?.docId,
      docType: docType || docMeta?.type,
      'work email': user?.email,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    this.props.documentActions.rtStartEditField({
      docType: docType || docMeta?.type,
      slug: 'editField',
      docId,
      origin: 'Edit Document',
      queryParams,
      afterAction: () => this.fieldFocus(),
      afterError: (e) => {
        this.props.appActions.setToast({
          error: true,
          title:
            e?.responsePayload?.message ||
            'An error occurred while redirecting to edit field. Please try again later.',
          duration: 3000,
        });

        this.setState(
          {
            moveToEdit: false,
          },
          () => {
            this.reviewGoToDocument({
              docId: docId,
            });
          }
        );
      },
    });
  };

  fieldFocus = () => {
    let inputElement = document.getElementById(
      `sidebar-field-input-${this.props?.selectedFieldId}`
    );
    // Trigger the focus event
    inputElement?.focus();
  };
  handlecloseErrorConfirmationModal = () => {
    this.setState({
      fieldErrorMessage: false,
    });
  };

  cancelChangesMade = async () => {
    const { appActions } = this.props;
    this.setState({
      isCancelling: true,
    });

    const searchParams = new URLSearchParams(location?.search);

    const docType =
      this.props.docMeta?.type ||
      _.get(location, 'state.docType') ||
      searchParams?.get('docType');

    try {
      const response = await api.cancelSavedChanges({
        docType: docType,
      });

      if (response) {
        this.setState({
          cancelConfirmation: false,
        });
        this.props.documentActions.setEditFieldChanges(false);
        this.props.history.goBack();
      }
    } catch (e) {
      appActions.setToast({
        title: e?.responsePayload?.message || 'Something went wrong!',
        error: true,
      });
    } finally {
      this.setState({
        isCancelling: false,
      });
    }
  };

  handleSidebarResize = _.debounce(
    () => {
      const { docMeta } = this.props;
      const { pages = [] } = docMeta || {};
      let startHeight = 0;

      pages.map(async (page, index) => {
        const canvasImage =
          document.getElementById(`rt-canvas-document-${index}`) || {};

        let canvasImageWidth = canvasImage.offsetWidth;
        const widthToHeightRatio = page.image.height / page.image.width;
        let canvasImageHeight = widthToHeightRatio * canvasImageWidth;

        canvasImageHeight =
          canvasImageHeight -
          (pages.length - 1 === index ? 0 : documentConstants.DOC_PADDING);

        if (canvasImage?.style?.height)
          canvasImage.style.height = `${canvasImageHeight}px`;

        startHeight = canvasImageHeight + startHeight;
      });
    },
    70,
    { leading: true, trailing: true }
  );

  handleBboxViewer = (value) => {
    this.setState({
      bboxClickType: value,
    });
  };

  handleOverlayClick = () => {
    const { isGridEdited } = this.props;
    isGridEdited
      ? this.setState({ showUnsavedChangesModal: true })
      : this.handleCloseGrid();
  };

  handleGridDiscardChanges = () => {
    this.setState({ showUnsavedChangesModal: false }, () => {
      this.handleCloseGrid();
    });
  };

  handleUnsavedChangesModalClose = (type = '') => {
    if (type === 'title') {
      this.setState({ showUnsavedChangesModal: false });
    } else if (type === 'cancel') {
      this.handleGridDiscardChanges();
    }
  };

  render() {
    const {
      isFetchingData,
      isStartingReview,
      isFinishingReview,
      isSkippingReview,
      dataFetchFailed,
      stateActionInProgress,
      documentIds,
      documentsById,
      documents,
      docFromUrl,
      docId,
      docMeta,
      docReadOnly,
      sections,
      selectedSectionFieldId,
      selectedSectionField,
      documentActions,
      grids,
      gridBboxIds,
      tooltipFlow,
      isForceFinishingReview,
      docSkipped,
      user,
      config,
      showFirstReviewCompleteModal,
      editFieldChanges,
      toast,
      appActions,
      isGridEdited,
      sectionField,
      fetchError,
      history,
    } = this.props;

    const {
      documentDomRect,
      zoom,
      region,
      allDocumentImagesLoaded,
      isLabelSelected,
      slug,
      showAlertModal,
      gridView,
      currentPage,
      reviewConfirmation,
      errorStatus,
      errorMessage,
      embeddedApp,
      urlName,
      clientApp,
      allDocument,
      oneDocument,
      deleteDoc,
      isDeleting,
      isRetryingValidation,
      reRunErrorMessage,
      reRunErrorStatus,
      showConfirmReview,
      confirmErrorMessage,
      isConfirming,
      isAddingLineFront,
      progressValue,
      userflowStart,
      isReviewLoading,
      cancelConfirmation,
      fieldErrorMessage,
      moveToEdit,
      isRegionChanging,
      showUnsavedChangesModal,
      customDocType,
    } = this.state;

    const sidebarDefaultProps = {
      isFetchingData: isFetchingData,
      isStartingReview: isStartingReview,
      isFinishingReview: isFinishingReview,
      isSkippingReview: isSkippingReview,
      stateActionInProgress: stateActionInProgress,
      dataFetchFailed: dataFetchFailed,
      allDocImagesLoaded: allDocumentImagesLoaded,
      documentIds: documentIds,
      documentsById: documentsById,
      documents: documents,
      docFromUrl: docFromUrl,
      docId: docId,
      docMeta: docMeta,
      docReadOnly: docReadOnly,
      sections: sections,
      documentActions: documentActions,
      onStartReviewBtnClick: this.handleStartReviewBtnClick,
      onFinishReviewBtnClick: this.handleFinishReviewBtnClick,
      onSkipReviewBtnClick: this.handleSkipReviewBtnClick,
      onDocNavigateBtnClick: this.handleDocNavigateBtnClick,
      onEditDocNavigateBtnClick: this.handleEditDocNavigateBtnClick,
      onDocDeleteBtnClick: this.handleDocDeleteBtnClick,
      onDocDownloadBtnClick: this.handleDocDownloadBtnClick,
      onSidebarLineItemFieldClick: this.handleSidebarLineItemFieldClick,
      onSidebarFieldInputFocus: this.handleSidebarFieldInputFocus,
      onSidebarReadOnlyFieldClick: this.handleSidebarReadOnlyFieldClick,
      onSidebarFieldInputValueChange: this.handleSidebarFieldInputValueChange,
      onSidebarFieldInputFormSubmit: this.handleSidebarFieldInputFormSubmit,
      onScroll: this.handleSidebarScroll,
      tooltipFlow: tooltipFlow,
      onForceFinishReviewBtnClick: this.handleConfirmFinishReviewBtnClick,
      isForceFinishingReview: isForceFinishingReview,
      errorStatus: errorStatus,
      errorMessage: errorMessage,
      onOutsideClick: this.onOutsideClick,
      embeddedApp: embeddedApp,
      urlName: urlName,
      clientApp: clientApp,
      retryValidation: this.retryValidation,
      isRetryingValidation: isRetryingValidation,
      reRunErrorMessage: reRunErrorMessage,
      reRunErrorStatus: reRunErrorStatus,
      onReRunOutsideClick: this.onReRunOutsideClick,
      toggleCollapse: this.toggleCollapse,
      docSkipped: docSkipped,
      email: user?.email,
      changeText: this.state.changeText,
      onSidebarResize: this.handleSidebarResize,
      user,
      config,
      isGridEdited,
      overlayClicked: this.handleOverlayClick,
    };
    const footerDefaultProps = {
      docReadOnly: docReadOnly,
      sectionFieldId: selectedSectionFieldId,
      fieldId: selectedSectionField,
      onReadOnlyLineFieldClick: this.handleFooterLineItemReadOnlyFieldClick,
      onLineFieldInputFocus: this.handleFooterLineFieldInputFocus,
      onLineFieldInputValueChange: this.handleFooterLineFieldInputValueChange,
      onLineFieldInputSubmit: this.handleFooterLineFieldInputSubmit,
      onAddLineBtnClick: this.handleFooterAddLineBtnClick,
      isAddingLineFront: isAddingLineFront,
      onRowOptionAddLineBtnClick: this.handleRowOptionAddLineBtnClick,
      onAddSimilarLinesBtnClick: this.handleFooterAddSimilarLinesBtnClick,
      onDeleteAllRowsBtnClick: this.handleFooterDeleteAllRowsBtnClick,
      handleGridView: this.handleGridView,
      gridView: gridView,
      handleClose: this.handleCloseGrid,
      extractData: this.handleExtractData,
      handleCloseGrid: this.handleCloseGrid,
      grids: grids,
      gridBboxIds: gridBboxIds,
      currentPage: currentPage,
      docId: docId,
      setGridViewMode: this.setGridViewMode,
      docMeta: docMeta,
      user,
      config,
      addMixpanelTrackingForTours: this.addMixpanelTrackingForTours,
      onFooterFieldInputSubmit: this.handleFooterFieldLabelSubmit,
      onFooterFieldInputValueChange: this.handleFooterFieldInputValueChange,
      handleBboxViewer: this.handleBboxViewer,
      bboxClickType: this.state.bboxClickType,
      focusLineItemFieldInput: this.focusLineItemFieldInput,
      isGridEdited,
      overlayClicked: this.handleOverlayClick,
    };

    return (
      <>
        {docReadOnly ? (
          <div className={cx(styles.banner)}>
            <InfoEmpty className='mr-2' />
            <p>
              {docSkipped ? 'Skipped Document View Mode' : 'View Only Mode'}
            </p>
          </div>
        ) : null}
        <FocusTrap active={tooltipFlow === undefined}>
          <div
            className={cx(styles.root, {
              [styles.addExtraPadding]: tooltipFlow,
            })}
            id='review-doc-container'
            role='presentation'
          >
            <DocumentProcessModal
              title={'Review Document'}
              progressValue={progressValue}
              embeddedApp={embeddedApp}
              closeReviewTool={this.closeReviewTool}
              user={user}
              docMeta={docMeta}
              showModal={showAlertModal}
            />
            {this.state.slug ? (
              <EditFieldSidebar
                {...sidebarDefaultProps}
                {...footerDefaultProps}
                customDocType={customDocType}
                editFieldChanges={editFieldChanges}
                docType={this.state.docType || docMeta?.type}
                sections={sections}
                updateLabelSlug={this.handleUpdateLabelSlug}
                documentActions={documentActions}
                onSaveCloseBtnClick={this.handleSaveAndCloseClick}
                onCancelClick={this.handleCancelClick}
                isReviewLoading={isReviewLoading}
                setSectionNameValue={this.setSectionNameValue}
                setFieldKey={this.setFieldKey}
                setFieldValue={this.setFieldValue}
                onInputSelect={this.handleOnInputSelect}
                onFilterBtnClick={this.handleShowFilterBtnClick}
                onDeleteSectionField={this.handleOnDeleteSectionField}
                onAddFieldBtnClick={this.handleOnAddFieldBtnClick}
                onAddSectionBtnClick={this.handleOnAddSectionBtnClick}
                onSidebarFieldLabelFormSubmit={
                  this.handleSidebarFieldLabelFormSubmit
                }
                onSectionDeleteBtnClick={this.handleSectionDeleteBtnClick}
                scrollSectionFieldIntoView={this.scrollSectionFieldIntoView}
              />
            ) : (
              <Sidebar
                {...sidebarDefaultProps}
                updateDocumentDomRectDataThrottled={
                  this.updateDocumentDomRectDataThrottled
                }
                moveToEditHandler={this.moveToEditHandler}
                moveToEdit={moveToEdit}
                onRegionFieldInputValueChange={
                  this.handleRegionFieldInputValueChange
                }
                onRegionFieldInputRemoveBtnClick={
                  this.handleRegionFieldInputRemoveBtnClick
                }
                onRegionFieldInputSubmitBtnClick={
                  this.handleRegionFieldInputSubmitBtnClick
                }
                onRegionFieldInputFormSubmit={
                  this.handleRegionFieldInputFormSubmit
                }
                scrollSectionFieldIntoView={this.scrollSectionFieldIntoView}
              />
            )}
            <div className={cx(styles.colRight)}>
              {!_.isEmpty(fetchError) ? (
                <div className={styles.errorBox}>
                  <PageError
                    errorTitle='Error'
                    text={
                      fetchError?.error || 'Failed to fetch data from server'
                    }
                    btnText='Go to All Documents'
                    icon={<ArrowLeft />}
                    onBtnClick={() => history.push(routes.ALL)}
                    ErrorCodeImage={DataFetchErrorIcon}
                    className={styles.pageError}
                  />
                </div>
              ) : !isFetchingData && dataFetchFailed ? (
                <div className={styles.errorBox}>
                  <DataFetchFailurePageError />
                </div>
              ) : !isFetchingData && !dataFetchFailed && customDocType ? (
                <StaticDocumentViewer
                  documentDomRect={documentDomRect}
                  zoom={zoom}
                  slug={slug}
                  onDocumentWrapperScroll={this.handleDocumentWrapperScroll}
                  onZoomChange={this.handleDocZoomChange}
                  onPageImageLoadSuccess={this.handleDocPageImageLoadSuccess}
                  onPageImageLoadError={this.handleDocPageImageLoadError}
                  getDomElementRectById={this.getDomElementRectById}
                  handlePageChange={this.handlePageChange}
                  currentPage={currentPage}
                  allPageHeights={this.state.allPageHeights}
                  docMeta={docMeta}
                  docId={docId}
                />
              ) : null}
              {!isFetchingData && !dataFetchFailed && !customDocType ? (
                <DocumentViewer
                  documentDomRect={documentDomRect}
                  zoom={zoom}
                  isLabelSelected={isLabelSelected}
                  region={region}
                  isRegionChanging={isRegionChanging}
                  slug={slug}
                  setFieldKey={this.setFieldKey}
                  setFieldValue={this.setFieldValue}
                  docReadOnly={docReadOnly}
                  bboxDisable={this.state.bboxDisable}
                  onSuggestionBboxClick={this.handleSuggestionBboxClick}
                  onRegionChange={this.handleRegionChange}
                  onRegionFieldInputValueChange={
                    this.handleRegionFieldInputValueChange
                  }
                  onRegionFieldInputRemoveBtnClick={
                    this.handleRegionFieldInputRemoveBtnClick
                  }
                  onRegionFieldInputSubmitBtnClick={
                    this.handleRegionFieldInputSubmitBtnClick
                  }
                  onRegionFieldInputFormSubmit={
                    this.handleRegionFieldInputFormSubmit
                  }
                  onDocumentWrapperScroll={this.handleDocumentWrapperScroll}
                  onZoomChange={this.handleDocZoomChange}
                  onPageImageLoadSuccess={this.handleDocPageImageLoadSuccess}
                  onPageImageLoadError={this.handleDocPageImageLoadError}
                  getDomElementRectById={this.getDomElementRectById}
                  handleGridView={this.handleGridView}
                  gridView={gridView}
                  handleCloseGrid={this.handleCloseGrid}
                  handlePageChange={this.handlePageChange}
                  handleRemoveGrid={this.handleRemoveGrid}
                  setGridViewMode={this.setGridViewMode}
                  currentPage={currentPage}
                  embeddedApp={embeddedApp}
                  clientApp={clientApp}
                  selectedSectionField={selectedSectionField}
                  selectedSectionFieldId={selectedSectionFieldId}
                  user={user}
                  addMixpanelTrackingForTours={this.addMixpanelTrackingForTours}
                  allPageHeights={this.state.allPageHeights}
                  bboxClickType={this.state.bboxClickType}
                  handleBboxViewer={this.handleBboxViewer}
                />
              ) : null}

              {selectedSectionField &&
              selectedSectionField.type ===
                documentConstants.FIELD_TYPES.LINE_ITEM ? (
                !this.state.slug ? (
                  <Footer {...footerDefaultProps} />
                ) : null
              ) : null}
            </div>

            {!isFetchingData && !dataFetchFailed
              ? this.renderFieldBoxAndArrow()
              : null}

            {!clientApp && !embeddedApp && !isFetchingData ? (
              <IconButton
                className={cx(
                  styles.floatEl,
                  styles.floatEl__btn,
                  styles['floatEl--close']
                )}
                onClick={
                  slug === 'editField'
                    ? this.handleEditDocCloseClick
                    : this.handleReviewDocCloseClick
                }
                icon={Cancel}
                title='Close'
                variant='outlined'
              />
            ) : null}

            <KeyboardShortcuts
              type='document'
              showTip={this.state.showKeyboardTip}
              closeKeyboardTip={this.closeKeyboardTip}
              slug={this.state.slug}
              isFreeTool={this.state.embeddedApp}
              isClientTool={this.state.clientApp}
            />
          </div>
        </FocusTrap>
        <SplitScreenOverlay onNextDocument={this.handleDocNavigateBtnClick} />
        {reviewConfirmation ? (
          <ConfirmationModal
            title={'Save Changes'}
            bodyText={'How would you like to apply the changes?'}
            reverse={true}
            proceedActionText='Apply to new documents only '
            cancelActionText='Apply to new and existing documents'
            onProceedActionBtnClick={() => this.handleSaveCloseBtnClick('one')}
            onCancelActionBtnClick={() => this.handleSaveCloseBtnClick('all')}
            onCloseBtnClick={() => this.setState({ reviewConfirmation: false })}
            processingBtn={oneDocument}
            cancellingBtn={allDocument}
            toast={toast}
            appActions={appActions}
          />
        ) : null}
        {editFieldChanges && cancelConfirmation ? (
          <ErrorConfirmationModal
            show={true}
            modalTitle={'Unsaved Changes'}
            modalBody={
              'There are unsaved changes in this document type. Are you sure you want to cancel?'
            }
            handleModalClose={() =>
              this.setState({ cancelConfirmation: false })
            }
            handleConfirmBtnClick={() => this.cancelChangesMade()}
            confirmBtnLabel='Yes cancel'
            cancelBtnLabel='No, go back'
          />
        ) : null}
        {showUnsavedChangesModal ? (
          <ErrorConfirmationModal
            show={true}
            modalTitle={'Unsaved Changes'}
            modalBody={
              'There are unsaved changes on the table grids. Do you want to apply the changes?'
            }
            handleModalClose={this.handleUnsavedChangesModalClose}
            handleConfirmBtnClick={this.handleExtractData}
            isLoading={sectionField?.isAddingSimilarLines || false}
            confirmBtnLabel='Apply changes'
            cancelBtnLabel='Discard changes'
          />
        ) : null}
        {fieldErrorMessage ? (
          <ErrorConfirmationModal
            show={true}
            modalTitle={'Error Found'}
            modalBody={
              'You have unresolved errors on the fields added. Please resolve the errors to save the changes.'
            }
            handleModalClose={this.handlecloseErrorConfirmationModal}
            handleConfirmBtnClick={this.handlecloseErrorConfirmationModal}
            confirmBtnLabel='Go Back'
          />
        ) : null}

        <DeleteConfirmationModal
          show={deleteDoc}
          onCloseHandler={this.handleDocDeleteCancelBtnClick}
          handleDeleteBtnClick={this.handleDocDeleteProceedBtnClick}
          modalTitle='Confirm Delete Document'
          isLoading={isDeleting}
          modalBody='Are you sure you want to delete this document?'
        />
        {showConfirmReview ? (
          <ConfirmationModal
            title={'Confirm Changes'}
            bodyText={`${confirmErrorMessage} Are you sure you want approve the document with error? `}
            proceedActionText='Confirm'
            cancelActionText='Cancel'
            processIcon={CheckIcon}
            cancelIcon={CloseIcon}
            onProceedActionBtnClick={() =>
              this.handleForceFinishReviewBtnClick()
            }
            onCancelActionBtnClick={() => this.handleReviewCancelBtnClick()}
            onCloseBtnClick={() => this.handleReviewCancelBtnClick()}
            processingBtn={isConfirming}
          />
        ) : null}
        <ReviewCompleteModal
          show={showFirstReviewCompleteModal}
          docMeta={docMeta}
          onActionComplete={() => {
            this.goToNextDocument({
              closeIfNotFound: true,
            });
          }}
          startReviewTour={userflowStart}
          user={user}
          config={config}
        />
      </>
    );
  }
}

function mapStateToProp(state) {
  const {
    originLocation,
    fetchingDataForDocId,
    startingReviewForDocId,
    finishingReviewForDocId,
    skippingReviewForDocId,
    fetchDataFailedForDocId,
    docTypeId,
    documentsById,
    documentIds,
    docId,
    forceFinishingReviewForDocId,

    sectionIds,
    sectionsById,
    grids,
    gridBboxIds,
    fieldsById,
    sectionFieldIds,
    lineItemRowsById,
    selectedSectionFieldId,
    selectedLineItemRowId,
    selectedFieldId,
    selectedLineItemFooterBtn,
    showFirstReviewCompleteModal,
    sort_by,
    collapsedSectionIds,
    selectedSectionId,
    originalGrids,
    footerGridsById,
    selectedGridId,
    isGridEdited,
    fetchError,
    hideFooterEmptyColumn,
  } = state.documents.reviewTool;

  const { documentsById: documentsByIdType, activeSidebarTab } =
    state.documents;
  const sectionField = fieldsById[selectedSectionFieldId];

  const { documentsById: docDocumentsById, rtUpdateFields } = state.documents;
  const { editFieldChanges, customDocTypeFiles } = state.documents.editFields;

  const { config = {}, showTooltipIntroModal, toast } = state.app;

  const isFetchingData = customDocType
    ? false
    : fetchingDataForDocId === docId && _.isEmpty(fetchError);
  const isStartingReview = startingReviewForDocId === docId;
  const isFinishingReview = finishingReviewForDocId === docId;
  const isSkippingReview = skippingReviewForDocId === docId;
  const dataFetchFailed = customDocType
    ? false
    : fetchDataFailedForDocId === docId;
  const stateActionInProgress =
    isStartingReview || isFinishingReview || isSkippingReview || false;
  const isForceFinishingReview = forceFinishingReviewForDocId === docId;

  const documents = documentIds.map((documentId) => {
    return documentsById[documentId];
  });

  const docMeta = documentsById[docId] || null;
  let docReadOnly;
  let docSkipped;
  if (docMeta && docMeta.status) {
    docReadOnly = ![documentConstants.STATUSES.REVIEWING].includes(
      docMeta.status
    );
  }
  if (docMeta && docMeta.status) {
    docSkipped = [documentConstants.STATUSES.REVIEW_SKIPPED].includes(
      docMeta.status
    );
  }
  let sections = [];

  if (!isFetchingData) {
    if (sectionIds && _.isArray(sectionIds)) {
      sections = sectionIds.map((sectionId) => {
        const section = sectionsById[sectionId];
        return section;
      });
    }
  }

  let selectedSectionField = null;
  let selectedLineItemRow = null;
  let selectedField = null;
  let selectedGrid = null;

  if (selectedSectionFieldId) {
    selectedSectionField = fieldsById[selectedSectionFieldId] || null;
  }

  if (selectedLineItemRowId) {
    selectedLineItemRow = lineItemRowsById[selectedLineItemRowId] || null;
  }

  if (selectedFieldId) {
    selectedField = fieldsById[selectedFieldId] || null;
  }

  if (selectedGridId) {
    selectedGrid = footerGridsById[selectedGridId];
  }

  return {
    originLocation,

    isFetchingData,
    isStartingReview,
    isFinishingReview,
    isSkippingReview,
    isForceFinishingReview,

    dataFetchFailed,
    stateActionInProgress,
    docTypeId,
    documentIds,
    documentsById,
    documents,
    docDocumentsById,

    docId,
    docMeta,
    docReadOnly,
    docSkipped,

    sections,
    sectionsById,

    sectionFieldIds,
    sectionField,

    selectedSectionFieldId,
    selectedLineItemRowId,
    selectedFieldId,
    selectedLineItemFooterBtn,

    selectedSectionField,
    selectedLineItemRow,
    selectedField,
    editFieldChanges,
    customDocTypeFiles,

    fieldsById,
    lineItemRowsById,
    grids,
    tooltipFlow:
      config &&
      config.flags &&
      config.flags.showTooltipFlow &&
      !showTooltipIntroModal,
    rtUpdateFields,

    user: state.app.user,
    toast,
    config,
    gridBboxIds,
    showFirstReviewCompleteModal,
    documentsByIdType,
    activeSidebarTab,
    sort_by,
    collapsedSectionIds,
    selectedSectionId,
    originalGrids,
    selectedGrid,
    isGridEdited,
    selectedGridId,
    footerGridsById,
    fetchError,
    hideFooterEmptyColumn,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default withRouter(
  WithTrackingContext(
    connect(mapStateToProp, mapDispatchToProps)(ReviewDocumentOverlay)
  )
);
