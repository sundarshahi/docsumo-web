/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
// import _ from 'lodash';
import { actions as documentActions } from 'new/redux/oldDocuments/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  EyeEmpty,
  EyeOff,
  NavArrowDown,
  Plus,
  Trash,
  WrapText,
} from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import { ReactComponent as WrapPre } from 'new/assets/images/icons/wrap-pre.svg';
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
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import { customMixpanelTracking } from 'new/utils/mixpanel';
import OutsideClickHandler from 'react-outside-click-handler';

import GridFooter from '../DocumentViewer/Grid/Footer';

import LineItemRow from './LineItemRow';

import styles from './index.scss';
//import _ from 'lodash';

const AlignList = [
  {
    id: 1,
    label: 'Left',
    icon: <AlignLeft />,
    value: {
      textAlign: 'left',
      justifyAlign: 'flex-start',
    },
  },
  {
    id: 2,
    label: 'Center',
    icon: <AlignCenter />,
    value: {
      textAlign: 'center',
      justifyAlign: 'center',
    },
  },
  {
    id: 3,
    label: 'Right',
    icon: <AlignRight />,
    value: {
      textAlign: 'right',
      justifyAlign: 'flex-end',
    },
  },
];

const WrapList = [
  {
    id: 1,
    label: 'Normal',
    icon: <WrapPre />,
    value: {
      justifyWrap: 'pre',
      wrapHeight: '40px',
    },
  },
  {
    id: 2,
    label: 'Wrap',
    icon: <WrapText />,
    value: {
      justifyWrap: 'normal',
      wrapHeight: '100px',
    },
  },
];
// const HideList = [
//     {
//         id: 1,
//         label: 'Show Empty Columns',
//         icon:<ShowColumnIcon />,
//         value: 'show',
//     },
//     {
//         id: 2,
//         label: 'Hide Empty Columns',
//         icon:<HideColumnIcon />,
//         value: 'hide'
//     },
// ];
class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: null,
      minCellWidth: 30,
      maxCellWidth: 1400,
      alignItem: {
        textAlign: 'left',
        justifyAlign: 'flex-start',
      },
      showAlign: false,
      showWrap: false,
      showHide: true,
      wrapItem: {
        justifyWrap: 'pre',
        wrapHeight: '40px',
      },
      optionRow: null,
      deleted: false,
      view: '',
      currentTour: '', // for current tour seen at a time
    };
    this.contentbox = React.createRef();
    this.dragline = React.createRef();
    this.tableElement = React.createRef();
  }

  UNSAFE_componentWillMount() {
    const {
      lineItemRows,
      documentActions,
      selectedSectionFieldId: parentId,
      docId,
      sectionField: { parentId: pid },
      setGridViewMode,
    } = this.props;
    documentActions.rtManageGridData({
      docId,
      parentId,
      pid,
      method: 'GET',
      gridViewEnable: () => setGridViewMode(true),
    });
    const {
      sectionField: { lineItemColumns },
    } = this.props;
    const column = lineItemColumns.map((column) => {
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
      initialLineItemRows: lineItemRows,
    });
  }

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

  componentDidMount() {
    this.dragElement(
      this.dragline.current,
      this.contentbox.current,
      this.addMixpanelEventForResizingFooter
    );
    const { gridView, lineItemRows } = this.props;
    const contentBox = this.contentbox.current;
    if (!gridView) {
      if (lineItemRows && lineItemRows.length >= 5) {
        contentBox.style.maxHeight = '400px';
        contentBox.style.height = '200px';
      }
    }
  }

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
          const width = col.ref.current.offsetWidth + difference;
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

  updateThePosition = () => {
    const { minCellWidth, column, maxCellWidth } = this.state;
    let gridColumns;

    gridColumns = column.map((col, i) => {
      const currentHead =
        document.getElementById(`{column-handler-${i}}`) || {};
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
    if (gridColumns) {
      this.setState(
        {
          gridColumns,
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
      lineItemRows,
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
      if (!_.isEmpty(lineItemRows) && !gridView) {
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

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { initialColumn } = this.state;
    const contentBox = this.contentbox.current;
    const { selectedSectionFieldId, lineItemRows } = nextProps;
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
          initialLineItemRows: lineItemRows,
        },
        () => this.updateThePosition()
      );
    }

    //if(!_.isEqual(lineItemRows, nextProps.lineItemRows)){
    if (
      selectedSectionFieldId === preSelectedSectionFieldId &&
      this.props.lineItemRows.length !== nextProps.lineItemRows.length
    ) {
      setTimeout(() => {
        this.setState(
          {
            initialLineItemRows: nextProps.lineItemRows,
            column: initialColumn,
            showHide: true,
          },
          () => this.updateThePosition()
        );
      }, 1000);

      if (lineItemRows && lineItemRows.length >= 5) {
        contentBox.style.maxHeight = '400px';
        contentBox.style.height = '200px';
      } else {
        contentBox.style.maxHeight = '200px';
        contentBox.style.height = 'auto';
      }
    }
    if (this.props.isCollapsed !== nextProps.isCollapsed) {
      this.setState(
        {
          initialLineItemRows: lineItemRows,
          column: initialColumn,
          showHide: true,
        },
        () => this.updateThePosition()
      );
    }
  }

  componentDidUpdate() {
    const { activeIndex } = this.state;
    if (activeIndex !== null) {
      document.addEventListener('mousemove', this.mouseMove);
      document.addEventListener('mouseup', this.mouseUp);
    } else {
      document.removeEventListener('mousemove', this.mouseMove);
      document.removeEventListener('mouseup', this.mouseUp);
    }

    this.triggerLineItemTour();
  }
  componentWillUnmount() {
    document.removeEventListener('mousemove', this.mouseMove);
    document.removeEventListener('mouseup', this.mouseUp);

    this.setState({ currentTour: '' });
  }

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
      let boxHeight = box.clientHeight;
      var finalHeight = boxHeight - top;
      box.style.height = `${finalHeight}px`;

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
    const { lineItemRows } = this.props;
    const contentBox = this.contentbox.current;
    if (contentBox && contentBox?.clientHeight < 140) {
      contentBox.style.height =
        Number(contentBox?.clientHeight) + Number(child?.offsetHeight) + 'px';
    }
  };

  adjustScrollOnTable = (id) => {
    const tableBox = this.tableElement.current;
    const contentBox = this.contentbox.current;
    const { lineItemRows } = this.props;
    let secondLastItemRow = lineItemRows[lineItemRows.length - 2];
    let lastItemRow = lineItemRows[lineItemRows.length - 1];
    let fieldIds = [];
    if (secondLastItemRow) {
      fieldIds = [...secondLastItemRow.fieldIds, ...lastItemRow.fieldIds];
    } else {
      fieldIds = [...lastItemRow.fieldIds];
    }
    if (fieldIds.includes(id)) {
      if (contentBox) {
        setTimeout(() => {
          tableBox.scrollTop = tableBox.scrollHeight + 100;
        }, 0);
      }
    }
  };
  handleAddLineBtnClick = () => {
    const {
      gridView,
      lineItemRows,
      sectionFieldId,
      handleDelayedTableTracking,
    } = this.props;
    const contentBox = this.contentbox.current;

    if (gridView) {
      if (lineItemRows && lineItemRows.length >= 5) {
        contentBox.style.maxHeight = '400px';
        contentBox.style.height = '200px';
      } else {
        contentBox.style.maxHeight = '200px';
        contentBox.style.height = 'auto';
      }
    }
    this.props.onAddLineBtnClick({
      sectionFieldId: this.props.sectionFieldId,
    });
    handleDelayedTableTracking({
      name: sectionFieldId,
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
    const {
      handleDelayedTableTracking,
      selectedSectionFieldId,
      lineItemRows,
      fieldsById,
    } = this.props;

    handleDelayedTableTracking({
      name: selectedSectionFieldId,
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
    const { sectionFieldId, lineItemRows } = this.props;

    const rowIds = [];
    const rowFieldIds = [];
    lineItemRows.forEach((lineItemRow) => {
      const { id, fieldIds } = lineItemRow;
      rowIds.push(id);
      fieldIds.forEach((fieldId) => {
        rowFieldIds.push(fieldId);
      });
    });

    this.props.onDeleteAllRowsBtnClick({
      sectionFieldId,
      rowIds,
      rowFieldIds,
    });
  };

  handleDeleteRowBtnClick = ({ id, fieldIds }) => {
    const {
      handleTableTracking,
      selectedSectionFieldId,
      fieldsById,
      lineItemRows,
    } = this.props;

    this.setState({
      deleted: true,
    });
    try {
      this.props.onDeleteRowBtnClick({
        sectionFieldId: this.props.sectionFieldId,
        rowId: id,
        rowFieldIds: fieldIds,
      });
    } catch (e) {
      //do nothing
    } finally {
      setTimeout(() => {
        this.setState({
          deleted: false,
        });

        const tableAfterRowDelete = lineItemRows.map((lineItem) =>
          lineItem.fieldIds.map((id) => fieldsById[id])
        );

        handleTableTracking({
          name: selectedSectionFieldId,
          key: TABLE_TRACKING_KEYS.tableLineItem,
          action: TRACKING_HELPER_KEYS.deleted,
          tableValue: tableAfterRowDelete,
        });
      }, 1000);
    }
  };

  mouseDown = (e, i) => {
    e.preventDefault();
    this.setState({
      activeIndex: i,
      position: e.clientX,
    });
  };

  renderRows = () => {
    const {
      docReadOnly,
      lineItemRows,
      selectedLineItemRowId,
      onReadOnlyLineFieldClick,
      onLineFieldInputFocus,
      onLineFieldInputValueChange,
      onLineFieldInputSubmit,
      sectionField,
      isCollapsed,
      fieldsById,
    } = this.props;
    const {
      column,
      alignItem,
      wrapItem,
      optionRow,
      deleted,
      initialLineItemRows,
    } = this.state;
    const rowNodes = initialLineItemRows.map((row, index) => {
      const { id } = row;

      return (
        <LineItemRow
          key={id}
          rowCount={index + 1}
          docReadOnly={docReadOnly}
          row={row}
          isSelected={id === selectedLineItemRowId}
          onDeleteBtnClick={this.handleDeleteRowBtnClick}
          onReadOnlyLineFieldClick={onReadOnlyLineFieldClick}
          onLineFieldInputFocus={onLineFieldInputFocus}
          onLineFieldInputValueChange={onLineFieldInputValueChange}
          onLineFieldInputSubmit={onLineFieldInputSubmit}
          sectionField={sectionField}
          isCollapsed={isCollapsed}
          column={column}
          alignItem={alignItem}
          wrapItem={wrapItem}
          lineItemRows={lineItemRows}
          optionRow={optionRow}
          deleted={deleted}
          handleOptionRow={this.handleOptionRow}
          outsideRowOptionClick={this.outsideRowOptionClick}
          handleRowOptionAddLineBtnClick={this.handleRowOptionAddLineBtnClick}
          fieldsById={fieldsById}
          adjustTableContentHeight={this.adjustTableContentHeight}
          adjustScrollOnTable={this.adjustScrollOnTable}
        />
      );
    });

    return rowNodes;
  };
  handleSelectAlign = (value) => {
    this.setState({
      alignItem: value,
      showAlign: false,
    });
  };
  handleSelectWrap = (value) => {
    this.setState({
      wrapItem: value,
      showWrap: false,
    });
  };
  handleSpreadsheetView = () => {
    const { documentActions } = this.props;
    documentActions.handleSpreadsheetView({ openSpreadsheetView: true });
  };

  handleSelectColumn = (value) => {
    // if(this.state.view === value){
    //     return ;
    // }
    // this.setState({
    //     showHide: false,
    //     view: value,
    // });
    const { fieldId, gridHeadersById, sectionFieldId, lineItemRows } =
      this.props;
    const { initialLineItemRows, column, initialColumn } = this.state;

    if (value) {
      this.setState(
        {
          initialLineItemRows: lineItemRows,
          column: initialColumn,
          showHide: value,
        },
        () => this.updateThePosition()
      );
    } else {
      let header = gridHeadersById[sectionFieldId];
      let headLength = header.length;
      let nonEmptyHeader = [];
      let nonEmptyId = [];
      const { children } = fieldId;
      let childLength = children.length;
      if (childLength > 1) {
        for (let i = 0; i < headLength; i++) {
          for (let j = 1; j < childLength; j++) {
            if (
              children[j] &&
              children[j][i] &&
              children[j][i].label === header[i]
            ) {
              if (
                children[j] &&
                children[j][i] &&
                children[j][i].content.value !== ''
              ) {
                nonEmptyHeader.push(header[i]);
                break;
              }
            }
          }
        }
      }

      if (childLength > 1) {
        for (let i = 0; i < headLength; i++) {
          for (let j = 1; j < childLength; j++) {
            if (
              nonEmptyHeader.includes(
                children[j] && children[j][i] && children[j][i].label
              )
            ) {
              nonEmptyId.push(
                children[j] && children[j][i] && children[j][i].id
              );
            }
          }
        }
      }
      let emptyHeader = header.filter((head) => !nonEmptyHeader.includes(head));
      let hiddenColumns = column.filter((c) => !emptyHeader.includes(c.column));
      const newInitialLineItemRows = initialLineItemRows.map((row) => {
        return {
          ...row,
          fieldIds: row.fieldIds.filter((fid) => nonEmptyId.includes(fid)),
        };
      });
      this.setState(
        {
          initialLineItemRows: newInitialLineItemRows,
          column: hiddenColumns,
          showHide: value,
        },
        () => this.updateThePosition()
      );
    }
    this.mixpanelTracking(MIXPANEL_EVENTS.show_hide_btn_click);
  };

  onOutsideClick = () => {
    this.setState({
      showAlign: false,
      showWrap: false,
    });
  };

  render() {
    const {
      docReadOnly,
      sectionField,
      sectionFieldId,
      lineItemRows,
      isDeletingAllRows,
      handleGridView,
      isCollapsed,
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
    } = this.props;
    const {
      activeIndex,
      column,
      alignItem,
      showAlign,
      showWrap,
      wrapItem,
      showHide,
    } = this.state;
    const {
      //lineItemColumns,
      isAddingNewLine,
      isAddingSimilarLines,
    } = sectionField;
    const rowCount = lineItemRows.length;
    const showAddLineBtn = !docReadOnly;
    /* const showAddSimilarlinesBtn = !docReadOnly && rowCount > 0; */
    const showDeleteAllRowsBtn = !docReadOnly && rowCount > 0;

    const disableFoterBtn =
      isAddingNewLine ||
      isAddingSimilarLines ||
      isDeletingAllRows ||
      isAddingLineFront;

    const disableAddNewLineBtn = disableFoterBtn;
    /* const disableAddSimilarLinesBtn = disableFoterBtn; */
    const disableDeleteAllRowsBtn = disableFoterBtn;
    // let inputStyle = {
    //     width: '185px'
    // };
    // let nonInputStyle = {
    //     width: '90px'
    // };
    return (
      <div className={styles.wrapper}>
        <div className={styles.drag} ref={this.dragline}>
          <span />
          <span />
        </div>
        <div className={styles.root}>
          {!gridView ? null : (
            <GridFooter
              handleClose={handleClose}
              extractData={extractData}
              handleCloseGrid={handleCloseGrid}
              grids={grids}
              currentPage={currentPage}
              docId={docId}
              parentId={sectionFieldId}
              docMeta={docMeta}
              user={user}
            />
          )}

          <div
            className={cx(styles.tableSettings, 'UFTableSettings', {
              [styles.extendTableHeader]: isCollapsed,
            })}
          >
            <div
              className={styles.viewAlign}
              onClick={() => {
                this.setState({
                  showAlign: !this.state.showAlign,
                });
                this.mixpanelTracking(MIXPANEL_EVENTS.table_align_btn_click);
              }}
            >
              <div title={'Text Align'} className={styles.icon}>
                {alignItem.textAlign === 'left' ? (
                  <AlignLeft className={styles.alignIcon} />
                ) : alignItem.textAlign === 'center' ? (
                  <AlignCenter className={styles.alignIcon} />
                ) : alignItem.textAlign === 'right' ? (
                  <AlignRight className={styles.alignIcon} />
                ) : (
                  <AlignJustify className={styles.alignIcon} />
                )}
                <NavArrowDown className={styles.dropIcon} />
              </div>
              {showAlign ? (
                <OutsideClickHandler onOutsideClick={this.onOutsideClick}>
                  <div className={styles.dropdownBox}>
                    {AlignList.map((item) => {
                      return (
                        <Tooltip label={item.label} key={item.id}>
                          <div
                            className={cx('unstyled-btn', styles.link, {
                              [styles.isSelected]:
                                item.value.textAlign === alignItem.textAlign,
                            })}
                            onClick={() => this.handleSelectAlign(item.value)}
                          >
                            <p className={styles.icon}>{item.icon}</p>
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                </OutsideClickHandler>
              ) : null}
            </div>
            <div
              className={styles.viewWrap}
              onClick={() => {
                this.setState({
                  showWrap: !this.state.showWrap,
                });
                this.mixpanelTracking(MIXPANEL_EVENTS.table_wrap_btn_click);
              }}
            >
              <div title={'Text Wrap'} className={styles.icon}>
                {wrapItem.justifyWrap === 'pre' ? (
                  <WrapPre className={styles.wrapIcon} />
                ) : wrapItem.justifyWrap === 'normal' ? (
                  <WrapText className={styles.wrapIcon} />
                ) : (
                  <WrapPre className={styles.wrapIcon} />
                )}
                <NavArrowDown className={styles.dropIcon} />
              </div>
              {showWrap ? (
                <OutsideClickHandler onOutsideClick={this.onOutsideClick}>
                  <div className={styles.dropdownBox}>
                    {WrapList.map((item) => {
                      return (
                        <Tooltip key={item.id} label={item.label}>
                          <div
                            className={cx('unstyled-btn', styles.link, {
                              [styles.isSelected]:
                                item.value.justifyWrap === wrapItem.justifyWrap,
                            })}
                            onClick={() => this.handleSelectWrap(item.value)}
                          >
                            <p className={styles.icon}>{item.icon}</p>
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                </OutsideClickHandler>
              ) : null}
            </div>
            <div onClick={() => this.handleSelectColumn(!this.state.showHide)}>
              <Tooltip
                label={showHide ? 'Hide Empty Column' : 'Show Empty Column'}
              >
                <IconButton
                  icon={showHide ? <EyeOff /> : <EyeEmpty />}
                  variant='text'
                />
              </Tooltip>
            </div>
          </div>
          <div className={styles.table} ref={this.tableElement}>
            <div
              className={cx(styles.tableHeader, {
                [styles.extendTableHeader]: isCollapsed,
              })}
            >
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
                  >
                    {column}
                    <span
                      style={{ height: '40px' }}
                      id={`{column-handler-${i}}`}
                      onMouseDown={(e) => this.mouseDown(e, i)}
                      className={cx(styles.resizeHandle, {
                        [styles.active]: activeIndex === i,
                      })}
                    />
                  </p>
                );
              })}
              {/* { !docReadOnly ? (
                            <p className={cx(styles.item, styles.deleteCol)}></p>
                        ) : null } */}
            </div>
            <div
              className={cx(styles.tableContent, {
                [styles.gridView]: gridView,
              })}
              style={{
                height: 'auto',
              }}
              ref={this.contentbox}
            >
              {this.renderRows()}
            </div>
          </div>
        </div>

        <div className={styles.btnsContainer}>
          {showAddLineBtn ? (
            <Tooltip
              label={'Add line to the line item above'}
              placement={'top'}
            >
              <Button
                id={`footer-add-line-btn-${sectionFieldId}`}
                icon={Plus}
                isLoading={isAddingNewLine}
                disabled={disableAddNewLineBtn}
                onClick={this.handleAddLineBtnClick}
                variant='outlined'
                size='small'
              >
                Add Line
              </Button>
            </Tooltip>
          ) : null}

          {showDeleteAllRowsBtn ? (
            <Tooltip
              className='ml-5'
              label={'Delete all the row/line of line item'}
              placement={'top'}
            >
              <Button
                id={`footer-delete-all-rows-btn-${sectionFieldId}`}
                icon={Trash}
                className={styles.btnDanger}
                isLoading={isDeletingAllRows}
                disabled={disableDeleteAllRowsBtn}
                onClick={this.handleDeleteAllRowsBtnClick}
                variant='outlined'
                size='small'
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
    deletingLineItemFieldIds,
    gridHeadersById,
    gridFetching,
  } = state.documents.reviewTool;
  const { config } = state.app;

  const sectionField = fieldsById[sectionFieldId];
  const isSectionFieldSelected = sectionFieldId === selectedSectionFieldId;

  let allFieldIds = [];
  const lineItemRows = sectionField.lineItemRowIds.map((rowId) => {
    const row = lineItemRowsById[rowId];
    allFieldIds = [...allFieldIds, ...row.fieldIds];
    const rowFieldIdsBeingDeleted = row.fieldIds.filter((fieldId) =>
      deletingLineItemFieldIds.includes(fieldId)
    );
    row.isDeletingRow = !!rowFieldIdsBeingDeleted.length;
    return lineItemRowsById[rowId];
  });

  const countRowsBeingDeleted = lineItemRows.filter(
    (row) => row.isDeletingRow
  ).length;
  const isDeletingAllRows =
    countRowsBeingDeleted && countRowsBeingDeleted === lineItemRows.length
      ? true
      : false;

  return {
    docId,
    sectionFieldId,
    sectionField,
    lineItemRows,
    isSectionFieldSelected,
    selectedSectionFieldId,
    selectedLineItemRowId,
    selectedFieldId,
    isDeletingAllRows,
    lineItemRowsById,
    gridHeadersById,
    fieldsById,
    config,
    gridFetching,
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
