import React, { PureComponent } from 'react';

import cx from 'classnames';
import mixpanel from 'mixpanel-browser';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';

import styles from '../GridRegion.scss';

class TopEdge extends PureComponent {
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
    { onGridChange, page, updateRowPositionTopEdge, index, handleDragging },
    callback
  ) => {
    var pos2 = 0,
      pos4 = 0;

    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      handleDragging(true);
      e = e || window.event;
      e.preventDefault();
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
      const grid = gridEle.clientHeight;
      // calculate the new cursor position:
      pos2 = e.clientY - pos4;
      pos4 = e.clientY;
      let top = pos2;

      const gridPR = parseFloat(gridEle?.style?.height) || 0.1;
      let newHeight = (gridPR * (grid - top)) / grid;

      newHeight = newHeight > 2 ? newHeight : 2;
      newHeight = newHeight < 100 ? newHeight : 100;
      gridEle.style.height = `${newHeight}%`;

      const eleTopPX = gridEle.offsetTop || 1;
      const eleTopPR = parseFloat(gridEle?.style?.top) || 0.1;

      let gridTop = ((eleTopPX + top) * eleTopPR) / eleTopPX;
      gridTop = gridTop > 2 ? gridTop : 2;
      gridTop = gridTop < 100 ? gridTop : 100;
      gridEle.style.top = `${gridTop}%`;
      //let updatePosition = gridTop - newHeight;
      updateRowPositionTopEdge(top);
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
      direction: 'top',
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  componentDidMount() {
    this.dragElement(this.rowRef.current, this.props, this.addMixpanelEvent);
  }

  render() {
    const { gridView } = this.props;
    const style = {
      top: 'calc(0% - 3px)',
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

export default TopEdge;
