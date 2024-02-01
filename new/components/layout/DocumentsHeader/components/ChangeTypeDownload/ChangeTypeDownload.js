import React from 'react';

import cx from 'classnames';
import { Download } from 'iconoir-react';

import styles from './ChangeTypeDownload.scss';

const ChangeTypeDownload = (props) => {
  const options = [
    { name: 'JSON', value: 'json' },
    { name: 'CSV', value: 'csv_long' },
  ];

  const { onClick, className } = props;

  return (
    <ul className={cx(styles.list, className)}>
      {options.map((item, id) => (
        <li className={styles.typeitem} key={id}>
          <button
            onClick={() => onClick(item.value)}
            className={cx('UFDownloadFIle')}
          >
            <Download />
            <span>Download {item.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default ChangeTypeDownload;
