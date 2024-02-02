/* eslint-disable jsx-a11y/no-autofocus */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { Cancel, Check } from 'iconoir-react';
import _ from 'lodash';
import * as api from 'new/api';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import { validateFileName } from 'new/utils/validation';

import styles from './RenameFileFolderBox.scss';

class RenameFileFolderBox extends Component {
  state = {
    newValue: '',
  };
  fieldRef = React.createRef();
  timeoutRef = React.createRef();
  componentDidMount() {
    const { originalValue, displayType } = this.props;
    if (this.fieldRef) {
      this.fieldRef.current.focus();
      this.timeoutRef.current = setTimeout(() => {
        this.fieldRef.current.value &&
          this.fieldRef.current.value.length > 25 &&
          this.fieldRef.current.setSelectionRange(0, 0);
      }, 10);
    }

    if (originalValue) {
      if (displayType === 'files') {
        const fileNameArr = originalValue.split('.');
        const fileExtension = fileNameArr.pop();
        this.setState({
          newValue: fileNameArr.join('.'),
          fileExtension,
        });
      } else {
        this.setState({ newValue: originalValue });
      }
    }
  }
  componentWillUnmount() {
    this.timeoutRef.current && clearTimeout(this.timeoutRef.current);
  }
  handleChange = (e) => {
    const { value } = e.target;

    this.setState({ newValue: value });
  };

  handleCancel = () => {
    const { documentActions } = this.props;

    // Reset currentEditId in store
    documentActions.setEditDocId({ docId: '' });
  };

  validateFileName = (fileName) => {
    const { appActions } = this.props;

    const fileNameValidation = validateFileName(fileName);

    if (!fileNameValidation.isValid) {
      appActions.setToast({
        title: fileNameValidation.message,
        error: true,
      });
    }

    return fileNameValidation.isValid;
  };

  handleConfirmEdit = async (e) => {
    e.preventDefault();

    const { newValue, fileExtension } = this.state;
    const { currentEditId, displayType, documentActions, appActions } =
      this.props;

    try {
      if (!this.validateFileName(newValue)) return;

      let value = newValue.trim();

      if (displayType === 'files') {
        const nameArr = value.split('.');

        if (nameArr[nameArr.length - 1] !== fileExtension) {
          value = `${value}.${fileExtension}`;
        }
      }

      const paramKey = displayType === 'folder' ? 'folder_id' : 'doc_id';

      const response = await api.editFileOrFolderName({
        name: value,
        queryParams: {
          [paramKey]: currentEditId,
        },
      });
      const { name } = _.get(response.responsePayload, 'data');

      appActions.setToast({
        title: `${
          displayType === 'folder' ? 'Folder' : 'File'
        } renamed successfully.`,
        success: true,
      });

      documentActions.updateDocName({
        docId: currentEditId,
        name,
      });
      // Reset currentEditId in store
      documentActions.setEditDocId({ docId: '' });
    } catch (e) {
      let errorMsg =
        _.get(e.responsePayload, 'error') ||
        'Something went wrong while renaming.';

      appActions.setToast({
        title: errorMsg,
        error: true,
      });

      // Reset currentEditId in store
      documentActions.setEditDocId({ docId: '' });
    }
  };

  render() {
    const { newValue } = this.state;
    const { className, currentEditId } = this.props;

    if (!currentEditId) return;

    return (
      <div className={cx(styles.wrapper, className)}>
        <form onSubmit={this.handleConfirmEdit}>
          <div className={styles.container}>
            <input
              type='text'
              autoFocus={true}
              className={styles.inputField}
              name='renameFileOrFolder'
              value={newValue}
              onChange={this.handleChange}
              ref={this.fieldRef}
            />
            <IconButton
              type='submit'
              disabled={!newValue.trim()}
              title='Save'
              variant='outlined'
              size='extra-small'
              icon={Check}
              className={cx(styles.ctaButton, styles.ctaButton_primary)}
            />
            <IconButton
              icon={Cancel}
              type='button'
              title='Cancel'
              onClick={this.handleCancel}
              variant='outlined'
              size='extra-small'
              className={cx(styles.ctaButton, styles.ctaButton_secondary)}
            />
          </div>
        </form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { currentEditId } = state.documents;

  return {
    currentEditId,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RenameFileFolderBox);
