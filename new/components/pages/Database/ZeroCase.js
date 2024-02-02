import React, { Component } from 'react';

import { Plus } from 'iconoir-react';
import FileAddIcon from 'new/assets/images/docsumo/emptystate.png';
import Button from 'new/ui-elements/Button/Button';

import styles from './zeroCase.scss';

class ZeroCase extends Component {
  render() {
    const { handleCsvUpload } = this.props;

    return (
      <div className={styles.root}>
        {/* <FileAddIcon className={styles.icon}/> */}
        <img src={FileAddIcon} className={styles.icon} alt='fileupload' />
        <p className={styles.title}>Ohh... it's empty in here</p>
        <p className={styles.separartorText}>
          Click on import button and upload some files.
        </p>
        <Button
          variant='contained'
          icon={Plus}
          size='small'
          onClick={handleCsvUpload}
        >
          Import
        </Button>
      </div>
    );
  }
}

export default ZeroCase;
