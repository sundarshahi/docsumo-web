/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';

import cx from 'classnames';
import { NavArrowDown } from 'iconoir-react';

import KeyValueBlock from './KeyValueBlock';

import styles from './KeyValueAccordion.scss';

function KeyValueAccordion(props) {
  const { className, data = [] } = props;
  const [activeSection, setActiveSection] = useState({
    index: null,
    showDetails: false,
  });

  const updateActiveSection = (index) => {
    if (activeSection.index === index) {
      setActiveSection({
        index: activeSection.showDetails ? null : index,
        showDetails: !activeSection.showDetails,
      });
    } else {
      setActiveSection({
        index,
        showDetails: true,
      });
    }
  };

  const renderSectionData = (sectionData, level = 1) => {
    const { label, value, key, data = [] } = sectionData;

    return (
      <KeyValueBlock
        key={key}
        label={label}
        value={value}
        isChild={true}
        level={level}
        data={data}
      >
        {data.length
          ? data.map((sectionItem) => renderSectionData(sectionItem, level + 1))
          : null}
      </KeyValueBlock>
    );
  };

  const renderSection = (section, index) => {
    const { key, label, value, data = [] } = section;

    return (
      <div className={cx(styles.container, 'UFReviewTable')} key={key}>
        <div
          className={cx(styles.parentTopContainer, {
            [styles.parentTopContainer_open]: activeSection.index === index,
          })}
          onClick={() => updateActiveSection(index)}
        >
          {data.length ? (
            <span
              className={cx(styles.icon, {
                [styles.icon_open]: activeSection.index === index,
              })}
            >
              <NavArrowDown height={16} width={16} />
            </span>
          ) : null}
          <div className={styles.parentTopContent}>
            <span className={styles.key} title={label}>
              {label || '-'}
            </span>
            <span className={styles.value}>{value || '-'}</span>
          </div>
        </div>
        {activeSection.index === index && activeSection.showDetails ? (
          <>
            {!data.length
              ? null
              : data.map((item) => renderSectionData(item, 1))}
            <KeyValueBlock
              label={'TOTAL'}
              value={value}
              level={1}
              isTotalType={true}
            />
          </>
        ) : null}
      </div>
    );
  };

  if (!data.length) return null;

  return (
    <div className={cx(styles.container, className)}>
      {data.map((section, index) => {
        return renderSection(section, index);
      })}
    </div>
  );
}

export default KeyValueAccordion;
