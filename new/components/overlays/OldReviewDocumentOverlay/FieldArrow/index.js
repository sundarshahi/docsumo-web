import React, { Component } from 'react';

import { Circle, Layer, Line, Rect, Stage } from 'react-konva';
// import _ from 'lodash';

const BANNER_HEIGHT = 36;

class FieldArrow extends Component {
  sharedCircleProps = {
    radius: 5,
    stroke: '#4d61fc',
    strokeWidth: 2,
  };
  sharedLineProps = {
    stroke: '#4d61fc',
    strokeWidth: 2,
    lineJoin: 'round',
    lineCap: 'round',
  };
  sharedRectProps = {
    stroke: '#4d61fc',
    strokeWidth: 2,
  };

  renderNodes = () => {
    const {
      docReadOnly,
      sectionFieldId,
      lineItemRowId,
      fieldId,
      sectionFieldDomRect,
      fieldBboxDomRect,
      skipRendering,
    } = this.props;

    if (skipRendering) {
      return null;
    }

    if (!sectionFieldId || !sectionFieldDomRect) {
      return null;
    }

    if (!fieldId || !fieldBboxDomRect) {
      return null;
    }

    const drawOnlyBox = lineItemRowId ? true : false;

    const startPosition = {
      x: sectionFieldDomRect.left + sectionFieldDomRect.width + 10,
      y: sectionFieldDomRect.top + sectionFieldDomRect.height / 2,
    };

    const endPosition = {
      x: fieldBboxDomRect.left,
      y: fieldBboxDomRect.top,
    };

    if (docReadOnly) {
      startPosition.y = startPosition.y - BANNER_HEIGHT;
      endPosition.y = endPosition.y - BANNER_HEIGHT;
    }

    const nodes = [];

    // Circle adjacent to the field
    const circleRadius = this.sharedCircleProps.radius;
    const circlePosition = {
      x: startPosition.x + circleRadius,
      y: startPosition.y,
    };
    const circleProps = {
      ...circlePosition,
      ...this.sharedCircleProps,
    };
    !drawOnlyBox && nodes.push(<Circle {...circleProps} key='circle' />);

    // Line always starts from here
    const lineStartPosition = {
      x: startPosition.x + 2 * circleRadius,
      y: startPosition.y,
    };

    // This is where line meets the region
    // Subtracting 1px because box is drawn outside the region
    const lineEndPosition = {
      x: endPosition.x - 1,
      y: endPosition.y - 1,
    };

    const lineStartPoint = [0, 0];
    let lineCentralPoint = [];
    const lineEndPoint = [
      lineEndPosition.x - lineStartPosition.x,
      lineEndPosition.y - lineStartPosition.y,
    ];

    if (lineEndPosition.x > lineStartPosition.x) {
      const xDiff = lineEndPosition.x - lineStartPosition.x;
      if (xDiff > 100) {
        lineCentralPoint = [xDiff / 2, 0];
      }
    }

    const linePoints = [
      ...lineStartPoint,
      ...lineCentralPoint,
      ...lineEndPoint,
    ];
    const lineProps = {
      ...lineStartPosition,
      ...this.sharedLineProps,
      points: linePoints,
    };
    !drawOnlyBox && nodes.push(<Line {...lineProps} key='line' />);

    if (docReadOnly) {
      // Bbox Rectangle
      // Subtracting 1px because box is drawn outside the region
      const rectProps = {
        ...this.sharedRectProps,
        x: fieldBboxDomRect.left - 1,
        y: fieldBboxDomRect.top - 1 - BANNER_HEIGHT,
        width: fieldBboxDomRect.width + 2,
        height: fieldBboxDomRect.height + 2,
      };
      nodes.push(<Rect {...rectProps} key='rect' />);
    }

    return nodes;
  };

  render() {
    const { windowInnerWidth, windowInnerHeight } = this.props;

    const canvasStyle = {
      position: 'absolute',
      zIndex: 0,
      pointerEvents: 'none',
    };
    return (
      <Stage
        width={windowInnerWidth}
        height={windowInnerHeight}
        style={canvasStyle}
      >
        <Layer>{this.renderNodes()}</Layer>
      </Stage>
    );
  }
}

export default FieldArrow;
