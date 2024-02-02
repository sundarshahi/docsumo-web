/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as documentActions } from 'new/redux/oldDocuments/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import {
  EyeEmpty,
  EyeOff,
  NavArrowDown,
  NavArrowUp,
  WarningTriangle,
} from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import { ReactComponent as ArrowActiveIcon } from 'new/assets/images/icons/arrow-active.svg';
import { ReactComponent as VerticalEllipsisIcon } from 'new/assets/images/icons/ellipsis.svg';
import { ReactComponent as IconDrag } from 'new/assets/images/icons/icon-drag.svg';
import { KEY_CODES } from 'new/constants/keyboard';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import { customMixpanelTracking } from 'new/utils/mixpanel';

import Dropdown from '../Dropdown';
import PopMenu from '../PopMenu/PopMenu';
import TableField from '../TableField/TableField';

import styles from './Field.scss';

const WIDTH_OFFSET = 40;
const HEIGHT_OFFSET = 27;
const POPOVER_HEIGHT = 480;

class Field extends Component {
  state = {
    isLabel: false,
    filterType: '',
    showTableContainer: false,
    showDropdown: false,
  };
  labelFieldRef = React.createRef();
  parentDivRef = React.createRef();
  filterOverlayRef = React.createRef();
  cursor = null;

  UNSAFE_componentWillMount() {
    const { filterData = [] } = this.props;
    let filterType = filterData.map((data) => data.type);
    filterType.push('percent');
    this.setState({
      filterType,
    });
  }

  componentDidMount() {
    const sidebarContent = document.getElementById('rt-sidebar-content');

    sidebarContent?.addEventListener('scroll', this.handleScroll);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentDidUpdate(prevProps) {
    const { fieldId, selectedSectionFieldId } = this.props;

    if (prevProps.selectedSectionFieldId !== selectedSectionFieldId) {
      if (fieldId !== selectedSectionFieldId) {
        this.setState({ showTableContainer: false });
      } else {
        this.setState({ showTableContainer: true });
      }
    }
    if (this.labelFieldRef.current) {
      if (
        _.isNumber(this.cursor) &&
        prevProps.field.uiLabel !== this.props.field.uiLabel
      ) {
        this.labelFieldRef.current.selectionEnd = this.cursor;
      }
    }
  }

  componentWillUnmount() {
    const sidebarContent = document.getElementById('rt-sidebar-content');
    document.removeEventListener('keydown', this.handleKeyDown);

    sidebarContent.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll = () => {
    if (this.state.showPopupMenu) {
      this.setState({
        showPopupMenu: false,
      });
      this.props.documentActions.changeDataTypeFromSettinsPopup(false);
    }
  };

  handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      this.closeDropdown(e);
    }

    if (
      this.props.isFieldSelected &&
      this.props.field?.type === 'line_item' &&
      !this.state.showTableContainer
    ) {
      if (e.keyCode === KEY_CODES.ENTER) {
        this.toggleTableContainer();
      }

      if (e.keyCode === KEY_CODES.TAB) {
        const newFieldId = this.getNextSectionFieldId(
          this.props.selectedSectionFieldId
        );
        this.props.onSidebarFieldInputFocus({
          fieldId: newFieldId,
        });
      }
    }
  };

  getNextSectionFieldId = (currentFieldId) => {
    const { sectionFieldIds } = this.props;

    const sectionLastFieldIndex = sectionFieldIds.indexOf(currentFieldId);

    let nextFieldIndex =
      sectionLastFieldIndex >= sectionFieldIds.length - 1
        ? 0
        : sectionLastFieldIndex + 1;

    return sectionFieldIds[nextFieldIndex];
  };

  closeDropdown = (e) => {
    this.props.changeSelectedDropdownId(null);
    this.labelFieldRef.current?.blur();
    this.setState({ showPopupMenu: false, isFilterOverlayOpen: false });
    this.props.documentActions.rtHideFilterInField({
      fieldId: this.props.fieldId,
    });
  };

  handleClick = () => {
    const { docReadOnly } = this.props;

    if (!docReadOnly) {
      return;
    }

    this.props.onSidebarReadOnlyFieldClick({
      fieldId: this.props.fieldId,
      disableInputFocus: true,
    });
  };

  handleInputFocus = () => {
    this.props.setFieldValue();
    this.props.setFieldKey();

    this.props.onSidebarFieldInputFocus({
      fieldId: this.props.fieldId,
      isLabelSelected: true,
    });
  };

  handleInputBlur = (e) => {
    this.props.documentActions.setLoadingFieldId({ id: this.props.fieldId });
    this.handleLabelSubmit(false, e);
  };

  handleLabelChange = (e) => {
    const { setFieldKey, fieldId, field } = this.props;
    this.cursor = e.target.selectionStart;

    let inputValue = e.target.value;
    const inputValueWithTrim = inputValue.trim();

    if (inputValueWithTrim === '') {
      inputValue = '';
    }
    setFieldKey({ fieldId, inputValue });

    this.props.onSidebarFieldInputValueChange({
      fieldId: fieldId,
      value: field.uiValue,
      label: inputValue,
      isLabelSelected: true,
    });
  };

  handleFormSubmit = (next, e) => {
    e.preventDefault();
    this.props.onSidebarFieldInputFormSubmit({
      fieldId: this.props.field.id,
      next,
    });
  };

  handleLabelSubmit = async (next, e) => {
    e.preventDefault();
    const { fieldId } = this.props;
    this.props.onSidebarFieldLabelFormSubmit({
      fieldId,
      next,
    });
  };

  toggleTableContainer = () => {
    this.setState(
      { showTableContainer: !this.state.showTableContainer },
      () => {
        this.props.onSidebarLineItemFieldClick({
          fieldId: this.props.fieldId,
        });
      }
    );
  };

  toggleDropdown = (id = null) => {
    id && this.toggleDropdownMixpanelTrack();
    this.props.changeSelectedDropdownId(id);
  };

  toggleDropdownMixpanelTrack = () => {
    const {
      config: { canSwitchToOldMode = true },
      user,
      docType = '',
      docId = '',
    } = this.props;
    mixpanel.track(MIXPANEL_EVENTS.datatype_dropdown_click, {
      docId: docId,
      docType: docType,
      'work email': user?.email,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  changeFieldOrder = (
    destinationIndex,
    sectionId,
    currentIndex,
    id,
    docType
  ) => {
    const result = {
      destination: {
        index: destinationIndex,
        droppableId: sectionId,
      },
      source: {
        index: currentIndex,
        droppableId: sectionId,
      },
      draggableId: id,
    };

    const postData = {
      docType: docType,
      dragResult: result,
      data: {
        field_id: id,
        order: result.destination.index + 1,
        parent_id: result.destination.droppableId,
      },
    };
    this.props.documentActions.changeFieldOrder(postData);
  };

  handleFieldVisibility = () => {
    const { documentActions, field, docType, sectionData, fieldsById } =
      this.props;
    const { fieldIds, id: sectionId } = sectionData;

    this.props.documentActions.rtSetSelectedFieldId({
      sectionFieldId: null,
      lineItemRowId: null,
      fieldId: null,
      lineItemFooterBtn: null,
    });

    let destinationIndex = fieldIds.length - 1;
    const { showTableContainer } = this.state;
    const { id, isHidden = false } = field;

    let updatedFields = fieldIds.slice().map(Number);

    const currentIndex = updatedFields.indexOf(id);

    const hiddenIndex = updatedFields.findIndex(
      (fieldId) => fieldsById[fieldId]?.isHidden
    );

    if (hiddenIndex !== -1) {
      destinationIndex = isHidden ? hiddenIndex : hiddenIndex - 1;
    }

    documentActions.changeFieldVisiblity({
      docType: docType,
      fieldId: id,
      is_hidden: !isHidden,
    });

    this.changeFieldOrder(
      destinationIndex,
      sectionId,
      currentIndex,
      id,
      docType,
      documentActions
    );

    if (field.type === 'line_item' && showTableContainer) {
      this.setState({ showTableContainer: false });
    }
    !isHidden
      ? this.trackMixPanel(MIXPANEL_EVENTS.hide_fields, id)
      : this.trackMixPanel(MIXPANEL_EVENTS.show_fields, id);
  };

  trackMixPanel = (evtName, fieldId) => {
    const {
      docType = '',
      docId = '',
      user: { email = '' },
      config: { canSwitchToOldMode },
    } = this.props;
    customMixpanelTracking(evtName, {
      docType,
      email,
      canSwitchUIVersion: canSwitchToOldMode,
      docId,
      fieldId,
    });
  };

  changeDataType = (dataType) => {
    const postData = {
      docType: this.props.docType,
      fieldId: this.props.field.id,
      data: { data_type: dataType },
    };
    this.changeDataTypeMixpanelTrack(dataType);
    this.props.documentActions.changeFieldType(postData);
    this.toggleDropdown();
    this.props.onAddFieldInputFocus();
  };

  changeDataTypeMixpanelTrack = (dataType) => {
    const {
      config: { canSwitchToOldMode = true },
      user,
      docType = '',
      docId = '',
    } = this.props;

    mixpanel.track(MIXPANEL_EVENTS.datatype_dropdown_value_click, {
      docId: docId,
      docType: docType,
      'work email': user?.email,
      version: 'new',
      'data type': dataType || '',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  handlePopupMenu = (id) => {
    const { field = {} } = this.props;
    this.handlePopupMenuMixpanelTrack();
    this.setState(
      {
        showPopupMenu: !this.state.showPopupMenu,
      },
      () => {
        if (this.state.showPopupMenu) {
          const parentDivRect =
            this.parentDivRef.current?.getBoundingClientRect();
          const popupElement =
            document.getElementById(`edit-field-more-dd-${field.id}`) || {};
          popupElement.style.left = `${parentDivRect?.left + 40}px`;
          popupElement.style.top = `calc(${parentDivRect?.top}px`;
          this.props.onSidebarReadOnlyFieldClick({
            fieldId: field.id,
            disableInputFocus: true,
          });
        }
      }
    );
  };

  handlePopupMenuMixpanelTrack = (tableField = false) => {
    const {
      field = {},
      config: { canSwitchToOldMode = true },
      user,
      docType = '',
      docId = '',
    } = this.props;
    const isLineItem =
      field?.type === 'line_item' || field.format === '%t' || tableField;
    mixpanel.track(MIXPANEL_EVENTS.kebab_menu_click, {
      docId: docId,
      docType: docType,
      'work email': user?.email,
      'field type': isLineItem ? 'table-field' : 'key-value',
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };
  handleClose = () => {
    this.setState({
      showPopupMenu: false,
    });
    this.props.documentActions.changeDataTypeFromSettinsPopup(false);
  };

  filterHandler = (value) => {
    this.setState({
      isFilterOverlayOpen: value,
    });
  };

  handleMoreOption = (key) => {
    const {
      onDeleteSectionField,
      field: { id },
    } = this.props;
    if (key === 'delete') {
      onDeleteSectionField({
        id,
      });
      this.props.documentActions.setLoadingFieldId({ id });
      this.handleClose();
    }
  };

  handleFilterClick = () => {
    const { docType, onSidebarReadOnlyFieldClick, field, onFilterBtnClick } =
      this.props;

    let { type, id, errorMessage, isHidden = false } = field;
    this.handleFilterClickMixpanelTrack();
    const parentDivRect = this.parentDivRef.current?.getBoundingClientRect();
    let parentDivPosition = {
      top: parentDivRect.top + HEIGHT_OFFSET,
      left: parentDivRect.left + WIDTH_OFFSET,
    };
    if (parentDivPosition.top < 0) {
      parentDivPosition.top = 0;
    } else if (parentDivPosition.top + POPOVER_HEIGHT > window.innerHeight) {
      parentDivPosition.top = window.innerHeight - POPOVER_HEIGHT;
    }

    this.setState({
      parentDivPosition,
    });
    onSidebarReadOnlyFieldClick({
      fieldId: id,
      disableInputFocus: true,
    });
    onFilterBtnClick({
      filterType: type,
      fieldId: id,
      docType,
    });
  };

  handleFilterClickMixpanelTrack = (tableField = false) => {
    const {
      field = {},
      config: { canSwitchToOldMode = true },
      user,
      docType = '',
      docId = '',
    } = this.props;
    const isLineItem =
      field?.type === 'line_item' || field.format === '%t' || tableField;
    mixpanel.track(MIXPANEL_EVENTS.kebab_menu_settings_click, {
      docId: docId,
      docType: docType,
      'work email': user?.email,
      'field type': isLineItem ? 'table-field' : 'key-value',
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  handleFocus = (id) => {
    this.props.setFieldValue();
    this.props.setFieldKey();

    this.props.onSidebarFieldInputFocus({
      fieldId: id,
      isLabelSelected: true,
    });
  };

  renderLabelField = () => {
    const {
      field = {},
      docReadOnly = false,
      currentId,
      selectedFieldId,
      isFieldSelected,
    } = this.props;
    const { id, type, uiLabel, isHidden = false } = field;
    const { showTableContainer } = this.state;

    return (
      <>
        <form
          method='post'
          autoComplete='off'
          className={styles.form}
          onSubmit={(e) => this.handleFormSubmit(true, e)}
        >
          <input
            ref={this.labelFieldRef}
            id={`sidebar-field-input-${id}`}
            type='text'
            value={uiLabel}
            title={uiLabel}
            className={cx(styles.input)}
            disabled={!!docReadOnly}
            tabIndex='-1'
            placeholder='Click to edit'
            autoComplete='off'
            onChange={this.handleLabelChange}
            onFocus={this.handleInputFocus}
            onBlur={this.handleInputBlur}
          />
          <div className={styles.inputLabel}>
            <span
              className={cx('text-truncate', styles.inputLabel__text, {
                [styles['inputLabel__text--selected']]:
                  (!isHidden && id === (currentId || selectedFieldId)) ||
                  (type === 'line_item' && isFieldSelected) ||
                  showTableContainer,
                [styles['inputLabel__text--hidden']]: isHidden,
              })}
              title={uiLabel}
            >
              {uiLabel}
            </span>

            {field.type === 'line_item' && !isHidden ? (
              <Tooltip
                placement='right'
                label={showTableContainer ? 'Collapse' : 'Expand'}
              >
                <span
                  className={cx(styles.inputLabel__arrow, {
                    [styles['inputLabel__arrow--selected']]: showTableContainer,
                  })}
                  onClick={() => this.toggleTableContainer()}
                >
                  {showTableContainer ? (
                    <NavArrowUp />
                  ) : this.props.selectedSectionFieldId === id ? (
                    <ArrowActiveIcon />
                  ) : (
                    <NavArrowDown />
                  )}
                </span>
              </Tooltip>
            ) : null}
          </div>
        </form>
      </>
    );
  };

  render() {
    const {
      docId,
      docType,
      field = {},
      fieldsById,
      currentId,
      selectedFieldId,
      isFieldSelected,
      onFilterBtnClick,
      dataTypes,
      selectedDropdownId,
      changeSelectedDropdownId,
      setFieldKey,
      sectionId,
      onFooterFieldInputSubmit,
      onFooterFieldInputValueChange,
      onLineFieldInputFocus,
      provided,
      onDeleteSectionField,
      loadingFieldId,
      changeDataTypeFromSettings,
    } = this.props;
    const isLineItem = field?.type === 'line_item' || field.format === '%t';

    let { type, id, errorMessage, isHidden = false } = field;
    const { showTableContainer } = this.state;

    if (isLineItem && field.lineItemColumns?.length) {
      const errorColumnField = field.lineItemColumns.find(
        (column) => fieldsById[column.id]?.errorMessage
      );
      if (errorColumnField) {
        errorMessage = fieldsById[errorColumnField?.id]?.errorMessage;
      }
    }

    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        style={{
          ...provided.draggableProps.style,
        }}
      >
        <div
          className={cx(styles.fieldItem, {
            [styles['fieldItem--selected']]:
              (!isHidden && id === (currentId || selectedFieldId)) ||
              (type === 'line_item' && isFieldSelected) ||
              showTableContainer,
            [styles['fieldItem--disabled']]: isHidden,
            [styles['fieldItem--enabled']]: !isHidden,
          })}
          id={`edit-more-btn-${id}`}
          onClick={this.handleClick}
        >
          <div className={styles.lhs}>
            <span
              {...provided.dragHandleProps}
              className={
                !isHidden ? cx('mr-2 mt-1', styles.lhs__icon) : 'd-none'
              }
            >
              <IconDrag />
            </span>
            {!isHidden ? (
              <span
                className={cx(
                  'mr-2 mt-1',
                  styles.lhs__eyeIcon,
                  'UFTooltipCustomDoctype3'
                )}
              >
                <Tooltip label={'Hide Field'} placement='top'>
                  <EyeEmpty
                    onClick={this.handleFieldVisibility}
                    height={20}
                    width={20}
                  />
                </Tooltip>
              </span>
            ) : (
              <span className={cx('mr-2 mt-1', styles.lhs__eyeIconHidden)}>
                <Tooltip label={'Unhide Field'} placement='top'>
                  <EyeOff
                    onClick={this.handleFieldVisibility}
                    height={20}
                    width={20}
                  />
                </Tooltip>
              </span>
            )}
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
            <div
              id={`sidebar-section-field-${field.id}`}
              className={styles.lhs__label}
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex='0'
              role='presentation'
            >
              {errorMessage && !isHidden ? (
                <div
                  className={cx(styles.tooltip, {
                    [styles['tooltip__hidden']]: isHidden,
                  })}
                >
                  <Tooltip
                    label={errorMessage || 'The format is not valid.'}
                    className={styles['tooltip__errorIcon']}
                    placement='right'
                    colorScheme='error'
                  >
                    <WarningTriangle className={styles.tooltip__errorIcon} />
                  </Tooltip>
                </div>
              ) : null}

              {this.renderLabelField()}
            </div>
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
                id={`selected-field-type-${field.id}`} // id for elements which triggers dropdown
                className={cx(styles.rhs__fieldType, 'mr-2', {
                  [styles['rhs__fieldType--selected']]:
                    selectedDropdownId === field.id && !isHidden,
                  [styles['rhs__fieldType--hidden']]: isHidden,
                })}
                onClick={() => !isHidden && this.toggleDropdown(field.id)}
                role='button'
                tabIndex={0}
              >
                {dataTypes.find((dataType) => dataType.type === field.type)
                  ?.label || field.type}

                {!isHidden && (
                  <span className={cx(styles['rhs__fieldType-icon'], 'mt-1')}>
                    {selectedDropdownId === field.id ? (
                      <NavArrowUp />
                    ) : (
                      <NavArrowDown />
                    )}
                  </span>
                )}
              </div>
            )}

            {selectedDropdownId === field.id ? (
              <Dropdown
                id={`edit-drop-field-${id}`}
                className={styles.dropdown}
                options={dataTypes}
                value={field.type}
                selectedDropdownId={selectedDropdownId}
                onOutsideClick={this.toggleDropdown}
                onOptionClick={this.changeDataType}
                handleFocus={() => this.handleFocus(field.id)}
              />
            ) : null}

            <span
              className={cx(
                'UFTooltipCustomDoctype2',
                'mr-2 mt-1 cursor-pointer',
                styles.rhs__icon,
                styles.rhs__ellipsisIcon,
                {
                  [styles['rhs__ellipsisIcon--selected']]:
                    (!isHidden && id === (currentId || selectedFieldId)) ||
                    (type === 'line_item' && isFieldSelected) ||
                    showTableContainer,
                },
                {
                  [styles['rhs__ellipsisIcon--selected--popup']]:
                    this.state.showPopupMenu && !this.state.isFilterOverlayOpen,
                },
                {
                  [styles['rhs__ellipsisIcon--selected--popupHidden']]:
                    this.state.showPopupMenu &&
                    !this.state.isFilterOverlayOpen &&
                    isHidden,
                }
              )}
              ref={this.parentDivRef}
            >
              <VerticalEllipsisIcon
                onClick={() => this.handlePopupMenu(field.id)}
              />
            </span>
          </div>
        </div>
        {field.type === 'line_item' && isFieldSelected && showTableContainer ? (
          <div className={styles.tableItem}>
            <TableField
              docType={docType}
              docId={docId}
              field={field}
              fieldsById={fieldsById}
              sectionId={sectionId}
              selectedFieldId={selectedFieldId}
              dataTypes={dataTypes}
              selectedDropdownId={selectedDropdownId}
              onFilterBtnClick={onFilterBtnClick}
              setFieldKey={setFieldKey}
              loadingFieldId={loadingFieldId}
              changeSelectedDropdownId={changeSelectedDropdownId}
              onFooterFieldInputSubmit={onFooterFieldInputSubmit}
              onLineFieldInputFocus={onLineFieldInputFocus}
              onFooterFieldInputValueChange={onFooterFieldInputValueChange}
              onDeleteSectionField={onDeleteSectionField}
              changeDataTypeMixpanelTrack={this.changeDataTypeMixpanelTrack}
              toggleDropdownMixpanelTrack={this.toggleDropdownMixpanelTrack}
              handlePopupMenuMixpanelTrack={this.handlePopupMenuMixpanelTrack}
              handleFilterClickMixpanelTrack={
                this.handleFilterClickMixpanelTrack
              }
            />
          </div>
        ) : null}
        {this.state.showPopupMenu && (
          <PopMenu
            parentDivPosition={this.state.parentDivPosition}
            handleOptionClick={this.handleMoreOption}
            id={`edit-field-more-dd-${field.id}`}
            handleClose={this.handleClose}
            handleFilterClick={this.handleFilterClick}
            isLineItem={isLineItem}
            changeDataTypeFromSettings={changeDataTypeFromSettings}
            isHidden={isHidden}
            className={styles.popup}
            filterHandler={this.filterHandler}
          />
        )}
      </div>
    );
  }
}

function mapStateToProp(state, ownProps) {
  const { fieldId, sectionId } = ownProps;
  const {
    docId,
    fieldsById,
    selectedSectionFieldId,
    sectionIds,
    sectionsById,
    selectedFieldId,
    sectionFieldIds,
  } = state.documents.reviewTool;
  const { fieldId: currentId } = state.documents;
  const { loadingFieldId, changeDataTypeFromSettings } =
    state.documents.editFields;
  const field = fieldsById[fieldId];
  const isFieldSelected = fieldId === selectedSectionFieldId;
  const sectionOptions = sectionIds.map((id) => ({
    label: sectionsById[id] && sectionsById[id].title,
    value: id,
    disabled: true,
  }));

  const { user, config } = state.app;

  return {
    sectionId,
    docId,
    field,
    fieldsById,
    isFieldSelected,
    selectedSectionFieldId,
    currentId,
    selectedFieldId,
    sectionOptions,
    sectionIds,
    user,
    config,
    loadingFieldId,
    changeDataTypeFromSettings,
    sectionFieldIds,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(Field);
