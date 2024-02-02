import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import cx from 'classnames';
import {
  ArrowLeft,
  InfoEmpty,
  NavArrowLeft,
  NavArrowRight,
  Page,
} from 'iconoir-react';
import _ from 'lodash';
import * as api from 'new/api';
import { ReactComponent as DocsumoIcon } from 'new/assets/images/docsumo/icon.svg';
import ROUTES from 'new/constants/routes';
import { getSummaryData } from 'new/helpers/spreadsheetSummary';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import { getFormattedData } from 'new/utils/spreadsheet';
import * as uuid from 'uuid/v4';

import KeyValueAccordion from '../KeyValueAccordion/KeyValueAccordion';

import styles from './SummarySidebarV2.scss';

function SummarySidebarV2(props, ref) {
  const {
    docId = '',
    className = '',
    documentTitle,
    isSidebarOpen,
    excelData = {},
    summaryData = {},
    staticSummaryData = [],
    buttonGroups,
    dragHandler,
    appActions,
    handleSidebarToggle,
    dataFetchFailed,
    embeddedApp,
    clientApp,
    history,
    rawData = {},
  } = props;
  const summarySidebarRef = useRef(null);
  const [summary, setSummary] = useState({});
  const [cleanedSheetData, setCleanedSheetData] = useState({});
  const [updatedSummary, setUpdatedSummaryData] = useState({});
  const [rerunSummaryCalc, setRerunSummaryCalc] = useState(false);
  const [errorCheck, setErrorCheck] = useState(false);
  const [saveInitialSummary, setSaveInitialSummary] = useState(true);

  useImperativeHandle(ref, () => ({
    setCleanedSheetData: (data) => {
      setCleanedSheetData(data);
    },
    getSummarySidebarDOM: () => {
      return summarySidebarRef.current;
    },
    setRerunSummaryCalc: (value) => {
      setRerunSummaryCalc(value);
    },
    setSaveInitialSummary: (value) => {
      setSaveInitialSummary(value);
    },
    getUpdatedSummary: () => {
      return updatedSummary;
    },
  }));

  const saveSpreadsheetSummary = async (summary) => {
    await api.saveSpreadsheetSummaryData({ data: summary, docId });
  };

  const getSummary = async () => {
    const customFormula = summaryData.customCode || '';

    const formattedData = getFormattedData(cleanedSheetData);

    let summary = {};

    try {
      const newSummary = await getSummaryData(
        formattedData,
        rawData,
        customFormula
      );

      if (newSummary.error) {
        appActions.setToast({
          title:
            newSummary.error || 'An error occurred while updating summary.',
          error: true,
        });
        setErrorCheck(true);
        return;
      } else {
        setErrorCheck(false);
      }

      if (newSummary.kv && newSummary.kv.length) {
        let firstKv = newSummary.kv[0];
        if (!_.isEmpty(firstKv.data) && !_.isEmpty(staticSummaryData)) {
          staticSummaryData.map((item) => firstKv.data.push(item));
        }
        summary = {
          ...newSummary,
          kv:
            newSummary.kv.length > 1
              ? [firstKv, [...newSummary.kv.slice(1)]]
              : [firstKv],
        };
      }
    } catch (e) {
      appActions.setToast({
        title: 'An error occurred while updating summary.',
        error: true,
      });
    }

    setUpdatedSummaryData(summary);

    // Initial save when no data is sent by the backend
    if (saveInitialSummary) {
      if (_.isEmpty(summary)) {
        setCleanedSheetData(excelData);
      } else if (!_.isEqual(summaryData, summary)) {
        saveSpreadsheetSummary(summary);
        setSaveInitialSummary(false);
      }
    }

    return summary;
  };

  const handleSummaryUpdates = async () => {
    const summary = await getSummary();
    setSummary(summary);
  };

  // Update summary every time clean sheet data is changed
  useEffect(() => {
    if (errorCheck) return;
    handleSummaryUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanedSheetData]);

  // Re-calculate summary when Rerun is clicked
  useEffect(() => {
    if (rerunSummaryCalc) {
      handleSummaryUpdates();
      setRerunSummaryCalc(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rerunSummaryCalc]);

  const renderNoteSection = () => {
    if (_.isEmpty(summary) || !summary.notes) return null;

    return (
      <div className={styles.section}>
        <div className={styles.noteContainer}>
          <b>Note:</b> {summary.notes}
        </div>
      </div>
    );
  };

  const renderSummarySection = () => {
    if (_.isEmpty(summary) || _.isEmpty(summary.kv)) return null;

    return (
      <>
        {summary.kv && summary.kv.length
          ? summary.kv.map((kvItem, kvIndex) => {
              return (
                <div className={styles.section} key={uuid()}>
                  <div key={`kv-section-${kvIndex}`}>
                    <div>
                      <h3 className={styles.contentTitle}>
                        {kvItem.label}
                        &nbsp;
                        <Tooltip
                          label='The changes in the summary panel will be based on
                          changes in cleaned sheet.'
                          placement='bottom'
                        >
                          <InfoEmpty height={16} width={16} />
                        </Tooltip>
                      </h3>
                    </div>
                    <div className={styles.cardsContainer}>
                      {kvItem.data &&
                        kvItem.data.map((item, index) => {
                          if (_.isEmpty(item)) return null;
                          return (
                            <div className={styles.card} key={`kv-${index}`}>
                              <span title={item.label}>{item.label}</span>
                              <p title={item.value} className='text-truncate'>
                                {item.value || '-'}
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              );
            })
          : null}
      </>
    );
  };

  const renderSummaryTable = () => {
    if (_.isEmpty(summary)) return null;

    const { table = [] } = summary;

    if (!table.length) return null;

    return (
      <div className={styles.section}>
        <div className={styles.tableContainer}>
          {table.map(({ data = [], key = '', label = '' }) => {
            if (data.length) {
              return (
                <div
                  className={cx(styles.tableRoot, 'UFReviewTable')}
                  key={key}
                >
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th
                          colSpan={
                            data[0] && data[0].length ? data[0].length : 1
                          }
                          title={label}
                        >
                          {label}
                        </th>
                      </tr>
                      {data.map((item, index) => (
                        <tr key={`row-${index}`}>
                          {item.map((childItem, childIndex) => {
                            if (childItem.type === 'header') {
                              return (
                                <th
                                  title={childItem.label}
                                  key={`header-cell-${childIndex}`}
                                >
                                  {childItem.value}
                                </th>
                              );
                            }
                          })}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {data.map((item, index) => (
                        <tr key={`row-${index}`}>
                          {item.map((childItem, childIndex) => {
                            if (childItem.type === 'value') {
                              return (
                                <td
                                  title={childItem.value}
                                  key={`row-cell-${childIndex}`}
                                  className={index % 2 === 0 ? styles.tdBg : ''}
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
              );
            }
          })}
        </div>
      </div>
    );
  };

  const renderPivotTable = (tableData = []) => {
    if (!tableData.length) return null;

    return <KeyValueAccordion data={tableData} />;
  };

  const renderSummaryPivotTables = () => {
    if (_.isEmpty(summary)) return null;

    const { pivotTable = [] } = summary;

    if (!pivotTable.length) return null;

    return (
      <>
        {pivotTable.map((section) => {
          return (
            <div className={styles.accordionSection} key={section.key}>
              <div className={styles.contentHeader}>
                <h3 className={styles.contentTitle}>{section.label}</h3>
              </div>
              <div className={styles.sectionContent}>
                {renderPivotTable(section.data)}
              </div>
            </div>
          );
        })}
      </>
    );
  };
  const handleGoBackClick = () => {
    const prevRouteJson = localStorage.getItem('prevRoute');

    if (prevRouteJson) {
      const prevRoute = JSON.parse(prevRouteJson);
      const { pathname } = prevRoute;
      history.push(pathname);
      localStorage.removeItem('prevRoute');
    } else {
      history.push(ROUTES.ROOT);
    }
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
            onClick={() => handleSidebarToggle()}
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
                {renderSummarySection()}
                {renderNoteSection()}
                {renderSummaryTable()}
                {renderSummaryPivotTables()}
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
            onClick={() => handleSidebarToggle()}
            className={styles.toggleButton}
          />
        </>
      )}
    </div>
  );
}

export default forwardRef(SummarySidebarV2);
