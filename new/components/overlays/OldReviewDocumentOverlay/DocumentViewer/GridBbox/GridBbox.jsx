import React, { memo, useEffect, useMemo, useState } from 'react';

import cx from 'classnames';
import { Plus } from 'iconoir-react';
import Button from 'new/ui-elements/Button/Button';
import { usePopper } from 'react-popper';

import DropdownPortal from '../DropdownPortal';

import styles from './GridBbox.scss';

const GridBbox = memo(
  ({ bbox, hideAllGridBBoxes }) => {
    const [referenceElement, setReferenceElement] = React.useState(null);
    const [popperElement, setPopperElement] = React.useState(null);
    const [buttonPopperElement, setButtonPopperElement] = React.useState(null);
    const [isInnerChildInBox, setInnerChildInBox] = useState(false);

    const { uuid, position } = bbox;

    const { styles: popperStyles, attributes } = usePopper(
      referenceElement,
      popperElement,
      {
        strategy: 'absolute',
        placement: 'top-start',
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

    const customOffset = React.useMemo(
      () => ({
        name: 'offset',
        options: {
          offset: ({ placement, reference, popper }) => {
            if (placement === 'right-start') {
              return [0, 10];
            } else {
              return [0, 8];
            }
          },
        },
      }),
      []
    );

    const { styles: buttonPopperStyles, attributes: buttonPopperAttributes } =
      usePopper(referenceElement, buttonPopperElement, {
        strategy: 'absolute',
        placement: 'right-start',
        modifiers: [
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['top-end'],
              allowedAutoPlacements: [],
            },
          },
          customOffset,
        ],
      });

    useEffect(() => {
      if (hideAllGridBBoxes) {
        setInnerChildInBox(false);
      }
    }, [hideAllGridBBoxes]);

    const handleMouseEnter = (e) => {
      setInnerChildInBox(true);
    };

    const handleMouseLeave = (e) => {
      const { x, y, height, width } = e.target.getBoundingClientRect();
      const mouseLeavePosX = e.pageX;
      const mouseLeavePosY = e.pageY;

      const xStart = x;
      const yStart = y;
      const xEnd = xStart + width;
      const yEnd = yStart + height;

      if (
        mouseLeavePosX >= xStart &&
        mouseLeavePosX <= xEnd &&
        mouseLeavePosY >= yStart &&
        mouseLeavePosY <= yEnd
      ) {
        setInnerChildInBox(true);
      } else {
        setInnerChildInBox(false);
      }
    };

    const style = useMemo(
      () => ({
        top: `calc(${position.top}%)`,
        left: `${position.left}%`,
        width: `calc(${position.width}%)`,
        height: `calc(${position.height}%)`,
      }),
      [position]
    );

    return (
      <div
        role='presentation'
        className={cx(styles.gridBbox, 'js-grid-bbox-item', {
          [styles['gridBbox--hover']]: isInnerChildInBox,
        })}
        style={style}
        data-hj-allow
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={setReferenceElement}
      >
        <div className={styles.gridBbox_lines} />

        {isInnerChildInBox && (
          <DropdownPortal>
            {/* Hoverable Elements */}
            <div
              ref={setPopperElement}
              style={popperStyles.popper}
              {...attributes.popper}
              className={styles.gridBbox_tooltip}
            >
              <span>
                Click on the add button to add this to your existing table
              </span>
            </div>

            {/* Button */}
            <div
              ref={setButtonPopperElement}
              style={buttonPopperStyles.popper}
              {...buttonPopperAttributes.popper}
              className={styles.btnGrp}
            >
              <Button
                icon={Plus}
                className={cx(styles.tagGridBtn, 'js-grid-bbox-add')}
                id='ds-grid-add-button'
                iconClassName={styles.tagGridBtn__icon}
                data-grid-bbox-uuid={uuid}
              >
                Add
              </Button>
            </div>
          </DropdownPortal>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.bbox.uuid === nextProps.bbox.uuid &&
      prevProps.hideAllGridBBoxes === nextProps.hideAllGridBBoxes
    );
  }
);

export default GridBbox;
