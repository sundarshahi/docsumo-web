import { format } from 'date-fns';
import _ from 'lodash';
import * as documentConstants from 'new/constants/document';
import * as utils from 'new/utils';

export function generateDateFilterRanges() {
  const now = new Date();
  const day = 60 * 60 * 24 * 1000;

  const dateRanges = [
    {
      // Today
      name: 'Today',
      gte: new Date(now.getTime()),
      lte: new Date(now.getTime()),
    },
    {
      // Yesterday
      name: 'Yesterday',
      gte: new Date(now.getTime() - day),
      lte: new Date(now.getTime() - day),
    },
    {
      // Last 7 days
      name: 'Last 7 days',
      gte: new Date(now.getTime() - 6 * day),
      lte: new Date(now.getTime()),
    },
    {
      // Last 14 days
      name: 'Last 14 days',
      gte: new Date(now.getTime() - 13 * day),
      lte: new Date(now.getTime()),
    },
    {
      // Last 28 days
      name: 'Last 28 days',
      gte: new Date(now.getTime() - 27 * day),
      lte: new Date(now.getTime()),
    },
  ];

  const ranges = [
    {
      name: 'All time',
      queryParamValue: [],
      displayValue: '',
      gte: {},
      lte: {},
    },
  ];

  dateRanges.forEach((dateRange) => {
    const gteValue = format(dateRange.gte, 'yyyy-MM-dd');
    const lteValue = format(dateRange.lte, 'yyyy-MM-dd');
    const gteDisplayValue = format(dateRange.gte, 'LLL dd, yyyy');
    const lteDisplayValue = format(dateRange.lte, 'LLL dd, yyyy');
    ranges.push({
      name: dateRange.name,
      queryParamValue: [`gte:${gteValue}`, `lte:${lteValue}`],
      displayValue:
        gteDisplayValue === lteDisplayValue
          ? gteDisplayValue
          : `${gteDisplayValue} - ${lteDisplayValue}`,
      gte: {
        value: gteValue,
        displayValue: gteDisplayValue,
      },
      lte: {
        value: lteValue,
        displayValue: lteDisplayValue,
      },
    });
  });

  return ranges;
}

export function getActiveDateFilterRange(ranges, paramValue) {
  const paramRange = utils.getQueryParamDateRangeAsObject(paramValue);

  for (let range of ranges) {
    if (
      range.gte.value === paramRange.gte &&
      range.lte.value === paramRange.lte
    ) {
      return range;
    }
  }

  return {
    name: 'Custom',
    gte: {
      value: paramRange.gte,
      displayValue: format(paramRange.gte, 'LLL dd, yyyy'),
    },
    lte: {
      value: paramRange.lte,
      displayValue: format(paramRange.lte, 'LLL dd, yyyy'),
    },
  };
}

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

export function computePRPosition({
  top,
  left,
  width,
  height,
  docWidth,
  docHeight,
}) {
  const PX1 = left;
  const PY1 = top;
  const PX2 = width + PX1;
  const PY2 = height + PY1;

  const x1 = (PX1 / 100) * docWidth;
  const x2 = (PX2 / 100) * docWidth;
  const y1 = (PY1 / 100) * docHeight;
  const y2 = (PY2 / 100) * docHeight;

  return [x1, y1, x2, y2];
}

export function isValidFieldValue({ fieldType, value }) {
  let isValidValue = true;

  /* eslint-disable indent */
  switch (fieldType) {
    case documentConstants.FIELD_TYPES.NUMBER: {
      const isValidNumber =
        !isNaN(value) || !!value.match(/^\d{1,3}(,\d{2,3})*(\.\d{1,4})?$/);
      isValidValue = isValidNumber;
      break;
    }

    case documentConstants.FIELD_TYPES.PERCENT: {
      const isValidNumber = !isNaN(value);
      isValidValue = isValidNumber;
      break;
    }

    case documentConstants.FIELD_TYPES.DATE: {
      if (!value) {
        isValidValue = true;
      } else {
        isValidValue = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      }
      break;
    }

    case documentConstants.FIELD_TYPES.STRING: {
      isValidValue = true;
      break;
    }
  }
  /* eslint-enable indent */

  return isValidValue;
}
