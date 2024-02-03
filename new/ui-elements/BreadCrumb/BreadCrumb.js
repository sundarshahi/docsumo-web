import React, { useEffect, useState } from 'react';

import cx from 'classnames';
import { ArrowLeft, NavArrowRight } from 'iconoir-react';
import * as uuid from 'uuid/v4';

import IconButton from '../IconButton/IconButton';

import styles from './BreadCrumb.scss';

const BreadCrumbComponent = ({
  paths = [],
  handlePathClickEvent = () => {},
  className,
  iconClassName,
  showBackBtn = false,
}) => {
  const [urlPaths, setUrlPaths] = useState([]);

  useEffect(() => {
    setUrlPaths(paths.map((path) => ({ ...path, id: uuid() })));
  }, [paths]);

  const Crumb = ({
    id = '',
    name = '',
    url = '',
    firstItem = false,
    lastItem = false,
  }) => {
    return (
      <>
        {!firstItem && (
          <div className={cx(styles.icon, iconClassName)}>
            <NavArrowRight />
          </div>
        )}
        <div
          className={cx(
            styles.label,
            { [styles.hover]: !lastItem },
            { [styles.lastItem]: lastItem }
          )}
          dataurl={url}
          onClick={(e) => handlePathClick(e, id)}
          aria-hidden='true'
        >
          {name}
        </div>
      </>
    );
  };

  const handlePathClick = (e, id) => {
    let url = e?.currentTarget?.getAttribute('dataurl');
    if (urlPaths[urlPaths.length - 1]?.id === id) return;
    const clickedIndex = urlPaths?.findIndex((path) => path.id === id);
    urlPaths?.splice(clickedIndex + 1, urlPaths?.length - (clickedIndex + 1));
    setUrlPaths([...urlPaths]);
    handlePathClickEvent({ selectedPath: url, pathList: urlPaths });
  };

  return (
    <>
      <div className={cx(styles.root, 'd-flex', className)}>
        {showBackBtn && (
          <IconButton
            className={cx(styles.icon)}
            icon={ArrowLeft}
            onClick={handlePathClickEvent}
            size='small'
            variant='ghost'
          />
        )}
        {urlPaths.map((path, indx) => (
          <Crumb
            {...path}
            key={path.id}
            firstItem={indx === 0}
            lastItem={indx === urlPaths.length - 1}
          />
        ))}
      </div>
    </>
  );
};

export default BreadCrumbComponent;
