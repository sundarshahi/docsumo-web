import React, { Component } from 'react';

import cx from 'classnames';
import { PropTypes } from 'prop-types';

import Region from './Region';

import styles from './index.scss';

function isSubElement(el, check) {
  if (el === null) {
    return false;
  } else if (check(el)) {
    return true;
  } else {
    return isSubElement(el.parentNode, check);
  }
}

class RegionSelect extends Component {
  regionCounter = 0;
  originTargetSuggestionBboxUuid = null;
  originTargetGridBboxUuid = null;

  componentDidMount() {
    document.addEventListener('mousemove', this.onDocMouseTouchMove);
    document.addEventListener('touchmove', this.onDocMouseTouchMove);

    document.addEventListener('mouseup', this.onDocMouseTouchEnd);
    document.addEventListener('touchend', this.onDocMouseTouchEnd);
    document.addEventListener('touchcancel', this.onDocMouseTouchEnd);
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.onDocMouseTouchMove);
    document.removeEventListener('touchmove', this.onDocMouseTouchMove);

    document.removeEventListener('mouseup', this.onDocMouseTouchEnd);
    document.removeEventListener('touchend', this.onDocMouseTouchEnd);
    document.removeEventListener('touchcancel', this.onDocMouseTouchEnd);
  }

  getClientPos(e) {
    let pageX, pageY;

    if (e.touches) {
      pageX = e.touches[0].pageX;
      pageY = e.touches[0].pageY;
    } else {
      pageX = e.pageX;
      pageY = e.pageY;
    }

    return {
      x: pageX,
      y: pageY,
    };
  }

  onDocMouseTouchMove = (event) => {
    if (!this.isChanging) {
      return;
    }
    const index = this.regionChangeIndex;
    const updatingRegion = this.props.regions[index];
    const clientPos = this.getClientPos(event);
    const regionChangeData = this.regionChangeData;
    const { resizeDir } = regionChangeData;

    let x, y, width, height;
    if (!regionChangeData.isMove) {
      let updateX = false;
      let updateY = false;
      if (resizeDir === 'n' || resizeDir === 's') {
        updateY = true;
      } else if (resizeDir === 'e' || resizeDir === 'w') {
        updateX = true;
      } else {
        updateX = true;
        updateY = true;
      }

      let x1Pc, y1Pc, x2Pc, y2Pc;
      x1Pc =
        ((regionChangeData.clientPosXStart - regionChangeData.imageOffsetLeft) /
          regionChangeData.imageWidth) *
        100;
      y1Pc =
        ((regionChangeData.clientPosYStart - regionChangeData.imageOffsetTop) /
          regionChangeData.imageHeight) *
        100;
      x2Pc =
        ((clientPos.x - regionChangeData.imageOffsetLeft) /
          regionChangeData.imageWidth) *
        100;
      y2Pc =
        ((clientPos.y - regionChangeData.imageOffsetTop) /
          regionChangeData.imageHeight) *
        100;

      if (updateX) {
        x = Math.min(x1Pc, x2Pc);
        width = Math.abs(x1Pc - x2Pc);
      } else {
        x = updatingRegion.x;
        width = updatingRegion.width;
      }

      if (updateY) {
        y = Math.min(y1Pc, y2Pc);
        height = Math.abs(y1Pc - y2Pc);
      } else {
        y = updatingRegion.y;
        height = updatingRegion.height;
      }

      if (this.props.constraint) {
        if (x2Pc >= 100) {
          x = x1Pc;
          width = 100 - x1Pc;
        }
        if (y2Pc >= 100) {
          y = y1Pc;
          height = 100 - y1Pc;
        }
        if (x2Pc <= 0) {
          x = 0;
          width = x1Pc;
        }
        if (y2Pc <= 0) {
          y = 0;
          height = y1Pc;
        }
      }
    } else {
      x =
        ((clientPos.x +
          regionChangeData.clientPosXOffset -
          regionChangeData.imageOffsetLeft) /
          regionChangeData.imageWidth) *
        100;
      y =
        ((clientPos.y +
          regionChangeData.clientPosYOffset -
          regionChangeData.imageOffsetTop) /
          regionChangeData.imageHeight) *
        100;
      width = updatingRegion.width;
      height = updatingRegion.height;
      if (this.props.constraint) {
        if (x + width >= 100) {
          x = Math.round(100 - width);
        }
        if (y + height >= 100) {
          y = Math.round(100 - height);
        }
        if (x <= 0) {
          x = 0;
        }
        if (y <= 0) {
          y = 0;
        }
      }
    }

    const rect = {
      x: x,
      y: y,
      width: width,
      height: height,
      isChanging: true,
    };
    this.props.onChange([
      ...this.props.regions.slice(0, index),
      { ...updatingRegion, ...rect },
      ...this.props.regions.slice(index + 1),
    ]);
  };

  onDocMouseTouchEnd = () => {
    if (this.isChanging) {
      this.isChanging = false;
      const index = this.regionChangeIndex;
      const updatingRegion = this.props.regions[index];
      const changes = {
        new: false,
        isChanging: false,
      };
      this.regionChangeIndex = null;
      this.regionChangeData = null;

      const updatedRegion = { ...updatingRegion, ...changes };

      if (!updatedRegion.width && !updatedRegion.height) {
        // Not a region
        if (this.originTargetSuggestionBboxUuid) {
          updatedRegion.suggestionBboxUuid =
            this.originTargetSuggestionBboxUuid;
        }

        if (this.originTargetGridBboxUuid) {
          updatedRegion.gridBboxUuid = this.originTargetGridBboxUuid;
        }
      }

      this.props.onChange([
        ...this.props.regions.slice(0, index),
        updatedRegion,
        ...this.props.regions.slice(index + 1),
      ]);
    }

    this.originTargetSuggestionBboxUuid = null;
    this.originTargetGridBboxUuid = null;
  };

  onComponentMouseTouchDown = (event) => {
    if (
      this.props.disabled ||
      event.button !== 0 ||
      event.target.closest('.js-table-grid')
    ) {
      return;
    }

    this.originTargetSuggestionBboxUuid =
      event.target.dataset.suggestionBboxUuid;

    if (
      event.target.dataset.wrapper ||
      event.target.dataset.dir ||
      isSubElement(event.target, (el) => el.dataset && el.dataset.wrapper)
    ) {
      return;
    }
    event.preventDefault();
    const clientPos = this.getClientPos(event);
    const imageOffset = this.getElementOffset(this.imageRef);
    const xPc =
      ((clientPos.x - imageOffset.left) / this.imageRef.offsetWidth) * 100;
    const yPc =
      ((clientPos.y - imageOffset.top) / this.imageRef.offsetHeight) * 100;
    this.isChanging = true;
    let rect = {
      x: xPc,
      y: yPc,
      width: 0,
      height: 0,
      new: true,
      data: { index: this.regionCounter },
      isChanging: true,
    };
    this.regionCounter += 1;
    this.regionChangeData = {
      imageOffsetLeft: imageOffset.left,
      imageOffsetTop: imageOffset.top,
      clientPosXStart: clientPos.x,
      clientPosYStart: clientPos.y,
      imageWidth: this.imageRef.offsetWidth,
      imageHeight: this.imageRef.offsetHeight,
      isMove: false,
    };

    if (event.target.closest('#ds-grid-add-button')) {
      this.originTargetGridBboxUuid = event.target.closest(
        '#ds-grid-add-button'
      ).dataset.gridBboxUuid;
      rect = {
        ...rect,
        gridBboxUuid: this.originTargetGridBboxUuid,
      };
      this.isChanging = false;
    }

    if (this.props.regions.length < this.props.maxRegions) {
      this.props.onChange(this.props.regions.concat(rect));
      this.regionChangeIndex = this.props.regions.length;
    } else {
      this.props.onChange([
        ...this.props.regions.slice(0, this.props.maxRegions - 1),
        rect,
      ]);
      this.regionChangeIndex = this.props.maxRegions - 1;
    }
  };

  getElementOffset(el) {
    const rect = el.getBoundingClientRect();
    const docEl = document.documentElement;

    const rectTop = rect.top + window.pageYOffset - docEl.clientTop;
    const rectLeft = rect.left + window.pageXOffset - docEl.clientLeft;

    return {
      top: rectTop,
      left: rectLeft,
    };
  }

  onRegionMoveStart = (event, index) => {
    if (!event.target.dataset.wrapper && !event.target.dataset.dir) {
      return;
    }
    event.preventDefault();

    const clientPos = this.getClientPos(event);
    const imageOffset = this.getElementOffset(this.imageRef);

    let clientPosXStart, clientPosYStart;

    const currentRegion = this.props.regions[index];
    const regionLeft =
      (currentRegion.x / 100) * this.imageRef.offsetWidth + imageOffset.left;
    const regionTop =
      (currentRegion.y / 100) * this.imageRef.offsetHeight + imageOffset.top;
    const regionWidth = (currentRegion.width / 100) * this.imageRef.offsetWidth;
    const regionHeight =
      (currentRegion.height / 100) * this.imageRef.offsetHeight;
    const clientPosDiffX = regionLeft - clientPos.x;
    const clientPosDiffY = regionTop - clientPos.y;

    const resizeDir = event.target.dataset.dir;

    if (resizeDir) {
      if (resizeDir === 'se') {
        clientPosXStart = regionLeft;
        clientPosYStart = regionTop;
      } else if (resizeDir === 'sw') {
        clientPosXStart = regionLeft + regionWidth;
        clientPosYStart = regionTop;
      } else if (resizeDir === 'nw') {
        clientPosXStart = regionLeft + regionWidth;
        clientPosYStart = regionTop + regionHeight;
      } else if (resizeDir === 'ne') {
        clientPosXStart = regionLeft;
        clientPosYStart = regionTop + regionHeight;
      } else if (resizeDir === 'n') {
        clientPosXStart = regionLeft + regionWidth;
        clientPosYStart = regionTop + regionHeight;
      } else if (resizeDir === 's') {
        clientPosXStart = regionLeft;
        clientPosYStart = regionTop;
      } else if (resizeDir === 'e') {
        clientPosXStart = regionLeft;
        clientPosYStart = regionTop + regionHeight;
      } else if (resizeDir === 'w') {
        clientPosXStart = regionLeft + regionWidth;
        clientPosYStart = regionTop + regionHeight;
      }
    } else {
      clientPosXStart = clientPos.x;
      clientPosYStart = clientPos.y;
    }

    this.isChanging = true;
    this.regionChangeData = {
      imageOffsetLeft: imageOffset.left,
      imageOffsetTop: imageOffset.top,
      clientPosXStart: clientPosXStart,
      clientPosYStart: clientPosYStart,
      clientPosXOffset: clientPosDiffX,
      clientPosYOffset: clientPosDiffY,
      imageWidth: this.imageRef.offsetWidth,
      imageHeight: this.imageRef.offsetHeight,
      isMove: resizeDir ? false : true,
      resizeDir: resizeDir,
    };

    this.regionChangeIndex = index;
  };

  renderRect = (rect, index) => {
    const {
      regionStyle,
      regionRenderer,
      isLineItem,
      docMeta,
      selectedField,
      positionRegion,
      isRegionChanging,
    } = this.props;

    return (
      <Region
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        positionRegion={positionRegion}
        isRegionChanging={isRegionChanging}
        docMeta={docMeta}
        selectedField={selectedField}
        isLineItem={isLineItem}
        handles={!rect.new}
        data={rect.data}
        key={index}
        index={index}
        customStyle={regionStyle}
        dataRenderer={regionRenderer}
        onCropStart={(event) => this.onRegionMoveStart(event, index)}
        changing={index === this.regionChangeIndex}
      />
    );
  };

  render() {
    const { regions, disabled = false } = this.props;

    /* eslint-disable jsx-a11y/no-static-element-interactions */
    return (
      <div
        id='rt-documents-wrapper'
        ref={(ref) => (this.imageRef = ref)}
        className={cx(styles.root, this.props.className)}
        style={{ ...this.props.style }}
        onTouchStart={this.onComponentMouseTouchDown}
        onMouseDown={this.onComponentMouseTouchDown}
      >
        {!disabled && regions.map(this.renderRect)}

        {this.props.debug ? (
          <table style={{ position: 'absolute', right: 0, top: 0 }}>
            <tbody>
              {regions.map((rect, index) => {
                return (
                  <tr key={index}>
                    <td>x: {Math.round(rect.x, 1)}</td>
                    <td>y: {Math.round(rect.y, 1)}</td>
                    <td>width: {Math.round(rect.width, 1)}</td>
                    <td>height: {Math.round(rect.height, 1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}

        {this.props.children}
      </div>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
}
RegionSelect.propTypes = {
  constraint: PropTypes.bool,
  regions: PropTypes.array,
  children: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  regionRenderer: PropTypes.func,
  maxRegions: PropTypes.number,
  debug: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  regionStyle: PropTypes.object,
};
RegionSelect.defaultProps = {
  maxRegions: Infinity,
  debug: false,
  regions: [],
  constraint: false,
};

export default RegionSelect;
