import React, { Fragment, memo } from 'react';

import cx from 'classnames';
import _ from 'lodash';

import styles from './bboxes.scss';

const SuggestionBbox = memo(
  (props) => {
    const {
      bbox,
      isLineItem,
      gridView,
      // onClick,
    } = props;

    const { uuid, position } = bbox;

    const { top, left, width, height } = position;

    const style = {
      top: `${top}%`,
      left: `${left}%`,
      width: `${width}%`,
      height: `${height}%`,
    };

    return (
      <div
        role='presentation'
        data-suggestion-bbox-uuid={uuid}
        className={cx(styles.suggestionBbox, 'js-suggestion-bbox-item', {
          [styles.suggestionBboxNonGridMode]: isLineItem && !gridView,
        })}
        style={style}
        data-hj-allow
      />
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.bbox.uuid === nextProps.bbox.uuid &&
      prevProps.gridView === nextProps.gridView
    );
  }
);

const SuggestionBboxes = memo((props) => {
  const {
    suggestionBboxesByPage,
    onBboxClick,
    isLineItem,
    gridView,
    visiblePages,
  } = props;

  return (
    <Fragment>
      {visiblePages.map((pageNumber) => {
        return Array.isArray(suggestionBboxesByPage[pageNumber])
          ? suggestionBboxesByPage[pageNumber].map((bbox) => {
              return (
                <SuggestionBbox
                  key={bbox.uuid}
                  bbox={bbox}
                  onClick={onBboxClick}
                  isLineItem={isLineItem}
                  gridView={gridView}
                />
              );
            })
          : null;
      })}
    </Fragment>
  );
});

const FieldValueBbox = (props) => {
  const { bbox, activeBox, chatAIBox } = props;

  const { fieldId, rectanglePercentages, isSelectedField, isAlready } = bbox;

  const [x1Percentage, y1Percentage, x2Percentage, y2Percentage] =
    rectanglePercentages;

  const top = _.round(y1Percentage, 4);
  const left = _.round(x1Percentage, 4);
  const width = _.round(x2Percentage - x1Percentage, 4);
  const height = _.round(y2Percentage - y1Percentage, 4);

  const style = {
    top: `${top}%`,
    left: `${left}%`,
    width: `${width}%`,
    height: `${height}%`,
  };

  const className = cx(
    styles.fieldValueBbox,
    {
      [styles.isSelectedField]: isSelectedField,
    },
    {
      [styles.isSearched]: !fieldId,
    },
    {
      [styles.isActiveBox]: activeBox,
    },
    {
      [styles.isAlready]: isAlready,
    },
    {
      [styles.chatAIBox]: chatAIBox,
    }
  );

  return (
    <div
      role='presentation'
      id={`field-value-bbox-${fieldId}`}
      className={className}
      style={style}
      data-hj-allow
    />
  );
};

const FieldValueBboxes = (props) => {
  const { bboxes, activeBox, chatAIBox } = props;

  return (
    <Fragment>
      {bboxes.map((bbox) => {
        return (
          <FieldValueBbox
            key={bbox.fieldId}
            bbox={bbox}
            activeBox={activeBox}
            chatAIBox={chatAIBox}
          />
        );
      })}
    </Fragment>
  );
};

export { FieldValueBbox, FieldValueBboxes, SuggestionBboxes };
