import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { getBoundingBoxPercentageValue } from 'new/utils/bboxes';

import { FieldValueBboxes } from '../Bboxes';

const ChatAIBboxes = ({ docMeta, chatAIBboxes }) => {
  const [bboxes, setbboxes] = useState([]);

  useEffect(() => {
    const updatedBboxes = chatAIBboxes?.length
      ? chatAIBboxes.map((fieldValueBbox) => {
          const rectanglePercentages = getBoundingBoxPercentageValue(
            fieldValueBbox.box,
            docMeta
          );

          return { ...fieldValueBbox, rectanglePercentages };
        })
      : [];

    setbboxes(updatedBboxes);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatAIBboxes]);

  return <FieldValueBboxes bboxes={bboxes} chatAIBox={true} />;
};

const mapStateToProps = (state) => {
  const { docId, documentsById, chatAIBboxes } = state.documents.reviewTool;

  const docMeta = documentsById[docId] || {};

  return {
    docMeta,
    chatAIBboxes,
  };
};

export default connect(mapStateToProps)(ChatAIBboxes);
