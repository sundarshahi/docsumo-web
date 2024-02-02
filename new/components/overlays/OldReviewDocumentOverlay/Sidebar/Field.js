import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import * as reduxHelpers from 'new/redux/helpers';
import { actions as documentActions } from 'new/redux/oldDocuments/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import {
  Cell2X2,
  Check,
  EyeEmpty,
  NavArrowDown,
  WarningTriangle,
} from 'iconoir-react';
import _ from 'lodash';
import * as api from 'new/api';
import { WithTrackingContext } from 'new/components/contexts/tracking';
import {
  FIELD_TRACKING_KEYS,
  TABLE_TRACKING_KEYS,
  TRACKING_HELPER_KEYS,
} from 'new/components/contexts/trackingConstants';
import { HelpTooltip } from 'new/components/overlays/OldReviewDocumentOverlay/tooltip';
import ttConstants from 'new/constants/helpTooltips';
import Input from 'new/ui-elements/Input/Input';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import OutsideClickHandler from 'react-outside-click-handler';

import FieldInputBox from './FieldInputBox';

import selectStyles from './DropDown.scss';
import styles from './field.scss';
import selectBoxStyles from './Select.scss';

class Field extends Component {
  state = {
    isInputFocussed: false,
    isSelectOpen: false,
    filteredOptions: null,
    fieldOptions: [
      'One data',
      'Two data',
      'Three data',
      'Four data',
      'Five data',
    ],
  };
  inputFieldRef = React.createRef();
  inputDDFieldRef = React.createRef();
  dropdownItemRef = React.createRef();
  cursor = null;

  componentDidMount() {
    const { field, ddObject } = this.props;
    if (this.inputFieldRef.current) {
      this.inputFieldRef.current.selectionStart =
        this.inputFieldRef.current.value &&
        this.inputFieldRef.current.value.length;
      this.inputFieldRef.current.selectionEnd =
        this.inputFieldRef.current.value &&
        this.inputFieldRef.current.value.length;
      const x = document.getElementById(`sidebar-field-input-${field.id}`);
      if (x) {
        x.addEventListener('focus', () => this.handleInputFocus(), true);
        x.addEventListener('blur', () => this.handleInputBlur(), true);
      }
    }

    const { dropDownConfig } = field;
    this.setState({
      ddData: ddObject,
      dropDownConfig,
    });
  }

  componentDidUpdate(prevProps) {
    if (this.inputFieldRef.current) {
      if (
        _.isNumber(this.cursor) &&
        prevProps.field.uiValue !== this.props.field.uiValue
      ) {
        this.inputFieldRef.current.selectionEnd = this.cursor;
      }
    }
    if (
      this.inputDDFieldRef.current &&
      prevProps.isFieldSelected !== this.props.isFieldSelected &&
      this.props.isFieldSelected
    ) {
      this.inputDDFieldRef.current.focus();
    }
    const { ddObject } = this.props;
    const { ddObject: prevDDObject } = prevProps;
    if (prevDDObject && prevDDObject !== ddObject) {
      this.setState({
        ddData: ddObject,
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { ddObject } = this.props;
    if (!ddObject && ddObject !== nextProps.ddObject) {
      this.setState({
        ddData: nextProps.ddObject,
      });
    }
  }

  updateManualAnnotationCount = () => {
    let manualAnnotation = +(localStorage.getItem('manualAnnotation') || 0);

    if (manualAnnotation < 6) {
      localStorage.setItem('manualAnnotation', manualAnnotation + 1);
    }
  };

  handleClick = () => {
    const {
      docReadOnly,
      field,
      handleDelayedTableTracking,
      selectedSectionFieldId,
    } = this.props;
    const { type, isIndex } = field;
    if (type === 'line_item') {
      this.props.onSidebarLineItemFieldClick({
        fieldId: this.props.fieldId,
      });
      handleDelayedTableTracking({
        name: this.props.fieldId,
        key: TABLE_TRACKING_KEYS.dummyEvent,
        action: TRACKING_HELPER_KEYS.clicked,
      });
      return;
    }

    if (!docReadOnly && !(type === 'drop_down_map' && !isIndex)) {
      // Input focus will take care of this.
      return;
    }

    this.props.onSidebarReadOnlyFieldClick({
      fieldId: this.props.fieldId,
    });
  };

  handleInputFocus = async (e) => {
    const { field, scrollSectionFieldIntoView, handleTrackingStart } =
      this.props;
    await scrollSectionFieldIntoView(field.id);

    if (this.state.isInputFocussed) {
      return;
    }

    handleTrackingStart({
      name: field.id,
      valueToSave: field.uiValue,
      key: FIELD_TRACKING_KEYS.fieldValue,
      valueToCompare: {
        text: field.uiValue,
        ...{ position: field.uiPosition },
        ...{ rect: field.uiRectangle },
      },
    });

    this.setState(
      {
        isInputFocussed: true,
      },
      () => {
        if (this.props.isFieldSelected) {
          this.updateManualAnnotationCount();
          return;
        }

        this.props.onSidebarFieldInputFocus({
          fieldId: this.props.fieldId,
        });
      }
    );
  };

  handleInputBlur = () => {
    const { handleTrackingEnd, field } = this.props;
    handleTrackingEnd({
      name: field.id,
      key: FIELD_TRACKING_KEYS.fieldValue,
      valueToSave: field.uiValue,
      valueToCompare: {
        text: field.uiValue,
        ...{ position: field.uiPosition },
        ...{ rect: field.uiRectangle },
      },
    });

    this.setState({
      isInputFocussed: false,
    });
  };

  handleInputChange = async (e) => {
    this.cursor = e.target.selectionStart;
    const value = e.target.value;
    const id = e.target.id;
    const { field, rtUpdateFields, documentActions } = this.props;

    const { content: { origValue } = {} } = field || {};
    const {
      field: { docId },
    } = this.props;

    const store = reduxHelpers.getStore();
    const {
      documents: { documentsById, documentsByIdDocType },
    } = store.getState();
    const { type: docType } =
      documentsById[docId] || documentsByIdDocType[docId] || {};
    this.props.onSidebarFieldInputValueChange({
      fieldId: field.id,
      value,
    });
    const { docReadOnly } = this.props;

    if (docReadOnly) {
      return;
    }

    this.showFloatingInput();

    if (rtUpdateFields.includes(field.id)) {
      const response = await api.realTimeUpdateField({
        docId,
        itemId: field.id,
        payload: {
          value: value,
          time_spent: 1,
          doc_type: docType,
          is_valid_format: field.uiIsValidFormat,
          position: field.uiRectangle || [],
          orig_value: origValue,
          id: field.id,
        },
      });
      documentActions.rtRealTimeUpdate({
        currentId: field.id,
        docId,
        response: response.responsePayload.data,
      });
    }
  };

  showFloatingInput = () => {
    const floatingInput = document.getElementById('js-floating-input');
    if (floatingInput?.style?.display === 'none') {
      this.calculateFloaingInputStyle(floatingInput);
    }
  };

  calculateFloaingInputStyle = (floatingInput) => {
    const labelElement = document.getElementById(
      `sidebar-section-field-${this.props.field.id}`
    );
    const { top, bottom } = labelElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    let popupStyles = {};

    if (top < windowHeight / 2) {
      popupStyles = {
        top: `${top}px`,
        bottom: 'initial',
      };
    } else {
      popupStyles = {
        bottom: `calc(100% - ${bottom}px)`,
        top: 'initial',
      };
    }

    if (floatingInput) {
      floatingInput.style.display = 'block';
      floatingInput.style.top = popupStyles.top;
      floatingInput.style.bottom = popupStyles.bottom;
    }
  };

  handleFormSubmit = (e) => {
    e.preventDefault();
    this.setState({
      filteredValue: '',
    });
    this.props.onSidebarFieldInputFormSubmit({
      fieldId: this.props.field.id,
    });
  };

  closeDropDown = () => {
    const {
      field: { uiValue },
    } = this.props;
    this.handleInputChange({
      target: {
        value: uiValue,
      },
    });
    this.props.onSidebarFieldInputFormSubmit({
      fieldId: this.props.field.id,
    });
  };

  handleSeachOnChange = async (e) => {
    const { ddData } = this.state;
    const {
      field: { dropDownType, docId, id },
    } = this.props;
    const store = reduxHelpers.getStore();
    const {
      documents: { documentsById },
    } = store.getState();
    const { type } = documentsById[docId] || {};
    const ddOptions = ddData ? ddData[id] : [];

    const searchable = dropDownType ? dropDownType === 'search' : false;
    const { value } = e.target;

    if (searchable) {
      this.setState({
        loading: true,
      });
      try {
        const response = await api.getDocumentDDOptions({
          type,
          id,
          queryParams: {
            q: value,
          },
        });
        let data = _.get(response, 'responsePayload.data') || [];
        this.setState({
          loading: false,
          filteredValue: value,
          filteredOptions: data,
        });
      } catch (e) {
        //do nothing for now
      }
    } else {
      const filtered = ddOptions.filter((i) => {
        const iL = i.toLowerCase();
        const vL = value.toLowerCase();
        return iL.includes(vL);
      });
      this.setState({
        loading: false,
        filteredValue: value,
        filteredOptions: filtered,
      });
    }
  };

  handleRegionFieldInputValueChange = async ({ fieldId, value, label }) => {
    this.props.onRegionFieldInputValueChange({
      fieldId,
      value,
      label,
    });

    const { field, rtUpdateFields, documentActions } = this.props;
    const { content: { origValue } = {} } = field || {};
    const {
      field: { docId },
    } = this.props;

    const store = reduxHelpers.getStore();
    const {
      documents: { documentsById, documentsByIdDocType },
    } = store.getState();
    const { type: docType } =
      documentsById[docId] || documentsByIdDocType[docId] || {};

    if (rtUpdateFields.includes(field.id)) {
      const response = await api.realTimeUpdateField({
        docId,
        itemId: field.id,
        payload: {
          id: field.id,
          value: value,
          time_spent: 1,
          doc_type: docType,
          is_valid_format: field.uiIsValidFormat,
          position: field.uiRectangle || [],
          orig_value: origValue,
        },
      });
      documentActions.rtRealTimeUpdate({
        currentId: field.id,
        docId,
        response: response.responsePayload.data,
      });
    }
  };

  handleRegionFieldInputRemoveBtnClick = ({
    fieldId,
    prevUiLabel,
    prevUiValue,
  }) => {
    if (this.state.isInputFocussed) {
      return null;
    }
    this.props.onRegionFieldInputRemoveBtnClick({
      fieldId,
      prevUiLabel,
      prevUiValue,
    });
  };

  handleInputFormSubmitBtn = ({ e }) => {
    e.preventDefault();
    this.props.onSidebarFieldInputFormSubmit({
      fieldId: this.props.field.id,
    });
  };
  handleInputFormSubmit = () => {
    this.props.onSidebarFieldInputFormSubmit({
      fieldId: this.props.field.id,
    });
  };

  renderInputField = () => {
    const { field, docReadOnly = false, isFieldSelected } = this.props;
    const { isInputFocussed } = this.state;

    let readOnly = field.readOnly || false;

    const { uiValue, type, isIndex } = field;

    let suffixNode = null;
    if (field.type === 'percent') {
      if (_.isNumber(uiValue) || (_.isString(uiValue) && uiValue?.length > 0)) {
        suffixNode = <div className={styles.percentSymbol}>%</div>;
      }
    }

    const shouldApplyTooltip = uiValue?.length > 16;
    return (
      <Fragment>
        <form
          method='post'
          autoComplete='off'
          className={styles.ReviewForm}
          onSubmit={this.handleFormSubmit}
        >
          <Tooltip
            label={uiValue}
            showTooltip={shouldApplyTooltip && !isFieldSelected}
            className={styles.ReviewForm__tooltip}
          >
            <Input
              ref={this.inputFieldRef}
              id={`sidebar-field-input-${field.id}`}
              type='text'
              value={
                // uiValue.length > 16 && !isFieldSelected
                //   ? uiValue.substring(0, 15) + '...'
                //   : uiValue
                uiValue
              }
              className={cx(
                styles.ReviewForm__input,

                {
                  [styles.isSelected]: isInputFocussed || isFieldSelected,
                  [styles.isReadOnly]:
                    docReadOnly || (type === 'drop_down_map' && !isIndex),
                  [styles.ReviewForm__input__empty]: !uiValue,
                }
              )}
              readOnly={
                readOnly ||
                !!docReadOnly ||
                (type === 'drop_down_map' && !isIndex)
              }
              tabIndex='-1'
              autoComplete='off'
              onChange={(e) => this.handleInputChange(e)}
              data-hj-allow
            />
          </Tooltip>
        </form>
        {suffixNode}
      </Fragment>
    );
  };

  renderSelectInputField = () => {
    const { field, docReadOnly = false, isFieldSelected } = this.props;

    const {
      //label,
      uiValue,
      id,
      dropDownType,
    } = field;
    //const { filteredOptions, fieldOptions, filteredValue, loading, dropDownConfig, ddData } = this.state;
    const { loading, ddData, filteredOptions, filteredValue } = this.state;
    //const options = filteredOptions && (filteredOptions.length || filteredValue) ? filteredOptions : fieldOptions;
    const ddOptions = filteredValue
      ? filteredOptions
      : ddData
      ? ddData[id]
      : [];
    //const searchable = dropDownConfig ? dropDownConfig.type === 'search' : false;
    const searchable = dropDownType ? dropDownType === 'search' : false;

    return (
      <form
        method='post'
        autoComplete='off'
        className={cx(styles.form, styles.dropdown__width, {
          [styles.fullWidth]: isFieldSelected,
        })}
        onSubmit={this.handleFormSubmit}
      >
        <div
          className={cx(
            { [selectStyles.root]: !docReadOnly },
            styles.dateFilter
          )}
          ref={this.inputFieldRef}
          id={`sidebar-field-input-${field.id}`}
        >
          {!isFieldSelected ? (
            <div
              className={cx(
                'unstyled-btn',
                selectStyles.btn,
                styles.btnDateFilter
              )}
            >
              <div className={selectStyles.content}>
                <Input
                  type='text'
                  list='brow'
                  value={uiValue}
                  className={cx(
                    selectStyles.input,
                    styles.ReviewForm__input,
                    'ellipsis'
                  )}
                  //disabled={!!docReadOnly}
                  readOnly={!!docReadOnly}
                  ref={this.inputDDFieldRef}
                  tabIndex='-1'
                  autoComplete='off'
                  data-hj-allow
                />
                {!docReadOnly && <NavArrowDown className={selectStyles.icon} />}
              </div>
            </div>
          ) : (
            <OutsideClickHandler onOutsideClick={this.closeDropDown}>
              <div
                className={cx(
                  selectBoxStyles.root,
                  {
                    [selectBoxStyles.isSelected]: isFieldSelected,
                  },
                  {
                    [selectBoxStyles.isReadOnly]: docReadOnly,
                  }
                )}
              >
                <Input
                  type='text'
                  list='brow'
                  defaultValue={uiValue}
                  className={cx(
                    selectBoxStyles.input,
                    styles.ReviewForm__input,
                    {
                      [selectBoxStyles.isSelected]: isFieldSelected,
                    },
                    {
                      [selectBoxStyles.isReadOnly]: docReadOnly,
                    }
                  )}
                  value={docReadOnly ? uiValue : filteredValue}
                  //disabled={!!docReadOnly}
                  readOnly={!!docReadOnly}
                  ref={this.inputDDFieldRef}
                  tabIndex='-1'
                  autoComplete='off'
                  onChange={(e) => this.handleSeachOnChange(e)}
                  data-hj-allow
                />
                {!docReadOnly && (
                  <NavArrowDown
                    className={cx(
                      selectBoxStyles.icon,
                      {
                        [selectBoxStyles.isSelected]: isFieldSelected,
                      },
                      {
                        [selectBoxStyles.isReadOnly]: docReadOnly,
                      }
                    )}
                    onClick={(e) => {
                      this.handleFormSubmit(e);
                    }}
                  />
                )}
                {docReadOnly ? (
                  ''
                ) : (
                  <ul
                    className={selectBoxStyles.list}
                    ref={this.dropdownItemRef}
                  >
                    {loading ? (
                      <div className={selectBoxStyles.loading}>Loading...</div>
                    ) : (
                      ddOptions &&
                      ddOptions.map((filter, index) => {
                        const activeItem = filter === uiValue;
                        if (filter === '') {
                          return (
                            <button
                              key={index}
                              className={cx(selectBoxStyles.listItem, {
                                [selectBoxStyles.activeListItem]: activeItem,
                              })}
                              onClick={() => {
                                this.handleInputChange({
                                  target: {
                                    value: filter,
                                  },
                                });
                              }}
                            >
                              None
                            </button>
                          );
                        } else {
                          return (
                            <button
                              className={cx(selectBoxStyles.listItem, {
                                [selectBoxStyles.activeListItem]: activeItem,
                              })}
                              onClick={() => {
                                this.handleInputChange({
                                  target: {
                                    value: filter,
                                  },
                                });
                              }}
                            >
                              {filter}
                            </button>
                          );
                        }
                      })
                    )}
                    {searchable && !loading ? (
                      <div className={selectBoxStyles.helpText}>
                        Search exact word to get perfect results.
                      </div>
                    ) : (
                      ''
                    )}
                  </ul>
                )}
              </div>
            </OutsideClickHandler>
          )}
        </div>
      </form>
    );
  };
  renderMapInputField = () => {
    const { field, docReadOnly = false, isFieldSelected } = this.props;

    const {
      //label,
      uiValue,
      id,
      //dropDownType,
    } = field;

    //const { filteredOptions, fieldOptions, filteredValue, loading, dropDownConfig, ddData } = this.state;
    const { loading, ddData, filteredOptions, filteredValue } = this.state;
    //const options = filteredOptions && (filteredOptions.length || filteredValue) ? filteredOptions : fieldOptions;
    const ddOptions = filteredValue
      ? filteredOptions
      : ddData
      ? ddData[id]
      : [];

    return (
      <form
        method='post'
        autoComplete='off'
        className={cx(styles.form, styles.dropdown__width, {
          [styles.fullWidth]: isFieldSelected,
        })}
        onSubmit={this.handleFormSubmit}
      >
        <div
          className={cx(selectStyles.root, styles.dateFilter)}
          ref={this.inputFieldRef}
          id={`sidebar-field-input-${field.id}`}
        >
          {!isFieldSelected ? (
            <div
              className={cx(
                'unstyled-btn',
                selectStyles.btn,
                styles.btnDateFilter
              )}
            >
              <div className={selectStyles.content}>
                <Input
                  type='text'
                  list='brow'
                  defaultValue={uiValue}
                  value={uiValue}
                  className={cx(selectStyles.input, styles.ReviewForm__input)}
                  //disabled={!!docReadOnly}
                  readOnly={!!docReadOnly}
                  ref={this.inputDDFieldRef}
                  tabIndex='-1'
                  autoComplete='off'
                  data-hj-allow
                />
                <NavArrowDown className={selectStyles.icon} />
              </div>
            </div>
          ) : (
            <OutsideClickHandler onOutsideClick={this.closeDropDown}>
              <div
                className={cx(
                  selectBoxStyles.root,
                  {
                    [selectBoxStyles.isSelected]: isFieldSelected,
                  },
                  {
                    [selectBoxStyles.isReadOnly]: docReadOnly,
                  }
                )}
              >
                <Input
                  type='text'
                  list='brow'
                  defaultValue={uiValue}
                  className={cx(
                    selectBoxStyles.input,
                    styles.ReviewForm__input,
                    {
                      [selectBoxStyles.isSelected]: isFieldSelected,
                    },
                    {
                      [selectBoxStyles.isReadOnly]: docReadOnly,
                    }
                  )}
                  disabled
                  ref={this.inputDDFieldRef}
                  tabIndex='-1'
                  autoComplete='off'
                  onChange={(e) => this.handleSeachOnChange(e)}
                  data-hj-allow
                />
                <NavArrowDown
                  className={cx(
                    selectBoxStyles.icon,
                    {
                      [selectBoxStyles.isSelected]: isFieldSelected,
                    },
                    {
                      [selectBoxStyles.isReadOnly]: docReadOnly,
                    }
                  )}
                  onClick={(e) => {
                    this.handleFormSubmit(e);
                  }}
                />
                {docReadOnly ? (
                  ''
                ) : (
                  <ul className={selectBoxStyles.list}>
                    {loading ? (
                      <div className={selectBoxStyles.loading}>Loading...</div>
                    ) : (
                      ddOptions &&
                      ddOptions.map((filter, index) => {
                        const activeItem = filter.label === uiValue;
                        if (filter.label === '') {
                          return (
                            <button
                              key={index}
                              className={cx(selectBoxStyles.listItem, {
                                [selectBoxStyles.activeListItem]: activeItem,
                              })}
                              onClick={() => {
                                this.handleInputChange({
                                  target: {
                                    value: filter.label,
                                    id: filter.id,
                                  },
                                });
                              }}
                            >
                              None
                            </button>
                          );
                        } else {
                          return (
                            <button
                              className={cx(selectBoxStyles.listItem, {
                                [selectBoxStyles.activeListItem]: activeItem,
                              })}
                              onClick={() => {
                                this.handleInputChange({
                                  target: {
                                    value: filter.label,
                                    id: filter.id,
                                  },
                                });
                              }}
                            >
                              {filter.label}
                            </button>
                          );
                        }
                      })
                    )}
                  </ul>
                )}
              </div>
            </OutsideClickHandler>
          )}
        </div>
      </form>
    );
  };

  render() {
    const {
      field,
      isFieldSelected,
      docReadOnly = false,
      lineItemTooltip,
      onSidebarLineItemFieldClick,
      className = '',
    } = this.props;

    const {
      label,
      type,
      lowConfidence,
      uiIsValidFormat,
      formatMessage,
      content: { isValidFormat } = {},
      //format,
      uiValue,
      isIndex,
      uiPosition,
    } = field;

    const { content: { position = [] } = {} } = field;

    let currentPosition = uiPosition || position.length !== 0;

    let showErrorIcon = false;
    let showReviewIcon = false;

    if (!uiIsValidFormat || !isValidFormat) {
      showErrorIcon = true;
    }

    if (!showErrorIcon && lowConfidence) {
      showReviewIcon = true;
    }
    let lineItemRowCount = 0;
    if (type === 'line_item') {
      const { field } = this.props;
      showErrorIcon = false;
      showReviewIcon = false;
      let lineItemField = field.children;
      const { lineItemRowIds } = field;
      lineItemRowCount = lineItemRowIds.length;

      for (let i = 1; i < lineItemField?.length; i++) {
        if (lineItemField[i] && lineItemField[i].length) {
          for (let j = 0; j < lineItemField[i].length; j++) {
            if (lineItemField[i][j].content.isValidFormat === false) {
              showErrorIcon = true;
              break;
            }
          }
        } else {
          showErrorIcon = false;
        }
      }
      for (let i = 1; i < lineItemField?.length; i++) {
        if (lineItemField[i] && lineItemField[i].length) {
          for (let j = 0; j < lineItemField[i].length; j++) {
            if (!showErrorIcon && lineItemField[i][j].lowConfidence === true) {
              showReviewIcon = true;
              break;
            }
          }
        } else {
          showReviewIcon = false;
        }
      }
    }
    const topLabeled = !['drop_down'].includes(type) || !isFieldSelected;
    return (
      <>
        <label
          id={`sidebar-section-field-${field.id}`}
          className={cx(
            styles.ReviewLineItem,
            { [styles['ReviewLineItem__isSelected']]: isFieldSelected },
            { [styles.topLabeled]: !topLabeled },
            className,
            type === 'line_item' ? 'UFTooltipReview2' : ''
            // Not to remove UFTooltipReview2
          )}
          role='presentation'
          onClick={this.handleClick}
        >
          <div className={cx(styles.ReviewLineItem__content, 'mr-1')}>
            <div className={styles['ReviewLineItem__content--icon']}>
              {showErrorIcon ? (
                <Tooltip
                  placement='right'
                  label={
                    type === 'line_item'
                      ? 'There is error in line item'
                      : formatMessage
                  }
                  colorScheme='error'
                >
                  <WarningTriangle
                    className={styles['ReviewLineItem__content--icon-error']}
                  />
                </Tooltip>
              ) : null}

              {showReviewIcon ? (
                <Tooltip
                  placement='right'
                  label='The confidence score is low'
                  colorScheme='warning'
                  className={cx('UFTooltipWarningIcon')}
                >
                  <EyeEmpty
                    className={styles['ReviewLineItem__content--icon-warning']}
                  />
                </Tooltip>
              ) : null}
              {!showErrorIcon && !showReviewIcon ? (
                <Tooltip
                  placement='right'
                  label='The confidence score is good'
                  colorScheme='success'
                >
                  <Check
                    className={styles['ReviewLineItem__content--icon-success']}
                  />
                </Tooltip>
              ) : null}
            </div>
            <p
              className={cx(
                'text-truncate',
                styles['ReviewLineItem__content--label'],
                {
                  [styles['ReviewLineItem__txt-primary']]: isFieldSelected,
                }
              )}
              title={label}
            >
              {label}
            </p>
          </div>

          {['lineItem', 'line_item'].includes(type) ? (
            <HelpTooltip
              id={
                lineItemTooltip === field.id &&
                ttConstants.TT_REVIEW_SCRREN_LINE_ITEM_SECTION
              }
              onNext={() =>
                onSidebarLineItemFieldClick({
                  fieldId: field.id,
                  tooltip: true,
                })
              }
            >
              <div className={styles.LineItemInfo}>
                <p
                  className={cx(styles.LineItemInfo__count, {
                    [styles.colorPrimaryBold]: isFieldSelected,
                  })}
                >
                  {lineItemRowCount}
                </p>
                <Cell2X2 className={styles.LineItemInfo__icon} />
              </div>
            </HelpTooltip>
          ) : null}

          {[
            'number',
            'string',
            'date',
            'calculated_field',
            'percent',
            'optical_mark_recognition',
          ].includes(type)
            ? this.renderInputField()
            : null}
          {['drop_down_map'].includes(type) && !isIndex
            ? this.renderInputField()
            : null}

          {['drop_down'].includes(type) ? this.renderSelectInputField() : null}
          {['drop_down_map'].includes(type) && isIndex
            ? this.renderMapInputField()
            : null}
        </label>

        {type !== 'line_item' &&
        isFieldSelected &&
        !currentPosition &&
        !docReadOnly &&
        !(type === 'drop_down_map' && !isIndex) &&
        type !== 'drop_down' ? (
          <FieldInputBox
            field={field}
            id={`side-field-input-${field.id}`}
            isLabelSelected={false}
            slug={this.props.slug}
            onInputValueChange={this.handleRegionFieldInputValueChange}
            onRemoveBtnClick={this.handleRegionFieldInputRemoveBtnClick}
            onSubmitBtnClick={(e) => this.handleInputFormSubmitBtn(e)}
            onFormSubmit={(e) => this.handleInputFormSubmit(e)}
          />
        ) : null}
      </>
    );
  }
}

function mapStateToProp(state, ownProps) {
  const { fieldId } = ownProps;
  const { DDfields, reviewTool, ddObject, rtUpdateFields } = state.documents;
  const { fieldsById, selectedSectionFieldId } = reviewTool;

  const field = fieldsById[fieldId];
  const isFieldSelected = fieldId === selectedSectionFieldId;

  return {
    field,
    isFieldSelected,
    DDfields,
    ddObject,
    rtUpdateFields,
    selectedSectionFieldId,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default WithTrackingContext(
  connect(mapStateToProp, mapDispatchToProps)(Field)
);
