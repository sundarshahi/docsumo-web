import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { matchPath } from 'react-router-dom';
import { actions as documentActions } from 'new/redux/documents/actions';
import { showToast } from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import copy from 'clipboard-copy';
import download from 'downloadjs';
import { Page, PageFlip, Table2Columns } from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { ModalContent, ModalHeader } from 'new/components/shared/Modal';
import { Row } from 'new/components/shared/tabularList';
import * as fileConstants from 'new/constants/file';
import { MIXPANEL_ORIGINS } from 'new/constants/mixpanel';
import * as documentsHelper from 'new/helpers/documents';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Spinner from 'new/ui-elements/Spinner/Spinner';
import * as utils from 'new/utils';
import Dropzone from 'react-dropzone';
import Modal from 'react-responsive-modal';

import styles from './index.scss';

class DocDownloadModal extends Component {
  state = {
    isUpdatingApiKey: false,
    pageQueryParams: null,
    queryParamSortValues: null,
    isDownloading: false,
  };

  constructor(props) {
    super(props);
    this.dropZoneTypeRef = React.createRef();
  }
  isMounted = false;
  webhookUrlInputRef = React.createRef();
  componentDidMount() {
    this.isMounted = true;
    this.fetchData();
  }

  UNSAFE_componentWillMount() {
    this.dateFilterRanges = documentsHelper.generateDateFilterRanges();
    const defaultDateRange = this.dateFilterRanges[0];
    this.allowedParams = {
      offset: {
        type: 'number',
        default: 0,
      },
      sort_by: {
        multiple: true,
        default: ['created_date.desc'],
      },
      created_date: {
        multiple: true,
        default: defaultDateRange.queryParamValue,
      },
    };

    const pageQueryParams = this.getValidPageQueryParams(
      _.get(this.props, 'location.search')
    );

    const activeDateFilterRanges =
      this.getActiveDateFilterRanges(pageQueryParams);
    const activeExcelDateFilterRanges =
      this.getActiveDateFilterRanges(pageQueryParams);
    const activeXMLDateFilterRanges =
      this.getActiveDateFilterRanges(pageQueryParams);
    const activeJSONDateFilterRanges =
      this.getActiveDateFilterRanges(pageQueryParams);
    const activeFileDateFilterRanges =
      this.getActiveDateFilterRanges(pageQueryParams);
    this.updateParamStateKeys({
      pageQueryParams,
      activeDateFilterRanges,
      activeExcelDateFilterRanges,
      activeXMLDateFilterRanges,
      activeJSONDateFilterRanges,
      activeFileDateFilterRanges,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      (!prevState.config && this.props.config) ||
      prevProps.config !== this.props.config
    ) {
      this.setState({
        config: this.props.config,
      });
    }
    const { isEditingWebhookUrl } = this.state;

    const { isEditingWebhookUrl: prevIsEditingWebhookUrl } = prevState;

    if (
      isEditingWebhookUrl &&
      isEditingWebhookUrl !== prevIsEditingWebhookUrl
    ) {
      if (this.webhookUrlInputRef && this.webhookUrlInputRef.current) {
        this.webhookUrlInputRef.current.focus();
      }
    }
  }

  updateParamStateKeys = ({
    pageQueryParams,
    queryParamSortValues,
    activeDateFilterRanges,
    activeExcelDateFilterRanges,
    activeFileDateFilterRanges,
    activeJSONDateFilterRanges,
    activeXMLDateFilterRanges,
  } = {}) => {
    if (!pageQueryParams) {
      pageQueryParams = this.getValidPageQueryParams(
        this.props.location.search
      );
    }

    if (!queryParamSortValues) {
      queryParamSortValues =
        utils.getQueryParamSortValuesAsObject(pageQueryParams);
    }

    if (!activeDateFilterRanges) {
      activeDateFilterRanges = this.getActiveDateFilterRanges(pageQueryParams);
    }

    if (!activeExcelDateFilterRanges) {
      activeExcelDateFilterRanges =
        this.getActiveDateFilterRanges(pageQueryParams);
    }

    if (!activeFileDateFilterRanges) {
      activeFileDateFilterRanges =
        this.getActiveDateFilterRanges(pageQueryParams);
    }

    if (!activeXMLDateFilterRanges) {
      activeXMLDateFilterRanges =
        this.getActiveDateFilterRanges(pageQueryParams);
    }

    if (!activeJSONDateFilterRanges) {
      activeJSONDateFilterRanges =
        this.getActiveDateFilterRanges(pageQueryParams);
    }

    this.setState({
      pageQueryParams,
      queryParamSortValues,
      activeDateFilterRanges,
      activeExcelDateFilterRanges,
      activeFileDateFilterRanges,
      activeJSONDateFilterRanges,
      activeXMLDateFilterRanges,
    });

    return {
      pageQueryParams,
      queryParamSortValues,
      activeDateFilterRanges,
      activeExcelDateFilterRanges,
      activeFileDateFilterRanges,
      activeJSONDateFilterRanges,
      activeXMLDateFilterRanges,
    };
  };

  getValidPageQueryParams = _.memoize((locationSearch) => {
    return utils.getValidPageQueryParams(locationSearch, this.allowedParams);
  });

  getActiveDateFilterRanges = (pageQueryParams) => {
    return {
      created_date: documentsHelper.getActiveDateFilterRange(
        this.dateFilterRanges,
        pageQueryParams['created_date']
      ),
    };
  };

  fetchData = async () => {
    this.setState({
      isFetchingData: true,
    });

    const requestName = 'DOC_TYPE_PAGE';

    try {
      this.props.requestActions.addRequest({
        name: requestName,
      });
      const [configResponse] = await Promise.all([api.getConfig()]);
      const config = _.get(configResponse.responsePayload, 'data');

      this.isMounted &&
        this.setState({
          isFetchingData: false,
          config,
        });
    } catch (e) {
      this.isMounted &&
        this.setState({
          isFetchingData: false,
        });
    }
  };

  handleWebhookUrlEditButtonClick = (e) => {
    e.preventDefault();

    const { config } = this.state;
    this.setState({
      isEditingWebhookUrl: true,
      isUpdatingWebhookUrl: false,
      uiWebhookUrlValue: _.get(config, 'webhookUrl') || '',
      uiWebhookUrlError: '',
    });
  };

  handleWebhookUrlInputChange = (e) => {
    const value = e.target.value;
    this.setState({
      uiWebhookUrlValue: value,
      uiWebhookUrlError: '',
    });
  };

  handleWebhookInputSubmit = async (e) => {
    e.preventDefault();
    const { uiWebhookUrlValue, isUpdatingWebhookUrl } = this.state;

    if (isUpdatingWebhookUrl) {
      return;
    }

    this.setState({
      isUpdatingWebhookUrl: true,
      uiWebhookUrlError: '',
    });

    try {
      const response = await api.updateUserSettingsWebhookUrl({
        webhookUrl: uiWebhookUrlValue,
      });
      const webhookUrl = _.get(response.responsePayload, 'data.webhookUrl');
      this.isMounted &&
        this.setState({
          config: {
            ...this.state.config,
            webhookUrl,
          },
          isEditingWebhookUrl: false,
          isUpdatingWebhookUrl: false,
        });
    } catch (e) {
      const error =
        _.get(e.responsePayload, 'error') || 'Failed to update Webhook URL';
      this.isMounted &&
        this.setState({
          isUpdatingWebhookUrl: false,
          uiWebhookUrlError: error,
        });
    }
  };

  handleApiKeyRefreshButtonClick = async (e) => {
    e.preventDefault();
    const { isUpdatingApiKey } = this.state;

    if (isUpdatingApiKey) {
      return;
    }

    this.setState({
      isUpdatingApiKey: true,
    });

    try {
      const response = await api.refreshUserDocsumoApiKey();
      const docsumoApiKey = _.get(
        response.responsePayload,
        'data.docsumoApiKey'
      );
      this.isMounted &&
        this.setState({
          isUpdatingApiKey: false,
          config: {
            ...this.state.config,
            docsumoApiKey,
          },
        });
    } catch (e) {
      this.isMounted &&
        this.setState({
          isUpdatingApiKey: false,
        });
    }
  };

  handleCloseBtnClick = () => {
    const {
      documentActions,
      downloadConfirmationType,
      downloadDocConfirmation,
    } = this.props;
    const doc = downloadConfirmationType || downloadDocConfirmation;
    this.setState({
      config: null,
    });
    if (!doc) return;
    documentActions.downloadDocTypeHideConfirmation({
      docType: doc,
    });
  };

  handleCopyText = (copyApi) => {
    copy(copyApi);
    showToast({
      title: 'API key copied to clipboard',
      success: true,
    });
  };

  handleCSVDateFilterRangeClick = (param, range) => {
    const { pageQueryParams } = this.state;
    const params = {
      ...pageQueryParams,
      [param]: range.queryParamValue,
    };
    this.setState({
      pageQueryParams: {
        ...params,
      },
      activeDateFilterRanges: this.getActiveDateFilterRanges(params),
    });
  };

  handleExcelDateFilterRangeClick = (param, range) => {
    const { pageQueryParams } = this.state;
    const params = {
      ...pageQueryParams,
      [param]: range.queryParamValue,
    };
    this.setState({
      pageQueryParams: {
        ...params,
      },
      activeExcelDateFilterRanges: this.getActiveDateFilterRanges(params),
    });
  };

  handleFileDateFilterRangeClick = (param, range) => {
    const { pageQueryParams } = this.state;
    const params = {
      ...pageQueryParams,
      [param]: range.queryParamValue,
    };
    this.setState({
      pageQueryParams: {
        ...params,
      },
      activeFileDateFilterRanges: this.getActiveDateFilterRanges(params),
    });
  };
  handleJSONDateFilterRangeClick = (param, range) => {
    const { pageQueryParams } = this.state;
    const params = {
      ...pageQueryParams,
      [param]: range.queryParamValue,
    };
    this.setState({
      pageQueryParams: {
        ...params,
      },
      activeJSONDateFilterRanges: this.getActiveDateFilterRanges(params),
    });
  };
  handleXMLDateFilterRangeClick = (param, range) => {
    const { pageQueryParams } = this.state;
    const params = {
      ...pageQueryParams,
      [param]: range.queryParamValue,
    };
    this.setState({
      pageQueryParams: {
        ...params,
      },
      activeXMLDateFilterRanges: this.getActiveDateFilterRanges(params),
    });
  };

  handleDownloadBtnClick = async (type) => {
    const {
      downloadConfirmationType,
      downloadDocConfirmation,
      singleDoc,
      document,
      user,
      appConfig,
      history: {
        location: { state, pathname },
      },
    } = this.props;
    const { title, docId } = document;
    const { canSwitchToOldMode = true } = appConfig;
    const { pageQueryParams } = this.state;
    this.setState({
      id: type,
      isDownloading: true,
    });

    const originType =
      Object.values(MIXPANEL_ORIGINS).find((i) => {
        const match =
          matchPath(pathname, {
            path: i.path,
            isExact: true,
          }) || {};
        return match.isExact;
      }) || {};

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.document_download, {
      'work email': user.email,
      'document type': document.type,
      'download option': type,
      label: title,
      origin: originType.value || 'Shareable Link',
      docId: docId,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    try {
      let response = {};
      if (singleDoc) {
        if (type === 'original_file') {
          response = await api.downloadDocumentByFormat({
            queryParams: pageQueryParams,
            type: type,
            doc_id: downloadDocConfirmation,
          });
        } else {
          response = await api.downlaodMultiDocs({
            type: type,
            doc_ids: [downloadDocConfirmation],
          });
        }
      } else {
        response = await api.downloadProcessedDocuments({
          queryParams: pageQueryParams,
          type: type,
          doc_type: downloadConfirmationType,
        });
      }
      const { responsePayload } = response;
      const downloadUrl = _.get(responsePayload, 'data.downloadUrl');
      download(downloadUrl);
    } catch (e) {
      // Do nothing
    } finally {
      this.setState({
        id: null,
        isDownloading: false,
      });
    }
  };

  render() {
    const {
      downloadConfirmationType,
      downloadDocConfirmation,
      document,
      singleDoc,
    } = this.props;
    const { isDownloading, id } = this.state;
    // const {
    //     activeDateFilterRanges,
    //     isEditingWebhookUrl,
    //     isUpdatingWebhookUrl,
    //     uiWebhookUrlValue,
    //     isUpdatingApiKey,
    //     activeExcelDateFilterRanges,
    //     activeFileDateFilterRanges,
    //     activeJSONDateFilterRanges,
    //     activeXMLDateFilterRanges
    // } = this.state;
    //const config=this.state.config?this.state.config:this.props.config;
    const open = downloadDocConfirmation;
    // const isDocProcessed = document && document.status && document.status === documentConstants.STATUSES.PROCESSED;
    // const isDocTypeProcessed = document && document.docCounts && document.docCounts.processed;
    // const disablDownload = singleDoc ? !isDocProcessed : !isDocTypeProcessed;
    if (!open) return false;
    return (
      <Fragment>
        <Dropzone
          ref={this.dropZoneTypeRef}
          disableClick
          accept={fileConstants.SUPPORTED_MIME_TYPES}
          className={styles.dropzoneClassName}
          activeClassName={styles.dropzoneActiveClassName}
          rejectClassName={styles.dropzoneRejectClassName}
          onDropAccepted={this.handleDropAccepted}
          onDropRejected={this.handleDropRejected}
          onFileDialogCancel={this.handleFileDialogCancel}
        />
        <Modal
          classNames={{
            modal: cx(styles.modal),
            closeButton: styles.closeButton,
            closeIcon: styles.closeIcon,
            overlay: styles.overlay,
          }}
          open={!!open || false}
          center={true}
          closeOnEsc={false}
          closeOnOverlayClick={false}
          onOverlayClick={this.handleCloseBtnClick}
          onClose={this.handleCloseBtnClick}
        >
          {/* <Modal
                    className={cx(styles.modal, { [styles.modalHalf] : singleDoc })}
                    rootProps={{
                        titleText: 'Download',
                    }}
                > */}

          <ModalHeader
            title={'Download'}
            titleClassName={cx('ellipsis', styles.title)}
            className={styles.header}
            showCloseBtn={false}
            // closeBtnClassName={styles.closeBtnClassName}
            // onCloseBtnClick={this.handleCloseBtnClick}
          />
          {/* <Row className={styles.header}><p>Download</p></Row> */}
          <Row className={styles.headerContent}>
            {singleDoc ? 'Document Name: ' : 'Document Type: '}
            <p>{singleDoc ? document.title : downloadConfirmationType}</p>
          </Row>

          <ModalContent className={styles.modalContent}>
            <div className={cx(styles.download)}>
              <button
                className={styles.download__col}
                onClick={() => this.handleDownloadBtnClick('original_file')}
              >
                <div className={styles.download__iconWrap}>
                  {id === 'original_file' && isDownloading ? (
                    <Spinner />
                  ) : (
                    <Page />
                  )}
                </div>
                <span className={styles.download__label}>File</span>
              </button>

              <button
                className={styles.download__col}
                onClick={() => this.handleDownloadBtnClick('csv_long')}
              >
                <div className={styles.download__iconWrap}>
                  {id === 'csv_long' && isDownloading ? (
                    <Spinner />
                  ) : (
                    <Table2Columns />
                  )}
                </div>
                <span className={styles.download__label}>XLS</span>
              </button>

              <button
                className={styles.download__col}
                onClick={() => this.handleDownloadBtnClick('json')}
              >
                <div className={styles.download__iconWrap}>
                  {id === 'json' && isDownloading ? <Spinner /> : <PageFlip />}
                </div>
                <span className={styles.download__label}>JSON</span>
              </button>
            </div>

            {/* {singleDoc && (
              <Row
                className={cx(styles.row, styles.downloadRow, {
                  [styles.halfDownloadRow]: singleDoc,
                })}
              >
                <Cell>Download File :</Cell>
                <Cell className={styles.cell}>
                  <Button
                    iconLeft={DownloadIcon}
                    className={styles.btn}
                    isLoading={id === 'original_file' ? isDownloading : false}
                    onClick={() => this.handleDownloadBtnClick('original_file')}
                  >
                    Download
                  </Button>
                </Cell>
              </Row>
            )}
            <Row
              className={cx(styles.row, styles.downloadRow, {
                [styles.halfDownloadRow]: singleDoc,
              })}
            >
              <Cell>Download CSV :</Cell>
              <Cell className={styles.cell}>
                <Button
                  iconLeft={DownloadIcon}
                  className={styles.btn}
                  isLoading={id === 'csv_long' ? isDownloading : false}
                  //disabled={!!(disablDownload)}
                  onClick={() => this.handleDownloadBtnClick('csv_long')}
                >
                  Download
                </Button>
              </Cell>
            </Row>
            {singleDoc ? (
              <>
                <Row
                  className={cx(styles.row, styles.downloadRow, {
                    [styles.halfDownloadRow]: singleDoc,
                  })}
                >
                  <Cell>Download JSON :</Cell>
                  <Cell className={styles.cell}>
                    <Button
                      iconLeft={DownloadIcon}
                      className={styles.btn}
                      isLoading={id === 'json' ? isDownloading : false}
                      //disabled={!!(disablDownload)}
                      onClick={() => this.handleDownloadBtnClick('json')}
                    >
                      Download
                    </Button>
                  </Cell>
                </Row>
              </>
            ) : (
              <Row
                className={cx(styles.row, styles.downloadRow, {
                  [styles.halfDownloadRow]: singleDoc,
                })}
              >
                <Cell>Download Excel :</Cell>
                <Cell className={styles.cell}>
                  <Button
                    iconLeft={DownloadIcon}
                    className={styles.btn}
                    isLoading={id === 'xlsx' ? isDownloading : false}
                    //disabled={!!(disablDownload)}
                    onClick={() => this.handleDownloadBtnClick('xlsx')}
                  >
                    Download
                  </Button>
                </Cell>
              </Row>
            )} */}
          </ModalContent>
        </Modal>
      </Fragment>
    );
  }
}

function mapStateToProp({ documents, app }) {
  const {
    downloadConfirmationType,
    downloadDocConfirmation,
    config,
    docId,
    reviewTool,
  } = documents;
  const { config: appConfig } = app;
  const allDocuments = reviewTool.documentsById;

  const document = allDocuments[docId] || {};

  return {
    downloadConfirmationType,
    downloadDocConfirmation,
    config,
    document,
    appConfig,
    singleDoc: downloadDocConfirmation,
    user: app.user,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(DocDownloadModal);
