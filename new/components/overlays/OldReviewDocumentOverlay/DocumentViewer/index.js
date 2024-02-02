import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as documentActions } from 'new/redux/oldDocuments/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import _, { debounce } from 'lodash';
import mixpanel from 'mixpanel-browser';
import { WithTrackingContext } from 'new/components/contexts/tracking';
import {
  TABLE_TRACKING_KEYS,
  TRACKING_HELPER_KEYS,
} from 'new/components/contexts/trackingConstants';
import RegionSelect from 'new/components/overlays/OldReviewDocumentOverlay/RegionSelect';
import { CircularProgressBar } from 'new/components/widgets/progress';
import * as documentConstants from 'new/constants/document';
import { DOCUMENT_ZOOM_VALUE } from 'new/constants/document';
import { KEY_CODES } from 'new/constants/keyboard';
import {
  computeFieldPositions,
  computePRPosition,
} from 'new/helpers/documents';
import { imageDownloader } from 'new/helpers/downloads';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import { getOS } from 'new/utils';
import {
  calculateElementVisibilityPercentage,
  isElementVisibleOnViewport,
} from 'new/utils/dom';
import ReactResizeDetector from 'react-resize-detector';

import ChatAIBboxes from './ChatAIBboxes/ChatAIBboxes';
import { FieldValueBboxes, SuggestionBboxes } from './Bboxes';
import ControlHeader from './ControlHeader';
import FieldInputBox from './FieldInputBox';
import GridBboxes from './GridBboxes';
import GridRegion from './GridRegion';
import HighlightedBboxes from './HighlightedBboxes';
import LoadingGrid from './LoadingGrid';
import SearchMatchBboxes from './SearchMatchBboxes';
import TextSearchBox from './TextSearchBox';

import styles from './index.scss';

class DocumentViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      docId: null,
      docDomWidth: null,
      docDomHeight: null,
      zoomedDoc: false,
      regionFieldId: null,
      imgProgress: {},
      searchable: false,
      activeSearch: 0,
      grids: [],
      searchInputName: '',
      draggingPage: 1,
      isDragging: false,
      visiblePages: [],
    };
    this.searchInput = React.createRef();
    this.docViewerRef = React.createRef();
  }

  async componentDidMount() {
    this.updateDocData();
    this.downloadAllPageImages();
    this.resetDocumentState();

    const { handleDocumentFocus, handleDocumentUnFocus } = this.props;

    this.docViewerRef?.current.addEventListener('mouseenter', () => {
      handleDocumentFocus({ name: 'documentViewer', data: '' });
    });

    // Stop the timer when user exits the component
    this.docViewerRef?.current.addEventListener('mouseleave', () => {
      handleDocumentUnFocus({ name: 'documentViewer', data: '' });
    });
  }

  async componentDidUpdate(prevProps) {
    const { selectedFieldId, selectedField, docId } = this.props;

    if (docId !== this.state.docId) {
      this.updateDocData();
      this.downloadAllPageImages();
      this.resetDocumentState();
      return;
    }

    if (selectedFieldId !== this.state.regionFieldId) {
      let region = null;

      if (selectedField) {
        const { uiPosition } = selectedField;
        if (uiPosition) {
          const { top, left, width, height } = uiPosition;

          region = {
            x: left,
            y: top,
            width,
            height,
          };
        }
      }

      this.setState({
        regionFieldId: selectedFieldId,
        region,
      });
    }

    const { docuSearchBbox } = this.props;

    const { docuSearchBbox: prevDocuSearchBbox } = prevProps;

    if (
      docuSearchBbox &&
      docuSearchBbox.length &&
      docuSearchBbox.length !==
        (prevDocuSearchBbox && prevDocuSearchBbox.length)
    ) {
      this.setState(
        {
          activeSearch: 0,
        },
        () => this.handleSearchedBboxScroll()
      );
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleDragging = (isDragging) => {
    const { documentActions } = this.props;

    this.setState({
      isDragging,
    });
    documentActions.handleGridDrag({
      isDragging,
    });
  };

  handleKeyDown = (e) => {
    const { keyCode, ctrlKey, metaKey, altKey, shiftKey } = e;

    const isMacOS = getOS() === 'MacOS';
    const { zoomed } = this.state;

    if (
      keyCode === KEY_CODES.F &&
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey))
    ) {
      // Search document
      e.preventDefault();
      this.handleSearchClick(true);
    } else if (keyCode === KEY_CODES.ESC) {
      // Escape from search
      e.preventDefault();
      this.handleSearchClick(false);
    } else if (
      (keyCode === KEY_CODES.PLUS || keyCode === KEY_CODES.PLUS_NUMPAD) &&
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey))
    ) {
      // Zoom in
      e.preventDefault();
      this.handleZoomInClick();
    } else if (
      (keyCode === KEY_CODES.MINUS || keyCode === KEY_CODES.MINUS_NUMPAD) &&
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey))
    ) {
      // Zoom out
      e.preventDefault();
      const { zoom } = this.props;
      this.handleZoomOutClick();
    } else if (altKey && keyCode === KEY_CODES.F) {
      // Zoom to fit
      e.preventDefault();
      this.setState(
        {
          zoomed: false,
        },
        () => {
          this.setZoom(80);
        }
      );
    } else if (
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey)) &&
      shiftKey &&
      keyCode === KEY_CODES.S
    ) {
      // Undo redo action
      this.handleSplitDocument();
    }
  };

  downloadAllPageImages = async () => {
    const { docMeta } = this.props;
    const { pages = [] } = docMeta || {};
    let startHeight = 0;
    window.imageProgress = {};

    // set image height and pages height to use in scroll.
    await pages.forEach(async ({ image }, index) => {
      const rtDocuemnt =
        document.getElementById(`rt-canvas-document-${index}`) || {};
      const loader = rtDocuemnt.querySelector(`.rt-canvas-loader-${index}`);
      const thisImg = rtDocuemnt.querySelector('img');

      const rtDocuemntWidth = rtDocuemnt.offsetWidth;
      const rtDocDimensionRetio =
        (rtDocuemntWidth * DOCUMENT_ZOOM_VALUE.BASE) / image.width;
      let rtDocHeight = (rtDocDimensionRetio * image.height) / 100;
      rtDocHeight =
        rtDocHeight -
        (pages.length - 1 === index ? 0 : documentConstants.DOC_PADDING);

      rtDocuemnt.style.height = `${rtDocHeight}px`;
      rtDocuemnt.style.marginBottom = `${documentConstants.DOC_PADDING}px`;

      startHeight = startHeight + rtDocHeight;

      thisImg.style.height = `calc(100% + ${
        pages.length - 1 === index ? 0 : documentConstants.DOC_PADDING
      }px)`;

      window.imageProgress[`imageProgress-${index}`] = 0;

      const progress = ({ loaded, total }) => {
        window.imageProgress[`imageProgress-${index}`] = Math.round(
          (loaded / total) * 100
        );
      };

      await imageDownloader(image.url, thisImg, progress);
      thisImg.addEventListener('load', () => {
        loader.style.display = 'none';
      });
    });
  };

  resetDocumentState = () => {
    let docWrapperElement = document.getElementById('rt-document-wrapper');
    if (docWrapperElement) docWrapperElement.scrollTop = 115;
    this.setState(
      {
        zoomed: true,
      },
      () => this.setZoom(DOCUMENT_ZOOM_VALUE.BASE)
    );

    document.addEventListener('keydown', this.handleKeyDown);
  };

  /**
   * Handles page number change logic depdending upon zoom value
   *
   * LOGIC:
   * Calculate baseHeights of single document which will be same for all documents.
   * Then, calculate one percent value of baseHeight.
   * After that based on zoom value, subtract or add zoom pixel value on each document height
   * And compare it with wrapper scroll top offset to calculate page number.
   */
  debounceVisibilePageCalculation = debounce(() => {
    const imageElements = document.querySelectorAll('[data-review-doc-img]');
    if (Array.from(imageElements).length) {
      let visiblePages = [];
      let pageVisibilityPercentage = {};
      let newCurrentPage = this.props.currentPage;

      imageElements.forEach((imageElement) => {
        const pageNumber = Number(imageElement.dataset.reviewDocImg);

        pageVisibilityPercentage[pageNumber] =
          calculateElementVisibilityPercentage(imageElement);

        if (isElementVisibleOnViewport(imageElement)) {
          visiblePages.push(pageNumber);
        }
      });

      visiblePages.forEach((visiblePage) => {
        if (
          pageVisibilityPercentage[visiblePage] >=
          pageVisibilityPercentage[newCurrentPage]
        ) {
          newCurrentPage = visiblePage;
        }
      });

      if (newCurrentPage !== this.props.currentPage) {
        this.props.handlePageChange(newCurrentPage);
      }

      this.setState({ visiblePages: visiblePages });
    }
  }, 200);

  handleGridSubmit = (data, index, currentPage) => {
    const {
      selectedSectionFieldId: parentId,
      docId,
      grids,
      documentActions,
      selectedSectionField: { parentId: pid },
    } = this.props;
    const { columns, page, rows } = data;
    _.fill(grids, data, index, index + 1);
    const newGrid = grids.map((item, idx) => {
      return item.page !== page
        ? item
        : {
            ...item,
            columns: columns,
            rows: idx !== index ? [...item.rows] : [...rows],
          };
    });

    documentActions.manageLineGrid({
      docId,
      parentId,
      pid,
      method: 'PUT',
      data: newGrid,
      currentPage,
      grid_index: index,
    });
  };

  updateDocData = () => {
    const { docId } = this.props;

    this.setState({
      docId,
      regionFieldId: null,
      region: null,
    });
  };

  handleResize = (width, height) => {
    this.setState({
      docDomWidth: width,
      docDomHeight: height,
    });
  };

  handleDocumentWrapperScroll = (e) => {
    this.debounceVisibilePageCalculation();
    this.props.onDocumentWrapperScroll(e);
  };

  setZoom = async (value) => {
    const { docMeta, zoom } = this.props;
    const { pages = [] } = docMeta || {};
    const pageHeights = [0];
    let startHeight = 0;

    await pages.map(async (page, index) => {
      const rtDocuemnt =
        document.getElementById(`rt-canvas-document-${index}`) || {};
      let rtDocuemntHeight = rtDocuemnt.offsetHeight;
      rtDocuemntHeight = (rtDocuemntHeight * value) / zoom;
      rtDocuemnt.style.height = `${rtDocuemntHeight}px`;
      startHeight = startHeight + rtDocuemntHeight;
      await pageHeights.push(startHeight);
    });
    document.pageHeights = pageHeights;
    this.debounceVisibilePageCalculation();
    this.props.onZoomChange({
      value,
    });
  };

  handleZoomInClick = () => {
    let newZoomValue = Math.round((this.props.zoom + 10) / 10) * 10;
    if (newZoomValue > DOCUMENT_ZOOM_VALUE.MAX) {
      newZoomValue = newZoomValue - 10;
    }
    this.setZoom(newZoomValue);
  };

  handleZoomOutClick = () => {
    let newZoomValue = Math.round((this.props.zoom - 10) / 10) * 10;
    if (newZoomValue < DOCUMENT_ZOOM_VALUE.MIN) {
      newZoomValue = newZoomValue + 10;
    }
    this.setZoom(newZoomValue);
  };

  handleSplitDocument = () => {
    const { handleTrackingSubmit } = this.props;
    handleTrackingSubmit();
    const { docId, documentActions } = this.props;
    documentActions.storeSplitDocumentId({ currentSplitDocId: docId });
  };

  handleBboxClick = (bbox, isLabelSelected) => {
    const { bboxDisable } = this.props;
    if (bboxDisable) return;
    this.props.onSuggestionBboxClick(bbox, isLabelSelected);
  };

  handleRegionChange = (regions) => {
    const [region = {}] = regions;
    const { gridView, grids } = this.props;
    const { draggingPage, isDragging } = this.state;
    if (!gridView || (region.width && region.height)) {
      const { docMeta, currentPage } = this.props;

      const { width: docWidth, height: docHeight } = docMeta;

      if (gridView && !region.isChanging) {
        const data = {
          top: region.y,
          left: region.x,
          width: region.width,
          height: region.height,
          docWidth,
          docHeight,
        };

        let bbox = computePRPosition(data);
        const [x1, y1, x2, y2] = bbox;
        bbox = { bbox: bbox };
        for (let i = 0; i < grids.length; i++) {
          if (grids[i].page === draggingPage) {
            if (
              !_.isEmpty(grids[i].position) &&
              !(
                grids[i].position[0] > x2 ||
                grids[i].position[2] < x1 ||
                grids[i].position[1] - 50 > y2 ||
                grids[i].position[3] < y1
              )
            ) {
              this.props.onRegionChange({
                x: -100,
                y: -100,
                width: 0,
                height: 0,
              });
              return;
            }
          } else if (isDragging) {
            this.props.onRegionChange({
              x: -100,
              y: -100,
              width: 0,
              height: 0,
            });
            return;
          }
        }
        const {
          selectedSectionFieldId: parentId,
          docId,
          documentActions,
          selectedSectionField: { parentId: pid },
          user,
          config,
          handleDelayedTableTracking,
        } = this.props;
        const { canSwitchToOldMode = true } = config;
        this.setState({
          grids: [{ topLeft: [x1, y1], bottomRight: [x2, y2] }],
        });

        documentActions.manageLineGrid({
          docId,
          parentId,
          method: 'POST',
          pid,
          bbox,
          currentPage,
        });

        this.props.onRegionChange({
          x: -100,
          y: -100,
          width: 0,
          height: 0,
        });

        // Add mixpanel event
        mixpanel.track(MIXPANEL_EVENTS.draw_grid, {
          docId: docId,
          label: docMeta?.title,
          docType: docMeta?.type,
          'work email': user.email,
          'line item id': parentId,
          version: 'new',
          companyName: user?.companyName,
          canSwitchUIVersion: canSwitchToOldMode,
        });

        handleDelayedTableTracking({
          name: parentId,
          key: TABLE_TRACKING_KEYS.tableGrid,
          action: TRACKING_HELPER_KEYS.added,
        });
      } else {
        this.handleBoundingBoxesByType('suggestionBbox', region);
      }
    } else {
      this.handleBoundingBoxesByType('gridBbox', region);
    }
  };

  handleBoundingBoxesByType = (type = '', region = {}) => {
    const {
      suggestionBboxesByID = [],
      isLabelSelected,
      onRegionChange,
    } = this.props;
    const { suggestionBboxUuid = '', isChanging, gridBboxUuid = '' } = region;
    const bbox = suggestionBboxesByID[suggestionBboxUuid];
    switch (type) {
      case 'suggestionBbox':
        if (!isChanging) {
          if (suggestionBboxUuid) {
            this.handleBboxClick(bbox, isLabelSelected);
            return;
          }
        }
        onRegionChange(region);
        break;
      case 'gridBbox':
        if (gridBboxUuid) {
          this.handleAddNewGrid(region.gridBboxUuid);
        }
        if (!isChanging) {
          if (suggestionBboxUuid) {
            this.handleBboxClick(bbox, isLabelSelected);
            onRegionChange(region);
          }
        }
        break;
    }
  };

  handleAddNewGrid = (uuid) => {
    const {
      currentPage,
      selectedSectionFieldId: parentId,
      docId,
      documentActions,
      selectedSectionField: { parentId: pid },
      docMeta,
      user,
      config,
      handleDelayedTableTracking,
    } = this.props;
    const { canSwitchToOldMode = true, accountType = '' } = config;
    const bbox = this.props.gridBboxesByID[uuid];

    if (bbox) {
      this.setState({
        grids: [bbox],
      });
      documentActions.manageLineGrid({
        docId,
        parentId,
        method: 'TAG',
        pid,
        index: bbox.index,
        currentPage,
      });
      this.props.setGridViewMode(true);
      handleDelayedTableTracking({
        name: parentId,
        key: TABLE_TRACKING_KEYS.tableGrid,
        action: TRACKING_HELPER_KEYS.added,
      });

      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.add_grid, {
        docId: docId,
        label: docMeta?.title,
        docType: docMeta?.type,
        'work email': user?.email,
        version: 'new',
        plan: accountType,
        canSwitchUIVersion: canSwitchToOldMode,
        role: user?.role,
        companyName: user?.companyName,
      });
    }
  };

  renderRegionFieldInput = () => {
    let {
      docMeta,
      selectedField,
      region,
      documentDomRect,
      isLabelSelected,
      getDomElementRectById,
      onRegionFieldInputRemoveBtnClick,
      onRegionFieldInputValueChange,
      onRegionFieldInputSubmitBtnClick,
      onRegionFieldInputFormSubmit,
      setFieldKey,
      setFieldValue,
    } = this.props;
    documentDomRect = documentDomRect || getDomElementRectById('rt-document');
    const { zoomed } = this.state;
    if (docMeta.status !== documentConstants.STATUSES.REVIEWING) {
      return null;
    }

    if (!selectedField || !region) {
      return null;
    }

    if (selectedField.id !== region.fieldId) {
      return null;
    }

    const regionAbsLeft = (region?.x / 100) * documentDomRect?.width;
    const regionAbsTop = (region?.y / 100) * documentDomRect?.height;
    const regionAbsWidth = (region?.width / 100) * documentDomRect?.width;
    const regionAbsHeight = (region?.height / 100) * documentDomRect?.height;

    const width = regionAbsWidth > 180 ? regionAbsWidth : 180;

    const style = {
      top: regionAbsTop + regionAbsHeight,
      left: regionAbsLeft,
      width,
      maxWidth: '560px',
    };

    if (style.left + style.width > documentDomRect?.width + 100) {
      style.marginLeft =
        -1 * (style.left + style.width - documentDomRect?.width);
    }

    return (
      <FieldInputBox
        field={selectedField}
        style={style}
        isLabelSelected={isLabelSelected}
        slug={this.props.slug}
        onInputValueChange={onRegionFieldInputValueChange}
        onRemoveBtnClick={onRegionFieldInputRemoveBtnClick}
        onSubmitBtnClick={onRegionFieldInputSubmitBtnClick}
        onFormSubmit={onRegionFieldInputFormSubmit}
        setFieldKey={setFieldKey}
        setFieldValue={setFieldValue}
      />
    );
  };

  renderRegionFieldValue = () => {
    let { docMeta, selectedField, documentDomRect, getDomElementRectById } =
      this.props;
    documentDomRect = documentDomRect || getDomElementRectById('rt-document');
    if (docMeta.status === documentConstants.STATUSES.REVIEWING) {
      return null;
    }

    if (!selectedField) {
      return null;
    }

    if (!documentDomRect || _.isEmpty(documentDomRect)) {
      return null;
    }

    const { uiPosition } = selectedField;
    if (!uiPosition || _.isEmpty(uiPosition)) {
      return null;
    }

    const regionAbsLeft = (uiPosition.left / 100) * documentDomRect.width;
    const regionAbsTop = (uiPosition.top / 100) * documentDomRect.height;
    const regionAbsWidth = (uiPosition.width / 100) * documentDomRect.width;
    const regionAbsHeight = (uiPosition.height / 100) * documentDomRect.height;

    const width = regionAbsWidth > 160 ? regionAbsWidth : 160;

    const style = {
      top: regionAbsTop + regionAbsHeight,
      left: regionAbsLeft,
      width,
    };

    if (style.left + style.width > documentDomRect.width) {
      // Field input is going out of view
      style.marginLeft =
        -1 * (style.left + style.width - documentDomRect.width);
    }

    return (
      <FieldInputBox
        field={selectedField}
        isLabelSelected={this.props.isLabelSelected}
        style={style}
        slug={this.props.slug}
        readOnly={true}
        setFieldKey={this.props.setFieldKey}
        setFieldValue={this.props.setFieldValue}
      />
    );
  };

  getBoundingBoxPercentageValue = (elPosition) => {
    const { width: docWidth, height: docHeight } = this.props.docMeta;

    const [x1, y1, x2, y2] = elPosition;

    return [
      (x1 / docWidth) * 100,
      (y1 / docHeight) * 100,
      (x2 / docWidth) * 100,
      (y2 / docHeight) * 100,
    ];
  };

  handleChangeActiveSearch = (activeSearch) => {
    const { docuSearchBbox } = this.props;
    let searchShould = activeSearch;
    if (docuSearchBbox && activeSearch < 0) {
      searchShould = docuSearchBbox.length - 1;
    } else if (docuSearchBbox && docuSearchBbox.length - 1 < activeSearch) {
      searchShould = 0;
    }

    if (docuSearchBbox && docuSearchBbox[searchShould]) {
      this.setState({ activeSearch: searchShould }, () => {
        this.handleSearchedBboxScroll();
      });
    }
  };

  handleSearchedBboxScroll = () => {
    const { docuSearchBbox, docMeta, documentDomRect } = this.props;

    const { activeSearch } = this.state;
    const activeBbox = docuSearchBbox[activeSearch];
    const [x1, y1, x2, y2] = activeBbox.box;

    const {
      // status: docStatus,
      width: docWidth,
      height: docHeight,
    } = docMeta;

    const XD1 = (x1 / docWidth) * 100;
    const YD1 = (y1 / docHeight) * 100;
    const XD2 = (x2 / docWidth) * 100;
    const YD2 = (y2 / docHeight) * 100;
    activeBbox.rectanglePercentages = [XD1, YD1, XD2, YD2];

    let styleTopAbs = (YD1 / 100) * documentDomRect.height;
    let styleLeftAbs = (XD1 / 100) * documentDomRect.width;
    const documentWrapperNode = document.getElementById('rt-document-wrapper');

    let scrollX = styleLeftAbs;
    let scrollY = styleTopAbs;

    if (scrollX > 100) {
      scrollX -= 100;
    }

    if (scrollY > 80) {
      scrollY -= 80;
    }

    if (documentWrapperNode) {
      documentWrapperNode.scrollTo(scrollX, scrollY);
    }
    this.setState({
      activeSearchBox: activeBbox,
    });
  };

  handleSearchClick = (searchable) => {
    const { documentActions } = this.props;
    this.setState(
      {
        searchable,
      },
      () => {
        if (searchable) {
          this.searchInput.current.focus();
        } else {
          documentActions.searchDocumentBboxEmpty();
          this.setState({
            activeSearchBox: null,
            activeSearch: 0,
          });
        }
      }
    );
  };

  handleDebouncedSearchInput = _.debounce((value) => {
    this.handleSearchInput(value);
  }, 500);

  handleSearchInputChange = (value) => {
    this.setState({ searchInputName: value });
    this.handleDebouncedSearchInput(value);
  };

  handleSearchInput = (value, page_value) => {
    const { docId, documentActions } = this.props;
    this.setState({
      searchInputName: value,
    });

    if (this.state.searchInputName) {
      documentActions.searchDocumentBbox({
        docId,
        queryParams: {
          q: encodeURIComponent(value),
          page: page_value,
        },
      });
    } else {
      documentActions.searchDocumentBboxEmpty();
      this.setState({
        activeSearchBox: null,
        activeSearch: 0,
      });
    }
  };

  handleShrinkExpandButtonClick = () => {
    this.setState(
      {
        zoomed: !this.state.zoomed,
      },
      () => {
        this.setZoom(this.state.zoomed ? 100 : 80);
      }
    );
  };

  handlePageChange = (e) => {
    const { handlePageChange } = this.props;
    let page = e.target.value;
    const pageHeights = document.pageHeights;
    page = pageHeights.length - 1 < page ? pageHeights.length - 1 : page;
    if (!page) {
      return handlePageChange('');
    }
    if (page > 0) {
      handlePageChange(page);
      const pageHeights = document.pageHeights[page - 1];
      const documentWrapperNode = document.getElementById(
        'rt-document-wrapper'
      );
      documentWrapperNode.scrollTo(
        documentWrapperNode.scrollLeft,
        pageHeights + (page - 1) * documentConstants.DOC_PADDING
      );
    }
  };

  onComponentMouseTouchDown = (draggingPage) => {
    if (draggingPage !== this.state.draggingPage) {
      this.setState({ draggingPage });
    }
  };

  setDebouncedZoom = _.debounce((newValue) => {
    this.setZoom(newValue);
  }, 150);

  render() {
    const {
      zoom,
      region,
      docReadOnly,
      docMeta,
      gridBboxes,
      selectedField,
      gridView,
      grids = [],
      gridFetching,
      updatedRow,
      gridHeaders,
      handleRemoveGrid,
      currentPage,
      embeddedApp,
      clientApp,
      selectedSectionField,
      handleGridView,
      mainGridPosition,
      location: { pathname },
      selectedSectionFieldId,
      user,
      addMixpanelTrackingForTours,
    } = this.props;
    const { width: docWidth, height: docHeight } = docMeta;

    const { pages = [] } = docMeta || {};

    const {
      zoomed,
      searchable,
      activeSearchBox,
      activeSearch,
      grids: stateGrids,
      isDragging,
    } = this.state;

    const readOnly = docReadOnly;
    const showSuggestionBboxes =
      !readOnly && selectedField && !this.props.bboxDisable;
    const enableRegionSelection = !readOnly && !!selectedField;

    let regions = [];
    if (region && selectedField && region.fieldId === selectedField.id) {
      regions.push(region);
    } else if (region && gridView) {
      regions.push(region);
    } else {
      regions.push({
        x: -100,
        y: -100,
        width: 0,
        height: 0,
      });
    }
    let positionRegion;
    let pRegion = [];
    if (
      selectedSectionField &&
      selectedSectionField.type === documentConstants.FIELD_TYPES.LINE_ITEM
    ) {
      const { uiRectangle, uiLabel } = selectedField;

      if (uiRectangle && uiRectangle.length > 0) {
        const positionList = mainGridPosition[uiLabel];
        let positionId;
        if (positionList && positionList.length > 0) {
          for (let i = 0; i < positionList.length; i++) {
            if (
              positionList[i][0] * 0.991 <= uiRectangle[0] &&
              positionList[i][1] * 0.991 <= uiRectangle[1] &&
              positionList[i][2] * 1.001 >= uiRectangle[2] &&
              positionList[i][3] * 1.001 >= uiRectangle[3]
            ) {
              positionId = i;
              break;
            }
          }
        }
        positionRegion = positionList && positionList[positionId];
        const fieldPosition = computeFieldPositions({
          docWidth,
          docHeight,
          rectangle: positionRegion,
        });
        positionRegion = fieldPosition.position;
        pRegion.push({
          x: (positionRegion && positionRegion.left) || regions[0].x,
          y: (positionRegion && positionRegion.top) || regions[0].y,
          width: (positionRegion && positionRegion.width) || regions[0].width,
          height:
            (positionRegion && positionRegion.height) || regions[0].height,
          fieldId: selectedField.id,
        });
      } else {
        pRegion.push({
          x: regions[0].x,
          y: regions[0].y,
          width: regions[0].width,
          height: regions[0].height,
          fieldId: selectedField.id,
        });
      }
    }
    const documentBoxStyle = {
      width: `${zoom}%`,
      // paddingRight: zoom >= 100 ? 60 : 0,
    };

    const selectable = !['drop_down'].includes(selectedField.type);
    const loadingGrids = stateGrids.length ? stateGrids : grids;

    return (
      <div className={styles.root} ref={this.docViewerRef}>
        <div
          id={'rt-document-wrapper'}
          className={styles.documentWrapper}
          onScroll={this.handleDocumentWrapperScroll}
        >
          {/* RT document portal for rendering dropdown component */}
          <div id='rt-document-portal' />
          <div className={styles.documentBox} style={documentBoxStyle}>
            <div className={cx(styles.document)} id={'rt-document'}>
              <ReactResizeDetector
                handleWidth
                handleHeight
                refreshMode={'debounce'}
                refreshRate={30}
                onResize={this.handleResize}
              />
              <RegionSelect
                maxRegions={1}
                isLineItem={
                  selectedSectionField &&
                  selectedSectionField.type ===
                    documentConstants.FIELD_TYPES.LINE_ITEM &&
                  !gridView
                }
                positionRegion={pRegion}
                constraint={true}
                regions={regions}
                selectedField={selectedField}
                docMeta={docMeta}
                onChange={this.handleRegionChange}
                disabled={!enableRegionSelection || !selectable || isDragging}
              >
                {pages.map((page, index) => {
                  const imageProgress =
                    window.imageProgress &&
                    window.imageProgress[`imageProgress-${index}`];
                  /* eslint-disable jsx-a11y/no-static-element-interactions */
                  return (
                    <div
                      className={styles.documentPage}
                      id={`rt-canvas-document-${index}`}
                      key={[page.id, page.image.url].join('-')}
                      style={{ width: '100%' }}
                      onMouseMove={() => this.onComponentMouseTouchDown(index)}
                    >
                      <CircularProgressBar
                        className={`${styles.circularProgressBar} rt-canvas-loader-${index}`}
                        percentage={imageProgress || 0}
                        strokeWidth={10}
                      />
                      <img
                        data-review-doc-img={index + 1}
                        alt=''
                        className={styles.documentImg}
                        onLoad={() =>
                          this.props.onPageImageLoadSuccess(page.image.url)
                        }
                        onError={() =>
                          this.props.onPageImageLoadError(page.image.url)
                        }
                      />
                    </div>
                  );
                })}

                {selectedSectionField &&
                  selectedSectionField.type ===
                    documentConstants.FIELD_TYPES.LINE_ITEM &&
                  !gridFetching &&
                  grids.map(({ position, ...rest }, index) => (
                    <GridRegion
                      gridView={gridView}
                      docMeta={docMeta}
                      zoom={zoom}
                      position={position}
                      docReadOnly={docReadOnly}
                      grid={rest}
                      updatedRow={updatedRow}
                      handleDragging={this.handleDragging}
                      handleGridSubmit={(e) =>
                        this.handleGridSubmit(e, index, rest.page + 1)
                      }
                      handleRemoveGrid={handleRemoveGrid}
                      key={`index-${index}`}
                      index={index}
                      gridHeaders={gridHeaders}
                      handleGridView={handleGridView}
                      currentPage={currentPage}
                      selectedSectionFieldId={selectedSectionFieldId}
                      user={user}
                      addMixpanelTrackingForTours={addMixpanelTrackingForTours}
                    />
                  ))}

                {gridView &&
                  gridFetching &&
                  loadingGrids.length &&
                  loadingGrids.map((grid, index) => (
                    <LoadingGrid
                      docMeta={docMeta}
                      zoom={zoom}
                      gridFetching={gridFetching}
                      grid={grid}
                      key={`index-${index}`}
                    />
                  ))}

                {selectable &&
                showSuggestionBboxes &&
                this.props.activeSidebarTab !== 'chat' ? (
                  <SuggestionBboxes
                    suggestionBboxesByPage={this.props.suggestionBboxesByPage}
                    visiblePages={this.state.visiblePages}
                    onBboxClick={this.handleBboxClick}
                    gridView={gridView}
                    isLineItem={
                      selectedSectionField &&
                      selectedSectionField.type ===
                        documentConstants.FIELD_TYPES.LINE_ITEM
                    }
                  />
                ) : null}

                {this.props.activeSidebarTab !== 'chat' ? (
                  <HighlightedBboxes visiblePages={this.state.visiblePages} />
                ) : null}

                <ChatAIBboxes />

                {selectable && <SearchMatchBboxes />}

                {selectedSectionField &&
                selectedSectionField.type ===
                  documentConstants.FIELD_TYPES.LINE_ITEM &&
                !gridFetching &&
                gridView ? (
                  <GridBboxes
                    bboxes={gridBboxes}
                    gridIndexes={
                      grids?.length ? grids.map((grid) => grid.index) : []
                    }
                  />
                ) : null}

                {selectable && activeSearchBox ? (
                  <FieldValueBboxes
                    bboxes={[activeSearchBox]}
                    activeBox={true}
                  />
                ) : (
                  ''
                )}
              </RegionSelect>
            </div>
            {selectable && !gridView && this.renderRegionFieldInput()}
            {selectable && !gridView && this.renderRegionFieldValue()}
          </div>
        </div>

        <ControlHeader
          zoom={zoom}
          zoomed={zoomed}
          currentPage={currentPage}
          searchable={searchable}
          pages={pages}
          showSplitDocument={
            !embeddedApp && !clientApp && this.props.slug !== 'editField'
              ? true
              : false
          }
          handleSplitDocument={this.handleSplitDocument}
          handlePageChange={this.handlePageChange}
          handleSearchClick={this.handleSearchClick}
          handleZoomInClick={this.handleZoomInClick}
          handleZoomOutClick={this.handleZoomOutClick}
          setDebouncedZoom={this.setDebouncedZoom}
          handleShrinkExpandButtonClick={this.handleShrinkExpandButtonClick}
        />

        {searchable ? (
          <TextSearchBox
            searchInputRef={this.searchInput}
            activeSearch={activeSearch}
            searchInputName={this.state.searchInputName}
            handleSearchInputChange={this.handleSearchInputChange}
            handleChangeActiveSearch={this.handleChangeActiveSearch}
            handleSearchClick={this.handleSearchClick}
          />
        ) : null}
      </div>
    );
  }
}

function mapStateToProp(state) {
  const {
    docId,
    documentsById,

    suggestionBboxesByID,
    suggestionBboxesByPage,

    gridBboxIds,
    gridBboxesByID,

    sectionFieldIds,
    fieldsById,
    grids,
    mainGridPosition,
    gridFetching,
    updatedRow,
    selectedFieldId,
    selectedSectionFieldId,
    docuSearchBbox,
    gridHeadersById,
  } = state.documents.reviewTool;
  const { config } = state.app;
  const { activeSidebarTab } = state.documents;

  const docMeta = documentsById[docId] || {};

  let gridBboxes = [];
  if (gridBboxIds && _.isArray(gridBboxIds)) {
    gridBboxes = gridBboxIds.map((bboxId) => {
      const bbox = gridBboxesByID[bboxId];
      return bbox;
    });
  }

  let selectedField = selectedFieldId && fieldsById[selectedFieldId];
  selectedField = selectedField || { label: '' };

  let gridHeaders =
    gridHeadersById &&
    selectedSectionFieldId &&
    gridHeadersById[selectedSectionFieldId];

  const sectionField =
    selectedSectionFieldId && fieldsById[selectedSectionFieldId];

  const tableData = sectionField?.children;

  return {
    docId,
    docMeta,
    suggestionBboxesByID,
    suggestionBboxesByPage,
    gridBboxes,
    gridBboxesByID,
    sectionFieldIds,
    fieldsById,
    selectedFieldId,
    selectedField,
    docuSearchBbox,
    grids,
    mainGridPosition,
    gridFetching,
    updatedRow,
    gridHeaders,
    selectedSectionFieldId,
    config,
    activeSidebarTab,
    tableData,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: {
      searchDocumentBbox: bindActionCreators(
        documentActions.searchDocumentBbox,
        dispatch
      ),
      searchDocumentBboxEmpty: bindActionCreators(
        documentActions.searchDocumentBboxEmpty,
        dispatch
      ),
      manageLineGrid: bindActionCreators(
        documentActions.rtManageGridData,
        dispatch
      ),
      storeSplitDocumentId: bindActionCreators(
        documentActions.storeSplitDocumentId,
        dispatch
      ),
      handleGridDrag: bindActionCreators(
        documentActions.handleGridDrag,
        dispatch
      ),
    },
  };
}

export default withRouter(
  WithTrackingContext(
    connect(mapStateToProp, mapDispatchToProps)(DocumentViewer)
  )
);
