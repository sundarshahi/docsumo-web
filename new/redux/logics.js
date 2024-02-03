import { createLogic } from 'redux-logic';

import * as uuid from 'uuid/v4';

import activitiesLogics from './activities/logics';
import appLogics from './app/logics';
import chatAIlogics from './chatai/logics';
import classifyLogics from './classification/logics';
import csvLogics from './csv/logics';
import documentsLogics from './documents/logics';
import modelLogics from './model/logics';
import oldDocumentsLogics from './oldDocuments/logics';
import servicesLogics from './services/logics';
import usersLogics from './users/logics';

// add unique requestId to action.meta of every fetch action
const addRequestId = createLogic({
  type: /_FETCH$/,
  transform({ action }, next) {
    next({
      ...action,
      meta: {
        ...(action.meta || {}),
        requestId: uuid(),
      },
    });
  },
});

export default [
  addRequestId,
  ...appLogics,
  ...oldDocumentsLogics,
  ...documentsLogics,
  ...servicesLogics,
  ...usersLogics,
  ...activitiesLogics,
  ...csvLogics,
  ...modelLogics,
  ...classifyLogics,
  ...chatAIlogics,
];
