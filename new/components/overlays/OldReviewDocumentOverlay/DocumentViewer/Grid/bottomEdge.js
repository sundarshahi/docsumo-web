import React, { Component } from 'react';

import cx from 'classnames';
import mixpanel from 'mixpanel-browser';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';

import styles from '../GridRegion.scss';

class BottomEdge extends Component {
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
    onGridChange,
    onHeightUpdate,
    page,
    index,
    handleDragging,
    callback
  ) => {
    var pos2 = 0,
      pos4 = 0;

    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      handleDragging(true);
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup
      pos4 = e.clientY;

      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();

      const gridEle =
        document.getElementById(`grid-table-layout-${page}-${index}`) || {};

      const documentsWrapperEl =
        document.getElementById('rt-documents-wrapper') || {};

      const grid = gridEle.clientHeight;
      pos2 = pos4 - e.clientY;
      pos4 = e.clientY;
      let top = pos2;

      const gridHeightInPercentage = parseFloat(gridEle?.style?.height) || 0.1;
      const minGridHeightInPixel = 15;
      const documentsHeight = documentsWrapperEl?.clientHeight;
      const minGridHeightInPercentage = documentsHeight
        ? (minGridHeightInPixel / documentsHeight) * 100
        : 1;
      const maxGridHeightInPercentage = 100;
      let newHeightInPercentage =
        (gridHeightInPercentage * (grid - top)) / grid;

      newHeightInPercentage =
        newHeightInPercentage > minGridHeightInPercentage
          ? newHeightInPercentage
          : minGridHeightInPercentage;
      newHeightInPercentage =
        newHeightInPercentage < maxGridHeightInPercentage
          ? newHeightInPercentage
          : maxGridHeightInPercentage;

      gridEle.style.height = `${newHeightInPercentage}%`;
      onHeightUpdate(top);
    }
    const { trackGridResize } = this.props;

    function closeDragElement() {
      /* stop moving when mouse button is released:*/

      document.onmouseup = null;
      document.onmousemove = null;
      onGridChange();
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
      direction: 'bottom',
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  componentDidMount() {
    const { onGridChange, onHeightUpdate, page, index, handleDragging } =
      this.props;
    this.dragElement(
      this.rowRef.current,
      onGridChange,
      onHeightUpdate,
      page,
      index,
      handleDragging,
      this.addMixpanelEvent
    );
  }

  render() {
    const { gridView } = this.props;
    const style = {
      top: 'calc(100% - 1px)',
    };

    return (
      <div
        className={cx(styles.row, { [styles.passiveRow]: !gridView })}
        style={style}
        ref={this.rowRef}
      />
    );
  }
}

export default BottomEdge;
