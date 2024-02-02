import React, { Component, Fragment } from 'react';

import { PageMetadata } from 'new/components/layout/page';
import { Portal } from 'react-portal';

import OriginalFilePreviewOverlay from './OriginalFilePreviewOverlay';

class OriginalFilePreview extends Component {
  render() {
    return (
      <Fragment>
        <PageMetadata title='Original File Preview' />
        <Portal>
          <OriginalFilePreviewOverlay />
        </Portal>
      </Fragment>
    );
  }
}

export default OriginalFilePreview;
