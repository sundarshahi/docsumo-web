import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { getBoundingBoxPercentageValue } from 'new/utils/bboxes';

import { FieldValueBboxes } from '../Bboxes';

const SearchMatchBboxes = ({ docuSearchBbox, docMeta }) => {
  const [bboxes, setbboxes] = useState([]);

  useEffect(() => {
    const updatedBboxes = docuSearchBbox
      ? docuSearchBbox.map((fieldValueBbox) => {
          const rectanglePercentages = getBoundingBoxPercentageValue(
            fieldValueBbox.box,
            docMeta
          );

          return { ...fieldValueBbox, rectanglePercentages };
        })
      : [];

    setbboxes(updatedBboxes);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docuSearchBbox]);

  return <FieldValueBboxes bboxes={bboxes} />;
};

const mapStateToProps = (state) => {
  const { docId, documentsById, docuSearchBbox } = state.documents.reviewTool;

  const docMeta = documentsById[docId] || {};

  return {
    docMeta,
    docuSearchBbox,
  };
};

export default connect(mapStateToProps)(SearchMatchBboxes);
