/* chameleon.io NPM script */
import _ from 'lodash';

const chmln = require('@chamaeleonidae/chmln');

/* NOTE: Chameleon is not rendered inside an iFrame, 
   therefore its easier to target the Chameleon elements
*/

// Chameleon tooltip container element ids
export const CHAMELEON_TOOLTIP_CONTAINER_IDS = {
  uploadProcessing: 'chmln-step-dialog-649439335b5ecf54d383ccae',
  uploadReview: 'chmln-step-dialog-649535b64dcbe900198b47ad',
};

export const NEW_USER_FLAGS = {
  show_upload_processing: true,
  show_uploaded_file_review: true,
  show_sample_review: true,
  show_phase_1: true,
  show_phase_2: true,
  show_phase_3_1: true,
  show_phase_3_2: true,
  show_phase_4: true,
  show_phase_5: true,
  show_phase_6: true,
  show_spreadsheet_phase_1: true,
  show_spreadsheet_phase_2: true,
  show_edit_fields_phase_1: true,
  show_edit_fields_phase_2: true,
  show_custom_doctype: true,
  happy_path_complete: false,
};

export const CHAMLEON_TOUR_IDS = {
  sampleFileReview: '6493c73d5b5ecf0018d7cfd1',
  reviewScreenPhase1: '646b4e623123734ee411c09e',
  reviewScreenPhase3_noGrids: '646ca984fa4903001ad3bc57',
  reviewScreenPhase3_tableGrid: '6492af1eb643820014188c21',
  reviewScreenPhase4: '647d8af7615296627895d111',
  reviewScreenPhase5: '647d982cc344f33da99256e4',
  spreadsheetReviewPhase1: '6493d7654241240013652a36',
  spreadsheetReviewPhase2: '6493db34424124001aa73528',
  editFieldsPhase1: '6493de435b5ecf0017b8b613',
  editFieldsPhase2: '',
  uploadProcessing: '649438b95b5ecf54d383cc8b',
  uploadReview: '649535944dcbe90011e3b850',
  customDoctype: '655c2f5e4613f00018660155',
};

const REVIEW_SCREEN_TOURS = {
  reviewScreenPhase1: 'show_phase_1', // First and second step of review screen
  reviewScreenPhase2: 'show_phase_2', // For warning icon in review screen
  reviewScreenPhase3_noGrids: 'show_phase_3_1', // When there's no table grid or table bbox
  reviewScreenPhase3_tableGrid: 'show_phase_3_2', // When there's no table grid but has table bbox
  reviewScreenPhase4: 'show_phase_4', // For Apply Changes
  reviewScreenPhase5: 'show_phase_5', // After user clicks on Apply Changes, or when there's table grid
};

export const CHAMELEON_TOUR_TYPES = {
  sampleFileReview: 'show_sample_review', // For 'Proceed with sample file'
  spreadsheetReviewPhase1: 'show_spreadsheet_phase_1',
  spreadsheetReviewPhase2: 'show_spreadsheet_phase_2',
  editFieldsPhase1: 'show_edit_fields_phase_1',
  editFieldsPhase2: 'show_edit_fields_phase_2',
  uploadProcessing: 'show_upload_processing',
  uploadReview: 'show_uploaded_file_review',
  customDoctype: 'show_custom_doctype',
  happyPathComplete: 'happy_path_complete',

  // For popup for download, after Confirm (Approve)
  reviewScreenPhase6: 'show_phase_6', // This is not in REVIEW_SCREEN_TOURS because old users don't need this
  ...REVIEW_SCREEN_TOURS,
};

export function chameleonInit() {
  chmln.init(
    'SyG3Pc8OVMo4BNKnO4IHmcu3hyWY0rzGvPdoUPPW2KdaW9-1PYSyb-Epb7VX1gr8Y7D7E6',
    { fastUrl: 'https://fast.chameleon.io/' }
  );
}

export function chameleonIdentifyUser(
  user,
  config,
  attributes = {},
  forceIdentify = false
) {
  if (_.isEmpty(user)) {
    return;
  }

  const { canSwitchToOldMode = false, uiMode = '' } = config;

  const userId = user?.userId;

  const chmlnUserAttributes = {
    name: user?.fullName,
    email: user?.email,
    role: user?.role,
    can_switch_ui_mode: canSwitchToOldMode,
    ui_mode: uiMode,
    ...attributes,
  };

  chmln.identify(userId, {
    ...chmlnUserAttributes,
  });
}

export function chameleonTriggerTour(
  tourId,
  tourType = '',
  callback = null,
  properties = {}
) {
  const chmlnUserData = window.chmln?.data?.profile?.attributes || {};

  // Only trigger tour for new users
  if (chmlnUserData.is_new_user) {
    if (chmlnUserData[tourType]) {
      // Only show tour if the tour hasn't already been shown
      showChameleonTour(tourId, tourType, properties, callback);
    }
  } else {
    // Manual tour of Review screen
    if (Object.values(REVIEW_SCREEN_TOURS).includes(tourType)) {
      if (chmlnUserData[tourType]) {
        // For manual tour review, these values are set to true
        // Only show tour if the tour hasn't already been shown
        showChameleonTour(tourId, tourType, properties, callback);
      }
    }
  }
}

async function showChameleonTour(
  tourId,
  tourType,
  properties = {},
  callback = null
) {
  const chmlnUserData = window.chmln?.data?.profile?.attributes || {};

  try {
    await window.chmln.show(tourId, { ...properties });

    // Run callback. Eg. mixpanel tracking code
    if (callback) {
      callback();
    }

    // Update the tour flag once the user has seen the tour
    // After 1 second
    setTimeout(() => {
      chameleonUpdateUserData(
        chmlnUserData.uid,
        {
          [tourType]: false,
        },
        true
      );
    }, 1000);
  } catch (e) {
    console.error(e);
  }
}

export function chameleonUpdateUserData(
  userId,
  data = {},
  forceUpdate = false
) {
  const chmlnUserData = window.chmln?.data?.profile?.attributes || {};

  if (!chmlnUserData.is_new_user) {
    if (!forceUpdate) {
      return;
    }
  }

  chmln.identify(userId, { ...data });
}

export function chameleonGetUserProperty(property) {
  const chmlnUserData = window.chmln?.data?.profile?.attributes || {};

  if (!_.isEmpty(chmlnUserData) && _.has(chmlnUserData, property)) {
    return chmlnUserData[property];
  } else {
    return undefined;
  }
}

export function isUserIdentifiedInChameleon() {
  const chmlnUserData = window.chmln?.data?.profile?.attributes;

  if (!chmlnUserData) {
    return false;
  } else {
    return true;
  }
}
