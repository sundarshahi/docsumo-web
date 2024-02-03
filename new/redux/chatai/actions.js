import { payloadPassthrough } from 'new/redux/actionHelpers';
import { createAction } from 'redux-actions';

const KEY = 'CHATAI';

export const actionTypes = {
  FETCH_CHATAI_HISTORY: `${KEY}_FETCH_CHATAI_HISTORY`,
  FETCH_CHATAI_HISTORY_FULFILLED: `${KEY}_FETCH_CHATAI_HISTORY_FULFILLED`,
  FETCH_CHATAI_HISTORY_REJECTED: `${KEY}_FETCH_CHATAI_HISTORY_REJECTED`,

  POST_CHATAI_QUESTION: `${KEY}_POST_CHATAI_QUESTION`,
  POST_CHATAI_QUESTION_FULFILLED: `${KEY}_POST_CHATAI_QUESTION_FULFILLED`,
  POST_CHATAI_QUESTION_REJECTED: `${KEY}_POST_CHATAI_QUESTION_REJECTED`,

  RETRY_CHATAI_QUESTION: `${KEY}_RETRY_CHATAI_QUESTION`,
  RETRY_CHATAI_QUESTION_FULFILLED: `${KEY}_RETRY_CHATAI_QUESTION_FULFILLED`,
  RETRY_CHATAI_QUESTION_REJECTED: `${KEY}_RETRY_CHATAI_QUESTION_REJECTED`,

  LIKE_UNLIKE_CHATAI_ANSWER: `${KEY}_LIKE_UNLIKE_CHATAI_ANSWER`,
  LIKE_UNLIKE_CHATAI_ANSWER_FULFILLED: `${KEY}_LIKE_UNLIKE_CHATAI_ANSWER_FULFILLED`,
  LIKE_UNLIKE_CHATAI_ANSWER_REJECTED: `${KEY}_LIKE_UNLIKE_CHATAI_ANSWER_REJECTED`,

  RESET_CHATAI_STATE: `${KEY}_RESET_CHATAI_STATE`,
  RESET_CHATAI_APIS_STATE: `${KEY}_RESET_CHATAI_APIS_STATE`,
};

export const chatAIActions = {
  fetchChatAIHistory: createAction(
    actionTypes.FETCH_CHATAI_HISTORY,
    payloadPassthrough
  ),
  postChatAIQuestion: createAction(
    actionTypes.POST_CHATAI_QUESTION,
    payloadPassthrough
  ),
  retryChatAIQuestion: createAction(
    actionTypes.RETRY_CHATAI_QUESTION,
    payloadPassthrough
  ),
  linkUnlikeChatAIAnswer: createAction(
    actionTypes.LIKE_UNLIKE_CHATAI_ANSWER,
    payloadPassthrough
  ),
  resetChatAIState: createAction(
    actionTypes.RESET_CHATAI_STATE,
    payloadPassthrough
  ),
  resetChatAIAPIState: createAction(
    actionTypes.RESET_CHATAI_APIS_STATE,
    payloadPassthrough
  ),
};
