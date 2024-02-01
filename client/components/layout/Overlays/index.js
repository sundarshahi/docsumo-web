import React, { Fragment } from 'react';

import LoaderOverlay from 'components/overlays/LoaderOverlay';
import ToastOverlay from 'components/overlays/toast/ToastOverlay';
import UploadCsvProgressOverlay from 'components/overlays/UploadCsvProgressOverlay';
import UploadProgressOverlay from 'components/overlays/UploadProgressOverlay';

const Overlays = () => {
  return (
    <Fragment>
      <LoaderOverlay />
      <UploadProgressOverlay />
      <UploadCsvProgressOverlay />
      <ToastOverlay />
    </Fragment>
  );
};

export default Overlays;
