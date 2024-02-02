/* eslint-disable jsx-a11y/no-autofocus */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import {
  Cancel,
  Check,
  EditPencil,
  NavArrowLeft,
  PageDown,
  Restart,
  Scissor,
  Trash,
  VerticalMerge,
} from 'iconoir-react';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { ReactComponent as ErrorIcon } from 'new/assets/images/icons/error_confidence.svg';
import { PageScrollableContent } from 'new/components/layout/page';
import routes from 'new/constants/routes';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button from 'new/ui-elements/Button/Button';
import { Dropdown } from 'new/ui-elements/Dropdown/Dropdown';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Input from 'new/ui-elements/Input/Input';
import { validateFileName } from 'new/utils/validation';

import styles from './SplitPDFDocument.scss';

class SplitPDFDocument extends Component {
  state = {
    documents: [],
    showConfirmSplitModal: false,
    isSplitting: false,
    classificationDocTypeOption: [],
  };

  componentDidMount = () => {
    this.setPages();
    this.setState({
      classificationDocTypeOption: this.currentDocTypes(),
    });
  };

  currentDocTypes = () => {
    const {
      config: { documentTypes = [] },
    } = this.props;
    return documentTypes?.filter(
      (item) =>
        item.canUpload &&
        (item.value !== 'auto_classify' || item.value === 'auto_classify__test')
    );
  };

  getDocData = () => {
    const { currentDocument = {} } = this.props;
    const { docId, title, type } = currentDocument;
    return { type, docId, title };
  };

  setPages = () => {
    const { currentRootSplitDocId, currentDocument } = this.props;
    if (currentRootSplitDocId) {
      let documents = [];
      let currentFile = this.currentDocTypes().find(
        (item) => item.value === currentDocument.type
      );
      documents.push({
        pages: currentDocument.pages,
        classification: currentDocument && currentDocument.type,
        classificationTitle: currentFile && currentFile.title,
        fileName: '',
        isEditing: false,
        isCollapsed: false,
        fileNameError: '',
      });

      this.setState({ documents });
    }
  };

  componentDidUpdate = (prevProps) => {
    const { currentDocument, currentRootSplitDocId } = this.props;
    const {
      currentDocument: prevDocument,
      currentRootSplitDocId: prevCurrentSplitDocId,
    } = prevProps;
    if (
      currentDocument &&
      prevDocument &&
      currentDocument.pages.length !== prevDocument.pages.length
    ) {
      this.setPages();
    }
    if (prevCurrentSplitDocId !== currentRootSplitDocId) {
      this.setPages();
    }
  };

  handleCloseSplitView = () => {
    const { documentActions } = this.props;
    const { user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const { type = '', docId = '', title: docTitle = '' } = this.getDocData();
    mixpanel.track(MIXPANEL_EVENTS.split_screen_close, {
      'work email': user.email,
      origin: 'Spreadsheet Screen',
      type: type,
      'document id': docId,
      'document title': docTitle,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    documentActions.storeRootSplitDocumentId({
      currentRootSplitDocId: null,
    });
  };

  handleConfirmSplit = async () => {
    const {
      currentRootSplitDocId,
      history,
      documentIds = [],
      spreadsheetNavigateBtnClick,
      currentDocument,
      documentActions,
      user,
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config;

    const { documents } = this.state;
    const { type = '', docId = '', title: docTitle = '' } = this.getDocData();
    const splitDoc = documents.map((doc) => doc.pages[doc.pages.length - 1].id);
    splitDoc.pop();
    const classifications = documents.map((doc) => doc.classification);
    const fileNames = documents.map((doc) => doc.fileName);

    this.setState({ isSplitting: true });
    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.split_approve, {
      'work email': user.email,
      origin: 'Spreadsheet Screen',
      type: type,
      'document id': docId,
      'document title': docTitle,
      'total section': documents.length,
      doctype: classifications,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    try {
      await api.splitClassifyDocument({
        doc_id: currentRootSplitDocId,
        pages: splitDoc,
        file_type: '',
        classifications: classifications,
        filenames: fileNames,
      });
      this.handleCloseSplitView();
      const currentIndex = documentIds.indexOf(currentDocument.docId);
      const nextDocId = documentIds[currentIndex + 1];
      documentIds.splice(currentIndex, 1);
      documentActions.updateExcelReviewDocIds({ documentIds });
      if (nextDocId) {
        spreadsheetNavigateBtnClick(nextDocId, 'next');
      } else {
        history.push(routes.ALL);
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
    const { currentDocument, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const { type = '', docId = '', title: docTitle = '' } = this.getDocData();

    let currentFile = this.currentDocTypes().find(
      (item) => item.value === currentDocument.type
    );
    const currentDocRow = documents[parentIndex].pages;

    const firstPageGroup = {
      pages: currentDocRow.slice(0, childIndex + 1),
      classification: currentDocument && currentDocument.type,
      classificationTitle: currentFile && currentFile.title,
      fileName: '',
      isCollapsed: false,
    };
    const secondPageGroup = {
      pages: currentDocRow.slice(childIndex + 1),
      classification: currentDocument && currentDocument.type,
      classificationTitle: currentFile && currentFile.title,
      fileName: '',
      isCollapsed: false,
    };

    documents.splice(parentIndex, 1, firstPageGroup, secondPageGroup);

    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.split_icon_click, {
      'work email': user.email,
      origin: 'Spreadsheet Screen',
      type: type,
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
    const { user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const { type = '', docId = '', title: docTitle = '' } = this.getDocData();
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
      origin: 'Spreadsheet Screen',
      type: type,
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
    const { user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const { type = '', docId = '', title: docTitle = '' } = this.getDocData();
    documents[parentIndex].classification = 'delete';
    documents[parentIndex].isEditing = false;
    documents[parentIndex].fileNameError = '';
    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.split_delete_part, {
      'work email': user.email,
      origin: 'Spreadsheet Screen',
      type: type,
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
    const { user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const { type = '', docId = '', title: docTitle = '' } = this.getDocData();
    documents[parentIndex].classification = '';
    documents[parentIndex].classificationTitle = '';
    documents[parentIndex].isCollapsed = false;
    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.split_restore_part, {
      'work email': user.email,
      origin: 'Spreadsheet Screen',
      type: type,
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

  handleValueClick = (title, value, id, parentIndex) => {
    const { documents } = this.state;
    const { user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const { type = '', docId = '', title: docTitle = '' } = this.getDocData();
    documents[parentIndex].classification = value;
    documents[parentIndex].classificationTitle = title;
    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.split_dropdown_value, {
      'work email': user.email,
      origin: 'Spreadsheet Screen',
      type: type,
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
    const { currentDocument, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const { type = '', docId = '', title: docTitle = '' } = this.getDocData();
    documents[parentIndex].isEditing = true;
    documents[parentIndex].fileNameError = '';

    if (!documents[parentIndex].fileName) {
      const fileNameArr = currentDocument.title.split('.');
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
      origin: 'Spreadsheet Screen',
      type: type,
      'document id': docId,
      'document title': docTitle,
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
    const { currentDocument, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const { type = '', docId = '', title: docTitle = '' } = this.getDocData();
    e.preventDefault();

    const fileNameValidation = validateFileName(
      documents[parentIndex].fileName
    );

    if (!fileNameValidation.isValid) {
      documents[parentIndex].fileNameError = fileNameValidation.message;
    } else {
      const fileNameArr = currentDocument.title.split('.');

      documents[parentIndex].isEditing = false;
      documents[parentIndex].fileName += `.${fileNameArr.pop()}`; // Add file extension back
    }
    const pageGroup = documents[parentIndex];
    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.split_edit_title_save, {
      'work email': user.email,
      origin: 'Spreadsheet Screen',
      type: type,
      'document id': docId,
      'document title': docTitle,
      label: pageGroup.fileName,
      'section number': parentIndex,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    this.setState({ documents });
  };

  handleRenameFileCancel = (parentIndex) => {
    let { documents } = this.state;
    const { user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const { type = '', docId = '', title: docTitle = '' } = this.getDocData();
    const pageGroup = documents[parentIndex];
    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.split_edit_title_discard, {
      'work email': user.email,
      origin: 'Spreadsheet Screen',
      type: type,
      'document id': docId,
      'document title': docTitle,
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
            variant='ghost'
          ></IconButton>
          <h2 className='heading-6'>Edit Document</h2>
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
            variant='ghost'
            className={cx(styles.iconBtn)}
          ></IconButton>
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
    const { currentDocument } = this.props;
    const { documents, classificationDocTypeOption } = this.state;

    return (
      <>
        <div className={styles.pages}>
          {documents.map((pageGroup = {}, parentIndex) => {
            return (
              <div
                key={`pages-group-${parentIndex}`}
                className={cx(styles.group, {
                  [styles.group_blur]: pageGroup.classification === 'delete',
                  [styles.group_merge]:
                    parentIndex >= 0 && parentIndex < documents.length - 1,
                })}
              >
                <div className={cx(styles.groupHeader)}>
                  <div className={styles.groupHeader_content}>
                    <div className={styles.groupHeader_left}>
                      {pageGroup.classification === 'delete' ? (
                        <>
                          <h3
                            className={styles.fileName}
                            title={currentDocument.title}
                          >
                            <span>
                              {pageGroup.fileName || currentDocument.title}
                            </span>
                          </h3>
                          <span className={styles.part}>
                            . Deleted Part ({pageGroup.pages.length} pages)
                          </span>
                        </>
                      ) : (
                        <>
                          {pageGroup.isEditing ? (
                            this.renderEditFileNameForm(parentIndex)
                          ) : (
                            <>
                              <h3
                                className={styles.fileName}
                                title={currentDocument.title}
                              >
                                <span>
                                  {pageGroup.fileName
                                    ? pageGroup.fileName
                                    : currentDocument.title}
                                </span>
                              </h3>
                              {documents.length <=
                              1 ? null : pageGroup.fileName ? null : (
                                <span className={styles.part}>
                                  . Part {parentIndex + 1}
                                </span>
                              )}
                              <IconButton
                                icon={EditPencil}
                                className='ml-2'
                                variant='text'
                                type='button'
                                title='Rename'
                                onClick={() =>
                                  this.handleEditFileNameClick(parentIndex)
                                }
                              />

                              <Dropdown
                                data={classificationDocTypeOption}
                                value={pageGroup.classification}
                                className={styles.groupDropdown}
                                onChange={({ title, value, id }) =>
                                  this.handleValueClick(
                                    title,
                                    value,
                                    id,
                                    parentIndex
                                  )
                                }
                              />
                            </>
                          )}
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
                    {pageGroup.pages && pageGroup.pages.length
                      ? pageGroup.pages.map((page, index) => {
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
                                  <Scissor />
                                  <div className={styles.separator} />
                                </button>
                              ) : null}
                            </div>
                          );
                        })
                      : null}
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
    const { currentRootSplitDocId } = this.props;

    if (!currentRootSplitDocId) {
      return null;
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

function mapStateToProp({ documents, app }) {
  const {
    currentRootSplitDocId,
    excelTool: { documentsById, documentIds },
  } = documents;

  const currentDocument =
    currentRootSplitDocId && documentsById[currentRootSplitDocId];
  const { config, user } = app;

  return {
    currentRootSplitDocId,
    currentDocument,
    documentIds,
    config,
    user,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(SplitPDFDocument)
);
