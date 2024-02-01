import React, { useState } from 'react';
import { connect } from 'react-redux';

import HubspotMeetingPopup from 'new/components/modals/hubspot';

import DocTypeSelectModal from './DocTypeSelectModal';

const DocTypeSelectModalWrapper = ({ showDoctypeSelectionModal, user }) => {
  const [showHubSpotMeetingPopUp, setShowHubSpotMeetingPopUp] = useState(false);

  const handleHubSpotMeetingPopUpClose = () => {
    setShowHubSpotMeetingPopUp(false);
  };

  return (
    <div>
      {showDoctypeSelectionModal && (
        <DocTypeSelectModal
          setShowHubSpotMeetingPopUp={setShowHubSpotMeetingPopUp}
        />
      )}
      <HubspotMeetingPopup
        isOpen={showHubSpotMeetingPopUp}
        user={user}
        handleClose={handleHubSpotMeetingPopUpClose}
      />
    </div>
  );
};

function mapStateToProps(state) {
  const { showDoctypeSelectionModal } = state.documents;
  const { user } = state.app;

  return {
    showDoctypeSelectionModal,
    user,
  };
}

export default connect(mapStateToProps)(DocTypeSelectModalWrapper);
