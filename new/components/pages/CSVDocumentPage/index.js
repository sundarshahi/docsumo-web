import React, { Component, Fragment } from 'react';

import { PageMetadata } from 'new/components/layout/page';
import CSVLayoutOverlay from 'new/components/overlays/CSVLayoutOverlay';
import { Portal } from 'react-portal';

class CSVDocumentPage extends Component {
  render() {
    return (
      <Fragment>
        <PageMetadata title='CSV Document' />
        <Portal>
          <CSVLayoutOverlay />
        </Portal>
      </Fragment>
    );
  }
}

export default CSVDocumentPage;
