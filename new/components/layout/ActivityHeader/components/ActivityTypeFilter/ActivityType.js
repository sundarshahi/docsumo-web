import React from 'react';

import { AllActivityComponent } from './AllActivityComponent';
export const ActivityType = (props) => {
  const {
    activityOptions = [],
    isAll = false,
    activityFilter = [],
    handleChangeFilterSubType,
  } = props;

  return (
    <AllActivityComponent
      activityOptions={activityOptions}
      activityFilter={activityFilter}
      handleChangeFilterSubType={handleChangeFilterSubType}
      isAll={isAll}
    />
  );
};
