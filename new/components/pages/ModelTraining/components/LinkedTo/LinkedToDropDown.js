/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { showToast } from 'new/redux/helpers';

import cx from 'classnames';
import { NavArrowDown } from 'iconoir-react';
import _ from 'lodash';
import * as api from 'new/api';
import Button from 'new/ui-elements/Button/Button';
import Checkbox from 'new/ui-elements/Checkbox/Checkbox';

import {
  disabledFilterDocTypes,
  filteredArray,
  filterPayloadByEnabled,
  isCheckedDocTypes,
  refactorTitle,
} from '../../utils/utils';
import ReplaceModal from '../ReplaceModal/ReplaceModal';

import styles from './LinkedToDropDown.scss';
const LinkedToDropdownCheckbox = (props) => {
  const {
    placeholder = 'Select Value',
    value,
    error,
    data,
    disabled,
    className,
    cell,
    authorizedDocTypes,
    fetchDocuments,
    config,
    pageQueryParams,
    selectLinkedDropdownHandler,
    selectedLinkedDropdown,
  } = props;
  const { linkedTo, modelId, modelType, modelTagVerbose } = cell;

  const [placeholderText, setPlaceholderText] = useState('');
  const [dropdownValue, setDropdownValue] = useState('');
  const [confirmModal, setConfirmModal] = useState(false);
  const [nameValueList, setNameValueList] = useState(refactorTitle(config));
  const [validList, setValidList] = useState(
    filteredArray(data[modelType], authorizedDocTypes)
  );
  const [docTypesChecked, setdocTypesChecked] = useState({});
  const [initalChecked, setInitialChecked] = useState({});
  const [replacePayload, setReplacePayload] = useState({});
  const [replaceModalDetails, setReplaceModalDetails] = useState({});
  const [isReplaceModelLoading, setIsReplaceModelLoading] = useState(false);

  const ref = useRef(null);

  const toggleDropDown = useCallback(
    (id) => {
      if (selectedLinkedDropdown) {
        selectLinkedDropdownHandler('');
        // Dont trigger modal if no selection is done.
        const filtersDisabledocTypes = disabledFilterDocTypes({
          ...docTypesChecked,
        });
        if (!_.isEqual(initalChecked, filtersDisabledocTypes)) {
          let payloadDocTypes = {};
          for (let item in docTypesChecked) {
            if (docTypesChecked[item]) {
              payloadDocTypes = { ...payloadDocTypes, [item]: 'enable' };
            } else {
              if (_.has(initalChecked, item)) {
                // If it was present in list, then disabling is possible.
                payloadDocTypes = { ...payloadDocTypes, [item]: 'disable' };
              }
            }
          }
          const clonepayloadDocTypes = { ...payloadDocTypes };
          setReplaceModalDetails(clonepayloadDocTypes);
          const payload = filterPayloadByEnabled(
            payloadDocTypes,
            initalChecked
          );
          setReplacePayload(payload);
          setConfirmModal(true);
        }
      } else {
        selectLinkedDropdownHandler(id);
      }
    },
    [selectedLinkedDropdown, docTypesChecked]
  );

  const isReplaceModelApply = () => {
    const filtersDisabledocTypes = disabledFilterDocTypes({
      ...docTypesChecked,
    });
    return !_.isEqual(initalChecked, filtersDisabledocTypes);
  };

  useEffect(() => {
    // Initlize placeholder texts
    setPlaceholderText(placeholder);
    if (value) {
      setDropdownValue(value);
    }
  }, []);

  useEffect(() => {
    // Initalizes Checkbox to linkedTo
    for (let item of linkedTo) {
      setDocTypesCheckedHandler(item, true);
      setInitialChecked((prev) => ({ ...prev, [item]: true }));
    }
  }, []);

  const handleCheckboxChange = (item) => {
    if (docTypesChecked[item]) {
      setDocTypesCheckedHandler(item, false);
    } else {
      setDocTypesCheckedHandler(item, true);
    }
  };

  const setDocTypesCheckedHandler = (item, flag) =>
    setdocTypesChecked((prev) => ({ ...prev, [item]: flag }));

  const onProceedActionBtnClick = async () => {
    const override = true; // Api always overrides.
    setIsReplaceModelLoading(true);
    try {
      await api.replaceModel(modelId, modelType, replacePayload, override);
      showToast({
        title: 'Successfully Replaced!',
        success: true,
        duration: 3000,
      });
      setConfirmModal(false); // Close the modal
      fetchDocuments(pageQueryParams);
      setdocTypesChecked(replaceModalDetails);
      setInitialChecked(replaceModalDetails); // Now inital list is selected to finalized new list
    } catch (err) {
      const {
        responsePayload: { message },
      } = err;
      showToast({
        title: message,
        error: true,
        duration: 3000,
      });
    } finally {
      setIsReplaceModelLoading(false);
    }
  };

  const resetDocTypes = () => {
    setdocTypesChecked(initalChecked);
    selectLinkedDropdownHandler('');
  };

  return (
    <>
      <ReplaceModal
        confirmModal={confirmModal}
        onProceedActionBtnClick={onProceedActionBtnClick}
        onCancelActionBtnClick={() => {
          // Close the modal
          setConfirmModal(false); // Close the modal
          setdocTypesChecked(initalChecked);
        }}
        initDoctype={initalChecked}
        finalDoctype={replaceModalDetails}
        nameValueList={nameValueList}
        modelTagVerbose={modelTagVerbose}
        isReplaceModelLoading={isReplaceModelLoading}
      />
      <div
        ref={ref}
        role='presentation'
        className={cx(styles.dropdown, className, {
          [styles['dropdown--select']]: !!(selectedLinkedDropdown === modelId),
          [styles['dropdown--error']]: error,
          [styles['dropdown--disabled']]: disabled,
        })}
        onClick={() => !disabled && toggleDropDown(modelId)}
      >
        {' '}
        {
          <div>
            {!dropdownValue ? (
              <span
                className={cx(styles.dropdown__placeholder, 'text-truncate')}
                role='presentation'
              >
                {!_.isEmpty(docTypesChecked)
                  ? isCheckedDocTypes(docTypesChecked, nameValueList)
                  : placeholderText}
              </span>
            ) : (
              <span className={styles.dropdown__value} role='presentation'>
                {dropdownValue}
              </span>
            )}
          </div>
        }
        <div
          className={cx(styles.dropdown__icon, {
            [styles['dropdown__icon--toggle']]:
              selectedLinkedDropdown === modelId,
          })}
        >
          <NavArrowDown />
        </div>
      </div>
      <div>
        {selectedLinkedDropdown === modelId && (
          <div ref={ref} className={styles.dropdown__option}>
            <div className={styles['dropdown__option-body']}>
              {data &&
                validList.map((item, idx) => {
                  return (
                    <div
                      role='presentation'
                      onClick={() => handleCheckboxChange(item)}
                      key={item}
                      className={styles.dropdown__option__value}
                    >
                      <span>
                        <Checkbox
                          value={item}
                          name={item}
                          onChange={() => {
                            handleCheckboxChange(item);
                          }}
                          checked={docTypesChecked[item]}
                        />
                      </span>
                      <span
                        title={nameValueList[item] || item}
                        className={cx(
                          'ml-2 text-truncate',
                          styles.linkedToDropdown__label
                        )}
                      >
                        {nameValueList[item] || item}
                      </span>
                    </div>
                  );
                })}
            </div>
            <div className={styles['dropdown__option-btns']}>
              <Button
                variant='outlined'
                size='small'
                onClick={resetDocTypes}
                className={styles.cancelBtn}
              >
                Cancel
              </Button>
              <Button
                variant='filled'
                size='small'
                onClick={() => toggleDropDown(modelId)}
                disabled={!isReplaceModelApply()}
                className={styles.applyBtn}
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LinkedToDropdownCheckbox;
