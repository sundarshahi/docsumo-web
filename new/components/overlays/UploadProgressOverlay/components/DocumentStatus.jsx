import React from 'react';

import cx from 'classnames';
import { EyeEmpty } from 'iconoir-react';
import { ThreeDotsLoaderIcon } from 'new/components/widgets/progress';
import history from 'new/history';
import Badge from 'new/ui-elements/Badge';
import { default as OutlinedButton } from 'new/ui-elements/Button/Button';
import Tooltip from 'new/ui-elements/Tooltip';

import styles from './DocumentStatus.scss';

const DocumentStatus = ({
  file = {},
  startReview,
  reviewClassName = '',
  processingClassName = '',
}) => {
  const { status, errMessage = '', className = '', folderId } = file;
  let statusNode = null;

  switch (status) {
    case 'new':
    case 'processing':
      statusNode = (
        <Badge
          className={cx(className, 'UFProcessingFiles', processingClassName)}
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
    case 'reviewing':
      statusNode = (
        <OutlinedButton
          variant='outlined'
          size='small'
          icon={EyeEmpty}
          className={reviewClassName}
          onClick={() => startReview(file)}
        >
          Review
        </OutlinedButton>
      );
      break;
    case 'split':
      statusNode = (
        <OutlinedButton
          variant='outlined'
          size='small'
          className={reviewClassName}
          onClick={() =>
            folderId
              ? history.push(`/all?folder_id=${folderId}`)
              : history.push('/all')
          }
        >
          View
        </OutlinedButton>
      );
      break;
    case 'erred':
    case 'error':
      statusNode = (
        <Tooltip label={errMessage} colorScheme='error' placement='top'>
          <Badge className={className} type='error' title='Error' />
        </Tooltip>
      );
      break;
    default:
      statusNode = <Badge className={className} title={status} />;
      break;
  }

  return statusNode;
};

export default DocumentStatus;
