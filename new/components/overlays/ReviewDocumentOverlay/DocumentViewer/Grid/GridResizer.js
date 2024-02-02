/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as documentActions } from 'new/redux/documents/actions';
import { bindActionCreators } from 'redux';

import {
  Copy,
  DeleteCircle,
  Drag,
  GridAdd,
  GridRemove,
  Table2Columns,
  ViewGrid,
} from 'iconoir-react';
import mixpanel from 'mixpanel-browser';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import { customMixpanelTracking } from 'new/utils/mixpanel';
import OutsideClickHandler from 'react-outside-click-handler';
import { Manager, Popper, Reference } from 'react-popper';

import DocumentPortal from '../DocumentPortal';

import styles from '../GridRegion.scss';

class GridResizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initPosition: null,
      top: this.props.top,
      percentage: null,
      showGridOptions: false,
    };
    this.resizeRef = React.createRef();
  }

  dragElement = (
    elmnt,
    { onGridChange, page, index, handleDragging },
    callback
  ) => {
    var pos2 = 0,
      pos4 = 0,
      pos3 = 0,
      pos1 = 0;

    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      handleDragging(true);
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();

      const gridEle =
        document.getElementById(`grid-table-layout-${page}-${index}`) || {};

      pos1 = e.clientX - pos3;
      pos2 = e.clientY - pos4;
      pos3 = e.clientX;
      pos4 = e.clientY;

      let left = pos1;
      let top = pos2;

      const gridWPR = parseFloat(gridEle?.style?.width) || 0.1;
      let gridNewWidth =
        (gridWPR * (gridEle?.clientWidth - left)) / gridEle?.clientWidth;
      const gridHPR = parseFloat(gridEle?.style.height) || 0.1;
      let gridNewHeight =
        (gridHPR * (gridEle?.clientHeight - top)) / gridEle?.clientHeight;

      const eleLeftPX = gridEle?.offsetLeft || 1;
      const eleLeftPR = parseFloat(gridEle?.style?.left) || 0.1;
      let gridLeft = ((eleLeftPX + left) * eleLeftPR) / eleLeftPX;
      gridLeft = gridLeft > 0 ? gridLeft : 0;
      // check the table grid exceeds the grid region width while dragging
      gridLeft = gridLeft + gridNewWidth < 100 ? gridLeft : 100 - gridNewWidth;
      gridEle.style.left = `${gridLeft}%`;

      const eleTopPX = gridEle.offsetTop || 1;
      const eleTopPR = parseFloat(gridEle?.style?.top) || 0.1;
      let gridTop = ((eleTopPX + top) * eleTopPR) / eleTopPX;
      gridTop = gridTop > 0 ? gridTop : 0;
      // check the table grid exceeds the grid region top while dragging
      gridTop = gridTop + gridNewHeight < 100 ? gridTop : 100 - gridNewHeight;
      gridEle.style.top = `${gridTop}%`;
    }

    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
      onGridChange();
      callback();
    }
  };

  addMixpanelEventForDragGrid = () => {
    const { docMeta, user, index, selectedSectionFieldId, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    mixpanel.track(MIXPANEL_EVENTS.drag_grid, {
      docId: docMeta.docId,
      label: docMeta.title,
      'document type': docMeta.type,
      'work email': user.email,
      'line item id': selectedSectionFieldId,
      'grid id': index,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  componentDidMount() {
    this.dragElement(
      this.resizeRef.current,
      this.props,
      this.addMixpanelEventForDragGrid
    );
  }

  toggleGridOptions = () => {
    const { showGridOptions } = this.state;

    this.setState({
      showGridOptions: !showGridOptions,
    });
  };

  hideGridOptions = () => this.setState({ showGridOptions: false });

  handleGridCopy = () => {
    const { documentActions, page, gridId } = this.props;

    documentActions.setCopiedPage({
      copiedPage: page + 1,
      copiedGridId: gridId,
    });

    this.hideGridOptions();

    // Add mixpanel event
    this.mixpanelTracking(MIXPANEL_EVENTS.copy_grid);
  };

  handleCopyColumns = () => {
    this.props.handleCopyColumnToAllGrids();
    this.hideGridOptions();
    // Add mixpanel event
    this.mixpanelTracking(MIXPANEL_EVENTS.copy_columns_to_all_grids);
  };

  handleGridRemoval = (type = 'current') => {
    const { index, removeGrid, page, documentActions, copiedPage, gridId } =
      this.props;

    switch (type) {
      case 'current':
        // Remove copied page value if removed grid is in same page as copied page
        if (copiedPage && page === copiedPage - 1) {
          documentActions.setCopiedPage({
            copiedPage: null,
            copiedGridId: null,
          });
        }
        removeGrid({ page, grid_id: gridId, index });

        this.mixpanelTracking(MIXPANEL_EVENTS.remove_grid);
        break;
      case 'all':
        documentActions.setCopiedPage({
          copiedPage: null,
          copiedGridId: null,
        });
        removeGrid({ page: -1, index });

        this.mixpanelTracking(MIXPANEL_EVENTS.remove_all_grid);
        break;
      default:
        return;
    }

    this.hideGridOptions();
  };

  handleExtractSimilarTables = () => {
    this.props.handleExtractSimilarTables();
    this.hideGridOptions();
    // Add mixpanel event
    this.mixpanelTracking(MIXPANEL_EVENTS.extract_similar_tables);
  };

  mixpanelTracking = (eventName) => {
    const {
      index,
      docMeta,
      user,
      selectedSectionFieldId,
      config: { canSwitchToOldMode = true },
    } = this.props;

    customMixpanelTracking(eventName, {
      email: user?.email,
      docId: docMeta?.docId,
      label: docMeta?.title,
      docType: docMeta?.type,
      'line item id': selectedSectionFieldId,
      'grid id': index,
      role: user?.role,
      companyName: user?.companyName,
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  renderGridOptions = () => {
    const { showGridOptions } = this.state;
    const { gridBboxIds } = this.props;

    if (!showGridOptions) return null;

    const boundaryElement = document.getElementById('rt-document-wrapper');

    return (
      <DocumentPortal>
        <Popper
          placement='left-start'
          strategy='fixed'
          modifiers={[
            {
              name: 'flip',
              options: {
                rootBoundary: boundaryElement,
                fallbackPlacements: ['left-end'],
              },
            },
          ]}
        >
          {({ ref, style, placement }) => (
            <div
              ref={ref}
              style={{ ...style, zIndex: 'var(--ds-zIndex-review-sidebar)' }}
              data-placement={placement}
            >
              <OutsideClickHandler onOutsideClick={this.hideGridOptions}>
                <div className={styles.gridOptions_dropdown}>
                  <ul className={styles.gridOptions_list}>
                    <li onClick={this.handleCopyColumns}>
                      <GridAdd />
                      <span>Copy columns to all grids</span>
                    </li>
                    {gridBboxIds?.length > 0 ? (
                      <li onClick={this.handleExtractSimilarTables}>
                        <Table2Columns />
                        <span>Extract similar tables</span>
                      </li>
                    ) : null}
                    <li onClick={this.handleGridCopy}>
                      <Copy />
                      <span>Copy Grid</span>
                    </li>
                    <li onClick={() => this.handleGridRemoval('current')}>
                      <DeleteCircle />
                      <span>Remove Grid</span>
                    </li>
                    <li onClick={() => this.handleGridRemoval('all')}>
                      <GridRemove />
                      <span>Remove All Grids</span>
                    </li>
                  </ul>
                </div>
              </OutsideClickHandler>
            </div>
          )}
        </Popper>
      </DocumentPortal>
    );
  };

  render() {
    return (
      <>
        <div
          className={styles.gridResize}
          ref={this.resizeRef}
          title='Drag Grid'
        >
          <Drag className={styles.gridResize__icon} height={14} width={14} />
        </div>
        <div className={styles.gridOptions}>
          <Manager>
            <Reference>
              {({ ref }) => (
                <div className={styles.gridOptions_container}>
                  <Tooltip label='View other Grid options' placement={'left'}>
                    <span
                      className={styles.gridOptions_button}
                      onClick={this.toggleGridOptions}
                      ref={ref}
                      role='button'
                    >
                      <ViewGrid />
                    </span>
                  </Tooltip>
                  {this.renderGridOptions()}
                </div>
              )}
            </Reference>
          </Manager>
        </div>
      </>
    );
  }
}

function mapStateToProps(state) {
  const { copiedPage, copiedGridId, gridBboxIds } = state.documents.reviewTool;

  return {
    copiedPage,
    copiedGridId,
    gridBboxIds,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GridResizer);
