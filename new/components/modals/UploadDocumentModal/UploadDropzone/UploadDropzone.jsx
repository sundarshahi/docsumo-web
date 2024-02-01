import React from 'react';

import cx from 'classnames';
import { CloudUpload, Trash } from 'iconoir-react';
import * as fileConstants from 'new/constants/file';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Dropzone from 'react-dropzone';

import styles from './UploadDropzone.scss';

const UploadDropzone = ({ files, updateFiles, handleDropAccepted }) => {
  const deleteFile = (file) => {
    const updatedFiles = files.filter((fileItem) => fileItem?.id !== file?.id);
    updateFiles(updatedFiles);
  };

  return (
    <>
      <div className={cx(styles.row, 'row mt-6')}>
        <div className={cx({ 'col-12': !files.length, 'col-7': files.length })}>
          <Dropzone
            accept={fileConstants.SUPPORTED_MIME_TYPES}
            className={styles.uploadDropzone}
            activeClassName={styles['uploadDropzone--active']}
            rejectClassName={styles['uploadDropzone--rejected']}
            onDropAccepted={handleDropAccepted}
          >
            <CloudUpload className={styles.uploadDropzone__icon} />
            <span className={styles.uploadDropzone__text}>
              Drag and drop files here
            </span>
            <span className={styles.uploadDropzone__OR}>OR</span>
            <Button variant='outlined' size='small'>
              Click here to upload
            </Button>
            <p className='text-xs text-center clr-gray-600 mt-4'>
              Supported: JPG, JPEG, PNG, TIFF, PDF, TIF, XLSX, XLS | <br /> File
              size should be maximum 25mb and it shouldn’t be password protected
            </p>
          </Dropzone>
        </div>
        {files.length ? (
          <div className='col-5'>
            <div className={styles.files}>
              {files.map((file) => {
                return (
                  <div className={cx(styles.files__item)} key={file?.id}>
                    <span className='text-truncate w-75'>{file?.name}</span>
                    <IconButton
                      icon={Trash}
                      variant='text'
                      className={styles.files__deleteIcon}
                      colorScheme='danger'
                      size='small'
                      onClick={() => deleteFile(file)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default UploadDropzone;
