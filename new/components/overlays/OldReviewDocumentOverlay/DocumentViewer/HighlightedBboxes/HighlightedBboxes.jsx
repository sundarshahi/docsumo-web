import React, { Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import _ from 'lodash';
import { getBoundingBoxPercentageValue } from 'new/utils/bboxes';

import { FieldValueBbox } from '../Bboxes';

const HighlightedBboxes = ({
  docMeta,
  sectionFieldIds,
  fieldsById,
  selectedFieldId,
  visiblePages,
}) => {
  const [bboxesByPage, setBboxesByPage] = useState({});

  const { height, pages } = docMeta;

  useEffect(() => {
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
      const position = field?.content?.position;
      const isSelectedField = selectedFieldId === field.id;

      if (position && _.isArray(position) && !_.isEmpty(position)) {
        const pageNumber = Math.ceil(position[1] / imageHeight) || 1;

        let isAlreadyPresent = isPositionDuplicated(position);

        const rectanglePercentages = getBoundingBoxPercentageValue(
          position,
          docMeta
        );

        const transformedValue = {
          fieldId: field.id,
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

          field.children.forEach((row) => {
            row.forEach((columnField) => {
              transformFieldToBboxes(columnField);
            });
          });
        }
      });

      setBboxesByPage(bboxesByPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFieldId]);

  return (
    <Fragment>
      {visiblePages.map((pageNumber) => {
        return Array.isArray(bboxesByPage[pageNumber])
          ? bboxesByPage[pageNumber].map((bbox) => {
              return <FieldValueBbox key={bbox.fieldId} bbox={bbox} />;
            })
          : null;
      })}
    </Fragment>
  );
};

const mapStateToProps = (state) => {
  const { docId, documentsById, sectionFieldIds, fieldsById, selectedFieldId } =
    state.documents.reviewTool;

  const docMeta = documentsById[docId] || {};

  return {
    docMeta,
    sectionFieldIds,
    fieldsById,
    selectedFieldId,
  };
};

export default connect(mapStateToProps)(HighlightedBboxes);
