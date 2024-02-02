import React from 'react';

import { DateRangePicker } from 'react-date-range';
import { DateRange } from 'react-date-range';

import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css';

const FullDatePicker = (props) => (
  <DateRangePicker {...props} rangeColors={['#4d61fc']} />
);
const HalfDatePicker = (props) => (
  <DateRange {...props} rangeColors={['#4d61fc']} />
);

export { FullDatePicker, HalfDatePicker };
