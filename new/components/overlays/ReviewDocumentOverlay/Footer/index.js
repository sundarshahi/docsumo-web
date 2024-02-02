/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
// import _ from 'lodash';
import { actions as documentActions } from 'new/redux/documents/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import {
  Check,
  EditPencil,
  EyeEmpty,
  EyeOff,
  Plus,
  Trash,
} from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import { WithTrackingContext } from 'new/components/contexts/tracking';
import {
  TABLE_TRACKING_KEYS,
  TRACKING_HELPER_KEYS,
} from 'new/components/contexts/trackingConstants';
import {
  CHAMELEON_TOUR_TYPES,
  chameleonTriggerTour,
  CHAMLEON_TOUR_IDS,
} from 'new/thirdParty/chameleon';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Badge from 'new/ui-elements/Badge';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import {
  customMixpanelTracking,
  mixpanelTrackingAllEvents,
} from 'new/utils/mixpanel';

import GridFooter from '../DocumentViewer/Grid/Footer';

import GridAlignmentDropdown from './GridAlignmentDropdown/GridAlignmentDropdown';
import GridViewWrapDropdown from './GridViewWrapDropdown/GridViewWrapDropdown';
import GridSelectionDropdown from './GridSelectionDropdown';
import KebabMenu from './KebabMenu';
import LineItemRow from './LineItemRow';
import LowConfidenceNavigator from './LowConfidenceNavigator';

import styles from './index.scss';

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: null,
      minCellWidth: 84,
      maxCellWidth: 1400,
      alignItem: {
        textAlign: 'left',
        justifyAlign: 'flex-start',
      },
      wrapItem: {
        justifyWrap: 'pre',
        wrapHeight: '24px',
      },
      optionRow: null,
      view: '',
      currentTour: '', // for current tour seen at a time
      showKebabMenu: false,
      column: [],
      initialColumn: [],
      gridColumns: [],
    };
    this.contentbox = React.createRef();
    this.dragline = React.createRef();
    this.tableElement = React.createRef();
    this.footerWrapperRef = React.createRef();
    this.resizeObserverRef = React.createRef();
    this.adjustScrollonTableRef = React.createRef();
  }

  componentDidMount() {
    this.dragElement(
      this.dragline.current,
      this.contentbox.current,
      this.addMixpanelEventForResizingFooter
    );

    this.updateSidebarShadow();

    const {
      lineItemRowIds,
      documentActions,
      selectedSectionFieldId: parentId,
      docId,
      sectionField: { parentId: pid },
      sectionField,
      setGridViewMode,
      gridView,
    } = this.props;

    if (!gridView) {
      this.updateTableWrapperHeight();
    }

    this.resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const contentBoxSize = entry.contentBoxSize[0];
        if (contentBoxSize.inlineSize < 600) {
          if (this.state.showKebabMenu) return;
          this.setState({ showKebabMenu: true });
        } else {
          if (!this.state.showKebabMenu) return;
          this.setState({ showKebabMenu: false });
        }
      }
    });

    this.resizeObserverRef.current.observe(this.footerWrapperRef.current);

    documentActions.rtManageGridData({
      docId,
      parentId,
      pid,
      method: 'GET',
      gridViewEnable: () => setGridViewMode(true),
    });

    const column = sectionField?.lineItemColumns?.map((column) => {
      return {
        column: column.label,
        ref: React.createRef(),
        type: column.type,
        w: '160px',
      };
    });

    this.setState({
      column,
      initialColumn: column,
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { initialColumn } = this.state;
    const contentBox = this.contentbox.current;
    const { selectedSectionFieldId, lineItemRowIds } = nextProps;
    const { selectedSectionFieldId: preSelectedSectionFieldId } = this.props;

    if (selectedSectionFieldId !== preSelectedSectionFieldId) {
      const {
        documentActions,
        selectedSectionFieldId: parentId,
        docId,
        sectionField: { parentId: pid },
        setGridViewMode,
      } = nextProps;

      documentActions.rtManageGridData({
        docId,
        parentId,
        method: 'GET',
        pid,
        gridViewEnable: () => setGridViewMode(true),
      });
      const {
        sectionField: { lineItemColumns },
      } = nextProps;

      const column = lineItemColumns.map((column) => {
        return {
          column: column.label,
          ref: React.createRef(),
          type: column.type,
          w: '160px',
        };
      });

      this.setState(
        {
          showHide: true,
          column,
          initialColumn: column,
        },
        () => this.updateThePosition(column)
      );

      if (!contentBox) return;

      contentBox.scrollTop = 0;

      this.updateTableWrapperHeight();
    }
  }

  componentDidUpdate(prevProps) {
    const { activeIndex } = this.state;
    if (activeIndex !== null) {
      document.addEventListener('mousemove', this.mouseMove);
      document.addEventListener('mouseup', this.mouseUp);
    } else {
      document.removeEventListener('mousemove', this.mouseMove);
      document.removeEventListener('mouseup', this.mouseUp);
    }

    this.triggerLineItemTour();

    this.updateSelectedGrid(prevProps);
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.mouseMove);
    document.removeEventListener('mouseup', this.mouseUp);
    this.resizeObserverRef.current.unobserve(this.footerWrapperRef.current);

    this.setState({ currentTour: '' });
    const shadowBox = document.getElementById('js-rt-sidebar-shadow');

    if (shadowBox) {
      shadowBox.style.height = '100%';
    }
    if (this.adjustScrollonTableRef.current) {
      clearTimeout(this.adjustScrollonTableRef.current);
    }
  }

  /**
   * Function to update selected Grid, if fields are manually focused without changing grid,
   */
  updateSelectedGrid = (prevProps) => {
    const { selectedFieldId, fieldsById, selectedGridId, documentActions } =
      this.props;
    const selectedField = fieldsById[selectedFieldId];

    if (
      prevProps?.selectedFieldId !== selectedFieldId &&
      selectedGridId !== selectedField?.gridId &&
      selectedField?.gridId
    ) {
      documentActions.rtSetCurrentGridId({
        gridId: selectedField?.gridId,
      });
    }
  };

  updateTableWrapperHeight = () => {
    const totalLineItemRowIds = this.props.sectionField?.lineItemRowIds || [];
    const contentBox = this.contentbox.current;

    if (totalLineItemRowIds && totalLineItemRowIds.length >= 5) {
      contentBox.style.height = '200px';
    } else {
      contentBox.style.height = 'auto';
    }
  };

  addMixpanelEventForResizingFooter = (direction) => {
    const { docMeta, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;
    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.resize_line_item_footer, {
      docId: docMeta.docId,
      label: docMeta.title,
      'document type': docMeta.type,
      'work email': user.email,
      direction,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  mouseMove = (e) => {
    const { activeIndex, minCellWidth, column, position, maxCellWidth } =
      this.state;
    e = e || window.event;
    e.preventDefault();
    let gridColumns;
    if (activeIndex || activeIndex === 0) {
      gridColumns = column.map((col, i) => {
        if (i === activeIndex) {
          e.preventDefault();
          const currentHead =
            document.getElementById(`{column-handler-${i}}`) || {};
          // Calculate the column width
          const difference = e.clientX - position;

          let width =
            col.ref.current.offsetWidth + difference < minCellWidth
              ? minCellWidth
              : col.ref.current.offsetWidth + difference;

          if (width > maxCellWidth) {
            width = maxCellWidth;
          }

          let pos1 = position - e.clientX;

          // Calculate the position of handler
          let left = currentHead.offsetLeft - pos1;

          if (width >= minCellWidth && width <= maxCellWidth) {
            left = width - 7;
            currentHead.style.left = left + 'px';
            return `${width}px`;
          }
        }
        return `${col.ref.current.offsetWidth}px`;
      });
    }
    if (gridColumns) {
      this.setState({
        gridColumns,
      });
    }
  };

  updateSidebarShadow = () => {
    const shadowBox = document.getElementById('js-rt-sidebar-shadow');
    const footerBox = document.getElementById('js-footer-wrapper');
    shadowBox.style.height = `calc(100% - ${footerBox.offsetHeight}px)`;
  };

  updateThePosition = (column) => {
    const { minCellWidth, maxCellWidth } = this.state;
    let gridColumns;

    this.updateSidebarShadow();

    gridColumns = column.map((col, i) => {
      const currentHead =
        document.getElementById(`{column-handler-${i}}`) || {};
      if (!currentHead || !col?.ref?.current) return '160px';

      // Calculate the column width
      const width = col.ref.current.offsetWidth;

      // Calculate the position of handler
      let left;

      if (width >= minCellWidth && width <= maxCellWidth) {
        left = width - 7;
        currentHead.style.left = left + 'px';
        return `${width}px`;
      }
      return `${col.ref.current.offsetWidth}px`;
    });

    if (gridColumns.length) {
      this.setState(
        {
          gridColumns,
        },
        () => {
          const { gridColumns } = this.state;
          if (gridColumns && column) {
            const col = column.map((col, i) => ({
              ...col,
              w: gridColumns[i],
            }));
            this.setState({
              column: col,
            });
          }
        }
      );
    }
  };

  mouseUp = () => {
    this.setState(
      {
        activeIndex: null,
      },
      () => {
        const { gridColumns, column } = this.state;
        if (gridColumns && column) {
          const col = column.map((col, i) => ({
            ...col,
            w: gridColumns[i],
          }));
          this.setState({
            column: col,
          });
        }
      }
    );
  };

  // For onboarding tooltips for line item
  triggerLineItemTour = () => {
    const { currentTour } = this.state;
    const {
      gridView,
      grids,
      gridBboxIds,
      gridFetching,
      lineItemRowIds,
      addMixpanelTrackingForTours,
    } = this.props;

    if (gridFetching || currentTour) return;

    if (_.isEmpty(grids)) {
      // When the document does not have extracted grid
      if (_.isEmpty(gridBboxIds)) {
        // When there are no table bbox (table tagging)
        if (!currentTour) {
          chameleonTriggerTour(
            CHAMLEON_TOUR_IDS.reviewScreenPhase3_noGrids,
            CHAMELEON_TOUR_TYPES.reviewScreenPhase3_noGrids,
            () =>
              addMixpanelTrackingForTours(
                MIXPANEL_EVENTS.review_screen_phase_3_noGrids
              )
          );
          this.setState({
            currentTour: CHAMELEON_TOUR_TYPES.reviewScreenPhase3_noGrids,
          });
        }
      } else {
        // The document has table bbox
        if (!currentTour) {
          chameleonTriggerTour(
            CHAMLEON_TOUR_IDS.reviewScreenPhase3_tableGrid,
            CHAMELEON_TOUR_TYPES.reviewScreenPhase3_tableGrid,
            () =>
              addMixpanelTrackingForTours(
                MIXPANEL_EVENTS.review_screen_phase__tableGrid
              )
          );
          this.setState({
            currentTour: CHAMELEON_TOUR_TYPES.reviewScreenPhase3_tableGrid,
          });
        }
      }
    } else {
      if (!_.isEmpty(lineItemRowIds) && !gridView) {
        // The document already has extracted grid and there are values in footer table
        if (!currentTour) {
          chameleonTriggerTour(
            CHAMLEON_TOUR_IDS.reviewScreenPhase5,
            CHAMELEON_TOUR_TYPES.reviewScreenPhase5,
            () =>
              addMixpanelTrackingForTours(MIXPANEL_EVENTS.review_screen_phase_5)
          );
          this.setState({
            currentTour: CHAMELEON_TOUR_TYPES.reviewScreenPhase5,
          });
        }
      }
    }
  };

  dragElement = (line = {}, box = {}, callback) => {
    var pos = 0,
      pos1 = 0,
      direction = '';
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
      let boxHeight = box.offsetHeight;
      var finalHeight = boxHeight - top;
      box.style.height = `${finalHeight}px`;

      const shadowBox = document.getElementById('js-rt-sidebar-shadow');
      shadowBox.style.height = `${window.innerHeight - (finalHeight + 140)}px`;

      direction = top < 0 ? 'top' : 'bottom';
    }

    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
      callback(direction);
    }
  };

  adjustTableContentHeight = (child) => {
    const contentBox = this.contentbox.current;
    if (contentBox && contentBox?.clientHeight < 180) {
      contentBox.style.height =
        Number(contentBox?.clientHeight) +
        Number(child?.offsetHeight + 50) +
        'px';
    }
  };

  handleAddLineBtnClick = () => {
    const {
      gridView,
      lineItemRowIds,
      sectionFieldId,
      handleDelayedTableTracking,
      fieldsById,
    } = this.props;
    const contentBox = this.contentbox.current;

    if (gridView) {
      this.updateTableWrapperHeight();
    }
    this.props.onAddLineBtnClick({
      sectionFieldId: this.props.sectionFieldId,
    });
    handleDelayedTableTracking({
      name: sectionFieldId,
      fieldLabel: fieldsById[sectionFieldId]?.label,
      key: TABLE_TRACKING_KEYS.tableLineItem,
      action: TRACKING_HELPER_KEYS.added,
    });
    this.mixpanelTracking(MIXPANEL_EVENTS.add_line_btn);
  };

  mixpanelTracking = (evtName) => {
    const {
      config: { accountType = '', canSwitchToOldMode = true },
      user: { email = '', role = '', companyName = '' },
      docMeta: { docId = '', title = '', type = '' },
    } = this.props;

    customMixpanelTracking(evtName, {
      plan: accountType,
      canSwitchUIVersion: canSwitchToOldMode,
      'work email': email,
      role,
      docId,
      docType: type,
      label: title,
      companyName,
    });
  };

  handleRowOptionAddLineBtnClick = (baseItemId) => {
    this.props.onRowOptionAddLineBtnClick({
      sectionFieldId: this.props.sectionFieldId,
      baseItemId,
    });
    const { handleDelayedTableTracking, selectedSectionFieldId } = this.props;

    handleDelayedTableTracking({
      name: selectedSectionFieldId,
      fieldLabel: this.props.fieldsById[selectedSectionFieldId]?.label,
      key: TABLE_TRACKING_KEYS.tableLineItem,
      action: TRACKING_HELPER_KEYS.added,
    });
  };

  handleAddSimilarLinesBtnClick = () => {
    this.props.onAddSimilarLinesBtnClick({
      sectionFieldId: this.props.sectionFieldId,
    });
  };

  handleOptionRow = (id) => {
    this.setState({
      optionRow: id,
    });
  };

  outsideRowOptionClick = () => {
    this.setState({
      optionRow: null,
    });
  };

  handleDeleteAllRowsBtnClick = () => {
    const {
      sectionFieldId,
      sectionField,
      docMeta: { type },
    } = this.props;

    mixpanelTrackingAllEvents(MIXPANEL_EVENTS.delete_all_rows, {
      origin: 'footer',
      docType: type,
    });

    this.props.onDeleteAllRowsBtnClick({
      sectionFieldId,
      gridIds: sectionField?.gridIds || [],
    });
  };

  handleDeleteRowBtnClick = ({ id, gridId }) => {
    const {
      handleTableTracking,
      selectedSectionFieldId,
      fieldsById,
      lineItemRowIds,
      lineItemRowsById,
      sectionFieldId,
      selectedGridId,
      focusLineItemFieldInput,
    } = this.props;

    // This value will be set only if we need to change the
    // selected field in store to a neighbouring row field
    // or to null incase of an an empty table
    let newFieldId;

    const fieldIds = lineItemRowsById[id]?.fieldIds || [];

    if (fieldIds.includes(this.props.selectedFieldId)) {
      const { selectedGrid, lineItemRowsById } = this.props;
      const { rowIds } = selectedGrid;
      const rowIndex = rowIds.indexOf(id);
      const prevRowId = rowIds[rowIndex - 1];
      const nextRowId = rowIds[rowIndex + 1];

      let newRow;
      if (prevRowId) {
        newRow = lineItemRowsById[prevRowId];
      } else if (nextRowId) {
        newRow = lineItemRowsById[nextRowId];
      }

      if (newRow) {
        newFieldId = newRow.fieldIds[0] || null;
      }
    }

    this.props.documentActions.rtDeleteRow({
      docId: this.props.docId,
      sectionFieldId: sectionFieldId,
      rowId: id,
      rowFieldIds: fieldIds,
      selectedGridId: gridId,
      onSuccess: () => {
        const tableAfterRowDelete = lineItemRowIds.map((lineItemId) => {
          const lineItem = lineItemRowsById[lineItemId];

          return lineItem.fieldIds.map((id) => fieldsById[id]);
        });

        handleTableTracking({
          name: selectedSectionFieldId,
          fieldLabel: fieldsById[selectedSectionFieldId]?.label,
          key: TABLE_TRACKING_KEYS.tableLineItem,
          action: TRACKING_HELPER_KEYS.deleted,
          tableValue: tableAfterRowDelete,
        });

        if (_.isUndefined(newFieldId)) {
          // No value was set
          // User wasn't focussed on a field from this row
          return;
        }

        this.props.documentActions.rtSetSelectedFieldId({
          fieldId: newFieldId,
        });

        if (newFieldId) {
          focusLineItemFieldInput({
            fieldId: newFieldId,
          });
        }
      },
    });
  };

  mouseDown = (e, i) => {
    e.preventDefault();
    this.setState({
      activeIndex: i,
      position: e.clientX,
    });
  };

  renderRows = (rowIds = []) => {
    const {
      docReadOnly,
      selectedLineItemRowId,
      onReadOnlyLineFieldClick,
      onLineFieldInputFocus,
      onLineFieldInputValueChange,
      onLineFieldInputSubmit,
      sectionField,
      fieldsById,
      handleBboxViewer,
      bboxClickType,
      lineItemRowsById,
    } = this.props;
    const { column, alignItem, wrapItem, optionRow, initialColumn } =
      this.state;

    return rowIds.map((lineItemId, index) => {
      const { id } = lineItemRowsById[lineItemId];

      const filteredRow = { ...lineItemRowsById[lineItemId] };

      if (column.length !== initialColumn.length) {
        filteredRow.fieldIds = filteredRow.fieldIds.filter((fieldId) =>
          column.find((col) => col.column === fieldsById[fieldId]?.label)
        );
      } else {
        filteredRow.fieldIds = lineItemRowsById[lineItemId].fieldIds;
      }

      return (
        <LineItemRow
          key={id}
          rowCount={index + 1}
          docReadOnly={docReadOnly}
          row={filteredRow}
          isSelected={id === selectedLineItemRowId}
          onDeleteBtnClick={this.handleDeleteRowBtnClick}
          onReadOnlyLineFieldClick={onReadOnlyLineFieldClick}
          onLineFieldInputFocus={onLineFieldInputFocus}
          onLineFieldInputValueChange={onLineFieldInputValueChange}
          onLineFieldInputSubmit={onLineFieldInputSubmit}
          sectionField={sectionField}
          column={column}
          alignItem={alignItem}
          wrapItem={wrapItem}
          lineItemRowIds={rowIds}
          lineItemRowsById={lineItemRowsById}
          optionRow={optionRow}
          handleOptionRow={this.handleOptionRow}
          outsideRowOptionClick={this.outsideRowOptionClick}
          handleRowOptionAddLineBtnClick={this.handleRowOptionAddLineBtnClick}
          fieldsById={fieldsById}
          adjustTableContentHeight={this.adjustTableContentHeight}
          handleBboxViewer={handleBboxViewer}
          bboxClickType={bboxClickType}
        />
      );
    });
  };
  handleSelectAlign = (value) => {
    this.setState({
      alignItem: value,
    });
  };
  handleSelectWrap = (value) => {
    this.setState({
      wrapItem: value,
    });
  };
  handleSpreadsheetView = () => {
    const { documentActions } = this.props;
    documentActions.handleSpreadsheetView({ openSpreadsheetView: true });
  };

  toggleEmptyColumnVisibility = () => {
    const { hideFooterEmptyColumn, sectionField, documentActions } = this.props;

    const { column, initialColumn } = this.state;

    if (hideFooterEmptyColumn) {
      documentActions.toggleFooterEmptyColumnVisibility(!hideFooterEmptyColumn);

      this.setState(
        {
          column: initialColumn,
        },
        () => this.updateThePosition(initialColumn)
      );
    } else {
      let filteredColumn = column.filter((c) => {
        return sectionField?.columnFieldIds[c.column].length > 0;
      });

      documentActions.toggleFooterEmptyColumnVisibility(!hideFooterEmptyColumn);

      this.setState(
        {
          column: filteredColumn,
        },
        () => this.updateThePosition(filteredColumn)
      );
    }

    this.mixpanelTracking(MIXPANEL_EVENTS.show_hide_btn_click);
  };

  handleEditClick = () => {
    const { grids, handleGridView, documentActions, copiedPage, copiedGridId } =
      this.props;

    if (copiedPage || copiedGridId) {
      // Reset grid copied page and grid id
      documentActions.setCopiedPage({
        copiedPage: null,
        copiedGridId: null,
      });
    }

    if (grids.length) {
      handleGridView(true, grids[0]);
    }
  };

  adjustText = (columnText, w) => {
    const divWidth = parseInt(w);
    const charWidthApprox = 9;
    const numberOfChars = Math.floor(divWidth / charWidthApprox);

    if (divWidth <= 125) {
      if (columnText.length > 10) {
        return columnText.substring(0, 8) + '...';
      }
    } else if (columnText.length > numberOfChars && numberOfChars > 6) {
      return columnText.substring(0, numberOfChars) + '...';
    }

    return columnText;
  };

  render() {
    const {
      docReadOnly,
      sectionField,
      sectionFieldId,
      lineItemRowIds,
      gridView,
      isAddingLineFront,
      handleClose,
      extractData,
      handleCloseGrid,
      grids,
      currentPage,
      docId,
      docMeta,
      user,
      isDragging,
      selectedGridId,
      selectedGrid,
      isGridEdited,
      overlayClicked,
      originalGrids,
      setGridViewMode,
      hideFooterEmptyColumn,
    } = this.props;

    const { activeIndex, column, alignItem, wrapItem, showHide } = this.state;

    const { isAddingNewLine, isAddingSimilarLines, isDeletingAllRows } =
      sectionField;
    const rowCount = this.props.sectionField?.lineItemRowIds?.length || 0;
    const showAddLineBtn = !docReadOnly;
    const showDeleteAllRowsBtn = !docReadOnly && rowCount > 0;

    const disableFoterBtn =
      isAddingNewLine ||
      isAddingSimilarLines ||
      isDeletingAllRows ||
      isAddingLineFront;

    const gridsArr = !grids?.length
      ? originalGrids?.length
        ? originalGrids
        : []
      : grids;

    const headerFounded = gridsArr.find(
      (grid) => grid.columns && grid.columns.find((e) => e.header)
    );

    const disabled =
      (!originalGrids?.length && !grids?.length) ||
      !headerFounded ||
      isDragging;

    return (
      <div
        className={styles.wrapper}
        id={'js-footer-wrapper'}
        ref={this.footerWrapperRef}
      >
        {isGridEdited && (
          <div
            className={styles.footerOverlay}
            onClick={(e) => {
              e.preventDefault();
              overlayClicked();
            }}
          ></div>
        )}
        <div className={styles.drag} ref={this.dragline}>
          <span />
          <span />
        </div>
        <div className={styles.root}>
          <GridFooter
            handleCloseGrid={handleCloseGrid}
            currentPage={currentPage}
            docId={docId}
            parentId={sectionFieldId}
            docMeta={docMeta}
            user={user}
            setGridViewMode={setGridViewMode}
          />

          <div className={cx(styles.tableSettings, 'UFTableSettings')}>
            <div className='d-flex align-items-center'>
              <GridSelectionDropdown />

              <LowConfidenceNavigator lineItemRowIds={lineItemRowIds} />
              {this.state.showKebabMenu ? (
                <KebabMenu
                  toggleEmptyColumnVisibility={this.toggleEmptyColumnVisibility}
                  showHide={hideFooterEmptyColumn}
                  handleSelectAlign={this.handleSelectAlign}
                  handleSelectWrap={this.handleSelectWrap}
                />
              ) : (
                <>
                  <GridAlignmentDropdown
                    alignItem={alignItem}
                    handleSelectAlign={this.handleSelectAlign}
                    mixpanelTracking={this.mixpanelTracking}
                  />
                  <GridViewWrapDropdown
                    wrapItem={wrapItem}
                    handleSelectWrap={this.handleSelectWrap}
                    mixpanelTracking={this.mixpanelTracking}
                  />

                  <div onClick={this.toggleEmptyColumnVisibility}>
                    <Tooltip
                      label={
                        hideFooterEmptyColumn
                          ? 'Show Empty Columns'
                          : 'Hide Empty Columns'
                      }
                    >
                      <IconButton
                        icon={hideFooterEmptyColumn ? <EyeEmpty /> : <EyeOff />}
                        variant='text'
                      />
                    </Tooltip>
                  </div>
                </>
              )}
            </div>
            <div>
              {!gridView &&
              !docReadOnly &&
              (originalGrids?.length || grids?.length) ? (
                <Button
                  variant='outlined'
                  size='extra-small'
                  icon={EditPencil}
                  onClick={this.handleEditClick}
                >
                  Edit grids
                </Button>
              ) : null}

              {gridView && (originalGrids?.length || grids?.length) ? (
                <>
                  <div
                    className={cx('d-flex align-items-center', {
                      [styles.btnsOverlay]: isGridEdited,
                    })}
                  >
                    <Button
                      onClick={() => overlayClicked()}
                      variant='outlined'
                      size='extra-small'
                      className='mr-4'
                    >
                      Cancel
                    </Button>

                    <Tooltip
                      labelClassName={styles.tooltip}
                      label={'Extract data as specified by the grid above'}
                      placement={'left'}
                    >
                      <Button
                        icon={Check}
                        className={cx('UFTooltipApplyChanges')}
                        disabled={disabled}
                        onClick={() => extractData()}
                        isLoading={isAddingSimilarLines || false}
                        size='extra-small'
                      >
                        Apply Changes
                      </Button>
                    </Tooltip>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div
            className={cx(styles.tableWrapper, {
              [styles['tableWrapper--gridView']]:
                gridView && originalGrids.length !== 0,
            })}
            ref={this.contentbox}
            id='gridTableWrapper'
          >
            {Array.isArray(sectionField?.gridIds)
              ? sectionField.gridIds.map((gridId, index) => {
                  const grid = this.props.footerGridsById[gridId] || {};

                  return (
                    <div
                      key={gridId}
                      className={styles.table}
                      data-grid-id={gridId}
                    >
                      <div className={cx(styles.tableHeader)}>
                        <div className={styles.tableHeader__number}>
                          <span className='font-medium mr-2'>
                            Grid&nbsp;
                            {index + 1}
                          </span>
                          {grid?.page ? (
                            <Badge
                              title={`Page ${grid.page}`}
                              type='primary'
                              className={styles['tableHeader__number-badge']}
                            />
                          ) : null}
                        </div>
                        <div className={styles.table__columns}>
                          <div className={styles.table__columnsOverflow} />
                          <div className={cx(styles.rowCount)}></div>
                          {column.map(({ column, ref, w }, i) => {
                            return (
                              <p
                                className={styles.item}
                                id={`column-head-${i}`}
                                ref={ref}
                                key={i}
                                style={{
                                  width: w,
                                  justifyContent: alignItem.justifyAlign,
                                }}
                                title={column.length > 16 ? column : null}
                              >
                                {this.adjustText(column, w)}

                                <span
                                  style={{ height: '32px' }}
                                  id={`{column-handler-${i}}`}
                                  onMouseDown={(e) => this.mouseDown(e, i)}
                                  className={cx(styles.resizeHandle, {
                                    [styles.active]: activeIndex === i,
                                  })}
                                />
                              </p>
                            );
                          })}
                        </div>
                      </div>
                      <div className={styles.tableContent}>
                        {this.renderRows(grid?.rowIds)}
                      </div>
                    </div>
                  );
                })
              : null}
          </div>
        </div>

        <div className={styles.btnsContainer}>
          {showAddLineBtn ? (
            <Tooltip
              label={'Add line to the line item above'}
              placement={'right'}
            >
              <Button
                id={`footer-add-line-btn-${sectionFieldId}`}
                icon={Plus}
                isLoading={isAddingNewLine}
                disabled={disableFoterBtn}
                onClick={this.handleAddLineBtnClick}
                variant='outlined'
                size='extra-small'
              >
                Add Line
              </Button>
            </Tooltip>
          ) : null}

          {showDeleteAllRowsBtn ? (
            <Tooltip
              className='ml-4'
              label={'Delete all the row/line of line item'}
              placement={'top'}
            >
              <Button
                id={`footer-delete-all-rows-btn-${sectionFieldId}`}
                icon={Trash}
                className={styles.btnDanger}
                isLoading={isDeletingAllRows}
                disabled={disableFoterBtn}
                onClick={this.handleDeleteAllRowsBtnClick}
                variant='outlined'
                size='extra-small'
              >
                Delete All Rows
              </Button>
            </Tooltip>
          ) : null}
        </div>
      </div>
    );
  }
}

function mapStateToProp(state, ownProps) {
  const { sectionFieldId } = ownProps;
  const {
    docId,
    fieldsById,
    lineItemRowsById,
    selectedSectionFieldId,
    selectedLineItemRowId,
    selectedFieldId,
    gridHeadersById,
    gridFetching,
    copiedPage,
    copiedGridId,
    grids,
    isDragging,
    selectedGridId,
    footerGridsById,
    originalGrids,
    hideFooterEmptyColumn,
  } = state.documents.reviewTool;
  const { config } = state.app;

  const sectionField = fieldsById[sectionFieldId];
  const selectedGrid = footerGridsById[selectedGridId];

  const lineItemRowIds = footerGridsById[selectedGridId]?.rowIds || [];

  return {
    docId,
    sectionFieldId,
    sectionField,
    lineItemRowIds,
    selectedSectionFieldId,
    selectedLineItemRowId,
    selectedFieldId,
    lineItemRowsById,
    gridHeadersById,
    fieldsById,
    config,
    gridFetching,
    copiedPage,
    copiedGridId,
    grids,
    isDragging,
    footerGridsById,
    selectedGridId,
    selectedGrid,
    originalGrids,
    hideFooterEmptyColumn,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default WithTrackingContext(
  connect(mapStateToProp, mapDispatchToProps)(Footer)
);
