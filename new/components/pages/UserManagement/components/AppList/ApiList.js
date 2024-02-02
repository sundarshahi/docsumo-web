import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import cx from 'classnames';
import Checkbox from 'new/ui-elements/Checkbox/Checkbox';
import Skeleton from 'new/ui-elements/Skeleton/Skeleton';

import styles from './ApiList.scss';

export const ApiList = ({ apiList, authorizedDocTypes, onInputChange }) => {
  const [isAllSelected, setIsAllSelected] = useState(false);

  useEffect(() => {
    setIsAllSelected(apiList?.length === authorizedDocTypes?.length);
  }, [apiList, authorizedDocTypes]);

  const handleSelectAllAPIs = () => {
    if (isAllSelected) {
      onInputChange(null, {
        name: 'authorizedDocTypes',
        value: [],
      });
    } else {
      onInputChange(null, {
        name: 'authorizedDocTypes',
        value: [...apiList],
      });
    }
    setIsAllSelected(!isAllSelected);
  };

  const handleCheckboxChange = (item) => {
    let newAuthorizedDocTypes = authorizedDocTypes;
    let index = newAuthorizedDocTypes?.findIndex(
      (api) => api.value === item.value
    );
    if (index === -1) newAuthorizedDocTypes.push(item);
    else newAuthorizedDocTypes.splice(index, 1);

    onInputChange(null, {
      name: 'authorizedDocTypes',
      value: newAuthorizedDocTypes,
    });

    setIsAllSelected(newAuthorizedDocTypes?.length === apiList?.length);
  };

  return (
    <div className={styles.section}>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className={cx(styles.formLabel, 'd-flex', 'align-items-center')}>
        API Access &nbsp;
        <span className={styles.apiAccessCount}>
          ({authorizedDocTypes ? authorizedDocTypes.length : 0})
        </span>
      </label>
      <div className={styles.card}>
        {apiList.length > 0 ? (
          <ul className={styles.list}>
            <li className={styles.listItems}>
              <Checkbox
                checked={isAllSelected}
                className={styles.checkbox}
                labelClassName={styles.checkboxLabel}
                onChange={handleSelectAllAPIs}
              />
              <span className={styles.checkboxLabel}>Select All</span>
            </li>
            {apiList.map((apiItem) => {
              const isChecked =
                authorizedDocTypes?.some(
                  (item) => item.value === apiItem.value
                ) ?? false;

              return (
                <li key={apiItem.value} className={styles.listItems}>
                  <div>
                    <Checkbox
                      name={apiItem.value}
                      value={apiItem.value}
                      checked={isChecked}
                      className={styles.checkbox}
                      onChange={() => handleCheckboxChange(apiItem)}
                    />
                  </div>
                  <div className={styles.checkboxLabel} title={apiItem.title}>
                    <span className='ellipsis'>{apiItem.title}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          [1, 2, 3, 4, 5].map((item) => (
            <div key={item} className={cx('d-flex', styles.listItems)}>
              <Skeleton width='1.5rem' />

              <Skeleton width='20%' />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ApiList);
