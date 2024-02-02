/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';

import cx from 'classnames';
import { Refresh } from 'iconoir-react';
import { ReactComponent as DocsumoIcon } from 'new/assets/images/docsumo/icon.svg';
import DotLoader from 'new/components/widgets/dotLoader';
import Spinner from 'new/ui-elements/Spinner/Spinner';

import styles from './FeedbackBox.scss';

const FeedbackBox = ({
  showTakingLongMessage,
  showLoader,
  showError,
  handleRetryButtonClick,
  isLoading,
}) => {
  return (
    <div className={styles.loader}>
      <div className={cx(styles.loader__content)}>
        <span className={styles.loader__icon}>
          <DocsumoIcon />
        </span>
        {showLoader ? (
          <>
            <DotLoader size={3} containerClassName={styles.loader__loader} />
            {showTakingLongMessage && (
              <p className={styles.loader__text}>
                it is taking longer than usual
              </p>
            )}
          </>
        ) : null}
        {showError ? (
          <div>
            <p
              className={cx(styles.loader__text, styles['loader__text--error'])}
            >
              There was an error generating a response
            </p>
            <div
              role='button'
              className={cx(styles.loader__btn, {
                [styles['loader__btn--disabled']]: isLoading,
              })}
              onClick={handleRetryButtonClick}
            >
              <span className='mr-1'>Retry</span>
              {isLoading ? <Spinner size='sm' /> : <Refresh />}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FeedbackBox;
