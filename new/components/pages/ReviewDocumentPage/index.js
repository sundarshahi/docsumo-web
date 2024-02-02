import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import { TrackingProvider } from 'new/components/contexts/tracking';
import { PageMetadata } from 'new/components/layout/page';
import OldReviewDocumentOverlay from 'new/components/overlays/OldReviewDocumentOverlay';
import ReviewDocumentOverlay from 'new/components/overlays/ReviewDocumentOverlay';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';

class ReviewDocumentPage extends Component {
  componentDidMount() {
    const { location, user, config } = this.props;
    const { canSwitchToOldMode = true } = config || {};

    const state = _.get(location, 'state') || {};

    mixpanel.track(MIXPANEL_EVENTS.view_doc_review, {
      type: 'Document review',
      'work email': user?.email,
      origin: state.origin || 'Shareable link',
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  }

  render() {
    const { location, config } = this.props;
    const searchParams = new URLSearchParams(location?.search);
    const slug = _.get(location, 'state.slug') || searchParams?.get('slug');

    return (
      <Fragment>
        <PageMetadata title={slug ? 'Edit Document' : 'Review Document'} />
        <TrackingProvider>
          {config?.featureFlags?.tableGridsNewUi ? (
            <ReviewDocumentOverlay />
          ) : (
            <OldReviewDocumentOverlay />
          )}
        </TrackingProvider>
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

export default connect(mapStateToProp, null)(ReviewDocumentPage);
