/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { actions as appActions } from '@redux/app/actions';
import { actions as modelActions } from '@redux/model/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import * as api from 'client/api';
import { MIXPANEL_EVENTS } from 'client/thirdParty/mixpanel';
//import Popover from 'client/components/widgets/popover';
//import Popover from 'react-tiny-popover';
//import {HalfDatePicker} from 'components/widgets/DateRangePicker';
//import moment from 'moment';
import { format } from 'date-fns';
import download from 'downloadjs';
import { ReactComponent as ClearIcon } from 'images/icons/clear.svg';
import { ReactComponent as CloseIcon } from 'images/icons/clear.svg';
import { ReactComponent as InfoIcon } from 'images/icons/info.svg';
import { ReactComponent as ModelIcon } from 'images/icons/model.svg';
//import {ReactComponent as DeleteIcon} from 'images/icons/deletedoc.svg';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';

import Modal, { ModalContent, ModalFooter } from 'components/shared/Modal';
import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'components/widgets/buttons';

//import { ReactComponent as DateIcon } from 'images/icons/date-picker.svg';
import DropdownDocType from './DropdownDocType';
import InputBox from './InputBox';
import InputEpochBox from './InputEpochBox';
import SelectDataset from './SelectDataset';
import SelectModel from './SelectModel';

import styles from './index.scss';

class TrainModelModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      docTypeOption: null,
      isUploading: false,
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
        (item.value !== 'auto_classify' || item.value === 'auto_classify__test')
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
      version: 'old',
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
    this.setState({
      isTraining: true,
    });
    const { canSwitchToOldMode = true } = docConfig;

    const {
      selectedDoctype,
      selectedModeltype,
      processedCount,
      totalEpoch,
      sampleValue,
    } = this.state;
    let payload = {
      doc_type: selectedDoctype.map((item) => item.value),
      limit: processedCount,
      model_type: selectedModeltype,
      total_epochs: parseInt(totalEpoch),
    };

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.train_model, {
      'work email': user.email,
      'document type': selectedDoctype.map((item) => item.value),
      'select model': selectedModeltype,
      'sampling percentage': sampleValue,
      'no. of documents': processedCount,
      version: 'old',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
    });

    try {
      await api.trainCurrentModel({
        payload,
      });
      this.fetchDocuments();
    } catch (e) {
      const { error = '', message = '' } = e.responsePayload;
      appActions.setToast({
        title: `${error} ${message}`,
        error: true,
      });
    } finally {
      this.setState({
        isTraining: true,
      });
      this.handleCloseBtnClick();
    }
  };

  renderHeader = () => {
    return (
      <div className={cx(styles.header)}>
        <>
          <h2 className={cx(styles.title)}>New Model</h2>
        </>

        <a
          className={styles.infoIconBox}
          target='_blank'
          rel='noopener noreferrer'
          href='https://support.docsumo.com/docs/model-and-training-2'
        >
          <InfoIcon className={styles.infoIcon} />
          <div className={styles.tooltip}>
            Read about training modal
            <div className={styles.arrow} />
          </div>
        </a>
        <button
          className={cx(
            'unstyled-btn',
            styles.closeBtn,
            styles.closeBtnClassName
          )}
          onClick={this.handleCloseBtnClick}
        >
          <ClearIcon />
        </button>
      </div>
    );
  };

  handleCustomDownload = async () => {
    const { appActions } = this.props;
    appActions.setToast({
      title: 'Downloading...',
      timeout: 3,
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

  changeEpochValue = (value) => {
    this.setState({
      totalEpoch: value,
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
        (item.value !== 'auto_classify' || item.value === 'auto_classify__test')
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
    return (
      <Modal
        className={styles.root}
        onExit={this.handleCloseBtnClick}
        rootProps={{
          titleText: 'Import Table',
        }}
      >
        {this.renderHeader()}
        <div className={styles.alertHeader}>
          <p>
            Please note it can take from 30 min - 4 hours to train a model
            depending on the sample size.
          </p>
        </div>
        <ModalContent className={styles.modalContent}>
          <DropdownDocType
            label={'Select Document Type'}
            className={styles.dropdown}
            option={docTypeOption}
            changeDocType={this.changeDocType}
            validDocList={validDocList}
          />
          <p className={styles.prompt}>
            {' '}
            Please select at least one document type.{' '}
          </p>
          <SelectModel
            label={'Select Model'}
            className={styles.dropdown}
            option={totalModelOption}
            selectedDoctype={selectedDoctype}
            changeModelType={this.changeModelType}
            helpText={'Select the model on which training needs to be done'}
          />
          <p className={styles.prompt}>
            {' '}
            Please select at least one model type.{' '}
          </p>

          <div className={styles.datasetLabel}>
            <p>Training Dataset</p>
          </div>
          <SelectDataset
            label={'Sample Dataset'}
            className={styles.dropdown}
            option={datasetOption}
            changeSampleDataset={this.changeSampleDataset}
          />
          <div className={cx(styles.dateContainer)}>
            <div className={styles.dateIntro}>
              <p className={styles.dateLabel}>Document Approved After</p>
              <p className={styles.dateHelpText}>
                Select the date from where you want to select sample files
              </p>
            </div>
            <div
              className={cx(styles.dateSelector, {
                [styles.dateSelectorDisabled]:
                  sampleDataset === '' || sampleDataset === 'all',
              })}
            >
              <input
                type='date'
                className={styles.date}
                placeholder='MM/DD/YYYY'
                onChange={this.handleDateChange}
                value={dateValue}
                disabled={sampleDataset === '' || sampleDataset === 'all'}
              />
            </div>
          </div>
          <InputBox
            mainField={true}
            label={'Sampling Percentage'}
            changeSamplingValue={this.changeSamplingValue}
            defaultPlaceholder={'%'}
            type={'number'}
            helpText={'Set percentage to define the sample size'}
          />

          <InputEpochBox
            mainField={true}
            changeEpochValue={this.changeEpochValue}
            type={'number'}
            label={'No. of Epochs'}
            helpText={
              'No. of epoch for training. Please enter value between 5-50'
            }
          />

          <InputBox
            mainField={true}
            value={processedCount}
            label={'No. of Documents in Training'}
            helpText={
              'No. of approved documents after sampling must be atleast 20.'
            }
          />
        </ModalContent>
        <ModalFooter className={styles.modalFooter}>
          <Button
            text='Cancel'
            iconLeft={CloseIcon}
            appearance={BUTTON_APPEARANCES.PRIMARY_REVERSED}
            className={cx(styles.btn, styles.btnCancel)}
            onClick={() => this.handleCloseBtnClick()}
          />
          <Button
            text='Train'
            iconLeft={ModelIcon}
            isLoading={isTraining}
            appearance={BUTTON_APPEARANCES.PRIMARY}
            className={styles.btn}
            disabled={
              !selectedDoctype.length ||
              !selectedModeltype ||
              !(processedCount > 19)
            }
            onClick={() => this.handleTrainer()}
          />
        </ModalFooter>
      </Modal>
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
