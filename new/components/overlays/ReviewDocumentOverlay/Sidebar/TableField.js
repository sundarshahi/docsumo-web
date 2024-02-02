import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions as documentActions } from 'new/redux/documents/actions';

import cx from 'classnames';
import { Cell2X2, Check, EyeEmpty, WarningTriangle } from 'iconoir-react';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import { focusAndScrollTo } from 'new/utils/focusAndScrollTo';
import { mixpanelTrackingAllEvents } from 'new/utils/mixpanel';

import styles from './TableField.scss';

const confidenceIcons = {
  low: <EyeEmpty height={20} width={20} />,
  high: <Check height={20} width={20} />,
  error: <WarningTriangle height={20} width={20} />,
};

const TableField = () => {
  const dispatch = useDispatch();

  const {
    footerGridsById,
    selectedSectionFieldId,
    selectedFieldId,
    fieldsById,
    selectedGridId,
    grids,
    documentsById,
    docId,
  } = useSelector((state) => state.documents.reviewTool);

  const handleGridClick = (key) => {
    dispatch(
      documentActions.rtSetCurrentGridId({
        gridId: key,
      })
    );

    mixpanelTrackingAllEvents(MIXPANEL_EVENTS.grid_navigation_sidebar);
  };

  useEffect(() => {
    const docMeta = documentsById[docId] || null;

    /**
     * Check to escape changing selectedFieldId to first field of first line item if it falls under same grid.
     */
    const selectedField = fieldsById[selectedFieldId];

    if (selectedField?.gridId === selectedGridId) return;

    focusAndScrollTo(
      selectedGridId,
      docMeta,
      grids,
      fieldsById,
      footerGridsById
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGridId]);

  return (
    <div className={styles.table}>
      {(fieldsById[selectedSectionFieldId]?.gridIds || []).map(
        (gridId, index) => {
          const grid = footerGridsById[gridId] || {};
          return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div
              key={index}
              className={styles.table__col}
              onClick={() => handleGridClick(gridId)}
            >
              <div className={styles.lhs}>
                <span
                  className={cx(
                    styles.lhs__icon,
                    styles[`lhs__icon--${grid.confidence}`]
                  )}
                >
                  {confidenceIcons[grid?.confidence]}
                </span>
                <span
                  className={cx(styles.lhs__gridLabel, {
                    [styles.gridLabelColorPrimary]: gridId === selectedGridId,
                  })}
                >
                  Grid {index + 1}
                </span>
                {grid?.page ? (
                  <div className={styles.lhs__pageLabelContainer}>
                    <span
                      className={cx({
                        [styles.gridLabelColorPrimary]:
                          gridId === selectedGridId,
                      })}
                    >
                      Page {grid?.page || ''}
                    </span>
                  </div>
                ) : null}
              </div>
              <div className={styles.rhs}>
                <span
                  className={cx({
                    [styles.gridLabelColorPrimary]: gridId === selectedGridId,
                  })}
                >
                  {grid?.rowIds?.length}
                </span>
                <Cell2X2 className={styles.rhs__icon} />
              </div>
            </div>
          );
        }
      )}
    </div>
  );
};

export default TableField;
