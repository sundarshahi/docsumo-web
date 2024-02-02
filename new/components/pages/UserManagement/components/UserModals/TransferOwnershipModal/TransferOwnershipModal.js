import React, { useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { actions as appActions } from 'new/redux/app/actions';
import { bindActionCreators } from 'redux';

import { Cancel } from 'iconoir-react';
import Button from 'new/ui-elements/Button/Button';
import IconButton, {
  SIZE,
  VARIANT,
} from 'new/ui-elements/IconButton/IconButton';
import ErrorText from 'new/ui-elements/Input/components/ErrorText/ErrorText';
import Input from 'new/ui-elements/Input/Input';
import Modal from 'new/ui-elements/Modal/Modal';

import styles from './TransferOwnershipModal.scss';

const TRANSFER_OWNERSHIP_VALIDATION_TEXT = 'TRANSFER OWNERSHIP';

const TransferOwnershipModal = ({
  setCanTransferOwnership,
  setActiveModal,
  showModal,
  apiError,
  previousActiveModal,
}) => {
  const [error, setError] = useState();
  const [
    transferOwnershipConfirmationText,
    setTransferOwnershipConfirmationText,
  ] = useState();
  const [isValidText, setIsValidText] = useState(false);

  const handleInputChange = ({ target: { value } }) => {
    setTransferOwnershipConfirmationText(value);
    const isOwnershipTextValid = value === TRANSFER_OWNERSHIP_VALIDATION_TEXT;
    setIsValidText(isOwnershipTextValid);
  };

  const handleOwnershipTransferValidationTextSubmit = () => {
    const canTransferOwnership =
      transferOwnershipConfirmationText === TRANSFER_OWNERSHIP_VALIDATION_TEXT;

    if (canTransferOwnership) {
      setTransferOwnershipConfirmationText('');
      setCanTransferOwnership(true);
      setActiveModal('');
    } else {
      setError('Type correct validation text.');
    }
    setActiveModal(previousActiveModal);
  };

  const handleOwnershipTransferValidationTextSubmitCancel = () => {
    setTransferOwnershipConfirmationText('');

    setCanTransferOwnership(false);
    setActiveModal(previousActiveModal);
  };

  return (
    <Modal
      onCloseHandler={handleOwnershipTransferValidationTextSubmitCancel}
      show={showModal}
    >
      <div className={styles.header}>
        <span className={styles.title}> Transfer Ownership</span>
        <span>
          <IconButton
            icon={<Cancel />}
            variant={VARIANT.TEXT}
            onClick={handleOwnershipTransferValidationTextSubmitCancel}
            size={SIZE.SMALL}
          />
        </span>
      </div>
      <div className={styles.modalContent}>
        <p>
          You will lose access to owner role privileges and will be assigned as
          an admin. You cannot undo this action.
        </p>
        <br />

        <p>Type “TRANSFER OWNERSHIP” to confirm</p>
        <div className={styles.validationText}>
          <Input
            name='transferOwnershipConfirmationText'
            type='text'
            placeholder='Type Here'
            value={transferOwnershipConfirmationText}
            id='transfer-ownership-confirmation-text'
            onChange={handleInputChange}
            hasError={error}
          />
        </div>
        <ErrorText className={styles.errorMsg}>{error}</ErrorText>
      </div>
      <div className={styles.footer}>
        <span className={styles.errorMsg}>{apiError}</span>
        <div>
          <Button
            size={SIZE.SMALL}
            variant={VARIANT.OUTLINED}
            className={styles.footerBtn}
            onClick={handleOwnershipTransferValidationTextSubmitCancel}
            buttonAttributes={{
              type: 'button',
            }}
          >
            Cancel
          </Button>
          <Button
            size={SIZE.SMALL}
            variant={VARIANT.CONTAINED}
            className={styles.footerBtn}
            onClick={handleOwnershipTransferValidationTextSubmit}
            disabled={!isValidText}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

// export default TransferOwnershipModal;
export default withRouter(
  connect(null, mapDispatchToProps)(TransferOwnershipModal)
);
