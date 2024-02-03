import * as reduxHelpers from 'new/redux/helpers';

import _ from 'lodash';

function validateMemberPermission() {
  const store = reduxHelpers.getStore();
  return store;
}

function getMemberPermissions() {
  const store = reduxHelpers.getStore();
  const { app } = store.getState();
  const flags = _.get(app, 'config.flags.flagElement');
  return flags;
}

export { getMemberPermissions, validateMemberPermission };
