import React, { useEffect, useState } from 'react';
import { showToast } from 'new/redux/helpers';

import cx from 'classnames';
import { Cancel, InfoEmpty } from 'iconoir-react';
import { get, isEmpty } from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { SUPPORT_LINK } from 'new/constants/urllink';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button from 'new/ui-elements/Button/Button';
import { Dropdown } from 'new/ui-elements/Dropdown/Dropdown';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import ErrorText from 'new/ui-elements/Input/components/ErrorText/ErrorText';
import Input from 'new/ui-elements/Input/Input';
import Modal from 'new/ui-elements/Modal';
import RadioButton from 'new/ui-elements/RadioButton/RadioButton';
import Tooltip from 'new/ui-elements/Tooltip';
import { mixpanelTrackingAllEvents } from 'new/utils/mixpanel';
import { CSSTransition } from 'react-transition-group';

import { CONFIRMATION_TEXT, PUSH_TYPE } from './constants';
import ModalSection from './ModalSection';

import styles from './PushDocumentProdModal.scss';

function PushDocumentProdModal({
  user,
  isShowPushDocProdModal,
  handleTogglePushDocProdModal,
  document: {
    docType: pushDocType = '',
    excelType = false,
    title: pushDocTitle,
  } = {},
  appConfig,
  fetchAllDocTypes,
}) {
  const [docTypeName, setDocTypeName] = useState('');
  const [errorMessage, setErrorMessage] = useState({});
  const [isPushingDocType, setDocTypePushStatus] = useState(false);

  const [pushType, setPushType] = useState(PUSH_TYPE.duplicate);

  const [viewChanges, setViewChanges] = useState(false);

  const [replaceDropdownData, setReplaceDropdownData] = useState([]);

  const [changes, setChanges] = useState([]);

  const [confirmationText, setConfirmationText] = useState('');

  const [isLoadingViewChanges, setIsLoadingViewChanges] = useState(false);

  useEffect(() => {
    const getProdDocTypes = async () => {
      try {
        const response = await api.getAllDocumentsTypes({
          queryParams: {
            mode: 'prod',
          },
        });

        const doctypes = response?.responsePayload?.data?.document;

        const dropdownData = doctypes.reduce(
          (result, { id, docType, excelType: isDocExcelType, title }) => {
            if (
              !docType.startsWith('auto_classify') &&
              docType.split('__')[0] === pushDocType.split('__')[0] &&
              isDocExcelType === excelType
            ) {
              result.push({ id, docType, excelType, title });
            }
            return result;
          },
          []
        );

        setReplaceDropdownData(dropdownData);
      } catch (e) {
        const { message, error } = e.responsePayload;
        const errorMessage = get(
          e.responsePayload,
          'message',
          'Something went wrong!'
        );
        showToast({
          title: errorMessage,
          error: true,
        });
      }
    };
    if (isShowPushDocProdModal) {
      getProdDocTypes();
    }
  }, [isShowPushDocProdModal, excelType, pushDocType]);

  useEffect(() => {
    const getDoctypeChanges = async () => {
      setIsLoadingViewChanges(true);
      try {
        const response = await api.getDocTypeViewChanges({
          doc_type: pushDocType,
        });

        const changes = response?.responsePayload?.data?.changes;

        setChanges(changes.map((change) => change.tab));
      } catch (e) {
        const errorMessage = get(
          e.responsePayload,
          'message',
          'Something went wrong!'
        );

        setViewChanges(false);

        showToast({
          title: errorMessage,
          error: true,
        });
      } finally {
        setIsLoadingViewChanges(false);
      }
    };
    if (isShowPushDocProdModal) {
      getDoctypeChanges();
    }
  }, [pushDocType, isShowPushDocProdModal]);

  const toggleViewChanges = () => {
    mixpanelTrackingAllEvents(MIXPANEL_EVENTS.testprod_viewchanges, {
      origin: 'Test Prod',
      docType: pushDocType,
    });
    setViewChanges((viewChanges) => !viewChanges);
  };
  const animation = 'growY';

  const handlerConfirmPushDocument = async () => {
    const { canSwitchToOldMode = true } = appConfig;
    let error = {};
    if (pushType === PUSH_TYPE.replace) {
      if (confirmationText !== CONFIRMATION_TEXT) {
        error = {
          ...error,
          confirmationInput: 'Text doesn’t match. (Text is case sensitive)',
        };
      }
    }

    if (!docTypeName) {
      error = {
        ...error,
        ...(pushType === PUSH_TYPE.duplicate && {
          createNew: 'Name cannot be empty!',
        }),
        ...(pushType === PUSH_TYPE.replace && {
          replaceDropdown: 'Existing doctype name cannot be empty!',
        }),
      };
    }

    if (!isEmpty(error)) {
      setErrorMessage(error);
      return;
    }
    setDocTypePushStatus(true);

    const payload = {
      source_doc_type: pushDocType,
      ...(pushType === PUSH_TYPE.replace && { target_doc_type: docTypeName }),
      ...(pushType === PUSH_TYPE.duplicate && { doc_title: docTypeName }),
      push_type: pushType,
    };

    try {
      await api.pushDocFromProd(payload);
      showToast({
        title: 'Changes have been pushed to production successfully',
        success: true,
      });
      fetchAllDocTypes();

      resetDocTypeName();
      setPushType(PUSH_TYPE.duplicate);
      handleTogglePushDocProdModal({ doc_type: '' });
    } catch (e) {
      showToast({
        title:
          e?.responsePayload?.message ||
          'Failed to push changes to production. Please try again later',
        error: true,
      });
    } finally {
      setDocTypePushStatus(false);
      //Add mixpanel event
      mixpanel.track(MIXPANEL_EVENTS.push_doc_type_complete, {
        'work email': user.email,
        'organization ID': user.orgId,
        version: 'new',
        mode: user.mode,
        'doc type': pushDocType,
        canSwitchUIVersion: canSwitchToOldMode,
      });
    }
  };

  const resetDocTypeName = () => {
    setDocTypeName('');
    setErrorMessage('');
    setViewChanges(false);
    setConfirmationText('');
  };

  const handleCloseModal = () => {
    resetDocTypeName();
    handleTogglePushDocProdModal({ doc_type: '' });
    setPushType(PUSH_TYPE.duplicate);
    setChanges([]);
  };

  const handleRadioBtnChange = ({ target: { value } }) => {
    mixpanelTrackingAllEvents(
      value === PUSH_TYPE.duplicate
        ? MIXPANEL_EVENTS.testprod_createnew
        : MIXPANEL_EVENTS.testprod_replace,
      {
        origin: 'Test Prod',
        docType: pushDocType,
      }
    );
    setPushType(value);
    resetDocTypeName();
  };

  const handleReplaceDropdownChange = ({ docType }) => {
    setDocTypeName(docType);
  };

  const handleCreateNewDoctypeChange = ({ target: { value } }) => {
    setDocTypeName(value);
  };

  const handleConfirmationTextChange = ({ target: { value } }) => {
    setConfirmationText(value);
  };

  return (
    <>
      {isShowPushDocProdModal ? (
        <Modal
          show={isShowPushDocProdModal}
          className={styles.modal}
          onCloseHandler={handleCloseModal}
        >
          <div className={styles.modalHeader}>
            <h1 className={styles.heading}>
              Push to Production
              <Tooltip
                placement='bottom'
                label='Learn More'
                tooltipTriggerClassname='d-flex align-items-center'
              >
                <InfoEmpty
                  height={20}
                  width={20}
                  onClick={() =>
                    window.open(
                      SUPPORT_LINK.TEST_PROD_MODE_DETAIL_DOC,
                      '_blank'
                    )
                  }
                  className='cursor-pointer'
                />
              </Tooltip>
            </h1>

            <IconButton
              variant='text'
              size='small'
              icon={<Cancel />}
              className={styles.closeBtn}
              onClick={handleCloseModal}
            />
          </div>
          <div className={styles.modalBody}>
            <div className={styles.modalBody__section}>
              <RadioButton
                checked={pushType === PUSH_TYPE.duplicate}
                onChange={handleRadioBtnChange}
                value={PUSH_TYPE.duplicate}
              />
              <ModalSection
                title='Create a new document type in production'
                selected={pushType === PUSH_TYPE.duplicate}
              >
                <div
                  className={cx(styles.helpText, styles.helpText__createNew)}
                >
                  Enter the name for the new document type in production
                </div>
                <Input
                  inputGroupClassName='w-100'
                  className={styles.createNewInput}
                  value={docTypeName}
                  onChange={handleCreateNewDoctypeChange}
                  placeholder='Enter the name of the new document type'
                />
                {errorMessage?.createNew ? (
                  <ErrorText>{errorMessage.createNew}</ErrorText>
                ) : (
                  ''
                )}
              </ModalSection>
            </div>
            <div
              className={cx(styles.modalBody__section, {
                'cursor-not-allowed': excelType,
              })}
            >
              <RadioButton
                checked={pushType === PUSH_TYPE.replace}
                onChange={handleRadioBtnChange}
                value={PUSH_TYPE.replace}
                disabled={excelType || replaceDropdownData.length === 0}
              />
              <ModalSection
                title='Replace existing document type in production'
                disabled={excelType || replaceDropdownData.length === 0}
                selected={pushType === PUSH_TYPE.replace}
                helpTextNotSelected={
                  <div
                    className={cx(styles.helpText, styles.helpText__replace, {
                      [styles['helpText__replace--selected']]:
                        pushType === PUSH_TYPE.replace,
                    })}
                  >
                    This will replace the configuration of an existing document
                    type in the production.
                  </div>
                }
              >
                <div className='text-sm font-normal mb-2 mt-5'>
                  Select document type to be replaced in production
                </div>

                <Dropdown
                  data={replaceDropdownData}
                  optionLabelKey='title'
                  optionValueKey='docType'
                  onChange={handleReplaceDropdownChange}
                  className='w-100'
                  optionClassNames={styles.dropdownOptions}
                  placeholder='Select a document type'
                  disabled={replaceDropdownData.length === 0}
                />

                {errorMessage?.replaceDropdown ? (
                  <ErrorText>{errorMessage.replaceDropdown}</ErrorText>
                ) : (
                  ''
                )}

                <div className='text-sm font-normal mb-2 mt-5'>
                  Type “PUSH CHANGES” to confirm your decision
                </div>

                <Input
                  inputGroupClassName='w-100'
                  className={styles.confirmationTextInput}
                  onChange={handleConfirmationTextChange}
                  value={confirmationText}
                  placeholder='Type "PUSH CHANGES"'
                />

                {errorMessage?.confirmationInput ? (
                  <ErrorText>{errorMessage.confirmationInput}</ErrorText>
                ) : (
                  ''
                )}
              </ModalSection>
            </div>
          </div>

          <div className={styles.modalFooter__wrapper}>
            <CSSTransition
              in={!isLoadingViewChanges && viewChanges && changes.length > 0}
              unmountOnExit
              timeout={10}
              classNames={{
                enter: styles[`${animation}-enter`],
                enterActive: styles[`${animation}-enter-active`],
                enterDone: styles[`${animation}-enter-done`],
                exit: styles[`${animation}-exit`],
                exitActive: styles[`${animation}-exit-active`],
                exitDone: styles[`${animation}-exit-done`],
              }}
            >
              <div
                className={cx(
                  'bg-secondary-hover',
                  'p-4',
                  'mb-4',
                  styles.viewChanges
                )}
              >
                <p className='text-sm font-medium mb-2'>
                  The changes on the pages below will be pushed to production.
                </p>
                <div>
                  {changes.map((change, idx) => (
                    <span
                      key={idx}
                      className='text-sm font-normal clr-gray-900 text-capitalize'
                    >
                      <span className='font-normal clr-gray-600'>
                        {idx !== 0 ? ' | ' : ''}
                      </span>
                      <span className={styles.changesText}>{`${
                        idx + 1
                      }. ${change.replace(/_/g, '-')}`}</span>
                    </span>
                  ))}
                </div>
              </div>
            </CSSTransition>
            <div className={styles.modalFooter}>
              <div>
                <Button
                  size='small'
                  variant='text'
                  onClick={toggleViewChanges}
                  active={viewChanges}
                  isLoading={isLoadingViewChanges}
                  disabled={changes.length === 0}
                >
                  View changes
                </Button>
              </div>
              <div>
                <Button
                  size='small'
                  variant='outlined'
                  onClick={handleCloseModal}
                  className={styles.actionBtn}
                >
                  Cancel
                </Button>

                <Button
                  size='small'
                  variant='contained'
                  onClick={handlerConfirmPushDocument}
                  className={styles.actionBtn}
                  isLoading={isPushingDocType}
                  disabled={isPushingDocType}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      ) : (
        ''
      )}
    </>
  );
}

export default PushDocumentProdModal;
