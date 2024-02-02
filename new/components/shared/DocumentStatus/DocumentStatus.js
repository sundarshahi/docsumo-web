import React from 'react';

import cx from 'classnames';
import { ThreeDotsLoaderIcon } from 'new/components/widgets/progress';
import Badge from 'new/ui-elements/Badge';
import { default as OutlinedButton } from 'new/ui-elements/Button/Button';
import Tooltip from 'new/ui-elements/Tooltip';

import styles from './DocumentStatus.scss';

function DocumentStatus(props) {
  const {
    status,
    errMessage = '',
    className = '',
    reviewClassName = '',
  } = props;

  let docStatus = null;

  switch (status) {
    case 'new':
    case 'processing':
      docStatus = (
        <Badge
          className={className}
          type='warning'
          title={
            <>
              <ThreeDotsLoaderIcon className={styles.icon} />
              <span className={styles.processing}>Processing</span>
            </>
          }
        />
      );
      break;
    case 'processed':
      docStatus = (
        <Badge className={className} type='success' title='Processed' />
      );
      break;
    case 'reviewing':
      docStatus = (
        <Badge
          className={cx(styles.review, className, 'UFReviewCell')}
          title='Review'
        />
      );
      break;
    case 'review_skipped':
      docStatus = <Badge className={className} title='Skipped' />;
      break;
    case 'erred':
    case 'error':
      docStatus = (
        <Tooltip label={errMessage} colorScheme='error' placement='right'>
          <Badge className={className} type='error' title='Erred' />
        </Tooltip>
      );
      break;
    case 'split':
      docStatus = (
        <OutlinedButton
          variant='outlined'
          size='small'
          className={reviewClassName}
          onClick={() => history.push('/all')}
        >
          View
        </OutlinedButton>
      );
      break;
    default:
      docStatus = <Badge className={className} title={status} />;
      break;
  }

  return docStatus;
}

export default DocumentStatus;
