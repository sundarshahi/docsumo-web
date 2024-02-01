import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from '@redux/app/actions';
import { actions as documentActions } from '@redux/documents/actions';
import { showToast } from 'client/redux/helpers';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import * as api from 'client/api';
import { MIXPANEL_EVENTS } from 'client/thirdParty/mixpanel';
import { validateURL } from 'client/utils/validation';
import { ReactComponent as CheckIcon } from 'images/icons/check.svg';
import { ReactComponent as CloseIcon } from 'images/icons/clear.svg';
import { ReactComponent as InfoIcon } from 'images/icons/info.svg';
import _, { get } from 'lodash';
import mixpanel from 'mixpanel-browser';
import Modal from 'react-responsive-modal';
import * as uuid from 'uuid/v4';

import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'components/widgets/buttons';

import CustomDownloadArea from './CustomDownloadArea';
import DeleteDocType from './DelectDocType';
import DropDown from './DropDown';
import FormDownload from './FormDownload';
import FormInput from './FormInput';
import InputBox from './InputBox';
import InputSwitch from './InputSwitch';
import NewTrainModel from './NewTrainModel';
import PercentageBox from './PercentageBox';
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
    documentLabelName: '',
    isSaving: false,
  };

  updateDocumentLabelName = (name) =>
    this.setState({ documentLabelName: name });

  async componentDidMount() {
    const { downloadConfirmationType } = this.props;
    this.setActiveTab(TABS[0].uid);

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
      docType: document.value,
      value,
      title: document.title,
      checkErrorAlert: checkError,
    });

    const { canSwitchToOldMode = true } = docConfig;

    mixpanel.track(MIXPANEL_EVENTS.doc_setting_update, {
      label,
      docType: document.value,
      'work email': user.email,
      'organization ID': user.orgId,
      version: 'old',
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
        'An error occured while validating the code. Please try again later.'
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
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              value={filterContainer[i].value}
              label={filterContainer[i].label}
              defaultPlaceholder={'Type here...'}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
              editable={filterContainer[i].editable}
              updateDocumentLabelName={this.updateDocumentLabelName}
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
              <TextField
                key={uuid()}
                id={filterContainer[i].id}
                mainField={true}
                label={filterContainer[i].label}
              />

              <DropDown
                className={styles.stpDropdown}
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
    const { downloadConfirmationType } = this.props;

    for (let i = 0; i < filterContainer.length; i++) {
      if (filterContainer[i].tab === 'extraction') {
        if (filterContainer[i].filterType === 'radio_button') {
          extractionComponent.push(
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
            />
          );
        } else if (filterContainer[i].filterType === 'input_percent') {
          extractionComponent.push(
            <PercentageBox
              key={filterContainer[i].id}
              id={filterContainer[i].id}
              filterId={filterContainer[i].filterId}
              handleChangedValueSubmit={this.handleChangedValueSubmit}
              value={filterContainer[i].value}
              label={filterContainer[i].label}
              option={filterContainer[i].options}
              helpText={filterContainer[i].helpText}
              link={filterContainer[i].link}
              type={'number'}
              defaultPlaceholder={'%'}
              className={styles.percentMatch}
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
            />
          );
        } else if (filterContainer[i].filterType === 'extended_radio_button') {
          extractionComponent.push(
            <NewTrainModel
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
          version: 'old',
          mode: user.mode,
          canSwitchUIVersion: canSwitchToOldMode,
        });
      }
    } catch (e) {
      appActions.setToast({
        title:
          e.message ||
          'An error occured while resetting to default. Please try again later.',
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
                  fieldClassName={styles.customCodeHeader}
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
  };

  saveTitleAndClose = async () => {
    const {
      docId,
      downloadConfirmationType,
      config: { documentTypes = [] },
    } = this.props;
    const { documentLabelName } = this.state;
    this.setState({ isSaving: true });
    try {
      const response = await api.updateDocumentTypeTitle({
        payload: {
          title: this.state.documentLabelName,
          docId,
          doc_type: downloadConfirmationType,
        },
      });
      const document = _.get(response.responsePayload, 'data.document');
      this.props.documentActions.updateDocumentType({
        document,
      });
      // Update the state of global document types
      let docTypes = [...documentTypes];
      const docIdIndex = docTypes.findIndex((item) => item.id === docId);
      if (docIdIndex > -1 && docTypes[docIdIndex]?.title) {
        docTypes[docIdIndex].title = documentLabelName;
      }
      await this.props.appActions.updateConfig({
        updates: {
          docTypes,
        },
      });
    } catch (e) {
      showToast({ title: 'Failed to update title', error: true });
    }
    this.setState({ isSaving: false });
    this.handleCloseBtnClick();
  };

  render() {
    const { activeTab } = this.state;
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
              <div className={styles.leftHeader}>Settings</div>
              <div className={styles.navigation}>
                {TABS.map(({ title, uid }, i) => (
                  // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                  <div
                    key={`${uid}-${i}`}
                    role='button'
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
            <div className={styles.rightBox}>
              <div className={styles.rightHeader}>
                <a
                  className={styles.infoIconBox}
                  target='_blank'
                  rel='noopener noreferrer'
                  href='https://support.docsumo.com/docs/document-settings'
                >
                  <InfoIcon className={styles.infoIcon} />
                  <div className={styles.tooltip}>
                    Read more about document settings
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
              <div className={styles.buttonContainer}>
                <Button
                  text='Cancel'
                  iconLeft={CloseIcon}
                  appearance={BUTTON_APPEARANCES.PRIMARY_REVERSED}
                  className={cx(styles.btn, styles.btnCancel)}
                  onClick={() => this.handleCloseBtnClick()}
                />
                <Button
                  text='Save'
                  iconLeft={CheckIcon}
                  appearance={BUTTON_APPEARANCES.PRIMARY}
                  className={styles.btn}
                  disabled={this.state.isSaving}
                  onClick={() => this.saveTitleAndClose()}
                />
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
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(Container);
