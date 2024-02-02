import React from 'react';

import { InfoEmpty } from 'iconoir-react';
import { SUPPORT_LINK } from 'new/constants/urllink';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';

import styles from './tablechart.scss';

const TableChart = (props) => {
  const renderTableData = () => {
    const { accuracy = [] } = props;
    return accuracy.map((item, index) => {
      return (
        <tr key={index}>
          <td>{item.label}</td>
          <td className={styles.accuracy}>{item.accuracy}%</td>
        </tr>
      );
    });
  };

  const { title = '' } = props;
  return (
    <>
      <div className={styles.root}>
        <div className={styles.header}>
          <div className={styles.header_title}>{title}</div>
          <div className={styles.header_icon}>
            <a
              target='_blank'
              rel='noopener noreferrer'
              href={SUPPORT_LINK.ANALYTICS_SCREEN}
            >
              <Tooltip label='Read more about usage analytics'>
                <InfoEmpty className={styles.header_infoIcon} />
              </Tooltip>
            </a>
          </div>
        </div>
        <div className={styles.tableContent}>
          <table className={styles.tableContent_table}>
            <tbody>
              <tr>
                <td>Field</td>
                <td>Accuracy</td>
              </tr>
              {renderTableData()}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
export default TableChart;
