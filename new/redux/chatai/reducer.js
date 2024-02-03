import { actionTypes } from './actions';

/**
 * status: 'fetching' | 'loading' | 'success' | 'failed' | "idle"
 */
const initialState = {
  chats: [],
  fetchHistory: {
    status: 'idle',
    data: null,
    hasFetched: false,
  },
  postQuestion: {
    status: 'idle',
    payload: null,
    response: null,
  },
  retryQuestion: {
    status: 'idle',
    payload: null,
    response: null,
  },
};

const ID_POSTING = 'ID_POSTING';

const chatAIReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.RESET_CHATAI_STATE:
      return initialState;

    case actionTypes.RESET_CHATAI_APIS_STATE:
      return { ...initialState, chats: state.chats };

    case actionTypes.FETCH_CHATAI_HISTORY:
      return {
        ...state,
        fetchHistory: {
          ...state.fetchHistory,
          status: state.chats.length ? 'loading' : 'fetching',
        },
      };

    case actionTypes.FETCH_CHATAI_HISTORY_FULFILLED:
      return {
        ...state,
        chats: action?.payload?.data,
        fetchHistory: {
          ...state.fetchHistory,
          status: 'success',
          response: action.payload,
        },
      };

    case actionTypes.FETCH_CHATAI_HISTORY_REJECTED:
      return {
        ...state,
        chats: [],
        fetchHistory: {
          ...state.fetchHistory,
          status: 'failed',
          response: action.payload,
        },
      };

    /**
     * Optimistic updates on UI/UX for questions
     *
     * Processing questions are appended on chats state to see instant question posting behaviour on UI
     * Posted questions may failed on frontend side or server side so must ensure no any optimistic updates on apis data are appended twice.
     */
    case actionTypes.POST_CHATAI_QUESTION: {
      let updatedChats = [...state.chats];
      const hasRetryPostingQuestion =
        updatedChats[updatedChats.length - 1]?.id === ID_POSTING;

      if (!hasRetryPostingQuestion) {
        updatedChats = [
          ...updatedChats,
          {
            question: action?.payload?.data?.question,
            id: ID_POSTING,
          },
        ];
      }

      return {
        ...state,
        chats: updatedChats,
        postQuestion: {
          ...state.postQuestion,
          payload: action.payload,
          status: 'loading',
          response: null,
        },
      };
    }

    /**
     * Removing optimistic array data with actual response data on chats array
     */
    case actionTypes.POST_CHATAI_QUESTION_FULFILLED:
      return {
        ...state,
        postQuestion: {
          ...state.postQuestion,
          status: 'success',
          response: action.payload?.data,
        },
        chats: [...state.chats.slice(0, -1), action?.payload?.data],
      };

    case actionTypes.POST_CHATAI_QUESTION_REJECTED:
      return {
        ...state,
        postQuestion: {
          ...state.postQuestion,
          status: 'failed',
          response: action.payload?.error,
        },
      };

    case actionTypes.RETRY_CHATAI_QUESTION:
      return {
        ...state,
        retryQuestion: {
          ...state.retryQuestion,
          status: 'loading',
          payload: action.payload,
          response: null,
        },
      };

    /**
     * Checking if retrying posting question can provide answer and replacing the unanswered chat items with answered chat response
     */
    case actionTypes.RETRY_CHATAI_QUESTION_FULFILLED: {
      const responseData = action.payload?.data;
      const hasAnswer = !responseData?.error && responseData?.answer;

      let updatedChats = [...state.chats];
      if (hasAnswer) {
        const chatIndex = updatedChats.findIndex(
          (chat) => chat.id === responseData?.id
        );

        if (chatIndex !== -1) {
          updatedChats[chatIndex] = responseData;
        }
      }

      return {
        ...state,
        chats: updatedChats,
        retryQuestion: {
          ...state.retryQuestion,
          status: 'success',
          response: responseData,
        },
      };
    }

    case actionTypes.RETRY_CHATAI_QUESTION_REJECTED:
      return {
        ...state,
        retryQuestion: {
          ...state.retryQuestion,
          status: 'failed',
          response: action.payload?.error,
        },
      };

    /**
     * Optimistic updates for like/unlike behaviour on frontend
     *
     * used prevIsUsefull flag to store old isUseful value to revert changes if api calls fails
     */
    case actionTypes.LIKE_UNLIKE_CHATAI_ANSWER: {
      const chatId = action.payload?.chatId;
      const updatedChats = [...state.chats];

      const chatIndex = updatedChats.findIndex(
        (message) => message.id === chatId
      );

      if (chatIndex !== -1) {
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          isUseful: action.payload?.data?.is_useful,
          prevIsUseful: updatedChats[chatIndex].isUseful,
        };
      }

      return {
        ...state,
        chats: updatedChats,
      };
    }

    /**
     * Reverting back the like/unlike updates to previous state
     */
    case actionTypes.LIKE_UNLIKE_CHATAI_ANSWER_REJECTED: {
      const updatedChats = [...state.chats];
      const chatId = action.meta?.chatId;

      const chatIndex = state.chats.findIndex(
        (message) => message.id === chatId
      );

      if (chatIndex !== -1) {
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          isUseful: updatedChats[chatIndex].prevIsUseful,
        };
      }

      return {
        ...state,
        chats: updatedChats,
      };
    }

    default:
      return state;
  }
};

export default chatAIReducer;
