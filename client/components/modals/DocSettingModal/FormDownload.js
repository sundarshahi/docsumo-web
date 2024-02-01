import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from '@redux/app/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import * as api from 'client/api';
import download from 'downloadjs';
import { ReactComponent as DownloadIcon } from 'images/icons/download.svg';
import _ from 'lodash';

import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'components/widgets/buttons';

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
            //dropDownValue:label || option && option[0].label,
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
      timeout: 4,
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
    // let placeholder='';
    // switch(label){
    // case 'Round':
    //     placeholder='0';
    //     break;
    // case 'Confidence Greater Than':
    //     placeholder='%';
    //     break;
    // case 'Confidence Score':
    //     placeholder='%';
    //     break;
    // case 'Notification':
    //     placeholder='No. of hours';
    //     break;
    // default:
    //     placeholder=' ';
    //     break;
    // }
    return (
      <Fragment>
        <div className={cx(styles.generalSubField, fieldClassName)}>
          <label htmlFor={label}>
            {label}
            <p className={styles.helpText}>
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
              text={uiValue[0]}
              isLoading={format === 'json' ? isDownloading : null}
              iconLeft={DownloadIcon}
              appearance={BUTTON_APPEARANCES.PRIMARY}
              className={cx(styles.btn)}
              iconClassName={styles.icon}
              onClick={() => this.handleDownloadBtnClick('json')}
            />
            <Button
              text={uiValue[1]}
              isLoading={format === 'csv_long' ? isDownloading : null}
              iconLeft={DownloadIcon}
              appearance={BUTTON_APPEARANCES.PRIMARY}
              className={styles.btn}
              iconClassName={styles.icon}
              onClick={() => this.handleDownloadBtnClick('csv_long')}
            />
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
