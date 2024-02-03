import _ from 'lodash';
import * as documentConstants from 'new/constants/document';

export const transformColumnFieldsData = ({ field, parentType, parentId }) => {
  const content = _.get(field, 'content') || {};
  const uiValue = content.value;
  const uiLabel = _.get(field, 'label');
  const uiIsValidFormat = !_.isUndefined(content.isValidFormat)
    ? content.isValidFormat
    : true;

  return {
    ...field,
    _parentType: parentType,
    _parentId: parentId,
    uiValue,
    uiLabel,
    uiIsValidFormat,
  };
};

export function computeFieldPositions({ docWidth, docHeight, rectangle }) {
  let rectanglePercentages = null;
  let position = null;

  if (rectangle && _.isArray(rectangle) && !_.isEmpty(rectangle)) {
    const [x1, y1, x2, y2] = rectangle;
    const x1Percentage = (x1 / docWidth) * 100;
    const y1Percentage = (y1 / docHeight) * 100;
    const x2Percentage = (x2 / docWidth) * 100;
    const y2Percentage = (y2 / docHeight) * 100;

    const top = _.round(y1Percentage, 4);
    const left = _.round(x1Percentage, 4);
    const width = _.round(x2Percentage - x1Percentage, 4);
    const height = _.round(y2Percentage - y1Percentage, 4);

    rectanglePercentages = [
      x1Percentage,
      y1Percentage,
      x2Percentage,
      y2Percentage,
    ];
    position = {
      top,
      left,
      width,
      height,
    };
  }

  return {
    rectangle,
    rectanglePercentages,
    position,
  };
}

export const transformToReviewToolData = ({
  sections,
  docWidth,
  docHeight,
}) => {
  const sectionIds = [];
  const sectionsById = {};
  const fieldsById = {};
  const sectionFieldIds = [];
  const lineItemRowsById = {};
  const fieldsToBeAdded = [];
  const lineItemId = [];

  sections?.forEach((section) => {
    const sectionId = _.get(section, 'id') || '';
    const sectionChildren = _.get(section, 'children') || [];
    const fieldIds = [];

    sectionChildren?.forEach((sectionField) => {
      const sectionFieldId = _.get(sectionField, 'id');
      const parentType = 'section';
      const parentId = sectionId;

      fieldIds.push(sectionFieldId);

      if (!sectionField?.isHidden) {
        sectionFieldIds.push(sectionFieldId);
      }

      if (sectionField?.type === documentConstants.FIELD_TYPES.LINE_ITEM) {
        const sectionFieldChildren = sectionField?.children;
        const [columns = [], ...rows] = sectionFieldChildren;
        sectionField.lineItemColumns = columns?.map((columnField) => {
          fieldsToBeAdded.push({
            parentType: 'line_item_section_field',
            parentId: sectionFieldId,
            field: columnField,
          });
          lineItemId.push(columnField?.idAutoExtract);
          return columnField;
        });

        sectionField.lineItemRowIds = rows?.map((row) => {
          const rowFieldIds = [];
          row?.forEach((rowField) => {
            rowFieldIds.push(rowField?.id);
            fieldsToBeAdded.push({
              parentType: 'line_item_section_field',
              parentId: sectionFieldId,
              field: rowField,
            });
          });

          const id = rowFieldIds.join('-');

          lineItemRowsById[id] = {
            id,
            fieldIds: rowFieldIds,
          };

          return id;
        });
      }

      fieldsToBeAdded.push({
        parentType,
        parentId,
        field: sectionField,
      });
    });

    sectionIds.push(sectionId);
    sectionsById[sectionId] = {
      ...section,
      fieldIds,
    };
  });

  fieldsToBeAdded.forEach(({ field, parentType, parentId }) => {
    const fieldId = _.get(field, 'id') || '';
    const content = _.get(field, 'content') || {};
    const uiValue = content?.value;
    const uiLabel = _.get(field, 'label');
    const uiIsValidFormat = !_.isUndefined(content?.isValidFormat)
      ? content?.isValidFormat
      : true;
    const fieldPositions = computeFieldPositions({
      rectangle: content?.position,
      docWidth,
      docHeight,
    });
    const labelPositions = computeFieldPositions({
      rectangle: content?.positionLabel,
      docWidth,
      docHeight,
    });
    const uiRectangle = fieldPositions?.rectangle;
    const uiRectanglePercentages = fieldPositions?.rectanglePercentages;
    const uiPosition = fieldPositions?.position;
    const uiLabelRectangle = labelPositions?.rectangle;
    const uiLabelRectanglePercentages = labelPositions?.rectanglePercentages;
    const uiLabelPosition = labelPositions?.position;
    fieldsById[fieldId] = {
      ...field,
      _parentType: parentType,
      _parentId: parentId,
      uiValue,
      uiLabel,
      uiIsValidFormat,
      uiRectangle,
      uiRectanglePercentages,
      uiPosition,
      uiLabelRectangle,
      uiLabelRectanglePercentages,
      uiLabelPosition,
    };
  });

  return {
    sectionIds,
    sectionsById,
    fieldsById,
    sectionFieldIds,
    lineItemRowsById,
    lineItemId,
  };
};
