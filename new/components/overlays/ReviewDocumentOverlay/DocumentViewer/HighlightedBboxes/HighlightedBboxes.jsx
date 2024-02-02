import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import _ from 'lodash';

import HighlightedBbox from '../HighlightedBbox';

const HighlightedBboxes = ({
  gridView,
  isLineItem,
  bboxClickType,
  handleBboxViewer,
  visiblePages,
  selectedSectionFieldId,
}) => {
  const [bboxesByPage, setBboxesByPage] = useState({});

  const { docId, documentsById, sectionFieldIds, fieldsById, selectedFieldId } =
    useSelector((state) => state.documents.reviewTool);

  useEffect(() => {
    const docMeta = documentsById[docId] || {};
    const { pages, height } = docMeta;

    const bboxes = [];
    const bboxesByPage = [];
    const uniqueRectangularCoodinates = [];
    const imageHeight = height / pages?.length;

    const isPositionDuplicated = (position) => {
      let isAlreadyPresent = false;

      const positionString = position.join('-');

      if (uniqueRectangularCoodinates.includes(positionString)) {
        isAlreadyPresent = true;
      } else {
        uniqueRectangularCoodinates.push(positionString);
      }

      return isAlreadyPresent;
    };

    const transformFieldToBboxes = (field) => {
      const position = field?.uiRectangle || field?.content?.position;
      const isSelectedField = selectedFieldId === field?.id;

      if (position && _.isArray(position) && !_.isEmpty(position)) {
        const pageNumber = Math.ceil(position[1] / imageHeight) || 1;

        let isAlreadyPresent = isPositionDuplicated(position);

        const rectanglePercentages = field?.uiRectanglePercentages;

        const transformedValue = {
          fieldId: field.id,
          field: field,
          rectangle: position,
          isSelectedField,
          rectanglePercentages,
          page: pageNumber,
          isAlready: isAlreadyPresent,
        };

        bboxes.push(transformedValue);
        bboxesByPage[pageNumber] = [
          ...(bboxesByPage[pageNumber] || []),
          transformedValue,
        ];
      }
    };

    if (Array.isArray(sectionFieldIds)) {
      sectionFieldIds.forEach((fieldId) => {
        const field = fieldsById[fieldId];

        transformFieldToBboxes(field);

        if (field.type === 'line_item') {
          if (!field.children || !Array.isArray(field.children)) return;

          field.children.forEach((grid) => {
            const rows = grid.flat();

            rows.forEach((column) => {
              const columnField = fieldsById[column.id];
              transformFieldToBboxes(columnField);
            });
          });
        }
      });

      setBboxesByPage(bboxesByPage);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFieldId, fieldsById]);

  return (
    <Fragment>
      {visiblePages.map((pageNumber) => {
        return Array.isArray(bboxesByPage[pageNumber])
          ? bboxesByPage[pageNumber].map((bbox) => {
              return (
                <HighlightedBbox
                  key={bbox.fieldId}
                  bbox={bbox}
                  handleBboxViewer={handleBboxViewer}
                  gridView={gridView}
                  isLineItem={isLineItem}
                  bboxClickType={bboxClickType}
                  selectedSectionFieldId={selectedSectionFieldId}
                />
              );
            })
          : null;
      })}
    </Fragment>
  );
};

export default React.memo(HighlightedBboxes);
