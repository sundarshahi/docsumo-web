import React, { Fragment, memo, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { actions as documentActions } from 'new/redux/documents/actions';

import cx from 'classnames';
import _ from 'lodash';

import styles from './bboxes.scss';

const SuggestionBbox = memo(
  (props) => {
    const { bbox, isLineItem, gridView } = props;

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
      prevProps.gridView === nextProps.gridView &&
      prevProps.isLineItem === nextProps.isLineItem
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
  const dispatch = useDispatch();
  const focusTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (focusTimerRef.current) {
        clearTimeout(focusTimerRef.current);
      }
    };
  }, []);

  const {
    bbox,
    activeBox,
    chatAIBox,
    isLineItem,
    gridView,
    bboxClickType,
    handleBboxViewer,
  } = props;
  const { fieldId, rectanglePercentages, isSelectedField, isAlready, field } =
    bbox;

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
    },
    {
      [styles.fieldValueBboxGridMode]: isLineItem && gridView,
    }
  );

  const handleFieldBoxClick = async (e) => {
    e.stopPropagation();
    if (focusTimerRef.current) {
      clearTimeout(focusTimerRef.current);
    }
    const { subPType = '', subPId = '', id = '', parentId = '' } = field;
    if (subPType === 'line_item') {
      var lineItemSection = document.getElementById(
        `sidebar-section-field-${subPId}`
      );
      await dispatch(
        documentActions.rtSetSelectedFieldId({
          sectionFieldId: parentId,
          lineItemRowId: null,
          fieldId: id,
          lineItemFooterBtn: null,
        })
      );
      lineItemSection.click();

      focusTimerRef.current = setTimeout(() => {
        var lineItemField = document.getElementById(
          `line-item-field-input-${id}`
        );
        lineItemField?.focus();
      }, 10);

      focusTimerRef.current = setTimeout(() => {
        //Get the target field input box
        const targetDiv = document.getElementById('rt-field-input-box');

        if (targetDiv) {
          //Get the reference for the document wrapper
          const container = document.getElementById('rt-document-wrapper');
          const targetDivOffset = targetDiv.offsetTop - 140;

          container.scrollTop = targetDivOffset;
        }
        handleBboxViewer('canvas_click');
      }, 100);
    } else {
      var inputElement = document.getElementById(`sidebar-field-input-${id}`);
      inputElement?.focus();

      await dispatch(
        documentActions?.rtSetSelectedFieldId({
          sectionFieldId: parentId,
          lineItemRowId: null,
          fieldId: id,
          lineItemFooterBtn: null,
        })
      );
    }

    focusTimerRef.current = setTimeout(() => {
      const sidebarContentNode = document.getElementById('rt-sidebar-content');
      const sectionFieldNode = document.getElementById(
        `sidebar-section-field-${subPType === 'line_item' ? subPId : id}`
      );
      const sidebarViewportHeight = sidebarContentNode.clientHeight;

      const scrollToMiddle =
        sectionFieldNode.offsetTop -
        sidebarViewportHeight / 2 +
        sectionFieldNode.offsetHeight / 2;

      sidebarContentNode.scrollTop = scrollToMiddle;
    }, 10);
  };

  return (
    <div
      role='presentation'
      id={`field-value-bbox-${fieldId}`}
      className={className}
      style={style}
      data-hj-allow
      onClick={(e) => handleFieldBoxClick(e)}
    />
  );
};

const FieldValueBboxes = (props) => {
  const {
    bboxes,
    activeBox,
    chatAIBox,
    isLineItem,
    gridView,
    bboxClickType,
    handleBboxViewer,
  } = props;
  return (
    <Fragment>
      {bboxes.map((bbox) => {
        return (
          <FieldValueBbox
            key={bbox.fieldId}
            bbox={bbox}
            activeBox={activeBox}
            chatAIBox={chatAIBox}
            isLineItem={isLineItem}
            gridView={gridView}
            bboxClickType={bboxClickType}
            handleBboxViewer={handleBboxViewer}
          />
        );
      })}
    </Fragment>
  );
};

export { FieldValueBbox, FieldValueBboxes, SuggestionBboxes };
