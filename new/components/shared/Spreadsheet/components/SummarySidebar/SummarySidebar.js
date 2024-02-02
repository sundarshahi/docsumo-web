import React, { forwardRef, useImperativeHandle, useRef } from 'react';

import cx from 'classnames';
import {
  ArrowLeft,
  InfoEmpty,
  NavArrowLeft,
  NavArrowRight,
  Page,
} from 'iconoir-react';
import { ReactComponent as DocsumoIcon } from 'new/assets/images/docsumo/icon.svg';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import * as uuid from 'uuid/v4';

import styles from './SummarySidebar.scss';

const SummarySidebar = forwardRef((props, ref) => {
  const {
    className = '',
    isSidebarOpen,
    buttonGroups,
    summaryData = {},
    dragHandler,
    documentTitle = '',
    dataFetchFailed,
    embeddedApp,
    clientApp,
    history,
  } = props;

  const summarySidebarRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getSummarySidebarDOM: () => {
      return summarySidebarRef.current;
    },
  }));

  const handleButtonClick = () => {
    const { handleSidebarToggle } = props;

    handleSidebarToggle();
  };

  const { kv = [], table = [], notes = '' } = summaryData;
  const handleGoBackClick = () => {
    history.goBack();
  };
  return (
    <div className={cx(styles.container, className)} ref={summarySidebarRef}>
      {isSidebarOpen ? (
        <>
          {!dataFetchFailed ? dragHandler : null}
          <IconButton
            variant='text'
            icon={<NavArrowLeft height={16} width={16} />}
            size='small'
            title='Toggle Sidebar'
            onClick={() => handleButtonClick()}
            className={styles.toggleButton}
          />
          <div className={cx(styles.container__header, 'd-flex')}>
            <span>
              {clientApp || embeddedApp ? (
                <Page
                  height={24}
                  width={24}
                  className={cx(styles['container__header--iconpage'])}
                />
              ) : (
                <IconButton
                  icon={<ArrowLeft height={17} width={17} strokeWidth={2} />}
                  variant='ghost'
                  onClick={handleGoBackClick}
                  className={cx(styles['container__header--icon'])}
                />
              )}
            </span>
            <h2
              className={cx(
                styles['container__header--title'],
                'text-truncate'
              )}
              title={documentTitle}
            >
              {documentTitle}
            </h2>
          </div>
          {!dataFetchFailed ? (
            <>
              <div className={styles.container__content}>
                <div className={styles.section}>
                  <h3 className={styles.contentTitle}>
                    Summary&nbsp;
                    <Tooltip
                      label='The changes in the summary panel will be based on
                          changes in cleaned sheet.'
                      placement='bottom'
                    >
                      <InfoEmpty height={16} width={16} />
                    </Tooltip>
                  </h3>
                  {kv.map((item, idx) => (
                    <div key={idx} className={styles.cardsContainer}>
                      {item &&
                        item.data &&
                        item.data.map((childItem, id) => (
                          <div key={id} className={styles.card}>
                            <span title={childItem?.label}>
                              {childItem?.label}
                            </span>
                            <p
                              title={childItem?.value?.toLocaleString()}
                              className='text-truncate'
                            >
                              {childItem?.value?.toLocaleString() || '-'}
                            </p>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
                {notes ? (
                  <div className={styles.section}>
                    <div className={styles.noteContainer}>
                      <b>Note:</b> {notes}
                    </div>
                  </div>
                ) : null}

                <div className={styles.section}>
                  <div className={styles.tableContainer}>
                    {table.map(({ data = [], key = '' }) => (
                      <div className={styles.tableRoot} key={uuid()}>
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th colSpan={data[0].length}>{key}</th>
                            </tr>

                            {data.map((itm) => (
                              <tr key={uuid()}>
                                {itm.map((childItem, index) => {
                                  if (childItem.format === '%h') {
                                    return (
                                      <th key={index} title={childItem.label}>
                                        {childItem.key}
                                      </th>
                                    );
                                  }
                                })}
                              </tr>
                            ))}
                          </thead>
                          <tbody>
                            {data.map((itm, index) => (
                              <tr key={uuid()}>
                                {itm.map((childItem, subIndex) => {
                                  if (childItem.format !== '%h') {
                                    return (
                                      <td
                                        key={subIndex}
                                        title={childItem.value}
                                        className={
                                          index % 2 === 0 ? styles.tdBg : ''
                                        }
                                      >
                                        {childItem.value}
                                      </td>
                                    );
                                  }
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {buttonGroups}
            </>
          ) : null}
        </>
      ) : (
        <>
          <div className={cx(styles.imageContainer)}>
            <DocsumoIcon className={styles.logo} />
          </div>
          <IconButton
            variant='text'
            icon={<NavArrowRight height={16} width={16} />}
            size='small'
            title='Toggle Sidebar'
            onClick={() => handleButtonClick()}
            className={styles.toggleButton}
          />
        </>
      )}
    </div>
  );
});

export default SummarySidebar;
