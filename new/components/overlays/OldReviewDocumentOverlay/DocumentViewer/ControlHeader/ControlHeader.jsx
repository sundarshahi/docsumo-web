import React, { useEffect, useMemo, useState } from 'react';

import cx from 'classnames';
import {
  Collapse,
  Cut,
  DocSearchAlt,
  Expand,
  ZoomIn,
  ZoomOut,
} from 'iconoir-react';
import { DOCUMENT_ZOOM_VALUE } from 'new/constants/document';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Tooltip from 'new/ui-elements/Tooltip';
import { getOS } from 'new/utils';

import styles from './ControlHeader.scss';

const ControlHeader = ({
  zoom,
  zoomed,
  currentPage,
  searchable,
  pages,
  showSplitDocument,
  handlePageChange,
  handleSplitDocument,
  handleSearchClick,
  handleShrinkExpandButtonClick,
  handleZoomInClick,
  handleZoomOutClick,
  setDebouncedZoom,
  showSearch = true,
}) => {
  const [nonDebouncedZoom, setNonDebouncedZoom] = useState(
    zoom || DOCUMENT_ZOOM_VALUE.BASE
  );
  const isMacOS = getOS() === 'MacOS';

  useEffect(() => {
    if (zoom !== nonDebouncedZoom) {
      setNonDebouncedZoom(zoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  const handleZoomValueChange = (e) => {
    const newValue = parseInt(e.target.value);
    setNonDebouncedZoom(newValue);
    setDebouncedZoom(newValue);
  };

  const sliderWidth = useMemo(
    () =>
      ((nonDebouncedZoom - DOCUMENT_ZOOM_VALUE.MIN) /
        (DOCUMENT_ZOOM_VALUE.MAX - DOCUMENT_ZOOM_VALUE.MIN)) *
      100,
    [nonDebouncedZoom]
  );

  return (
    <div>
      <div className={cx(styles.controls)}>
        <div className={styles.zoom}>
          <Tooltip label={`Zoom Out (${isMacOS ? 'Cmd' : 'Ctrl'} + -)`}>
            <IconButton
              className={cx(styles.zoomIconBtn)}
              onClick={handleZoomOutClick}
              disabled={zoom <= DOCUMENT_ZOOM_VALUE.MIN}
              icon={<ZoomOut />}
              variant='text'
            />
          </Tooltip>
          <div
            className={styles.slider_wrap}
            style={{
              '--slider-width': sliderWidth > 100 ? '100%' : `${sliderWidth}%`,
            }}
          >
            <input
              type='range'
              min={DOCUMENT_ZOOM_VALUE.MIN}
              max={DOCUMENT_ZOOM_VALUE.MAX}
              value={nonDebouncedZoom || ''}
              className={styles.slider}
              id='myRange'
              onChange={handleZoomValueChange}
            />
          </div>
          <Tooltip label={`Zoom In (${isMacOS ? 'Cmd' : 'Ctrl'} + +)`}>
            <IconButton
              className={cx(styles.zoomIconBtn)}
              onClick={handleZoomInClick}
              disabled={zoom >= DOCUMENT_ZOOM_VALUE.MAX}
              icon={<ZoomIn />}
              variant='text'
            />
          </Tooltip>
        </div>
        <span title='Zoom Percent' className={cx(styles.zoomPercent)}>
          {zoom}%
        </span>
        <Tooltip label={zoomed ? 'Shrink Document' : 'Expand Document'}>
          <IconButton
            className={cx(styles.iconBtn)}
            onClick={handleShrinkExpandButtonClick}
            icon={zoomed ? <Collapse /> : <Expand />}
            variant='text'
          />
        </Tooltip>

        {showSplitDocument && (
          <>
            <Tooltip
              tooltipOverlayClassname={styles.longTooltip}
              label={`Split Document (${isMacOS ? 'Cmd' : 'Ctrl'} + Shift + S)`}
            >
              <IconButton
                className={cx(styles.iconBtn, styles.splitIcon)}
                onClick={handleSplitDocument}
                icon={<Cut />}
                variant='text'
              />
            </Tooltip>
          </>
        )}
        {showSearch && (
          <Tooltip
            tooltipOverlayClassname={styles.longTooltip}
            label={`Find text on document (${isMacOS ? 'Cmd' : 'Ctrl'} + F)`}
          >
            <IconButton
              className={cx(styles.iconBtn)}
              onClick={() => handleSearchClick(true)}
              disabled={searchable}
              icon={<DocSearchAlt className={styles.searchIcon} />}
              variant='text'
            />
          </Tooltip>
        )}

        <div className={styles.inputPageNumber}>
          <input
            type='number'
            className={styles.pageInput}
            value={currentPage}
            onChange={handlePageChange}
            title='Current Page'
            data-hj-allow
          />
          <span className={styles.slashSeparator}>/</span>
          <span
            title='Total Pages'
            className={cx('unstyled-btn', styles.totalPageCount)}
          >
            {pages.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ControlHeader);
