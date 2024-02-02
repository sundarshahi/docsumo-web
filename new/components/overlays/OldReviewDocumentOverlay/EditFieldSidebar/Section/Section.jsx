import React from 'react';
import { connect } from 'react-redux';
import { showToast } from 'new/redux/helpers';
import { actions as documentActions } from 'new/redux/oldDocuments/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { NavArrowDown, NavArrowUp, Plus, Trash } from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { ReactComponent as ArrowActiveIcon } from 'new/assets/images/icons/arrow-active.svg';
import DeleteConfirmationModal from 'new/components/modals/DeleteConfirmationModal/DeleteConfirmationModal';
import { HelpTooltip } from 'new/components/overlays/OldReviewDocumentOverlay/tooltip';
import ttConstants from 'new/constants/helpTooltips';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Input from 'new/ui-elements/Input/Input';
import Tooltip from 'new/ui-elements/Tooltip';
import { customMixpanelTracking } from 'new/utils/mixpanel';
import { Draggable, Droppable } from 'react-beautiful-dnd';

import Field from '../Field/Field';

import styles from './Section.scss';
class Section extends React.Component {
  state = {
    isEditingName: false,
    isUpdatingName: false,
    uiNameValue: '',
    isDeleting: false,
    isFocussed: false,
    showDeleteSectionModal: false,
    isDeleteSectionLoading: false,
    newFieldValue: '',
    addingSectionValue: false,
    submittingFieldValue: false,
    fieldAdded: false,
  };

  nameInputRef = React.createRef();
  addFieldInputRef = React.createRef();

  componentDidMount() {
    if (!this.state.uiNameValue) {
      this.setState({
        uiNameValue: _.get(this.props.section, 'title'),
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { isEditingName } = this.state;

    const { isEditingName: prevIsEditingName } = prevState;

    if (isEditingName && isEditingName !== prevIsEditingName) {
      if (this.nameInputRef && this.nameInputRef.current) {
        this.nameInputRef.current.focus();
      }
    }
  }

  handleFocusInput = () => {
    if (
      !this.state.isFocussed &&
      this.nameInputRef &&
      this.nameInputRef.current
    ) {
      this.nameInputRef.current.focus();
      this.setState({
        isFocussed: true,
        isEditingName: true,
      });
      this.props.documentActions.rtSetSelectedFieldId({
        fieldId: null,
      });
    }
  };

  handleTitleSubmit = async (e) => {
    e.preventDefault();
    const { uiNameValue, isUpdatingName } = this.state;
    const {
      docType,
      section: { id },
      setSectionNameValue,
      documentActions,
    } = this.props;
    setSectionNameValue();
    this.nameInputRef.current.blur();

    if (isUpdatingName) {
      return;
    }

    if (!uiNameValue) {
      showToast({
        title:
          'Section title cannot be left blank. The section title has been reverted to its previous name.',
        error: true,
      });
      this.setState({
        uiNameValue: this.props.section?.title || '',
      });
      return;
    }

    this.setState({
      isUpdatingName: true,
    });

    try {
      const response = await api.updateSectionTitle({
        payload: {
          p_title: uiNameValue,
          doc_type: docType,
          id,
        },
      });

      if (response) {
        documentActions.rtUpdateSectionData({
          section: {
            ...this.props.section,
            title: this.state.uiNameValue,
          },
          sectionId: id,
        });
        this.setState({
          isEditingName: false,
          isUpdatingName: false,
          isFocussed: false,
        });
      }
    } catch (e) {
      const errorMessage = _.get(
        e?.responsePayload,
        'message',
        'Something went wrong'
      );
      showToast({
        title: `Failed to update title, ${errorMessage}`,
        error: true,
      });
      this.setState({
        isUpdatingName: false,
        uiNameValue: this.props.section?.title || '',
      });
    }
  };

  handleNameInputChange = (e) => {
    const inputValue = e.target.value;
    const inputValueWithTrim = inputValue.trim();

    const {
      section: { id },
      setSectionNameValue,
    } = this.props;

    if (inputValueWithTrim !== '') {
      setSectionNameValue({ value: inputValue, id });
      this.setState({
        uiNameValue: inputValue,
      });
    } else {
      if (this.state.uiNameValue !== '') {
        setSectionNameValue({ value: '', id });
        this.setState({
          uiNameValue: '',
        });
      }
    }
  };

  handleMoveUpDownField = (currentFieldIndex, nextFieldIndex) => {
    const { section, documentActions, fieldsById } = this.props;
    const { id, children, fieldIds } = section;

    const currentFieldId = fieldIds[currentFieldIndex];
    const nextFieldId = fieldIds[nextFieldIndex];

    const currentChildrenIdx = children.findIndex(
      (e) => e.id === currentFieldId
    );
    const nextChildrenIdx = children.findIndex((e) => e.id === nextFieldId);

    const currentField = children[currentChildrenIdx];
    const nextField = children[nextChildrenIdx];

    const newCurrentChildren = { ...nextField, id: currentFieldId };
    const newNextChildren = { ...currentField, id: nextFieldId };

    children.splice(currentChildrenIdx, 1, newCurrentChildren);
    children.splice(nextChildrenIdx, 1, newNextChildren);

    documentActions.rtUpdateSectionData({
      section: {
        ...section,
        children,
      },
      sectionId: id,
    });
    documentActions.rtUpdateFieldsByIdData({
      fieldsById: {
        ...fieldsById,
        [currentFieldId]: {
          ...fieldsById[nextFieldId],
          id: currentFieldId,
        },
        [nextFieldId]: {
          ...fieldsById[currentFieldId],
          id: nextFieldId,
        },
      },
    });
  };

  handleMoveToSection = (currentFieldIndex, currentFieldId, nextSectionId) => {
    const { section, sectionsById, documentActions } = this.props;
    const { fieldIds, children, id } = section;

    const childrenIndex = children.findIndex((e) => e.id === currentFieldId);
    const fieldData = children[childrenIndex];

    fieldIds.splice(currentFieldIndex, 1);
    children.splice(childrenIndex, 1);

    documentActions.rtUpdateSectionData({
      section: {
        ...section,
        fieldIds,
        children,
      },
      sectionId: id,
    });

    const {
      fieldIds: nextFieldIds,
      children: nextChildren,
      ...rest
    } = sectionsById[nextSectionId] || {};
    documentActions.rtUpdateSectionData({
      section: {
        ...rest,
        fieldIds: [...nextFieldIds, currentFieldId],
        children: [...nextChildren, fieldData],
      },
      sectionId: nextSectionId,
    });
  };

  closeDeleteSectionModal = () => {
    this.setState({ showDeleteSectionModal: false });
  };

  toggleSectionContainer = () => {
    const {
      documentActions,
      collapsedSectionIds,
      section: { id },
    } = this.props;

    if (collapsedSectionIds.includes(id)) {
      this.handleCollapseExpandMixpanelTrack('section_field_expand', id);
      documentActions.updateCollapsedSectionIds({
        collapsedSectionIds: collapsedSectionIds.filter((item) => item !== id),
      });
    } else {
      this.handleCollapseExpandMixpanelTrack('section_field_collapse', id);
      documentActions.updateCollapsedSectionIds({
        collapsedSectionIds: [...collapsedSectionIds, id],
      });
    }
  };

  handleCollapseExpandMixpanelTrack = (action, id) => {
    const {
      docId = '',
      docType = '',
      user,
      config: { canSwitchToOldMode = true },
    } = this.props;
    mixpanel.track(MIXPANEL_EVENTS[action], {
      docId: docId,
      docType: docType,
      'work email': user?.email,
      version: 'new',
      origin: 'Edit Field Screen',
      sectionId: id,
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  handleSectionInput = () => {
    this.setState({ isEditingName: true });
  };

  deleteSection = () => {
    const {
      docId = '',
      docType = '',
      user: { email = '' },
      config: { canSwitchToOldMode = false },
      section: { id = '' },
    } = this.props;

    this.setState({
      isDeleteSectionLoading: true,
    });

    this.props.onSectionDeleteBtnClick({
      docType,
      id,
      afterAction: () => {
        this.setState({
          isDeleteSectionLoading: false,
          showDeleteSectionModal: false,
        });
      },
    });
    customMixpanelTracking(MIXPANEL_EVENTS.delete_section, {
      docId,
      docType,
      email,
      canSwitchUIVersion: canSwitchToOldMode,
      sectionId: id,
    });
  };

  handleDeleteSectionField = ({ id }) => {
    this.props.onDeleteSectionField({
      docType: this.props.docType,
      id,
    });
  };

  handleDeleteSectionBtnClick = () => {
    this.setState({ showDeleteSectionModal: true });
  };

  trackMixpanel = (evtName, fieldName = '') => {
    const {
      docId = '',
      docType = '',
      user: { email },
      config: { canSwitchToOldMode = false },
    } = this.props;
    customMixpanelTracking(evtName, {
      docId,
      docType,
      email,
      canSwitchUIVersion: canSwitchToOldMode,
      fieldName,
    });
  };

  handleFieldChange = (e) => {
    const inputValue = e.target.value.trim();

    if (inputValue !== '') {
      this.setState({ newFieldValue: e.target.value });
    } else {
      if (this.state.newFieldValue !== '') {
        this.setState({ newFieldValue: '' });
      }
    }
  };

  handleFieldBlurEvent = () => {
    if (this.state.newFieldValue.length) {
      this.submitFieldValue();
    }
  };

  handleKeyPress = (e) => {
    e.stopPropagation();
    const { key } = e;
    if ((key === 'Enter' || key === 'Tab') && this.state.newFieldValue.length) {
      this.submitFieldValue();
      this.setState({ fieldAdded: true });
    }
  };

  submitFieldValue = () => {
    const { section, docId, docType, documentActions } = this.props;

    this.setState({ submittingFieldValue: true });

    documentActions.rtAddFieldInSection({
      docType,
      docId,
      id: section?.id,
      label: this.state.newFieldValue,
      afterAction: (fieldId) => {
        this.props.changeSelectedDropdownId(fieldId);
        this.props.onSidebarReadOnlyFieldClick({
          fieldId,
          disableInputFocus: true,
        });
        this.setState({ newFieldValue: '', submittingFieldValue: false });
      },
      errorAfterAction: (e) => {
        documentActions.resetLoadingFieldId();
        this.setState({ submittingFieldValue: false });
      },
    });
    this.trackMixpanel(MIXPANEL_EVENTS.add_fields, this.state.newFieldValue);
  };

  onAddFieldInputFocus = () => {
    if (this.state.fieldAdded) {
      this.addFieldInputRef?.current?.focus();
      this.setState({ fieldAdded: false });
    }
  };

  onAddSectionBtnClick = () => {
    this.setState({ addingSectionValue: true });
    const { docType, docId, documentActions } = this.props;

    documentActions.rtAddSection({
      docType,
      docId,
      sectionType: 'contact_info',
      afterAction: () => {
        this.setState({ addingSectionValue: false });
      },
      errorAfterAction: (e) => {
        this.setState({ addingSectionValue: false });
        // eslint-disable-next-line quotes
      },
    });
  };

  render() {
    const {
      section,
      docReadOnly,
      docType,
      docId,
      onSidebarLineItemFieldClick,
      onSidebarFieldInputFocus,
      onSidebarReadOnlyFieldClick,
      onSidebarFieldInputValueChange,
      onSidebarFieldInputFormSubmit,
      onSidebarFieldLabelFormSubmit,
      updateLabelSlug,
      onFilterBtnClick,
      onInputSelect,
      setFieldKey,
      setFieldValue,
      toolTipView,
      scrollSectionFieldIntoView,
      dataTypes,
      lineItemTooltip,
      isLastSection,
      onLineFieldInputFocus,
      selectedDropdownId,
      changeSelectedDropdownId,
      onFooterFieldInputSubmit,
      onFooterFieldInputValueChange,
      selectedSectionId,
      collapsedSectionIds,
      sectionIds,
    } = this.props;

    const { fieldIds, id } = section;

    const isSectionCollapsed = collapsedSectionIds.includes(id);

    const {
      isEditingName,
      isUpdatingName,
      uiNameValue,
      isDeleting,
      submittingFieldValue,
      addingSectionValue,
      isDeleteSectionLoading,
    } = this.state;

    return (
      <div className={styles.section} id={id}>
        <DeleteConfirmationModal
          show={this.state.showDeleteSectionModal}
          isLoading={isDeleteSectionLoading}
          onCloseHandler={this.closeDeleteSectionModal}
          handleDeleteBtnClick={this.deleteSection}
          modalTitle='Delete Section'
          modalBody='Are you sure you want to delete this section?'
        />
        <div className={styles.header}>
          <div className={styles.sectionRow} title={uiNameValue}>
            <form
              method='post'
              autoComplete='off'
              className={styles.form}
              onSubmit={(e) => this.handleTitleSubmit(e)}
            >
              <input
                value={uiNameValue}
                onChange={this.handleNameInputChange}
                ref={this.nameInputRef}
                className={styles.input}
                onFocus={this.handleFocusInput}
                onBlur={(e) => this.handleTitleSubmit(e)}
              />
              <div className={styles.inputLabel}>
                <span
                  className={cx(
                    'mr-1',
                    'text-truncate',
                    styles.inputLabel__text
                  )}
                  role='presentation'
                >
                  {uiNameValue}
                </span>
                <Tooltip
                  label={isSectionCollapsed ? 'Expand' : 'Collapse'}
                  placement='right'
                  className={styles.inputLabel__arrowTooltip}
                >
                  {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
                  <span
                    className={cx('mt-1', styles.inputLabel__arrowIcon)}
                    onClick={this.toggleSectionContainer}
                    tabIndex='-1'
                    role='button'
                    id={`js-section-arrow-${id}`}
                  >
                    {!isSectionCollapsed ? (
                      <NavArrowUp />
                    ) : id === selectedSectionId ? (
                      <ArrowActiveIcon />
                    ) : (
                      <NavArrowDown />
                    )}
                  </span>
                </Tooltip>
              </div>
            </form>
          </div>
          <div className={styles.sectionRow}>
            {isEditingName && (
              <IconButton
                icon=''
                variant='text'
                className={styles.sectionRow__loaderIcon}
                isLoading={isUpdatingName}
              />
            )}
            <IconButton
              icon={Trash}
              isLoading={isDeleting}
              variant='ghost'
              colorScheme='danger'
              className={'ml-2'}
              disabled={sectionIds?.length === 1}
              onClick={this.handleDeleteSectionBtnClick}
            />
          </div>
        </div>
        {!isSectionCollapsed && (
          <div className={styles.content}>
            <Droppable droppableId={String(id)} direction='vertical'>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={styles.content__droppable}
                >
                  {fieldIds.map((fieldId, idx) => {
                    return (
                      <Draggable
                        key={fieldId}
                        draggableId={String(fieldId)}
                        index={idx}
                      >
                        {(provided) => (
                          <>
                            <Field
                              sectionId={id}
                              fieldId={fieldId}
                              sectionData={section}
                              provided={provided}
                              docReadOnly={docReadOnly}
                              docType={docType}
                              docId={docId}
                              updateLabelSlug={updateLabelSlug}
                              setFieldKey={setFieldKey}
                              lineItemTooltip={lineItemTooltip}
                              setFieldValue={setFieldValue}
                              onInputSelect={onInputSelect}
                              onFilterBtnClick={onFilterBtnClick}
                              onFooterFieldInputSubmit={
                                onFooterFieldInputSubmit
                              }
                              onDeleteSectionField={
                                this.handleDeleteSectionField
                              }
                              onSidebarFieldInputFocus={
                                onSidebarFieldInputFocus
                              }
                              onSidebarReadOnlyFieldClick={
                                onSidebarReadOnlyFieldClick
                              }
                              onSidebarFieldInputValueChange={
                                onSidebarFieldInputValueChange
                              }
                              onSidebarFieldInputFormSubmit={
                                onSidebarFieldInputFormSubmit
                              }
                              onSidebarLineItemFieldClick={
                                onSidebarLineItemFieldClick
                              }
                              onSidebarFieldLabelFormSubmit={
                                onSidebarFieldLabelFormSubmit
                              }
                              handleMoveUpField={() =>
                                this.handleMoveUpDownField(idx, idx - 1)
                              }
                              handleMoveDownField={() =>
                                this.handleMoveUpDownField(idx, idx + 1)
                              }
                              handleMoveToSection={(sectionId) =>
                                this.handleMoveToSection(
                                  idx,
                                  fieldId,
                                  sectionId
                                )
                              }
                              scrollSectionFieldIntoView={
                                scrollSectionFieldIntoView
                              }
                              selectedDropdownId={selectedDropdownId}
                              changeSelectedDropdownId={
                                changeSelectedDropdownId
                              }
                              onAddFieldInputFocus={this.onAddFieldInputFocus}
                              onLineFieldInputFocus={onLineFieldInputFocus}
                              onFooterFieldInputValueChange={
                                onFooterFieldInputValueChange
                              }
                              firstField={idx === 0}
                              lastField={idx === fieldIds.length - 1}
                              fieldSelected={section?.rowSelected}
                              dataTypes={dataTypes}
                            />
                          </>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <HelpTooltip
              id={toolTipView && ttConstants.TT_EDIT_FIELD_ADD_LINE_ITEM}
            >
              <div
                className={cx(styles.btnAddField, 'UFTooltipCustomDoctype1')}
              >
                <div onKeyDown={this.handleKeyPress} role='button' tabIndex={0}>
                  <Input
                    ref={this.addFieldInputRef}
                    placeholder='+Add a field'
                    className={cx('ml-7', styles.input)}
                    disabled={submittingFieldValue}
                    value={this.state.newFieldValue}
                    onChange={this.handleFieldChange}
                    onBlur={() => this.handleFieldBlurEvent()}
                  />
                </div>
                {submittingFieldValue && (
                  <IconButton
                    icon=''
                    variant='text'
                    className={styles.btnAddField__loader}
                    isLoading={submittingFieldValue}
                  />
                )}
              </div>
            </HelpTooltip>
          </div>
        )}

        {isLastSection && (
          <Button
            icon={Plus}
            variant='outlined'
            size='small'
            fluid
            className={styles.section__addBtn}
            isLoading={addingSectionValue}
            onClick={this.onAddSectionBtnClick}
          >
            {!addingSectionValue ? 'Add Section' : ''}
          </Button>
        )}
      </div>
    );
  }
}

function mapStateToProp(state) {
  const {
    sectionsById,
    fieldsById,
    sectionIds,
    sectionFieldIds,
    selectedSectionFieldId,
    collapsedSectionIds,
    selectedSectionId,
    selectedLineItemRowId,
  } = state.documents.reviewTool;

  const { user, config } = state.app;

  let selectedField = null;
  if (selectedSectionFieldId) {
    selectedField = fieldsById[selectedSectionFieldId] || null;
  }
  return {
    sectionsById,
    fieldsById,
    selectedField,
    sectionIds,
    sectionFieldIds,
    selectedLineItemRowId,
    selectedSectionId,
    collapsedSectionIds,
    user,
    config,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(Section);
