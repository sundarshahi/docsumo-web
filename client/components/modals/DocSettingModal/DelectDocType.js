import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';

import cx from 'classnames';
import * as api from 'client/api';
import routes from 'client/constants/routes';
import { ReactComponent as CheckIcon } from 'images/icons/check.svg';
import { ReactComponent as CloseIcon } from 'images/icons/clear.svg';
import { ReactComponent as DeleteIcon } from 'images/icons/deletedoc.svg';
import { ReactComponent as RefreshIcon } from 'images/icons/refresh.svg';

import ConfirmationModal from 'components/shared/FiledConfirmationModal';

import styles from './inputBox.scss';

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
            //dropDownValue:label || option && option[0].label,
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
          <div className={cx(styles.generalMainField, fieldClassName)}>
            <label htmlFor={label}>
              {label}
              <p className={styles.helpText}>
                {helpText}{' '}
                {link ? (
                  <a target='_blank' rel='noopener noreferrer' href={link}>
                    Learn more
                  </a>
                ) : null}
              </p>
            </label>

            <div className={styles.inputWrap}>
              <input
                id={label}
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
          <div className={cx(styles.generalSubField, fieldClassName)}>
            <label htmlFor={label}>
              {label}
              <p className={styles.helpText}>
                {helpText}{' '}
                {link ? (
                  <a target='_blank' rel='noopener noreferrer' href={link}>
                    Learn more
                  </a>
                ) : null}
              </p>
            </label>

            <button
              className={cx(
                'unstyled-btn',
                {
                  [styles.deleteDocType]: uiValue === 'Delete',
                },
                { [styles.resetDocType]: uiValue === 'Reset' }
              )}
              // eslint-disable-next-line no-console
              onClick={() => this.handleDeleteDocType()}
              disabled={!deletable}
            >
              {uiValue === 'Delete' ? (
                <DeleteIcon className={styles.icon} />
              ) : (
                <RefreshIcon className={styles.icon} />
              )}
              <p className={styles.label}>{uiValue}</p>
            </button>
            {checkConfirm ? (
              <ConfirmationModal
                title={'Confirm Changes'}
                bodyText={
                  uiValue === 'Delete'
                    ? 'Are you sure you want to delete this document type?'
                    : 'Are you sure you want to reset this document type?'
                }
                proceedActionText='Approve'
                processIcon={CheckIcon}
                cancelIcon={CloseIcon}
                cancelActionText='Cancel'
                onProceedActionBtnClick={() =>
                  uiValue === 'Delete'
                    ? this.handleDelete()
                    : this.handleReset()
                }
                onCancelActionBtnClick={() => this.checkBtn(false)}
                onCloseBtnClick={() => this.checkBtn(false)}
                processingBtn={confirmLoading}
              />
            ) : (
              ''
            )}
          </div>
        )}
      </Fragment>
    );
  }
}

export default withRouter(DeleteDocType);
