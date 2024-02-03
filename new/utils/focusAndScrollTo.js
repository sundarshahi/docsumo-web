import * as documentHelpers from 'new/helpers/documents';

export const focusAndScrollTo = (
  selectedGridId = '',
  docMeta = {},
  grids = {},
  fieldsById = {},
  footerGridsById = {}
) => {
  const lineItemRowIds = footerGridsById[selectedGridId]?.rowIds || [];
  const firstItemId = lineItemRowIds[0]?.split('-')[0];

  const firstItemReference = document.getElementById(
    `line-item-field-input-${firstItemId}`
  );

  if (firstItemReference) {
    firstItemReference.focus();

    if (fieldsById[firstItemId]?.content?.position?.length === 0) {
      const selectedGrid = grids?.find((item) => item.id === selectedGridId);
      if (selectedGrid) {
        const { width: docWidth, height: docHeight } = docMeta;

        const fieldPosition = documentHelpers.computeFieldPositions({
          docWidth,
          docHeight,
          rectangle: selectedGrid.position,
        });

        const domEl = document.getElementById('rt-document');
        const { width, height } = domEl.getBoundingClientRect();
        const documentWrapperNode = document.getElementById(
          'rt-document-wrapper'
        );

        let styleTopAbs = (fieldPosition.position.top / 100) * height;
        let styleLeftAbs = (fieldPosition.position.left / 100) * width;
        let scrollX = styleLeftAbs;
        let scrollY = styleTopAbs;

        if (scrollX > 100) {
          scrollX -= 100;
        }

        if (scrollY > 80) {
          scrollY -= 80;
        }

        documentWrapperNode && documentWrapperNode.scrollTo(scrollX, scrollY);
      }
    }
  }
};
