import React, { Fragment } from 'react';

import UpgradedToProPlanModal from 'client/components/modals/UpgradedToProPlanModal';

import CSVUploadModal from 'components/modals/CsvUploadModal';
import DocDeleteConfirmationModal from 'components/modals/DocDeleteConfirmationModal';
import DocDownloadModal from 'components/modals/DocDownloadModal';
import DocFilterModal from 'components/modals/DocFilterModal';
import DocPreviewModal from 'components/modals/DocPreviewModal';
import DocSettingModal from 'components/modals/DocSettingModal';
// import TooltipIntro from 'components/modals/TooltipIntro';
import DocShowAlertModal from 'components/modals/DocShowAlertModal';
import DocUploadModal from 'components/modals/DocUploadModal';
import EditScreenPlayModal from 'components/modals/EditScreenPlayModal';
// import UserModal from 'components/pages/UserManagement/UserForm/index';
// import UserModal from 'components/pages/UserManagement/components/AddEditUserModal/AddEditUserModal';
import FeedbackForm from 'components/modals/FeedbackFormModal';
import FolderOption from 'components/modals/FolderOptionModal';
import IntroModal from 'components/modals/IntroModal';
import TrainModelModal from 'components/modals/TrainModelModal';
import UserTokenExpiredModal from 'components/modals/UserTokenExpiredModal';

const Modals = (props) => {
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
      <DocFilterModal />
      {/* <UserModal /> */}
      <FeedbackForm />
      <FolderOption />
      <DocSettingModal />
      <CSVUploadModal />
      <TrainModelModal />
      <EditScreenPlayModal />
      <UpgradedToProPlanModal />
    </Fragment>
  );
};

export default Modals;
