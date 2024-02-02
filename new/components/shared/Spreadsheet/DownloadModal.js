import React, { useState } from 'react';

import cx from 'classnames';
import { Page, PageFlip, Table2Columns } from 'iconoir-react';
import { ModalContent, ModalHeader } from 'new/components/shared/Modal';
import Spinner from 'new/ui-elements/Spinner/Spinner';
import Modal from 'react-responsive-modal';

import styles from './downloadModal.scss';

const DownloadModal = (props) => {
  const { isOpen, handleCloseBtnClick, handleDownloadBtnClick, isDownloading } =
    props;
  const [downloadType, setDownloadType] = useState('');

  const handleDownloadClick = (type = '') => {
    setDownloadType(type);
    handleDownloadBtnClick(type);
  };

  return (
    <Modal
      classNames={{
        modal: cx(styles.modal),
        overlay: styles.overlay,
      }}
      open={!!isOpen}
      center={true}
      showCloseIcon={false}
      closeOnEsc={false}
      onOverlayClick={handleCloseBtnClick}
    >
      <ModalHeader
        title={'Download'}
        titleClassName={cx('ellipsis', styles.title)}
        className={styles.header}
        showCloseBtn={true}
        onCloseBtnClick={handleCloseBtnClick}
      />

      <ModalContent>
        <div className={cx(styles.download)}>
          <button
            className={styles.download__col}
            onClick={() => handleDownloadClick('original_file')}
          >
            <div className={styles.download__iconWrap}>
              {downloadType === 'original_file' && isDownloading ? (
                <Spinner />
              ) : (
                <Page />
              )}
            </div>
            <span className={styles.download__label}>File</span>
          </button>

          <button
            className={styles.download__col}
            onClick={() => handleDownloadClick('excel')}
          >
            <div className={styles.download__iconWrap}>
              {downloadType === 'excel' && isDownloading ? (
                <Spinner />
              ) : (
                <Table2Columns />
              )}
            </div>
            <span className={styles.download__label}>XLS</span>
          </button>

          <button
            className={styles.download__col}
            onClick={() => handleDownloadClick('json')}
          >
            <div className={styles.download__iconWrap}>
              {downloadType === 'json' && isDownloading ? (
                <Spinner />
              ) : (
                <PageFlip />
              )}
            </div>
            <span className={styles.download__label}>JSON</span>
          </button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default DownloadModal;
