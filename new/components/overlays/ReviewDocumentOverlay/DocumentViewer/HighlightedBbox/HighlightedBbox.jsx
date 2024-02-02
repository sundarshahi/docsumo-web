import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { actions as documentActions } from 'new/redux/documents/actions';

import cx from 'classnames';
import _ from 'lodash';
import { REGION_PADDING_BOX } from 'new/constants/document';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import { mixpanelTrackingAllEvents } from 'new/utils/mixpanel';
import { usePopper } from 'react-popper';

import DocumentPortal from '../DocumentPortal';

import styles from './HighlightedBbox.scss';

const HighlightedBbox = (props) => {
  const dispatch = useDispatch();
  const focusTimerRef = useRef(null);
  const [popperElement, setPopperElement] = React.useState(null);
  const [referenceElement, setReferenceElement] = React.useState(null);

  const { styles: popperStyles, attributes } = usePopper(
    referenceElement,
    popperElement,
    {
      strategy: 'absolute',
      placement: 'top',
      modifiers: [
        {
          name: 'flip',
          options: {
            fallbackPlacements: [],
            allowedAutoPlacements: [],
          },
        },
        {
          name: 'offset',
          options: {
            offset: [0, 5],
          },
        },
      ],
    }
  );

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
    selectedSectionFieldId,
  } = props;
  const { fieldId, rectanglePercentages, isSelectedField, isAlready, field } =
    bbox;

  const fieldValueBoxRef = useRef();
  const [isBboxHovered, setIsBboxHovered] = useState(false);

  const [x1Percentage, y1Percentage, x2Percentage, y2Percentage] =
    rectanglePercentages;

  const {
    lowConfidence = null,
    content = null,
    subPTitle = null,
    label = null,
  } = field || {};

  const { isValidFormat = null } = content || {};

  const top = _.round(y1Percentage, 4);
  const left = _.round(x1Percentage, 4);
  const width = _.round(x2Percentage - x1Percentage, 4);
  const height = _.round(y2Percentage - y1Percentage, 4);

  const isFieldEmpty = field?.content?.value === '';

  const style = {
    top: `calc(${top}% - ${REGION_PADDING_BOX.TOP}px)`,
    left: `calc(${left}% - ${REGION_PADDING_BOX.LEFT}px)`,
    width: `calc(${width}% + ${REGION_PADDING_BOX.WIDTH}px)`,
    height: `calc(${height}% + ${REGION_PADDING_BOX.HEIGHT}px)`,
  };

  const className = cx(
    styles.fieldValueBbox,
    'js-highlighted-bbox-item',
    {
      [styles.erroredBbox]: !gridView && !isValidFormat,

      [styles.debitRegionBbox]:
        !gridView &&
        subPTitle &&
        field?.label === 'debit' &&
        !isFieldEmpty &&
        isValidFormat &&
        !isSelectedField,

      [styles.creditRegionBbox]:
        !gridView &&
        subPTitle &&
        field?.label === 'credit' &&
        !isFieldEmpty &&
        !isSelectedField,

      [styles.transactionEntryBbox]:
        !gridView &&
        subPTitle &&
        (field?.label === 'credit' || field?.label === 'debit') &&
        !isFieldEmpty &&
        isSelectedField,

      [styles.highConfidenceRegionBbox]:
        !lowConfidence && !isFieldEmpty && !gridView,

      [styles.lowConfidenceRegionBbox]:
        lowConfidence && !isFieldEmpty && !gridView,

      [styles.hoverFieldEmptyBbox]: !isFieldEmpty,

      [styles.isSearched]: !fieldId,

      [styles.isActiveBox]: activeBox,

      [styles.isAlready]: isAlready,

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
      if (selectedSectionFieldId !== subPId) {
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
      }

      focusTimerRef.current = setTimeout(() => {
        var lineItemField = document.getElementById(
          `line-item-field-input-${id}`
        );
        lineItemField?.focus();
      }, 10);

      focusTimerRef.current = setTimeout(() => {
        handleBboxViewer('canvas_click');
      }, 100);

      focusTimerRef.current = setTimeout(() => {
        //Get the target field input box
        const targetDiv = document.getElementById('rt-field-input-box');

        if (targetDiv) {
          const container = document.getElementById('rt-document-wrapper');
          const footerDiv = document.getElementById('js-footer-wrapper');
          const inputBoxBottom = targetDiv.offsetTop + targetDiv.clientHeight;
          const footerBottom = footerDiv.offsetTop + footerDiv.clientHeight;

          if (inputBoxBottom > footerBottom) {
            container.scrollTop =
              targetDiv.offsetTop -
              (container.clientHeight - targetDiv.clientHeight);
          }
        }
      }, 300);
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
    mixpanelTrackingAllEvents(MIXPANEL_EVENTS.canvas_aws_cell);
  };
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (
        e.target.closest('#rt-document-portal') ||
        !fieldValueBoxRef.current ||
        e.target.closest('#rt-field-input-box') ||
        !e.target.closest('#rt-document-wrapper')
      ) {
        setIsBboxHovered(false);
        return;
      }
      const mousePosX = e.pageX;
      const mousePosY = e.pageY;

      const { x, y, width, height } =
        fieldValueBoxRef.current.getBoundingClientRect();

      const xStart = x;
      const yStart = y;
      const xEnd = xStart + width;
      const yEnd = yStart + height;

      if (
        mousePosX >= xStart &&
        mousePosX <= xEnd &&
        mousePosY >= yStart &&
        mousePosY <= yEnd
      ) {
        const tooltip = document.getElementsByClassName('js-fieldbox-tooltip');

        if (tooltip.length === 0) {
          setIsBboxHovered(true);
        }
      } else {
        setIsBboxHovered(false);
      }
    };

    document.body.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.body.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
    <div
      ref={fieldValueBoxRef}
      role='presentation'
      id={`field-value-bbox-${fieldId}`}
      className={className}
      style={style}
      data-hj-allow
      onClick={(e) => handleFieldBoxClick(e)}
    >
      <div ref={setReferenceElement}>
        {isBboxHovered && !isFieldEmpty && !gridView && (
          // stack tooltip on top of highlighted bbox
          <DocumentPortal>
            <div
              ref={setPopperElement}
              className={cx(styles.tooltip, 'js-fieldbox-tooltip')}
              style={popperStyles.popper}
              {...attributes.popper}
            >
              {
                <div className={cx(styles.tooltip__colName, 'mb-1')}>
                  {label}
                  {(label === 'credit' || label === 'debit') && (
                    <span
                      className={cx('ml-1', {
                        [styles.tooltip__creditPrimaryDot]: label === 'credit',
                        [styles.tooltip__debitPrimaryDot]: label === 'debit',
                      })}
                    />
                  )}
                </div>
              }
              <span>
                {field?.content?.value.length > 39
                  ? String(field?.content?.value).substring(0, 39) + '..'
                  : field?.content?.value}
              </span>
            </div>
          </DocumentPortal>
        )}
      </div>
    </div>
  );
};

export default HighlightedBbox;
