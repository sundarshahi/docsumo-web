import React from 'react';

import cx from 'classnames';
import { ReactComponent as DownloadIcon } from 'images/icons/download.svg';

import styles from './index.scss';

const ChangeTypeDownload = (props) => {
  const options = [
    { name: 'JSON', value: 'json' },
    { name: 'CSV', value: 'csv_long' },
    //{ name: 'Long CSV', value: 'csv_long' },
    // { name: 'File', value: 'json' },
    // { name: 'CSV', value: 'csv' },
  ];

  const { onClick, className } = props;
  return (
    <ul className={cx(styles.typebox, className)}>
      {options.map((item, id) => (
        <li className={styles.typeitem} key={id}>
          <button
            onClick={() => onClick(item.value)}
            className={cx('UFDownloadFIle')}
          >
            <DownloadIcon /> Download {item.name}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default ChangeTypeDownload;
