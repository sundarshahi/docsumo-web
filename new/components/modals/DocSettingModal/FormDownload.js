import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import download from 'downloadjs';
import { Download } from 'iconoir-react';
import _ from 'lodash';
import * as api from 'new/api';
import Button from 'new/ui-elements/Button/Button';

import styles from './formDownload.scss';

class FormDownload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uiValue: [],
      isDownloading: false,
    };
  }
  UNSAFE_componentWillMount() {
    const { value } = this.props;
    {
      value || value === 0
        ? this.setState({
            uiValue: value,
          })
        : null;
    }
  }

  handleInputChange = (e) => {
    this.setState({
      uiValue: e.target.value,
    });
  };
  handleDownloadBtnClick = async (type) => {
    const { appActions, docType } = this.props;
    this.setState({
      format: type,
      isDownloading: true,
    });
    appActions.setToast({
      title: 'Downloading...',
      duration: 4000,
    });
    try {
      const { responsePayload } = await api.downlaodMultiDocs({
        doc_type: docType,
        type: type,
      });
      const downloadUrl = _.get(responsePayload, 'data.downloadUrl');
      download(downloadUrl);
    } catch (e) {
      appActions.setToast({
        title: e.responsePayload.error,
        error: true,
      });
    } finally {
      this.setState({
        format: null,
        isDownloading: false,
      });
    }
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
  render() {
    const { label, helpText, fieldClassName, link } = this.props;
    const { uiValue, isDownloading, format } = this.state;
    return (
      <Fragment>
        <div className={cx(styles.formDownload, fieldClassName, 'mb-8')}>
          <label className={cx(styles.formDownload__label)} htmlFor={label}>
            {label}
            <p className={cx(styles['formDownload__label--helper'], 'mt-1')}>
              {helpText}{' '}
              {link ? (
                <a target='_blank' rel='noopener noreferrer' href={link}>
                  Learn More
                </a>
              ) : null}
            </p>
          </label>
          <div className={styles.inputWrap}>
            <Button
              className='mr-4'
              size='small'
              isLoading={format === 'json' ? isDownloading : null}
              icon={Download}
              variant='outlined'
              onClick={() => this.handleDownloadBtnClick('json')}
            >
              {uiValue[0]}
            </Button>
            <Button
              isLoading={format === 'csv_long' ? isDownloading : null}
              icon={Download}
              size='small'
              variant='outlined'
              onClick={() => this.handleDownloadBtnClick('csv_long')}
            >
              {uiValue[1]}
            </Button>
          </div>
        </div>
      </Fragment>
    );
  }
}

function mapStateToProp() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(FormDownload);
