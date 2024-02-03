import { createLogic } from 'redux-logic';

import * as apis from 'new/api';

import { actions as appActions } from '../app/actions';

import { actionTypes } from './actions';

export const fetchChatAIHistoryLogic = createLogic({
  type: actionTypes.FETCH_CHATAI_HISTORY,

  processOptions: {
    dispatchReturn: true,
    successType: actionTypes.FETCH_CHATAI_HISTORY_FULFILLED,
    failType: actionTypes.FETCH_CHATAI_HISTORY_REJECTED,
  },
  async process({ action }) {
    return apis
      .fetchChatAIHistory(action.payload)
      .then((response) => response?.responsePayload);
  },
});

export const postChatAIQuestionLogic = createLogic({
  type: actionTypes.POST_CHATAI_QUESTION,
  processOptions: {
    dispatchReturn: true,
    successType: actionTypes.POST_CHATAI_QUESTION_FULFILLED,
    failType: actionTypes.POST_CHATAI_QUESTION_REJECTED,
  },
  async process({ action }) {
    return apis
      .askQuestion(action.payload)
      .then((response) => response?.responsePayload);
  },
});

export const retryChatAIQuestionLogic = createLogic({
  type: actionTypes.RETRY_CHATAI_QUESTION,
  latest: true,
  async process({ action }, dispatch, done) {
    try {
      const response = await apis.retryQuestion(action.payload);

      if (response) {
        dispatch({
          type: actionTypes.RETRY_CHATAI_QUESTION_FULFILLED,
          payload: response?.responsePayload,
          meta: action.payload,
        });

        dispatch(
          appActions.setToast({
            title:
              response?.responsePayload?.data?.message ||
              'Successfully retried user query!',
            success: true,
          })
        );

        done();
      }
    } catch (e) {
      dispatch({
        type: actionTypes.RETRY_CHATAI_QUESTION_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      dispatch(
        appActions.setToast({
          title:
            'An error occurred while retrying query. Please try again later.',
          error: true,
        })
      );
      done();
    }
  },
});

export const linkeUnlikeChatAIAnswerLogic = createLogic({
  type: actionTypes.LIKE_UNLIKE_CHATAI_ANSWER,
  latest: true,
  async process({ action }, dispatch, done) {
    try {
      await apis
        .likeUnlikeAnswer(action.payload)
        .then((response) => response?.responsePayload);
      dispatch(
        appActions.setToast({
          title: 'Thank you for your feedback!',
          success: true,
        })
      );
      done();
    } catch (e) {
      dispatch({
        type: actionTypes.LIKE_UNLIKE_CHATAI_ANSWER_REJECTED,
        error: true,
        payload: e,
        meta: action.payload,
      });
      dispatch(
        appActions.setToast({
          title:
            'An error occurred while updating API. Please try again later.',
          error: true,
        })
      );
      done();
    }
  },
});

export default [
  fetchChatAIHistoryLogic,
  postChatAIQuestionLogic,
  retryChatAIQuestionLogic,
  linkeUnlikeChatAIAnswerLogic,
];
