import React, { Component } from 'react';

import cx from 'classnames';
import { Cancel } from 'iconoir-react';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Modal from 'new/ui-elements/Modal/Modal';

import styles from './index.scss';

class VersionSelectModal extends Component {
  state = {
    versionData: [],
  };

  UNSAFE_componentWillMount() {
    const { versionData = [], value = '' } = this.props;
    this.setState({
      versionData,
    });
    const activeTab = versionData.find((item = {}) => {
      if (item.uid === value) return item.uid;
    });
    if (activeTab) {
      this.setActiveTab(activeTab.uid);
    } else {
      this.setActiveTab('v1');
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.versionData !== this.props.versionData) {
      this.setState({
        versionData: this.props.versionData,
      });
    }
  }

  displayContent = (activeTab) => {
    const { versionData } = this.state;
    let data = versionData.find((item) => item.uid === activeTab);
    let displayData = '';
    if (data) {
      displayData = JSON.stringify(data?.data, null, 4);
    } else {
      displayData = 'Nothing to show.';
    }
    return (
      <pre>
        <code>{displayData}</code>
      </pre>
    );
  };

  setActiveTab = (activeTab) => {
    this.setState({ activeTab: activeTab });
  };

  handleTabClick = (e, uid) => {
    e.preventDefault();
    this.setState({
      activeTab: uid,
    });
  };

  handleSelectOption = () => {
    const { onProceedActionBtnClick, onCloseBtnClick } = this.props;
    const { activeTab } = this.state;
    onProceedActionBtnClick(activeTab);
    onCloseBtnClick();
  };

  render() {
    const { activeTab } = this.state;
    const { versionData, onCancelActionBtnClick } = this.props;

    return (
      <Modal
        onCloseHandler={this.handleCloseBtnClick}
        show={true}
        animation='fade'
        size='lg'
      >
        <div className={styles.versionSelect}>
          <div className={cx('p-4', styles.versionSelect__header)}>
            <p className='heading-6 font-weights-bold'>Versions</p>
            <div className={styles.versionSelect__close}>
              <div className={styles.versionSelect__space}></div>
              <IconButton
                onClick={onCancelActionBtnClick}
                icon={Cancel}
                variant='ghost'
                className={cx(styles.iconBtn)}
              />
            </div>
          </div>
          <div className={styles.versionSelectRoot}>
            <div className={styles.leftContainer}>
              <div className={styles.leftContainer__navigation}>
                {versionData.map(({ label, uid }, i) => (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                  <div
                    key={`${uid}-${i}`}
                    role='button'
                    tabIndex={i}
                    className={cx(
                      styles.tab,
                      {
                        [styles.active]: activeTab === uid,
                      },
                      'py-3',
                      'px-4'
                    )}
                    onClick={(e) => this.handleTabClick(e, uid, label)}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <div className={cx(styles.rightContainer, 'p-6')}>
              <div className={styles.rightContainer__content}>
                {activeTab ? this.displayContent(activeTab) : null}
              </div>
            </div>
          </div>
          <div className={cx(styles.versionSelect__footer, 'py-4', 'px-6')}>
            <Button
              variant='outlined'
              size='small'
              className='mr-4'
              onClick={onCancelActionBtnClick}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              size='small'
              onClick={() => this.handleSelectOption()}
            >
              Select & Close
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
}

export default VersionSelectModal;
