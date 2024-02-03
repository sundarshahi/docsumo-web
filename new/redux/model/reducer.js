import { mapArrToStateKeys } from 'new/redux/reducerHelpers';
import { handleActions } from 'redux-actions';

import _ from 'lodash';
import * as apiConstants from 'new/constants/api';

import { actionTypes } from './actions';

export const MODEL_PAGE = 'modelPage';
export const SINGLE_VIEW = 'singleView';
export const COMPARE_VIEW = 'compareView';

function getSingleInitialView() {
  return {
    modelName: null,
    version: null,
    docType: null,
    modelId: null,
    testDatas: [],
    trainDatas: [],
  };
}
function getCompareInitialView() {
  return {
    firstModel: {
      modelName: null,
      version: null,
      docType: null,
      modelId: null,
      testDatas: [],
      trainDatas: [],
      tag: null,
    },
    secondModel: {
      modelName: null,
      version: null,
      docType: null,
      modelId: null,
      testDatas: [],
      trainDatas: [],
      tag: null,
    },
  };
}

function getInitialState() {
  return {
    documentsById: {},
    trainModel: false,
    [MODEL_PAGE]: {
      documentIds: [],
      meta: {},
      fetchState: null,
      modelTypeData: [],
      model: [],
      editMODELId: null,
    },
    [SINGLE_VIEW]: getSingleInitialView(),
    [COMPARE_VIEW]: getCompareInitialView(),
  };
}

export default handleActions(
  {
    [actionTypes.MODEL_FETCH](state) {
      return {
        ...state,
        [MODEL_PAGE]: {
          ...state[MODEL_PAGE],
          fetchState: apiConstants.FETCH_STATES.FETCHING,
        },
      };
    },
    [actionTypes.MODEL_FETCH_FULFILLED](
      state,
      { payload, modelTypeData, documentModelConfig }
    ) {
      const data = _.get(payload.responsePayload, 'data', {});
      const { data: modelData, ...meta } = data;
      const { itemIds: documentIds, itemsById: documentsById } =
        mapArrToStateKeys(modelData, { idKey: 'modelId' });

      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          ...documentsById,
        },
        [MODEL_PAGE]: {
          ...state[MODEL_PAGE],
          documentIds: documentIds,
          meta: {
            ...state[MODEL_PAGE].meta,
            ...meta,
          },
          modelTypeData,
          documentModelConfig,
          model: modelData,
          fetchState: apiConstants.FETCH_STATES.SUCCESS,
        },
      };
    },
    [actionTypes.MODEL_FETCH_REJECTED](state) {
      return {
        ...state,
        [MODEL_PAGE]: {
          ...state[MODEL_PAGE],
          fetchState: apiConstants.FETCH_STATES.FAILURE,
        },
      };
    },

    [actionTypes.SET_CHECKBOX_SELECTION_ALL](state, { payload }) {
      const { checked } = payload;
      const { documentIds = [] } = state[MODEL_PAGE];
      return {
        ...state,
        [MODEL_PAGE]: {
          ...state[MODEL_PAGE],
          selectedAll: checked,
          slectedList: checked ? [...documentIds] : [],
        },
      };
    },
    [actionTypes.SET_CHECKBOX_SELECTION_INDIVIDUAL](state, { payload }) {
      const { checked } = payload;
      const { documentIds = [] } = state[MODEL_PAGE];
      return {
        ...state,
        [MODEL_PAGE]: {
          ...state[MODEL_PAGE],
          slectedList: checked,
          selectedAll: !!(
            checked.length && documentIds.length === checked.length
          ),
        },
      };
    },

    [actionTypes.SHOW_TRAIN_MODEL_MODAL](state) {
      return {
        ...state,
        trainModel: true,
      };
    },

    [actionTypes.HIDE_TRAIN_MODEL_MODAL](state) {
      return {
        ...state,
        trainModel: false,
      };
    },
    [actionTypes.STORE_MODEL_DOCUMENT_ID](state, { payload }) {
      const { currentMODELDocId } = payload;
      return {
        ...state,
        currentMODELDocId,
      };
    },
    [actionTypes.OPEN_SINGLE_VIEW_FULFILLED](state, { payload }) {
      const { data = [] } = payload.responsePayload;
      const { docTypeVerbose, metrics, modelId, modelType, version } = data[0];
      const { testMetrics, trainMetrics } = metrics;

      const {
        modelPage: { modelTypeData },
      } = state;
      let [model] = modelTypeData.filter((item) => item.value === modelType);

      return {
        ...state,
        [SINGLE_VIEW]: {
          ...getSingleInitialView(),
          modelName: model?.title,
          docType: docTypeVerbose,
          testDatas: testMetrics,
          trainDatas: trainMetrics,
          modelId,
          version,
        },
      };
    },
    [actionTypes.OPEN_SINGLE_VIEW_REJECTED](state) {
      return {
        ...state,
        [SINGLE_VIEW]: {
          ...getSingleInitialView(),
        },
      };
    },
    [actionTypes.OPEN_COMPARISION_VIEW_FULFILLED](state, { payload }) {
      const { data = [] } = payload.response.responsePayload;
      const {
        docTypeVerbose: docTypeVerbose1,
        metrics: metrics1,
        modelId: modelId1,
        modelType: modelType1,
        version: version1,
        tag: tag1,
      } = data[0];
      const {
        docTypeVerbose: docTypeVerbose2,
        metrics: metrics2,
        modelId: modelId2,
        modelType: modelType2,
        version: version2,
        tag: tag2,
      } = data[1];
      const { testMetrics: testMetrics1, trainMetrics: trainMetrics1 } =
        metrics1;
      const { testMetrics: testMetrics2, trainMetrics: trainMetrics2 } =
        metrics2;
      const {
        modelPage: { modelTypeData },
      } = state;
      let [model1] = modelTypeData.filter((item) => item.value === modelType1);
      let [model2] = modelTypeData.filter((item) => item.value === modelType2);
      return {
        ...state,
        [COMPARE_VIEW]: {
          ...getCompareInitialView(),
          firstModel: {
            modelName: model1?.title,
            docType: docTypeVerbose1,
            testDatas: testMetrics1,
            trainDatas: trainMetrics1,
            modelId: modelId1,
            version: version1,
            tag: tag1,
          },
          secondModel: {
            modelName: model2?.title,
            docType: docTypeVerbose2,
            testDatas: testMetrics2,
            trainDatas: trainMetrics2,
            modelId: modelId2,
            version: version2,
            tag: tag2,
          },
        },
      };
    },
    [actionTypes.OPEN_COMPARISION_VIEW_REJECTED](state) {
      return {
        ...state,
        [COMPARE_VIEW]: {
          ...getCompareInitialView(),
        },
      };
    },
    [actionTypes.RENAME_MODEL](state, { payload }) {
      const { model } = state[MODEL_PAGE];
      const { modelName, renameModelId } = payload;
      let modelIndex = model.findIndex(
        (model) => model && model.modelId === renameModelId
      );
      if (modelIndex !== -1 && model[modelIndex]) {
        model[modelIndex].modelTagVerbose = modelName;
      }
      return {
        ...state,
        model,
      };
    },
  },
  getInitialState()
);
