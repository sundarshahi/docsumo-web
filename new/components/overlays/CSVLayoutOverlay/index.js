/* eslint-disable no-debugger */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as csvActions } from 'new/redux/csv/actions';
import { showToast } from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import {
  Cancel,
  Check,
  EditPencil,
  Plus,
  Trash,
  UploadSquare,
} from 'iconoir-react';
import _ from 'lodash';
import * as api from 'new/api';
import { PageFooter } from 'new/components/layout/page';
import DeleteConfirmationModal from 'new/components/modals/DeleteConfirmationModal/DeleteConfirmationModal';
import ROUTES from 'new/constants/routes';
import { chameleonIdentifyUser } from 'new/thirdParty/chameleon';
import Button from 'new/ui-elements/Button/Button';
import Checkbox from 'new/ui-elements/Checkbox/Checkbox';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Pagination from 'new/ui-elements/Pagination';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import * as utils from 'new/utils';
import queryString from 'query-string';

import TableView from './components/TableView';
import UpdateModal from './components/UpdateModal';

import styles from './index.scss';
class CSVLayoutOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditingName: false,
      isUpdatingName: false,
      uiNameValue: '',
      uiNameError: '',
      deleteConfirmation: {},
      deleteLoading: false,
    };
    this.nameInputRef = React.createRef();
  }
  UNSAFE_componentWillMount() {}

  async componentDidMount() {
    const { location, documentIds, match } = this.props;
    const pageQueryParams = this.getValidPageQueryParams(
      _.get(this.props, 'location.search')
    );

    this.updateParamStateKeys({
      pageQueryParams,
    });
    let currentCSVDocId = _.get(match, 'params.docId');
    let title = _.get(location, 'state.title');
    if (currentCSVDocId && _.isEmpty(documentIds)) {
      await this.props.csvActions.csvFetch({
        queryParams: {
          q: '',
          offset: '',
          sort_by: '',
        },
      });

      await this.props.csvActions.openTableView({
        ddId: currentCSVDocId,
        queryParams: {
          ...pageQueryParams,
        },
      });
      this.setState({
        uiNameValue: title && title.split('.').slice(0, -1).join('.'),
      });
    } else {
      const {
        currentDocument: { title },
      } = this.props;
      this.setState({
        uiNameValue: title && title.split('.').slice(0, -1).join('.'),
      });
    }

    const { user, config } = this.props;

    chameleonIdentifyUser(user, config);
  }
  getValidPageQueryParams = _.memoize((locationSearch) => {
    return utils.getValidPageQueryParams(locationSearch, {
      offset: {
        type: 'number',
        default: 0,
      },
    });
  });
  async componentDidUpdate(prevProps, prevState) {
    const { isEditingName } = this.state;

    const { isEditingName: prevIsEditingName } = prevState;

    if (isEditingName && isEditingName !== prevIsEditingName) {
      // Focus name input
      if (this.nameInputRef && this.nameInputRef.current) {
        this.nameInputRef.current.focus();
      }
    }
    const { documentsById, meta, history, match } = this.props;
    const { documentsById: prevDocumentsById } = prevProps;
    if (documentsById !== prevDocumentsById) {
      const currentDocument =
        documentsById[this.props.match.params.docId] || {};
      const { title } = currentDocument;
      this.setState({
        uiNameValue: title && title.split('.').slice(0, -1).join('.'),
      });
    }
    if (prevProps.datas !== this.props.datas) {
      const { modify } = this.state;
      if (modify) {
        if (meta.total === 0) {
          const params = {};
          history.push(`${match.url}?${queryString.stringify(params)}`);
        } else if (meta.offset === meta.total) {
          let offset = meta.offset - 20;
          const params = {
            offset: offset,
          };
          history.push(`${match.url}?${queryString.stringify(params)}`);
        } else if (meta.limit + meta.offset < meta.total) {
          let offset = meta.offset + 20;
          const params = {
            offset: offset,
          };
          history.push(`${match.url}?${queryString.stringify(params)}`);
        }
        this.setState({ modify: false });
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const nextLocation = nextProps.location;
    const { location, history, meta, match } = this.props;

    if (!meta || _.isEmpty(meta)) {
      return;
    }

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
    if (nextLocation.state && nextLocation.state.forceReload) {
      history.replace(`${match.url}`);
      this.updateParamStateKeys({
        pageQueryParams: {},
      });
      this.fetchDocuments({});
      return;
    }

    if (paramsChanged) {
      this.updateParamStateKeys({
        pageQueryParams: nextPageQueryParams,
      });
      this.fetchDocuments(nextPageQueryParams);
    }
  }

  updateParamStateKeys = ({ pageQueryParams, queryParamSortValues } = {}) => {
    if (!pageQueryParams) {
      pageQueryParams = this.getValidPageQueryParams(
        this.props.location.search
      );
    }

    if (!queryParamSortValues) {
      queryParamSortValues =
        utils.getQueryParamSortValuesAsObject(pageQueryParams);
    }

    this.setState({
      pageQueryParams,
      queryParamSortValues,
    });

    return {
      pageQueryParams,
      queryParamSortValues,
    };
  };

  fetchDocuments = (pageQueryParams) => {
    let queryParams = {
      ...pageQueryParams,
    };
    const { currentCSVDocId } = this.props;
    this.props.csvActions.getUpdatedTableView({
      ddId: currentCSVDocId || this.props.match.params.docId,
      queryParams,
    });
    this.setState({
      fetched: true,
    });
  };

  handleFieldFocus = ({ fieldId }) => {
    this.props.csvActions.fieldFocus({
      fieldId,
    });
  };

  onKeyDown = (e, docId) => {
    if (e.key === 'Enter') {
      this.handleTitleSubmit(e, docId);
    }
  };
  handleTitleSubmit = async (e, docId) => {
    e.preventDefault();
    const { uiNameValue, isUpdatingName } = this.state;

    if (isUpdatingName) {
      return;
    }

    if (_.isEmpty(uiNameValue.trim())) {
      this.setState({
        uiNameError: 'Please enter title',
      });
      return;
    }

    this.setState({
      isUpdatingName: true,
      uiNameError: '',
    });

    try {
      const response = await api.updateCSVTitle({
        payload: {
          title: uiNameValue,
          docId,
        },
      });
      const document = _.get(response, 'responsePayload');
      const { statusCode } = document;
      if (statusCode === 200) {
        this.setState({
          isEditingName: false,
          isUpdatingName: false,
          uiNameValue,
        });
      }
    } catch (e) {
      showToast({ title: 'Failed to update title', error: true });
      this.setState({
        isUpdatingName: false,
        uiNameError: '',
      });
    }
  };

  handleNameInputChange = (e) => {
    const value = e.target.value;
    this.setState({
      uiNameValue: value,
      uiNameError: '',
    });
  };
  handleNameEditButtonClick = (e) => {
    e.preventDefault();
    this.setState({
      isEditingName: true,
      isUpdatingName: false,
      uiNameError: '',
    });
  };

  closeTableViewScreen = () => {
    const { csvActions, history } = this.props;
    history.push(ROUTES.DATABASE_TABLES);

    csvActions.storeCSVDocumentId({ currentCSVDocId: null });
  };

  handleCheckboxChange = ({ target }) => {
    const { checked } = target;
    const { csvActions } = this.props;
    csvActions.setTableCheckBoxSelectionAll({
      checked: checked,
    });
  };

  handleSelectionDocList = ({ target }) => {
    const { checked: optionChecked, value } = target;
    let checkboxValue = Number(value);
    const { selectedList = [], csvActions } = this.props;
    const included = selectedList.includes(checkboxValue);
    if (optionChecked && !included) {
      csvActions.setTableCheckBoxSelectionIndividual({
        checked: [...selectedList, checkboxValue],
      });
    } else if (!optionChecked && included) {
      const result = selectedList.filter((e) => e !== checkboxValue);
      csvActions.setTableCheckBoxSelectionIndividual({
        checked: [...result],
      });
    }
  };

  getDocIdList = () => {
    const { selectedList = [] } = this.props;
    const bifurcateBy = (arr) => {
      return arr.reduce((acc, val) => (acc.push(val), acc), []);
    };

    const Ids = bifurcateBy(selectedList);

    return {
      ids: Ids,
    };
  };

  handleSelectedDelete = async () => {
    const { appActions, csvActions, currentCSVDocId } = this.props;
    const result = this.getDocIdList();
    const pageQueryParams = this.getValidPageQueryParams(
      _.get(this.props, 'location.search')
    );
    this.setState({
      deleteLoading: true,
    });
    try {
      await api.deleteCsvRow({
        ...result,
        ddId: currentCSVDocId || this.props.match.params.docId,
      });
      csvActions.setTableCheckBoxSelectionAll({
        checked: false,
      });
      csvActions.setTableCheckBoxSelectionIndividual({
        checked: [],
      });
      this.handleCancelConfirmation();
      appActions.setToast({
        title: 'Row Deleted',
        success: true,
      });
      this.setState({ deleteConfirmation: {}, modify: true });
    } finally {
      this.setState({
        deleteLoading: false,
      });
    }
    this.fetchDocuments(pageQueryParams);
  };

  handleGetConfirmation = () => {
    const { ids = [] } = this.getDocIdList();
    const { selectedList = [], appActions } = this.props;
    if (!selectedList.length) {
      appActions.setToast({
        title: 'Please select at least one row.',
        error: true,
      });
      return;
    }

    this.setState({
      deleteConfirmation: {
        docs: ids.length,
      },
    });
  };

  handleCancelConfirmation = () => {
    this.setState({ deleteConfirmation: {} });
  };

  handleAddline = async () => {
    const { currentCSVDocId, appActions, meta, match, history } = this.props;
    this.setState({
      isAddingLine: true,
    });
    const pageQueryParams = this.getValidPageQueryParams(
      _.get(this.props, 'location.search')
    );
    try {
      await api.addCsvRowLine({
        ddId: currentCSVDocId || this.props.match.params.docId,
      });
      appActions.setToast({
        title: 'Row Added',
        success: true,
      });
      if (meta.limit + meta.offset >= meta.total) {
        this.fetchDocuments(pageQueryParams);
      }
      setTimeout(() => {
        if (meta.total > 0) {
          const totalPageCount = Math.ceil(meta.total / meta.limit);
          const offset = meta.limit * (totalPageCount - 1);
          const params = {
            offset: offset,
          };
          history.push(`${match.url}?${queryString.stringify(params)}`);
        }
      }, 100);
      this.setState({ modify: true });
    } catch (e) {
      appActions.setToast({
        title:
          e?.responsePayload?.error ||
          e?.responsePayload?.message ||
          'Something went wrong!',
        error: true,
      });
    } finally {
      this.setState({
        isAddingLine: false,
      });
    }
  };

  handleCloseUpdateModal = () => {
    this.setState({
      updateRow: false,
    });
  };

  handleOpenUpdateModal = () => {
    this.setState({
      updateRow: true,
    });
  };

  handleFieldUpdate = async ({ id, header, value }) => {
    const pageQueryParams = this.getValidPageQueryParams(
      _.get(this.props, 'location.search')
    );
    const { currentCSVDocId } = this.props;
    try {
      await api.updateCsvField({
        ddId: currentCSVDocId || this.props.match.params.docId,
        id,
        header,
        value,
      });
    } catch (e) {
      //do nothing
    }
    this.fetchDocuments(pageQueryParams);
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

  render() {
    const {
      updateRow,
      isEditingName,
      uiNameValue,
      isUpdatingName,
      deleteConfirmation,
      deleteLoading,
      isAddingLine,
    } = this.state;
    const {
      currentCSVDocId,
      selectedAll,
      selectedList = [],
      datas,
    } = this.props;
    const { docs } = deleteConfirmation;
    const hasDocuments = !_.isEmpty(datas);
    const showDocumentList = hasDocuments;
    const showPagination = !!showDocumentList;
    return (
      <div className={styles.root}>
        <div className={styles.header}>
          <div
            className={cx(
              styles.title,
              uiNameValue?.length <= 50
                ? styles['title--small-width']
                : styles['title--large-width']
            )}
          >
            {!isEditingName ? (
              <h1
                className={cx(
                  styles.titleText,
                  uiNameValue.length > 50 && styles['title--large-width']
                )}
              >
                {uiNameValue}
              </h1>
            ) : (
              <input
                value={uiNameValue}
                onChange={this.handleNameInputChange}
                onKeyDown={(e) => this.onKeyDown(e, currentCSVDocId)}
                ref={this.nameInputRef}
                className={styles.input}
              />
            )}
            {isEditingName ? (
              <IconButton
                variant={'text'}
                icon={Check}
                isLoading={isUpdatingName}
                iconClassName={styles.icon}
                onClick={(e) => this.handleTitleSubmit(e, currentCSVDocId)}
              >
                Check
              </IconButton>
            ) : (
              <IconButton
                variant={'text'}
                icon={EditPencil}
                iconClassName={styles.icon}
                onClick={this.handleNameEditButtonClick}
              >
                Edit
              </IconButton>
            )}
          </div>
          <div className={styles.rightBox}>
            <IconButton
              variant={'text'}
              icon={Cancel}
              iconClassName={styles.action_icon}
              onClick={this.closeTableViewScreen}
            >
              Close
            </IconButton>
          </div>
        </div>
        <div className={styles.headerActionBox}>
          <div className={styles.leftActionBox}>
            <Checkbox
              name={'selectAll'}
              checked={selectedAll || false}
              onChange={this.handleCheckboxChange}
            />

            <div className={styles.action_box}>
              <Tooltip label='Delete'>
                <IconButton
                  variant='ghost'
                  colorScheme='danger'
                  icon={<Trash />}
                  onClick={this.handleGetConfirmation}
                >
                  Delete
                </IconButton>
              </Tooltip>
            </div>
          </div>
          <div className={styles.rightActionBox}>
            <Button
              variant='outlined'
              icon={Plus}
              isLoading={isAddingLine}
              size='small'
              onClick={this.handleAddline}
            >
              Add Line
            </Button>
            <Button
              variant='contained'
              icon={UploadSquare}
              size='small'
              onClick={this.handleOpenUpdateModal}
            >
              Update
            </Button>
          </div>
        </div>

        <div className={styles.container}>
          <div className={styles.tableView}>
            <TableView
              handleSelectionDocList={this.handleSelectionDocList}
              selectedDocuments={selectedList}
              handleFieldUpdate={this.handleFieldUpdate}
              handleFieldFocus={this.handleFieldFocus}
            />
          </div>
          {showPagination ? (
            <PageFooter className={styles.footer}>
              {this.renderPagination()}
            </PageFooter>
          ) : null}
        </div>
        <DeleteConfirmationModal
          show={docs}
          onCloseHandler={this.handleCancelConfirmation}
          handleDeleteBtnClick={this.handleSelectedDelete}
          modalTitle='Delete Rows'
          isLoading={deleteLoading}
          modalBody={`Are you sure you want to delete ${docs || ''} csv row?`}
        />
        {updateRow ? (
          <UpdateModal onCloseBtnClick={this.handleCloseUpdateModal} />
        ) : (
          ''
        )}
      </div>
    );
  }
}

function mapStateToProp(state) {
  const {
    currentCSVDocId,
    documentsById,
    tableView,
    csvPage: { documentIds },
  } = state.csv;

  const { user, config } = state.app;

  const { selectedAll, selectedList, datas, meta } = tableView;

  const currentDocument = currentCSVDocId && documentsById[currentCSVDocId];

  return {
    currentCSVDocId,
    currentDocument,
    documentsById,
    selectedAll,
    documentIds,
    selectedList,
    datas,
    meta,
    user,
    config,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    csvActions: bindActionCreators(csvActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(CSVLayoutOverlay)
);
