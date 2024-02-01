import React, { Component, Fragment } from 'react';

import cx from 'classnames';
import * as api from 'new/api';
import VersionSelectModal from 'new/components/shared/VersionSelectModal';
import Button from 'new/ui-elements/Button/Button';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';

import styles from './versionSelect.scss';

class VersionSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uiValue: '',
      options: [],
      checkConfirm: false,
    };
  }

  UNSAFE_componentWillMount() {
    this.updateUiValue();
    this.fetchTrainVersion();
  }

  fetchTrainVersion = async () => {
    const response = await api.getAutoClassifyVersion();
    this.setState({
      options: response?.responsePayload?.data,
    });
  };

  updateUiValue = () => {
    const { value = '', options = [] } = this.props;
    {
      value || value === 0
        ? this.setState({
            uiValue: value,
          })
        : null;
    }

    this.setState({
      options,
    });
  };

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.updateUiValue();
    }
  }

  openOptions = async () => {
    this.setState({
      checkConfirm: true,
    });

    await this.fetchTrainVersion();
  };

  checkBtn = (checkConfirm = false) => {
    this.setState({ checkConfirm });
  };

  versionSelect = (value) => {
    const { handleChangedValueSubmit } = this.props;
    handleChangedValueSubmit({
      value: value,
    });
  };

  render() {
    const { checkConfirm, uiValue, options } = this.state;
    const version = options.find((item) => item.uid === uiValue);
    return (
      <Fragment>
        <div className={cx(styles.generalSubField)}>
          <div className={styles.generalSubField__header}>
            <span className={styles['generalSubField__header--title']}>
              Choose version
            </span>
          </div>
          <div
            className={cx('d-flex', 'align-items-end', 'flex-direction-column')}
          >
            <Tooltip
              label='There is no previous version. Train to create first version.'
              placement='left'
              showTooltip={!uiValue}
            >
              <Button
                size='small'
                variant='outlined'
                disabled={!uiValue}
                onClick={() => this.openOptions()}
              >
                {!uiValue
                  ? 'Select version'
                  : version?.label || 'Loading version..'}
              </Button>
            </Tooltip>
          </div>
          {checkConfirm ? (
            <VersionSelectModal
              versionData={options}
              value={uiValue}
              onProceedActionBtnClick={this.versionSelect}
              onCancelActionBtnClick={() => this.checkBtn(false)}
              onCloseBtnClick={() => this.checkBtn(false)}
            />
          ) : (
            ''
          )}
        </div>
      </Fragment>
    );
  }
}

export default VersionSelect;
