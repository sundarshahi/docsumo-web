import React, { Component } from 'react';

import { Plus } from 'iconoir-react';
import FileAddIcon from 'new/assets/images/docsumo/emptystate.png';
import Button from 'new/ui-elements/Button/Button';

import styles from './zeroCase.scss';

class ZeroCase extends Component {
  render() {
    const { handleModelUpload } = this.props;

    return (
      <div className={styles.root}>
        {/* <FileAddIcon className={styles.icon}/> */}
        <img src={FileAddIcon} className={styles.icon} alt='fileupload' />
        <p className={styles.title}>Ohh... it's empty in here</p>
        <p className={styles.separartorText}>
          Click on New Model button to create the 1st version
        </p>
        <Button
          className={styles.addModel}
          size='small'
          icon={Plus}
          onClick={handleModelUpload}
        >
          New Model
        </Button>
      </div>
    );
  }
}

export default ZeroCase;
