import React, { Fragment } from 'react';

import DarkOverlay from 'new/components/overlays/DarkOverlay';
import LoaderOverlay from 'new/components/overlays/LoaderOverlay';
import UploadCsvProgressOverlay from 'new/components/overlays/UploadCsvProgressOverlay';
import UploadProgressOverlay from 'new/components/overlays/UploadProgressOverlay/UploadProgressOverlay';

const Overlays = () => {
  return (
    <Fragment>
      <LoaderOverlay />
      <UploadProgressOverlay />
      <UploadCsvProgressOverlay />
      <DarkOverlay />
    </Fragment>
  );
};

export default Overlays;
