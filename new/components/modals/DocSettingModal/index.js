import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as csvActions } from 'new/redux/csv/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { showToast } from 'new/redux/helpers';
import { actions as modelActions } from 'new/redux/model/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import _, { get } from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { SUPPORT_LINK } from 'new/constants/urllink';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Modal from 'new/ui-elements/Modal/Modal';
import { validateURL } from 'new/utils/validation';
import * as uuid from 'uuid/v4';

import ModalHeader from '../ModalHeader';

import CustomDownloadArea from './CustomDownloadArea';
import DeleteDocType from './DelectDocType';
import DropDown from './DropDown';
import FormDownload from './FormDownload';
import FormInput from './FormInput';
import InputBox from './InputBox';
import InputSwitch from './InputSwitch';
import InputSwitchExtraction from './InputSwitchExtraction';
import NewTrainModel from './NewTrainModel';
import NewTrainModelExtraction from './NewTrainModelExtraction';
import SplitNumber from './SplitNumber';
import SplitText from './SplitText';
import TeamMember from './TeamMember';
import TextField from './TextField';
import VersionSelect from './VersionSelect';

import styles from './index.scss';

const TABS = [
  {
    title: 'General',
    uid: 'general',
  },
  {
    title: 'Pre-processing',
    uid: 'preprocessing',
  },
  {
    title: 'Import & Export',
    uid: 'exportandimport',
  },
  {
    title: 'Extraction',
    uid: 'extraction',
  },
  {
    title: 'Post-processing',
    uid: 'postprocessing',
  },
];

class DocSettingModal extends Component {
  state = {
    activeTab: TABS[0].uid,
    filterContainer: [],
    option: [],
    withContextDropDownOption: [],
    withoutContextDropDownOption: [],
    ddListObject: {},
    isResetting: false,
    isDocModal: false,
    isLabelUpdated: false,
    disableInput: true,
    docLabel: '',
  };

  async componentDidMount() {
    const { downloadConfirmationType } = this.props;
    this.setActiveTab(TABS[0].uid);
    this.setState({ isDocModal: true });
    const response = await api.getTrainVersion({
      docType: downloadConfirmationType,
    });
    this.setState({
      option: response.responsePayload.data,
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { docSettingData } = nextProps;
    this.setState({
      filterContainer: docSettingData,
    });
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

  handleChangedValueSubmit = ({
    id,
    filterId,
    value,
    checkError,
    label = '',
  }) => {
    const { downloadConfirmationType, appActions, docConfig } = this.props;
    let document = this.props.docConfig.documentTypes.find(
      (item) => item.value === downloadConfirmationType
    );
    const { documentActions, user } = this.props;

    // Validate input for Custom API URL
    if (id === 26) {
      const validateCustomAPI = validateURL(value);

      if (!validateCustomAPI.isValid) {
        appActions.setToast({
          title: validateCustomAPI.message,
          error: true,
        });
        return;
      }
    }

    documentActions.updateSettingData({
      id,
      filterId,
      label,
      docType: document?.value,
      value,
      title: document.title,
      checkErrorAlert: checkError,
    });

    const { canSwitchToOldMode = true } = docConfig;
    mixpanel.track(MIXPANEL_EVENTS.doc_setting_update, {
      label,
      docType: document?.value,
      'work email': user.email,
      'organization ID': user.orgId,
      version: 'new',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  handleValidate = async ({ id, value }) => {
    this.setState({
      isLoading: true,
      codeValue: value,
    });
    const { downloadConfirmationType } = this.props;
    try {
      const response = await api.customValidation({
        docType: downloadConfirmationType,
        payload: {
          id: id,
          value: value,
        },
      });
      const status = _.get(response.responsePayload, 'status');
      if (status === 'success') {
        this.setState({
          isSuccess: true,
          isLoading: false,
        });
      } else {
        this.setState({
          isSuccess: false,
          isLoading: false,
          isError: true,
        });
      }
    } catch (e) {
      const errorMsg = get(
        e.responsePayload,
        'error',
        'An error occurred while validating the code. Please try again later.'
      );

      this.setState({
        isSuccess: false,
        isLoading: false,
        isError: true,
        errorMsg,
      });
    } finally {
      this.setState({
        codeValue: '',
      });
    }
  };

  async UNSAFE_componentWillMount() {
    const { docSettingData, downloadConfirmationType } = this.props;
    this.setState({
      filterContainer: docSettingData,
    });

    let ddListObject = {};
    const ddlistItem = docSettingData.filter(
      (item) => item.filterType === 'extended_radio_button'
    );
    const response = await Promise.all([
      ...ddlistItem.map(async (item) => {
        let otherSheetResponse = await api.getModelDDList({
          id: item.id,
          type: downloadConfirmationType,
        });
        return otherSheetResponse;
      }),
    ]);

    for (let i = 0; i < ddlistItem.length; i++) {
      ddListObject[ddlistItem[i].id] = response[i].responsePayload.data;
    }
    this.setState({
      ddListObject,
    });
  }

  startTrain = async () => {
    this.setState({
      isLoadingTrain: true,
    });
    const { downloadConfirmationType } = this.props;

    try {
      await api.nlpTraining({
        doc_type: downloadConfirmationType,
      });
    } catch (e) {
      //do nothing
    } finally {
      this.setState({
        isLoadingTrain: false,
      });
    }
  };

  saveDocumentLabel = async (title) => {
    this.setState({ isLabelUpdated: true });
    const {
      docId,
      downloadConfirmationType,
      user,
      docConfig,
      appActions,
      documentActions,
    } = this.props;
    try {
      const response = await api.updateDocumentTypeTitle({
        payload: {
          title: title,
          docId: docId,
          doc_type: downloadConfirmationType,
        },
      });
      const document = _.get(response.responsePayload, 'data.document');
      appActions.updateDocTypeName({ documentName: title, docId });

      documentActions.updateDocumentType({
        document,
      });

      this.updateDocLabel(title);
    } catch (err) {
      const errorMessage =
        err?.responsePayload?.message ?? 'Error updating document label!';
      showToast({
        title: errorMessage,
        error: true,
        duration: 3000,
      });
    } finally {
      this.setState({ isLabelUpdated: false });
      this.toggleDisableInput();
      const { canSwitchToOldMode = true } = docConfig;
      mixpanel.track(MIXPANEL_EVENTS.doc_setting_update, {
        label: 'Edit Document Label',
        docType: downloadConfirmationType,
        'work email': user.email,
        'organization ID': user.orgId,
        version: 'new',
        mode: user.mode,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    }
  };

  updateDocLabel = (title) => {
    this.setState({
      docLabel: title,
    });
  };

  toggleDisableInput = () =>
    this.setState({ disableInput: !this.state.disableInput });

  displayContent = (activeTab) => {
    /* eslint-disable indent */
    switch (activeTab) {
      case 'general':
        return this.displayGeneral();
      case 'preprocessing':
        return this.displayPreProcessing();
      case 'exportandimport':
        return this.displayExportAndImport();
      case 'extraction':
        return this.displayExtraction();
      case 'postprocessing':
        return this.displayPostProcessing();
      default:
        return this.displayGeneral();
    }
    /* eslint-enable indent */
  };

  displayGeneral = () => {
    const { docId, downloadConfirmationType } = this.props;
    const { filterContainer } = this.state;
    let generalComponent = [];
    for (let i = 0; i < filterContainer.length; i++) {
      if (filterContainer[i].tab === 'general') {
        if (filterContainer[i].filterType === 'input_text') {
          generalComponent.push(
            <InputBox
              key={filterContainer[i].id}
              mainField={filterContainer[i].mainField || false}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              value={filterContainer[i].value}
              label={filterContainer[i].label}
              defaultPlaceholder={'Type here...'}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
              editable={filterContainer[i].editable}
              saveDocumentLabel={this.saveDocumentLabel}
              isLabelUpdated={this.state.isLabelUpdated}
              disableInput={this.state.disableInput}
              toggleDisableInput={this.toggleDisableInput}
              updateDocLabel={this.updateDocLabel}
              docLabel={this.state.docLabel}
            />
          );
        } else if (filterContainer[i].filterType === 'add_button') {
          generalComponent.push(
            <TeamMember
              key={filterContainer[i].id}
              value={filterContainer[i].value}
              filterId={filterContainer[i].filterId}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              id={filterContainer[i].id}
              mainField={filterContainer[i].mainField || false}
              label={filterContainer[i].label}
              option={filterContainer[i].options}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
            />
          );
        } else if (filterContainer[i].filterType === 'session') {
          generalComponent.push(
            <TextField
              key={filterContainer[i].id}
              id={filterContainer[i].id}
              mainField={true}
              label={filterContainer[i].label}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
            />
          );
        } else if (filterContainer[i].filterType === 'input_number') {
          generalComponent.push(
            <InputBox
              key={filterContainer[i].id}
              mainField={filterContainer[i].mainField || false}
              label={filterContainer[i].label}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              value={filterContainer[i].value}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              type={'number'}
              className={styles.smallInput}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
            />
          );
        } else if (filterContainer[i].filterType === 'button') {
          generalComponent.push(
            <>
              <TextField
                key={uuid()}
                id={filterContainer[i].id}
                mainField={true}
                label={filterContainer[i].label}
                helpText={filterContainer[i].helpText}
                link={filterContainer[i].link}
                className='mt-8 mb-4'
              />
              <DeleteDocType
                key={filterContainer[i].id}
                mainField={filterContainer[i].mainField || false}
                helpText={filterContainer[i].helpText}
                link={filterContainer[i].link}
                id={filterContainer[i].id}
                value={filterContainer[i].value}
                filterId={filterContainer[i].filterId}
                handleChangedValueSubmit={this.handleChangedValueSubmit}
                label={
                  'This will remove all documents along with the settings for this document type.'
                }
                defaultPlaceholder={'Type here...'}
                deletable={filterContainer[i].deletable}
                handleCloseBtnClick={this.handleCloseBtnClick}
                docId={docId}
                docType={downloadConfirmationType}
              />
            </>
          );
        } else if (filterContainer[i].filterType === 'drop_down') {
          generalComponent.push(
            <>
              <DropDown
                className={'mt-8'}
                key={filterContainer[i].id}
                value={filterContainer[i].value}
                filterId={filterContainer[i].filterId}
                handleChangedValueSubmit={this.handleChangedValueSubmit}
                id={filterContainer[i].id}
                mainField={false}
                option={filterContainer[i].options}
                labelText={filterContainer[i].label}
                helpText={filterContainer[i].helpText}
                link={filterContainer[i].link}
              />
            </>
          );
        } else if (filterContainer[i].filterType === 'radio_button') {
          generalComponent.push(
            <InputSwitch
              key={filterContainer[i].id}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              value={filterContainer[i].value}
              labelText={filterContainer[i].label}
              option={filterContainer[i].options}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
              displayType={filterContainer[i].filterId === 2 ? 'primary' : ''}
              className={filterContainer[i].id === 27 ? 'mt-4 mb-4' : 'mb-4'}
            />
          );
        }
      }
    }
    return generalComponent;
  };

  displayPreProcessing = () => {
    const { filterContainer } = this.state;
    let preProcessingComponent = [];

    for (let i = 0; i < filterContainer.length; i++) {
      if (filterContainer[i].tab === 'pre_processing') {
        if (filterContainer[i].filterType === 'radio_button') {
          preProcessingComponent.push(
            <InputSwitch
              key={filterContainer[i].id}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              value={filterContainer[i].value}
              labelText={filterContainer[i].label}
              option={filterContainer[i].options}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
              tags={filterContainer[i].tags}
              className={
                filterContainer[i].id === 17 || filterContainer[i].id === 27
                  ? 'mt-4 mb-4'
                  : 'mb-4'
              }
            />
          );
        } else if (filterContainer[i].filterType === 'drop_down') {
          preProcessingComponent.push(
            <DropDown
              key={filterContainer[i].id}
              value={filterContainer[i].value}
              filterId={filterContainer[i].filterId}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              id={filterContainer[i].id}
              mainField={filterContainer[i].mainField || false}
              labelText={filterContainer[i].label}
              option={filterContainer[i].options}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
            />
          );
        } else if (filterContainer[i].filterType === 'session') {
          preProcessingComponent.push(
            <TextField
              key={filterContainer[i].id}
              id={filterContainer[i].id}
              mainField={true}
              label={filterContainer[i].label}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
              className={filterContainer[i].id === 21 ? 'mt-8 mb-4' : ''}
              labelColorDark
            />
          );
        } else if (
          filterContainer[i].filterType === 'input_number' &&
          filterContainer[i].id !== 23
        ) {
          preProcessingComponent.push(
            <InputBox
              key={filterContainer[i].id}
              mainField={filterContainer[i].mainField || false}
              label={filterContainer[i].label}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              value={filterContainer[i].value}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              type={'number'}
              className={styles.smallInput}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
            />
          );
        } else if (
          filterContainer[i].filterType === 'regex_box' &&
          filterContainer[i].id !== 24 &&
          filterContainer[i].id !== 25 &&
          filterContainer[i].id !== 26
        ) {
          preProcessingComponent.push(
            <>
              <InputBox
                key={filterContainer[i].id}
                mainField={filterContainer[i].mainField || false}
                label={filterContainer[i].label}
                helpText={filterContainer[i].helpText}
                link={filterContainer[i].link}
                id={filterContainer[i].id}
                value={filterContainer[i].value}
                filterId={filterContainer[i].filterId}
                handleChangedValueSubmit={this.handleChangedValueSubmit}
                className={styles.bigInput}
              />
            </>
          );
        } else if (
          filterContainer[i].filterType === 'input_number' &&
          filterContainer[i].id === 23
        ) {
          preProcessingComponent.push(
            <SplitNumber
              key={filterContainer[i].id}
              mainField={filterContainer[i].mainField || false}
              label={filterContainer[i].label}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              value={filterContainer[i].value}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              type={'number'}
              className={styles.smallInput}
              helpText={filterContainer[i].helpText}
              splitValue={filterContainer.find((element) => element.id === 22)}
              link={filterContainer[i].link}
            />
          );
        } else if (
          filterContainer[i].filterType === 'regex_box' &&
          filterContainer[i].id === 24
        ) {
          preProcessingComponent.push(
            <>
              <SplitText
                key={filterContainer[i].id}
                mainField={filterContainer[i].mainField || false}
                label={filterContainer[i].label}
                helpText={filterContainer[i].helpText}
                link={filterContainer[i].link}
                id={filterContainer[i].id}
                value={filterContainer[i].value}
                filterId={filterContainer[i].filterId}
                splitValue={filterContainer.find(
                  (element) => element.id === 22
                )}
                handleChangedValueSubmit={this.handleChangedValueSubmit}
                className={styles.bigInput}
              />
            </>
          );
        } else if (
          filterContainer[i].filterType === 'regex_box' &&
          filterContainer[i].id === 25
        ) {
          preProcessingComponent.push(
            <>
              <TextField
                key={uuid()}
                id={filterContainer[i].id}
                mainField={true}
                label={'Others'}
              />
              <InputBox
                key={filterContainer[i].id}
                mainField={filterContainer[i].mainField || false}
                label={filterContainer[i].label}
                helpText={filterContainer[i].helpText}
                link={filterContainer[i].link}
                id={filterContainer[i].id}
                value={filterContainer[i].value}
                filterId={filterContainer[i].filterId}
                handleChangedValueSubmit={this.handleChangedValueSubmit}
                className={styles.bigInput}
              />
            </>
          );
        } else if (
          filterContainer[i].filterType === 'regex_box' &&
          filterContainer[i].id === 26
        ) {
          const autoSplitType =
            filterContainer.find((elem) => elem.id === 22) || {};

          if (autoSplitType && autoSplitType.value === 126) {
            preProcessingComponent.push(
              <>
                <InputBox
                  key={filterContainer[i].id}
                  mainField={filterContainer[i].mainField || false}
                  label={filterContainer[i].label}
                  helpText={filterContainer[i].helpText}
                  link={filterContainer[i].link}
                  id={filterContainer[i].id}
                  value={filterContainer[i].value}
                  filterId={filterContainer[i].filterId}
                  handleChangedValueSubmit={this.handleChangedValueSubmit}
                  className={styles.bigInput}
                />
              </>
            );
          }
        }
      }
    }
    return preProcessingComponent;
  };

  displayExportAndImport = () => {
    const { filterContainer } = this.state;
    const { downloadConfirmationType, docId } = this.props;
    let exportAndImportComponent = [];
    let document = this.props.docConfig.documentTypes.find(
      (item) => item.value === downloadConfirmationType
    );
    for (let i = 0; i < filterContainer.length; i++) {
      if (filterContainer[i].tab === 'export_or_upload') {
        if (filterContainer[i].filterType === 'text_and_button') {
          exportAndImportComponent.push(
            <FormInput
              key={filterContainer[i].id}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              value={filterContainer[i].value}
              label={filterContainer[i].label}
              defaultPlaceholder={'Test@docsumo.com'}
              editable={filterContainer[i].editable}
            />
          );
        } else if (filterContainer[i].filterType === 'dual_button') {
          exportAndImportComponent.push(
            <FormDownload
              key={filterContainer[i].id}
              value={filterContainer[i].value}
              filterId={filterContainer[i].filterId}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              id={filterContainer[i].id}
              mainField={filterContainer[i].mainField || false}
              label={filterContainer[i].label}
              docType={downloadConfirmationType}
              helpText={filterContainer[i].helpText}
            />
          );
        } else if (filterContainer[i].filterType === 'session') {
          exportAndImportComponent.push(
            <TextField
              key={filterContainer[i].id}
              id={filterContainer[i].id}
              mainField={true}
              label={filterContainer[i].label}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
            />
          );
        } else if (filterContainer[i].filterType === 'button') {
          exportAndImportComponent.push(
            <>
              <TextField
                key={uuid()}
                id={filterContainer[i].id}
                mainField={true}
                label={filterContainer[i].label}
                helpText={filterContainer[i].helpText}
                link={filterContainer[i].link}
                className={'mb-2'}
              />
              <DeleteDocType
                key={filterContainer[i].id}
                mainField={filterContainer[i].mainField || false}
                helpText={filterContainer[i].helpText}
                link={filterContainer[i].link}
                id={filterContainer[i].id}
                value={filterContainer[i].value}
                filterId={filterContainer[i].filterId}
                handleChangedValueSubmit={this.handleChangedValueSubmit}
                label={
                  'This will reset all documents along with the settings for this document type.'
                }
                defaultPlaceholder={'Type here...'}
                deletable={true}
                document={document}
                handleCloseBtnClick={this.handleCloseBtnClick}
                docId={docId}
                docType={downloadConfirmationType}
              />
            </>
          );
        }
      }
    }
    return exportAndImportComponent;
  };

  displayExtraction = () => {
    const { filterContainer, isLoadingTrain, option, ddListObject } =
      this.state;

    let extractionComponent = [];
    const { downloadConfirmationType, modelActions, csvActions } = this.props;

    for (let i = 0; i < filterContainer.length; i++) {
      if (filterContainer[i].tab === 'extraction') {
        if (filterContainer[i].filterType === 'radio_button') {
          extractionComponent.push(
            <InputSwitchExtraction
              key={filterContainer[i].id}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              value={filterContainer[i].value}
              labelText={filterContainer[i].label}
              option={filterContainer[i].options}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
              tags={filterContainer[i].tags}
            />
          );
        } else if (filterContainer[i].filterType === 'extended_radio_button') {
          extractionComponent.push(
            <NewTrainModelExtraction
              key={filterContainer[i].id}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              value={filterContainer[i].value}
              labelText={filterContainer[i].label}
              option={filterContainer[i].options}
              dropDownOption={ddListObject[filterContainer[i].id]}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
              modelActions={modelActions}
              csvActions={csvActions}
            />
          );
        } else if (filterContainer[i].filterType === 'session') {
          extractionComponent.push(
            <TextField
              key={filterContainer[i].id}
              id={filterContainer[i].id}
              mainField={true}
              label={filterContainer[i].label}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
              className={
                filterContainer[i].id === 89 &&
                filterContainer[i].label !== 'COA Categorization'
                  ? 'mt-8 mb-4'
                  : ''
              }
            />
          );
        }
        if (filterContainer[i].filterType === 'dynamic_button') {
          extractionComponent.push(
            <NewTrainModel
              key={filterContainer[i].id}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              label={filterContainer[i].label}
              option={filterContainer[i].options}
              value={filterContainer[i].value}
              message={filterContainer[i].message}
              trainable={filterContainer[i].trainable}
              docType={downloadConfirmationType}
              startTrain={this.startTrain}
              isLoadingTrain={isLoadingTrain}
            />
          );
        } else if (filterContainer[i].filterType === 'ml_option') {
          extractionComponent.push(
            <VersionSelect
              key={filterContainer[i].id}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              label={filterContainer[i].label}
              option={option}
              value={filterContainer[i].value}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              docType={downloadConfirmationType}
            />
          );
        }
      }
    }
    return extractionComponent;
  };

  handleResetCustomCode = async (id) => {
    const {
      downloadConfirmationType,
      docConfig = {},
      documentActions,
      appActions,
      user,
    } = this.props;

    let document =
      docConfig.documentTypes.find(
        (item) => item.value === downloadConfirmationType
      ) || {};

    this.setState({ isResetting: true });

    try {
      const response = await api.resetCustomCode({
        id,
        docType: downloadConfirmationType,
      });
      const status = _.get(response.responsePayload, 'status');
      if (status === 'success') {
        await documentActions.settingDocTypeConfirmation({
          docType: downloadConfirmationType,
          title: document.title,
          showOverlayLoader: false,
        });
        appActions.setToast({
          title: 'Custom code set to default successfully.',
          success: true,
        });

        const { canSwitchToOldMode = true } = docConfig;
        mixpanel.track(MIXPANEL_EVENTS.doc_setting_update, {
          label: 'Reset Custom JS Code',
          docType: downloadConfirmationType,
          'work email': user.email,
          'organization ID': user.orgId,
          version: 'new',
          mode: user.mode,
          canSwitchUIVersion: canSwitchToOldMode,
        });
      }
    } catch (e) {
      appActions.setToast({
        title:
          e.message ||
          'An error occurred while resetting to default. Please try again later.',
        error: true,
      });
    } finally {
      this.setState({ isResetting: false });
    }
  };

  displayPostProcessing = () => {
    const {
      filterContainer,
      isLoading,
      isSuccess,
      isError,
      codeValue,
      isResetting,
      errorMsg,
    } = this.state;
    let postProcessingComponent = [];
    const largeTextBoxes = filterContainer.filter(
      (item) => item.filterType === 'large_text_box'
    );
    const expandAreaVertically = largeTextBoxes.length === 1;

    for (let i = 0; i < filterContainer.length; i++) {
      if (filterContainer[i].tab === 'post_processing') {
        if (filterContainer[i].filterType === 'large_text_box') {
          if (filterContainer[i].canReset) {
            postProcessingComponent.push(
              <>
                <TextField
                  key={uuid()}
                  id={filterContainer[i].id}
                  filterId={filterContainer[i].filterId}
                  label={filterContainer[i].label}
                  mainField={true}
                  helpText={filterContainer[i].helpText}
                  showResetBtn={true}
                  isResetting={isResetting}
                  handleReset={() =>
                    this.handleResetCustomCode(filterContainer[i].id)
                  }
                />
                <CustomDownloadArea
                  key={filterContainer[i].id}
                  defaultPlaceholder={'a\nb\nc'}
                  id={filterContainer[i].id}
                  value={codeValue || filterContainer[i].value}
                  filterId={filterContainer[i].filterId}
                  label={filterContainer[i].label}
                  handleChangedValueSubmit={this.handleChangedValueSubmit}
                  isLoading={isLoading}
                  isSuccess={isSuccess}
                  isError={isError}
                  handleValidate={this.handleValidate}
                  className={styles.codeInputArea}
                  btnGroupClassName={styles.btnGroup}
                  validate={false}
                  expandAreaVertically={expandAreaVertically}
                />
              </>
            );
          } else {
            postProcessingComponent.push(
              <>
                <TextField
                  key={uuid()}
                  id={filterContainer[i].id}
                  filterId={filterContainer[i].filterId}
                  label={filterContainer[i].label}
                  mainField={true}
                  helpText={filterContainer[i].helpText}
                />
                <CustomDownloadArea
                  key={filterContainer[i].id}
                  defaultPlaceholder={'a\nb\nc'}
                  id={filterContainer[i].id}
                  value={codeValue || filterContainer[i].value}
                  filterId={filterContainer[i].filterId}
                  label={filterContainer[i].label}
                  handleChangedValueSubmit={this.handleChangedValueSubmit}
                  isLoading={isLoading}
                  isSuccess={isSuccess}
                  isError={isError}
                  handleValidate={this.handleValidate}
                  showRestoreBtn={true}
                  errorMsg={errorMsg}
                  expandAreaVertically={expandAreaVertically}
                />
              </>
            );
          }
        }
      }
    }
    return postProcessingComponent;
  };

  handleCloseBtnClick = () => {
    const {
      documentActions,
      downloadConfirmationType,
      downloadDocConfirmation,
    } = this.props;
    const doc = downloadConfirmationType || downloadDocConfirmation;
    if (!doc) return;
    documentActions.downloadDocTypeHideConfirmation({
      docType: doc,
    });
    documentActions.allDocumentsTypeFetch();
  };
  render() {
    const { activeTab } = this.state;
    return (
      <Fragment>
        <Modal
          onCloseHandler={this.handleCloseBtnClick}
          show={this.state.isDocModal}
          animation='fade'
          size='lg'
        >
          <div className={styles.docSetting}>
            <ModalHeader
              title='Settings'
              showInfoIcon={true}
              handleCloseBtnClick={this.handleCloseBtnClick}
              href={SUPPORT_LINK.DOC_SETTINGS}
              label='Read about document settings'
            />
            <div className={styles.docSettingRoot}>
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
          </div>
        </Modal>
      </Fragment>
    );
  }
}
const Container = (props) => {
  const { downloadConfirmationType } = props;
  const open = downloadConfirmationType;
  if (!open) {
    return null;
  }
  return <DocSettingModal {...props} />;
};
function mapStateToProp({ documents, app }) {
  const {
    downloadConfirmationType,
    config,
    downloadDocConfirmation,
    docSettingData,
    docId,
  } = documents;

  const { config: docConfig, user } = app;
  return {
    downloadConfirmationType,
    downloadDocConfirmation,
    config,
    docConfig,
    docSettingData,
    docId,
    user,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
    documentActions: bindActionCreators(documentActions, dispatch),
    modelActions: bindActionCreators(modelActions, dispatch),
    csvActions: bindActionCreators(csvActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(Container);
