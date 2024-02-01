import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { actions as uploadActions } from 'new/redux/upload/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { Cancel } from 'iconoir-react';
import { ArrowRight } from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import * as fileConstants from 'new/constants/file';
import { imageLoader } from 'new/helpers/fileloader';
import { handleFileDrop } from 'new/helpers/upload';
import { useDebounce } from 'new/hooks/useDebounce';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Input from 'new/ui-elements/Input/Input';
import Modal from 'new/ui-elements/Modal';
import Spinner from 'new/ui-elements/Spinner';
import checkFileIntegrity from 'new/utils/checkFileIntegrity';
import { mixpanelTrackingAllEvents } from 'new/utils/mixpanel';
import * as uuid from 'uuid/v4';

import ConfirmationModal from '../ConfirmationModal';

import UploadDropzone from './UploadDropzone';
import UploadMethods from './UploadMethods';

import styles from './UploadDocumentModal.scss';

const UploadDocumentModal = ({
  documentActions,
  appActions,
  showCreateDocumentTypeModal,
  selectedDocumentType,
  hasDocuments,
  uploadActions,
  user,
  config,
}) => {
  const {
    title,
    id,
    type,
    value,
    canCreateDocWithoutUpload,
    showDocumentTypeRenameField,
    showSampleDocProceedField,
    showUploadMethods,
    showBackButton,
    shouldUploadOnDrop,
    hideOverlay,
    label,
  } = selectedDocumentType ?? {};

  const [files, updateFiles] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [inputErrorMessage, setInputErrorMessage] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [docTypeName, setDocTypeName] = useState(title);
  const [isValidatingName, setIsValidatingName] = useState(false);
  const debouncedDocTypeName = useDebounce(docTypeName, 500);

  useEffect(() => {
    setInputErrorMessage('');
    if (title !== docTypeName) {
      setDocTypeName(title || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  useEffect(() => {
    if (!showDocumentTypeRenameField) return;

    const validateDocumentTypeName = async () => {
      setInputErrorMessage('');
      setIsValidatingName(true);
      try {
        const postData = {
          doc_type: value,
          title: debouncedDocTypeName,
        };
        await api.validateDocumentTitle(postData);
      } catch (err) {
        const inputErrorMessage =
          err?.responsePayload?.message ||
          'Unable to validate document type name';
        setInputErrorMessage(inputErrorMessage);
      } finally {
        setIsValidatingName(false);
      }
    };

    validateDocumentTypeName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDocTypeName, showDocumentTypeRenameField]);

  const handleDropAccepted = async (file) => {
    //Vaildation for custom document type file upload
    if (type === 'custom') {
      let hasExceededSizeLimit = false;
      let isValidFile = true;

      for (const fileItem of file) {
        //File size check
        if (fileItem.size > fileConstants.MAXIMUM_FILE_SIZE) {
          hasExceededSizeLimit = true;
          appActions.setToast({
            title: `File ${fileItem.name} exceeds the size limit (35MB).`,
            error: true,
          });
        } else {
          //Check file type
          const allowedType = ['image/png', 'image/jpeg', 'image/tiff'];
          const fileType = fileItem.type;
          if (allowedType.includes(fileType)) {
            // If the file type is allowed, skip the integrity check
            continue;
          }
          // Check file integrity
          try {
            isValidFile = await checkFileIntegrity(fileItem);
          } catch (error) {
            isValidFile = false;
          }

          if (!isValidFile) {
            appActions.setToast({
              title: `File ${fileItem.name} is corrupt or not a valid PDF.`,
              error: true,
            });
            return;
          }
        }
      }

      if (hasExceededSizeLimit || !isValidFile) {
        return;
      }
    }

    if (shouldUploadOnDrop) {
      closeCreateDocumentTypeModal();
      handleFileDrop({
        files: file,
        dropAccepted: true,
        documentType: value,
      });
    } else {
      updateFiles((prevArray) => [
        ...prevArray,
        ...file.map((item) => {
          Object.defineProperty(item, 'id', {
            value: uuid(),
            writable: false,
          });
          return item;
        }),
      ]);
    }
  };

  const handleCloseModal = () => {
    if (files.length) {
      setShowConfirmationModal(true);
    } else {
      appActions.hideDarkOverlay();
      documentActions.displayCreateDocumentTypeModal(false);
      documentActions.selectedService({
        documentTypeModel: {},
      });
    }
  };

  const handleBackButtonClick = () => {
    documentActions.displayCreateDocumentTypeModal(false);
    documentActions.displaySelectDocumentTypeModal(true);
  };

  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
    documentActions.displayCreateDocumentTypeModal(true);
  };

  const handleConfirmBtnClick = () => {
    setShowConfirmationModal(false);
    closeCreateDocumentTypeModal();
  };

  const handleInputChange = (e) => {
    setInputErrorMessage('');
    setDocTypeName(e.target.value);
  };

  const closeCreateDocumentTypeModal = () => {
    documentActions.selectDocumentType(null);
    documentActions.displayCreateDocumentTypeModal(false);
    appActions.hideDarkOverlay();
    documentActions.selectedService({
      documentTypeModel: {},
    });
  };

  const proceedWithSampleDoc = async () => {
    setLoading(true);

    try {
      const responseData = await api.updateStatusServices({
        serviceId: id,
        status: true,
        title: docTypeName,
        uploadSample: true,
      });
      if (responseData) {
        closeCreateDocumentTypeModal();
        documentActions.allDocumentsTypeFetch();
        documentActions.setUploadSampleDocType({
          docType: selectedDocumentType,
        });
        const data = _.get(responseData, 'responsePayload.document', {});
        uploadActions.updateFileDataWithSampleFile(data);

        const { canSwitchToOldMode = true } = config;

        mixpanel.track(MIXPANEL_EVENTS.proceed_with_sample, {
          'work email': user.email,
          'organization ID': user.orgId,
          version: 'new',
          mode: user.mode,
          canSwitchUIVersion: canSwitchToOldMode,
          docType: selectedDocumentType.value,
        });
      }
    } catch (err) {
      appActions.setToast({
        title: err?.responsePayload?.message || err?.error?.message,
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const customDocFlow = async () => {
    const transformedFiles = await Promise.all(
      files.map(async (file) => await imageLoader(file))
    );
    let payload = {
      files,
      transformedFiles,
      title: docTypeName,
    };
    documentActions.customDocTypeEditFieldFlow(payload);
    mixpanelTrackingAllEvents(MIXPANEL_EVENTS.custom_doctype_setupfields, {
      origin: 'Upload Document Modal',
      docType: docTypeName,
    });
    closeCreateDocumentTypeModal();
  };

  const uploadFiles = async () => {
    setLoading(true);
    try {
      let response;
      let documentType = value;

      if (type === 'duplicate') {
        response = await api.duplicateDocumentType({
          doc_type: value,
          title: docTypeName,
        });
      } else if (type === 'custom') {
        response = await api.createDocumentType({
          title: docTypeName,
        });
      } else {
        response = await api.updateStatusServices({
          serviceId: id,
          status: true,
          title: docTypeName,
          uploadSample: false,
        });

        const { canSwitchToOldMode = true } = config;

        mixpanel.track(MIXPANEL_EVENTS.upload_document_type, {
          'work email': user.email,
          'document type': selectedDocumentType.value,
          origin: 'Upload Document Modal',
          version: 'new',
          mode: user.mode,
          canSwitchUIVersion: canSwitchToOldMode,
        });
      }

      if (type === 'duplicate' || type === 'custom') {
        const documents = response?.responsePayload?.data?.document;
        if (documents?.length) {
          documentType = documents[documents.length - 1]?.docType;
        }
      }

      if (response) {
        documentActions.allDocumentsTypeFetch();
        closeCreateDocumentTypeModal();
        handleFileDrop({
          files: files,
          dropAccepted: true,
          documentType: documentType,
        });
      }
    } catch (err) {
      appActions.setToast({
        title: err?.responsePayload?.message || err?.error?.message,
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        show={showCreateDocumentTypeModal}
        size='md'
        onCloseHandler={handleCloseModal}
        className={styles.modal}
        timeout={0}
        hideOverlay={hideOverlay}
      >
        <div className={cx('d-flex', 'justify-content-between', styles.header)}>
          <div>
            <h2 className='heading-6'>{label?.title}</h2>
            {label?.subTitle && (
              <p className='clr-gray-800 mt-1'>{label?.subTitle}</p>
            )}
          </div>
          <IconButton
            variant='text'
            size='small'
            icon={<Cancel />}
            className={styles.header__btn}
            onClick={handleCloseModal}
          />
        </div>
        {showDocumentTypeRenameField ? (
          <div className='mt-4'>
            <div className={cx('mt-6', styles.selectDocumentSection)}>
              <p className={cx('mb-2', styles.selectDocumentSection__title)}>
                Name your document type <span>*</span>
              </p>
              <Input
                name='document-type-name'
                type='text'
                placeholder='Enter doc type name'
                value={docTypeName}
                hasError={inputErrorMessage}
                id='document-type-name'
                onChange={handleInputChange}
                errorText={inputErrorMessage}
                inputGroupClassName={styles.selectDocumentSection__input}
              />
            </div>
          </div>
        ) : null}
        <UploadDropzone
          files={files}
          docTypeName={docTypeName}
          updateFiles={updateFiles}
          isLoading={isLoading}
          handleDropAccepted={handleDropAccepted}
          proceedWithSampleDoc={proceedWithSampleDoc}
        />
        {showSampleDocProceedField && !hasDocuments && !files.length ? (
          <div className='d-flex align-items-center justify-content-between mt-6 bg-secondary-hover py-2 px-6'>
            <p>Don’t have files handy?</p>
            <button
              type='button'
              onClick={proceedWithSampleDoc}
              disabled={isLoading || inputErrorMessage}
              className={styles.proceedWithSampleBtn}
              title={`Proceed with sample ${docTypeName}`}
            >
              <span className={styles.proceedWithSampleBtn_text}>
                Proceed with sample {docTypeName}
              </span>
              <span className={styles.proceedWithSampleBtn_icon}>
                {isLoading && !files.length ? (
                  <Spinner
                    size='sm'
                    className={styles.proceedWithSampleBtn_icon__loader}
                  />
                ) : (
                  <ArrowRight width={24} height={24} />
                )}
              </span>
            </button>
          </div>
        ) : null}
        {showUploadMethods ? (
          <UploadMethods
            selectedDocumentType={selectedDocumentType}
            setToast={appActions.setToast}
          />
        ) : null}

        <div className={cx('d-flex', 'justify-content-end', 'mt-4')}>
          {showBackButton ? (
            <Button
              size='small'
              variant='outlined'
              className={'mr-4'}
              onClick={handleBackButtonClick}
            >
              Back
            </Button>
          ) : null}
          {!shouldUploadOnDrop ? (
            <Button
              size='small'
              variant='contained'
              disabled={
                (!canCreateDocWithoutUpload && !files.length) ||
                inputErrorMessage ||
                isLoading ||
                isValidatingName
              }
              icon={<ArrowRight />}
              iconPosition='right'
              onClick={type === 'custom' ? customDocFlow : uploadFiles}
              isLoading={
                canCreateDocWithoutUpload
                  ? isLoading
                  : isLoading && files.length
              }
            >
              {type === 'custom' ? 'Set up fields' : label?.save}
            </Button>
          ) : null}
        </div>
      </Modal>
      <ConfirmationModal
        show={showConfirmationModal}
        modalTitle={label?.confirmModalTitle}
        modalBody={label?.confirmModalBody}
        cancelBtnLabel='Continue Upload'
        confirmBtnLabel='Cancel Upload'
        handleModalClose={closeConfirmationModal}
        handleConfirmBtnClick={handleConfirmBtnClick}
        confirmBtnProps={{ colorScheme: 'danger' }}
      />
    </>
  );
};

function mapStateToProps(state) {
  const { config, user } = state.app;
  const { showCreateDocumentTypeModal, selectedDocumentType, documentsById } =
    state.documents;

  const hasDocuments = Object.values(
    documentsById[selectedDocumentType?.id]?.docCounts ?? {}
  ).find((count) => count > 0);

  return {
    showCreateDocumentTypeModal,
    selectedDocumentType,
    hasDocuments,
    config,
    user,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
    documentActions: bindActionCreators(documentActions, dispatch),
    uploadActions: bindActionCreators(uploadActions, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UploadDocumentModal);
