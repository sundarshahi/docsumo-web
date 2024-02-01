/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from '@redux/app/actions';
import { actions as documentActions } from '@redux/documents/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
//import {ModalContent, ModalFooter} from 'components/shared/Modal';
//import {ReactComponent as CheckIcon} from 'images/icons/check.svg';
//import { ReactComponent as CloseIcon } from 'images/icons/clear.svg';
//import InputBox from '../../overlays/FilterOverlay/InputBox';
//import CustomDownloadArea from '../DocDownloadModal/CustomDownloadArea';
//import * as uuid from 'uuid/v4';
//import _ from 'lodash';
import * as api from 'client/api';
import { MIXPANEL_EVENTS } from 'client/thirdParty/mixpanel';
import { ReactComponent as CheckIcon } from 'images/icons/check.svg';
// import download from 'downloadjs';
import { ReactComponent as CloseIcon } from 'images/icons/clear.svg';
import { ReactComponent as InfoIcon } from 'images/icons/info.svg';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import OutsideClickHandler from 'react-outside-click-handler';
//import { Button, APPEARANCES as BUTTON_APPEARANCES} from 'components/widgets/buttons';
import Modal from 'react-responsive-modal';

import VersionSelectModal from 'components/shared/VersionSelectModal';
import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'components/widgets/buttons';

import InputSwitch from './InputSwitch';
// import _ from 'lodash';
// import * as api from 'client/api';
// import SplitNumber from './SplitNumber';
// import SplitText from './SplitText';
import SelectDocType from './SelectDocType';
// import InputBox from './InputBox';
// import DeleteDocType from './DelectDocType';
import TextField from './TextField';
// import PercentageBox from './PercentageBox';
// import TeamMember from './TeamMember';
// import InputSwitch from './InputSwitch';
// import DropDown from './DropDown';
// import FormInput from './FormInput';
// import FormDownload from './FormDownload';
// import CustomDownloadArea from './CustomDownloadArea';
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
    option: [
      {
        label: 'Version 1',
        uid: 'v1',
      },
    ],
    // codeValue: '',
    // filterData: '',
    // //isButtonLoading: false,
    // isSuccess: false,
    // isLoading: false,
    // isError: false,
  };

  async UNSAFE_componentWillMount() {
    const { appActions, documentTypeContent, documentActions } = this.props;
    // let apiDocument = documentData.filter((item) => {
    //     if(item.canUpload === true && item.value !== 'auto_classify'){
    //         return item;
    //     }
    // });

    // for( let i=0; i < apiDocument.length; i++){
    //     for( let j=0; j < documentTypeContent.length; j++){
    //         if(apiDocument[i].value === documentTypeContent[i].value){
    //             apiDocument[i]['docCounts'] = documentTypeContent[i].docCounts;
    //         }
    //     }
    // }
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

  handleFilterChange = (typeFiltered) => {
    this.setState({ typeFiltered });
    //this.handleClosePopover();
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
            docType: typeFiltered.join(', '),
            version: 'old',
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
    }
    appActions.hideLoaderOverlay();
  };
  async componentDidUpdate(prevProps) {
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
    //const { downloadConfirmationType, documentActions, docId, config } = this.props;
    //let document = this.props.docConfig.documentTypes.find((item) => item.value === downloadConfirmationType);
    try {
      await api.startAutoClassify(payload);

      const { canSwitchToOldMode = true } = docConfig;
      // Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.setup_auto_classify, {
        'work email': user.email,
        step: 'Train model',
        docType: typeFiltered.join(', '),
        version: 'old',
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

    documentTypesComponent.push(
      <TextField
        mainField={true}
        label={'Document Types'}
        helpText={
          'Select at least two document types, ensuring that each document type contains at least 20 documents to adequately train an auto-classification model.'
        }
      />
    );
    documentTypesComponent.push(
      <SelectDocType
        enabledDocument={_.filter(
          enabledDocument,
          (document) => !REMOVE_TYPE.includes(document.docType)
        )}
        handleFilterChange={this.handleFilterChange}
        typeFiltered={typeFiltered}
      />
    );
    return documentTypesComponent;
  };
  displayTrain = () => {
    let trainComponent = [];
    const { typeFiltered, isLoadingTrain, versionKey, errorMessage, option } =
      this.state;
    const {
      trainable,
      appActions,
      documentActions,
      autoClassifyStatus,
      canUpload,
      handleStatus,
      user,
      docConfig,
    } = this.props;
    trainComponent.push(
      <TextField
        mainField={true}
        label={'Auto Classification Configuration:'}
      />
    );
    trainComponent.push(
      <TrainModel
        label={'Train Auto Classification Engine'}
        trainable={trainable && typeFiltered.length >= 2}
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
        label={'Choose Version'}
        value={versionKey}
        option={option}
        handleChangedValueSubmit={this.handleChangedValueSubmit}
        errorMessage={errorMessage}
      />
    );
    trainComponent.push(
      <InputSwitch
        labelText={'Enable Auto Classification'}
        canUpload={canUpload}
        handleToggleAutoClassify={handleStatus}
      />
    );
    return trainComponent;
  };

  handleCloseBtnClick = () => {
    const { hideAutoClassifyModal } = this.props;
    hideAutoClassifyModal();
  };
  onOutsideClick = () => {
    this.setState({
      errorMessage: '',
    });
  };
  fetchTrainVersion = async () => {
    const response = await api.getAutoClassifyVersion();
    this.setState({
      option: response.responsePayload.data,
    });
  };

  openOption = async () => {
    this.setState({
      checkConfirm: true,
    });
    await this.fetchTrainVersion();
  };

  checkBtn = (checkConfirm = false) => {
    this.setState({ checkConfirm });
  };

  versionSelect = (value) => {
    this.handleChangedValueSubmit({
      value: value,
    });
  };

  componentWillUnmount() {
    this.props.documentActions.changeAutoClassifyStatus({
      autoClassifyStatus: '',
    });
  }

  render() {
    const {
      activeTab,
      typeFiltered,
      currentLabel,
      checkConfirm,
      option,
      versionKey,
    } = this.state;
    return (
      <Fragment>
        <Modal
          classNames={{
            modal: cx(styles.modal),
          }}
          open={true}
          center={true}
          closeOnEsc={false}
          closeOnOverlayClick={false}
          onOverlayClick={this.handleCloseBtnClick}
          showCloseIcon={false}
        >
          <div className={styles.root}>
            <div className={styles.leftBox}>
              <div className={styles.leftHeader}>Auto Classify</div>
              <div className={styles.navigation}>
                {TABS.map(({ title, uid }, i) => (
                  // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                  <div
                    role='button'
                    key={i}
                    tabIndex={i}
                    className={cx(styles.tab, {
                      [styles.active]: activeTab === uid,
                    })}
                    onClick={(e) => this.handleTabClick(e, uid, title)}
                  >
                    {title}
                  </div>
                ))}
              </div>
            </div>
            <OutsideClickHandler onOutsideClick={this.onOutsideClick}>
              <div className={styles.rightBox}>
                <div
                  role='button'
                  className={styles.leftHeader}
                  onClick={() => this.openOption()}
                >
                  {currentLabel}
                </div>
                <div className={styles.rightHeader}>
                  <a
                    className={styles.infoIconBox}
                    target='_blank'
                    rel='noopener noreferrer'
                    href='https://support.docsumo.com/docs/how-to-auto-classify-the-documents'
                  >
                    <InfoIcon className={styles.infoIcon} />
                    <div className={styles.tooltip}>
                      Read more about auto classification
                      <div className={styles.arrow} />
                    </div>
                  </a>
                  <button
                    className={styles.closeIcon}
                    onClick={() => this.handleCloseBtnClick()}
                  >
                    <CloseIcon />
                  </button>
                </div>
                <div className={styles.content}>
                  {activeTab
                    ? this.displayContent(activeTab) &&
                      this.displayContent(activeTab).map((item) => item)
                    : null}
                </div>
                {activeTab === 'documenttypes' ? (
                  <div className={styles.buttonContainer}>
                    <Button
                      text='Cancel'
                      iconLeft={CloseIcon}
                      appearance={BUTTON_APPEARANCES.PRIMARY_REVERSED}
                      className={cx(styles.btn, styles.btnCancel)}
                      onClick={() => this.handleCloseBtnClick()}
                    />
                    <Button
                      text='Save & Next'
                      iconLeft={CheckIcon}
                      appearance={BUTTON_APPEARANCES.PRIMARY}
                      className={styles.btn}
                      onClick={() => this.setActiveTab('train')}
                      disabled={!(typeFiltered.length >= 2)}
                    />
                  </div>
                ) : (
                  <div className={styles.buttonContainer}>
                    <Button
                      text='Cancel'
                      iconLeft={CloseIcon}
                      appearance={BUTTON_APPEARANCES.PRIMARY_REVERSED}
                      className={cx(styles.btn, styles.btnCancel)}
                      onClick={() => this.handleCloseBtnClick()}
                    />
                    <Button
                      text='Save & Close'
                      iconLeft={CheckIcon}
                      appearance={BUTTON_APPEARANCES.PRIMARY}
                      className={styles.btn}
                      onClick={() => this.handleCloseBtnClick()}
                    />
                  </div>
                )}
                {checkConfirm ? (
                  <VersionSelectModal
                    VersionData={option}
                    value={versionKey}
                    proceedActionText='Select & Close'
                    processIcon={CheckIcon}
                    cancelIcon={CloseIcon}
                    cancelActionText='Cancel'
                    onProceedActionBtnClick={this.versionSelect}
                    onCancelActionBtnClick={() => this.checkBtn(false)}
                    onCloseBtnClick={() => this.checkBtn(false)}
                  />
                ) : (
                  ''
                )}
              </div>
            </OutsideClickHandler>
          </div>
        </Modal>
      </Fragment>
    );
  }
}
const Container = (props) => {
  const { showAutoClassifyModal } = props;
  const open = showAutoClassifyModal;
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
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(Container);
