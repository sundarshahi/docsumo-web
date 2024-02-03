import { combineReducers } from 'redux';

import { KEY_CAMELIZED as activitiesStateCamelizedKey } from './activities/actions';
import activitiesReducer from './activities/reducer';
import { KEY_CAMELIZED as appStateCamelizedKey } from './app/actions';
import appReducer from './app/reducer';
import chatAIReducer from './chatai/reducer';
import { KEY_CAMELIZED as classifyStateCamelizedKey } from './classification/actions';
import classifyReducer from './classification/reducer';
import { KEY_CAMELIZED as csvStateCamelizedKey } from './csv/actions';
import csvReducer from './csv/reducer';
import { KEY_CAMELIZED as documentsStateCamelizedKey } from './documents/actions';
import documentsReducer from './documents/reducer';
import { KEY_CAMELIZED as modelStateCamelizedKey } from './model/actions';
import modelReducer from './model/reducer';
import oldDocumentsReducer from './oldDocuments/reducer';
import { KEY_CAMELIZED as requestsStateCamelizedKey } from './requests/actions';
import requestsReducer from './requests/reducer';
import { KEY_CAMELIZED as serviceStateCamelizedKey } from './services/actions';
import servicesReducer from './services/reducer';
import { KEY_CAMELIZED as uploadStateCamelizedKey } from './upload/actions';
import uploadReducer from './upload/reducer';
import { KEY_CAMELIZED as uploadcsvStateCamelizedKey } from './uploadcsv/actions';
import uploadcsvReducer from './uploadcsv/reducer';
import { KEY_CAMELIZED as usersStateCamelizedKey } from './users/actions';
import usersReducer from './users/reducer';

export default combineReducers({
  [appStateCamelizedKey]: appReducer,
  [requestsStateCamelizedKey]: requestsReducer,
  [uploadStateCamelizedKey]: uploadReducer,
  [documentsStateCamelizedKey]: documentsReducer,
  [serviceStateCamelizedKey]: servicesReducer,
  [usersStateCamelizedKey]: usersReducer,
  [activitiesStateCamelizedKey]: activitiesReducer,
  [csvStateCamelizedKey]: csvReducer,
  [uploadcsvStateCamelizedKey]: uploadcsvReducer,
  [modelStateCamelizedKey]: modelReducer,
  [classifyStateCamelizedKey]: classifyReducer,
  chatAI: chatAIReducer,
});

export const oldReducers = combineReducers({
  [appStateCamelizedKey]: appReducer,
  [requestsStateCamelizedKey]: requestsReducer,
  [uploadStateCamelizedKey]: uploadReducer,
  [documentsStateCamelizedKey]: oldDocumentsReducer,
  [serviceStateCamelizedKey]: servicesReducer,
  [usersStateCamelizedKey]: usersReducer,
  [activitiesStateCamelizedKey]: activitiesReducer,
  [csvStateCamelizedKey]: csvReducer,
  [uploadcsvStateCamelizedKey]: uploadcsvReducer,
  [modelStateCamelizedKey]: modelReducer,
  [classifyStateCamelizedKey]: classifyReducer,
  chatAI: chatAIReducer,
});
