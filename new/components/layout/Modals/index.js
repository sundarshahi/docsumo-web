import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import AutoClassifyModal from 'new/components/modals/AutoClassifyModal';
import CSVUploadModal from 'new/components/modals/CsvUploadModal';
import DocDeleteConfirmationModal from 'new/components/modals/DocDeleteConfirmationModal';
import DocDownloadModal from 'new/components/modals/DocDownloadModal';
import DocPreviewModal from 'new/components/modals/DocPreviewModal';
import DocSettingModal from 'new/components/modals/DocSettingModal';
// import TooltipIntro from 'new/components/modals/TooltipIntro';
import DocShowAlertModal from 'new/components/modals/DocShowAlertModal';
import DocTypeSelectModal from 'new/components/modals/DocTypeSelectModal';
import DocUploadModal from 'new/components/modals/DocUploadModal';
import EditScreenPlayModal from 'new/components/modals/EditScreenPlayModal';
// import UserModal from 'new/components/pages/UserManagement/UserForm/index';
// import UserModal from 'new/components/pages/UserManagement/components/AddEditUserModal/AddEditUserModal';
import FeedbackForm from 'new/components/modals/FeedbackFormModal';
import FolderOption from 'new/components/modals/FolderOptionModal';
import IntroModal from 'new/components/modals/IntroModal';
import TrainModelModal from 'new/components/modals/TrainModelModal';
import UpgradedToProPlanModal from 'new/components/modals/UpgradedToProPlanModal';
import UploadDocumentModal from 'new/components/modals/UploadDocumentModal/UploadDocumentModal';
import UserTokenExpiredModal from 'new/components/modals/UserTokenExpiredModal';

const Modals = ({
  showCreateDocumentTypeModal,
  selectedDocumentType,
  showDoctypeSelectionModal,
  ...props
}) => {
  return (
    <Fragment>
      <DocDeleteConfirmationModal />
      <DocDownloadModal {...props} />
      {/* <TooltipIntro /> */}
      <DocUploadModal />
      <DocPreviewModal />
      <IntroModal />
      <UserTokenExpiredModal />
      <DocShowAlertModal />
      {/* <UserModal /> */}
      <FeedbackForm />
      <FolderOption />
      <DocSettingModal />
      <AutoClassifyModal />
      <DocTypeSelectModal />
      <CSVUploadModal />
      <TrainModelModal />
      <EditScreenPlayModal />
      <UpgradedToProPlanModal />
      {showCreateDocumentTypeModal && selectedDocumentType ? (
        <UploadDocumentModal />
      ) : null}
    </Fragment>
  );
};

function mapStateToProps(state) {
  const {
    showCreateDocumentTypeModal,
    selectedDocumentType,
    showDoctypeSelectionModal,
  } = state.documents;

  return {
    showCreateDocumentTypeModal,
    selectedDocumentType,
    showDoctypeSelectionModal,
  };
}

export default connect(mapStateToProps)(Modals);
