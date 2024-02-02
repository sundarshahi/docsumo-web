/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as modelActions } from 'new/redux/model/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import _ from 'lodash';
import * as api from 'new/api';
import { PageMetadata } from 'new/components/layout/page';
import { PageScrollableContent } from 'new/components/layout/page';
import { SkeletonView } from 'new/components/shared/documentList';
import routes from 'new/constants/routes';
import { chameleonIdentifyUser } from 'new/thirdParty/chameleon';
import Badges from 'new/ui-elements/Badge/Badge';
import BreadCrumbComponent from 'new/ui-elements/BreadCrumb/BreadCrumb';
import { Dropdown } from 'new/ui-elements/Dropdown/Dropdown';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import * as utils from 'new/utils';

import ListHeader from './components/header';
import { MTCompareTooltipData } from './utils/utils';
import { DocumentList } from './List';

import styles from './index.scss';

const option = [
  {
    id: 1,
    title: 'Test Data',
    value: 'testDatas',
  },
  {
    id: 2,
    title: 'Train Data',
    value: 'trainDatas',
  },
];
class SingleModelPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'Model & Training',
      deleteConfirmation: {},
      deleteLoading: false,
      selectedDataFirstModel: 'Test Data',
      selectedDataSecondModel: 'Test Data',
      datasFirstModel: {},
      datasSecondModel: {},
      firstModelOption: [],
      secondModelOption: [],
      tagFirstModel: '',
      tagSecondModel: '',
      isDataFetching: true,
      updatedModel: [],
    };
  }

  async componentDidMount() {
    const {
      history: { location },
      modelActions,
      modelPage: { model },
      user,
      config,
    } = this.props;

    chameleonIdentifyUser(user, config);

    let docType = _.get(location, 'state.docType');
    let modelId = _.get(location, 'state.modelId');
    this.updateModelOptions(model, modelId, docType, true);
    const response = await api.getComparision({
      queryParams: {
        model_id: [...modelId],
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
    } else {
      modelActions.openComparisionViewFulfilled({
        response,
      });
    }

    setTimeout(() => {
      this.setState({ isDataFetching: false });
      this.initializePage();
    }, 500);
  }

  async UNSAFE_componentWillMount() {
    const {
      history: { location },
      modelActions,
      modelPage: { model },
    } = this.props;
    let docType = _.get(location, 'state.docType');
    this.initializePage();

    if (!model || !model.length) {
      const pageQueryParams = this.getValidPageQueryParams(
        _.get(this.props, 'location.search')
      );
      this.fetchDocuments(pageQueryParams);
    } else {
      let modelId = _.get(location, 'state.modelId');
      this.updateModelOptions(model, modelId, docType, true);
      const response = await api.getComparision({
        queryParams: {
          model_id: [...modelId],
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
      } else {
        modelActions.openComparisionViewFulfilled({
          response,
        });
      }

      setTimeout(() => {
        this.setState({ isDataFetching: false });
        this.initializePage();
      }, 500);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      history: { location },
      modelPage: { model },
    } = this.props;
    const { compareView } = this.props;
    const { compareView: prevCompareView } = prevProps;

    // Only update model options data when modelPage gets updated

    if (
      !_.isEqual(prevProps.modelPage, this.props.modelPage) ||
      (compareView &&
        prevCompareView &&
        (compareView.firstModel !== prevCompareView.firstModel ||
          compareView.secondModel !== prevCompareView.secondModel))
    ) {
      let docType = _.get(location, 'state.docType');
      this.initializePage();
      let modelId = _.get(location, 'state.modelId');
      this.updateModelOptions(model, modelId, docType, false);
    }
  }

  initializePage = () => {
    const {
      compareView: { firstModel, secondModel },
    } = this.props;
    const { testDatas: datasFirstModel } = firstModel;
    const { testDatas: datasSecondModel } = secondModel;
    this.setState({
      datasFirstModel,
      datasSecondModel,
    });
  };
  goback = () => {
    const { history } = this.props;
    history.push(routes.MODEL);
  };

  fetchDocuments = (pageQueryParams) => {
    let queryParams = {
      ...pageQueryParams,
    };
    this.props.modelActions.modelFetch({
      queryParams,
    });
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

  updateModelOptions = (model, modelId, docType, isDataFetch) => {
    const filteredFirstModelOption = model.filter(
      (item) => item.docType === docType && item.modelId !== modelId[1]
    );
    const filteredSecondModelOption = model.filter(
      (item) => item.docType === docType && item.modelId !== modelId[0]
    );
    if (isDataFetch) {
      this.setState({
        firstModelOption: filteredFirstModelOption,
        secondModelOption: filteredSecondModelOption,
        isDataFetching: true,
      });
    } else {
      this.setState({
        firstModelOption: filteredFirstModelOption,
        secondModelOption: filteredSecondModelOption,
      });
    }
  };

  renderFirstDocumentList = () => {
    const { datasFirstModel } = this.state;

    return <DocumentList documents={datasFirstModel} appActions={appActions} />;
  };
  renderSecondDocumentList = () => {
    const { datasSecondModel } = this.state;
    return (
      <DocumentList documents={datasSecondModel} appActions={appActions} />
    );
  };
  changeDataTypeFirstModel = (item) => {
    const { id, title: label } = item;
    const {
      compareView: { firstModel },
    } = this.props;
    const { testDatas, trainDatas } = firstModel;
    if (id === 1) {
      this.setState({
        datasFirstModel: testDatas,
        selectedDataFirstModel: label,
      });
    } else if (id === 2) {
      this.setState({
        datasFirstModel: trainDatas,
        selectedDataFirstModel: label,
      });
    }
  };
  changeDataTypeSecondModel = (item) => {
    const { id, title: label } = item;
    const {
      compareView: { secondModel },
    } = this.props;
    const { testDatas, trainDatas } = secondModel;
    if (id === 1) {
      this.setState({
        datasSecondModel: testDatas,
        selectedDataSecondModel: label,
      });
    } else if (id === 2) {
      this.setState({
        datasSecondModel: trainDatas,
        selectedDataSecondModel: label,
      });
    }
  };

  handleVersionChange = async (id, modelData, second) => {
    const {
      modelActions,
      appActions,
      history,
      modelPage: { model },
    } = this.props;
    let model_ids = [];
    model_ids.push(id);
    model_ids.push(modelData.modelId);

    if (second) {
      [model_ids[0], model_ids[1]] = [model_ids[1], model_ids[0]];
    }

    let modelTag = model.find((item) => {
      if (item.modelId === model_ids[0]) {
        return item.tag;
      }
    });

    appActions.showLoaderOverlay();
    try {
      const response = await api.getComparision({
        queryParams: {
          model_id: [...model_ids],
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
        modelId: [...model_ids],
        docType: modelTag.docType,
      });
    } catch (e) {
      const { error = '', message = '' } = e.responsePayload;
      appActions.setToast({
        title: `${error}. ${message}`,
        error: true,
      });
      await modelActions.openComparisionViewRejected();
      history.push(routes.MODEL);
    } finally {
      appActions.hideLoaderOverlay();
    }
  };

  changeVersionFirstModel = (id) => {
    const {
      compareView: { secondModel },
    } = this.props;
    this.handleVersionChange(id, secondModel);
  };
  changeVersionSecondModel = (id) => {
    let second = true;
    const {
      compareView: { firstModel },
    } = this.props;
    this.handleVersionChange(id, firstModel, second);
  };

  handlePathClickEvent = () => this.goback();

  HeaderTitleComponent = (target) => {
    const {
      cellData: { title, key },
    } = target;
    return (
      <div
        className={cx(styles.customZpos, {
          [styles.customZpos__start]: key === 'title',
        })}
      >
        <Tooltip
          className={styles.customZindex}
          placement='bottom'
          label={MTCompareTooltipData[key]?.data}
          size={MTCompareTooltipData[key]?.tooltipType}
        >
          {title}
        </Tooltip>
      </div>
    );
  };

  BodyTitleComponent = (target, key) => {
    const { cellData } = target;
    return (
      <div className={cx(styles.customZpos)}>
        <Tooltip
          className={styles.customZindex}
          placement='bottom'
          label={cellData[key]}
        >
          <span className={styles['table__title']}>{cellData[key]}</span>
        </Tooltip>
      </div>
    );
  };

  BodySubTitleComponent = (target, key) => {
    const { cellData } = target;
    return (
      <Tooltip placement='bottom' label={cellData[key]}>
        <span className={styles['table__btitle']}>{cellData[key]}</span>
      </Tooltip>
    );
  };

  documentTypesColumnStructure = () => [
    {
      key: 'title',
      title: 'Field Name',
      customHeaderCell: this.HeaderTitleComponent,
      customBodyCell: (target) => this.BodyTitleComponent(target, 'title'),
      bodyCellClassNames: [styles.table__bpadding],
      headerCellClassNames: styles.table__htitlepadding,
      minWidth: '160px',
      width: '160px',
    },
    {
      key: 'accuracy',
      title: 'Accuracy',
      customHeaderCell: this.HeaderTitleComponent,
      customBodyCell: (target) =>
        this.BodySubTitleComponent(target, 'accuracy'),
      bodyCellClassNames: styles.table__padding,
      headerCellClassNames: styles.table__hpadding,
      width: '78px',
      minWidth: '78px',
    },
    {
      key: 'precision',
      title: 'Precision',
      customHeaderCell: this.HeaderTitleComponent,
      customBodyCell: (target) =>
        this.BodySubTitleComponent(target, 'precision'),
      bodyCellClassNames: styles.table__padding,
      headerCellClassNames: styles.table__hpadding,
      width: '78px',
      minWidth: '78px',
    },
    {
      key: 'recall',
      title: 'Recall',
      customHeaderCell: this.HeaderTitleComponent,
      customBodyCell: (target) => this.BodySubTitleComponent(target, 'recall'),
      bodyCellClassNames: styles.table__padding,
      headerCellClassNames: styles.table__hpadding,
      width: '78px',
      minWidth: '78px',
    },
    {
      key: 'f1Score',
      title: 'F1 Score',
      customHeaderCell: this.HeaderTitleComponent,
      customBodyCell: (target) => this.BodySubTitleComponent(target, 'f1Score'),
      bodyCellClassNames: styles.table__padding,
      headerCellClassNames: styles.table__hpadding,
      width: '78px',
      minWidth: '78px',
    },
    {
      key: 'support',
      title: 'Support',
      customHeaderCell: this.HeaderTitleComponent,
      customBodyCell: (target) => this.BodySubTitleComponent(target, 'support'),
      bodyCellClassNames: styles.table__padding,
      headerCellClassNames: styles.table__hpadding,
      width: '78px',
      minWidth: '78px',
    },
  ];

  render() {
    const {
      compareView: { firstModel, secondModel },
    } = this.props;
    const { modelName: modelName1, docType: docType1, tag: tag1 } = firstModel;
    const { modelName: modelName2, docType: docType2, tag: tag2 } = secondModel;
    const {
      selectedDataFirstModel,
      selectedDataSecondModel,
      firstModelOption,
      secondModelOption,
      tagFirstModel,
      tagSecondModel,
    } = this.state;
    const paths = [
      { name: 'Models & Training', url: '/model/' },
      { name: 'Comparison', url: '/label1/' },
    ];

    return (
      <div className={styles.compareModel}>
        {this.state.isDataFetching ? (
          <SkeletonView />
        ) : (
          <>
            <PageMetadata title='Compare Model' />
            <div className={styles.compareModel__header}>
              <BreadCrumbComponent
                showBackBtn
                iconClassName={styles['compareModel__header--icon']}
                paths={paths}
                handlePathClickEvent={this.handlePathClickEvent}
              />
            </div>
            <div className={styles.ma__subHeader}>
              <div className={styles['ma__subHeader--firstbox']}>
                <div className={styles['ma__subHeader--firstbox-layout']}>
                  <div className={styles.versionName}>
                    {tagFirstModel || tag1}
                  </div>
                  <div className={styles.info}>
                    <Badges
                      className={cx(
                        styles['ma__subHeader--firstbox-layout-color'],
                        'text-truncate'
                      )}
                      title={docType1}
                    />
                    <Badges
                      className={cx(
                        styles['ma__subHeader--firstbox-layout-color'],
                        'ml-4',
                        'text-truncate'
                      )}
                      title={modelName1}
                    />
                    <Dropdown
                      data={option}
                      onChange={this.changeDataTypeFirstModel}
                      value={
                        option.filter(
                          (item) => item.title === selectedDataFirstModel
                        )[0].value
                      }
                      className={styles.dropdown}
                    />
                  </div>
                </div>
                <ListHeader
                  id='head'
                  documentTypesColumnStructure={
                    this.documentTypesColumnStructure
                  }
                />
              </div>
              <div className={styles['ma__subHeader--secondbox']}>
                <div className={styles['ma__subHeader--secondbox-layout']}>
                  <div className={styles.versionName}>
                    {tagSecondModel || tag2}
                  </div>
                  <div className={styles.info}>
                    <Badges
                      className={cx(
                        styles['ma__subHeader--secondbox-layout-color'],
                        'text-truncate'
                      )}
                      title={docType2}
                    />
                    <Badges
                      className={cx(
                        styles['ma__subHeader--secondbox-layout-color'],
                        'ml-4',
                        'text-truncate'
                      )}
                      title={modelName2}
                    />
                    <Dropdown
                      data={option}
                      onChange={this.changeDataTypeSecondModel}
                      value={
                        option.filter(
                          (item) => item.title === selectedDataSecondModel
                        )[0].value
                      }
                      className={styles.dropdown}
                    />
                  </div>
                </div>
                <ListHeader
                  documentTypesColumnStructure={
                    this.documentTypesColumnStructure
                  }
                />
              </div>
            </div>
            <PageScrollableContent className={styles.scrollableContent}>
              <div className={styles.Container}>
                <div className={styles.firstContainer}>
                  {this.renderFirstDocumentList()}
                </div>
                <div className={styles.secondContainer}>
                  {this.renderSecondDocumentList()}
                </div>
              </div>
            </PageScrollableContent>
          </>
        )}
      </div>
    );
  }
}
function mapStateToProp(state) {
  const { singleView, modelPage, compareView } = state.model;

  const { user, config } = state.app;

  return {
    singleView,
    modelPage,
    compareView,
    user,
    config,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    modelActions: bindActionCreators(modelActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(SingleModelPage)
);
