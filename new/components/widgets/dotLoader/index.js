import React, { useEffect, useState } from 'react';

import cx from 'classnames';
import * as uuid from 'uuid/v4';

import styles from './style.scss';

const DotLoader = ({ size = 4, containerClassName = '' }) => {
  const [dots] = useState(Array.from(Array(size), () => ''));

  useEffect(() => {
    applyAnimationStyleToCircles();
  });

  const applyAnimationStyleToCircles = () => {
    const elements = document.querySelectorAll('.js-dotLoader-circle');
    Array.from(elements).forEach((el, idx) => {
      if (idx > 0) {
        el.style.animationDelay = `0.${idx + 1}s`;
      }
    });
  };

  const makeDots = () => {
    return dots.map((dot, index) => {
      return (
        <div
          key={uuid()}
          className={cx(
            'js-dotLoader-circle',
            styles.circle,
            styles[`dot${index + 1}`]
          )}
          data-dot-loader
        ></div>
      );
    });
  };
  return (
    <>
      <div className={cx(styles.container, containerClassName)}>
        <div className={styles.loader}>{makeDots()}</div>
      </div>
    </>
  );
};

export default DotLoader;
