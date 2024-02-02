import React from 'react';
import { connect } from 'react-redux';
import { actions as documentActions } from 'new/redux/documents/actions';
import { showToast } from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { EditPencil, Plus } from 'iconoir-react';
import _ from 'lodash';
import { WithTrackingContext } from 'new/components/contexts/tracking';
import {
  TABLE_TRACKING_KEYS,
  TRACKING_HELPER_KEYS,
} from 'new/components/contexts/trackingConstants';
import { HelpTooltip } from 'new/components/widgets/tooltip';
import ttConstants from 'new/constants/helpTooltips';
import { computePRPosition } from 'new/helpers/documents';
import {
  CHAMELEON_TOUR_TYPES,
  chameleonTriggerTour,
  CHAMLEON_TOUR_IDS,
} from 'new/thirdParty/chameleon';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import IconButton, { SIZE } from 'new/ui-elements/IconButton/IconButton';
import {
  customMixpanelTracking,
  mixpanelTrackingAllEvents,
} from 'new/utils/mixpanel';

import BottomEdge from './Grid/bottomEdge';
import ColDivider from './Grid/ColDivider';
import GridEdgeResizer from './Grid/GridEdgeResizer';
import GridResizer from './Grid/GridResizer';
import LeftEdge from './Grid/LeftEdge';
import RightEdge from './Grid/RightEdge';
import RowDivider from './Grid/RowDivider';
import TopEdge from './Grid/topEdge';

import styles from './GridRegion.scss';

const BASE_GRID_WIDTH_PERCENTAGE = 65;

class GridRegion extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      style: {},
      rows: [],
      cols: [],
      onChanging: false,
      mounted: false,
      isHeaderSelected: false,
      showApplyChangesTour: true,
      showEditBtn: false,
    };
    this.refTopLeftArrow = React.createRef();
    this.refGrid = React.createRef();
    this.columnIndRef = React.createRef();
    this.rowIndRef = React.createRef();
    this.colGridLine = React.createRef();
    this.rowGridLine = React.createRef();
    this.columnLineTimeOut = null;
    this.rowLineTimeOut = null;
  }

  getPositions = async (data) => {
    if (this.props.position) {
      const [x1, y1, x2, y2] = this.props.position;
      const [dx1, dy1, dx2, dy2] = data && data.position ? data.position : [];

      const { docMeta, gridView } = this.props;

      const {
        // status: docStatus,
        width: docWidth,
        height: docHeight,
      } = docMeta;

      const XD1 = ((dx1 || x1) / docWidth) * 100;
      const YD1 = ((dy1 || y1) / docHeight) * 100;
      const XD2 = ((dx2 || x2) / docWidth) * 100;
      const YD2 = ((dy2 || y2) / docHeight) * 100;

      const top = _.round(YD1, 4);
      const left = _.round(XD1, 4);
      const width = _.round(XD2 - XD1, 4);
      const height = _.round(YD2 - YD1, 4);

      const style = {
        top: `${top}%`,
        left: `${left}%`,
        width: `${width}%`,
        height: `${height}%`,
      };

      if (this.refGrid && this.refGrid.current) {
        this.refGrid.current.style.top = style.top;
        this.refGrid.current.style.left = style.left;
        this.refGrid.current.style.width = style.width;
        this.refGrid.current.style.height = style.height;
      }

      if (this.btnGrid && this.btnGrid.current) {
        this.btnGrid.current.style.top = style.top;
        this.btnGrid.current.style.left = `${XD2}%`;
        this.btnGrid.current.style.marginLeft = '5px';
      }

      this.setState({
        style: {
          top,
          left,
          width,
          height,
        },
      });
    }
  };

  handleMouseEnter = (e) => {
    this.setState({ showEditBtn: true });
  };

  handleMouseLeave = (e) => {
    const { x, y, height, width } = e.target.getBoundingClientRect();
    const mouseLeavePosX = e.pageX;
    const mouseLeavePosY = e.pageY;

    const xStart = x;
    const yStart = y;
    const xEnd = xStart + width;
    const yEnd = yStart + height;

    if (
      mouseLeavePosX >= xStart &&
      mouseLeavePosX <= xEnd &&
      mouseLeavePosY >= yStart &&
      mouseLeavePosY <= yEnd
    ) {
      this.setState({ showEditBtn: true });
    } else {
      this.setState({ showEditBtn: false });
    }
  };

  convertTopToPerc = (top) => {
    let { topLeft, bottomRight } = this.props.grid;
    const height = bottomRight[1] - topLeft[1];
    const gridHeight =
      this.refGrid && this.refGrid.current
        ? this.refGrid.current.clientHeight
        : height;

    // get percentage of row as per grid
    const YD1 = ((top - topLeft[1]) / height) * 100;

    //get pixle value of row as per grid
    const px = (gridHeight * YD1) / 100;

    return px;
  };

  convetPrecToTop = (top, grid) => {
    let { topLeft, bottomRight } = grid || this.props.grid;
    const gridHeight =
      this.refGrid.current && this.refGrid.current.clientHeight;
    const height = bottomRight[1] - topLeft[1];

    const pr = (top * 100) / gridHeight;
    const YD1 = (pr / 100) * height + topLeft[1];
    return YD1;
  };

  convertLeftToPerc = (left) => {
    let { topLeft, bottomRight } = this.props.grid;
    const width = bottomRight[0] - topLeft[0];
    const gridWidth =
      this.refGrid && this.refGrid.current
        ? this.refGrid.current.clientWidth
        : width;
    const YD1 = ((left - topLeft[0]) / width) * 100;
    const px = (gridWidth * YD1) / 100;

    return px;
  };

  convetPrecToLeft = (left, grid) => {
    let { topLeft, bottomRight } = grid || this.props.grid;
    const gridWidth =
      this.refGrid && this.refGrid.current && this.refGrid.current.clientWidth;
    const width = bottomRight[0] - topLeft[0];

    const pr = (left * 100) / gridWidth;
    const YD1 = (pr / 100) * width + topLeft[0];
    return YD1;
  };

  handleRemoveCol = (position) => {
    const { selectedSectionFieldId, handleTableTracking } = this.props;
    let { cols } = this.state;
    _.remove(cols, function (e) {
      return e.position === position;
    });

    this.handleSetCol(
      cols,
      true,
      TABLE_TRACKING_KEYS.tableColumn,
      TRACKING_HELPER_KEYS.deleted
    );

    this.mixPanelTracking(MIXPANEL_EVENTS.delete_column);
    document.activeCol = null;
  };

  handleChangeHeader = (header, index) => {
    const { cols } = this.state;
    const { sortedColumnOptions, documentActions } = this.props;
    const prevHeader = cols[index]?.header;

    let trackingAction = '';
    if (header) {
      if (prevHeader) {
        trackingAction = TRACKING_HELPER_KEYS.updated;
      } else {
        trackingAction = TRACKING_HELPER_KEYS.added;
      }
    } else {
      trackingAction = TRACKING_HELPER_KEYS.deleted;
    }
    this.setState({ trackingPreviousHeader: header });

    mixpanelTrackingAllEvents(MIXPANEL_EVENTS.gridmap_column_name);

    const data = {
      ...cols[index],
      header,
    };
    const result = cols.map(({ header: colHeader, ...rest }, colIndex) => {
      return colIndex === index
        ? data
        : {
            ...rest,
            header: colHeader === header ? '' : colHeader,
          };
    });

    documentActions.rtDropdownSortWithGridHeader({
      sortedOptions: [
        ...sortedColumnOptions.filter((item) => item !== header),
        header,
      ],
    });
    this.handleSetCol(
      result,
      true,
      TABLE_TRACKING_KEYS.tableHeader,
      trackingAction
    );
  };

  handleHeaderTrackingDataTrigger = ({ key, action }) => {
    const { selectedSectionFieldId, handleTableTracking, grids, fieldsById } =
      this.props;
    handleTableTracking({
      name: selectedSectionFieldId,
      fieldLabel: fieldsById[selectedSectionFieldId]?.label,
      key,
      action,
      gridValue: this.gridTrackingAppendGrid(this.getGrid()),
    });
  };

  gridTrackingAppendGrid = (data) => {
    const { grids, index } = this.props;
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
    return newGrid;
  };

  handleRemoveRow = (position) => {
    const {
      selectedSectionFieldId: parentId,

      handleTableTracking,
    } = this.props;

    let { rows } = this.state;
    _.remove(rows, function (e) {
      return e.position === position;
    });
    this.handleSetRow(
      rows,
      true,
      TABLE_TRACKING_KEYS.tableRow,
      TRACKING_HELPER_KEYS.deleted
    );
    document.activeRow = null;
  };

  mixPanelTracking = (evtName) => {
    const {
      config: { accountType = '', canSwitchToOldMode = true },
      user: { email = '', role = '', companyName = '' },
      docMeta: { docId = '', title = '', type = '' },
    } = this.props;
    customMixpanelTracking(evtName, {
      docId: docId,
      label: title,
      docType: type,
      email: email,
      plan: accountType,
      canSwitchUIVersion: canSwitchToOldMode,
      role,
      companyName,
    });
  };

  trackGridResize = () => {
    const { selectedSectionFieldId, handleTableTracking, fieldsById } =
      this.props;
    handleTableTracking({
      name: selectedSectionFieldId,
      fieldLabel: fieldsById[selectedSectionFieldId]?.label,
      key: TABLE_TRACKING_KEYS.tableGrid,
      action: TRACKING_HELPER_KEYS.resized,
      gridValue: this.gridTrackingAppendGrid(this.getGrid()),
    });
  };

  columnSelector = (e) => {
    const { handleTableTracking, selectedSectionFieldId } = this.props;
    let { cols } = this.state;
    const { activeCol } = document;
    const absoluteCol =
      cols[0] && activeCol ? activeCol.position === cols[0].position : false;
    if (!absoluteCol && !activeCol) {
      const { x } = this.columnIndRef.current.getBoundingClientRect();
      const pointX = e.clientX - x;
      const position = pointX;
      cols = [...cols, { position, header: '', orig_header: '' }];
      this.handleSetCol(
        cols,
        true,
        TABLE_TRACKING_KEYS.tableColumn,
        TRACKING_HELPER_KEYS.added
      );
    }
  };

  rowSelector = (e) => {
    const { handleTableTracking, selectedSectionFieldId } = this.props;
    let { rows } = this.state;
    const { activeRow } = document;
    const absoluteRow =
      rows[0] && activeRow ? activeRow.position === rows[0].position : false;
    if (!absoluteRow && !activeRow) {
      const { y } = this.rowIndRef.current.getBoundingClientRect();
      const pointY = e.clientY - y;
      const position = pointY;
      rows = [...rows, { position, ignore: false }];
      this.handleSetRow(
        rows,
        true,
        TABLE_TRACKING_KEYS.tableRow,
        TRACKING_HELPER_KEYS.added
      );
    }
  };

  handleSetRow = (rows, callback, trackingKey, trackingAction = false) => {
    const shortedRows = _.sortBy(rows, 'position');

    this.setState(
      {
        rows: shortedRows,
      },
      () => {
        if (callback) {
          this.handleGridSubmit('setRow, update ignore');
          if (trackingAction)
            this.handleHeaderTrackingDataTrigger({
              key: trackingKey,
              action: trackingAction,
            });
        }
      }
    );
  };

  handleSetCol = (cols, callback, trackingKey, trackingAction = false) => {
    this.setState(
      {
        cols,
      },
      () => {
        if (callback) {
          this.handleGridSubmit('setCols, update ignore');
          if (trackingAction)
            this.handleHeaderTrackingDataTrigger({
              key: trackingKey,
              action: trackingAction,
            });
        }
      }
    );
  };

  columnLineHover = async (e) => {
    e.preventDefault();
    if (this.columnLineTimeOut) {
      clearTimeout(this.columnLineTimeOut);
    }
    const { x, width } = this.columnIndRef.current.getBoundingClientRect();
    const pointX = e.clientX - x;
    let position = pointX;
    if (position > width) {
      return;
    }
    this.colGridLine.current.style.left = `${position}px`;
    this.colGridLine.current.style.opacity = 1;
    this.rowGridLine.current.style.opacity = 0;

    const { cols } = this.state;

    let closeEle = null;
    const closest =
      cols && cols.length
        ? cols.reduce(function (prev, curr) {
            return Math.abs(curr.position - position) <
              Math.abs(prev.position - position)
              ? curr
              : prev;
          })
        : null;

    if (closest) {
      const distance = Math.abs(closest.position - position);
      if (distance < 1.5) {
        closeEle = closest;
        this.colGridLine.current.style.left = `${closest.position}px`;
      }
    }

    document.activeCol = closeEle ? closeEle : null;

    this.columnLineTimeOut = setTimeout(() => {
      this.colGridLine.current
        ? (this.colGridLine.current.style.opacity = 1)
        : '';
    }, 50);
  };

  columnLineHoverOut = async (e) => {
    e.preventDefault();
    if (this.columnLineTimeOut) {
      clearTimeout(this.columnLineTimeOut);
    }
    this.columnLineTimeOut = setTimeout(() => {
      this.colGridLine.current
        ? (this.colGridLine.current.style.opacity = 0)
        : '';
    }, 50);
  };

  rowLineHover = async (e) => {
    e.preventDefault();
    if (this.rowLineTimeOut) {
      clearTimeout(this.rowLineTimeOut);
    }
    const { y, height } = this.rowIndRef.current.getBoundingClientRect();
    const pointY = e.clientY - y;
    const position = pointY;
    if (position > height) {
      return;
    }
    this.rowGridLine.current.style.top = `${position}px`;
    this.rowGridLine.current.style.opacity = 1;
    this.colGridLine.current.style.opacity = 0;
    const { rows } = this.state;

    let closeEle = null;
    const closest =
      rows && rows.length
        ? rows.reduce(function (prev, curr) {
            return Math.abs(curr.position - position) <
              Math.abs(prev.position - position)
              ? curr
              : prev;
          })
        : null;

    if (closest) {
      const distance = Math.abs(closest.position - position);
      if (distance < 1.5) {
        closeEle = closest;
        this.rowGridLine.current.style.top = `${closest.position}px`;
      }
    }

    document.activeRow = closeEle ? closeEle : null;
  };

  rowLineHoverOut = async (e) => {
    e.preventDefault();
    if (this.rowLineTimeOut) {
      clearTimeout(this.rowLineTimeOut);
    }
    this.rowLineTimeOut = setTimeout(() => {
      this.rowGridLine.current
        ? (this.rowGridLine.current.style.opacity = 0)
        : '';
    }, 50);
  };

  updateRowPosition = (position, index) => {
    const { rows } = this.state;
    const data = {
      ...rows[index],
      position,
    };
    rows.splice(index, 1, data);
    this.handleSetRow(rows, true);
  };

  updateRowPositionTopEdge = (difference) => {
    const { rows } = this.state;
    const newRows = rows.map((row) => {
      if (row.id === 0) {
        return row;
      } else if (row.id !== 0) {
        return { ...row, position: row.position - difference };
      }
    });
    this.handleSetRow(newRows);
  };

  uploadeRowStatus = (ignore, index) => {
    const { rows } = this.state;
    const data = {
      ...rows[index],
      ignore,
    };
    rows.splice(index, 1, data);
    this.handleSetRow(rows, true);
  };

  updateColPosition = (position, index) => {
    const { cols } = this.state;
    const data = {
      ...cols[index],
      position,
    };
    cols.splice(index, 1, data);
    this.handleSetCol(cols, true);
  };

  updateColPositionLeftEdge = (difference) => {
    const { cols } = this.state;
    const newCols = cols.map((col) => {
      if (col.position === 0) {
        return col;
      } else if (col.id !== 0) {
        return { ...col, position: col.position - difference };
      }
    });
    this.handleSetCol(newCols);
  };

  handleGridSubmit = async () => {
    const { grid, index, handleGridSubmit, handleDragging } = this.props;
    const { page } = grid;

    const gridEle =
      document.getElementById(`grid-table-layout-${page}-${index}`) || {};

    const newGrid = this.getGrid();

    if (gridEle) {
      handleGridSubmit(newGrid);
      handleDragging(false);
    }
  };

  getGrid = () => {
    let { grid, docMeta, index } = this.props;
    const { page } = grid;

    const gridEle =
      document.getElementById(`grid-table-layout-${page}-${index}`) || {};
    let { top = '', left = '', width = '', height = '' } = gridEle.style || {};

    const { width: docWidth, height: docHeight } = docMeta;

    const data = {
      top: parseFloat(top),
      left: parseFloat(left),
      width: parseFloat(width),
      height: parseFloat(height),
      docWidth,
      docHeight,
    };

    const [x1, y1, x2, y2] = computePRPosition(data);
    grid = {
      ...grid,
      topLeft: [x1, y1],
      bottomRight: [x2, y2],
    };
    let { rows, cols } = this.state;
    rows = rows.map(({ position, ...rest }) => ({
      ...rest,
      y: this.convetPrecToTop(position, grid),
    }));
    cols = cols.map(({ position, ...rest }) => ({
      ...rest,
      x: this.convetPrecToLeft(position, grid),
    }));
    grid = {
      ...grid,
      columns: [...cols],
      rows: [...rows],
    };
    return grid;
  };

  onHeightUpdate = (diffrence) => {
    const {
      grid: { page },
      index,
    } = this.props;
    const lastRow =
      document.getElementById(
        `grid-layout-last-row-conatiner-${page}-${index}`
      ) || {};
    if (diffrence && lastRow && lastRow.style) {
      //update last row height as grid height changes
      if (this.state.rows.length === 1) {
        lastRow.style.height = '100%';
      } else {
        lastRow.style.height = `${lastRow.clientHeight - diffrence}px`;
      }
    }

    //remove row who's under the grid height
    let { rows } = this.state;

    const gridEle =
      document.getElementById(`grid-table-layout-${page}-${index}`) || {};
    const deletionRows = rows.filter(
      ({ position }) => position > gridEle.clientHeight
    );
    _.map(deletionRows, ({ position }) => this.handleRemoveRow(position));
  };

  onWidthUpdate = () => {
    //remove column who's under the grid width
    let { cols } = this.state;
    const {
      grid: { page },
      index,
    } = this.props;
    const gridEle = document.getElementById(
      `grid-table-layout-${page}-${index}`
    );
    const deletionCols = cols.filter(
      ({ position }) => position > gridEle?.clientWidth
    );
    _.map(deletionCols, ({ position }) => this.handleRemoveCol(position));
  };

  selectHeader = (isHeaderSelected, index) => {
    const { rows } = this.state;
    const { gridView, docReadOnly } = this.props;

    if (gridView) {
      this.setState({
        isHeaderSelected,
      });
      const data = {
        ...rows[index],
        header: isHeaderSelected,
        ignore: isHeaderSelected,
      };
      rows.splice(index, 1, data);
      this.handleSetRow(rows, true);
    } else {
      const message = docReadOnly
        ? 'Cannot assign header in view only mode.'
        : 'Please click on the Edit button to assign header.';
      showToast({
        title: message,
        info: true,
      });
    }
  };

  async SetGrids() {
    //get grid position
    await this.getPositions();

    // Convert rows and cols position into percentage and set it into state
    let { rows, columns: cols, page } = this.props.grid;
    rows = rows.map((e) => ({
      ...e,
      position: this.convertTopToPerc(e.y),
    }));

    if (rows[0] && rows[0].header) {
      this.setState({
        isHeaderSelected: true,
      });
    }

    cols = cols.map((e) => ({
      ...e,
      position: this.convertLeftToPerc(e.x),
    }));
    await this.handleSetRow(rows);
    await this.setState({
      cols,
      mounted: true,
    });
    const { gridView, index } = this.props;
    if (gridView) {
      //Added listner for column and row indicator's grid line.
      const columnLine = document.getElementById(
        `grid-column-line-indicator-${page}-${index}`
      );
      const rowLine = document.getElementById(
        `grid-row-line-indicator-${page}-${index}`
      );
      columnLine &&
        columnLine.addEventListener('mousemove', this.columnLineHover);
      this.colGridLine.current &&
        this.colGridLine.current.addEventListener(
          'mouseover',
          this.columnLineHover
        );
      this.colGridLine.current &&
        this.colGridLine.current.addEventListener(
          'mouseout',
          this.columnLineHoverOut
        );
      columnLine &&
        columnLine.addEventListener('mouseout', this.columnLineHoverOut);
      rowLine && rowLine.addEventListener('mousemove', this.rowLineHover);
      this.rowGridLine.current &&
        this.rowGridLine.current.addEventListener(
          'mouseover',
          this.rowLineHover
        );
      this.rowGridLine.current &&
        this.rowGridLine.current.addEventListener(
          'mouseout',
          this.rowLineHoverOut
        );
      rowLine && rowLine.addEventListener('mouseout', this.rowLineHoverOut);

      //Add click listner for column and row line
      this.colGridLine.current &&
        this.colGridLine.current.addEventListener('click', this.columnSelector);
      this.rowGridLine.current &&
        this.rowGridLine.current.addEventListener('click', this.rowSelector);
    }
  }

  componentDidMount() {
    this.SetGrids();
    this.props.documentActions.rtDropdownSortWithGridHeader({
      sortedOptions: this.props.gridHeaders || [],
    });
  }

  componentDidUpdate(prevProps) {
    const { rows, cols, showApplyChangesTour } = this.state;
    const { zoom, updatedRow, gridView, addMixpanelTrackingForTours, grids } =
      this.props;
    const {
      zoom: prevZoom,
      updatedRow: prevUpdatedRow,
      grids: prevGrids,
    } = prevProps;

    const updatePosition = (position) => {
      return (zoom * position) / prevZoom;
    };

    if (zoom !== prevZoom) {
      const newRows = _.map(rows, (e) => ({
        ...e,
        position: updatePosition(e.position),
      }));
      const newCols = _.map(cols, (e) => ({
        ...e,
        position: updatePosition(e.position),
      }));
      this.setState({
        rows: newRows,
        cols: newCols,
      });
    }

    if (updatedRow !== prevUpdatedRow) {
      this.SetGrids();
    }
    if (prevProps.grid !== this.props.grid) {
      this.SetGrids();
    }

    if (prevGrids?.length !== grids?.length && this.refGrid?.current) {
      this.refGrid.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }

    if (!_.isEmpty(cols)) {
      const appliedColsList = cols.filter((i) => !_.isEmpty(i.header));

      if (
        appliedColsList.length === cols.length &&
        showApplyChangesTour &&
        gridView
      ) {
        chameleonTriggerTour(
          CHAMLEON_TOUR_IDS.reviewScreenPhase4,
          CHAMELEON_TOUR_TYPES.reviewScreenPhase4,
          () =>
            addMixpanelTrackingForTours(MIXPANEL_EVENTS.review_screen_phase_4)
        );
        this.setState({ showApplyChangesTour: false });
      } else {
        return;
      }
    }
  }

  componentWillUnmount() {
    //Removed listner for column and row indicator's grid line.
    //remove click listner for column and row line
    const {
      grid: { page },
      gridView,
      index,
    } = this.props;
    const columnLine = document.getElementById(
      `grid-column-line-indicator-${page}-${index}`
    );
    const rowLine = document.getElementById(
      `grid-row-line-indicator-${page}-${index}`
    );
    if (gridView) {
      if (columnLine) {
        columnLine.removeEventListener('mousemove', this.columnLineHover);
        columnLine.removeEventListener('click', this.columnSelector);
        this.colGridLine.current &&
          this.colGridLine.current.removeEventListener(
            'mouseover',
            this.columnLineHover
          );
        this.colGridLine.current &&
          this.colGridLine.current.removeEventListener(
            'mouseout',
            this.columnLineHoverOut
          );
        columnLine.removeEventListener('mouseout', this.columnLineHoverOut);
      }

      if (rowLine) {
        rowLine.removeEventListener('mousemove', this.rowLineHover);
        rowLine.removeEventListener('click', this.rowSelector);
        this.rowGridLine.current &&
          this.rowGridLine.current.removeEventListener(
            'mouseover',
            this.rowLineHover
          );
        this.rowGridLine.current &&
          this.rowGridLine.current.removeEventListener(
            'mouseout',
            this.rowLineHoverOut
          );
        rowLine.removeEventListener('mouseout', this.rowLineHoverOut);
      }
    }
    clearTimeout(this.columnLineTimeOut);
    clearTimeout(this.rowLineTimeOut);
  }

  handleExtractSimilarTables = () => {
    const {
      index,
      grids,
      documentActions,
      docMeta: { docId = '' },
      selectedSectionFieldId,
    } = this.props;
    const sourceGrid = grids[index];

    documentActions.rtExtractSimilarTables({
      docId,
      parentId: selectedSectionFieldId,
      sourceGrid,
    });
  };

  handleCopyColumnToAllGrids = () => {
    const { index, grids, documentActions } = this.props;

    const sourceGrid = grids[index];

    const updatedGrids = grids.map((grid, gridIndex) => {
      if (gridIndex === index) return grid;

      let newColumns = grid.columns;

      const sourceGridWidth = sourceGrid.bottomRight[0] - sourceGrid.topLeft[0];
      const targetGridWidth = grid.bottomRight[0] - grid.topLeft[0];
      const targetGridWidthPR = (targetGridWidth / sourceGridWidth) * 100;

      if (targetGridWidthPR > BASE_GRID_WIDTH_PERCENTAGE) {
        newColumns = sourceGrid.columns.map((col) => {
          const xPercentage = (col.x - sourceGrid.topLeft[0]) / sourceGridWidth;

          const newX = grid.topLeft[0] + xPercentage * targetGridWidth;

          return {
            ...col,
            x: newX,
          };
        });
      }

      return { ...grid, columns: newColumns };
    });

    documentActions.rtUpdateGridData({
      grids: updatedGrids,
    });
  };

  handleEditGridClick = () => {
    const {
      index,
      handleGridView,
      selectedSectionFieldId,
      handleTableTracking,
      setActiveGrid,
      fieldsById,
    } = this.props;

    setActiveGrid(index);
    handleGridView(true, index);
    handleTableTracking({
      name: selectedSectionFieldId,
      fieldLabel: fieldsById[selectedSectionFieldId]?.label,
      key: TABLE_TRACKING_KEYS.dummyEvent,
      action: TRACKING_HELPER_KEYS.clicked,
    });
  };

  render() {
    const {
      docMeta,
      handleRemoveGrid,
      gridHeaders,
      grid: { page, id },
      index,
      gridView,
      docReadOnly,
      handleDragging,
      currentPage,
      selectedSectionFieldId,
      user,
      config,
      sortedColumnOptions,
      enableInteraction,
      isGridActive,
      setActiveGrid,
      footerGridsById = {},
    } = this.props;
    let { rows, cols, isHeaderSelected, showEditBtn } = this.state;
    let foundedHeader = cols.map((col) => col.header);
    foundedHeader = foundedHeader.filter((e) => e);
    let colLength = cols.length;

    const gridResizerProps = {
      index,
      page,
      config,
      docMeta,
      handleDragging,
      selectedSectionFieldId,
      user,
      onGridChange: () => this.handleGridSubmit(),
      onHeightUpdate: (diffrence) => this.onHeightUpdate(diffrence),
      onWidthUpdate: () => this.onWidthUpdate(),
    };

    const noUiGridPresent = Object.values(footerGridsById)?.some(
      (grid) => grid.page === null || grid.page === undefined
    );

    return (
      <>
        <div
          className={cx(
            styles.root,
            { [styles.rootPassive]: !gridView },
            'UFTooltipGrid',
            'js-table-grid'
          )}
          id={`grid-table-layout-${page}-${index}`}
          ref={this.refGrid}
          onMouseOver={this.handleMouseEnter}
          onMouseOut={this.handleMouseLeave}
          onFocus={this.handleMouseEnter}
          onBlur={this.handleMouseLeave}
        >
          <button
            className={cx(styles.overlay, {
              [styles.overlay__hide]:
                !enableInteraction || isGridActive || docReadOnly,
            })}
            onClick={(e) => {
              e.preventDefault();
              setActiveGrid(index);
              this.handleEditGridClick();
              mixpanelTrackingAllEvents(MIXPANEL_EVENTS.gridedit_makeactive);
              this.refGrid.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest',
              });
            }}
          />

          <div className={styles.gridNumber}>
            {noUiGridPresent ? index + 2 : index + 1}
          </div>
          {enableInteraction && isGridActive ? (
            <>
              {/* lines of indicatior for rows and columns */}
              <div
                className={cx(styles.rowLine, {
                  [styles.rowLinePassive]: !gridView,
                })}
                ref={this.rowGridLine}
              >
                {gridView ? (
                  <div className={styles.lineIconBox}>
                    <Plus className={styles.lineIcon} />
                  </div>
                ) : null}
              </div>
              <div
                className={cx(styles.colLine, {
                  [styles.colLinePassive]: !gridView,
                })}
                ref={this.colGridLine}
              >
                {gridView ? (
                  <div className={styles.lineIconBox}>
                    <Plus className={styles.lineIcon} />
                  </div>
                ) : null}
              </div>

              {/* Top and left indicator to manage rows and columns. */}
              <HelpTooltip id={ttConstants.TT_REVIEW_SCRREN_GRID_ADD_COLUMN}>
                <button
                  className={cx(styles.columnIndicator, {
                    [styles.columnIndicatorPassive]: !gridView,
                  })}
                  ref={this.columnIndRef}
                  id={`grid-column-line-indicator-${page}-${index}`}
                  disabled={!gridView}
                >
                  <span className={styles.columnIndicator__line} />
                </button>
              </HelpTooltip>
              <HelpTooltip id={ttConstants.TT_REVIEW_SCRREN_GRID_ADD_ROW}>
                <button
                  className={cx(styles.rowIndicator, {
                    [styles.rowIndicatorPassive]: !gridView,
                  })}
                  ref={this.rowIndRef}
                  id={`grid-row-line-indicator-${page}-${index}`}
                  disabled={!gridView}
                >
                  <span className={styles.rowIndicator__line} />
                </button>
              </HelpTooltip>

              {/* All edges to manage grid table */}
              {gridView ? (
                <LeftEdge
                  index={index}
                  gridView={gridView}
                  page={page}
                  docMeta={docMeta}
                  config={config}
                  handleDragging={handleDragging}
                  onGridChange={() => this.handleGridSubmit('leftEdge')}
                  updateColPositionLeftEdge={(difference) =>
                    this.updateColPositionLeftEdge(difference)
                  }
                  selectedSectionFieldId={selectedSectionFieldId}
                  user={user}
                  trackGridResize={this.trackGridResize}
                />
              ) : null}
              {gridView ? (
                <RightEdge
                  index={index}
                  gridView={gridView}
                  config={config}
                  page={page}
                  docMeta={docMeta}
                  handleDragging={handleDragging}
                  onGridChange={() => this.handleGridSubmit('rightEdge')}
                  onWidthUpdate={() => this.onWidthUpdate()}
                  selectedSectionFieldId={selectedSectionFieldId}
                  user={user}
                  trackGridResize={this.trackGridResize}
                />
              ) : null}
              <HelpTooltip id={ttConstants.TT_REVIEW_SCRREN_GRID_STRETCHING}>
                {gridView ? (
                  <GridEdgeResizer
                    {...gridResizerProps}
                    edgeType='top-left'
                    containerClassname={styles.topLeftEdge}
                  />
                ) : null}
              </HelpTooltip>
              {gridView ? (
                <TopEdge
                  index={index}
                  gridView={gridView}
                  page={page}
                  config={config}
                  docMeta={docMeta}
                  handleDragging={handleDragging}
                  onGridChange={() => this.handleGridSubmit('topEdge')}
                  updateRowPositionTopEdge={(difference) =>
                    this.updateRowPositionTopEdge(difference)
                  }
                  selectedSectionFieldId={selectedSectionFieldId}
                  user={user}
                  trackGridResize={this.trackGridResize}
                />
              ) : null}
              <HelpTooltip id={ttConstants.TT_REVIEW_SCRREN_GRID_STRETCHING}>
                {gridView ? (
                  <GridEdgeResizer
                    {...gridResizerProps}
                    edgeType='top-right'
                    containerClassname={styles.topRightEdge}
                  />
                ) : null}
              </HelpTooltip>
              <HelpTooltip id={ttConstants.TT_REVIEW_SCRREN_GRID_STRETCHING}>
                {gridView ? (
                  <GridEdgeResizer
                    {...gridResizerProps}
                    edgeType='bottom-left'
                    containerClassname={styles.bottomLeftEdge}
                  />
                ) : null}
              </HelpTooltip>
              {gridView ? (
                <BottomEdge
                  index={index}
                  gridView={gridView}
                  page={page}
                  config={config}
                  handleDragging={handleDragging}
                  docMeta={docMeta}
                  onGridChange={() => this.handleGridSubmit('bottomEdge')}
                  onHeightUpdate={(diffrence) => this.onHeightUpdate(diffrence)}
                  selectedSectionFieldId={selectedSectionFieldId}
                  user={user}
                  trackGridResize={this.trackGridResize}
                />
              ) : null}

              <HelpTooltip id={ttConstants.TT_REVIEW_SCRREN_GRID_STRETCHING}>
                {gridView ? (
                  <GridEdgeResizer
                    {...gridResizerProps}
                    edgeType='bottom-right'
                    containerClassname={styles.bottomRightEdge}
                  />
                ) : null}
              </HelpTooltip>

              {/* Dragging element to manage position of grid view */}
              {gridView ? (
                <GridResizer
                  index={index}
                  page={page}
                  config={config}
                  currentPage={currentPage}
                  docMeta={docMeta}
                  handleDragging={handleDragging}
                  removeGrid={handleRemoveGrid}
                  onGridChange={() => this.handleGridSubmit('gridResizer')}
                  handleCopyColumnToAllGrids={this.handleCopyColumnToAllGrids}
                  handleExtractSimilarTables={this.handleExtractSimilarTables}
                  selectedSectionFieldId={selectedSectionFieldId}
                  user={user}
                  gridId={id}
                />
              ) : null}
            </>
          ) : (
            ''
          )}
          {
            /* Rows presentation from state */
            rows.map((r, i) => (
              <RowDivider
                top={r.position}
                ignore={r.ignore}
                prevRow={rows[i - 1] || {}}
                postRow={rows[i + 1] || {}}
                docMeta={docMeta}
                onChange={(position) => this.updateRowPosition(position, i)}
                onRemove={(ignore) => this.uploadeRowStatus(ignore, i)}
                handleRemove={this.handleRemoveRow}
                key={`index-${r.position}-${i}`}
                handleDragging={handleDragging}
                absolute={i === 0}
                page={page}
                gridHeaders={gridHeaders}
                selectHeader={(e) => this.selectHeader(e, i)}
                isHeaderSelected={isHeaderSelected}
                atLeastOneHeaderFound={foundedHeader.length}
                gridView={gridView}
                index={index}
                enableInteraction={enableInteraction && isGridActive}
              />
            ))
          }
          {
            /* Cols presentation from state */
            cols.map((c, i) => {
              const columnOverlayWidth =
                i === cols.length - 1
                  ? this.refGrid?.current?.offsetWidth - c.position // Set value if cols[i + 1] doesn't exist
                  : cols[i + 1]?.position - c.position;
              return (
                <ColDivider
                  left={c.position}
                  header={c.header}
                  docMeta={docMeta}
                  handleDragging={handleDragging}
                  onChange={(position) => this.updateColPosition(position, i)}
                  handleRemove={this.handleRemoveCol}
                  handleChangeHeader={(header) =>
                    this.handleChangeHeader(header, i)
                  }
                  key={`index-${c.position}-${i}`}
                  gridHeaders={gridHeaders}
                  absolute={i === 0}
                  atLeastOneHeaderFound={foundedHeader.length}
                  page={page}
                  foundedHeader={foundedHeader}
                  gridView={gridView}
                  colIndex={i}
                  colLength={colLength}
                  index={index}
                  docReadOnly={docReadOnly}
                  sortedColumnOptions={sortedColumnOptions}
                  columnOverlayWidth={columnOverlayWidth}
                  enableInteraction={enableInteraction && isGridActive}
                  tableGridStyle={this.refGrid.current?.style}
                />
              );
            })
          }
          <div
            className={cx(styles.editButton, {
              'd-none': gridView,
            })}
          >
            {showEditBtn && enableInteraction && !gridView && !docReadOnly ? (
              <IconButton
                icon={EditPencil}
                onClick={this.handleEditGridClick}
                title={'Edit Grid'}
                size={SIZE.EXTRA_SMALL}
                className={styles.btn}
              ></IconButton>
            ) : (
              ''
            )}
          </div>
        </div>
      </>
    );
  }
}

function mapStateToProps(state) {
  const {
    fieldsById,
    grids,
    footerGridsById = {},
  } = state.documents.reviewTool;
  const { config, user = {} } = state.app;

  return {
    config,
    user,
    fieldsById,
    grids,
    footerGridsById,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default WithTrackingContext(
  connect(mapStateToProps, mapDispatchToProps)(GridRegion)
);
