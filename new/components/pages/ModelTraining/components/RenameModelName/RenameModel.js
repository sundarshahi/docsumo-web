/* eslint-disable jsx-a11y/no-autofocus */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as modelActions } from 'new/redux/model/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { Cancel, Check } from 'iconoir-react';
import _ from 'lodash';
import * as api from 'new/api';
import IconButton from 'new/ui-elements/IconButton/IconButton';

import styles from './RenameModel.scss';

class RenameModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newModelName: props.value,
    };
  }

  handleChange = (e) => {
    const { value } = e.target;
    this.setState({ newModelName: value });
  };

  handleConfirmEdit = async (e) => {
    e.preventDefault();
    const {
      appActions,
      modelActions,
      currentEditId,
      updateNewModelName,
      value,
    } = this.props;
    const { newModelName } = this.state;

    try {
      const response = await api.renameModel({
        model_id: currentEditId,
        new_model_name: newModelName,
      });
      const { modelTagVerbose = value } = _.get(
        response.responsePayload,
        'data'
      );
      appActions.setToast({
        title: 'Model renamed successfully!',
        success: true,
      });
      modelActions.renameModel({
        modelName: modelTagVerbose,
        renameModelId: currentEditId,
      });
      updateNewModelName();
    } catch (e) {
      let errorMsg =
        _.get(e.responsePayload, 'error') || 'Something went wrong!';
      appActions.setToast({
        title: errorMsg,
        error: true,
      });
    }
  };

  render() {
    const { newModelName } = this.state;
    const { className, currentEditId, resetModelRename } = this.props;

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
              value={newModelName}
              onChange={this.handleChange}
            />
            <IconButton
              type='submit'
              disabled={!newModelName.trim()}
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
              onClick={resetModelRename}
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

function mapStateToProp(state) {
  const { model } = state.model?.modelPage;
  return {
    model,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
    modelActions: bindActionCreators(modelActions, dispatch),
  };
}
export default connect(mapStateToProp, mapDispatchToProps)(RenameModel);
