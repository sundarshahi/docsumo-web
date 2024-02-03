import _ from 'lodash';

export function getFormattedData(data) {
  if (_.isEmpty(data) || _.isEmpty(data.rows)) return [];

  const isRowEmpty = (row) => {
    if (!row || !row.length) return true;

    if (row.filter((cell) => cell.value).length) return false;

    return true;
  };

  const sheetRows = data.rows;

  const formattedData = [];

  for (let i = 0; i < sheetRows.length; i++) {
    if (!isRowEmpty(sheetRows[i].cells)) {
      let row = [];
      sheetRows[i].cells.map((cell, cellIndex) => {
        const headerRow = sheetRows[0] || {};
        const columnHeader =
          headerRow && headerRow.cells[cellIndex]
            ? headerRow.cells[cellIndex].value
            : '';
        const type = i < 2 ? 'header' : 'value'; // first 2 rows are always header
        row.push({
          type,
          value: cell.value,
          columnHeader,
        });
      });

      formattedData.push(row);
    }
  }

  return formattedData;
}
