import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';

import cx from 'classnames';
import { Refresh, Trash } from 'iconoir-react';
import * as api from 'new/api';
import { ReactComponent as CheckIcon } from 'new/assets/images/icons/check.svg';
import { ReactComponent as CloseIcon } from 'new/assets/images/icons/clear.svg';
import DeleteConfirmationModal from 'new/components/modals/DeleteConfirmationModal/DeleteConfirmationModal';
import ConfirmationModal from 'new/components/shared/FiledConfirmationModal';
import routes from 'new/constants/routes';
import Button from 'new/ui-elements/Button/Button';
import Input from 'new/ui-elements/Input/Input';

import styles from './DeleteDocType.scss';
class DeleteDocType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uiValue: '',
      checkConfirm: false,
      confirmLoading: false,
      deletable: true,
    };
  }
  UNSAFE_componentWillMount() {
    const { value, deletable } = this.props;
    {
      value || value === 0
        ? this.setState({
            uiValue: value,
          })
        : null;
    }
    this.setState({
      deletable,
    });
  }

  handleInputChange = (e) => {
    this.setState({
      uiValue: e.target.value,
    });
  };
  handleDeleteDocType = () => {
    this.setState({
      checkConfirm: true,
    });
  };
  checkBtn = (checkConfirm = false) => {
    this.setState({ checkConfirm });
  };

  handleBlur = () => {
    const { handleChangedValueSubmit, id, filterId, type, label } = this.props;
    handleChangedValueSubmit({
      id: id,
      value:
        type === 'number' ? parseInt(this.state.uiValue) : this.state.uiValue,
      filterId: filterId,
      label,
    });
  };
  handleDelete = async () => {
    const { docId, handleCloseBtnClick, docType, history } = this.props;
    this.setState({ confirmLoading: true });
    try {
      await api.deleteDocumentType({
        docId,
        doc_type: docType,
      });
    } finally {
      this.setState({ confirmLoading: false });
      handleCloseBtnClick();
      history.push(routes.ALL);
      history.push(routes.ROOT);
    }
  };
  handleReset = async () => {
    const { handleCloseBtnClick, docType, history, document } = this.props;
    this.setState({ confirmLoading: true });
    const { excelType } = document;
    try {
      await api.resetDocumentType({
        doc_type: docType,
        excel_type: excelType,
      });
    } finally {
      this.setState({ confirmLoading: false });
      handleCloseBtnClick();
      history.push(routes.ROOT);
    }
  };
  render() {
    const {
      className,
      label,
      helpText,
      fieldClassName,
      type,
      mainField,
      link,
    } = this.props;
    const { uiValue, checkConfirm, confirmLoading, deletable } = this.state;
    let placeholder = '';
    switch (label) {
      case 'Round':
        placeholder = '0';
        break;
      case 'Confidence Greater Than':
        placeholder = '%';
        break;
      case 'Confidence Score':
        placeholder = '%';
        break;
      case 'Notification':
        placeholder = 'No. of hours';
        break;
      default:
        placeholder = ' ';
        break;
    }
    return (
      <Fragment>
        {mainField === true ? (
          <div className={cx(styles.deleteType, fieldClassName)}>
            <label className={styles.deleteType__label} htmlFor={label}>
              {label}
              <p className={styles['deleteType__label--helper']}>
                {helpText}{' '}
                {link ? (
                  <a target='_blank' rel='noopener noreferrer' href={link}>
                    Learn more
                  </a>
                ) : null}
              </p>
            </label>

            <div className={styles.inputWrap}>
              <Input
                type={type || 'text'}
                name='name'
                placeholder={placeholder}
                value={uiValue}
                disabled={
                  label === 'Display label' || label === 'Display Label'
                }
                className={cx(styles.input, className)}
                onChange={this.handleInputChange}
                onBlur={this.handleBlur}
              />
            </div>
          </div>
        ) : (
          <div className={cx(styles.deleteType, fieldClassName)}>
            <label className={styles.deleteType__label} htmlFor={label}>
              {label}
              <p className={styles['deleteType__label--helper']}>
                {helpText}{' '}
                {link ? (
                  <a target='_blank' rel='noopener noreferrer' href={link}>
                    Learn more
                  </a>
                ) : null}
              </p>
            </label>

            <Button
              variant='outlined'
              size='small'
              icon={uiValue === 'Delete' ? Trash : Refresh}
              disabled={!deletable}
              onClick={() => this.handleDeleteDocType()}
              className={cx({
                [styles['deleteType--delete']]: uiValue === 'Delete',
              })}
            >
              {uiValue}
            </Button>
            {checkConfirm && uiValue !== 'Delete' ? (
              <ConfirmationModal
                title={'Confirm Changes'}
                bodyText={'Are you sure you want to reset this document type?'}
                proceedActionText='Approve'
                processIcon={CheckIcon}
                cancelIcon={CloseIcon}
                cancelActionText='Cancel'
                onProceedActionBtnClick={this.handleReset}
                onCancelActionBtnClick={() => this.checkBtn(false)}
                onCloseBtnClick={() => this.checkBtn(false)}
                processingBtn={confirmLoading}
              />
            ) : (
              ''
            )}
            <DeleteConfirmationModal
              show={checkConfirm && uiValue === 'Delete'}
              onCloseHandler={() => this.checkBtn(false)}
              handleDeleteBtnClick={this.handleDelete}
              modalTitle='Delete Document Type'
              isLoading={confirmLoading}
              modalBody={'Are you sure you want to delete this document type?'}
            />
          </div>
        )}
      </Fragment>
    );
  }
}

export default withRouter(DeleteDocType);
