/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as documentActions } from 'new/redux/oldDocuments/actions';
import { bindActionCreators } from 'redux';

import { Copy, DeleteCircle, Drag, GridRemove, ViewGrid } from 'iconoir-react';
import mixpanel from 'mixpanel-browser';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import { customMixpanelTracking } from 'new/utils/mixpanel';
import OutsideClickHandler from 'react-outside-click-handler';
import { Manager, Popper, Reference } from 'react-popper';

import DropdownPortal from '../DropdownPortal';

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

      const eleLeftPX = gridEle?.offsetLeft || 1;
      const eleLeftPR = parseFloat(gridEle?.style?.left) || 0.1;
      let gridLeft = ((eleLeftPX + left) * eleLeftPR) / eleLeftPX;
      gridLeft = gridLeft > -100 ? gridLeft : 0;
      gridLeft = gridLeft < 100 ? gridLeft : 100;
      gridEle.style.left = `${gridLeft}%`;

      const eleTopPX = gridEle.offsetTop || 1;
      const eleTopPR = parseFloat(gridEle?.style?.top) || 0.1;

      let gridTop = ((eleTopPX + top) * eleTopPR) / eleTopPX;

      gridTop = gridTop > 0 ? gridTop : 0;
      gridTop = gridTop < 100 ? gridTop : 100;
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

    this.setState({ showGridOptions: false });

    // Add mixpanel event
    this.mixpanelTracking(MIXPANEL_EVENTS.copy_grid);
  };

  handleGridRemoval = (type = 'current') => {
    const { removeGrid, page, documentActions, copiedPage, gridId } =
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
        removeGrid({ page, grid_id: gridId });

        this.mixpanelTracking(MIXPANEL_EVENTS.remove_grid);
        break;
      case 'all':
        documentActions.setCopiedPage({
          copiedPage: null,
          copiedGridId: null,
        });
        removeGrid({ page: -1 });

        this.mixpanelTracking(MIXPANEL_EVENTS.remove_all_grid);
        break;
      default:
        return;
    }

    this.hideGridOptions();
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
    const { index } = this.props;

    if (!showGridOptions) return null;

    return (
      <DropdownPortal>
        <Popper placement='bottom-end' strategy='absolute'>
          {({ ref, style, placement }) => (
            <div
              ref={ref}
              style={{ ...style, zIndex: 5 }}
              data-placement={placement}
            >
              <OutsideClickHandler onOutsideClick={this.hideGridOptions}>
                <div className={styles.gridOptions_dropdown}>
                  <ul className={styles.gridOptions_list}>
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
      </DropdownPortal>
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
          <Drag className={styles.gridResize__icon} />
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
  const { copiedPage, copiedGridId } = state.documents.reviewTool;

  return {
    copiedPage,
    copiedGridId,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GridResizer);
