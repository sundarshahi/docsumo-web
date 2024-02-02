import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { actions as documentActions } from 'new/redux/documents/actions';

import {
  CheckCircle,
  NavArrowDown,
  NavArrowUp,
  WarningCircle,
} from 'iconoir-react';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import { filterUniqueObjByKey } from 'new/utils/filterUniqueObjByKey';

const LowConfidenceNavigator = ({ lineItemRowIds }) => {
  const [lowConfidenceFields, setLowConfidenceFields] = useState([]);
  const [isLowConfidenceFieldPresent, setIsLowConfidenceFieldPresent] =
    useState(false);
  const [currentFieldId, setCurrentFieldId] = useState(null);

  const { fieldsById, lineItemRowsById } = useSelector(
    (state) => state.documents.reviewTool
  );
  const dispatch = useDispatch();

  useEffect(() => {
    let lowConfidenceFields = [];

    lineItemRowIds.forEach((lineItemId) => {
      const lineItemRow = lineItemRowsById[lineItemId];

      const errorFields = [
        ...lineItemRow.errorFieldIds,
        ...lineItemRow.lowConfidenceFieldIds,
      ].map((fieldId) => ({
        fieldId,
        lineItemRowId: lineItemRow.id,
      }));

      lowConfidenceFields = [...lowConfidenceFields, ...errorFields];
    });

    lowConfidenceFields = filterUniqueObjByKey(
      lowConfidenceFields,
      'fieldId'
    ).sort((a, b) => a.fieldId - b.fieldId);

    if (lowConfidenceFields.length) {
      setIsLowConfidenceFieldPresent(true);
    } else {
      setIsLowConfidenceFieldPresent(false);
    }
    setLowConfidenceFields(lowConfidenceFields);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineItemRowIds, lineItemRowsById]);

  const focusLineItemById = ({ fieldId, lineItemRowId }) => {
    dispatch(
      documentActions.rtSetSelectedFieldId({
        lineItemRowId: lineItemRowId,
        fieldId: fieldId,
        lineItemFooterBtn: null,
      })
    );

    const domEl = document.getElementById(`line-item-field-input-${fieldId}`);
    if (domEl) {
      domEl.focus();
      domEl.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  };

  const handleNavigateUp = () => {
    const currentFieldIndex = lowConfidenceFields.findIndex(
      (field) => field?.fieldId === currentFieldId
    );

    let prevFieldIndex = currentFieldIndex !== -1 ? currentFieldIndex - 1 : 0;

    if (prevFieldIndex < 0) {
      prevFieldIndex = lowConfidenceFields.length - 1;
    }

    setCurrentFieldId(lowConfidenceFields[prevFieldIndex]?.fieldId);
    focusLineItemById(lowConfidenceFields[prevFieldIndex]);
  };

  const handleNavigateDown = () => {
    const currentFieldIndex = lowConfidenceFields.findIndex(
      (field) => field?.fieldId === currentFieldId
    );

    let nextFieldIndex = currentFieldIndex !== -1 ? currentFieldIndex + 1 : 0;

    if (nextFieldIndex > lowConfidenceFields.length - 1) {
      nextFieldIndex = 0;
    }

    setCurrentFieldId(lowConfidenceFields[nextFieldIndex]?.fieldId);
    focusLineItemById(lowConfidenceFields[nextFieldIndex]);
  };

  return (
    <div className='d-flex align-items-center mx-2'>
      <IconButton
        icon={<NavArrowUp />}
        size='extra-small'
        variant='ghost'
        onClick={handleNavigateUp}
        disabled={!isLowConfidenceFieldPresent}
      />
      {isLowConfidenceFieldPresent ? (
        <WarningCircle
          width={18}
          color='var(--ds-clr-warning)'
          className='mx-1'
        />
      ) : (
        <CheckCircle
          color='var(--ds-clr-success)'
          className='mx-1'
          width={18}
        />
      )}

      {isLowConfidenceFieldPresent ? (
        <span className='mr-1 clr-gray-800'>
          ({lowConfidenceFields.length})
        </span>
      ) : null}
      <IconButton
        icon={<NavArrowDown />}
        size='extra-small'
        variant='ghost'
        onClick={handleNavigateDown}
        disabled={!isLowConfidenceFieldPresent}
      />
    </div>
  );
};

export default LowConfidenceNavigator;
