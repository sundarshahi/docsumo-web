import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as reduxHelpers from 'new/redux/helpers';
import { actions as documentActions } from 'new/redux/oldDocuments/actions';
import { bindActionCreators } from 'redux';

import { Cancel, Check } from 'iconoir-react';
import _ from 'lodash';
import * as api from 'new/api';
import { WithTrackingContext } from 'new/components/contexts/tracking';
import { FIELD_TRACKING_KEYS } from 'new/components/contexts/trackingConstants';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import { customMixpanelTracking } from 'new/utils/mixpanel';

import styles from './fieldInputBox.scss';

class FieldInputBox extends Component {
  state = {
    rows: 2,
    prevLabel: '',
    prevValue: '',
  };
  textareaRef = React.createRef();
  cursor = null;
  UNSAFE_componentWillMount() {
    const { field } = this.props;
    this.setState({
      prevLabel: field.uiLabel,
      prevValue: field.uiValue,
    });
  }

  componentDidMount() {
    if (this.textareaRef && this.textareaRef.current) {
      this.updateTextareaRows(this.textareaRef.current);
      !this.props.slug && this.textareaRef.current.focus();
      this.textareaRef.current.selectionStart =
        this.textareaRef.current.value.length;
      this.textareaRef.current.selectionEnd =
        this.textareaRef.current.value.length;
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isLabelSelected !== prevProps.isLabelSelected) {
      const { setFieldKey, setFieldValue, isLabelSelected, field } = this.props;
      const { uiValue, uiLabel } = field;
      if (isLabelSelected) {
        setFieldKey({ fieldId: field.id, value: uiLabel });
      } else {
        setFieldValue({ fieldId: field.id, value: uiValue });
      }
    }

    if (this.textareaRef.current) {
      if (
        _.isNumber(this.cursor) &&
        prevProps.field.uiValue !== this.props.field.uiValue
      ) {
        this.textareaRef.current.selectionEnd = this.cursor;
      }
      if (
        _.isNumber(this.cursor) &&
        prevProps.field.uiLabel !== this.props.field.uiLabel
      ) {
        this.textareaRef.current.selectionEnd = this.cursor;
      }
    }

    if (this.props.field.uiValue !== prevProps.field.uiValue) {
      this.updateTextareaRows();
    }
  }

  updateTextareaRows = (domNode) => {
    if (!domNode) {
      domNode = this.textareaRef && this.textareaRef.current;
    }

    if (!domNode) return;

    const textareaLineHeight = 22;
    const minRows = 1;
    const maxRows = 9;
    domNode.rows = minRows; // reset number of rows in textarea

    const previousRows = this.state.rows;
    const contentRows = ~~(domNode.scrollHeight / textareaLineHeight);
    if (contentRows === previousRows) {
      // No change
      domNode.rows = contentRows;
    } else {
      let newRows = contentRows;
      if (newRows <= maxRows) {
        domNode.rows = newRows;
      } else {
        newRows = maxRows;
        domNode.rows = newRows;
        domNode.scrollTop = domNode.scrollHeight;
      }

      this.setState({
        rows: newRows,
      });
    }
  };

  handleCancelBtnClick = async () => {
    const { field = {}, isLabelSelected } = this.props;
    this.props.onRemoveBtnClick({
      fieldId: field.id,
      prevUiLabel: this.state.prevLabel,
      prevUiValue: this.state.prevValue,
    });

    const { rtUpdateFields, documentActions } = this.props;
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

    if (rtUpdateFields.includes(field.id) && !isLabelSelected) {
      const response = await api.realTimeUpdateField({
        docId,
        itemId: field.id,
        payload: {
          id: field.id,
          value: this.state.prevValue,
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
    this.mixpanelTracking(MIXPANEL_EVENTS.close_bbox);
  };

  handleSubmitBtnClick = () => {
    const { field, isLabelSelected } = this.props;
    this.props.onSubmitBtnClick({
      fieldId: field.id,
      isLabelSelected,
    });
    this.mixpanelTracking(MIXPANEL_EVENTS.tick_bbox);
  };

  mixpanelTracking = (eventName) => {
    const store = reduxHelpers.getStore();
    const {
      documents: { documentsById, documentsByIdDocType },
    } = store.getState();
    const {
      config: { accountType = '', canSwitchToOldMode = true },
      user: { email = '', role = '', companyName = '' },
    } = this.props;
    const {
      field: { docId },
    } = this.props;

    const docMeta = documentsById[docId] || documentsByIdDocType[docId] || {};
    customMixpanelTracking(eventName, {
      docId: docId,
      label: docMeta?.title,
      docType: docMeta?.type,
      email: email,
      plan: accountType,
      canSwitchUIVersion: canSwitchToOldMode,
      role,
      companyName,
    });
  };

  handleFormSubmit = (e) => {
    const { isLabelSelected } = this.props;
    e.preventDefault();
    this.props.onFormSubmit({
      fieldId: this.props.field.id,
      isLabelSelected,
    });
  };

  handleTextareaKeyPress = (e) => {
    if (this.props.readOnly) {
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.props.onFormSubmit({
        fieldId: this.props.field.id,
      });
    }
  };

  handleTextareaChange = async (e) => {
    const {
      field = {},
      isLabelSelected,
      setFieldKey,
      setFieldValue,
      handleTrackingStart,
    } = this.props;
    //const value = e.target.value.replace(/[\r\n\v]+/g, '\n-');
    const value = e.target.value;

    handleTrackingStart({
      name: field.id,
      valueToSave: value,
      key: FIELD_TRACKING_KEYS.fieldValue,
      valueToCompare: {
        text: value,
        ...{ position: field.uiPosition },
        ...{ rect: field.uiRectangle },
      },
    });
    this.cursor = e.target.selectionStart;
    if (isLabelSelected) {
      setFieldKey({ fieldId: field.id, value });
    } else {
      setFieldValue({ fieldId: field.id, value });
    }
    this.updateTextareaRows(e.target);
    this.props.onInputValueChange({
      fieldId: field.id,
      value: !isLabelSelected ? value : field.uiValue,
      label: isLabelSelected ? value : field.uiLabel,
    });

    const { rtUpdateFields, documentActions } = this.props;
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

    if (rtUpdateFields.includes(field.id) && !isLabelSelected) {
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

  handleTextareaBlur = (e) => {
    const value = e.target.value;
    const { handleTrackingEnd, field } = this.props;
    handleTrackingEnd({
      name: field.id,
      key: FIELD_TRACKING_KEYS.fieldValue,
      valueToSave: value,
      valueToCompare: {
        text: value,
        ...{ position: field.uiPosition },
        ...{ rect: field.uiRectangle },
      },
    });
  };

  render() {
    const { field, style, readOnly = false, isLabelSelected } = this.props;

    const {
      uiLabel,
      uiValue,
      uiIsValidFormat,
      label,
      subPType,
      formatMessage,
    } = field;
    if (subPType === 'line_item') {
      return null;
    }

    const error =
      !uiIsValidFormat && !isLabelSelected
        ? formatMessage || 'The format is not valid '
        : null;

    return (
      <div
        className={styles.ReviewSidebarFloatedBox}
        style={style}
        id='rt-field-input-box'
      >
        <div className={styles.ReviewSidebarFloatedBox__action}>
          <p className={styles['ReviewSidebarFloatedBox__action--label']}>
            {!this.props.slug ? label : uiLabel}
          </p>
          <form
            method='post'
            autoComplete='off'
            onSubmit={this.handleFormSubmit}
          >
            <textarea
              ref={this.textareaRef}
              rows={this.state.rows}
              value={isLabelSelected ? uiLabel : uiValue}
              readOnly={readOnly}
              className={styles['ReviewSidebarFloatedBox__action--area']}
              onKeyPress={this.handleTextareaKeyPress}
              onChange={this.handleTextareaChange}
              onBlur={this.handleTextareaBlur}
              data-hj-allow
            />
          </form>
          {error ? (
            <p className={styles['ReviewSidebarFloatedBox__action--err']}>
              {error}
            </p>
          ) : null}
        </div>

        {readOnly ? null : (
          <div className={styles.btnsContainer}>
            <IconButton
              onClick={this.handleCancelBtnClick}
              icon={Cancel}
              variant='outlined'
              className={styles.btnsContainer__btn}
            />
            <IconButton
              onClick={this.handleSubmitBtnClick}
              icon={Check}
              className={styles.btnsContainer__btn}
              variant='contained'
            />
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProp(state) {
  const { rtUpdateFields } = state.documents;
  const { user = {}, config = {} } = state.app;

  return {
    rtUpdateFields,
    user,
    config,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default WithTrackingContext(
  connect(mapStateToProp, mapDispatchToProps)(FieldInputBox)
);
