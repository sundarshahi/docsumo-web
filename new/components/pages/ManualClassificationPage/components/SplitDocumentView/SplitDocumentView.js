/* eslint-disable jsx-a11y/no-autofocus */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import {
  Cancel,
  Check,
  EditPencil,
  NavArrowLeft,
  PageDown,
  Restart,
  Trash,
  VerticalMerge,
} from 'iconoir-react';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { ReactComponent as ErrorIcon } from 'new/assets/images/icons/error_confidence.svg';
import { ReactComponent as ScissorIcon } from 'new/assets/images/icons/scissor.svg';
import { PageScrollableContent } from 'new/components/layout/page';
import routes from 'new/constants/routes';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button from 'new/ui-elements/Button/Button';
import { Dropdown } from 'new/ui-elements/Dropdown/Dropdown';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Input from 'new/ui-elements/Input/Input';
import { validateFileName } from 'new/utils/validation';

import styles from './SplitDocumentView.scss';
class SplitDocumentView extends Component {
  state = {
    documents: [],
    showConfirmSplitModal: false,
    isSplitting: false,
  };

  componentDidMount() {
    let { documents } = this.state;
    const { docFile, approveFlagChange } = this.props;
    if (docFile.pages && docFile.pages.length) {
      documents.push({
        pages: docFile.pages,
        classification: '',
        classificationTitle: '',
        fileName: '',
        isCollapsed: false,
        fileNameError: '',
      });
      approveFlagChange(false);
      this.setState({ documents });
    }
  }

  handleSplitApproveClick = () => {
    this.setState({ showConfirmSplitModal: true });
  };

  handleCancelSplit = () => this.setState({ showConfirmSplitModal: false });

  handleCloseSplitView = () => {
    const { closeSplitDocumentView, user, getDocData, config } = this.props;
    const {
      excelType = false,
      docId = '',
      title: docTitle = '',
    } = getDocData();
    const { canSwitchToOldMode = true } = config;

    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.split_screen_close, {
      'work email': user.email,
      origin: 'Manual Classification Screen',
      type: excelType ? 'excel' : 'pdf',
      'document id': docId,
      'document title': docTitle,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    closeSplitDocumentView();
  };

  handleConfirmSplit = async () => {
    const { documents } = this.state;
    const {
      docFile,
      getNextDocId,
      currentDocId,
      classifyActions,
      history,
      approveFlagChange,
      getDocData,
      user,
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config;

    const {
      excelType = false,
      docId = '',
      title: docTitle = '',
    } = getDocData();
    let nextDocId = getNextDocId(currentDocId);
    const splitDoc = documents.map((doc) => doc.pages[doc.pages.length - 1].id);
    splitDoc.pop();
    const classifications = documents.map((doc) => doc.classification);
    const fileNames = documents.map((doc) => doc.fileName);

    this.setState({ isSplitting: true });
    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.split_approve, {
      'work email': user.email,
      origin: 'Manual Classification Screen',
      type: excelType ? 'excel' : 'pdf',
      'document id': docId,
      'document title': docTitle,
      'total section': documents.length,
      doctype: classifications,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    try {
      await api.splitClassifyDocument({
        doc_id: docFile.docId,
        pages: splitDoc,
        file_type: '',
        classifications: classifications,
        filenames: fileNames,
      });
      approveFlagChange();
      this.handleCloseSplitView();
      classifyActions.updateClassifyData({ docId: currentDocId });
      if (nextDocId) {
        history.push(`${routes.MANUAL_CLASSIFICATION}/${nextDocId}`);
      } else {
        history.push(routes.ROOT);
      }
    } catch (e) {
      const { responsePayload: { message } = {} } = e || {};
      appActions.setToast({
        title:
          message ||
          'An error occurred while splitting documents. Please try again later.',
        error: true,
      });
    } finally {
      this.setState({ isSplitting: false, showConfirmSplitModal: false });
    }
  };

  handleSplitClick = (childIndex, parentIndex) => {
    const { documents } = this.state;
    const { getDocData, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const {
      excelType = false,
      docId = '',
      title: docTitle = '',
    } = getDocData();
    const currentDocRow = documents[parentIndex].pages;
    const firstPageGroup = {
      pages: currentDocRow.slice(0, childIndex + 1),
      classification: '',
      classificationTitle: '',
      fileName: '',
      isCollapsed: false,
    };
    const secondPageGroup = {
      pages: currentDocRow.slice(childIndex + 1),
      classification: '',
      classificationTitle: '',
      fileName: '',
      isCollapsed: false,
    };

    documents.splice(parentIndex, 1, firstPageGroup, secondPageGroup);

    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.split_icon_click, {
      'work email': user.email,
      origin: 'Manual Classification Screen',
      type: excelType ? 'excel' : 'pdf',
      'document id': docId,
      'document title': docTitle,
      'total section': documents.length,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    this.setState({ documents });
  };

  handleMergeClick = (parentIndex) => {
    const { documents } = this.state;
    const { getDocData, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const {
      excelType = false,
      docId = '',
      title: docTitle = '',
    } = getDocData();
    const currentDocRow = documents[parentIndex].pages || [];
    const nextDocRow = documents[parentIndex + 1].pages || [];

    const mergedRow = {
      pages: [...currentDocRow, ...nextDocRow],
      classification: '',
      classificationTitle: '',
      fileName: '',
      isCollapsed: false,
    };
    documents.splice(parentIndex, 2, mergedRow);
    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.merge_icon_click, {
      'work email': user.email,
      origin: 'Manual Classification Screen',
      type: excelType ? 'excel' : 'pdf',
      'document id': docId,
      'document title': docTitle,
      'total section': documents.length,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    this.setState({ documents });
  };

  handleDeletePart = (parentIndex) => {
    let { documents } = this.state;
    const { getDocData, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const {
      excelType = false,
      docId = '',
      title: docTitle = '',
    } = getDocData();
    documents[parentIndex].classification = 'delete';
    documents[parentIndex].isEditing = false;
    documents[parentIndex].fileNameError = '';

    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.split_delete_part, {
      'work email': user.email,
      origin: 'Manual Classification Screen',
      type: excelType ? 'excel' : 'pdf',
      'document id': docId,
      'document title': docTitle,
      'section number': parentIndex,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    this.setState({ documents });
  };

  handleRestorePart = (parentIndex) => {
    let { documents } = this.state;
    const { getDocData, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const {
      excelType = false,
      docId = '',
      title: docTitle = '',
    } = getDocData();
    documents[parentIndex].classification = '';
    documents[parentIndex].classificationTitle = '';
    documents[parentIndex].isCollapsed = false;
    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.split_restore_part, {
      'work email': user.email,
      origin: 'Manual Classification Screen',
      type: excelType ? 'excel' : 'pdf',
      'document id': docId,
      'document title': docTitle,
      'section number': parentIndex,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    this.setState({ documents });
  };

  handleToggleCollapse = (parentIndex) => {
    const { documents } = this.state;

    documents[parentIndex].isCollapsed = !documents[parentIndex].isCollapsed;

    this.setState({ documents });
  };

  handleValueClick = (value, title, id, parentIndex) => {
    const { documents } = this.state;

    documents[parentIndex].classification = value;
    documents[parentIndex].classificationTitle = title;
    const { getDocData, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const {
      excelType = false,
      docId = '',
      title: docTitle = '',
    } = getDocData();
    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.split_dropdown_value, {
      'work email': user.email,
      origin: 'Manual Classification Screen',
      type: excelType ? 'excel' : 'pdf',
      'document id': docId,
      'document title': docTitle,
      'section number': parentIndex,
      value: title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    this.setState({ documents });
  };

  handleEditFileNameClick = (parentIndex) => {
    let { documents } = this.state;
    const { docFile } = this.props;
    const { getDocData, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const { excelType = false, docId = '', title = '' } = getDocData();
    documents[parentIndex].isEditing = true;
    documents[parentIndex].fileNameError = '';

    if (!documents[parentIndex].fileName) {
      const fileNameArr = docFile.title.split('.');
      fileNameArr.pop();

      documents[parentIndex].fileName =
        fileNameArr.join('.') +
        (documents.length <= 1 ? '' : ` Part ${parentIndex + 1}`);
    } else {
      const fileNameArr = documents[parentIndex].fileName.split('.');
      fileNameArr.pop();

      documents[parentIndex].fileName = fileNameArr.join('.');
    }
    const pageGroup = documents[parentIndex];
    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.split_edit_title, {
      'work email': user.email,
      origin: 'Manual Classification Screen',
      type: excelType ? 'excel' : 'pdf',
      'document id': docId,
      'document title': title,
      label: pageGroup.fileName,
      'section number': parentIndex,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    this.setState({ documents });
  };

  handleRenameFileChange = (e, parentIndex) => {
    const { value } = e.target;
    let { documents } = this.state;

    documents[parentIndex].fileName = value;
    documents[parentIndex].fileNameError = '';

    this.setState({ documents });
  };

  handleRenameFileConfirm = (e, parentIndex) => {
    let { documents } = this.state;
    const { docFile } = this.props;

    e.preventDefault();

    const fileNameValidation = validateFileName(
      documents[parentIndex].fileName
    );

    if (!fileNameValidation.isValid) {
      documents[parentIndex].fileNameError = fileNameValidation.message;
    } else {
      const fileNameArr = docFile.title.split('.');

      documents[parentIndex].isEditing = false;
      documents[parentIndex].fileName += `.${fileNameArr.pop()}`; // Add file extension back
    }

    const { getDocData, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const { excelType = false, docId = '', title = '' } = getDocData();
    const pageGroup = documents[parentIndex];
    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.split_edit_title_save, {
      'work email': user.email,
      origin: 'Manual Classification Screen',
      type: excelType ? 'excel' : 'pdf',
      'document id': docId,
      'document title': title,
      label: pageGroup.fileName,
      'section number': parentIndex,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    this.setState({ documents });
  };

  handleRenameFileCancel = (parentIndex) => {
    let { documents } = this.state;
    const { getDocData, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const { excelType = false, docId = '', title = '' } = getDocData();
    const pageGroup = documents[parentIndex];
    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.split_edit_title_discard, {
      'work email': user.email,
      origin: 'Manual Classification Screen',
      type: excelType ? 'excel' : 'pdf',
      'document id': docId,
      'document title': title,
      label: pageGroup.fileName,
      'section number': parentIndex,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    documents[parentIndex].fileName = '';
    documents[parentIndex].isEditing = false;
    documents[parentIndex].fileNameError = '';

    this.setState({ documents });
  };

  renderHeader = () => {
    const { documents, isSplitting } = this.state;
    return (
      <div className={styles.header}>
        <div className={styles.leftBox}>
          <IconButton
            className={cx(styles.iconBtn, 'mr-2')}
            onClick={this.handleCloseSplitView}
            title='Go back'
            icon={NavArrowLeft}
            variant='text'
          />
          <h2 className='heading-6'>Review Classification</h2>
        </div>
        <div className={styles.rightBox}>
          <p className='mr-4 font-medium'>Split</p>
          <p className={styles.splitCount}>{documents.length}</p>
          <Button
            icon={Check}
            className='mx-6'
            isLoading={isSplitting}
            onClick={this.handleConfirmSplit}
            disabled={
              documents &&
              documents.some((item) => !item.classification || item.isEditing)
            }
            size='small'
            title={
              documents && documents.some((item) => !item.classification)
                ? 'Select the Doc Type for classification in section/s to enable.'
                : documents && documents.some((item) => item.isEditing)
                ? 'Save or discard file name changes to continue.'
                : null
            }
          >
            Approve
          </Button>
          <IconButton
            onClick={this.handleCloseSplitView}
            icon={Cancel}
            variant='text'
            className={cx(styles.iconBtn)}
          />
        </div>
      </div>
    );
  };

  renderEditFileNameForm = (parentIndex) => {
    const { documents } = this.state;
    const pageGroup = documents[parentIndex];
    return (
      <form onSubmit={(e) => this.handleRenameFileConfirm(e, parentIndex)}>
        <div className={styles.form}>
          <Input
            type='text'
            name='renameFile'
            autoFocus={true}
            value={pageGroup.fileName}
            className={styles.inputField}
            onChange={(e) => this.handleRenameFileChange(e, parentIndex)}
          />
          <Button
            type='submit'
            disabled={!pageGroup.fileName.trim()}
            size='small'
            className='ml-4'
          >
            Save
          </Button>
          <Button
            type='button'
            variant='outlined'
            onClick={() => this.handleRenameFileCancel(parentIndex)}
            size='small'
            className='ml-4'
          >
            Discard changes
          </Button>
        </div>
      </form>
    );
  };

  renderBody = () => {
    const { documents } = this.state;
    const { docFile, classificationDocTypeOption } = this.props;

    return (
      <>
        <div className={styles.pages}>
          {documents.map((pageGroup, parentIndex) => {
            return (
              <div
                key={`pages-group-${parentIndex}`}
                className={cx(styles.group, {
                  [styles.group_blur]: pageGroup.classification === 'delete',
                  [styles.group_merge]:
                    parentIndex >= 0 && parentIndex < documents.length - 1,
                })}
              >
                <div className={styles.groupHeader}>
                  <div className={styles.groupHeader_content}>
                    <div className={styles.groupHeader_left}>
                      {pageGroup.classification === 'delete' ? (
                        <>
                          <h2 className={styles.fileName} title={docFile.title}>
                            <span>{pageGroup.fileName || docFile.title}</span>
                          </h2>
                          <span className={styles.part}>
                            . Deleted Part ({pageGroup.pages.length} pages)
                          </span>
                        </>
                      ) : pageGroup.isEditing ? (
                        this.renderEditFileNameForm(parentIndex)
                      ) : (
                        <>
                          <h2 className={styles.fileName} title={docFile.title}>
                            <span>
                              {pageGroup.fileName
                                ? pageGroup.fileName
                                : docFile.title}
                            </span>
                          </h2>
                          {documents.length <=
                          1 ? null : pageGroup.fileName ? null : (
                            <span className={styles.part}>
                              . Part {parentIndex + 1}
                            </span>
                          )}
                          <IconButton
                            icon={EditPencil}
                            className='ml-2 mr-2'
                            variant='text'
                            type='button'
                            title='Rename'
                            onClick={() =>
                              this.handleEditFileNameClick(parentIndex)
                            }
                          />
                          <Dropdown
                            data={classificationDocTypeOption}
                            value={pageGroup.classificationTitle}
                            className={styles.dropdown}
                            optionLabelKey='title'
                            optionValueKey='value'
                            onChange={(value, title, id) =>
                              this.handleValueClick(
                                value,
                                title,
                                id,
                                parentIndex
                              )
                            }
                          />
                        </>
                      )}
                    </div>
                    {documents.length <= 1 ? null : pageGroup.classification !==
                      'delete' ? (
                      <Button
                        className={cx(styles.actionBtn, styles.actionBtn_red)}
                        title='Delete'
                        onClick={() => this.handleDeletePart(parentIndex)}
                        icon={Trash}
                        variant='text'
                        size='small'
                      >
                        Delete this part
                      </Button>
                    ) : (
                      <Button
                        title='Restore'
                        icon={Restart}
                        size='small'
                        variant='text'
                        onClick={() => this.handleRestorePart(parentIndex)}
                      >
                        Restore this part
                      </Button>
                    )}
                  </div>
                  <div className={styles.errorMsg}>
                    {pageGroup.fileNameError && <ErrorIcon />}
                    <span>{pageGroup.fileNameError}</span>
                  </div>
                </div>
                {pageGroup.isCollapsed ? null : (
                  <div className={styles.pagesGroup}>
                    {pageGroup.pages.length &&
                      pageGroup.pages.map((page, index) => {
                        const { image } = page;
                        return (
                          <div
                            className={styles.pageContainer}
                            key={`page-${parentIndex}-${index}`}
                          >
                            <div className={styles.pageDetails}>
                              <div className={styles.imgContainer}>
                                <img src={image.url} alt='' />
                              </div>
                              <p className={styles.pageNumber}>{index + 1}</p>
                            </div>
                            {index < pageGroup.pages.length - 1 ? (
                              <button
                                title={'Split'}
                                className={styles.splitButton}
                                onClick={() =>
                                  this.handleSplitClick(index, parentIndex)
                                }
                              >
                                <ScissorIcon />
                                <div className={styles.separator} />
                              </button>
                            ) : null}
                          </div>
                        );
                      })}
                  </div>
                )}
                {pageGroup.classification === 'delete' ? (
                  <button
                    className={cx(styles.collapseBtn, {
                      [styles.collapseBtn_open]: !pageGroup.isCollapsed,
                    })}
                    onClick={() => this.handleToggleCollapse(parentIndex)}
                  >
                    <PageDown />
                  </button>
                ) : parentIndex < documents.length - 1 ? (
                  <>
                    <IconButton
                      icon={VerticalMerge}
                      title={'Merge'}
                      className={styles.mergeIconBtn}
                      variant='outlined'
                      onClick={() => this.handleMergeClick(parentIndex)}
                    />
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  render() {
    const { docFile } = this.props;
    if (!docFile) {
      return <div>loading...</div>;
    }
    return (
      <div className={styles.wrapper}>
        {this.renderHeader()}
        <PageScrollableContent className={styles.body}>
          {this.renderBody()}
        </PageScrollableContent>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default withRouter(connect(null, mapDispatchToProps)(SplitDocumentView));
