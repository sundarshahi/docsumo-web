/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as modelActions } from 'new/redux/model/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { format } from 'date-fns';
import download from 'downloadjs';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { SUPPORT_LINK } from 'new/constants/urllink';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button from 'new/ui-elements/Button/Button';
import Modal from 'new/ui-elements/Modal/Modal';

import ConfirmModal from '../../pages/ModelTraining/components/ConfirmModal/ConfirmModal';
import ModalHeader from '../ModalHeader';

import CommonInput from './CommonInput';
import DropdownDocType from './DropdownDocType';
import InputBox from './InputBox';
import SelectDataset from './SelectDataset';
import SelectModel from './SelectModel';

import styles from './index.scss';

class TrainModelModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      docTypeOption: null,
      confirmModal: false,
      isUploading: false,
      visiblity: true,
      showModal: false,
      datasetOption: [
        { id: 1, title: 'All Approved Files', value: 'all' },
        { id: 2, title: 'New Approved Files', value: 'new' },
      ],
      dateRange: [
        {
          startDate: new Date(),
          endDate: new Date(),
          //endDate: new Date(currentDate.setDate(currentDate.getDate() + 7)),
        },
      ],
      created_date: [],
      isTraining: false,
      sampleDataset: 'all',
      selectedDoctype: [],
      processedCount: 0,
      totalEpoch: null,
      additionalParameters: '',
      documentConfig: {
        '01': [
          'invoice',
          'passport_front',
          'aadhaar_front',
          'passport_back',
          'ndr',
          'bank_statement',
          'aadhaar_back',
          'acord25',
          'pan',
          'dl',
          'rc',
          'w9 forms',
          'us_bank_statement',
          'voterid',
          'acord28',
          'acord27',
          'bill_of_lading',
          'flood_certification',
          'w2_forms',
          '940_forms',
          '1120s_forms',
          'acord125',
        ],
        '03': [
          'table_vision',
          'bank_statement',
          'ndr',
          'us_bank_statement',
          'invoice',
          'bill_of_lading',
        ],
        '04': [
          'invoice',
          'passport_front',
          'aadhaar_front',
          'passport_back',
          'ndr',
          'bank_statement',
          'aadhaar_back',
          'acord25',
          'pan',
          'dl',
          'rc',
          'w9 forms',
          'us_bank_statement',
          'voterid',
          'acord28',
          'acord27',
          'bill_of_lading',
          'flood_certification',
          'w2_forms',
          '940_forms',
          '1120s_forms',
          'acord125',
        ],
        '05': [
          'rent_roll',
          'rent_roll_rental',
          'rent_roll_mhrv',
          'p_and_l',
          'balance_sheet',
        ],
      },
      totalModelOption: [],
      validDocList: [],
      modelName: '',
    };
    this.inputRef = React.createRef();
  }

  async UNSAFE_componentWillMount() {
    const {
      docConfig: { documentTypes },
      modelTypeData,
      documentModelConfig,
    } = this.props;
    const documentType = documentTypes.filter(
      (item) =>
        item.canUpload === true &&
        (item.value !== 'auto_classify' || item.value !== 'auto_classify__test')
    );
    let availableDoc = documentType.map((item) => item.value);
    let replicaDocumentModelConfig = _.cloneDeep(documentModelConfig);
    for (let i = 0; i < availableDoc.length; i++) {
      for (const model in replicaDocumentModelConfig) {
        if (
          documentModelConfig[model].includes(availableDoc[i].split('__')[0])
        ) {
          replicaDocumentModelConfig[model].push(availableDoc[i]);
          replicaDocumentModelConfig[model] = [
            ...new Set(replicaDocumentModelConfig[model]),
          ];
        }
      }
    }
    this.setState({
      documentConfig: documentModelConfig,
      docTypeOption: documentType,
      totalModelOption: modelTypeData,
      replicaDocumentModelConfig,
    });
  }

  componentDidMount() {
    this.setState({
      showModal: true,
    });
  }

  fetchDocuments = () => {
    this.props.modelActions.modelFetch({
      queryParams: {
        q: '',
        offset: '',
        sort_by: '',
      },
    });
  };

  handleSelectFile = () => {
    this.inputRef.current.click();
  };
  handleInputChange = (e) => {
    let selectedFile = Array.from(e.target.files);
    this.setState({
      files: selectedFile,
    });
  };
  handleCloseBtnClick = () => {
    const { selectedDoctype, selectedModeltype } = this.state;
    const { modelActions, user, docConfig } = this.props;
    const { canSwitchToOldMode = true } = docConfig;
    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.cancel_model, {
      'work email': user.email,
      'input changed': selectedDoctype || selectedModeltype ? 'Yes' : 'No',
      version: 'new',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
    });

    modelActions.hideTrainModelModal();
    this.setState({
      files: [],
    });
  };
  handleRemoveFile = () => {
    this.setState({
      files: [],
    });
  };
  handleTrainer = async () => {
    const { appActions, user, docConfig } = this.props;
    const { canSwitchToOldMode = true } = docConfig;
    this.setState({
      isTraining: true,
    });
    const {
      selectedDoctype,
      selectedModeltype,
      processedCount,
      totalEpoch,
      sampleValue,
      additionalParameters,
      modelName,
    } = this.state;
    let payload = {
      doc_type: selectedDoctype.map((item) => item.value),
      limit: processedCount,
      model_type: selectedModeltype,
      total_epochs: parseInt(totalEpoch),
      additional_parameters: additionalParameters,
      model_name: modelName,
    };

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.train_model, {
      'work email': user.email,
      'document type': selectedDoctype.map((item) => item.value),
      'select model': selectedModeltype,
      'sampling percentage': sampleValue,
      'no. of documents': processedCount,
      'model name': modelName,
      version: 'new',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
    });

    try {
      await api.trainCurrentModel({
        payload,
      });
      this.fetchDocuments();

      this.setState({
        visiblity: false,
        confirmModal: true,
      });
    } catch (e) {
      const { error = '', message = '' } = e.responsePayload;
      appActions.setToast({
        title: `${error} ${message}`,
        error: true,
      });
    } finally {
      this.setState({
        isTraining: false,
      });
    }
  };

  renderHeader = () => {
    return (
      <ModalHeader
        title='New Model'
        showInfoIcon={true}
        handleCloseBtnClick={this.handleCloseBtnClick}
        href={SUPPORT_LINK.MODEL_AND_TRAINING_2}
        label='Read about models and training'
      />
    );
  };

  handleCustomDownload = async () => {
    const { appActions } = this.props;
    appActions.setToast({
      title: 'Downloading...',
      duration: 3000,
    });
    let result = {
      type: 'sample',
    };
    try {
      const { responsePayload } = await api.downloadCsv({
        ...result,
      });
      this.handleCloseBtnClick();
      const downloadUrl = _.get(responsePayload, 'data');
      download(downloadUrl);
    } catch (e) {
      // Do nothing
    }
  };
  handleDateRangeChange = (dateRange) => {
    // let [ { startDate, endDate } ] = dateRange;
    // startDate = format(startDate, '\'gte:\'yyyy-MM-dd');
    // endDate = format(endDate, '\'lte:\'yyyy-MM-dd');
    this.setState({ dateRange });
  };
  setCount = async () => {
    const { selectedDoctype, created_date, sampleValue } = this.state;
    if (selectedDoctype.length) {
      let queryParams = {
        doc_type: selectedDoctype.map((item) => item.value),
        created_date,
      };
      try {
        const response = await api.getDocumentCounts({
          queryParams,
        });
        const { processed } = response.responsePayload.data.counts;
        this.setState({
          processedCount: sampleValue
            ? Math.round((processed * sampleValue) / 100)
            : processed,
        });
      } catch (e) {
        this.setState({
          processedCount: 0,
        });
      }
    } else {
      this.setState({
        processedCount: 0,
      });
    }
  };
  changeDocType = (docType) => {
    const { documentConfig, replicaDocumentModelConfig } = this.state;
    const { modelTypeData } = this.props;
    this.setState(
      {
        selectedDoctype: docType,
      },
      () => {
        if (!docType.length) {
          this.setState({
            totalModelOption: modelTypeData,
            validDocList: [],
            selectedModeltype: '',
          });
        } else {
          let supportedModel = [];
          let remainingDoc = [];
          let selectedDoc = docType.map((item) => item.value);
          for (const model in documentConfig) {
            if (
              selectedDoc.every((item) =>
                documentConfig[model].includes(item.split('__')[0])
              )
            ) {
              remainingDoc.push(...replicaDocumentModelConfig[model]);
              supportedModel.push(model);
            }
          }
          remainingDoc = [...new Set(remainingDoc)];
          let mappedModel = supportedModel.map((it) => {
            let model = modelTypeData.find((model) => model.value === it);
            return model;
          });
          mappedModel = mappedModel.filter((item) => item !== undefined);
          this.setState({
            validDocList: remainingDoc,
            totalModelOption: mappedModel,
          });
        }
        this.setCount();
      }
    );
  };
  changeSampleDataset = (dataset) => {
    this.setState({
      sampleDataset: dataset,
    });
  };
  changeModelType = (modelType) => {
    this.setState({
      selectedModeltype: modelType,
    });
  };
  changeSamplingValue = (value) => {
    this.setState(
      {
        sampleValue: value,
      },
      () => {
        this.setCount();
      }
    );
  };

  changeInputFieldHandler = (name, value) => {
    this.setState({
      [name]: value,
    });
  };

  handleDateChange = (e) => {
    var date = new Date();
    // add a day
    date.setDate(date.getDate() + 1);
    // eslint-disable-next-line quotes
    let startDate = format(e.target.value, "'gte:'yyyy-MM-dd");
    // eslint-disable-next-line quotes
    let endDate = format(date, "'lte:'yyyy-MM-dd");
    this.setState(
      {
        dateValue: e.target.value,
        created_date: [startDate, endDate],
      },
      () => {
        this.setCount();
      }
    );
  };

  componentDidUpdate(prevProps) {
    const {
      docConfig: { documentTypes },
      modelTypeData,
      documentModelConfig,
    } = this.props;
    const documentType = documentTypes.filter(
      (item) =>
        item.canUpload === true &&
        (item.value !== 'auto_classify' || item.value !== 'auto_classify__test')
    );
    let availableDoc = documentType.map((item) => item.value);
    if (prevProps.documentModelConfig !== documentModelConfig) {
      let replicaDocumentModelConfig = _.cloneDeep(documentModelConfig);
      for (let i = 0; i < availableDoc.length; i++) {
        for (const model in replicaDocumentModelConfig) {
          if (
            documentModelConfig[model].includes(availableDoc[i].split('__')[0])
          ) {
            replicaDocumentModelConfig[model].push(availableDoc[i]);
            replicaDocumentModelConfig[model] = [
              ...new Set(replicaDocumentModelConfig[model]),
            ];
          }
        }
      }
      this.setState({
        documentConfig: documentModelConfig,
        replicaDocumentModelConfig,
      });
      if (prevProps.modelTypeData !== modelTypeData) {
        this.setState({
          totalModelOption: modelTypeData,
        });
      }
    }
  }

  toogleConfirmModal = () => {
    const { modelActions } = this.props;
    modelActions.hideTrainModelModal();
    this.setState({
      confirmModal: !this.state.confirmModal,
      visiblity: true,
    });
  };

  render() {
    const {
      selectedDoctype,
      selectedModeltype,
      sampleDataset,
      dateValue,
      docTypeOption,
      datasetOption,
      processedCount,
      isTraining,
      validDocList,
      totalModelOption,
    } = this.state;

    const isSampleDataset = sampleDataset === '' || sampleDataset === 'all';

    const filteredTotalModelOption =
      totalModelOption?.filter((item) => item.trainable) ?? [];

    return (
      <>
        <ConfirmModal
          toogleConfirmModal={this.toogleConfirmModal}
          show={this.state.confirmModal}
        />
        <Modal
          show={this.state.showModal}
          baseClass={cx({ [styles.visiblity]: !this.state.visiblity })}
          size='md'
        >
          <div className={styles.newModel}>
            {this.renderHeader()}
            <div className={cx(styles.newModel__body, 'p-6')}>
              <div className={styles.newModel__infoBanner}>
                <p>
                  You need at least 20 approved samples of the document type you
                  want to train your new model on.
                </p>
              </div>
              <div className={styles.newModel__content}>
                <DropdownDocType
                  label={'Train From'}
                  className={styles.dropdown}
                  option={docTypeOption}
                  changeDocType={this.changeDocType}
                  validDocList={validDocList}
                  helpText={
                    'Please select documents based on which the model would be trained'
                  }
                />
                <SelectModel
                  label={'Select Model'}
                  className={styles.dropdown}
                  option={filteredTotalModelOption.sort((a, b) => a.id - b.id)}
                  selectedDoctype={selectedDoctype}
                  changeModelType={this.changeModelType}
                  helpText={'Please select at least one model type'}
                />
                <CommonInput
                  changeInputFieldHandler={this.changeInputFieldHandler}
                  label={'Additional Parameters'}
                  helpText={'Additional parameters for training a model'}
                  defaultPlaceholder={'Additional parameters'}
                  name={'additionalParameters'}
                />
                <div className={styles.dataset__label}>
                  <p>Training Dataset</p>
                </div>
                <SelectDataset
                  label={'Sample Dataset'}
                  className={styles.dropdown}
                  option={datasetOption}
                  changeSampleDataset={this.changeSampleDataset}
                  helpText={
                    'Select the dataset which you want to use for training'
                  }
                />
                <div className={cx(styles.newModel__date, 'mt-4')}>
                  <div className={styles['newModel__date--text']}>
                    <p className={styles['newModel__date--title']}>
                      Document Approved After
                    </p>
                    <p className={cx(styles['newModel__date--helper'], 'mt-2')}>
                      Select the date from where you want to select sample
                      files.
                    </p>
                  </div>
                  <div
                    className={cx(styles.dateSelector, {
                      [styles.dateSelectorDisabled]: isSampleDataset,
                    })}
                  >
                    <input
                      type='date'
                      className={cx(styles['newModel__date--input'], {
                        [styles['newModel__date--nonDisabled']]:
                          !isSampleDataset,
                      })}
                      placeholder='MM/DD/YYYY'
                      onChange={this.handleDateChange}
                      value={dateValue}
                      disabled={isSampleDataset}
                    />
                  </div>
                </div>
                <InputBox
                  mainField={true}
                  name='samplingPercentage'
                  label={'Sampling Percentage(%)'}
                  changeSamplingValue={this.changeSamplingValue}
                  defaultPlaceholder={'%'}
                  type={'number'}
                  helpText={
                    'Set percentage to define the sample size (by default it is set to 100)'
                  }
                />
                <InputBox
                  disabled
                  mainField={true}
                  value={processedCount}
                  name='processedCount'
                  type={'number'}
                  changeSamplingValue={this.changeSamplingValue}
                  label={'Sample documents for training'}
                  helpText={
                    'The number of approved documents used in training based on your sampling percentage'
                  }
                />
              </div>
            </div>
            <div className={styles.newModel__footer}>
              <Button
                size='medium'
                variant='outlined'
                className={cx(styles.btn, styles.btnCancel)}
                onClick={() => this.handleCloseBtnClick()}
              >
                Cancel
              </Button>
              <Button
                size='medium'
                variant='contained'
                isLoading={isTraining}
                className={cx(styles.btn, 'ml-4')}
                disabled={
                  !selectedDoctype.length ||
                  !selectedModeltype ||
                  !(processedCount > 19) ||
                  isTraining
                }
                onClick={() => this.handleTrainer()}
              >
                Train
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}

const Container = (props) => {
  const { trainModel } = props;
  if (!trainModel) {
    return null;
  }

  return <TrainModelModal {...props} />;
};

function mapStateToProp(state) {
  const { trainModel } = state.model;
  const { modelTypeData, documentModelConfig } = state.model.modelPage;
  const { globalDocumentCounts } = state.documents;
  const { user, config: docConfig } = state.app;

  return {
    trainModel,
    docConfig,
    globalDocumentCounts,
    user,
    modelTypeData,
    documentModelConfig,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    modelActions: bindActionCreators(modelActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(Container)
);
