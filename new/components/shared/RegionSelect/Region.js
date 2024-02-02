import React, { Component } from 'react';

import cx from 'classnames';
import { REGION_PADDING_BOX } from 'new/constants/document';
import { PropTypes } from 'prop-types';

import styles from './region.scss';

class Region extends Component {
  renderHandles() {
    return (
      <div>
        {/* <div data-dir='se' className={cx(styles.handle, styles.SE)} />
                <div data-dir='sw' className={cx(styles.handle, styles.SW)} />
                <div data-dir='nw' className={cx(styles.handle, styles.NW)} />
                <div data-dir='ne' className={cx(styles.handle, styles.NE)} /> */}
        <div data-dir='n' className={cx(styles.sideHandle, styles.N)} />
        <div data-dir='s' className={cx(styles.sideHandle, styles.S)} />
        <div data-dir='e' className={cx(styles.sideHandle, styles.E)} />
        <div data-dir='w' className={cx(styles.sideHandle, styles.W)} />
      </div>
    );
  }
  render() {
    //const { docMeta : { height, width}, isLineItem} = this.props;
    const { isLineItem, selectedField, isRegionChanging } = this.props;

    const { uiValue } = selectedField;
    const uiValueString = uiValue?.toString() || '';

    const isDebitOrCreditLabel = ['debit', 'credit'].includes(
      selectedField?.label
    );

    let localStyle = {};
    if (isLineItem) {
      localStyle = {
        width: `calc(${this.props.positionRegion[0].width}% + ${
          this.props.positionRegion[0].width ? REGION_PADDING_BOX.WIDTH : 0
        }px)`,
        height: `calc(${this.props.positionRegion[0].height}% + ${
          this.props.positionRegion[0].height ? REGION_PADDING_BOX.HEIGHT : 0
        }px)`,
        left: `calc(${this.props.positionRegion[0].x}% - ${
          this.props.positionRegion[0].width ? REGION_PADDING_BOX.LEFT : 0
        }px)`,
        top: `calc(${this.props.positionRegion[0].y}% - ${
          this.props.positionRegion[0].height ? REGION_PADDING_BOX.TOP : 0
        }px)`,
        // width: this.props.width + ((15/width) * 100) + '%',
        // height: this.props.height + ((15/height) * 100) + '%',
        // left: `${this.props.x - ((8/width) * 100)}%`,
        // top: `${this.props.y - ((8/height) * 100)}%`
      };
    } else {
      localStyle = {
        width: `calc(${this.props.width}% + ${
          this.props.width ? REGION_PADDING_BOX.WIDTH : 0
        }px)`,
        height: `calc(${this.props.height}% + ${
          this.props.height ? REGION_PADDING_BOX.HEIGHT : 0
        }px)`,
        left: `calc(${this.props.x}% - ${
          this.props.width ? REGION_PADDING_BOX.LEFT : 0
        }px)`,
        top: `calc(${this.props.y}% - ${
          this.props.height ? REGION_PADDING_BOX.TOP : 0
        }px)`,
      };
    }
    const dataRenderArgs = {
      data: this.props.data,
      isChanging: this.props.changing,
      index: this.props.index,
    };

    /* eslint-disable jsx-a11y/no-static-element-interactions */
    return (
      <div
        id='field-bbox-region'
        className={cx(styles.root, this.props.className, {
          [styles.lineClass]: this.props.isLineItem && !this.props.changing,
          [styles.transparentBorder]:
            isDebitOrCreditLabel &&
            !isRegionChanging &&
            uiValueString.length > 0,
        })}
        style={{
          ...localStyle,
          ...this.props.customStyle,
          ...(this.props.data ? this.props.data.regionStyle : null),
        }}
        onMouseDown={this.props.onCropStart}
        onTouchStart={this.props.onCropStart}
        data-wrapper='wrapper'
      >
        {this.props.handles ? this.renderHandles() : null}
        {this.props.dataRenderer
          ? this.props.dataRenderer(dataRenderArgs)
          : null}
      </div>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
}
Region.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  onCropStart: PropTypes.func.isRequired,
  handles: PropTypes.bool,
  changing: PropTypes.bool,
  dataRenderer: PropTypes.func,
  data: PropTypes.object,
  customStyle: PropTypes.object,
};

export default Region;
