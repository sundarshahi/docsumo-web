import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions as documentActions } from 'new/redux/oldDocuments/actions';

import cx from 'classnames';
import { NavArrowDown, NavArrowUp, WarningTriangle } from 'iconoir-react';
import _ from 'lodash';
import { ReactComponent as VerticalEllipsisIcon } from 'new/assets/images/icons/ellipsis.svg';
import { ReactComponent as IconDrag } from 'new/assets/images/icons/icon-drag.svg';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Input from 'new/ui-elements/Input/Input';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import Dropdown from '../Dropdown';
import PopMenu from '../PopMenu/PopMenu';

import styles from './TableField.scss';

const TableField = (props) => {
  const {
    docId,
    docType,
    field,
    fieldsById,
    selectedFieldId,
    dataTypes,
    selectedDropdownId,
    onFilterBtnClick,
    changeSelectedDropdownId,
    setFieldKey,
    onFooterFieldInputSubmit,
    onFooterFieldInputValueChange,
    sectionId,
    onLineFieldInputFocus,
    onDeleteSectionField,
    loadingFieldId,
    changeDataTypeMixpanelTrack,
    handlePopupMenuMixpanelTrack,
    toggleDropdownMixpanelTrack,
    handleFilterClickMixpanelTrack,
  } = props;
  const dispatch = useDispatch();
  const reviewTool = useSelector((state) => state?.documents?.reviewTool);
  const lineItemField = fieldsById[reviewTool?.selectedFieldId] || {};
  const addColumnInputRef = useRef(null);
  const cursorRef = useRef(null);
  const [columnName, setColumnName] = useState('');
  const [showPopupMenu, setShowPopupMenu] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [divPosition, setDivPosition] = useState({});
  const [submittingColumnValue, setSubmittingColumnValue] = useState(false);
  const [isFilterOverlayOpen, setIsFilterOverlayOpen] = useState(false);
  const [columnAdded, setColumnAdded] = useState(false);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination?.index === source?.index) {
      return;
    }

    const postData = {
      docType: docType,
      dragResult: result,
      data: {
        field_id: draggableId,
        order: destination.index + 1,
        parent_id: sectionId,
        sub_p_id: destination.droppableId,
      },
    };

    dispatch(documentActions.changeFieldOrder(postData));
  };

  useEffect(() => {
    const labelElement = document.getElementById(
      `line-item-field-input-${selectedFieldId}`
    );
    if (labelElement && _.isNumber(cursorRef?.current)) {
      labelElement.selectionEnd = cursorRef.current;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineItemField.uiLabel]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeDropdown(e);
    }
  };

  const closeDropdown = (e) => {
    changeSelectedDropdownId(null);
    handleClose();
  };

  const handleInputFocus = (id) => {
    if (selectedFieldId === id) return;
    onLineFieldInputFocus({
      rowId: id,
      fieldId: id,
      isLabelSelected: true,
    });
  };

  const handleInputBlur = (e, id) => {
    dispatch(documentActions.setLoadingFieldId({ id }));
    handleLabelSubmit(e, id, false);
  };

  const handleLabelChange = (e, id) => {
    let inputValue = e.target?.value;
    const newCursor = e.target.selectionStart;
    cursorRef.current = newCursor;
    const inputValueWithTrim = inputValue.trim();

    if (inputValueWithTrim === '') {
      inputValue = '';
    }
    setFieldKey({ fieldId: id, value: inputValue });
    onFooterFieldInputValueChange({
      fieldId: id,
      label: inputValue,
    });
  };

  const handleLabelSubmit = (e, id, next) => {
    e.preventDefault();
    onFooterFieldInputSubmit({ fieldId: id });
    toggleDropdown(id);
  };

  const handleColumnNameChange = (e) => {
    const inputValue = e.target.value;
    const inputValueWithTrim = inputValue.trim();

    if (inputValueWithTrim !== '') {
      setColumnName(inputValue);
    } else {
      if (columnName !== '') {
        setColumnName('');
      }
    }
  };

  const handleKeyPress = (e) => {
    const { key } = e;
    if (key === 'Enter' && columnName.length) {
      submitColumnNameValue();
      setColumnAdded(true);
    }
  };

  const handleColumnBlurEvent = () => {
    if (columnName.length) {
      submitColumnNameValue();
    }
  };

  const submitColumnNameValue = async () => {
    const { type, id } = field;
    setSubmittingColumnValue(true);

    dispatch(
      documentActions.addFooterColumn({
        sectionId,
        sectionFieldId: id,
        docType,
        docId,
        type,
        label: columnName,
        afterAction: (columnId) => {
          setColumnName('');
          changeSelectedDropdownId(columnId);
          setSubmittingColumnValue(false);
        },
        errorAfterAction: (e) => {
          dispatch(documentActions.resetLoadingFieldId());
          setSubmittingColumnValue(false);
        },
      })
    );
  };
  const WIDTH_OFFSET = 40;
  const HEIGHT_OFFSET = 27;
  const POPOVER_HEIGHT = 480;
  const handleFilterClick = (lineItemId) => {
    const lineItemField = fieldsById[lineItemId] || {};
    const { id, type } = lineItemField;
    handleFilterClickMixpanelTrack(true);
    let parentDivRect =
      document.getElementById(`edit-ellipsis-field-${id}`) || {};

    parentDivRect = parentDivRect.getBoundingClientRect();

    let parentDivPosition = {
      top: parentDivRect?.top + HEIGHT_OFFSET,
      left: parentDivRect?.left + WIDTH_OFFSET,
    };
    if (parentDivPosition.top < 0) {
      parentDivPosition.top = 0;
    } else if (parentDivPosition.top + POPOVER_HEIGHT > window.innerHeight) {
      parentDivPosition.top = window.innerHeight - POPOVER_HEIGHT;
    }

    setDivPosition(parentDivPosition);
    onFilterBtnClick({
      filterType: type,
      fieldId: id,
      docType,
    });
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (showPopupMenu) {
      let parentDivRect =
        document.getElementById(`table-field-${currentId}`) || {};

      parentDivRect = parentDivRect.getBoundingClientRect();
      const popupElement =
        document.getElementById(`edit-field-more-dd-${currentId}`) || {};

      popupElement.style.left = `${parentDivRect?.right + 13}px`;
      popupElement.style.top = `calc(${parentDivRect?.top}px`;
    }
    if (columnAdded && !selectedDropdownId) {
      addColumnInputRef?.current?.focus();
      setColumnAdded(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPopupMenu, selectedDropdownId]);

  const handlePopupMenu = (id) => {
    handlePopupMenuMixpanelTrack(true);
    setCurrentId(id);
    setShowPopupMenu(true);
  };

  const handleClose = () => {
    setCurrentId('');
    setShowPopupMenu(false);
  };
  const handleMoreOption = (key, sectionId) => {
    if (key === 'delete') {
      onDeleteSectionField({
        id: sectionId || field.id,
      });
      handleClose();
    }
  };

  const renderLabelField = (lineItemId) => {
    const lineItemField = fieldsById[lineItemId] || {};
    const { id, uiLabel } = lineItemField;
    return (
      <form
        method='post'
        autoComplete='off'
        className={styles.form}
        onSubmit={(e) => handleLabelSubmit(e, id, true)}
      >
        <>
          <input
            id={`line-item-field-input-${id}`}
            type='text'
            value={uiLabel}
            title={uiLabel}
            className={cx(styles.input)}
            tabIndex='-1'
            autoComplete='off'
            onFocus={() => handleInputFocus(id)}
            onBlur={(e) => {
              e.persist();
              handleInputBlur(e, id);
            }}
            onChange={(e) => handleLabelChange(e, id)}
          />
          <span
            className={cx('mr-1', 'ellipsis', styles.inputLabel, {
              [styles['inputLabel--selected']]: currentId === lineItemId,
            })}
            role='presentation'
            title={uiLabel}
          >
            {uiLabel}
          </span>
        </>
      </form>
    );
  };

  const toggleDropdown = (id = null) => {
    id && toggleDropdownMixpanelTrack();
    changeSelectedDropdownId(id);
  };

  const changeDataType = (dataType, fieldId) => {
    const postData = {
      docType: docType,
      fieldId: fieldId,
      data: { data_type: dataType },
    };
    changeDataTypeMixpanelTrack(dataType);

    dispatch(documentActions.changeFieldType(postData));
    toggleDropdown();
  };

  const filterHandler = (value) => {
    setIsFilterOverlayOpen(value);
  };

  const tableDataTypes = useMemo(() => {
    return dataTypes.filter((option) => option.type !== 'line_item');
  }, [dataTypes]);

  return (
    <div className={styles.table}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={String(field.id)} direction='vertical'>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {field.lineItemColumns.map(({ id }, index) => {
                return (
                  <Draggable key={id} draggableId={String(id)} index={index}>
                    {(provided) => (
                      <>
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                          }}
                          className={cx(styles.table__column, {
                            [styles['table__column--selected']]:
                              selectedDropdownId === id,
                          })}
                          role='presentation'
                          id={`table-field-${id}`}
                        >
                          <div className={styles.lhs}>
                            <span
                              {...provided.dragHandleProps}
                              className={styles.table__dragIcon}
                            >
                              <IconDrag />
                            </span>
                            {fieldsById[id]?.errorMessage && (
                              <div className={styles.tooltip}>
                                <Tooltip
                                  label={
                                    fieldsById[id]?.errorMessage ||
                                    'The format is not valid.'
                                  }
                                  className={styles['tooltip__errorIcon']}
                                  placement='right'
                                  colorScheme='error'
                                >
                                  <WarningTriangle
                                    className={styles.tooltip__errorIcon}
                                  />
                                </Tooltip>
                              </div>
                            )}
                            <div>{renderLabelField(id)}</div>
                          </div>
                          <div className={styles.rhs}>
                            {id === loadingFieldId ? (
                              <IconButton
                                icon=''
                                variant='text'
                                className={styles.rhs__loaderIcon}
                                isLoading={loadingFieldId}
                              />
                            ) : (
                              /* eslint-disable-next-line jsx-a11y/click-events-have-key-events */
                              <div
                                id={`selected-field-type-${id}`} // id for elements which triggers dropdown
                                className={cx(styles.rhs__fieldType, 'mr-2', {
                                  [styles['rhs__fieldType--selected']]:
                                    selectedDropdownId === id,
                                })}
                                onClick={() => toggleDropdown(id)}
                                role='button'
                                tabIndex={0}
                              >
                                {tableDataTypes.find(
                                  (dataType) =>
                                    dataType.type === fieldsById[id]?.type
                                )?.label || fieldsById[id]?.type}

                                <span
                                  className={cx(
                                    styles['rhs__fieldType-icon'],
                                    'mt-1'
                                  )}
                                >
                                  {selectedDropdownId === id ? (
                                    <NavArrowUp />
                                  ) : (
                                    <NavArrowDown />
                                  )}
                                </span>
                              </div>
                            )}
                            {selectedDropdownId === id ? (
                              <Dropdown
                                id={`edit-drop-field-${id}`}
                                options={tableDataTypes}
                                value={fieldsById[id]?.type}
                                selectedDropdownId={selectedDropdownId}
                                onOutsideClick={toggleDropdown}
                                onOptionClick={(type) =>
                                  changeDataType(type, id)
                                }
                              />
                            ) : null}

                            <span
                              className={cx(
                                'mr-2 mt-1 cursor-pointer',
                                styles.rhs__icon,
                                styles.rhs__ellipsisIcon,
                                {
                                  [styles['rhs__ellipsisIcon--selected']]:
                                    currentId === id,
                                },
                                {
                                  [styles[
                                    'rhs__ellipsisIcon--selected--popup'
                                  ]]: showPopupMenu && !isFilterOverlayOpen,
                                }
                              )}
                              id={`edit-ellipsis-field-${id}`}
                            >
                              <VerticalEllipsisIcon
                                onClick={() => handlePopupMenu(id)}
                              />
                            </span>
                          </div>
                        </div>
                        {showPopupMenu && currentId === id && (
                          <PopMenu
                            parentDivPosition={divPosition}
                            handleOptionClick={handleMoreOption}
                            sectionId={id}
                            id={`edit-field-more-dd-${id}`}
                            handleClose={handleClose}
                            handleFilterClick={() => handleFilterClick(id)}
                            isLineItem={false}
                            className={styles.popup}
                            filterHandler={filterHandler}
                          />
                        )}
                      </>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
              <div
                className={cx(
                  styles.addColumn,
                  'd-flex',
                  'justify-content-between'
                )}
              >
                <Input
                  ref={addColumnInputRef}
                  placeholder='+Add column'
                  id={`footer-add-line-btn-${sectionId}`}
                  tabIndex={-1}
                  className={styles.addColumn__input}
                  value={columnName}
                  disabled={submittingColumnValue}
                  onChange={handleColumnNameChange}
                  onKeyDown={handleKeyPress}
                  onBlur={handleColumnBlurEvent}
                />
                {submittingColumnValue && (
                  <IconButton
                    icon=''
                    variant='text'
                    className={styles.addColumn__loader}
                    isLoading={submittingColumnValue}
                  />
                )}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default TableField;
