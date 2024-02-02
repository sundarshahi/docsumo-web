/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as classifyActions } from 'new/redux/classification/actions';
import { showToast } from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import copy from 'clipboard-copy';
import download from 'downloadjs';
import {
  Cancel,
  Check,
  Download,
  NavArrowLeft,
  NavArrowRight,
  Page,
  Trash,
} from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import DeleteConfirmationModal from 'new/components/modals/DeleteConfirmationModal/DeleteConfirmationModal';
import * as documentConstants from 'new/constants/document';
import routes from 'new/constants/routes';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button from 'new/ui-elements/Button/Button';
import { Dropdown } from 'new/ui-elements/Dropdown/Dropdown';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import queryString from 'query-string';

import ExcelDocumentView from './components/ExcelDocumentView/ExcelDocumentView';
import PDFDocumentView from './components/PDFDocumentView/PDFDocumentView';

import styles from './ManualClassificationPage.scss';
const accessDenied = 'Access Denied. Please contact admin to provide access.';

class ManualClassificationPage extends Component {
  state = {
    selectedClassification: '',
    documents: {},
    isLoading: true,
    excelData: [
      {
        name: 'Sample Data 1',
        isProtected: true,
        rows: [
          {
            cells: [],
          },
        ],
        columns: [],
      },
      {
        name: 'Sample Data 2',
        isProtected: true,
        rows: [
          {
            cells: [],
          },
        ],
        columns: [],
      },
    ],
  };

  UNSAFE_componentWillMount() {
    const {
      config: { documentTypes },
    } = this.props;
    const documentType = documentTypes.filter(
      (item) =>
        item.canUpload &&
        (item.value !== 'auto_classify' || item.value === 'auto_classify__test')
    );
    this.setState({
      classificationDocTypeOption: documentType,
    });
  }

  async componentDidMount() {
    const { documentIds, location, match, documentsById, classifyActions } =
      this.props;

    let startDocId = _.get(location, 'state.startDocId');
    startDocId =
      startDocId || _.get(match, 'params.docId') || _.keys(documentsById)[0];

    if (
      !startDocId ||
      (!_.isEmpty(documentIds) && !documentIds.includes(startDocId))
    ) {
      startDocId = documentIds[0];
    }

    let loading = false;
    if (_.isEmpty(documentIds) && startDocId) {
      classifyActions.startSingleClassify({
        docId: startDocId,
      });
      loading = true;
    }
    this.setState({
      currentDocId: startDocId,
      documents: documentsById,
      isLoading: loading,
    });
  }

  componentDidUpdate(prevProps) {
    const { documentIds: prevDocumentIds = [] } = prevProps;
    const { documentIds = [], documentsById = {}, match } = this.props;
    let startDocId = _.get(location, 'state.startDocId');
    startDocId =
      startDocId || _.get(match, 'params.docId') || _.keys(documentsById)[0];
    if (
      prevProps.match.params.docId !== this.props.match.params.docId ||
      (_.isEmpty(prevDocumentIds) && prevDocumentIds !== documentIds)
    ) {
      this.setState({
        documents: documentsById,
        currentDocId: startDocId,
        isLoading: false,
      });
    }
  }

  startClassify = (docId) => {
    this.props.classifyActions.startClassify({
      docId,
      queryParams: {
        ...this.state.pageQueryParams,
        status: [
          documentConstants.STATUSES.REVIEW_REQUIRED,
          documentConstants.STATUSES.REVIEWING,
        ],
        doc_type: 'auto_classify',
      },
    });
  };

  handleValueClick = ({ title, value, id }) => {
    const { user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const {
      excelType = false,
      docId = '',
      title: docTitle = '',
    } = this.getDocData();
    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.dropdown_value_manual_doc, {
      'work email': user.email,
      origin: 'Manual Classification Screen',
      type: excelType ? 'excel' : 'pdf',
      'document id': docId,
      'document title': docTitle,
      value: title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    this.setState({
      selectedClassification: title,
      selectedClassificationValue: value,
      docTypeId: id,
    });
  };

  getNextDocId = (docId) => {
    let nextDocId;
    const { documentIds } = this.props;
    const currentDocIndex = documentIds.indexOf(docId);
    nextDocId = documentIds[currentDocIndex + 1];
    return nextDocId;
  };

  handleClassify = async () => {
    const { appActions, classifyActions, history, user, config } = this.props;
    const { currentDocId, docTypeId, selectedClassification } = this.state;
    const { canSwitchToOldMode = true } = config;

    const {
      excelType = false,
      docId: documentId = '',
      title = '',
    } = this.getDocData();
    let docId = [];
    docId.push(currentDocId);
    let nextDocId = this.getNextDocId(currentDocId);
    appActions.showLoaderOverlay();
    this.setState({
      isClassifying: true,
    });
    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.appprove_manual_doc, {
      'work email': user.email,
      origin: 'Manual Classification Screen',
      type: excelType ? 'excel' : 'pdf',
      'document id': documentId,
      'document title': title,
      value: selectedClassification,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    try {
      await api.changeDocType({
        doc_ids: docId,
        doc_type_id: docTypeId,
      });
      classifyActions.updateClassifyData({ docId: currentDocId });
      if (nextDocId) {
        this.setState({
          currentDocId: nextDocId,
        });
        history.push(`${routes.MANUAL_CLASSIFICATION}/${nextDocId}`);
      } else {
        history.push(routes.ROOT);
      }
    } catch (e) {
      //error
      const { responsePayload: { message } = {}, statusCode } = e || {};
      appActions.setToast({
        title: statusCode === 403 ? accessDenied : message,
        error: true,
      });
    } finally {
      this.setState({
        isClassifying: true,
        selectedClassification: '',
        selectedClassificationValue: '',
        docTypeId: '',
      });
      appActions.hideLoaderOverlay();
    }
  };

  getDocData = () => {
    const { currentDocId = null, documents = {} } = this.state;
    let document = (documents && documents[currentDocId]) || {};
    const { excelType, docId, title } = document;
    return { excelType, docId, title };
  };

  handleDelete = async () => {
    const { user, config } = this.props;
    const { excelType = false, docId = '', title = '' } = this.getDocData();
    const { canSwitchToOldMode = true } = config;

    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.delete_manual_doc, {
      'work email': user.email,
      origin: 'Manual Classification Screen',
      type: excelType ? 'excel' : 'pdf',
      'document id': docId,
      'document title': title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    this.setState({
      deleteDoc: true,
    });
  };

  handleConfirmDelete = async () => {
    const { appActions, classifyActions, history, user, config } = this.props;
    const { excelType = false, docId = '', title = '' } = this.getDocData();
    const { currentDocId } = this.state;
    const { canSwitchToOldMode = true } = config;

    let nextDocId = this.getNextDocId(currentDocId);
    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.confirm_delete_manual_doc, {
      'work email': user.email,
      origin: 'Manual Classification Screen',
      type: excelType ? 'excel' : 'pdf',
      'document id': docId,
      'document title': title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    this.setState({
      isDeleting: true,
    });
    try {
      await api.deleteDocument({
        docId: currentDocId,
      });
      classifyActions.updateClassifyData({ docId: currentDocId });
      if (nextDocId) {
        this.setState({
          currentDocId: nextDocId,
        });
        history.push(`${routes.MANUAL_CLASSIFICATION}/${nextDocId}`);
      } else {
        history.push(routes.ROOT);
      }
    } catch (e) {
      //error
      const { responsePayload: { message } = {}, statusCode } = e || {};
      appActions.setToast({
        title: statusCode === 403 ? accessDenied : message,
        error: true,
      });
    } finally {
      this.setState({ isDeleting: false, deleteDoc: false });
    }
  };

  handleDeleteCancel = () => {
    const { user, config } = this.props;
    const { excelType = false, docId = '', title = '' } = this.getDocData();
    const { canSwitchToOldMode = true } = config;

    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.cancel_delete_manual_doc, {
      'work email': user.email,
      origin: 'Manual Classification Screen',
      type: excelType ? 'excel' : 'pdf',
      'document id': docId,
      'document title': title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    this.setState({
      deleteDoc: false,
    });
  };

  copyShareableClientLink = async () => {
    const appEnvironment = global.window.location.origin;
    const { currentDocId } = this.state;
    showToast({
      title: 'Please wait. Generating link',
      success: true,
      duration: 3000,
      removeClose: true,
    });
    this.setState({
      isGeneratingLink: true,
    });

    try {
      const response = await api.getTempToken({ docId: currentDocId });
      const { token = {} } = response.responsePayload;
      this.setState(
        {
          temporaryToken: token,
        },
        () => {
          this.setState({
            clientURL: `${appEnvironment}/manual-classification/${currentDocId}?token=${this.state.temporaryToken}&client=true`,
          });
        }
      );
    } catch (e) {
      //do nothing
    } finally {
      this.setState({
        isGeneratingLink: false,
      });
    }
    copy(this.state.clientURL);
    showToast({
      title: 'Link copied to clipboard',
      success: true,
      duration: 3000,
      removeClose: true,
    });
  };

  handleDownload = async () => {
    const { currentDocId } = this.state;
    const { appActions, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const { excelType = false, docId = '', title = '' } = this.getDocData();
    this.setState({
      isDownloading: true,
    });
    appActions.setToast({
      title: 'Downloading...',
      duration: 3000,
    });
    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.download_manual_doc, {
      'work email': user.email,
      origin: 'Manual Classification Screen',
      type: excelType ? 'excel' : 'pdf',
      'document id': docId,
      'document title': title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    try {
      let response = {};
      response = await api.downloadDocumentByFormat({
        type: 'original_file',
        doc_id: currentDocId,
      });
      const { responsePayload } = response;
      const downloadUrl = _.get(responsePayload, 'data.downloadUrl');
      download(downloadUrl);
    } catch (e) {
      const { responsePayload: { message } = {}, statusCode } = e || {};
      appActions.setToast({
        title: statusCode === 403 ? accessDenied : message,
        error: true,
      });
    } finally {
      this.setState({
        isDownloading: false,
      });
    }
  };

  handleCloseScreen = () => {
    const { originLocation, history, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const { pathname, search = '' } = originLocation;
    const currentQuery = queryString.parse(search);
    const { excelType = false, docId = '', title = '' } = this.getDocData();
    // Add mixpanel events
    mixpanel.track(MIXPANEL_EVENTS.close_manual_doc, {
      'work email': user.email,
      origin: 'Manual Classification Screen',
      type: excelType ? 'excel' : 'pdf',
      'document id': docId,
      'document title': title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    if (currentQuery) {
      let query = queryString.stringify(currentQuery, { encode: false });
      history.push(`${pathname}?${query}`);
    } else {
      history.push(pathname);
    }
  };

  renderHeader = () => {
    const {
      selectedClassification,
      classificationDocTypeOption,
      isDownloading,
    } = this.state;

    return (
      <>
        <div className={styles.header_left}>
          <Page />
          <span className={styles.header_title}>Review Classification</span>
        </div>
        <div className={styles.header_right}>
          <div className={styles.header_buttonGroup}>
            <Tooltip label='Download'>
              <IconButton
                variant={'text'}
                icon={Download}
                disabled={isDownloading}
                onClick={this.handleDownload}
              />
            </Tooltip>

            <Tooltip label='Delete'>
              <IconButton
                variant='ghost'
                colorScheme='danger'
                icon={Trash}
                iconClassName={styles.header_buttonGroup__delete}
                onClick={this.handleDelete}
              />
            </Tooltip>
          </div>
          <div className={styles.header_actionGroup}>
            <Dropdown
              value={this.state.selectedClassificationValue}
              placeholder={'Select Document Type'}
              data={classificationDocTypeOption}
              onChange={this.handleValueClick}
              optionLabelKey='title'
              optionValueKey='value'
            />
            <Button
              variant='contained'
              icon={Check}
              size='small'
              onClick={this.handleClassify}
              disabled={!selectedClassification}
            >
              Approve
            </Button>
            <div className={styles.action}>
              <IconButton
                variant={'text'}
                icon={Cancel}
                iconClassName={styles.action_icon}
                onClick={this.handleCloseScreen}
              >
                Close
              </IconButton>
            </div>
          </div>
        </div>
      </>
    );
  };

  renderFooter = () => {
    const { currentDocId } = this.state;
    const { documentIds, history, appActions, user, config } = this.props;
    const { canSwitchToOldMode = true } = config;

    const { excelType = false, docId = '', title = '' } = this.getDocData();
    const totalDocCount = documentIds.length;
    const currentDocIndex = documentIds.indexOf(currentDocId);
    if (currentDocIndex < 0) {
      return null;
    }
    const currentDocPosition = currentDocIndex + 1;
    let prevDocId;
    let nextDocId;
    if (currentDocIndex > 0) {
      prevDocId = documentIds[currentDocIndex - 1];
    }
    if (currentDocIndex < totalDocCount - 1) {
      nextDocId = documentIds[currentDocIndex + 1];
    }
    const handleNavClick = (docId) => {
      appActions.showLoaderOverlay();
      this.setState({
        currentDocId: docId,
      });
      history.push(`${routes.MANUAL_CLASSIFICATION}/${docId}`);
      appActions.hideLoaderOverlay();
    };
    return (
      <>
        <div className={styles.footer_pagination}>
          <IconButton
            variant={'text'}
            icon={NavArrowLeft}
            disabled={!prevDocId}
            iconClassName={styles.footer_navicon}
            onClick={() => {
              // Add mixpanel events
              mixpanel.track(MIXPANEL_EVENTS.previous_manual_doc, {
                'work email': user.email,
                origin: 'Manual Classification Screen',
                type: excelType ? 'excel' : 'pdf',
                'document id': docId,
                'document title': title,
                version: 'new',
                canSwitchUIVersion: canSwitchToOldMode,
              });
              handleNavClick(prevDocId);
            }}
          >
            Page Left
          </IconButton>
          <div className={cx('non-selectable', styles.footer_pageNumbers)}>
            <span>
              {currentDocPosition} of {totalDocCount}
            </span>
          </div>
          <IconButton
            variant={'text'}
            icon={NavArrowRight}
            disabled={!nextDocId}
            iconClassName={styles.footer_navicon}
            onClick={() => {
              // Add mixpanel events
              mixpanel.track(MIXPANEL_EVENTS.next_manual_doc, {
                'work email': user.email,
                origin: 'Manual Classification Screen',
                type: excelType ? 'excel' : 'pdf',
                'document id': docId,
                'document title': title,
                version: 'new',
                canSwitchUIVersion: canSwitchToOldMode,
              });
              handleNavClick(nextDocId);
            }}
          >
            Page Right
          </IconButton>
        </div>
      </>
    );
  };

  renderDocumentView = () => {
    const {
      currentDocId = null,
      documents = {},
      classificationDocTypeOption,
    } = this.state;
    const {
      originLocation = {},
      appActions,
      classifyActions,
      user,
      config,
    } = this.props;
    let document = (documents && documents[currentDocId]) || {};
    const { excelType } = document;
    if (excelType) {
      return (
        <ExcelDocumentView
          currentDocId={currentDocId}
          docFile={document}
          originLocation={originLocation}
          appActions={appActions}
        />
      );
    } else {
      return (
        <PDFDocumentView
          config={config}
          getDocData={this.getDocData}
          user={user}
          getNextDocId={this.getNextDocId}
          currentDocId={currentDocId}
          classifyActions={classifyActions}
          docFile={document}
          handleCloseScreen={this.handleCloseScreen}
          classificationDocTypeOption={classificationDocTypeOption}
        />
      );
    }
  };

  render() {
    const {
      isLoading,
      deleteDoc,
      isDeleting,
      documents = {},
      currentDocId = null,
    } = this.state;
    let document = (documents && documents[currentDocId]) || {};
    const { excelType } = document;
    return (
      <div className={styles.wrapper}>
        {isLoading ? (
          <div></div>
        ) : (
          <>
            <div className={styles.container}>
              <div className={styles.header}>{this.renderHeader()}</div>
              <div
                className={cx(styles.content, {
                  [styles.content__excelContent]: excelType,
                })}
              >
                {this.renderDocumentView()}
              </div>
              <div
                className={cx(styles.footer, {
                  [styles.excelFooter]: excelType,
                })}
              >
                {this.renderFooter()}
              </div>
            </div>
            <DeleteConfirmationModal
              show={deleteDoc}
              onCloseHandler={this.handleDeleteCancel}
              handleDeleteBtnClick={this.handleConfirmDelete}
              modalTitle='Confirm Delete Document'
              isLoading={isDeleting}
              modalBody='Are you sure you want to delete this document?'
            />
          </>
        )}
      </div>
    );
  }
}

function mapStateToProp(state) {
  const { config, user } = state.app;

  const { documentsById, documentIds, originLocation } = state.classify;
  return {
    user,
    config,
    documentIds,
    documentsById,
    originLocation,
  };
}
function mapDispatchToProp(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
    classifyActions: bindActionCreators(classifyActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProp)(ManualClassificationPage)
);
