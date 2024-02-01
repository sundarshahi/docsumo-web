/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { actions as servicesActions } from 'new/redux/services/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { SUPPORT_LINK } from 'new/constants/urllink';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button from 'new/ui-elements/Button/Button';
import Checkbox from 'new/ui-elements/Checkbox/Checkbox';
import Modal from 'new/ui-elements/Modal/Modal';

import ModalHeader from '../ModalHeader';

import InputSwitch from './InputSwitch';
import TrainModel from './TrainModel';
import VersionSelect from './VersionSelect';

import styles from './index.scss';
const TABS = [
  {
    title: 'Document Types',
    uid: 'documenttypes',
  },
  {
    title: 'Train',
    uid: 'train',
  },
];

const REMOVE_TYPE = ['auto_classify', 'auto_classify__test'];

class AutoClassifyModal extends Component {
  state = {
    activeTab: TABS[0].uid,
    enabledDocument: [],
    typeFiltered: [],
    currentLabel: '',
    errorMessage: '',
    options: [
      {
        label: 'Version 1',
        uid: 'v1',
      },
    ],
  };

  async UNSAFE_componentWillMount() {
    const { appActions, documentTypeContent, documentActions } = this.props;

    documentActions.allDocumentsTypeFetch();
    appActions.showLoaderOverlay();
    const response = await api.getCurrentVersion();
    const version = _.get(response.responsePayload, 'data');
    if (version.key) {
      const documentResponse = await api.getSelectedDocumentTypes({
        key: version.key,
      });
      const currentDocumentTypes = _.get(
        documentResponse.responsePayload,
        'data'
      );
      this.setState({
        typeFiltered: currentDocumentTypes,
        versionKey: version.key,
      });
    }
    this.setState({
      enabledDocument: documentTypeContent,
      currentLabel: version.label,
    });
    this.fetchTrainVersion();
    appActions.hideLoaderOverlay();
  }

  async componentDidMount() {
    this.setActiveTab(TABS[0].uid);
  }

  setActiveTab = (activeTab) => {
    this.setState({ activeTab: activeTab });
  };

  handleTabClick = (e, uid) => {
    e.preventDefault();
    this.setState({
      activeTab: uid,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  };

  handleFilterChange = ({ target = {} }) => {
    const { typeFiltered } = this.state;
    let result = [];
    const value = target?.value;
    const included = typeFiltered.includes(value);
    if (!included) {
      result = [...typeFiltered, value];
    } else {
      result = typeFiltered.filter((e) => e !== value);
    }

    this.setState({ typeFiltered: result });
  };

  handleChangedValueSubmit = async ({ value }) => {
    const { typeFiltered = [] } = this.state;
    const { appActions, user, docConfig } = this.props;
    appActions.showLoaderOverlay();
    let payload = {
      version: value,
    };
    try {
      const response = await api.updateClassificationVersion(payload);
      if (response) {
        const response = await api.getCurrentVersion();
        const version = _.get(response.responsePayload, 'data');
        if (version.key) {
          this.setState({
            versionKey: version.key,
            currentLabel: version.label,
            errorMessage: '',
          });

          const { canSwitchToOldMode = true } = docConfig;
          // Add mixpanel event
          mixpanel.track(MIXPANEL_EVENTS.setup_auto_classify, {
            'work email': user.email,
            step: 'Select Version',
            'model version': value,
            docType: typeFiltered.join(', '),
            version: 'new',
            mode: user.mode,
            canSwitchUIVersion: canSwitchToOldMode,
          });
        }
      }
    } catch (e) {
      const errorResponse = e.responsePayload.error;
      this.setState({
        errorMessage: errorResponse,
      });
      appActions.setToast({
        title: errorResponse,
        error: true,
      });
    }
    appActions.hideLoaderOverlay();
  };

  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.autoClassifyStatus !== this.props.autoClassifyStatus) {
      if (this.props.autoClassifyStatus === 'completed') {
        this.fetchTrainVersion();
        const response = await api.getCurrentVersion();
        const version = _.get(response.responsePayload, 'data');
        if (version.key) {
          this.setState({
            versionKey: version.key,
            currentLabel: version.label,
            errorMessage: '',
          });
        }
      }
    }
    if (prevProps.documentTypeContent !== this.props.documentTypeContent) {
      this.setState({
        enabledDocument: this.props.documentTypeContent,
      });
    }
  }

  displayContent = (activeTab) => {
    switch (activeTab) {
      case 'documenttypes':
        return this.displayDocumentTypes();
      case 'train':
        return this.displayTrain();
      default:
        return this.displayDocumentTypes();
    }
  };

  startTrain = async () => {
    this.setState({
      isLoadingTrain: true,
    });
    const { typeFiltered = [] } = this.state;
    const { user, docConfig } = this.props;
    let payload = {
      labels: typeFiltered,
    };

    try {
      await api.startAutoClassify(payload);

      const { canSwitchToOldMode = true } = docConfig;
      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.setup_auto_classify, {
        'work email': user.email,
        step: 'Train model',
        docType: typeFiltered.join(', '),
        version: 'new',
        mode: user.mode,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    } catch (e) {
      //do nothing
    } finally {
      this.setState({
        isLoadingTrain: false,
      });
    }
  };

  displayDocumentTypes = () => {
    const { enabledDocument, typeFiltered } = this.state;
    let documentTypesComponent = [];
    const checkBoxList = _.filter(
      enabledDocument,
      (document) => !REMOVE_TYPE.includes(document.docType)
    );

    documentTypesComponent.push(
      <div className={styles.docTypeHeader}>
        <span className={styles.docTypeHeader__title}>Documents types</span>
        <div className={styles.docTypeHeader__subTitle}>
          Select at least two document types, ensuring that each document type
          contains at least 20 documents to adequately train an
          auto-classification model.
        </div>
      </div>
    );

    documentTypesComponent.push(
      <div className={styles.checkBoxGroups}>
        {checkBoxList.map(
          ({ id = '', title = '', docType = '', docCounts = {} }, _idx) => {
            const totalCount = docCounts.reviewing + docCounts.processed;
            const isChecked = typeFiltered.includes(docType);
            const isDisabled = totalCount >= 20 || isChecked ? false : true;
            return (
              <>
                <div className={styles.checkBox} key={crypto.randomUUID()}>
                  <Checkbox
                    name={title}
                    checked={isChecked}
                    value={docType}
                    disabled={isDisabled}
                    onChange={this.handleFilterChange}
                    className={styles.checkBox__input}
                  />
                  <div
                    className={cx(
                      styles.checkBox__title,
                      'd-flex',
                      { [styles.checkBox__checked]: isChecked },
                      {
                        [styles.checkBox__disabled]: isDisabled,
                      }
                    )}
                  >
                    <div className='text-truncate'>{title}</div>
                    &nbsp;
                    <div>
                      {`(${
                        totalCount >= 10000
                          ? Math.floor(totalCount / 1000) + 'K'
                          : totalCount || 0
                      })`}
                    </div>
                  </div>
                </div>
              </>
            );
          }
        )}
      </div>
    );
    return documentTypesComponent;
  };

  handleSwitchChange = (api) => {
    const { id, canUpload, value } = api;
    const { servicesActions, user, docConfig } = this.props;
    const { canSwitchToOldMode = true } = docConfig;

    servicesActions.updateService({
      serviceId: id,
    });

    servicesActions.statusUpdate({
      serviceId: id,
      status: !canUpload,
      callback: () => {
        // Add mixpanel event
        mixpanel.track(MIXPANEL_EVENTS.click_api, {
          'work email': user.email,
          'document type': value,
          CTA: !canUpload ? 'enable' : 'disable',
          version: 'new',
          mode: user.mode,
          canSwitchUIVersion: canSwitchToOldMode,
        });
      },
    });
  };

  displayTrain = () => {
    let trainComponent = [];
    const { typeFiltered, isLoadingTrain, versionKey, errorMessage, options } =
      this.state;
    const {
      appActions,
      documentActions,
      autoClassifyStatus,
      handleStatus,
      user,
      docConfig,
      documentData,
    } = this.props;

    const autoClassifyAPI =
      documentData?.find(
        (api) =>
          api.value === 'auto_classify' || api.value === 'auto_classify__test'
      ) || {};

    const canUpload = autoClassifyAPI.canUpload;

    const trainable =
      autoClassifyAPI.status === 'upload_more_doc' ||
      autoClassifyAPI.status === 'enable_more_apis' ||
      autoClassifyAPI.status === 'processing'
        ? false
        : true;

    trainComponent.push(
      <span className={styles.trainHeader}>
        Auto Classification Configuration:
      </span>
    );

    trainComponent.push(
      <TrainModel
        trainable={trainable && typeFiltered?.length >= 2}
        typeFiltered={typeFiltered}
        startTrain={this.startTrain}
        isLoadingTrain={isLoadingTrain}
        appActions={appActions}
        documentActions={documentActions}
        autoClassifyStatus={autoClassifyStatus}
        user={user}
        config={docConfig}
      />
    );

    trainComponent.push(
      <VersionSelect
        value={versionKey}
        options={options}
        handleChangedValueSubmit={this.handleChangedValueSubmit}
        errorMessage={errorMessage}
      />
    );

    trainComponent.push(
      <InputSwitch
        canUpload={canUpload}
        handleToggleAutoClassify={() =>
          this.handleSwitchChange(autoClassifyAPI)
        }
      />
    );

    return trainComponent;
  };

  handleCloseBtnClick = () => {
    const { documentActions, appActions } = this.props;

    appActions.hideDarkOverlay();
    documentActions.displayAutoClassifyModal(false);
    documentActions.selectedService({
      documentTypeModel: {},
    });
  };

  fetchTrainVersion = async () => {
    const response = await api.getAutoClassifyVersion();
    this.setState({
      options: response?.responsePayload?.data,
    });
  };

  componentWillUnmount() {
    this.props.documentActions.changeAutoClassifyStatus({
      autoClassifyStatus: '',
    });
  }

  render() {
    const { activeTab, typeFiltered } = this.state;
    const { showAutoClassifyPopUpModal } = this.props;
    return (
      <Fragment>
        <Modal
          onCloseHandler={this.handleCloseBtnClick}
          show={showAutoClassifyPopUpModal}
          animation='fade'
          size='lg'
        >
          <div className={styles.autoClassify}>
            <ModalHeader
              title='Auto Classify'
              showInfoIcon={true}
              handleCloseBtnClick={this.handleCloseBtnClick}
              href={SUPPORT_LINK.AUTO_CLASSIFY_DOC}
              label='Read more about auto classification'
            />
            <div className={styles.autoClassifyRoot}>
              <div className={styles.leftContainer}>
                <div className={styles.leftContainer__navigation}>
                  {TABS.map(({ title, uid }, i) => (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                    <div
                      key={`${uid}-${i}`}
                      role='button'
                      tabIndex={i}
                      className={cx(
                        styles.tab,
                        {
                          [styles.active]: activeTab === uid,
                        },
                        'py-3',
                        'px-4'
                      )}
                      onClick={(e) => this.handleTabClick(e, uid, title)}
                    >
                      {title}
                    </div>
                  ))}
                </div>
              </div>
              <div className={cx(styles.rightContainer, 'p-6')}>
                <div className={styles.rightContainer__content}>
                  {activeTab
                    ? this.displayContent(activeTab) &&
                      this.displayContent(activeTab).map((item) => item)
                    : null}
                </div>
              </div>
            </div>
            <div className={cx(styles.autoClassify__footer, 'py-4', 'px-6')}>
              <Button
                variant='outlined'
                size='small'
                className='mr-4'
                onClick={this.handleCloseBtnClick}
              >
                Cancel
              </Button>
              {activeTab === 'documenttypes' ? (
                <Button
                  variant='contained'
                  size='small'
                  onClick={() => this.setActiveTab('train')}
                  disabled={!(typeFiltered.length >= 2)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant='contained'
                  size='small'
                  onClick={() => this.handleCloseBtnClick()}
                >
                  Save & Close
                </Button>
              )}
            </div>
          </div>
        </Modal>
      </Fragment>
    );
  }
}

const Container = (props) => {
  const { showAutoClassifyPopUpModal } = props;

  const open = showAutoClassifyPopUpModal;

  if (!open) {
    return null;
  }

  return <AutoClassifyModal {...props} />;
};

function mapStateToProp({ documents, app, services }) {
  const {
    downloadConfirmationType,
    config,
    downloadDocConfirmation,
    docSettingData,
    docId,
    documentsById,
    autoClassifyStatus,
    showAutoClassifyPopUpModal,
  } = documents;

  const { services: documentData } = services.servicePage;

  const { config: docConfig, user } = app;

  const { documentIds } = documents.allDocumentsTypePage;

  const documentTypeContent =
    documentIds &&
    documentIds.map((documentId) => {
      return documentsById[documentId];
    });

  return {
    downloadConfirmationType,
    downloadDocConfirmation,
    config,
    docConfig,
    docSettingData,
    docId,
    documentData,
    documentTypeContent,
    autoClassifyStatus,
    user,
    showAutoClassifyPopUpModal,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
    servicesActions: bindActionCreators(servicesActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(Container);
