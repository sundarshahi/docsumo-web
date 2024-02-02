import React, { Component } from 'react';

import mixpanel from 'mixpanel-browser';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';

import styles from '../GridRegion.scss';

class BottomRightEdge extends Component {
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

      let newWidth = (gridWPR * (gridWidth - left)) / gridWidth;
      let newHeight = (gridHPR * (gridHeight - top)) / gridHeight;

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

    const { trackGridResize } = this.props;

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
      trackGridResize();
    }
  };

  addMixpanelEvent = () => {
    const { docMeta, user, index, selectedSectionFieldId, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    mixpanel.track(MIXPANEL_EVENTS.resize_grid, {
      docId: docMeta.docId,
      label: docMeta.title,
      'document type': docMeta.type,
      'work email': user.email,
      'line item id': selectedSectionFieldId,
      'grid id': index,
      direction: 'bottom-right',
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  componentDidMount() {
    this.dragElement(this.rowRef.current, this.props, this.addMixpanelEvent);
  }

  render() {
    return <div className={styles.bottomRightEdge} ref={this.rowRef} />;
  }
}

export default BottomRightEdge;
