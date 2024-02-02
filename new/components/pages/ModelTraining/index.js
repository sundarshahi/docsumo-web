/* eslint-disable no-dupe-else-if */
import React, { Component, createRef, Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as modelActions } from 'new/redux/model/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import download from 'downloadjs';
import {
  DeleteCircle,
  EditPencil,
  Filter,
  KeyframesCouple,
  NavArrowDown,
  Plus,
  Svg3DSelectSolid,
  Trash,
} from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import moment from 'moment';
import * as api from 'new/api';
import { PageMetadata } from 'new/components/layout/page';
import { PageScrollableContent } from 'new/components/layout/page';
import { DataFetchFailurePageError } from 'new/components/shared/PageError';
import Popover from 'new/components/widgets/popover';
import * as apiConstants from 'new/constants/api';
import routes from 'new/constants/routes';
import { chameleonIdentifyUser } from 'new/thirdParty/chameleon';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Badges from 'new/ui-elements/Badge/Badge';
import Button from 'new/ui-elements/Button/Button';
import Checkbox from 'new/ui-elements/Checkbox/Checkbox';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import LinearProgressbar from 'new/ui-elements/LinearProgressBar/LinearProgressbar';
import Pagination from 'new/ui-elements/Pagination';
import Table from 'new/ui-elements/Table';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import * as utils from 'new/utils';
import addToHSQ from 'new/utils/addToHSQ';
import queryString from 'query-string';

import CheckboxGroup from './components/CheckBoxGroup/checkboxGroup';
import DeleteModal from './components/DeleteModal/DeleteModal';
import LinkedToDropdownCheckbox from './components/LinkedTo/LinkedToDropDown';
import RenameModel from './components/RenameModelName/RenameModel';
import { filterAuthorizedDocTypes } from './utils/utils';
import {
  DocumentList,
  DocumentListHeader,
  DocumentListSubHeader,
} from './List';
import ZeroCase from './ZeroCase';

import styles from './index.scss';
class ModelTraining extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'Model & Training',
      deleteConfirmation: {},
      deleteLoading: false,
      typeFiltered: [],
      modelFiltered: [],
      checkedRows: [],
      deleteModal: false,
      confirmModal: false,
      selectedModelDropdownLinked: '',
      deletingModelList: [],
      deletingModelDetails: [],
      docTypeOption: {},
      totalModelOption: [],
      selectedIsDropdownOpen: '',
      isAllSelected: false,
      ref: createRef(),
      docTypeActive: false,
      modelTypeActive: false,
      selectedLinkedDropdown: '',
      renameModelId: null,
    };
  }

  selectLinkedDropdownHandler = (modelId) =>
    this.setState({ selectedLinkedDropdown: modelId });

  componentDidMount() {
    const { user, location, config } = this.props;

    chameleonIdentifyUser(user, config);

    const pageQueryParams = this.getValidPageQueryParams(
      _.get(this.props, 'location.search')
    );
    const { doc_type = [], model_type = [] } = pageQueryParams;

    this.updateParamStateKeys({
      pageQueryParams,
    });

    if (doc_type.length) {
      this.setState({ typeFiltered: doc_type });
    }
    if (model_type.length) {
      this.setState({ modelFiltered: model_type });
    }
    this.fetchDocuments(pageQueryParams);
    // Sending to hubspot
    addToHSQ(user, location);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const nextLocation = nextProps.location;
    const { location } = this.props;

    const currentPageQueryParams = this.getValidPageQueryParams(
      location.search
    );
    const nextPageQueryParams = this.getValidPageQueryParams(
      nextLocation.search
    );
    const paramsChanged = utils.haveParamsChanged(
      currentPageQueryParams,
      nextPageQueryParams
    );

    if (paramsChanged) {
      this.updateParamStateKeys({
        pageQueryParams: nextPageQueryParams,
      });
      this.fetchDocuments(nextPageQueryParams);
    }
  }

  updateParamStateKeys = ({ pageQueryParams } = {}) => {
    if (!pageQueryParams) {
      pageQueryParams = this.getValidPageQueryParams(
        this.props.location.search
      );
    }

    this.setState({
      pageQueryParams,
    });

    return {
      pageQueryParams,
    };
  };

  getValidPageQueryParams = _.memoize((locationSearch) => {
    return utils.getValidPageQueryParams(locationSearch, {
      offset: {
        type: 'number',
        default: 0,
      },
      doc_type: {
        multiple: true,
        default: [],
      },
      model_type: {
        multiple: true,
        default: [],
      },
      model_id: {
        multiple: true,
        default: [],
      },
    });
  });

  fetchDocuments = (pageQueryParams) => {
    let queryParams = {
      ...pageQueryParams,
    };
    this.props.modelActions.modelFetch({
      queryParams,
    });
  };

  componentWillUnmount() {
    const { modelActions } = this.props;
    modelActions.setCheckBoxSelectionAll({
      checked: false,
    });
  }

  handleCheckboxChange = () => {
    const { modelActions, model } = this.props;
    const mappedModelList = _.map(model, 'modelId');
    if (this.state.isAllSelected) {
      modelActions.setCheckBoxSelectionAll({
        checked: false,
      });
      this.setState({ isAllSelected: false });
    } else {
      modelActions.setCheckBoxSelectionAll({
        checked: [...mappedModelList],
      });
      this.setState({ isAllSelected: true });
    }
  };

  handleSelectionDocList = ({ checked: optionChecked, value }) => {
    const { slectedList = [], modelActions } = this.props;
    const included = slectedList.includes(value);
    if (!optionChecked && !included) {
      modelActions.setCheckBoxSelectionIndividual({
        checked: [...slectedList, value],
      });
    } else if (optionChecked && included) {
      const result = slectedList.filter((e) => e !== value);
      modelActions.setCheckBoxSelectionIndividual({
        checked: [...result],
      });
    }
    this.resetModelRename();
  };

  getDocIdList = () => {
    const { slectedList = [] } = this.props;
    const bifurcateBy = (arr) => {
      return arr.reduce((acc, val) => (acc.push(val), acc), []);
    };

    const modelIds = bifurcateBy(slectedList);

    return {
      model_ids: modelIds,
    };
  };

  handleModelUpload = () => {
    const { user, modelActions, config } = this.props;
    modelActions.showTrainModelModal();
    const { canSwitchToOldMode = true } = config;

    // Track frequency of clicks on New Model from localStorage
    // for mixpanel tracking
    const newModelClicksStore = localStorage.getItem('newModelClicks');
    let newModelClicks;
    if (!newModelClicksStore) {
      newModelClicks = 1;
    } else {
      newModelClicks = +newModelClicksStore + 1;
    }
    localStorage.setItem('newModelClicks', newModelClicks);

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.add_new_model, {
      'work email': user.email,
      'frequency of clicks': newModelClicks,
      version: 'new',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  handleDownload = async () => {
    const { slectedList = [], appActions } = this.props;
    if (!slectedList.length) {
      appActions.setToast({
        title: 'Please select at least one file.',
        error: true,
      });
      return;
    }
    appActions.setToast({
      title: 'Downloading...',
      duration: 3000,
    });
    const result = this.getDocIdList();
    try {
      const { responsePayload } = await api.downloadCsv({
        ...result,
        type: 'data',
      });
      const downloadUrl = _.get(responsePayload, 'data');
      download(downloadUrl);
    } catch (e) {
      // Do nothing
    }
  };

  handleCancelConfirmation = () => {
    this.setState({ deleteModal: false });
  };

  getModelFromDelete = (list) => {
    const modelList = [];
    for (let i of list) {
      modelList.push(i.modelId);
    }
    return modelList;
  };

  handleSelectedDelete = async () => {
    const { appActions, modelActions } = this.props;
    const result = this.state.deletingModelList;
    this.setState({
      deleteLoading: true,
    });
    try {
      await api.deleteModel({
        model_ids: result,
      });
      modelActions.setCheckBoxSelectionAll({
        checked: false,
      });
      modelActions.setCheckBoxSelectionIndividual({
        checked: [],
      });
      this.handleCancelConfirmation();
      appActions.setToast({
        title: 'Model Version Deleted',
        success: true,
      });
      this.setState({ deleteConfirmation: {} });
    } finally {
      this.setState({
        deleteLoading: false,
        deletingModelList: [],
        deletingModelDetails: [],
      });
    }
    this.fetchDocuments();
  };

  handleGetConfirmation = () => {
    const { model_ids = [] } = this.getDocIdList();
    const { slectedList = [], appActions } = this.props;
    if (!slectedList.length) {
      appActions.setToast({
        title: 'Please select at least one model.',
        error: true,
      });
      return;
    }
    // Trigger delete model
    const tempDeleteList = [];
    for (let i of this.props.model) {
      if (slectedList.includes(i.modelId)) {
        tempDeleteList.push(i);
      }
    }
    this.setState({
      deleteModal: true,
      deletingModelList: slectedList,
      deletingModelDetails: tempDeleteList,
      deleteConfirmation: {
        docs: model_ids.length,
      },
    });
  };

  renameModelHandler = (id) => {
    this.setState({ renameModelId: id });
  };

  renderZeroCase = () => {
    return (
      <div className={styles.zeroCaseContainer}>
        <ZeroCase handleModelUpload={this.handleModelUpload} />
      </div>
    );
  };

  handleDocumentActionClick = ({ item: { modelId, status } }) => {
    if (status.toLowerCase() === 'complete') {
      this.props.modelActions.openSingleView({
        modelId,
      });
    }
  };

  renderDocumentListHeader = () => {
    //const { queryParamSortValues } = this.state;

    return (
      <DocumentListHeader
        //sortOrderValues={queryParamSortValues}
        onSortableItemClick={this.handleSortableHeaderItemClick}
      />
    );
  };
  renderDocumentListSubHeader = () => {
    //const { queryParamSortValues } = this.state;

    return (
      <DocumentListSubHeader
        //sortOrderValues={queryParamSortValues}
        onSortableItemClick={this.handleSortableHeaderItemClick}
      />
    );
  };

  renderDocumentList = () => {
    const { model, appActions, slectedList, modelTypeData } = this.props;
    return (
      <PageScrollableContent className={styles.scroll}>
        <DocumentList
          documents={model}
          appActions={appActions}
          onActionClick={this.handleDocumentActionClick}
          handleSelectionDocList={this.handleSelectionDocList}
          selectedDocuments={slectedList}
          modelTypeData={modelTypeData}
        />
      </PageScrollableContent>
    );
  };

  handleComparision = async () => {
    const {
      modelActions,
      appActions,
      history,
      slectedList = [],
      model,
      user,
      config,
    } = this.props;
    const { canSwitchToOldMode = true } = config;

    const modelList = slectedList;

    let modelTag = model.find((item) => {
      if (item.modelId === modelList[0]) {
        return item.tag;
      }
    });
    if (!slectedList.length || slectedList.length === 1) {
      appActions.setToast({
        title: 'Please select two model for comparison.',
        error: true,
      });
      return;
    }

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.compare_model, {
      'number of models': slectedList.length,
      'work email': user.email,
      'document type': model.find((i) => i.modelId === modelList[0])?.docType,
      version: 'new',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
    });

    appActions.showLoaderOverlay();
    try {
      const response = await api.getComparision({
        queryParams: {
          model_id: modelList,
        },
      });

      if (typeof response.responsePayload === 'string') {
        var result = JSON.parse(
          response.responsePayload.replace(/\bNaN\b|\bnull\b/g, '0')
        );
        const data = utils.camelCase(result.data);
        modelActions.openComparisionViewFulfilled({
          response: { responsePayload: { data } },
        });
      }

      if (!(typeof response.responsePayload === 'string')) {
        modelActions.openComparisionViewFulfilled({
          response,
        });
      }

      await history.push(routes.MODEL_COMPARE, {
        modelId: modelList,
        docType: modelTag.docType,
      });
    } catch (e) {
      const { error = '', message = '' } = e.responsePayload;
      appActions.setToast({
        title: `${error}. ${message}`,
        error: true,
      });
      await modelActions.openComparisionViewRejected();
    } finally {
      appActions.hideLoaderOverlay();
    }
  };
  handleFilterChange = (e) => {
    const type = e.target.value;
    const { typeFiltered } = this.state;
    if (typeFiltered.includes(type)) {
      let tempFilterd = [...typeFiltered];
      tempFilterd = tempFilterd.filter((item) => item !== type);
      this.applyParams({ doc_type: [...tempFilterd], offset: 0 });
      this.setState({ typeFiltered: [...tempFilterd] });
    } else {
      this.applyParams({ doc_type: [...typeFiltered, type], offset: 0 });
      this.setState({ typeFiltered: [...typeFiltered, type] });
    }
  };

  handleClearFilters = () => {
    this.applyParams({ doc_type: [] });
    this.setState({ typeFiltered: [] });
  };
  handleModelFilterChange = (e) => {
    const type = e.target.value;
    const { modelFiltered } = this.state;
    if (modelFiltered.includes(type)) {
      let tempFilterd = [...modelFiltered];
      tempFilterd = tempFilterd.filter((item) => item !== type);
      this.applyParams({ model_type: [...tempFilterd], offset: 0 });
      this.setState({ modelFiltered: [...tempFilterd] });
    } else {
      this.applyParams({ model_type: [...modelFiltered, type], offset: 0 });
      this.setState({ modelFiltered: [...modelFiltered, type] });
    }
  };

  handleClearModelFilters = () => {
    this.applyParams({ model_type: [] });
    this.setState({ modelFiltered: [] });
  };

  applyParams = (params) => {
    const {
      history,
      location: { pathname, search },
    } = this.props;
    const currentQuery = queryString.parse(search);
    let query = {
      ...currentQuery,
      ...params,
    };
    query = queryString.stringify(query, { encode: false });
    history.push(`${pathname}?${query}`);
  };

  handleClearAll = () => {
    const { typeFiltered, modelFiltered } = this.state;
    if (typeFiltered.length || modelFiltered.length) {
      this.applyParams({ doc_type: [], model_type: [] });
      this.setState({ typeFiltered: [], modelFiltered: [] });
    } else if (typeFiltered.length) {
      this.handleClearFilters();
    } else if (modelFiltered.length) {
      this.handleClearModelFilters();
    }
  };

  clearIndividualFilter = (filter) => {
    let filtered = this.state.typeFiltered.filter((value) => value !== filter);
    this.applyParams({ doc_type: [...filtered], offset: 0 });
    this.setState({ typeFiltered: [...filtered] });
  };

  clearIndividualModelFilter = (filter) => {
    let filtered = this.state.modelFiltered.filter((value) => value !== filter);
    this.applyParams({ model_type: [...filtered], offset: 0 });
    this.setState({ modelFiltered: [...filtered] });
  };

  handlePageNavigation = (page) => {
    const { history, match, location, meta } = this.props;

    const offset = meta.limit * (page - 1);
    const params = {
      ...queryString.parse(location.search),
      offset: offset,
    };
    history.push(`${match.url}?${queryString.stringify(params)}`);
  };

  renderPagination = () => {
    const { meta } = this.props;

    const totalPageCount = Math.ceil(meta.total / meta.limit);
    const currentPage = Math.ceil((meta.offset + 1) / meta.limit);

    return (
      <Pagination
        totalPageCount={totalPageCount}
        currentPage={currentPage}
        leftRightOffset={1}
        siblings={1}
        onPageChange={this.handlePageNavigation}
      />
    );
  };

  HeaderTitleComponent = ({ cellData: { title } }) => {
    return (
      <span className={styles['modelTraining__table--header']}>{title}</span>
    );
  };

  resetModelRename = () => this.setState({ renameModelId: null });

  updateNewModelName = () => {
    const { modelActions } = this.props;
    modelActions.setCheckBoxSelectionAll({
      checked: false,
    });
    this.setState({
      isAllSelected: false,
      renameModelId: null,
    });
  };

  ModelRenameComponent = ({ cellData: cell }, key) => {
    const { renameModelId } = this.state;
    return (
      <>
        {renameModelId === cell['modelId'] ? (
          <RenameModel
            resetModelRename={this.resetModelRename}
            currentEditId={renameModelId}
            value={cell[key]}
            updateNewModelName={this.updateNewModelName}
          />
        ) : (
          <span
            title={cell[key]}
            className={cx(
              styles['modelTraining__table--body'],
              'text-truncate',
              'ml-1'
            )}
          >
            {cell[key]}
          </span>
        )}
      </>
    );
  };

  BodyTitleComponent = ({ cellData: cell }, key) => {
    const { modelTypeData } = this.props;
    const modelTypeDatValue = _.keyBy([...modelTypeData], 'value');
    const modelTypeDataMap = _.mapValues(modelTypeDatValue, 'title');

    return (
      <span
        title={
          key === 'modelType'
            ? modelTypeDataMap && modelTypeDataMap[cell[key]]
            : cell[key]
        }
        className={cx(
          styles['modelTraining__table--body'],
          'text-truncate',
          'ml-1'
        )}
      >
        {key === 'modelType'
          ? modelTypeDataMap && modelTypeDataMap[cell[key]]
          : cell[key]}
      </span>
    );
  };

  DateComponent = ({ cellData: cell }, key) => {
    return (
      <span
        className={cx(
          styles['modelTraining__table--body'],
          styles['modelTraining__table--timestamp'],
          'text-truncate',
          'ml-1'
        )}
      >
        <span
          className={cx(styles['modelTraining__table--time'], 'text-truncate')}
        >
          {moment(cell[key]).format('hh:mm A')}
        </span>
        <span
          className={cx(styles['modelTraining__table--date'], 'text-truncate')}
        >
          {moment(cell[key]).format('DD MMM YYYY')}
        </span>
      </span>
    );
  };

  DropdownComponent = ({ cellData: cell }, key) => {
    return (
      <div>
        <span className={cx(styles['modelTraining__table--body'])}>
          <LinkedToDropdownCheckbox
            disabled={
              cell?.status?.toLowerCase() === 'failed' ||
              cell?.status?.toLowerCase() === 'running'
            }
            className={styles['modelTraining__table--dropdown']}
            placeholder='Select Value'
            cell={cell}
            selectedIsDropdownOpen={this.state.selectedIsDropdownOpen}
            data={this.props.documentModelConfig}
            authorizedDocTypes={filterAuthorizedDocTypes(
              this.props.config?.documentTypes
            )}
            fetchDocuments={this.fetchDocuments}
            ref={this.ref}
            config={this.props.config}
            pageQueryParams={this.getValidPageQueryParams(
              _.get(this.props, 'location.search')
            )}
            selectLinkedDropdownHandler={this.selectLinkedDropdownHandler}
            selectedLinkedDropdown={this.state.selectedLinkedDropdown}
          />
        </span>
      </div>
    );
  };

  progressBarComponent = ({ cellData: cell }, key, status) => {
    return (
      <div className={cx(styles.accuracy__progress)}>
        {cell[status].toLowerCase() === 'failed' ? (
          <span className={styles['accuracy__progress--failed']}>Failed</span>
        ) : cell[status].toLowerCase() === 'complete' ? (
          <span className={styles['accuracy__progress--success']}>
            {parseInt((cell[key] * 100).toFixed(2))}%
          </span>
        ) : (
          <span className={styles['accuracy__progress--complete']}>
            <div className={styles['accuracy__progress--complete-timeEst']}>
              <span>{+cell['elapsed']} min elapsed</span>
              <span>{+cell['eta']} min remaining</span>
            </div>
            <LinearProgressbar
              className={styles['accuracy__progress--bar']}
              value={
                cell['estimatedTime']
                  ? ((cell['estimatedTime'] - cell['eta']) /
                      cell['estimatedTime']) *
                    100
                  : 0
              }
              showLabel={false}
              size='md'
            />
            <span>You will receive an email when training is done</span>
          </span>
        )}
      </div>
    );
  };

  modelsTrainingTableStructure = [
    {
      key: 'modelTagVerbose',
      title: 'Model Name',
      customHeaderCell: this.HeaderTitleComponent,
      customBodyCell: (cell) =>
        this.ModelRenameComponent(cell, 'modelTagVerbose'),
      onBodyCellClick: (e) =>
        !this.state.renameModelId && this.handleDocumentActionClick(e),
      bodyCellClassNames: [styles.modelName, styles.modelTable__cell],
      headerCellClassNames: styles.modelName,
    },
    {
      key: 'docTypeVerbose',
      title: 'Trained From',
      customHeaderCell: this.HeaderTitleComponent,
      customBodyCell: (cell) => this.BodyTitleComponent(cell, 'docTypeVerbose'),
      onBodyCellClick: (e) => this.handleDocumentActionClick(e),
      bodyCellClassNames: [styles.modelTable__cell],
    },
    {
      key: 'modelType',
      title: 'Model Type',
      customHeaderCell: this.HeaderTitleComponent,
      customBodyCell: (cell) => this.BodyTitleComponent(cell, 'modelType'),
      onBodyCellClick: (e) => this.handleDocumentActionClick(e),
      bodyCellClassNames: [styles.modelTable__cell],
    },
    {
      key: 'linkedTo',
      title: 'Linked To',
      customHeaderCell: this.HeaderTitleComponent,
      customBodyCell: (cell) => this.DropdownComponent(cell, 'linkedTo'),
      bodyCellClassNames: [styles.linkedTo, styles.modelTable__cell],
      headerCellClassNames: styles.linkedTo,
    },
    {
      key: 'accuracy',
      title: 'Accuracy',
      customHeaderCell: this.HeaderTitleComponent,
      customBodyCell: (cell) =>
        this.progressBarComponent(cell, 'accuracy', 'status'),
      onBodyCellClick: (e) => this.handleDocumentActionClick(e),
      bodyCellClassNames: [styles.modelTable__cell, styles.accuracyWidth],
      headerCellClassNames: styles.accuracyWidth,
    },
    {
      key: 'startedAt',
      title: 'Date Added',
      customHeaderCell: this.HeaderTitleComponent,
      customBodyCell: (cell) => this.DateComponent(cell, 'startedAt'),
      onBodyCellClick: (e) => this.handleDocumentActionClick(e),
      bodyCellClassNames: [styles.modelTable__cell],
    },
  ];

  createDropDownFromLinkedTo = (data) => {
    const dropdownVal = [];
    for (let i of data) {
      dropdownVal.push({
        label: _.capitalize(i),
        value: i,
      });
    }
    return dropdownVal;
  };

  refactorTableData = (model) => {
    const tableData = [];
    for (const key of model) {
      tableData.push({
        modelTagVerbose: key.modelTagVerbose,
        modelType: key.modelType,
        docTypeVerbose: key.docTypeVerbose,
        startedAt: key.startedAt,
        accuracy: key.metrics?.testMetrics?.macroAvg?.accuracy,
        linkedTo: key.linkedTo,
        modelId: key.modelId,
        status: key.status,
        eta: key.eta,
        estimatedTime: key.estimatedTime,
        elapsed: key.elapsed,
      });
    }
    return tableData;
  };

  toogleDeleteModal = () =>
    this.setState({ deleteModal: !this.state.deleteModal });

  toogleConfirmModal = () =>
    this.setState({ confirmModal: !this.state.confirmModal });

  docTypeClose = () => this.setState({ docTypeActive: false });

  modelTypeClose = () => this.setState({ modelTypeActive: false });

  documentTypeLabelHandler = (filter) => {
    const {
      config: { documentTypes },
    } = this.props;
    const matchedDocTypes = documentTypes.find((doc) => doc.value === filter);
    return matchedDocTypes ? matchedDocTypes.title : '';
  };

  setRowClickableStatus = (model) => {
    if (model.status.toLowerCase() === 'failed') {
      return false;
    }
    return true;
  };

  render() {
    const {
      isFetchingDocuments,
      fetchSucceeded,
      fetchFailed,
      model,
      selectedAll,
      slectedList,
      modelTypeData,
    } = this.props;

    const { typeFiltered, modelFiltered } = this.state;
    const {
      config: { documentTypes },
    } = this.props;
    const uploadableDocumentTypes = documentTypes.filter(
      (item) => item.canUpload && !item.excelType
    );

    const hasMODEL = !_.isEmpty(model);

    const showFetchError = !isFetchingDocuments && fetchFailed;

    const showSkeletonView =
      isFetchingDocuments && !hasMODEL && !showFetchError;

    const showZeroCase =
      !isFetchingDocuments && fetchSucceeded && !showFetchError && !hasMODEL;

    const showDocumentList =
      !showSkeletonView && !showZeroCase && !showFetchError && hasMODEL;

    const showPagination = !!showDocumentList;

    return (
      <Fragment>
        <PageMetadata title='Model & Training' />
        <div className={styles.modelTraining}>
          <div className={styles.modelTraining__header}>
            <p className={styles['modelTraining__header--title']}>
              Models & Training
            </p>
          </div>
          <div className={styles.modelTraining__actionHeader}>
            <div className={styles['modelTraining__actionHeader--left']}>
              <Checkbox
                className={styles['modelTraining__actionHeader--checkbox']}
                name='selectAll'
                checked={selectedAll || false}
                onChange={this.handleCheckboxChange}
                value='selectAll'
              />
              <Tooltip label='Delete' className='ml-4'>
                <IconButton
                  colorScheme='danger'
                  variant='text'
                  icon={Trash}
                  className={styles['modelTraining__actionHeader--delete']}
                  disabled={!hasMODEL || !slectedList.length}
                  onClick={this.handleGetConfirmation}
                />
              </Tooltip>
              {slectedList.length === 1 && (
                <Tooltip label='Rename model'>
                  <IconButton
                    colorScheme='primary'
                    variant='text'
                    icon={EditPencil}
                    className={styles['modelTraining__actionHeader--edit']}
                    onClick={() => this.renameModelHandler(slectedList[0])}
                  />
                </Tooltip>
              )}
            </div>
            <div className={styles['modelTraining__actionHeader--right']}>
              <Tooltip label='Compare two models' className='mr-4'>
                <IconButton
                  icon={KeyframesCouple}
                  name='comparision'
                  onClick={this.handleComparision}
                  disabled={slectedList.length > 2}
                  className={styles['modelTraining__actionHeader--model']}
                />
              </Tooltip>
              <Popover
                content={
                  <>
                    <CheckboxGroup
                      options={modelTypeData}
                      checked={modelFiltered}
                      onChange={this.handleModelFilterChange}
                    />
                  </>
                }
                uid='document-type-filter-section'
                className={cx(styles.action_icon, {
                  [styles.active]: modelFiltered.length,
                })}
                title='Select Model Type:'
                openClassName={styles.openClassName}
                containerClassName={cx(
                  styles.filter__container,
                  styles.filter__extraPadding
                )}
                contentClassName={cx(styles.filter__content)}
                titleClassName={styles.filter__title}
              >
                <Tooltip label='Filter By Model Type' className='mr-4'>
                  <IconButton
                    variant='text'
                    icon={
                      <div
                        className={cx(
                          styles['modelTraining__actionHeader-typeContainer'],
                          {
                            [styles.filter__bg]:
                              modelFiltered.length > 0 ||
                              this.state.modelTypeActive,
                          }
                        )}
                      >
                        <Svg3DSelectSolid
                          className={styles['modelTraining__actionHeader-icon']}
                        />
                        {<NavArrowDown className={styles.filter__arrowDown} />}
                      </div>
                    }
                    className={cx(
                      styles['modelTraining__actionHeader-typeFilter'],
                      {
                        [styles['modelTraining__actionHeader--active']]:
                          modelFiltered.length,
                      }
                    )}
                    onClick={() => this.setState({ modelTypeActive: true })}
                  />
                  {modelFiltered.length ? (
                    <button
                      className={styles['modelTraining__actionHeader--clear']}
                      onClick={() => this.handleClearModelFilters()}
                      title='Clear Filters'
                    >
                      <DeleteCircle
                        className={
                          styles['modelTraining__actionHeader--clearicon']
                        }
                      />
                    </button>
                  ) : (
                    ''
                  )}
                </Tooltip>
              </Popover>
              <Popover
                content={
                  <>
                    <CheckboxGroup
                      options={uploadableDocumentTypes}
                      checked={typeFiltered}
                      onChange={this.handleFilterChange}
                    />
                  </>
                }
                uid='document-type-filter-section'
                className={cx(styles.action_icon, {
                  [styles.active]: typeFiltered.length,
                })}
                title='Select Document Type:'
                openClassName={styles.openClassName}
                containerClassName={styles.filter__container}
                contentClassName={styles.filter__content}
                titleClassName={styles.filter__title}
              >
                <Tooltip
                  label='Filter By Document Type'
                  className='mr-8'
                  showTooltip={uploadableDocumentTypes?.length > 0}
                >
                  <IconButton
                    variant='text'
                    disabled={!uploadableDocumentTypes?.length}
                    icon={
                      <div
                        className={cx(
                          styles['modelTraining__actionHeader-typeContainer'],
                          {
                            [styles.filter__bg]:
                              typeFiltered.length > 0 ||
                              this.state.docTypeActive,
                            [styles['modelTraining__actionHeader-disabled']]:
                              !uploadableDocumentTypes?.length,
                          }
                        )}
                      >
                        <Filter
                          className={styles['modelTraining__actionHeader-icon']}
                        />
                        {<NavArrowDown className={styles.filter__arrowDown} />}
                      </div>
                    }
                    name='comparision'
                    className={cx(
                      styles['modelTraining__actionHeader--filter'],
                      {
                        [styles['modelTraining__actionHeader--active']]:
                          typeFiltered.length,
                      }
                    )}
                    onClick={() => this.setState({ docTypeActive: true })}
                  />

                  {typeFiltered.length ? (
                    <button
                      className={styles['modelTraining__actionHeader--clear']}
                      onClick={() => this.handleClearFilters()}
                      title='Clear Filters'
                    >
                      <DeleteCircle
                        className={
                          styles['modelTraining__actionHeader--clearicon']
                        }
                      />
                    </button>
                  ) : null}
                </Tooltip>
              </Popover>
              <Button
                size='small'
                icon={<Plus />}
                onClick={this.handleModelUpload}
              >
                New Model
              </Button>
            </div>
          </div>
        </div>
        {typeFiltered.length || modelFiltered.length ? (
          <div className={styles.filterStatus}>
            {typeFiltered.length > 0 && (
              <p className={cx(styles.filterStatus__title, 'mr-2')}>
                Document Type:
              </p>
            )}
            {typeFiltered.map((filter) => (
              <span
                key={filter}
                className={cx(styles.filterStatus__box, 'mr-2')}
              >
                <Badges
                  role='presentation'
                  className={styles.badge}
                  variant='text'
                  badgeIconHandler={() => this.clearIndividualFilter(filter)}
                  title={this.documentTypeLabelHandler(filter)}
                  iconDirection='right'
                  iconType='close'
                />
              </span>
            ))}
            {modelFiltered.length > 0 && (
              <p className={cx(styles.filterStatus__title, 'mr-2')}>Status:</p>
            )}
            {modelFiltered.map((filter) => (
              <div key={filter} className='mr-2'>
                <Badges
                  iconDirection='right'
                  iconType='close'
                  badgeIconHandler={() =>
                    this.clearIndividualModelFilter(filter)
                  }
                  title={modelTypeData.map(
                    (model) => model.value === filter && model.title
                  )}
                />
              </div>
            ))}
            <Button
              size='small'
              onClick={() => this.handleClearAll()}
              title='Clear All'
              variant='text'
              className='ml-8'
            >
              Clear All
            </Button>
          </div>
        ) : null}
        {showFetchError ? (
          <DataFetchFailurePageError className='mt-12' />
        ) : null}
        {showZeroCase ? this.renderZeroCase() : null}
        {showDocumentList || showSkeletonView ? (
          <>
            <Table
              data={this.refactorTableData(model)}
              initialColumnStructure={this.modelsTrainingTableStructure}
              headerClassNames={[styles.modelTable__header]}
              bodyClassNames={[styles.modelTable__body]}
              checkedRows={slectedList}
              showCheckbox={true}
              setCheckedRows={this.handleSelectionDocList}
              rowKey={'modelId'}
              cellClassNames={styles.modelTable__cell}
              showLoader={showSkeletonView}
              setRowClickableStatus={this.setRowClickableStatus}
            />
            {showPagination ? (
              <div className={styles.modelTraining__paginations}>
                {this.renderPagination()}
              </div>
            ) : null}
          </>
        ) : null}
        <DeleteModal
          toogleDeleteModal={this.toogleDeleteModal}
          confirmModal={this.state.deleteModal}
          onProceedActionBtnClick={this.handleSelectedDelete}
          onCancelActionBtnClick={this.handleCancelConfirmation}
          deletingModelList={this.state.deletingModelList}
          deletingModelDetails={this.state.deletingModelDetails}
          config={this.props.config}
        />
      </Fragment>
    );
  }
}
function mapStateToProp(state) {
  const {
    model,
    meta,
    fetchState,
    selectedAll,
    slectedList = [],
    modelTypeData,
    documentModelConfig,
  } = state.model.modelPage;

  const { documentsById } = state.model;

  const { config, user } = state.app;

  const isFetchingDocuments = fetchState === apiConstants.FETCH_STATES.FETCHING;
  const fetchSucceeded = fetchState === apiConstants.FETCH_STATES.SUCCESS;
  const fetchFailed = fetchState === apiConstants.FETCH_STATES.FAILURE;

  return {
    model,
    meta,
    fetchState,
    isFetchingDocuments,
    fetchSucceeded,
    fetchFailed,
    selectedAll,
    slectedList,
    documentsById,
    config,
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
  connect(mapStateToProp, mapDispatchToProps)(ModelTraining)
);
