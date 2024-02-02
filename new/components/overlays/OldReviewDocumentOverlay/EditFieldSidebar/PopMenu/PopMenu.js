/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import cx from 'classnames';
import { Settings, Trash } from 'iconoir-react';
import FilterOverlay from 'new/components/overlays/FilterOverlay';
import Popover from 'new/components/widgets/popover';
import OutsideClickHandler from 'react-outside-click-handler';

import styles from './popMenu.scss';
const PopMenu = (props) => {
  const {
    parentDivPosition,
    handleOptionClick,
    id,
    handleClose,
    handleFilterClick,
    isLineItem,
    isHidden,
    className,
    sectionId = null,
    filterHandler,
    changeDataTypeFromSettings,
  } = props;
  const { fieldsById } = useSelector((state) => state.documents.reviewTool);
  const oneField = Object.keys(fieldsById).length === 1;
  const [isOpen, setIsOpen] = useState(false);
  const [overRide, setOverRide] = useState(false);
  const handleOutsideClick = () => {
    setIsOpen(false);
    filterHandler(false);
    handleClose();
  };
  const handleEmpty = () => {
    //console.log('Fake');
  };
  return (
    <OutsideClickHandler
      onOutsideClick={!isOpen ? handleOutsideClick : handleEmpty}
    >
      <div
        className={cx(styles.root, className, {
          [styles.root__single]:
            (isLineItem && !changeDataTypeFromSettings) || isHidden,
        })}
        id={id}
      >
        {(!isLineItem && !isHidden) || changeDataTypeFromSettings ? (
          <Popover
            content={
              <FilterOverlay
                closeMoreOption={handleOutsideClick}
                changeDataTypeFromSettings={changeDataTypeFromSettings}
                setOverRide={setOverRide}
              />
            }
            containerClassName={styles.containerClassName}
            contentClassName={styles.contentClassName}
            widepop={true}
            align={'start'}
            contentLocation={parentDivPosition}
            overRide={overRide}
          >
            <div
              className={styles.item}
              onClick={() => {
                setIsOpen(true);
                filterHandler(true);
                handleFilterClick(sectionId);
              }}
            >
              <span className={styles.item__icon}>
                <Settings />
              </span>
              <span className={styles.item__title}>Settings</span>
            </div>
          </Popover>
        ) : null}

        <div
          className={cx(styles.item, {
            [styles['item--disable']]: oneField,
          })}
          disabled={oneField}
          onClick={() =>
            oneField ? null : handleOptionClick('delete', sectionId)
          }
        >
          <span className={styles.item__icon}>
            <Trash />
          </span>
          <span className={styles.item__title}>Delete</span>
        </div>
      </div>
    </OutsideClickHandler>
  );
};

export default PopMenu;
