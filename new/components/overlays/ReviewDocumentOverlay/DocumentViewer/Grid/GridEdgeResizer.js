import React, { Component } from 'react';

import mixpanel from 'mixpanel-browser';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';

class GridEdgeResizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initPosition: null,
      top: this.props.top,
      percentage: null,
    };
    this.rowRef = React.createRef();
  }

  dragElement = (
    elmnt,
    {
      onGridChange,
      onHeightUpdate,
      onWidthUpdate,
      page,
      index,
      handleDragging,
      edgeType,
    },
    callback
  ) => {
    var pos2 = 0,
      pos4 = 0,
      pos1 = 0,
      pos3 = 0,
      gridEle = 0,
      oldGridHeight = 0;

    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      handleDragging(true);
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      gridEle =
        document.getElementById(`grid-table-layout-${page}-${index}`) || {};
      oldGridHeight = gridEle.clientHeight;

      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();

      const gridWidth = gridEle.clientWidth;
      const gridHeight = gridEle.clientHeight;

      const documentsWrapperEl =
        document.getElementById('rt-documents-wrapper') || {};

      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos3 = e.clientX;
      pos2 = pos4 - e.clientY;
      pos4 = e.clientY;
      let top = pos2;
      let left = pos1;

      // set the element's new position:
      const gridWPR = parseFloat(gridEle?.style?.width) || 0.1;
      const gridHPR = parseFloat(gridEle?.style?.height) || 0.1;

      const minGridHeightInPixel = 15;
      const documentsHeight = documentsWrapperEl?.clientHeight;
      const minGridHeightInPercentage = documentsHeight
        ? (minGridHeightInPixel / documentsHeight) * 100
        : 1;

      let newHeight = (gridHPR * (gridHeight - top)) / gridHeight;
      let newWidth = (gridWPR * (gridWidth - left)) / gridWidth;

      switch (edgeType) {
        case 'bottom-right':
          break;
        case 'bottom-left':
          newWidth = (gridWPR * (gridWidth + left)) / gridWidth;
          calculateBottomLeftPosition(left, gridWPR, gridWidth);
          break;
        case 'top-right':
          newHeight = (gridHPR * (gridHeight + top)) / gridHeight;
          calculateTopRightPosition(
            top,
            gridHPR,
            gridHeight,
            minGridHeightInPercentage
          );
          break;
        case 'top-left':
          newWidth = (gridWPR * (gridWidth + left)) / gridWidth;
          calculateBottomLeftPosition(left, gridWPR, gridWidth);
          newHeight = (gridHPR * (gridHeight + top)) / gridHeight;
          calculateTopRightPosition(
            top,
            gridHPR,
            gridHeight,
            minGridHeightInPercentage
          );
          break;
        default:
          break;
      }

      newWidth = newWidth > 2 ? newWidth : 2;
      newWidth = newWidth < 100 ? newWidth : 100;

      newHeight =
        newHeight > minGridHeightInPercentage
          ? newHeight
          : minGridHeightInPercentage;
      newHeight = newHeight < 100 ? newHeight : 100;

      gridEle.style.width = `${newWidth}%`;
      gridEle.style.height = `${newHeight}%`;
      onHeightUpdate();
      onWidthUpdate();
    }

    function calculateTopRightPosition(
      top,
      gridHPR,
      gridHeight,
      minGridHeightInPercentage
    ) {
      let gridTPR = parseFloat(gridEle?.style?.top) || 0.1;
      let newTop = gridTPR - (top * gridHPR) / gridHeight;
      newTop =
        newTop > minGridHeightInPercentage ? newTop : minGridHeightInPercentage;
      newTop = newTop < 100 ? newTop : 100;
      gridEle.style.top = `${newTop}%`;
    }

    function calculateBottomLeftPosition(left, gridWPR, gridWidth) {
      let gridLPR = parseFloat(gridEle?.style?.left) || 0.1;
      let newLeft = gridLPR - (left * gridWPR) / gridWidth;
      newLeft = newLeft > 2 ? newLeft : 2;
      newLeft = newLeft < 100 ? newLeft : 100;
      gridEle.style.left = `${newLeft}%`;
    }

    function closeDragElement() {
      const gridEle =
        document.getElementById(`grid-table-layout-${page}-${index}`) || {};
      const diff = oldGridHeight - gridEle.clientHeight;
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
      onGridChange();
      onHeightUpdate(diff);
      callback();
      this.props?.trackGridResize();
    }
  };

  addMixpanelEvent = () => {
    const { docMeta, user, index, selectedSectionFieldId, config, edgeType } =
      this.props;
    const { canSwitchToOldMode = true } = config;

    mixpanel.track(MIXPANEL_EVENTS.resize_grid, {
      docId: docMeta.docId,
      label: docMeta.title,
      'document type': docMeta.type,
      'work email': user.email,
      'line item id': selectedSectionFieldId,
      'grid id': index,
      direction: edgeType,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  componentDidMount() {
    this.dragElement(this.rowRef.current, this.props, this.addMixpanelEvent);
  }

  render() {
    return <div className={this.props.containerClassname} ref={this.rowRef} />;
  }
}

export default GridEdgeResizer;
