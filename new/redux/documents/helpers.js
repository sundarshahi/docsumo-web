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
  const footerGridsById = {};

  sections.forEach((section) => {
    const sectionId = _.get(section, 'id');
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

      const urlParams = new URLSearchParams(window.location.search);
      const slugValue = urlParams.get('slug') || '';

      if (slugValue === 'editField') {
        transformEditFieldLineItemData(
          sectionField,
          fieldsToBeAdded,
          sectionFieldId,
          lineItemId,
          lineItemRowsById
        );
      } else {
        transformReviewScreenLineItemData(
          sectionField,
          footerGridsById,
          fieldsToBeAdded,
          sectionFieldId,
          lineItemId,
          lineItemRowsById
        );
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
    footerGridsById,
  };
};

const transformReviewScreenLineItemData = (
  sectionField = {},
  footerGridsById = {},
  fieldsToBeAdded = {},
  sectionFieldId = '',
  lineItemId = [],
  lineItemRowsById = {}
) => {
  if (sectionField.type === documentConstants.FIELD_TYPES.LINE_ITEM) {
    let allGridRows = [];
    let gridIds = [];

    /**
     * SectionField children holds multiple grids data in which
     * first grid first row is always grid header columns information
     */
    const header = Array.isArray(sectionField?.children[0][0])
      ? sectionField.children[0][0]
      : [];

    [sectionField?.children || []].forEach((tableGrids) => {
      const allRows = tableGrids.flat().slice(1);
      if (!allRows.length) return;
      allGridRows.push(...allRows);

      tableGrids.forEach((tableGrid, index) => {
        let gridId,
          pageNumber = '';

        if (index === 0 && tableGrid.length > 1) {
          const rows = tableGrid.slice(1);
          gridId = rows[0][0].gridId || null;
          pageNumber =
            typeof rows[0][0]?.content?.page === 'number'
              ? rows[0][0]?.content?.page + 1
              : null;
        } else {
          gridId = tableGrid[0][0]?.gridId || null;
          pageNumber =
            typeof tableGrid[0][0]?.content?.page === 'number'
              ? tableGrid[0][0]?.content?.page + 1
              : '';
        }

        if (gridId) {
          footerGridsById[gridId] = {
            page: pageNumber,
            confidence: documentConstants.FIELD_CONFIDENCE.HIGH,
            gridErrorFieldIds: [],
            gridLowConfidenceFieldIds: [],
            rowIds: [],
          };
          gridIds.push(gridId);
        }
      });
    });

    sectionField.gridIds = gridIds;

    sectionField.lineItemColumns = header.map((columnField) => {
      fieldsToBeAdded.push({
        parentType: 'line_item_section_field',
        parentId: sectionFieldId,
        field: columnField,
      });
      lineItemId.push(columnField?.idAutoExtract);
      return columnField;
    });

    sectionField.columnFieldIds = {};

    sectionField.lineItemRowIds = allGridRows.map((row) => {
      const rowFieldIds = [];
      let errorFieldIds = [];
      let lowConfidenceFieldIds = [];

      const gridId = row[0].gridId;

      row.forEach((rowField) => {
        const fieldId = rowField.id;

        rowFieldIds.push(fieldId);

        fieldsToBeAdded.push({
          parentType: 'line_item_section_field',
          parentId: sectionFieldId,
          field: rowField,
        });

        const column = rowField?.label || 'noLabel';

        if (!sectionField.columnFieldIds[column]) {
          sectionField.columnFieldIds[column] = [];
        }

        if (rowField?.content?.value) {
          sectionField.columnFieldIds[column] = [
            ...sectionField.columnFieldIds[column],
            fieldId,
          ];
        }

        if (!rowField?.content?.isValidFormat) {
          errorFieldIds.push(fieldId);

          if (footerGridsById[gridId]) {
            footerGridsById[gridId].confidence =
              documentConstants.FIELD_CONFIDENCE.ERROR;
          }
        }

        if (rowField?.lowConfidence) {
          lowConfidenceFieldIds.push(fieldId);

          if (
            footerGridsById[gridId] &&
            footerGridsById[gridId].confidence !==
              documentConstants.FIELD_CONFIDENCE.ERROR
          ) {
            footerGridsById[gridId].confidence =
              documentConstants.FIELD_CONFIDENCE.LOW;
          }
        }
      });

      const id = rowFieldIds.join('-');

      lineItemRowsById[id] = {
        id,
        fieldIds: rowFieldIds,
        errorFieldIds,
        lowConfidenceFieldIds,
        gridId: gridId,
      };

      if (footerGridsById[gridId]) {
        footerGridsById[gridId].rowIds.push(id);
        footerGridsById[gridId].gridErrorFieldIds.push(...errorFieldIds);
        footerGridsById[gridId].gridLowConfidenceFieldIds.push(
          ...lowConfidenceFieldIds
        );
      }

      return id;
    });
  }
};

const transformEditFieldLineItemData = (
  sectionField = {},
  fieldsToBeAdded = {},
  sectionFieldId = '',
  lineItemId = [],
  lineItemRowsById = {}
) => {
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
};

export const sortGrids = (gridsArr = []) => {
  if (gridsArr.length < 2) return gridsArr;

  // Sort the grids based on their topLeft and bottomRight values
  return gridsArr.sort(compareGrids);
};

// Function to compare two grids based on their topLeft and bottomRight values
const compareGrids = (a, b) => {
  const [Ax1, Ay1] = a.topLeft || a.top_left;
  const [, Ay2] = a.bottomRight || a.bottom_right;
  const [Bx1, By1] = b.topLeft || b.top_left;
  const [, By2] = b.bottomRight || b.bottom_right;

  // horizontally overlap grids
  if (
    (Ay1 < By1 && Ay2 > By1) ||
    Ay1 === By1 ||
    Ay2 === By2 ||
    (Ay1 > By1 && Ay1 < By2)
  ) {
    // horizontally sort grid
    if (Ax1 < Bx1) {
      return -1;
    } else {
      return 1;
    }
  } else {
    // vertically sort grid
    if (Ay1 < By1) {
      return -1;
    } else {
      return 1;
    }
  }
};

export const findNonOverlappingGrids = (grids) => {
  const filteredGrids = [];

  for (let i = 0; i < grids.length; i++) {
    let overlap = false;
    for (let j = 0; j < grids.length; j++) {
      if (i < j && gridOverlapped(grids[i], grids[j])) {
        overlap = true;
        break;
      }
    }

    if (!overlap) {
      filteredGrids.push(grids[i]);
    }
  }

  return filteredGrids;
};

export const isGridOverlapped = (gridsArr = []) => {
  if (gridsArr.length < 2) return false;

  for (let i = 0; i < gridsArr.length - 1; i++) {
    for (let j = i + 1; j < gridsArr.length; j++) {
      if (gridOverlapped(gridsArr[i], gridsArr[j])) {
        return true; // Overlapping grids found
      }
    }
  }

  return false; // No overlapping grids found
};

export const gridOverlapped = (a, b) => {
  const [Ax1, Ay1] = a.topLeft || a.top_left;
  const [Ax2, Ay2] = a.bottomRight || a.bottom_right;
  const [Bx1, By1] = b.topLeft || b.top_left;
  const [Bx2, By2] = b.bottomRight || b.bottom_right;

  // Check for horizontal overlap
  const horizontalOverlap = Ax1 < Bx2 && Ax2 > Bx1;

  // Check for vertical overlap
  const verticalOverlap = Ay1 < By2 && Ay2 > By1;

  // Check if there is any overlap in both horizontal and vertical directions
  if (horizontalOverlap && verticalOverlap) {
    return true;
  }
  return false;
};

export const getGridConfidenceValue = (footerGrid) => {
  let confidenceValue = documentConstants.FIELD_CONFIDENCE.HIGH;

  if (footerGrid.gridErrorFieldIds.length) {
    confidenceValue = documentConstants.FIELD_CONFIDENCE.ERROR;
  } else if (footerGrid.gridLowConfidenceFieldIds.length) {
    confidenceValue = documentConstants.FIELD_CONFIDENCE.LOW;
  } else {
    confidenceValue = documentConstants.FIELD_CONFIDENCE.HIGH;
  }

  return confidenceValue;
};
