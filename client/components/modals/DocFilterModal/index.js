import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { actions as documentActions } from '@redux/documents/actions';
import { bindActionCreators } from 'redux';

import { ReactComponent as CancelIcon } from 'images/icons/clear.svg';
import _ from 'lodash';
import Modal from 'react-responsive-modal';

import { ModalContent } from 'components/shared/Modal';
import { Cell, Row } from 'components/shared/tabularList';
import { Button } from 'components/widgets/buttons';

import InputBox, { InputTags } from './InputBox';
import NewDropDown, { AddNewFilterDropdown } from './NewDropDown';
import RadioButton from './RadioButton';

import styles from './index.scss';

class DocFilterModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filtersContainer: [],
      filterList: [],
      conditionalFilters: [],
      additionalFiltersList: [],
      conditionalFilterList: [],
      textValue: '',
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { field } = nextProps;
    if (this.props !== nextProps) {
      this.setState(
        {
          filterContainer: {
            basicFilters:
              (field && field.filters && field.filters.basicFilters) ||
              (field && field.newFilters && field.newFilters.basicFilters),
            additionalFilters:
              field && field.filters && field.filters.additionalFilters,
          },

          additionalFiltersList:
            field && field.newFilters && field.newFilters.additionalFilters,
          conditionalFilters:
            field && field.newFilters && field.newFilters.conditionalFilters,

          filterList: [],
        },
        () => {
          const { filterList } = this.state;
          let filters = [];
          this.state.filterContainer &&
            Object.entries(this.state.filterContainer).map((filterObj) => {
              filterObj[1] &&
                filterObj[1].map((filter) => {
                  filters = [
                    ...filters,
                    ...filter.options.map(({ id, label, value }) =>
                      !_.find(filterList, {
                        id: id,
                      })
                        ? {
                            id,
                            label,
                            p_id: filter.id,
                            p_title: filter.title,
                            value,
                          }
                        : null
                    ),
                  ];
                });
            });
          filters = filters.filter((val) => val != null);
          const data = [...filterList, ...filters];
          this.setState({
            filterList: data,
          });
        }
      );
    }
  }

  handleCloseBtnClick = () => {
    const {
      documentActions,
      field: { id: fieldId },
    } = this.props;
    documentActions.rtHideFilterInField({ fieldId });
    this.setState({
      filterList: [],
      filterContainer: [],
    });
  };

  setConditionalFilters = () => {
    const {
      conditionalFilterList,
      conditionalFilters,
      additionalFiltersList = [],
    } = this.state.conditionalFilterList;
    conditionalFilterList &&
      conditionalFilterList.map((idx) => {
        const conditionalFilter = _.find(conditionalFilters, {
          id: idx,
        });
        additionalFiltersList && additionalFiltersList.push(conditionalFilter);
        this.setState({
          additionalFiltersList,
        });
      });
  };

  setConditionalFilterList = ({ condition }) => {
    const conditionalFilterList = this.state.conditionalFilterList || [];
    condition.map((idx) => {
      conditionalFilterList.push(idx);
    });
    this.setConditionalFilters();
  };

  removeConditionalFilter = ({ condition }) => {
    const { conditionalFilterList, conditionalFilters, additionalFiltersList } =
      this.state.conditionalFilterList;
    conditionalFilterList.map((idx) => {
      const conditionalFilter = _.find(conditionalFilters, { id: idx });
      this.setState({
        additionalFiltersList: additionalFiltersList.filter(
          (filter) => filter.id !== conditionalFilter.id
        ),
      });
    });
    condition.map((idx) =>
      this.setState({
        conditionalFilterList: conditionalFilterList.filter((id) => id !== idx),
      })
    );
  };

  handleFilterSubmit = () => {
    const {
      docType,
      field: { uiValue, id },
      documentActions,
      docId,
    } = this.props;
    documentActions.rtAdditionalFilter({
      docType,
      docId,
      id,
      filters: this.state.filterList,
      value: uiValue,
    });
  };

  handleChangedValueSubmit = ({ uiValue, id }) => {
    const { filterList } = this.state;
    const idx = _.findIndex(filterList, { id: id });
    filterList[idx] = {
      ...filterList[idx],
      value: uiValue,
    };
    this.setState(
      {
        filterList,
      },
      () => {
        this.handleFilterSubmit();
      }
    );
  };

  handleDeleteFilter = ({ id }) => {
    const { filterList } = this.state;
    const updatedFilter = filterList.filter((option) => option.p_id !== id);
    this.setState(
      {
        filterList: updatedFilter,
      },
      () => {
        this.handleFilterSubmit();
      }
    );
  };

  handleAdditionalFilterSubmit = (item) => {
    const filters = item.options.map(({ id, label, value }) => {
      return (
        !_.find(this.state.filterList, { id: id }) && {
          id,
          label,
          p_id: item.id,
          p_title: item.title,
          value,
        }
      );
    });
    filters[0] &&
      this.setState(
        {
          filterList: [...this.state.filterList, ...filters],
        },
        () => {
          this.handleFilterSubmit();
        }
      );
  };

  render() {
    const { field } = this.props;
    const additionalFiltersList = this.state.additionalFiltersList;
    return (
      <Fragment>
        <Modal
          classNames={{
            overlay: styles.overlay,
            modal: styles.modal,
            closeButton: styles.closeButton,
            closeIcon: styles.closeIcon,
          }}
          open={false || false}
          center={true}
          closeOnEsc={false}
          closeOnOverlayClick
          onClose={this.handleCloseBtnClick}
        >
          <Row className={styles.header}>
            <p>Add Filters</p>
          </Row>
          <Row className={styles.headerContent}>
            Document Type:<p>{this.props.docType}</p>
          </Row>

          {this.state.filterContainer &&
            Object.entries(this.state.filterContainer).map(
              (filterObj) =>
                filterObj[1] &&
                filterObj[1].map((filter, key) => {
                  return (
                    <Fragment key={key}>
                      <ModalContent className={styles.container}>
                        <Cell className={styles.containerCell}>
                          {filterObj[0] !== 'basicFilters' && (
                            <Button
                              iconLeft={CancelIcon}
                              className={styles.buttonIcon}
                              iconClassName={styles.iconBtn}
                              onClick={() =>
                                this.handleDeleteFilter({
                                  id: filter.id,
                                })
                              }
                            />
                          )}
                          <Row className={styles.filterRow}>
                            <Cell className={styles.childValue}>
                              Start Value &nbsp; :
                            </Cell>
                            <Cell>{filter.start_value || field.uiValue}</Cell>
                          </Row>
                          {filter.options &&
                            filter.options.map((option, i) => {
                              return (
                                <Row className={styles.filterRow} key={i}>
                                  <Cell className={styles.childValue}>
                                    {option.label} &nbsp; :
                                  </Cell>

                                  {option.filterType === 'drop_down' && (
                                    <NewDropDown
                                      setConditionalFilterList={
                                        this.setConditionalFilterList
                                      }
                                      id={option.id}
                                      value={option.value}
                                      conditionalFilters={
                                        this.state.conditionalFilters
                                      }
                                      removeConditionalFilter={
                                        this.removeConditionalFilter
                                      }
                                      dropdownTitle='Data Type'
                                      options={option.options}
                                      handleChangedValueSubmit={
                                        this.handleChangedValueSubmit
                                      }
                                    />
                                  )}
                                  {option.filterType === 'input' && (
                                    <InputBox
                                      onInputBlur={
                                        this.handleChangedValueSubmit
                                      }
                                      option={option}
                                      item={filter}
                                      className={styles.input}
                                    />
                                  )}
                                  {option.filterType === 'input_list' && (
                                    <InputTags
                                      option={option}
                                      handleChangedValueSubmit={
                                        this.handleChangedValueSubmit
                                      }
                                    />
                                  )}

                                  {option.filterType === 'radio_botton' && (
                                    <RadioButton
                                      option={option}
                                      handleChangedValueSubmit={
                                        this.handleChangedValueSubmit
                                      }
                                    />
                                  )}
                                </Row>
                              );
                            })}
                          <Row className={styles.filterRow}>
                            <Cell className={styles.childValue}>
                              Result &nbsp; :
                            </Cell>
                            <Cell>{filter.result}</Cell>
                          </Row>
                        </Cell>
                      </ModalContent>
                      <AddNewFilterDropdown
                        options={additionalFiltersList}
                        handleMenuItemClick={this.handleAdditionalFilterSubmit}
                      />
                    </Fragment>
                  );
                })
            )}
        </Modal>
      </Fragment>
    );
  }
}

function mapStateToProp(state) {
  const { fieldsById, docId } = state.documents.reviewTool;
  const { fieldId, docType } = state.documents;
  const field = fieldsById[fieldId];
  return {
    field,
    docType,
    docId,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(DocFilterModal);
