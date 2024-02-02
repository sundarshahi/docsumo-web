import React, { Component } from 'react';

import cx from 'classnames';
import mixpanel from 'mixpanel-browser';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';

import styles from '../GridRegion.scss';

/* import _ from 'lodash'; */

class LeftEdge extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initPosition: null,
      left: this.props.left,
      percentage: null,
    };
    this.colRef = React.createRef();
  }

  dragElement = (
    elmnt,
    { onGridChange, page, updateColPositionLeftEdge, index, handleDragging },
    callback
  ) => {
    var pos1 = 0,
      pos3 = 0;

    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      handleDragging(true);
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();

      const gridEle =
        document.getElementById(`grid-table-layout-${page}-${index}`) || {};
      const grid = gridEle.clientWidth;

      // calculate the new cursor position:
      pos1 = e.clientX - pos3;
      pos3 = e.clientX;
      let left = pos1;

      const gridPR = parseFloat(gridEle.style.width) || 0.1;
      let newWidth = (gridPR * (grid - left)) / grid;
      newWidth = newWidth > 2 ? newWidth : 2;
      newWidth = newWidth < 100 ? newWidth : 100;
      gridEle.style.width = `${newWidth}%`;

      const eleLeftPX = gridEle.offsetLeft || 1;
      const eleLeftPR = parseFloat(gridEle.style.left) || 0.1;
      let gridLeft = ((eleLeftPX + left) * eleLeftPR) / eleLeftPX;
      gridLeft = gridLeft > 0 ? gridLeft : 0;
      gridLeft = gridLeft < 100 ? gridLeft : 100;
      gridEle.style.left = `${gridLeft}%`;
      updateColPositionLeftEdge(left);
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
      direction: 'left',
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  componentDidMount() {
    this.dragElement(this.colRef.current, this.props, this.addMixpanelEvent);
  }

  render() {
    const { gridView } = this.props;
    const style = {
      left: 'calc(0% - 3px)',
    };

    return (
      <div
        className={cx(styles.column, {
          [styles.passiveSelectColumn]: !gridView,
        })}
        style={style}
        ref={this.colRef}
      />
    );
  }
}

export default LeftEdge;
