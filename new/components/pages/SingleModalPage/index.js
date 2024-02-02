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
import {
  PageMetadata,
  PageScrollableContent,
} from 'new/components/layout/page';
import routes from 'new/constants/routes';
import { chameleonIdentifyUser } from 'new/thirdParty/chameleon';
import Badges from 'new/ui-elements/Badge/Badge';
import BreadCrumbComponent from 'new/ui-elements/BreadCrumb/BreadCrumb';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';

import ListHeader from './components/header';
import { MTAnalyticsTooltipData } from './utils/utils';
import { DocumentList } from './List';

import styles from './index.scss';

class SingleModelPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'Model & Training',
      deleteConfirmation: {},
      deleteLoading: false,
    };
  }

  componentDidMount() {
    const {
      history: { location },
      modelPage,
      user,
      config,
    } = this.props;

    chameleonIdentifyUser(user, config);

    let modelId = _.get(location, 'state.modelId');
    const { documentIds } = modelPage;
    if (!documentIds.length) {
      this.props.modelActions.openSingleView({
        modelId,
      });
    }
  }

  goback = () => {
    const { history } = this.props;
    history.push(routes.MODEL);
  };

  renderTrainDocumentList = () => {
    const {
      singleView: { trainDatas },
    } = this.props;

    return <DocumentList documents={trainDatas} appActions={appActions} />;
  };
  renderTestDocumentList = () => {
    const {
      singleView: { testDatas },
    } = this.props;
    return <DocumentList documents={testDatas} appActions={appActions} />;
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
          placement='top'
          label={MTAnalyticsTooltipData[key]?.data}
          size={MTAnalyticsTooltipData[key]?.tooltipType}
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
    const { singleView } = this.props;
    const { version, modelName, docType } = singleView;
    const paths = [
      { name: 'Models & Training', url: '/model/' },
      { name: 'Analytics', url: '/label1/' },
    ];
    return (
      <div className={styles.modelAnalytics}>
        <PageMetadata title='Single Model View' />
        <div className={styles.modelAnalytics__header}>
          <BreadCrumbComponent
            showBackBtn
            iconClassName={styles['modelAnalytics__header--icon']}
            paths={paths}
            handlePathClickEvent={this.handlePathClickEvent}
          />
        </div>
        <div className={styles.ma__subHeader}>
          <div className={styles['ma__subHeader--firstbox']}>
            <div className={styles['ma__subHeader--firstbox-layout']}>
              <div className={styles.versionName}>{version}</div>
              <div className={styles.info}>
                <Badges
                  className={cx(
                    styles['ma__subHeader--firstbox-layout-color'],
                    'text-truncate'
                  )}
                  title={docType}
                />
                <Badges
                  className={cx(
                    styles['ma__subHeader--firstbox-layout-color'],
                    'ml-4',
                    'text-truncate'
                  )}
                  title={modelName}
                />
                <Badges
                  className={cx(
                    styles['ma__subHeader--firstbox-layout-pcolor'],
                    'ml-4',
                    'text-truncate'
                  )}
                  title='Train Data'
                />
              </div>
            </div>
            <ListHeader
              onScroll={this.onScrollTable}
              id='head'
              documentTypesColumnStructure={this.documentTypesColumnStructure}
            />
          </div>
          <div className={styles['ma__subHeader--secondbox']}>
            <div className={styles['ma__subHeader--firstbox-layout']}>
              <div className={styles.versionName}>{version}</div>
              <div className={styles.info}>
                <Badges
                  className={cx(
                    styles['ma__subHeader--secondbox-layout-color'],
                    'text-truncate'
                  )}
                  title={docType}
                />
                <Badges
                  className={cx(
                    styles['ma__subHeader--secondbox-layout-color'],
                    'ml-4',
                    'text-truncate'
                  )}
                  title={modelName}
                />
                <Badges
                  className={cx(
                    styles['ma__subHeader--secondbox-layout-pcolor'],
                    'ml-4',
                    'text-truncate'
                  )}
                  title='Test Data'
                />
              </div>
            </div>
            <ListHeader
              onScroll={this.onScrollTable}
              documentTypesColumnStructure={this.documentTypesColumnStructure}
            />
          </div>
        </div>
        {/* Content */}
        <PageScrollableContent className={styles.scrollableContent}>
          <div className={styles.Container}>
            <div className={styles.firstContainer}>
              {this.renderTrainDocumentList()}
            </div>
            <div className={styles.secondContainer}>
              {this.renderTestDocumentList()}
            </div>
          </div>
        </PageScrollableContent>
      </div>
    );
  }
}
function mapStateToProp(state) {
  const { singleView, modelPage } = state.model;
  const { user, config } = state.app;

  return {
    singleView,
    modelPage,
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
