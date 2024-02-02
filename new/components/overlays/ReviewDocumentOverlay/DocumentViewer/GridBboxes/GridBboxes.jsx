import React, { Fragment, memo, useEffect, useState } from 'react';

import GridBbox from '../GridBbox';

const GridBboxes = memo((props) => {
  const { bboxes, gridIndexes = [] } = props;
  const [hideAllGridBBoxes, setHideAllGridBboxes] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (
        e.target.closest('.js-grid-bbox-item') ||
        e.target.closest('.js-suggestion-bbox-item') ||
        e.target.closest('.js-highlighted-bbox-item') ||
        e.target.closest('.js-grid-bbox-add')
      ) {
        setHideAllGridBboxes(false);
      } else {
        setHideAllGridBboxes(true);
      }
    };

    document.body.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.body.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <Fragment>
      {bboxes
        .filter(
          (bbox) => !gridIndexes.includes(bbox.index) && !bbox.isOverlapped
        )
        .map((bbox) => {
          return (
            <GridBbox
              key={bbox.uuid}
              bbox={bbox}
              hideAllGridBBoxes={hideAllGridBBoxes}
            />
          );
        })}
    </Fragment>
  );
});

export default GridBboxes;
