import React, { Component } from 'react';
// import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import * as reduxHelpers from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import _ from 'lodash';
import * as api from 'new/api';
import { ReactComponent as ArrowDropdownIcon } from 'new/assets/images/icons/arrow-dropdown.svg';
import { WithTrackingContext } from 'new/components/contexts/tracking';
import { TABLE_TRACKING_KEYS } from 'new/components/contexts/trackingConstants';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import { customMixpanelTracking } from 'new/utils/mixpanel';
import OutsideClickHandler from 'react-outside-click-handler';

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
    defaultOptions: [],
  };
  inputFieldRef = React.createRef();
  inputDDFieldRef = React.createRef();
  cursor = null;

  componentDidMount() {
    //const { field, DDfields } = this.props;
    const { defaultOptions } = this.state;
    const { field } = this.props;
    const {
      field: { options },
    } = this.props;
    if (options) {
      this.setState({
        fieldOptions: options,
      });
    } else {
      this.setState({
        fieldOptions: defaultOptions,
      });
    }
    if (field.dropDownType === 'list') {
      this.setState({
        dropDownConfig: 'list',
      });
    } else if (!field.dropDownType && field.dropDownType !== 'list') {
      this.setState({
        dropDownConfig: 'search',
      });
    }
    if (this.inputFieldRef.current) {
      this.inputFieldRef.current.selectionStart =
        this.inputFieldRef.current.value &&
        this.inputFieldRef.current.value.length;
      this.inputFieldRef.current.selectionEnd =
        this.inputFieldRef.current.value &&
        this.inputFieldRef.current.value.length;
      var x = document.getElementById(`line-item-field-input-${field.id}`);
      if (x) {
        x.addEventListener('focus', () => this.handleInputFocus(), true);
        x.addEventListener('blur', () => this.handleInputBlur(), true);
      }
    }
    // const {
    //     type,
    //     dropDownConfig,
    // } = field;

    // if(['drop_down'].includes(type)){
    //     let fieldOptions = dropDownConfig ? DDfields[dropDownConfig.id] : [];
    //     fieldOptions = fieldOptions ? fieldOptions.map(e => e.value) : [];
    //     this.setState({
    //         dropDownConfig,
    //         fieldOptions
    //     });
    // }
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

    const { defaultOptions } = this.state;
    const { field } = this.props;
    const {
      field: { options },
    } = this.props;
    if (prevProps.field !== field) {
      if (options) {
        this.setState({
          fieldOptions: options,
        });
      } else {
        this.setState({
          fieldOptions: defaultOptions,
        });
      }
      if (field.dropDownType === 'list') {
        this.setState({
          dropDownConfig: 'list',
        });
      } else if (!field.dropDownType && field.dropDownType !== 'list') {
        this.setState({
          dropDownConfig: 'search',
        });
      }
    }
  }

  handleClick = () => {
    const { docReadOnly } = this.props;

    if (!docReadOnly) {
      return;
    }

    this.props.onReadOnlyFieldClick({
      rowId: this.props.rowId,
      fieldId: this.props.fieldId,
    });
  };

  handleInputFocus = () => {
    if (this.state.isInputFocussed) {
      return;
    }

    const { field, handleTableFieldTrackingStart } = this.props;

    handleTableFieldTrackingStart({
      name: field._parentId,
      valueToSave: field,
      key: `${TABLE_TRACKING_KEYS.tableLineItem}`,
      fieldId: field.id,
    });

    this.setState(
      {
        isInputFocussed: true,
      },
      () => {
        if (this.props.isFieldSelected) {
          return;
        }

        this.props.onFieldInputFocus({
          rowId: this.props.rowId,
          fieldId: this.props.fieldId,
        });
      }
    );
  };

  handleInputBlur = () => {
    this.setState({
      isInputFocussed: false,
    });
    const { field, handleTableFieldTrackingEnd } = this.props;
    handleTableFieldTrackingEnd({
      name: field._parentId,
      valueToSave: field,

      key: `${TABLE_TRACKING_KEYS.tableLineItem}`,
      fieldId: field.id,
    });
  };

  handleInputChange = (e) => {
    this.cursor = e.target.selectionStart;
    const value = e.target.value;
    const { rowId, field } = this.props;
    this.setState({
      filteredValue: '',
    });
    this.props.onFieldInputValueChange({
      rowId,
      fieldId: field.id,
      value,
    });

    // setTimeout(() => {
    //     if(this.state.dropDownConfig === 'search'){
    //         this.props.onFieldInputSubmit({
    //             rowId: this.props.rowId,
    //             fieldId: this.props.fieldId,
    //         });
    //     }
    // }, 10
    // );
  };

  handleFormSubmit = (e) => {
    e.preventDefault();
    this.props.onFieldInputSubmit({
      rowId: this.props.rowId,
      fieldId: this.props.fieldId,
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
    this.props.onFieldInputSubmit({
      rowId: this.props.rowId,
      fieldId: this.props.fieldId,
    });
  };

  handleSeachOnChange = async (e) => {
    const { fieldOptions, dropDownConfig } = this.state;
    const {
      field: { docId, id },
      field,
    } = this.props;
    const store = reduxHelpers.getStore();
    const {
      documents: { documentsById },
    } = store.getState();
    const { type } = documentsById[docId] || {};

    //const searchable = dropDownConfig ? dropDownConfig.type === 'search' : false;
    const searchable = dropDownConfig ? dropDownConfig === 'search' : false;
    const { value } = e.target;

    if (searchable) {
      this.setState({
        loading: true,
      });
      try {
        const response = await api.getDocumentDDOptions({
          type,
          id,
          itemType: field.pType,
          label: field.label,
          queryParams: {
            q: value,
          },
        });
        let data = _.get(response, 'responsePayload.data') || [];
        this.setState({
          loading: false,
          // filteredValue: value,
          fieldOptions: data,
        });
      } catch (e) {
        this.setState({
          loading: false,
          // filteredValue: value,
          fieldOptions: [
            'One data',
            'Two data',
            'Three data',
            'Four data',
            'Five data',
          ],
        });
        //do nothing for now
      }
    } else {
      const filtered = fieldOptions.filter((i) => {
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

  renderSelectInputField = () => {
    const {
      field,
      docReadOnly = false,
      isFieldSelected,
      isCollapsed,
      wrapItem,
      adjustTableContentHeight,
      adjustScrollOnTable,
    } = this.props;
    const { uiValue, lowConfidence, uiIsValidFormat } = field;
    if (isFieldSelected) {
      let childEle = document.getElementById(
        `line-item-field-dropdown-${field.id}`
      );
      adjustTableContentHeight(childEle);
      adjustScrollOnTable(field.id);
    }

    let showErrorIcon = false;
    let showReviewIcon = false;
    if (!uiIsValidFormat) {
      showErrorIcon = true;
    }

    if (!showErrorIcon && lowConfidence) {
      showReviewIcon = true;
    }

    const {
      fieldOptions,
      filteredValue,
      loading,
      dropDownConfig,
      filteredOptions,
    } = this.state;
    const options = filteredValue ? filteredOptions : fieldOptions;

    const searchable = dropDownConfig ? dropDownConfig === 'search' : false;

    return (
      <form
        method='post'
        autoComplete='off'
        className={cx(styles.form, {
          [styles.fullWidth]: isFieldSelected,
        })}
        onSubmit={this.handleFormSubmit}
        style={{ height: wrapItem.wrapHeight }}
      >
        <div
          className={cx(selectStyles.root, styles.dateFilter, {
            [selectStyles.extendedDrop]: isCollapsed,
          })}
          ref={this.inputFieldRef}
          id={`line-item-field-input-${field.id}`}
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
                <textarea
                  type='text'
                  list='brow'
                  value={uiValue}
                  //style={{whiteSpace: wrapItem.justifyWrap, height: wrapItem.wrapHeight}}
                  className={selectStyles.input}
                  disabled={!!docReadOnly}
                  ref={this.inputDDFieldRef}
                  tabIndex='-1'
                  autoComplete='off'
                  data-hj-allow
                />
                <ArrowDropdownIcon
                  className={cx(
                    selectStyles.icon,
                    {
                      [selectStyles.isError]: showErrorIcon,
                    },
                    {
                      [selectStyles.isLowConfidence]: showReviewIcon,
                    }
                  )}
                />
              </div>
            </div>
          ) : (
            <OutsideClickHandler onOutsideClick={this.closeDropDown}>
              <div className={cx(selectBoxStyles.root)}>
                <textarea
                  type='text'
                  list='brow'
                  defaultValue={uiValue}
                  className={selectBoxStyles.input}
                  //style={{whiteSpace: wrapItem.justifyWrap, height: wrapItem.wrapHeight}}
                  //disabled={dropDownConfig === 'list'}
                  ref={this.inputDDFieldRef}
                  tabIndex='-1'
                  autoComplete='off'
                  onChange={(e) => this.handleSeachOnChange(e)}
                  data-hj-allow
                />
                <ArrowDropdownIcon className={selectBoxStyles.icon} />
                {docReadOnly ? (
                  ''
                ) : (
                  <ul
                    className={selectBoxStyles.list}
                    id={`line-item-field-dropdown-${field.id}`}
                  >
                    {loading ? (
                      <div className={selectBoxStyles.loading}>Loading...</div>
                    ) : (
                      options.map((filter, index) => {
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

  mixpanelTracking = (e) => {
    e.preventDefault();

    const store = reduxHelpers.getStore();
    const {
      documents: { documentsById },
    } = store.getState();
    const {
      field: { docId },
    } = this.props;
    const docMeta = documentsById[docId] || {};

    const { user = {}, config = {} } = this.props;
    customMixpanelTracking(MIXPANEL_EVENTS.table_click_cell, {
      docId: docId,
      label: docMeta?.title,
      docType: docMeta?.type,
      email: user?.email,
      plan: config?.accountType,
      canSwitchUIVersion: config?.canSwitchToOldMode,
      role: user?.role,
      companyName: user?.companyName,
    });
  };

  renderInputField = () => {
    const { field, disabled = false, alignItem, wrapItem } = this.props;

    const { label, uiValue } = field;

    return (
      <form
        method='post'
        autoComplete='off'
        onSubmit={this.handleFormSubmit}
        className={styles.form}
      >
        <textarea
          ref={this.inputFieldRef}
          style={{
            textAlign: alignItem.textAlign,
            whiteSpace: wrapItem.justifyWrap,
          }}
          name={label}
          id={`line-item-field-input-${field.id}`}
          type='text'
          value={uiValue}
          title={uiValue}
          className={cx(styles.input, 'UFFooterCell')}
          disabled={disabled}
          tabIndex='-1'
          autoComplete='off'
          onChange={this.handleInputChange}
          data-hj-allow
          onClick={this.mixpanelTracking}
        />
      </form>
    );
  };

  render() {
    const {
      field,
      isFieldSelected,
      isCollapsed,
      column,
      wrapItem,
      isDeletingRow,
    } = this.props;

    const { isInputFocussed } = this.state;

    const { type, lowConfidence, uiIsValidFormat, formatMessage, label } =
      field;

    let showErrorIcon = false;
    let showReviewIcon = false;

    if (!uiIsValidFormat) {
      showErrorIcon = true;
    }

    if (!showErrorIcon && lowConfidence) {
      showReviewIcon = true;
    }
    let widthStyle = column && column.find((c) => c.column === label);
    // let inputStyle = {
    //     width: '175px',
    //     marginRight: '13px'
    // };
    // let nonInputStyle = {
    //     width: '85px'
    // };
    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
      <label
        className={cx(
          styles.root,
          { [styles.isSelected]: isFieldSelected || isInputFocussed },
          { [styles.isError]: showErrorIcon && !isDeletingRow },
          { [styles.isLowConfidence]: showReviewIcon },
          { [styles.extendFieldItem]: isCollapsed }
        )}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex='0'
        style={{
          width: widthStyle && widthStyle.w,
          height: wrapItem.wrapHeight,
        }}
        //style={(isCollapsed && (type === 'string' || type === 'drop_down')) ? inputStyle : nonInputStyle}
        onClick={this.handleClick}
      >
        {/* { showReviewIcon ?
                    <div className={styles.iconContainer}>
                        { showReviewIcon ? (
                            <ReviewIcon className={styles.reviewIcon}/>
                        ) : null }
                    </div> : ''} */}
        {['number', 'string', 'date', 'percent', 'calculated_field'].includes(
          type
        )
          ? this.renderInputField()
          : null}

        {['drop_down'].includes(type) ? this.renderSelectInputField() : null}
        {(!showErrorIcon && !showReviewIcon) ||
        (['drop_down'].includes(type) && isFieldSelected) ? null : (
          <div
            className={cx(
              styles.tooltip,
              { [styles.errorTooltip]: showErrorIcon },
              { [styles.reviewTooltip]: showReviewIcon }
            )}
          >
            {showErrorIcon ? formatMessage : 'The confidence score is low'}
          </div>
        )}
      </label>
    );
  }
}

function mapStateToProp(state, ownProps) {
  const { fieldId, sectionField } = ownProps;
  const { fieldsById, selectedFieldId } = state.documents.reviewTool;
  const { user = {}, config = {} } = state.app;

  let field = fieldsById[fieldId];
  field = field || {};
  const isFieldSelected = fieldId === selectedFieldId;

  return {
    field,
    isFieldSelected,
    user,
    config,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default WithTrackingContext(
  connect(mapStateToProp, mapDispatchToProps)(Field)
);
