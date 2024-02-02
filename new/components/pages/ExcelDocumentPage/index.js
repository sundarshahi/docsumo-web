import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import { PageMetadata } from 'new/components/layout/page';
import SpreadsheetOverlay from 'new/components/overlays/SpreadsheetOverlay';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';

class ExcelDocumentPage extends Component {
  componentDidMount() {
    const { location, user = {}, config = {} } = this.props;
    const { canSwitchToOldMode = true } = config || {};

    const state = _.get(location, 'state') || {};

    mixpanel.track(MIXPANEL_EVENTS.view_doc_review, {
      type: 'Spreadsheet review',
      'work email': user?.email,
      origin: state.origin || 'Shareable link',
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  }

  render() {
    return (
      <Fragment>
        <PageMetadata title='Excel Document View' />
        <SpreadsheetOverlay />
      </Fragment>
    );
  }
}

function mapStateToProp({ app }) {
  const { user, config } = app;
  return {
    user: user,
    config,
  };
}

export default connect(mapStateToProp, null)(ExcelDocumentPage);
