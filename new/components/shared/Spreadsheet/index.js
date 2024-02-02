/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { matchPath } from 'react-router-dom';
import { showToast } from 'new/redux/helpers';

import { closest } from '@syncfusion/ej2-base';
import {
  getCell,
  getRangeIndexes,
  SpreadsheetComponent,
} from '@syncfusion/ej2-react-spreadsheet';
import cx from 'classnames';
import copy from 'clipboard-copy';
import download from 'downloadjs';
import {
  ArrowRight,
  Check,
  CheckCircle,
  Download,
  EyeEmpty,
  MoreHoriz,
  NavArrowLeft,
  NavArrowRight,
  Refresh,
  SaveFloppyDisk,
  ShareAndroid,
  SkipNext,
  Trash,
} from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { ReactComponent as CheckIcon } from 'new/assets/images/icons/check.svg';
import { ReactComponent as CloseIcon } from 'new/assets/images/icons/clear.svg';
import { ReactComponent as ExcelIcon } from 'new/assets/images/icons/excelIconPdfPreview.svg';
import { ReactComponent as PdfIcon } from 'new/assets/images/icons/pdfIconPdfPreview.svg';
import { ReactComponent as PoweredByDocsumo } from 'new/assets/images/poweredbydocsumo.svg';
import DeleteConfirmationModal from 'new/components/modals/DeleteConfirmationModal/DeleteConfirmationModal';
import ConfirmationModal from 'new/components/shared/FiledConfirmationModal';
import { DataFetchFailurePageError } from 'new/components/shared/PageError';
import * as documentConstants from 'new/constants/document';
import { KEY_CODES } from 'new/constants/keyboard';
import { MIXPANEL_ORIGINS } from 'new/constants/mixpanel';
import routes from 'new/constants/routes';
import { SUPPORT_LINK } from 'new/constants/urllink';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Banner from 'new/ui-elements/Banner/Banner';
import { default as ContainedButton } from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import IconMenu from 'new/ui-elements/IconMenu';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import { getOS } from 'new/utils';
import * as storage from 'new/utils/storage';

import DocumentTitleHeader from './components/DocumentTitleHeader/DocumentTitleHeader';
import PdfViewer from './components/PdfViewer/PdfViewer';
import SummarySidebar from './components/SummarySidebar/SummarySidebar';
import SummarySidebarV2 from './components/SummarySidebarV2/SummarySidebarV2';
import DownloadModal from './DownloadModal';

import styles from './index.scss';
class SpreadSheet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDownloading: false,
      isSidebarOpen: true,
      embeddedApp: false,
      excelData: [
        {
          name: 'Testing 2',
          rows: [
            {
              cells: [],
            },
            {
              cells: [],
            },
          ],
          columns: [],
        },
      ],
      lookupData: [],
      mounted: false,
      fileUrl: '',
      splitView: false,
      splitMode: 'fullScreen',
      showLoader: false,
      previewOverlayShow: false,
      tabIndex: 1,
      tabs: [
        {
          id: 1,
          documentTitle: '',
          active: true,
          icon: <ExcelIcon />,
        },
        {
          id: 2,
          documentTitle: 'Original file',
          active: false,
          icon: <PdfIcon />,
        },
      ],
      highlights: [],
      originalExcelDocHighlighted: false,
      savedToDb: false,
      updatedExcelData: [],
      online: true,
    };
    this.summarybox = React.createRef();
    this.contentRef = React.createRef();
    this.wrapperRef = React.createRef();
    this.wrapperDropRef = React.createRef();
    this.verticalDragLine = React.createRef();
    this.horizontalDragLine = React.createRef();
    this.notSplitContentRef = React.createRef();
    this.splitContentRef = React.createRef();
    this.secondPdfViewerRef = React.createRef();
  }

  getUpdatedSummary = () => {
    const { summaryData = {} } = this.state;

    if (summaryData.customCode) {
      return this.summarybox.current
        ? this.summarybox.current.getUpdatedSummary()
        : {};
    }

    return {};
  };

  approve = async () => {
    const {
      docId,
      documentActions,
      goToNextDocument,
      docMeta,
      userEmail,
      history: {
        location: { state },
      },
      appActions,
      config,
    } = this.props;
    const { clientApp, fileUrl } = this.state;
    const { canSwitchToOldMode = true } = config;

    this.setState({
      isApproving: true,
      savedToDb: false,
    });
    const { summaryData } = this.state;
    const updatedSummary = this.getUpdatedSummary();
    const parsedUrl = new URL(window.location.href);
    const ext_user = parsedUrl.searchParams.get('ext_user');
    const data = await this.getSyncfusionData();
    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.approve_document, {
      origin: state && state.origin ? state.origin : 'Shareable Link',
      'work email': userEmail,
      'document type': docMeta?.type,
      label: docMeta.title,
      type: _.isEmpty(fileUrl) ? 'excel' : 'pdf',
      docMeta: docMeta,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    try {
      let response = {};
      response = await api.finishSpreadsheetReview({
        docId,
        data,
        summary: updatedSummary || summaryData,
        strict: true,
        ext_user: ext_user ? ext_user : null,
      });
      const {
        responsePayload: { data: sections },
      } = response;
      const { title } = docMeta;
      const toastMessage = (
        <span>
          The document <strong>{title}</strong> is approved successfully.
        </span>
      );
      appActions.setToast({
        title: toastMessage,
        success: true,
      });
      this.setCellChangeMade(false);
      if (clientApp) {
        setTimeout(() => global.window.location.reload(), 1500);
        return;
      } else {
        documentActions.rtFinishSpreadsheetReviewFulfilled({
          docId,
          sections,
        });
        goToNextDocument({
          closeIfNotFound: true,
        });
      }
    } catch (e) {
      const message = _.get(
        e.responsePayload,
        'message',
        'Document approved successfully'
      );
      const statusCode = _.get(e.responsePayload, 'statusCode');
      this.setState({
        confirmErrorMessage: message,
        showConfirmReview: true,
      });
      if (statusCode === 409) {
        this.setState({
          duplicateHeader: true,
        });
      }
    } finally {
      this.setState({
        isApproving: false,
      });
    }
  };

  handleForceFinishReviewBtnClick = async () => {
    const {
      docId,
      documentActions,
      appActions,
      goToNextDocument,
      docMeta,
      history: {
        location: { state },
      },
      userEmail,
      config,
    } = this.props;

    const { clientApp, fileUrl } = this.state;
    const { canSwitchToOldMode = true } = config;
    this.setState({
      isConfirming: true,
      savedToDb: false,
    });
    const data = await this.getSyncfusionData();
    const parsedUrl = new URL(window.location.href);
    const ext_user = parsedUrl.searchParams.get('ext_user');
    const { summaryData } = this.state;
    const updatedSummary = this.getUpdatedSummary();
    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.force_approve_document, {
      origin: state && state.origin ? state.origin : 'Shareable Link',
      'work email': userEmail,
      'document type': docMeta.type,
      label: docMeta.title,
      type: _.isEmpty(fileUrl) ? 'excel' : 'pdf',
      docMeta: docMeta,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    try {
      let response = {};
      response = await api.finishSpreadsheetReview({
        docId,
        data,
        summary: updatedSummary || summaryData,
        strict: false,
        ext_user: ext_user ? ext_user : null,
      });
      const {
        responsePayload: { data: sections },
      } = response;
      const { title } = docMeta;
      const toastMessage = (
        <span>
          The document <strong>{title}</strong> is approved successfully.
        </span>
      );
      appActions.setToast({
        title: toastMessage,
        success: true,
      });
      this.setCellChangeMade(false);
      if (clientApp) {
        setTimeout(() => global.window.location.reload(), 1500);
        return;
      } else {
        documentActions.rtFinishSpreadsheetReviewFulfilled({
          docId,
          sections,
        });
        goToNextDocument({
          closeIfNotFound: true,
        });
      }
    } catch (e) {
      const {
        responsePayload: { message = '' },
      } = e || {};
      appActions.setToast({
        title: `The spreadsheet was not approved. \n ${message}`,
        error: true,
        duration: null,
      });
    } finally {
      this.setState({
        isConfirming: false,
        duplicateHeader: false,
      });
    }
  };
  startReview = async () => {
    const {
      docId,
      documentActions,
      appActions,
      docMeta,
      history: {
        location: { state },
      },
      config,
      userEmail,
    } = this.props;
    const { fileUrl } = this.state;

    this.setState({
      isReviewing: true,
      savedToDb: false,
    });
    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.start_review_doc, {
      origin: state && state.origin ? state.origin : 'Shareable Link',
      'work email': userEmail,
      'document type': docMeta.type,
      label: docMeta.title,
      type: _.isEmpty(fileUrl) ? 'excel' : 'pdf',
      docMeta: docMeta,
    });
    try {
      let response = {};
      response = await api.startSpreadsheetReview({
        docId,
        data: {},
      });
      const {
        responsePayload: { data: sections },
      } = response;
      documentActions.rtstartSpreadsheetReviewFulfilled({
        docId,
        sections,
      });
    } catch (e) {
      const {
        responsePayload: { message = '' },
      } = e || {};
      appActions.setToast({
        title: `The spreadsheet did not go to review. \n ${message}`,
        error: true,
        duration: null,
      });
    } finally {
      this.setState({
        isReviewing: false,
      });
    }
  };

  componentDidMount() {
    this.setCellChangeMade(false);
    window.addEventListener('beforeunload', (e) => this.keepOnPage(e));
    if (sessionStorage.getItem('tempToken')) {
      this.setState({
        embeddedApp: true,
      });
    }
    this.dragVerticalElement(
      this.verticalDragLine.current,
      this.summarybox.current.getSummarySidebarDOM(),
      this.contentRef.current,
      true
    );
    if (
      this.splitContentRef &&
      this.splitContentRef.current &&
      this.notSplitContentRef &&
      this.notSplitContentRef.current
    ) {
      if (this.verticalDragLine && this.verticalDragLine.current)
        this.dragVerticalElement(
          this.verticalDragLine.current,
          this.notSplitContentRef.current,
          this.splitContentRef.current
        );
      if (this.horizontalDragLine && this.horizontalDragLine.current)
        this.dragHorizontalElement(
          this.horizontalDragLine.current,
          this.splitContentRef.current,
          this.notSplitContentRef.current
        );
    }
    document.addEventListener('mousedown', this.handleClickOutside);
    document.addEventListener('keydown', this.handleKeyDown);
    this.fetchOriginalPdfFile();
    if (this.state.isSidebarOpen) this.setInitialSummarybarWidth(); // initial width for summary sidebar
  }

  handleKeyDown = (e) => {
    const { keyCode, shiftKey, ctrlKey, altKey, metaKey } = e;

    const { docMeta } = this.props;

    if (!docMeta) {
      // No document
      return;
    }

    const isMacOS = getOS() === 'MacOS';

    if (
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey)) &&
      shiftKey &&
      keyCode === KEY_CODES.ENTER
    ) {
      // Confirm document
      this.approve();
    } else if (
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey)) &&
      !shiftKey &&
      keyCode === KEY_CODES.ARROW_RIGHT
    ) {
      // Skip document
      this.handleSkipReviewBtnClick();
    } else if (
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey)) &&
      altKey &&
      keyCode === KEY_CODES.R
    ) {
      // Rerun
      this.rerun();
    } else if (
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey)) &&
      shiftKey &&
      keyCode === KEY_CODES.ARROW_RIGHT
    ) {
      // Next document
      this.handleNextBtnClick();
    } else if (
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey)) &&
      shiftKey &&
      keyCode === KEY_CODES.ARROW_LEFT
    ) {
      // Previous document
      this.handlePrevBtnClick();
    } else if (
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey)) &&
      keyCode === KEY_CODES.S
    ) {
      // Save
      e.preventDefault();
      this.save();
    }
  };

  setInitialSummarybarWidth = () => {
    const summaryBoxInitialWidth = JSON.parse(
      storage.get('summaryBarDraggedWidth')
    );
    if (summaryBoxInitialWidth > 0) {
      if (
        this.summarybox.current &&
        this.summarybox.current.getSummarySidebarDOM()
      )
        this.summarybox.current.getSummarySidebarDOM().style.width = `${summaryBoxInitialWidth}px`;
      if (this.contentRef && this.contentRef.current)
        this.contentRef.current.style.width = `calc(100% - ${
          summaryBoxInitialWidth - 30
        }px)`;
    }
  };

  fetchOriginalPdfFile = async () => {
    const { docId = '', title = '' } = this.state.docMeta;
    const fileExtension = title.split('.').pop();
    if (fileExtension === 'pdf') {
      const response = await api.previewOriginalDocument({ docId });
      const fileUrl = _.get(response, 'responsePayload.fileUrl');
      this.setState({ fileUrl });
    }
    this.setState({ mounted: true });
  };

  dragVerticalElement = (line = {}, box = {}, sheet = {}, isSummaryBar) => {
    var pos = 0,
      pos1 = 0;
    if (!_.isEmpty(line)) line.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup
      pos1 = e.clientX;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      pos = e.clientX - pos1;
      pos1 = e.clientX;
      let right = pos;
      let boxWidth = box.offsetWidth;
      let sheetWidth = sheet.offsetWidth;
      let width = 0;

      if (right <= 0) {
        const isSidebarOpen = JSON.parse(storage.get('isSidebarOpen'));
        width = boxWidth + right;

        if (!isSidebarOpen && !isSummaryBar && width <= 720) return;
        if (width <= 400) return;

        box.style.flex = `0 ${width < 300 ? 0 : width}px`;
        sheet.style.flex = '1 0';
      }

      if (right > 0) {
        width = sheetWidth - right;

        if (width <= boxWidth) return;

        box.style.flex = '1 0';
        sheet.style.flex = `0 ${width < 300 ? 0 : width}px`;
      }
      if (isSummaryBar) {
        storage.set('summaryBarDraggedWidth', boxWidth);
      }
    }

    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
    }
  };

  dragHorizontalElement = (line = {}, splitContent = {}, sheet = {}) => {
    var pos = 0,
      pos1 = 0;
    line.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup
      pos1 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      pos = e.clientY - pos1;
      pos1 = e.clientY;
      let top = pos;
      let height = 0;
      let splitContentHeight = splitContent.clientHeight;
      let sheetHeight = sheet.clientHeight;

      if (top <= 0) {
        height = sheetHeight + top;

        if (height <= 200) return;

        sheet.style.flex = `0 ${height}px`;
        splitContent.style.flex = '1 0';
      }

      if (top > 0) {
        height = splitContentHeight - top;

        if (height <= 200) return;

        sheet.style.flex = '1 0';
        splitContent.style.flex = `0 ${height}px`;
      }
    }

    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
    }
  };

  getPageDimension = (pageNumber = '') => {
    const { docMeta: { pages = [] } = {} } = this.props;
    const { image: { height = '', width = '' } = {} } =
      pages.find((page) => page?.id === pageNumber) || {};
    return {
      height,
      width,
    };
  };

  getCellPosition = (cell = {}) => {
    const { position = [], page = '' } = cell;
    const scrollMargin = 200;
    const rect = {
      x1: position[0],
      y1: position[1],
      x2: position[2],
      y2: position[3],
      width: this.getPageDimension(page).width,
      height: this.getPageDimension(page).height,
    };
    return {
      id: _.uniqueId('bbox_'),
      position: {
        boundingRect: {
          ...rect,
          x1: rect.x1 - scrollMargin,
          x2: rect.x2 - scrollMargin,
          y1: rect.y1 - scrollMargin,
          y2: rect.y2 - scrollMargin,
        },
        rects: [{ ...rect }],
        pageNumber: page,
      },
    };
  };

  getFormattedExcelData = (props) => {
    const { excelData, docMeta } = props;
    let pdfAsOriginal = false;
    let highlights = [];
    let highlightRanges = [];
    const { title = '' } = docMeta;
    const fileExtension = title.split('.').pop();
    if (fileExtension === 'pdf') {
      pdfAsOriginal = true;
    }

    // remapped the excelData for position formatting to pass on spreadsheet component for cross referencing
    const formattedCellData = JSON.parse(JSON.stringify(excelData)).map(
      (data) => ({
        ...data,
        rows: data?.rows?.map((row = {}) => ({
          ...row,
          cells: row?.cells?.map((cell) => {
            const { position } = cell;
            if (!_.isEmpty(position)) {
              const tempCell = Object.assign({}, cell);
              const cellPosition = this.getCellPosition(tempCell);
              if (pdfAsOriginal) {
                highlights = [...highlights, { ...cellPosition }]; // added the initial cell highlighting values in pdf viewer
              } else {
                if (_.isArray(position) && position.every((pos) => pos !== 0)) {
                  highlightRanges = [
                    ...highlightRanges,
                    `${position[0]}${position[1]}:${position[2]}${position[3]}`,
                  ];
                }
              }
              return {
                ...cell,
                ...cellPosition,
                cellPos: position,
              };
            }
            return { ...cell };
          }),
        })),
      })
    );

    return {
      excelData: formattedCellData,
      highlights,
      highlightRanges,
    };
  };

  UNSAFE_componentWillMount() {
    const { docMeta, summaryData } = this.props;
    const parsedUrl = new URL(window.location.href);
    const client = parsedUrl.searchParams.get('client');
    const { excelData, highlights, highlightRanges } =
      this.getFormattedExcelData(this.props);

    if (sessionStorage.getItem('tempToken') && client) {
      this.setState({
        embeddedApp: false,
        clientApp: true,
      });
    }
    if (sessionStorage.getItem('tempToken') && !client) {
      this.setState({
        embeddedApp: true,
      });
    }

    // sidebar config retrieved from localstorage
    const isSidebarOpen = JSON.parse(storage.get('isSidebarOpen'));
    if (isSidebarOpen !== null) {
      this.setState({ isSidebarOpen: Boolean(isSidebarOpen) });
    } else {
      storage.set('isSidebarOpen', true);
    }

    this.setState({
      excelData,
      docMeta,
      summaryData,
      highlights,
      highlightRanges,
      updatedExcelData: excelData,
    });

    document.removeEventListener('keydown', this.handleKeyDown);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { excelData, summaryData } = this.props;
    const {
      excelData: nextExcelData,
      highlights,
      highlightRanges,
    } = this.getFormattedExcelData(nextProps);
    const { summaryData: nextSummaryData } = nextProps;
    const { savedToDb } = this.state;
    if (excelData && nextExcelData) {
      if (!_.isEqual(excelData, nextExcelData) && !savedToDb) {
        this.setState({
          excelData: nextExcelData,
          highlights,
          highlightRanges,
          key: Math.random(),
        });
      }
    }
    if (summaryData && nextSummaryData) {
      if (!_.isEqual(summaryData, nextSummaryData)) {
        this.setState({
          summaryData: nextSummaryData,
        });
      }
    }
    const { docMeta } = this.props;
    const { docMeta: nextDocMeta } = nextProps;
    if (!_.isEqual(docMeta, nextDocMeta)) {
      this.setState({
        docMeta: nextDocMeta,
      });
    }
    const isSidebarOpen = JSON.parse(storage.get('isSidebarOpen'));
    this.setState({ isSidebarOpen });
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.keepOnPage);
    document.removeEventListener('mousedown', this.handleClickOutside);
    this.closeToast();
  }

  handleClickOutside = () => {
    if (
      this.wrapperRef &&
      this.wrapperDropRef.current &&
      !this.wrapperRef.current.contains(event.target) &&
      this.wrapperDropRef &&
      this.wrapperDropRef.current &&
      !this.wrapperDropRef.current.contains(event.target)
    ) {
      if (this.state.isMoreClicked) {
        this.setState({
          isMoreClicked: false,
        });
      }
    }
  };

  getSyncfusionData = async () => {
    if (this.firstSpreadsheet) {
      const data = await this.firstSpreadsheet
        .saveAsJson()
        .then((Json) => Json.jsonObject.Workbook.sheets);
      data.shift();
      let newData = [];
      newData.push({});
      const orgData = data.map((data) => ({
        ...data,
        rows: data.rows.map((row) => {
          if (!_.isEmpty(row)) {
            return {
              ...row,
              cells: row?.cells?.map((cell) => {
                if (cell && !_.isEmpty(cell.position)) {
                  return {
                    ...cell,
                    position: cell.cellPos,
                  };
                }
                return { ...cell };
              }),
            };
          }
          return {};
        }),
      }));
      newData.push(orgData[0]);
      return newData;
    }
    return [];
  };

  save = async () => {
    const {
      docId,
      appActions,
      docMeta,
      history: {
        location: { state },
      },
      userEmail,
      config,
    } = this.props;

    const { fileUrl } = this.state;
    const { canSwitchToOldMode = true } = config;
    this.setState({
      isSaving: true,
    });
    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.save_file, {
      origin: state && state.origin ? state.origin : 'Shareable Link',
      'work email': userEmail,
      'document type': docMeta.type,
      label: docMeta.title,
      type: _.isEmpty(fileUrl) ? 'excel' : 'pdf',
      docMeta: docMeta,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    const { summaryData } = this.state;
    const updatedSummary = await this.getUpdatedSummary();
    const data = await this.getSyncfusionData();

    if (data.length) {
      try {
        await api.saveSpreadsheetFile({
          doc_id: docId,
          data,
          summary: updatedSummary || summaryData,
        });

        appActions.setToast({
          title: 'The changes have been saved successfully.',
          success: true,
        });

        this.setCellChangeMade(false);
      } catch (e) {
        const {
          responsePayload: { message = '' },
        } = e || {};
        appActions.setToast({
          title: `The changes couldn't be saved. Please try again. \n ${message}`,
          error: true,
          duration: null,
        });
      } finally {
        this.setState({
          isSaving: false,
          isReRunning: false,
          savedToDb: true,
        });
      }
    }
  };

  rerun = async () => {
    const {
      docId,
      documentActions,
      appActions,
      userEmail,
      docMeta,
      history: {
        location: { state },
      },
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config;

    const { summaryData, fileUrl } = this.state;
    const updatedSummary = this.getUpdatedSummary();

    this.setState({
      isReRunning: true,
      savedToDb: false,
    });

    const data = await this.getSyncfusionData();

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.rerun_validation, {
      origin: state && state.origin ? state.origin : 'Shareable Link',
      'work email': userEmail,
      'document type': docMeta.type,
      label: docMeta.title,
      type: _.isEmpty(fileUrl) ? 'excel' : 'pdf',
      docMeta: docMeta,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    try {
      let response = {};

      response = await api.saveSpreadsheetFile({
        doc_id: docId,
        data,
        summary: updatedSummary || summaryData,
        refresh: true,
      });

      const {
        responsePayload: { data: sections },
      } = response;

      documentActions.rtSaveSpreadsheetFulfilled({
        docId,
        sections,
      });
      appActions.setToast({
        title: 'The validation is completed.',
        success: true,
      });
      this.setCellChangeMade(false);
    } catch (e) {
      // Do nothing
      const { responsePayload: { message = '' } = {} } = e;
      documentActions.rtSaveSpreadsheetRejected({
        docId,
        e,
      });
      this.setState(
        {
          savedToDb: true,
        },
        () => {
          appActions.setToast({
            title: `The changes couldn't be saved.\n Validation failed.\n${
              message || e.error.message
            }`,
            error: true,
            duration: null,
          });
        }
      );
    } finally {
      if (summaryData?.customCode) {
        this.getRecentSheetData({ rerunSummaryCalc: true });
      }
      this.setState({
        isReRunning: false,
      });
    }
  };

  copyShareableLink = () => {
    const appEnvironment = global.window.location.origin;
    const { pathname, search } = this.props.history.location;
    const {
      docMeta,
      userEmail,
      history: {
        location: { state },
      },
      config,
    } = this.props;

    const { fileUrl } = this.state;
    const { canSwitchToOldMode = true } = config;
    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.copy_shareable_link_client, {
      origin: state && state.origin ? state.origin : 'Shareable Link',
      'work email': userEmail,
      'document type': docMeta.type,
      type: _.isEmpty(fileUrl) ? 'excel' : 'pdf',
      docMeta: docMeta,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    this.setState(
      {
        urlName: `${appEnvironment}${pathname}${search}`,
        savedToDb: true,
      },
      () => copy(this.state.urlName)
    );
    showToast({
      title: 'Link copied to clipboard',
      success: true,
      duration: 3000,
      removeClose: true,
    });
  };

  copyShareableClientLink = async () => {
    const appEnvironment = global.window.location.origin;
    const { docId } = this.props;
    const { isSidebarOpen } = this.state;
    const {
      docMeta,
      userEmail,
      history: {
        location: { state },
      },
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config;

    const { fileUrl } = this.state;
    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.copy_shareable_link, {
      origin: state && state.origin ? state.origin : 'Shareable Link',
      'work email': userEmail,
      'document type': docMeta.type,
      type: _.isEmpty(fileUrl) ? 'excel' : 'pdf',
      docMeta: docMeta,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    showToast({
      title: 'Please wait. Generating link',
      success: true,
      duration: 3000,
      removeClose: true,
    });

    if (isSidebarOpen) {
      this.setState({ isMoreClicked: false, savedToDb: true });
    }

    try {
      const response = await api.getTempToken({ docId });
      const { token = {} } = response.responsePayload;
      this.setState(
        {
          temporaryToken: token,
        },
        () => {
          this.setState({
            clientURL: `${appEnvironment}${routes.DOCUMENT_SPREADSHEET}/${docId}?token=${this.state.temporaryToken}&client=true`,
          });
        }
      );
    } catch (e) {
      //do nothing
    }
    copy(this.state.clientURL);
    showToast({
      title: 'Link copied to clipboard',
      success: true,
      duration: 3000,
      removeClose: true,
    });
  };

  addKeyValueIfMissing = (summaryPayload = {}) => {
    if (summaryPayload && Array.isArray(summaryPayload)) {
      summaryPayload.forEach((item) => {
        this.addKeyValueIfMissing(item);
      });
    }

    if (summaryPayload && _.isPlainObject(summaryPayload)) {
      if ('value' in summaryPayload) {
        if (!('key' in summaryPayload) || _.isEmpty(summaryPayload['key'])) {
          summaryPayload['key'] = '-';
        }
        if (
          !('label' in summaryPayload) ||
          _.isEmpty(summaryPayload['label'])
        ) {
          summaryPayload['label'] = '-';
        }
      }
      for (const obj in summaryPayload) {
        this.addKeyValueIfMissing(summaryPayload[obj]);
      }
    }

    return summaryPayload;
  };

  handleDownloadBtnClick = async (type) => {
    const {
      docId,
      config,
      documentTitle,
      docMeta,
      userEmail,
      history: {
        location: { state, pathname },
      },
      user,
    } = this.props;
    const { summaryData, temporaryDownloadToken, fileUrl } = this.state;
    const { excelDownloadApi = '', canSwitchToOldMode = true } = config;
    const data = await this.firstSpreadsheet
      .saveAsJson()
      .then((Json) => Json.jsonObject.Workbook.sheets);

    const updatedSummary = this.getUpdatedSummary();

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
      origin: originType.value || 'Shareable Link',
      'work email': userEmail,
      'document type': docMeta.type,
      'download option': type,
      type: _.isEmpty(fileUrl) ? 'excel' : 'pdf',
      docId: docMeta.docId,
      label: docMeta.title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    this.setState({
      type,
      isDownloading: true,
    });
    if (type === 'json') {
      try {
        let response = {};
        response = await api.downloadSpreadsheetFile({
          doc_id: docId,
        });
        const { responsePayload } = response;
        const downloadUrl = _.get(responsePayload, 'data.downloadUrl');
        download(downloadUrl);
      } catch (e) {
        // Do nothing
      } finally {
        this.setState({
          type: null,
          isDownloading: false,
          isDownloadModalOpen: false,
          savedToDb: true,
        });
      }
    } else if (type === 'excel') {
      const mergedSummaryData = summaryData?.customCode
        ? { ...summaryData, ...updatedSummary }
        : summaryData;
      const summaryDataPayload = this.addKeyValueIfMissing({
        ...mergedSummaryData,
      });

      try {
        let response = {};
        response = await api.downloadExcel({
          docId,
          userId: user.userId,
          orgId: user.orgId,
          dUrl: excelDownloadApi,
          excel_data: data,
          file_name: documentTitle,
          summary_data: summaryDataPayload,
          temporaryDownloadToken,
        });
        const { responsePayload } = response;
        const downloadUrl = _.get(responsePayload, 'fileUrl');
        download(downloadUrl);
      } catch (e) {
        // Do nothing
      } finally {
        this.setState({
          type: null,
          isDownloading: false,
          isDownloadModalOpen: false,
          savedToDb: true,
        });
      }
    } else if (type === 'original_file') {
      try {
        let response = {};
        response = await api.downloadDocumentByFormat({
          type: type,
          doc_id: docId,
        });
        const { responsePayload } = response;
        const downloadUrl = _.get(responsePayload, 'data.downloadUrl');
        download(downloadUrl);
      } catch (e) {
        // Do nothing
      } finally {
        this.setState({
          type: null,
          isDownloading: false,
          isDownloadModalOpen: false,
          savedToDb: true,
        });
      }
    }
  };

  handleDownloadModalOpen = async () => {
    this.setState({
      isDownloadModalOpen: true,
    });
    const { docId } = this.props;
    try {
      const response = await api.getTempToken({ docId });
      const { token = {} } = response.responsePayload;
      this.setState({
        temporaryDownloadToken: token,
        savedToDb: true,
      });
    } catch (e) {
      //do nothing
    }
  };

  handleDownloadModalClose = () => {
    this.setState({
      isDownloadModalOpen: false,
      temporaryDownloadToken: null,
      savedToDb: true,
    });
  };

  keepOnPage(e) {
    if (this.isCellChangeMade()) {
      e.preventDefault();
      var message = 'Changes you made may not be saved.';
      e.returnValue = message;
      return message;
    }
    return null;
  }

  handleClose = () => {
    const { docMeta, closeButtonClick } = this.props;
    const { status } = docMeta;
    if (status === 'processed' || !this.isCellChangeMade()) {
      closeButtonClick();
    } else {
      this.setState({
        closeModalOpen: true,
      });
    }
  };

  handleCloseSaveModal = () => {
    this.setState({
      closeModalOpen: false,
      savedToDb: true,
    });
  };

  handleCloseSpreadsheet = () => {
    const { closeButtonClick } = this.props;
    this.setCellChangeMade(false);
    this.handleCloseSaveModal();
    closeButtonClick();
  };

  handleCloseAndSaveSpreadsheet = async () => {
    const { docId, appActions, closeButtonClick } = this.props;
    const { summaryData } = this.state;
    const updatedSummary = this.getUpdatedSummary();
    const data = await this.getSyncfusionData();
    this.setState({
      isSavingAndExit: true,
      savedToDb: false,
    });
    try {
      await api.saveSpreadsheetFile({
        doc_id: docId,
        data,
        summary: updatedSummary || summaryData,
      });
      this.setCellChangeMade(false);
    } catch (e) {
      const {
        responsePayload: { message = '' },
      } = e || {};
      appActions.setToast({
        title: `The spreadsheet was not saved. \n ${message}`,
        error: true,
        duration: null,
      });
    } finally {
      this.setState({
        isSavingAndExit: false,
        savedToDb: true,
      });
      await this.closeToast();
      closeButtonClick();
    }
  };

  closeToast = async () => {
    const { toast, appActions } = this.props;
    if (toast) await appActions.removeToast({ id: toast.id });
  };

  handleReviewCancelBtnClick = () => {
    this.setState({
      showConfirmReview: false,
      duplicateHeader: false,
      savedToDb: true,
    });
  };

  calculateCustomSum = (firstCell, secondCell) => {
    return Number(firstCell) + Number(secondCell);
  };

  // Custom formula for a cell to retun value from lookup table
  lookup = (sourceValue, key, destinationValue) => {
    const { lookupData } = this.props;

    key = key.slice(1, -1) || 'sub_category_1';
    destinationValue = destinationValue.slice(1, -1);
    let sheetData = lookupData['coa_classification'] || []; // TODO: make file name (i.e. coa_classification) dynamic
    let data = 'N/A';
    for (let i = 0; i < sheetData.length; i++) {
      if (sheetData[i][key] === sourceValue) {
        data = sheetData[i][destinationValue];
        return String(data);
      }
    }

    return data;
  };

  handleFileDeleteBtnClick = () => {
    const { isSidebarOpen } = this.state;
    if (isSidebarOpen) {
      this.setState({ isMoreClicked: false });
    }

    this.setState({
      deleteDoc: true,
    });
  };

  handleFileDeleteProceedBtnClick = async () => {
    const {
      docId,
      goToNextDocument,
      docMeta,
      userEmail,
      history: {
        location: { state },
      },
      config,
    } = this.props;

    this.setState({
      isDeleting: true,
    });
    const { canSwitchToOldMode = true } = config;
    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.delete_doc, {
      origin: state && state.origin ? state.origin : 'Shareable Link',
      'work email': userEmail,
      'document type': docMeta.type,
      label: docMeta.title,
      docMeta: docMeta,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    try {
      await api.deleteDocument({
        docId,
      });
      goToNextDocument({
        closeIfNotFound: true,
      });

      this.props.documentActions.rtRemoveSpreadsheetFromStack({
        docId,
      });
    } finally {
      this.setState({ isDeleting: false, deleteDoc: false });
    }
  };

  handleFileDeleteCancelBtnClick = () => {
    this.setState({
      deleteDoc: false,
    });
  };

  saveOnChanges = async () => {
    const { docId } = this.props;

    const { summaryData } = this.state;
    const updatedSummary = this.getUpdatedSummary();

    const data = await this.getSyncfusionData();
    await api.saveSpreadsheetFile({
      doc_id: docId,
      data,
      summary: updatedSummary || summaryData,
    });
  };

  handlePrevBtnClick = () => {
    const { documentIds, docId, SpreadsheetNavigateBtnClick } = this.props;

    const currentDocIndex = documentIds.indexOf(docId);

    let prevDocId;
    if (currentDocIndex > 0) {
      prevDocId = documentIds[currentDocIndex - 1];
    }

    if (this.isCellChangeMade()) {
      this.saveOnChanges();
    }
    setTimeout(() => {
      SpreadsheetNavigateBtnClick(prevDocId, 'prev');
    }, 500);
  };

  handleNextBtnClick = () => {
    const { documentIds, docId, SpreadsheetNavigateBtnClick } = this.props;

    const totalDocCount = documentIds.length;
    const currentDocIndex = documentIds.indexOf(docId);

    if (currentDocIndex < 0) {
      return null;
    }

    let nextDocId;
    if (currentDocIndex < totalDocCount - 1) {
      nextDocId = documentIds[currentDocIndex + 1];
    }
    if (this.isCellChangeMade()) {
      this.saveOnChanges();
    }
    setTimeout(() => {
      SpreadsheetNavigateBtnClick(nextDocId, 'next');
    }, 500);
  };

  renderSummaryFooterPagination = () => {
    const { documentIds, docId } = this.props;

    const { isSidebarOpen } = this.state;
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

    return (
      <div
        className={cx(styles.nav, {
          [styles.navExpand]: !isSidebarOpen,
        })}
      >
        <IconButton
          variant='text'
          icon={<NavArrowLeft height={24} width={24} />}
          size='extra-small'
          disabled={!prevDocId}
          onClick={this.handlePrevBtnClick}
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
          icon={<NavArrowRight height={24} width={24} />}
          size='extra-small'
          disabled={!nextDocId}
          onClick={this.handleNextBtnClick}
          className={styles.paginationBtn}
        />
      </div>
    );
  };

  handleMoreOptionPopover = () => {
    this.setState({
      isMoreClicked: !this.state.isMoreClicked,
    });
  };

  handleMenuOptionsClick = ({ key }) => {
    switch (key) {
      case 'download':
        this.handleDownloadModalOpen();
        break;
      case 'share':
        this.copyShareableClientLink();
        break;
      case 'delete':
        this.handleFileDeleteBtnClick();
        break;
    }
  };

  handleSkipReviewBtnClick = async () => {
    const { docId, documentActions, goToNextDocument } = this.props;
    const { clientApp } = this.state;
    // eslint-disable-next-line compat/compat
    const parsedUrl = new URL(window.location.href);
    const ext_user = parsedUrl.searchParams.get('ext_user');

    this.setState({ isSkippingReview: true });

    try {
      documentActions.rtSkipDocumentReview({
        docId,
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
        goToNextDocument({
          closeIfNotFound: true,
        });
      }
    } catch (error) {
      documentActions.rtSkipDocumentReviewRejected({
        docId,
        error,
      });
    } finally {
      this.setState({ isSkippingReview: false });
    }
  };

  getCTAButtonGroup = () => {
    const {
      isDownloading,
      isApproving,
      isReRunning,
      isSidebarOpen,
      isReviewing,
      isSkippingReview,
      isSaving,
      clientApp,
      tabIndex,
      embeddedApp,
    } = this.state;
    const { docMeta, stateActionInProgress } = this.props;
    const isMacOS = getOS() === 'MacOS';
    const keyCommand = isMacOS ? 'Cmd' : 'Ctrl';
    const modifierKey = isMacOS ? 'Opt' : 'Alt';
    const showStartReviewBtn = [
      documentConstants.STATUSES.PROCESSED,
      documentConstants.STATUSES.REVIEW_REQUIRED,
      documentConstants.STATUSES.REVIEW_SKIPPED,
    ].includes(_.get(docMeta, 'status'));

    const showApprovedBtn = [documentConstants.STATUSES.PROCESSED].includes(
      _.get(docMeta, 'status')
    );

    const iconMenuOptions = [
      {
        title: 'Download',
        icon: <Download height={16} width={16} />,
        key: 'download',
        disabled: isDownloading,
      },
      {
        title: 'Share',
        icon: <ShareAndroid height={16} width={16} />,
        key: 'share',
      },
      {
        title: 'Delete',
        icon: <Trash height={16} width={16} />,
        key: 'delete',
        classNames: styles.deleteOption,
      },
    ];

    return isSidebarOpen ? (
      <div
        className={cx(styles.buttonContainer, {
          [styles.buttonContainer_clientApp]: showStartReviewBtn && clientApp,
        })}
      >
        {showStartReviewBtn && clientApp ? null : (
          <div className={styles.buttonContainer_firstRow}>
            <div
              className={cx(
                styles.buttonContainer_leftBtn,
                'd-flex',
                'align-items-center'
              )}
            >
              {showStartReviewBtn && !clientApp ? (
                <>
                  {showApprovedBtn ? (
                    <div className={styles.approveContent}>
                      <span className={styles.approveContent__icon}>
                        <CheckCircle
                          height={20}
                          width={20}
                          color='var(--ds-clr-success)'
                        />
                      </span>
                      <span className={styles.approveContent__label}>
                        Approved
                      </span>
                    </div>
                  ) : null}
                  <Tooltip label='Review Again' placement='top'>
                    <ContainedButton
                      icon={<EyeEmpty height={20} width={20} />}
                      size='small'
                      variant='outlined'
                      isLoading={isReviewing}
                      onClick={this.startReview}
                      className={cx(styles.approveBtn, {
                        [styles['approveBtn--collapsed']]: showApprovedBtn,
                      })}
                    >
                      Review Again
                    </ContainedButton>
                  </Tooltip>
                </>
              ) : showStartReviewBtn && clientApp ? null : (
                <>
                  <Tooltip
                    label={`Approve Spreadsheet (${keyCommand} + Shift + Enter)`}
                    placement='top'
                    className='text-center'
                  >
                    <ContainedButton
                      icon={<Check height={20} width={20} />}
                      size='medium'
                      isLoading={isApproving}
                      onClick={this.approve}
                      className={styles.approveBtn}
                    >
                      Confirm
                    </ContainedButton>
                  </Tooltip>
                </>
              )}
            </div>
            <div
              className={cx(
                styles.buttonContainer_rightBtn,
                'd-flex',
                'align-items-center'
              )}
            >
              {showStartReviewBtn ? null : (
                <>
                  <Tooltip
                    label={`Save File (${keyCommand}+S)`}
                    placement='top'
                  >
                    <IconButton
                      variant='text'
                      icon={<SaveFloppyDisk height={20} width={20} />}
                      size='small'
                      isLoading={isSaving}
                      onClick={this.save}
                      className={styles.approveBtn}
                    />
                  </Tooltip>

                  <Tooltip
                    label={
                      <span className={styles.tooltipLabel}>
                        <span>Skip ({this.keyCommand} + </span>
                        <ArrowRight width={16} height={16} />)
                      </span>
                    }
                    placement='top'
                  >
                    <IconButton
                      variant='text'
                      icon={<SkipNext height={20} width={20} />}
                      size='small'
                      isLoading={isSkippingReview}
                      disabled={!!stateActionInProgress}
                      onClick={this.handleSkipReviewBtnClick}
                    />
                  </Tooltip>

                  <Tooltip
                    label={`Re Run Validation (${keyCommand} + ${modifierKey} + R)`}
                    placement='top'
                  >
                    <IconButton
                      variant='text'
                      icon={<Refresh height={20} width={20} />}
                      size='small'
                      isLoading={isReRunning}
                      onClick={this.rerun}
                    />
                  </Tooltip>
                </>
              )}
              {clientApp ? null : (
                <>
                  <IconMenu
                    menuIcon={<MoreHoriz height={20} width={20} />}
                    options={iconMenuOptions}
                    position='top-right'
                    tooltipPlacement='top'
                    onDropdownItemClick={this.handleMenuOptionsClick}
                    disabled={isDownloading}
                  />
                </>
              )}
            </div>
          </div>
        )}
        <div
          className={cx(styles.buttonContainer_secondRow, {
            [styles.buttonContainer_rightBtnClientTool]:
              showStartReviewBtn && clientApp,
          })}
        >
          {showStartReviewBtn && clientApp ? null : (
            <div className={styles.buttonContainer_leftBtn}>
              {this.renderSummaryFooterPagination()}
            </div>
          )}
          {(clientApp || embeddedApp) && (
            <div className={cx(styles.buttonContainer_rightBtn)}>
              <a
                href={SUPPORT_LINK.DOCSUMO_ROOT}
                target='_blank'
                rel='noopener noreferrer'
              >
                <PoweredByDocsumo />
              </a>
            </div>
          )}
        </div>
      </div>
    ) : (
      <>
        <div
          className={cx(
            styles.buttonContainerExpand,
            {
              [styles.buttonContainerExpand_clientApp]:
                showStartReviewBtn && clientApp,
            },
            { [styles.footerTopPosition]: this.state.splitView },
            { [styles.originalFileFooterExpand]: tabIndex === 2 },
            {
              [styles.verticalSplit]:
                this.state.splitMode === 'vertical' && !isSidebarOpen,
            }
          )}
        >
          <div>
            {showStartReviewBtn && clientApp ? null : (
              <div className={styles.buttonContainerExpand_footer}>
                {this.renderSummaryFooterPagination()}
              </div>
            )}
            {showStartReviewBtn ? (
              <div className={styles.btnGroup_right}>
                <div className={styles.expandApproveBtnGrp}>
                  {clientApp ? null : (
                    <>
                      <Tooltip label='Download' placement='top'>
                        <IconButton
                          variant='text'
                          icon={<Download height={20} width={20} />}
                          size='small'
                          disabled={isDownloading}
                          onClick={this.handleDownloadModalOpen}
                        />
                      </Tooltip>
                      <Tooltip label='Shareable Link' placement='top'>
                        <IconButton
                          variant='text'
                          icon={<ShareAndroid height={20} width={20} />}
                          size='small'
                          onClick={this.copyShareableClientLink}
                        />
                      </Tooltip>
                      <Tooltip label='Delete' placement='top'>
                        <IconButton
                          variant='text'
                          colorScheme='danger'
                          icon={<Trash height={20} width={20} />}
                          size='small'
                          onClick={this.handleFileDeleteBtnClick}
                        />
                      </Tooltip>
                    </>
                  )}
                </div>
                {clientApp ? null : (
                  <>
                    {showApprovedBtn ? (
                      <div
                        className={cx(
                          styles.approveContent,
                          styles['approveContent--expand']
                        )}
                      >
                        <span className={styles.approveContent__icon}>
                          <CheckCircle
                            height={20}
                            width={20}
                            color='var(--ds-clr-success)'
                          />
                        </span>
                        <span className={styles.approveContent__label}>
                          Approved
                        </span>
                      </div>
                    ) : null}
                    <div className={styles.expandApproveBtn}>
                      <Tooltip label='Review Again' placement='top'>
                        <ContainedButton
                          icon={<EyeEmpty height={20} width={20} />}
                          size='small'
                          variant='outlined'
                          isLoading={isReviewing}
                          onClick={this.startReview}
                          className={styles.approveBtn}
                        >
                          Review Again
                        </ContainedButton>
                      </Tooltip>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className={styles.expandedRoot}>
                <div className={styles.expandedBtn}>
                  <Tooltip
                    label={`Save File (${keyCommand}+S)`}
                    placement='top'
                  >
                    <IconButton
                      variant='text'
                      icon={<SaveFloppyDisk height={20} width={20} />}
                      size='small'
                      isLoading={isSaving}
                      onClick={this.save}
                      className={styles.approveBtn}
                    />
                  </Tooltip>

                  <Tooltip
                    label={
                      <span className={styles.tooltipLabel}>
                        <span>Skip ({this.keyCommand} + </span>
                        <ArrowRight width={16} height={16} />)
                      </span>
                    }
                    placement='top'
                  >
                    <IconButton
                      variant='text'
                      icon={<SkipNext height={20} width={20} />}
                      size='small'
                      isLoading={isSkippingReview}
                      disabled={!!stateActionInProgress}
                      onClick={this.handleSkipReviewBtnClick}
                    />
                  </Tooltip>

                  <Tooltip
                    label={`Re Run Validation (${keyCommand} + ${modifierKey} + R)`}
                    placement='top'
                  >
                    <IconButton
                      variant='text'
                      icon={<Refresh height={20} width={20} />}
                      size='small'
                      isLoading={isReRunning}
                      onClick={this.rerun}
                    />
                  </Tooltip>

                  {clientApp ? null : (
                    <>
                      <Tooltip label='Download' placement='top'>
                        <IconButton
                          variant='text'
                          icon={<Download height={20} width={20} />}
                          size='small'
                          disabled={isDownloading}
                          onClick={this.handleDownloadModalOpen}
                        />
                      </Tooltip>
                      <Tooltip label='Shareable Link' placement='top'>
                        <IconButton
                          variant='text'
                          icon={<ShareAndroid height={20} width={20} />}
                          size='small'
                          onClick={this.copyShareableClientLink}
                        />
                      </Tooltip>
                      <Tooltip label='Delete' placement='top'>
                        <IconButton
                          variant='text'
                          colorScheme='danger'
                          icon={<Trash height={20} width={20} />}
                          size='small'
                          onClick={this.handleFileDeleteBtnClick}
                        />
                      </Tooltip>
                    </>
                  )}
                </div>
                <div className={styles.expandedApprove}>
                  <Tooltip
                    label={`Approve Spreadsheet (${keyCommand} + Shift + Enter)`}
                    placement='top'
                  >
                    <ContainedButton
                      icon={<Check height={20} width={20} />}
                      size='small'
                      isLoading={isApproving}
                      onClick={this.approve}
                      className={styles.approveBtn}
                    >
                      Confirm
                    </ContainedButton>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  getVerticalDragHandler = () => {
    return (
      <div
        className={cx(styles.drag, [styles.verticalDragLine])}
        ref={this.verticalDragLine}
      >
        <span></span>
        <span></span>
      </div>
    );
  };

  getHorizontalDragHandler = () => {
    return (
      <div
        className={cx(styles.drag, [styles.horizontalDragLine])}
        ref={this.horizontalDragLine}
      >
        <span></span>
        <span></span>
      </div>
    );
  };

  getRecentSheetData = async (value = {}) => {
    const { summaryData = {} } = this.state;
    if (summaryData.customCode) {
      const data = await this.getSyncfusionData();
      if (this.summarybox && this.summarybox.current) {
        this.summarybox.current.setCleanedSheetData(data[1]);
        if (value.rerunSummaryCalc) {
          this.summarybox.current.setRerunSummaryCalc(true);
        }
        if (value.reSaveSummary) {
          this.summarybox.current.setSaveInitialSummary(true);
        }
      }
    }
  };

  cellSave = () => {
    this.setCellChangeMade(true);
    this.getRecentSheetData();
  };

  setCellChangeMade = (value) => {
    storage.set('cellChangeMade', value);
  };

  isCellChangeMade = () => {
    return JSON.parse(storage.get('cellChangeMade'));
  };

  updateSummarySidebarDimensions = () => {
    const {
      docMeta,
      userEmail,
      history: {
        location: { state },
      },
      config,
    } = this.props;

    const { fileUrl } = this.state;
    const { canSwitchToOldMode = true } = config;
    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.toggle_sidebar, {
      origin: state && state.origin ? state.origin : 'Shareable Link',
      'work email': userEmail,
      'document type': docMeta.type,
      type: _.isEmpty(fileUrl) ? 'excel' : 'pdf',
      docMeta: docMeta,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    const summaryBoxInitialWidth = JSON.parse(
      storage.get('summaryBarDraggedWidth')
    );
    if (!this.state.isSidebarOpen) {
      this.summarybox.current.getSummarySidebarDOM().style.width = '4rem';
      this.contentRef.current.style.width = 'calc(100% - 4rem)';
      this.summarybox.current.getSummarySidebarDOM().style.flex = 'initial';
      this.contentRef.current.style.flex = 'initial';
    } else {
      this.summarybox.current.getSummarySidebarDOM().style.width =
        summaryBoxInitialWidth > 0 ? `${summaryBoxInitialWidth}px` : '30rem';
      this.contentRef.current.style.width = `calc(100% - ${
        summaryBoxInitialWidth > 0 ? summaryBoxInitialWidth : 480
      }px)`;
      this.dragVerticalElement(
        this.verticalDragLine.current,
        this.summarybox.current.getSummarySidebarDOM(),
        this.contentRef.current,
        true
      );
    }
    storage.set('isSidebarOpen', this.state.isSidebarOpen);
    this.forceUpdate();
  };

  handleSidebarToggle = () =>
    this.setState({ isSidebarOpen: !this.state.isSidebarOpen }, () => {
      this.updateSummarySidebarDimensions();
    });

  handleSummarySidebarWithSplitState = () => {
    const { splitView, isSidebarOpen } = this.state;
    if (splitView && isSidebarOpen) {
      this.setState({ isSidebarOpen: false }, () => {
        this.updateSummarySidebarDimensions();
      });
    }
  };

  resetSplitViewsDimension = () => {
    if (this.splitContentRef && this.splitContentRef.current)
      this.splitContentRef.current.style.flex = '1 0';
    if (this.notSplitContentRef && this.notSplitContentRef.current)
      this.notSplitContentRef.current.style.flex = '1 0';
  };

  handleSplitView = async ({ splitView, mode }) => {
    const { originalExcelDocHighlighted } = this.state;
    this.setState(
      { splitView, splitMode: mode, tabIndex: 1, showLoader: true },
      async () => {
        if (splitView) {
          if (mode === 'horizontal') {
            this.dragHorizontalElement(
              this.horizontalDragLine.current,
              this.splitContentRef.current,
              this.notSplitContentRef.current
            );
          } else {
            this.dragVerticalElement(
              this.verticalDragLine.current,
              this.notSplitContentRef.current,
              this.splitContentRef.current
            );
          }
          this.handleSummarySidebarWithSplitState();
          this.resetSplitViewsDimension();
          const data = await this.firstSpreadsheet
            .saveAsJson()
            .then((Json) => Json.jsonObject.Workbook.sheets);
          setTimeout(() => {
            this.setState(
              {
                key: Math.random(),
                excelData: data,
                originalExcelDocHighlighted: !originalExcelDocHighlighted,
              },
              () => {
                setTimeout(() => this.setState({ showLoader: false }), 300);
              }
            );
          }, 800);
        } else {
          this.setState({ showLoader: false });
        }
      }
    );
  };

  tabEventHandler = ({ tabIndex }) => {
    this.setState({ tabIndex, originalExcelDocHighlighted: false });
  };

  getRentRollStaticSummary = () => {
    const { excelData } = this.state;

    let asOfDateObj = {
      label: 'As of Date',
      value: '-',
    };

    if (excelData && excelData.length) {
      const { rows } = excelData[0];

      if (rows && rows.length) {
        const { cells } = rows[0];

        if (cells && cells.length >= 2) {
          if (
            cells[0].value &&
            cells[0].value.trim().toUpperCase() === 'AS OF DATE'
          ) {
            asOfDateObj.value = cells[1].value || '-';
          }
        }
      }
    }

    return [asOfDateObj];
  };

  getFinspreadStaticSummary = () => {
    const { excelData } = this.state;

    let companyNameObj = {
      label: 'Name',
      value: '-',
    };

    let fromDateObj = {
      label: 'From',
      value: '-',
    };

    let toDateObj = {
      label: 'To',
      value: '-',
    };

    if (excelData && excelData.length) {
      const { rows } = excelData[0];

      if (rows && rows.length) {
        const { cells } = rows[0];

        if (cells && cells.length >= 6) {
          if (
            cells[0].value &&
            cells[0].value.trim().toLowerCase() === 'to_date'
          ) {
            toDateObj.value = cells[1].value || '-';
          }
          if (
            cells[2].value &&
            cells[2].value.trim().toLowerCase() === 'from_date'
          ) {
            fromDateObj.value = cells[3].value || '-';
          }
          if (
            cells[2].value &&
            cells[4].value.trim().toLowerCase() === 'company_name'
          ) {
            companyNameObj.value = cells[5].value || '-';
          }
        }
      }
    }

    return [companyNameObj, fromDateObj, toDateObj];
  };

  getStaticSummaryData = () => {
    const { docMeta } = this.props;

    if (docMeta.type === 'p_and_l' || docMeta.type === 'balance_sheet') {
      return this.getFinspreadStaticSummary();
    } else {
      return this.getRentRollStaticSummary();
    }
  };

  removeSpreadsheetCOAHighlight = (address) => {
    const cellStyle = {
      borderBottom: '.0625rem solid #e0e0e0',
      borderLeft: '.0625rem solid #e0e0e0',
      borderRight: '.0625rem solid #e0e0e0',
      borderTop: '.0625rem solid #e0e0e0',
    };
    let range = getRangeIndexes(address); // range of indexes of cell
    let selectedCell = this.getCellData(range[0], range[1]); // cell info of selected cell
    /**
     * cell info of surroundings cells with respect to selected cell
     */
    let topCell = this.getCellData(range[0] - 1, range[1]);
    let bottomCell = this.getCellData(range[0] + 1, range[1]);
    let leftCell = this.getCellData(range[0], range[1] - 1);
    let rightCell = this.getCellData(range[0], range[1] + 1);

    if (topCell && topCell.lowConfidence) {
      delete cellStyle['borderTop'];
    }

    if (bottomCell && bottomCell.lowConfidence) {
      delete cellStyle['borderBottom'];
    }

    if (leftCell && leftCell.lowConfidence) {
      delete cellStyle['borderLeft'];
    }

    if (rightCell && rightCell.lowConfidence) {
      delete cellStyle['borderRight'];
    }

    if (selectedCell && selectedCell.lowConfidence && address) {
      this.firstSpreadsheet.cellFormat(cellStyle, address);
      this.firstSpreadsheet.updateCell(
        { ...selectedCell, lowConfidence: false },
        address
      );
      this.setCellChangeMade(true);
    }
  };

  getCellData = (fromRange, toRange) => {
    return getCell(fromRange, toRange, this.firstSpreadsheet.getActiveSheet());
  };

  highlightOriginalExcelDoc = (spreadsheet, value) => {
    const {
      highlightRanges = [],
      originalExcelDocHighlighted,
      excelData = [],
    } = this.state;
    if (!originalExcelDocHighlighted) {
      const activeSheet = excelData[0];
      const rowLimit = activeSheet?.rowCount;
      for (let i = 0; i < highlightRanges.length; i++) {
        const highlightFirstAddr = highlightRanges[i]?.split(':')[0];
        const highlightRowNumber = Number(
          highlightFirstAddr?.replace(/\D+/g, '')
        );
        if (highlightRowNumber < rowLimit) {
          spreadsheet?.cellFormat(
            {
              backgroundImage: value
                ? 'linear-gradient(to bottom right, var(--ds-clr-selection), var(--ds-clr-selection))'
                : 'none',
            },
            `Raw Sheet!${highlightRanges[i]}`
          );
        }
      }
      this.setState({
        originalExcelDocHighlighted: !originalExcelDocHighlighted,
      });
    }
  };

  render() {
    const {
      documentTitle,
      userEmail,
      dataFetchFailed,
      user,
      addMixpanelTrackingForTours,
    } = this.props;
    const {
      isDownloading,
      summaryData,
      isDownloadModalOpen,
      type,
      showConfirmReview,
      confirmErrorMessage,
      isConfirming,
      isSavingAndExit,
      duplicateHeader,
      isSidebarOpen,
      isDeleting,
      deleteDoc,
      clientApp,
      embeddedApp,
      closeModalOpen,
      splitView,
      splitMode,
      showLoader,
      fileUrl,
      tabIndex,
      mounted,
      excelData,
      highlights,
      highlightRanges,
      key,
      updatedExcelData,
    } = this.state;
    let { tabs } = this.state;
    const buttonGroup = this.getCTAButtonGroup();
    const verticalDragHandler = this.getVerticalDragHandler();
    const horizontalDragHandler = this.getHorizontalDragHandler();
    const docHasExcelType = _.isEmpty(fileUrl);
    const secondTabClicked = docHasExcelType && tabIndex > 1;
    const isHorizontalSplitMode = !!(splitMode === 'horizontal');
    const isVerticalSplitMode = !!(splitMode === 'vertical');

    tabs = tabs.map((tab) => ({
      ...tab,
      active: !!(tab.id === tabIndex),
      documentTitle: tab.id === 1 ? documentTitle : tab.documentTitle,
    }));

    if (docHasExcelType && mounted) {
      tabs = tabs.filter((item) => item.id !== 2);
      tabs = [
        ...tabs,
        tabs.map((item) => ({
          ...item,
          id: 2,
          documentTitle: 'Original file',
        }))[0],
      ];
      tabs = tabs.map((item) => ({
        ...item,
        active: !!(item.id === tabIndex),
      }));
    }

    const { docMeta, documentActions, docId, appActions, config, history } =
      this.props;

    const showStartReviewBtn = [
      documentConstants.STATUSES.PROCESSED,
      documentConstants.STATUSES.REVIEW_REQUIRED,
      documentConstants.STATUSES.REVIEW_SKIPPED,
    ].includes(_.get(docMeta, 'status'));

    return (
      <div className={styles.container}>
        {
          // For now, only show live update summary if there is custom code
          summaryData?.customCode ? (
            <SummarySidebarV2
              dataFetchFailed={dataFetchFailed}
              isSidebarOpen={isSidebarOpen}
              className={cx(
                styles.sidebar,
                !isSidebarOpen ? styles.sidebar_collapsed : ''
              )}
              handleSidebarToggle={this.handleSidebarToggle}
              documentTitle={documentTitle}
              buttonGroups={buttonGroup}
              dragHandler={verticalDragHandler}
              summaryData={summaryData}
              ref={this.summarybox}
              excelData={updatedExcelData[1]}
              rawData={updatedExcelData[0]}
              docType={docMeta.type}
              docId={docId}
              appActions={appActions}
              staticSummaryData={this.getStaticSummaryData()}
              clientApp={clientApp}
              history={history}
              embeddedApp={embeddedApp}
            />
          ) : (
            <SummarySidebar
              dataFetchFailed={dataFetchFailed}
              isSidebarOpen={isSidebarOpen}
              className={cx(
                styles.sidebar,
                !isSidebarOpen ? styles.sidebar_collapsed : ''
              )}
              handleSidebarToggle={this.handleSidebarToggle}
              documentTitle={documentTitle}
              buttonGroups={buttonGroup}
              dragHandler={verticalDragHandler}
              summaryData={summaryData}
              ref={this.summarybox}
              clientApp={clientApp}
              history={history}
              embeddedApp={embeddedApp}
            />
          )
        }
        <div
          className={cx(
            styles.content,
            !isSidebarOpen ? styles.content_wide : ''
          )}
          ref={this.contentRef}
        >
          {showStartReviewBtn ? (
            <Banner
              variant='info'
              icon={<EyeEmpty color='var(--ds-clr-white)' />}
              color='var(--ds-clr-white)'
              className='justify-content-start'
            >
              <span className='justify-content-center'>View Only</span>
            </Banner>
          ) : null}
          <div
            className={cx(
              styles.innerContent,
              { [styles.innerContent_sm]: showStartReviewBtn },
              { [styles['innerContent--bg']]: dataFetchFailed }
            )}
            style={{
              flexDirection: isVerticalSplitMode
                ? 'row'
                : isHorizontalSplitMode
                ? 'column'
                : '',
            }}
          >
            <div
              className={cx(styles.not_split_content, {
                [styles.horizontal]: isHorizontalSplitMode,
              })}
              ref={this.notSplitContentRef}
              style={{ flex: !splitView ? '100%' : '66%' }}
            >
              {/* Document Title Header for both Spreadsheet and PDF components */}
              <DocumentTitleHeader
                dataFetchFailed={dataFetchFailed}
                isSidebarOpen={isSidebarOpen}
                clientApp={clientApp}
                hideActions={isVerticalSplitMode}
                tabs={!splitView ? tabs : tabs.filter((tab) => tab.id !== 2)}
                splitView={splitView}
                splitMode={splitMode}
                showLoader={showLoader}
                excelData={excelData}
                fileUrl={fileUrl}
                docHasExcelType={docHasExcelType}
                userEmail={userEmail}
                user={user}
                highlights={highlights}
                config={config}
                highlightRanges={highlightRanges}
                handleSplitView={this.handleSplitView}
                tabEventHandler={this.tabEventHandler}
                handleClose={this.handleClose}
                addMixpanelTrackingForTours={addMixpanelTrackingForTours}
              />

              {/* hide/show the footer button components */}
              {isSidebarOpen || dataFetchFailed ? null : buttonGroup}

              {dataFetchFailed ? (
                <DataFetchFailurePageError className={styles.errorBox} />
              ) : (
                <div style={{ height: '100%', position: 'relative' }}>
                  {/* overlay background on spreadsheet view on split modes ['horizontal','vertical'] */}
                  {showLoader && splitMode !== 'fullScreen' && (
                    <div className={styles.overlayBg} />
                  )}
                  {/* spreadsheet component renderer */}
                  <div
                    className={
                      tabIndex === 1 || docHasExcelType
                        ? styles.visbile
                        : styles.hidden
                    }
                  >
                    <SpreadsheetComponent
                      key={key}
                      ref={(ssObj) => {
                        this.firstSpreadsheet = ssObj;
                        if (this.firstSpreadsheet) {
                          /* hide the necessary menu, ribbon, toolbar items from spreadsheet */
                          this.firstSpreadsheet.height = '100%';
                          this.firstSpreadsheet.hideFileMenuItems(['File']);
                          this.firstSpreadsheet.hideRibbonTabs([
                            'File',
                            'Insert',
                            'Formulas',
                            'Data',
                            'View',
                          ]);
                          this.firstSpreadsheet.hideToolbarItems(
                            'Home',
                            [5, 6, 7, 20, 26, 27, 29]
                          );

                          /***
                           *  toggle highlight state, on original excel file as per tab click
                           */
                          if (docHasExcelType)
                            this.highlightOriginalExcelDoc(
                              this.firstSpreadsheet,
                              !!secondTabClicked
                            );

                          /* DOM manipulation for providing style for spreadsheet component parts */
                          const addSheet =
                            document.querySelector('.e-add-sheet-tab') || {};
                          if (addSheet?.style) addSheet.style.display = 'none';

                          const tabPanelBottom =
                            document.querySelector('.e-sheet-tab-panel') || {};
                          if (tabPanelBottom?.style)
                            tabPanelBottom.style.height = '4.5rem';

                          const indicator =
                            document.querySelector('.e-ignore') || {};
                          if (indicator?.style) indicator.style.zIndex = '0';

                          const page =
                            document.querySelector('.e-spreadsheet') || {};
                          if (page?.style) page.style.minHeight = '0';

                          const sheetPages =
                            document.getElementsByClassName('e-spreadsheet') ||
                            [];
                          if (sheetPages[0]?.style)
                            sheetPages[0].style.minHeight = '0';

                          const borderIcon =
                            document.querySelector('.e-borders-ddb') || {};
                          if (borderIcon) borderIcon.disabled = true;

                          const secondSheet = document.querySelectorAll(
                            '[data-id=tabitem_1]'
                          )[0];
                          const panel =
                            document.querySelector('.e-sheet-panel') || {};
                          const tabPanelBottoms =
                            document.getElementsByClassName(
                              'e-sheet-tab-panel'
                            ) || [];
                          const dropDownBtns =
                            tabPanelBottoms[0]?.getElementsByClassName(
                              'e-dropdown-btn'
                            ) || [];

                          /* DOM manipulation handled for switching tabs case i.e Original File and Cleaned File */
                          if (secondTabClicked) {
                            if (secondSheet?.style)
                              secondSheet.style.display = 'none';
                            if (page?.style) page.style.top = '3.5rem';
                            if (panel?.style)
                              panel.style.height = 'calc(100% - 7.5rem)';
                            if (dropDownBtns[0]?.style)
                              dropDownBtns[0].style.display = 'none';
                          } else {
                            if (secondSheet?.style)
                              secondSheet.style.display = 'inline-block';
                            if (dropDownBtns[0]?.style)
                              dropDownBtns[0].style.display = 'inline-block';
                            if (page?.style) page.style.top = '1.125rem';
                            if (panel?.style)
                              panel.style.height = 'calc(100% - 11.5625rem)';
                          }
                        }
                      }}
                      showFormulaBar={!secondTabClicked}
                      showRibbon={!secondTabClicked}
                      allowSheetTabsEditing={false}
                      beforeDataBound={() => {
                        let ele =
                          document.getElementsByClassName('e-spreadsheet');
                        if (ele[0] && ele[0].ej2_instances[0]) {
                          // Add custom function
                          ele[0].ej2_instances[0].addCustomFunction(
                            this.lookup,
                            'LOOKUP'
                          );
                          ele[0].ej2_instances[0].addCustomFunction(
                            this.calculateCustomSum,
                            'CUSTOMSUM'
                          );
                        }
                      }}
                      created={() => {
                        /* hide dropdown button of spreadsheet component when tab switched to Original File */
                        if (!secondTabClicked) {
                          const dropIcon =
                            document.querySelector('.e-drop-icon') || {};
                          if (!_.isEmpty(dropIcon)) {
                            if (dropIcon?.style)
                              dropIcon.style.display = 'none';
                            if (dropIcon?.style) dropIcon.style.opacity = '0';
                            if (dropIcon?.style)
                              dropIcon.style.visibility = 'hidden';
                          }
                        }
                      }}
                      contextMenuBeforeOpen={(args) => {
                        if (
                          this.firstSpreadsheet &&
                          closest(args.event.target, '.e-tab-wrap')
                        ) {
                          this.firstSpreadsheet.enableContextMenuItems(
                            [
                              'Protect Sheet',
                              'Unprotect Sheet',
                              'Move Left',
                              'Move Right',
                              'Hide',
                              'Rename',
                              'Duplicate',
                              'Delete',
                              'Insert',
                            ],
                            false,
                            false
                          );
                        }
                      }}
                      actionComplete={async (args) => {
                        const { action = '', eventArgs = {} } = args;
                        if (this.firstSpreadsheet && action === 'cellSave') {
                          // remove highlight for low confidence cell value
                          this.removeSpreadsheetCOAHighlight(eventArgs.address);
                        }
                        if (action !== 'gotoSheet') this.cellSave(args);
                      }}
                      select={(args) => {
                        if (this.firstSpreadsheet)
                          this.removeSpreadsheetCOAHighlight(args.range); // remove highlight for low confidence cell value
                        /* cross-reference check between Original file and cleaned table of spreadsheet (i.e for both Excel and PDF files)
                         ** this method gets triggered, when spreadsheet cell is selected
                         */
                        if (splitView && this.firstSpreadsheet) {
                          if (
                            this.firstSpreadsheet.getActiveSheet() &&
                            this.firstSpreadsheet.getActiveSheet()?.name !==
                              'Raw Sheet'
                          ) {
                            let range = getRangeIndexes(args.range); // range of indexes of cell
                            let cell = getCell(
                              range[0],
                              range[1],
                              this.firstSpreadsheet.getActiveSheet()
                            ); // cell information of selected cell
                            let { position = {}, cellPos = [] } = cell || {};

                            let id = cell?.id || '';

                            if (docHasExcelType && cellPos.length) {
                              const prevCellAddr = storage.get('prevCellAddr');
                              if (!_.isEmpty(prevCellAddr))
                                this.secondSpreadsheet?.cellFormat(
                                  {
                                    backgroundImage:
                                      'linear-gradient(to bottom right, var(--ds-clr-selection), var(--ds-clr-selection))',
                                  },
                                  prevCellAddr
                                ); // remove the style of cell with address
                              const currentCellAddr = `${cellPos[0]}${cellPos[1]}:${cellPos[2]}${cellPos[3]}`;
                              this.secondSpreadsheet?.cellFormat(
                                {
                                  backgroundImage:
                                    'linear-gradient(to bottom right, var(--ds-clr-highlight), var(--ds-clr-highlight))',
                                },
                                currentCellAddr
                              ); // add selection style with cell address
                              storage.set('prevCellAddr', currentCellAddr);
                              this.secondSpreadsheet?.goTo(currentCellAddr); // navigate to specific cell address
                            } else {
                              if (
                                !_.isEmpty(position) &&
                                !_.isEmpty(id) &&
                                position.pageNumber > 0
                              ) {
                                const highlight = {
                                  id,
                                  position,
                                };
                                this.secondPdfViewerRef?.current?.setPdfHighlight(
                                  highlight
                                ); // set the selected cell position for PDF reference check
                              }
                            }
                          }
                        }
                      }}
                      activeSheetIndex={
                        secondTabClicked ? 0 : excelData.length - 1
                      }
                      sheets={excelData}
                      className='customSpreadsheet'
                      dataBound={() => {
                        // Recalculate custom summary after data is loaded in spreadsheet
                        this.getRecentSheetData({
                          reSaveSummary: true,
                        });
                      }}
                    ></SpreadsheetComponent>
                  </div>

                  {/* PDF viewer renderer */}
                  <div
                    className={cx(
                      !(tabIndex === 1) && !docHasExcelType
                        ? styles.visible
                        : styles.hidden,
                      {
                        [styles.expandedOrigFileContainer]: !isSidebarOpen,
                      }
                    )}
                  >
                    <PdfViewer
                      url={fileUrl}
                      splitView={splitView}
                      splitMode={splitMode}
                      docId={docId}
                      documentActions={documentActions}
                      docMeta={docMeta}
                      highlights={highlights}
                    />
                  </div>
                </div>
              )}
            </div>
            {splitView && (
              <div
                className={cx(
                  styles.split_content,
                  { [styles.vertical]: isVerticalSplitMode },
                  {
                    [styles.horizontal]: isHorizontalSplitMode,
                  }
                )}
                ref={this.splitContentRef}
              >
                {/* vertical drag handler */}
                <span
                  className={cx({
                    [styles.verticalDrag]: isVerticalSplitMode,
                  })}
                >
                  {isHorizontalSplitMode
                    ? horizontalDragHandler
                    : isVerticalSplitMode
                    ? verticalDragHandler
                    : null}
                </span>

                {/* Document Title Header for both Spreadsheet and PDF components */}
                <DocumentTitleHeader
                  dataFetchFailed={dataFetchFailed}
                  isSidebarOpen={isSidebarOpen}
                  clientApp={clientApp}
                  hideActions={!isVerticalSplitMode}
                  splitView={splitView}
                  splitMode={splitMode}
                  showLoader={showLoader}
                  config={config}
                  excelData={excelData}
                  fileUrl={fileUrl}
                  docHasExcelType={docHasExcelType}
                  tabs={tabs
                    .filter((tab) => tab?.id !== 1)
                    .map((item) => ({
                      ...item,
                      active: true,
                    }))}
                  userEmail={userEmail}
                  highlights={highlights}
                  highlightRanges={highlightRanges}
                  handleSplitView={this.handleSplitView}
                  tabEventHandler={() => {}}
                  handleClose={this.handleClose}
                />
                {dataFetchFailed ? (
                  <DataFetchFailurePageError className={styles.errorBox} />
                ) : (
                  <div
                    style={{
                      height: '100%',
                      position: 'relative',
                    }}
                  >
                    {/* overlay background on spreadsheet view on split modes ['horizontal','vertical'] */}
                    {showLoader && splitMode !== 'fullScreen' && (
                      <div className={styles.overlayBg} />
                    )}

                    {/* spreadsheet component renderer */}
                    <div
                      className={
                        docHasExcelType ? styles.visible : styles.hidden
                      }
                    >
                      <SpreadsheetComponent
                        key={key}
                        ref={(ssObj) => {
                          this.secondSpreadsheet = ssObj;
                          if (this.secondSpreadsheet) {
                            /* hide the necessary menu, ribbon, toolbar items from spreadsheet */
                            this.secondSpreadsheet.height = '100%';
                            this.firstSpreadsheet.hideFileMenuItems(['File']);
                            this.firstSpreadsheet.hideRibbonTabs([
                              'File',
                              'Insert',
                              'Formulas',
                              'Data',
                              'View',
                            ]);
                            this.firstSpreadsheet.hideToolbarItems(
                              'Home',
                              [5, 6, 7, 20, 26, 27, 29]
                            );
                            if (docHasExcelType)
                              this.highlightOriginalExcelDoc(
                                this.secondSpreadsheet,
                                true
                              );

                            /* DOM manipulation for providing style for spreadsheet component parts */
                            const tabPanelBottom =
                              document.querySelector('.e-sheet-tab-panel') ||
                              {};
                            if (tabPanelBottom?.style)
                              tabPanelBottom.style.height = '4.5rem';

                            const indicator =
                              document.querySelector('.e-ignore') || {};
                            if (indicator?.style) indicator.style.zIndex = '0';

                            const secondSheet = document.querySelectorAll(
                              '[data-id=tabitem_1]'
                            )[1];
                            if (secondSheet?.style)
                              secondSheet.style.display = 'none';

                            const borderIcon =
                              document.querySelector('.e-borders-ddb') || {};
                            if (borderIcon) borderIcon.disabled = true;

                            const addSheets =
                              document.getElementsByClassName(
                                'e-add-sheet-tab'
                              ) || [];
                            if (addSheets[1]?.style)
                              addSheets[1].style.display = 'none';

                            const tabPanelBottoms =
                              document.getElementsByClassName(
                                'e-sheet-tab-panel'
                              ) || [];
                            const dropDownBtns =
                              tabPanelBottoms[1]?.getElementsByClassName(
                                'e-dropdown-btn'
                              ) || [];
                            if (dropDownBtns[0]?.style)
                              dropDownBtns[0].style.display = 'none';

                            /* applied DOM manipulation for screen split view case here */
                            if (splitView) {
                              const pages =
                                document.getElementsByClassName(
                                  'e-spreadsheet'
                                ) || [];
                              const sheetPanels =
                                document.getElementsByClassName(
                                  'e-sheet-panel'
                                ) || [];
                              if (secondSheet?.style)
                                secondSheet.style.display = 'none';
                              if (pages[1]?.style)
                                pages[1].style.top = '3.5rem';
                              if (pages[0]?.style)
                                pages[0].style.minHeight = '0';
                              if (pages[1]?.style)
                                pages[1].style.minHeight = '0';
                              if (sheetPanels[1]?.style)
                                sheetPanels[1].style.height =
                                  'calc(100% - 7.125rem)';
                              if (sheetPanels[0]?.style)
                                sheetPanels[0].style.height =
                                  'calc(100% - 11.5625rem)';
                            }
                          }
                        }}
                        showFormulaBar={false}
                        showRibbon={false}
                        allowSheetTabsEditing={false}
                        scrollSettings={{
                          isFinite: true,
                          enableVirtualization: false,
                        }}
                        created={() => {
                          /* hide addSheet and dropdown button of spreadsheet component */
                          const addSheet =
                            document.querySelector('.e-add-sheet-tab') || {};
                          const dropDownBtn =
                            document.querySelector('.e-dropdown-btn') || {};
                          if (addSheet?.style) addSheet.style.display = 'none';
                          if (dropDownBtn?.style)
                            dropDownBtn.style.display = 'none';
                        }}
                        contextMenuBeforeOpen={(args) => {
                          if (closest(args.event.target, '.e-tab-wrap')) {
                            this.secondSpreadsheet.enableContextMenuItems(
                              [
                                'Protect Sheet',
                                'Unprotect Sheet',
                                'Move Left',
                                'Move Right',
                                'Hide',
                                'Rename',
                                'Duplicate',
                                'Delete',
                                'Insert',
                              ],
                              false,
                              false
                            );
                          }
                        }}
                        actionComplete={(args) => {
                          const { action = '' } = args;
                          if (action !== 'gotoSheet') this.cellSave();
                        }}
                        actionBegin={(args) => {
                          if (args.action === 'copy') {
                            delete this.firstSpreadsheet?.clipboardModule
                              ?.copiedInfo;
                          }
                        }}
                        sheets={excelData}
                      ></SpreadsheetComponent>
                    </div>

                    {/* PDF viewer renderer */}
                    <div
                      className={
                        !docHasExcelType ? styles.visbile : styles.hidden
                      }
                      style={{ height: '100%' }}
                    >
                      <PdfViewer
                        ref={this.secondPdfViewerRef}
                        documentActions={documentActions}
                        docId={docId}
                        url={fileUrl}
                        splitView={splitView}
                        splitMode={splitMode}
                        highlights={highlights}
                        docMeta={docMeta}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <DownloadModal
          isOpen={isDownloadModalOpen}
          handleCloseBtnClick={this.handleDownloadModalClose}
          handleDownloadBtnClick={this.handleDownloadBtnClick}
          type={type}
          isDownloading={isDownloading}
        />
        {showConfirmReview ? (
          <ConfirmationModal
            title={'Confirm Changes'}
            bodyText={
              duplicateHeader
                ? `${confirmErrorMessage} Please resolve the duplicate header issue to approve the document. `
                : `${confirmErrorMessage}Are you sure you want approve the document with error? `
            }
            proceedActionText='Confirm'
            cancelActionText='Cancel'
            duplicateHeader={duplicateHeader}
            processIcon={CheckIcon}
            cancelIcon={CloseIcon}
            onProceedActionBtnClick={() =>
              this.handleForceFinishReviewBtnClick()
            }
            onCancelActionBtnClick={() => this.handleReviewCancelBtnClick()}
            onCloseBtnClick={() => this.handleReviewCancelBtnClick()}
            processingBtn={isConfirming}
          />
        ) : (
          ''
        )}
        {deleteDoc ? (
          <DeleteConfirmationModal
            show={deleteDoc}
            onCloseHandler={this.handleFileDeleteCancelBtnClick}
            handleDeleteBtnClick={this.handleFileDeleteProceedBtnClick}
            modalTitle='Confirm Delete Document'
            isLoading={isDeleting}
            modalBody='Are you sure you want to delete this this document?'
          />
        ) : (
          ''
        )}
        {closeModalOpen ? (
          <ConfirmationModal
            title={'Confirm Changes'}
            bodyText={
              'Do you want to save your changes before exiting this file?'
            }
            proceedActionText='Save & Exit'
            cancelActionText="Don't Save"
            processIcon={CheckIcon}
            cancelIcon={CloseIcon}
            onProceedActionBtnClick={() => this.handleCloseAndSaveSpreadsheet()}
            onCancelActionBtnClick={() => this.handleCloseSpreadsheet()}
            onCloseBtnClick={() => this.handleCloseSaveModal()}
            processingBtn={isSavingAndExit}
          />
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default SpreadSheet;
