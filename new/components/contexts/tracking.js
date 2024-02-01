import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { getValueFromPath } from 'new/redux/helpers';

import { cloneDeep, get, has, isArray, isEmpty, isEqual } from 'lodash';
import { postTrackingData } from 'new/api';
import { endpoints } from 'new/api/endpoints';

import {
  EXTRACTED_TABLE_RELATED_KEYS,
  GRID_RELATED_KEYS,
  TRACKING_HELPER_KEYS,
  TRACKING_TYPE,
  VALID_FIELD_KEY,
  VALID_TABLE_KEYS,
} from './trackingConstants';

const TrackingContext = createContext();

const initialState = {
  [TRACKING_TYPE.fieldTracking]: {
    initial: {},
    previous: {},
    changed: {},
    final: {},
  },
  [TRACKING_TYPE.tableTracking]: {},
};

function TrackingProvider({ children }) {
  const dataRef = useRef(initialState);
  const lastFocusedRef = useRef({});
  const prevTableTimeStamp = useRef(null);
  const idleTimeStampRef = useRef({ prev: '', curr: '' });

  const prevTableData = useRef(null);
  const prevTableGrids = useRef(null);

  const delayedHandleTableTrackingArgs = useRef(null);

  const idleTimeThreshold = 15000;

  const tableKey = useMemo(() => VALID_TABLE_KEYS, []);

  const setIdleTimeStamp = useCallback(({ prev = '', curr = '' }) => {
    if (prev) idleTimeStampRef.current.prev = prev;
    if (curr) idleTimeStampRef.current.curr = curr;
  }, []);

  const handleIdleStop = useCallback(() => {
    const { idleTime } = TRACKING_HELPER_KEYS;

    const { tableTracking, fieldTracking } = TRACKING_TYPE;

    if (!idleTimeStampRef.current.name) return;

    const trackingKey = tableKey.includes(lastFocusedRef.current.key)
      ? tableTracking
      : fieldTracking;

    const {
      [trackingKey]: { final },
    } = getRefData();

    setRefData({
      ...getRefData(),
      [trackingKey]: {
        ...getRefData()[trackingKey],
        final: {
          ...getRefData()[trackingKey].final,
          [lastFocusedRef.current.name]: {
            ...final[lastFocusedRef.current.name],
            idleTime: has(final[lastFocusedRef.current.name], idleTime)
              ? final[lastFocusedRef.current.name].idleTime +
                Date.now() -
                idleTimeStamp().prev
              : Date.now() - idleTimeStamp().prev,
          },
        },
      },
    });
  }, [tableKey]);

  const resetTracking = () => {
    dataRef.current = initialState;
    lastFocusedRef.current = {};
    prevTableTimeStamp.current = null;
    idleTimeStampRef.current = { prev: '', curr: '' };

    prevTableData.current = null;
    prevTableGrids.current = null;

    delayedHandleTableTrackingArgs.current = null;
  };

  const resetIdle = useCallback(() => {
    setIdleTimeStamp({ curr: Date.now() });
    handleIdleStop();
  }, [setIdleTimeStamp, handleIdleStop]);

  const setIdle = useCallback(() => {
    setIdleTimeStamp({ prev: Date.now() });
  }, [setIdleTimeStamp]);

  const idleTimeStamp = () => idleTimeStampRef.current;

  const onMouseMove = useCallback(() => resetIdle(), [resetIdle]);
  const onKeyDown = useCallback(() => resetIdle(), [resetIdle]);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown);

    const idleTimer = setInterval(() => setIdle(), idleTimeThreshold);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('keydown', onKeyDown);
      clearInterval(idleTimer);
    };
  }, [onKeyDown, onMouseMove, setIdle]);

  const getRefData = () => dataRef.current;

  const setRefData = (data) => {
    dataRef.current = data;
  };

  const handleDocumentFocus = () => {
    try {
      handleTrackingEnd({
        name: lastFocusedRef.current.name,
        key: lastFocusedRef.current.key,
        documentFocus: true,
      });
      handleTableFieldTrackingEnd({
        name: lastFocusedRef.current.name,
        key: lastFocusedRef.current.key,
        documentFocus: true,
      });
      handleTrackingStart({
        name: lastFocusedRef.current.name,
        key: lastFocusedRef.current.key,
        documentFocus: true,
      });
      handleTableFieldTrackingStart({
        name: lastFocusedRef.current.name,
        key: lastFocusedRef.current.key,
        documentFocus: true,
      });
    } catch (e) {
      resetTracking();
    }
  };

  const handleDocumentUnFocus = () => {
    try {
      handleTrackingEnd({
        name: lastFocusedRef.current.name,
        key: lastFocusedRef.current.key,
        documentFocus: true,
      });
      handleTableFieldTrackingEnd({
        name: lastFocusedRef.current.name,
        key: lastFocusedRef.current.key,
        documentFocus: true,
      });
    } catch (e) {
      resetTracking();
    }
  };

  const handleTrackingStart = ({
    name,
    key,
    valueToSave,
    valueToCompare,
    action,
    tableId,
    fieldLabel,
  }) => {
    try {
      const { fieldTracking } = TRACKING_TYPE;

      if (
        !name ||
        !VALID_FIELD_KEY.includes(key) ||
        delayedHandleTableTrackingArgs.current
      )
        return;

      const trackingKey = fieldTracking;

      const {
        [trackingKey]: { initial, previous },
      } = getRefData();

      lastFocusedRef.current = { name, key };
      if (has(initial, name)) {
        setRefData({
          ...getRefData(),
          [trackingKey]: {
            ...getRefData()[trackingKey],
            previous: {
              ...previous,
              [name]: {
                ...previous[name],
                valueToSave:
                  valueToSave === ''
                    ? ''
                    : valueToSave ||
                      previous[name].valueToSave ||
                      initial[name].valueToSave,
                time: Date.now(),
                key,
                valueToCompare,
                fieldLabel,
              },
            },
          },
        });
      } else {
        setRefData({
          ...getRefData(),
          [trackingKey]: {
            ...getRefData()[trackingKey],
            initial: {
              ...initial,
              [name]: {
                valueToSave,
                time: Date.now(),
                key,
                valueToCompare,
                action,
                tableId,
                fieldLabel,
              },
            },
            previous: {
              ...previous,
              [name]: {
                valueToSave,
                time: Date.now(),
                key,
                valueToCompare,
                fieldLabel,
              },
            },
          },
        });
      }
    } catch (e) {
      resetTracking();
    }
  };

  const handleTrackingEnd = ({
    name,
    valueToSave,
    valueToCompare,
    key,
    documentFocus = false,
    fieldLabel,
  }) => {
    try {
      const { fieldTracking } = TRACKING_TYPE;

      if (
        !name ||
        !VALID_FIELD_KEY.includes(key) ||
        delayedHandleTableTrackingArgs.current
      )
        return;

      const trackingKey = fieldTracking;

      const {
        [trackingKey]: { initial, changed },
      } = getRefData();

      if (!has(initial, name)) return;

      if (documentFocus) {
        let d = {
          ...getRefData(),
          [trackingKey]: {
            ...getRefData()[trackingKey],
            changed: {
              ...changed,
              [name]: {
                ...changed[name],
                time: Date.now(),
              },
            },
          },
        };
        setRefData(d);
      } else {
        setRefData({
          ...getRefData(),
          [trackingKey]: {
            ...getRefData()[trackingKey],
            changed: {
              ...changed,
              [name]: {
                ...changed[name],
                valueToSave:
                  valueToSave === ''
                    ? ''
                    : valueToSave ||
                      changed[name]?.valueToSave ||
                      initial[name]?.valueToSave,
                time: Date.now(),
                valueToCompare,
                fieldLabel,
              },
            },
          },
        });
      }

      findDifference({ name, key });
    } catch (e) {
      resetTracking();
    }
  };

  const grids = useSelector(
    ({
      documents: {
        reviewTool: { grids },
      },
    }) => grids
  );

  const isGridFetching = useSelector(
    ({
      documents: {
        reviewTool: { gridFetching },
      },
    }) => gridFetching
  );

  const tableData = useSelector(
    ({
      documents: {
        reviewTool: { fieldsById },
      },
    }) => fieldsById[lastFocusedRef.current.name]?.children
  );

  const isFetchingTableData = useSelector(
    ({
      documents: {
        reviewTool: { fieldsById },
      },
    }) => {
      return (
        fieldsById[lastFocusedRef.current.name]?.isAddingNewLine ||
        fieldsById[lastFocusedRef.current.name]?.isAddingSimilarLines
      );
    }
  );

  const isFetchingFields = useSelector(
    ({ requests: { DOCUMENTS_RT_DOCUMENT_DATA: { isFetching } = {} } }) =>
      isFetching
  );

  useEffect(() => {
    if (
      !isGridFetching &&
      delayedHandleTableTrackingArgs.current &&
      !isFetchingTableData &&
      !isFetchingFields
    ) {
      handleTableTracking(delayedHandleTableTrackingArgs.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grids, tableData]);

  const handleDelayedTableTracking = ({ name, key, action, fieldLabel }) => {
    try {
      lastFocusedRef.current = { name, key };
      delayedHandleTableTrackingArgs.current = {
        name,
        key,
        action,
        fieldLabel,
      };
    } catch (e) {
      resetTracking();
    }
  };

  const handleTableTracking = ({
    name,
    key,
    action,
    gridValue = false,
    tableValue = false,
    fieldLabel,
  }) => {
    try {
      const isValidTableTrackingKey = tableKey.includes(key);

      const { tableTracking } = TRACKING_TYPE;
      lastFocusedRef.current = { name, key };

      if (isValidTableTrackingKey) {
        setRefData({
          ...getRefData(),
          [tableTracking]: {
            ...getRefData()[tableTracking],
            [name]: getRefData()[tableTracking][name]
              ? [
                  ...getRefData()[tableTracking][name],
                  {
                    eventType: `${key}_${action}`,
                    timeTaken: Date.now() - prevTableTimeStamp.current,
                    timestamp: Date.now(),
                    fieldLabel,
                    ...(GRID_RELATED_KEYS.includes(key) && {
                      tableGrids: {
                        old_value: prevTableGrids.current,
                        new_value: gridValue ? [...gridValue] : grids,
                      },
                    }),

                    ...(EXTRACTED_TABLE_RELATED_KEYS.includes(key) && {
                      tableData: {
                        old_value: prevTableData.current,
                        new_value: tableValue ? [...tableValue] : tableData,
                      },
                    }),
                  },
                ]
              : [
                  {
                    eventType: `${key}_${action}`,
                    timeTaken: Date.now() - prevTableTimeStamp.current,
                    timestamp: Date.now(),
                    fieldLabel,
                    ...(GRID_RELATED_KEYS.includes(key) && {
                      tableGrids: {
                        old_value: prevTableGrids.current,
                        new_value: gridValue ? [...gridValue] : grids,
                      },
                    }),

                    ...(EXTRACTED_TABLE_RELATED_KEYS.includes(key) && {
                      tableData: {
                        old_value: prevTableData.current,
                        new_value: tableValue ? [...tableValue] : tableData,
                      },
                    }),
                  },
                ],
          },
        });
      }

      delayedHandleTableTrackingArgs.current = null;

      prevTableTimeStamp.current = Date.now();
      prevTableData.current = tableValue ? [...tableValue] : tableData;
      prevTableGrids.current = gridValue ? [...gridValue] : grids;
    } catch (e) {
      resetTracking();
    }
  };

  function findAndUpdateFieldInTable({ data, targetId, newData }) {
    let modifiedData = cloneDeep(data);
    if (!isArray(data) || !isArray(modifiedData)) {
      return data;
    } else {
      for (const outerArray of modifiedData) {
        for (const innerObject of outerArray) {
          if (innerObject.id === targetId) {
            Object.assign(innerObject, newData);
          }
        }
      }

      return modifiedData;
    }
  }

  const handleTableFieldTrackingStart = ({
    name,
    valueToSave,

    key,
    action,
    fieldId,
    fieldLabel,
  }) => {
    try {
      const { fieldTracking } = TRACKING_TYPE;

      if (
        !name ||
        !VALID_FIELD_KEY.includes(key) ||
        delayedHandleTableTrackingArgs.current
      )
        return;

      const trackingKey = fieldTracking;

      const {
        [trackingKey]: { initial, previous, changed },
      } = getRefData();

      lastFocusedRef.current = { name, key };

      if (has(initial, name)) {
        setRefData({
          ...getRefData(),
          [trackingKey]: {
            ...getRefData()[trackingKey],
            previous: {
              ...previous,
              [name]: {
                ...previous[name],
                time: Date.now(),
                key,
                name,
                fieldLabel,
              },
            },
          },
        });
      } else {
        setRefData({
          ...getRefData(),
          [trackingKey]: {
            ...getRefData()[trackingKey],
            initial: {
              ...initial,
              [name]: {
                ...initial[name],
                valueToSave: tableData,
                time: Date.now(),
                key,
                fieldLabel,
                action,
              },
            },
            previous: {
              ...previous,
              [name]: {
                ...previous[name],
                time: Date.now(),
                key,
                fieldLabel,
              },
            },
            changed: {
              ...changed,
              [name]: {
                ...changed[name],
                valueToSave: tableData,
                time: Date.now(),
                fieldLabel,
              },
            },
          },
        });
      }
    } catch (e) {
      resetTracking();
    }
  };

  const handleTableFieldTrackingEnd = ({
    name,
    valueToSave,

    key,

    fieldId,
    documentFocus = false,
    fieldLabel,
  }) => {
    try {
      const { fieldTracking } = TRACKING_TYPE;

      if (
        !name ||
        !VALID_FIELD_KEY.includes(key) ||
        delayedHandleTableTrackingArgs.current
      )
        return;

      const trackingKey = fieldTracking;

      const {
        [trackingKey]: { initial, changed },
      } = getRefData();

      if (!has(initial, name)) return;

      if (documentFocus) {
        let d = {
          ...getRefData(),
          [trackingKey]: {
            ...getRefData()[trackingKey],
            changed: {
              ...changed,
              fieldLabel,
              [name]: {
                ...changed[name],
                time: Date.now(),
              },
            },
          },
        };
        setRefData(d);
      } else {
        setRefData({
          ...getRefData(),
          [trackingKey]: {
            ...getRefData()[trackingKey],
            changed: {
              ...changed,
              fieldLabel,
              [name]: {
                ...changed[name],
                valueToSave: findAndUpdateFieldInTable({
                  data:
                    changed[name]?.valueToSave || initial[name]?.valueToSave,
                  targetId: fieldId,
                  newData: valueToSave,
                }),
                time: Date.now(),
              },
            },
          },
        });
      }

      findDifference({ name, key });
    } catch (e) {
      resetTracking();
    }
  };

  const findDifference = ({ name, key }) => {
    const { timeTaken } = TRACKING_HELPER_KEYS;
    const { fieldTracking } = TRACKING_TYPE;

    const {
      [fieldTracking]: { previous, changed, final },
    } = getRefData();

    if (!has(previous, name)) return;
    const { time: initialTime } = previous[name];
    const { time: changedTime } = changed[name];

    setRefData({
      ...getRefData(),
      [fieldTracking]: {
        ...getRefData()[fieldTracking],
        final: {
          ...final,
          [name]: {
            ...final[name],
            timeTaken: has(final[name], timeTaken)
              ? final[name].timeTaken + (changedTime - initialTime)
              : changedTime - initialTime,
          },
        },
        previous: { ...previous, [name]: { ...changed[name] } },
      },
    });
  };

  const userId = useSelector(
    ({ app: { user: { userId = '' } = {} } }) => userId
  );

  const orgId = useSelector(({ app: { user: { orgId = '' } = {} } }) => orgId);

  const docId = useSelector(
    ({
      documents: {
        reviewTool: { docId = '' },
      },
    }) => docId
  );

  const docType = useSelector(
    ({
      documents: {
        reviewTool: { docId, documentsById = '' },
      },
    }) => {
      const docData = documentsById[docId];

      return docData?.type;
    }
  );

  const generateFieldTrackingPayload = ({ initial, changed, final }) => {
    let payload = [];

    const { updated, added, deleted } = TRACKING_HELPER_KEYS;

    for (const key in initial) {
      if (
        has(initial[key], 'valueToSave') &&
        has(changed[key], 'valueToSave')
      ) {
        const {
          valueToSave: initialValueToSave,
          valueToCompare: initialValueToCompare = initialValueToSave,
          time: initialTime,
          key: fieldKey,
          action,
          fieldLabel,
        } = initial[key];
        const {
          valueToSave: changedValueToSave,
          valueToCompare: changedValueToCompare = changedValueToSave,
        } = get(changed, key);
        const { timeTaken = 0, idleTime = 0 } = final[key];

        if (!isEqual(initialValueToCompare, changedValueToCompare)) {
          let eventType = `${fieldKey}_${updated}`;

          if (action) {
            eventType = `${fieldKey}_${action}`;
          } else {
            if (isEmpty(initialValueToSave)) eventType = `${fieldKey}_${added}`;
            if (isEmpty(changedValueToSave))
              eventType = `${fieldKey}_${deleted}`;
          }

          payload.push({
            item_id: key,
            timestamp: initialTime,
            time_spent: timeTaken - idleTime,
            updated_data: {
              old_value: isEmpty(initialValueToSave) ? '' : initialValueToSave,
              new_value: isEmpty(changedValueToSave) ? '' : changedValueToSave,
            },
            event_type: eventType,
            doc_id: docId,
            doc_type: docType,
            user_id: userId,
            org_id: orgId,
            field_label: fieldLabel,
          });
        }
      }
    }

    return payload;
  };

  const generateTableTrackingPayload = () => {
    let payload = [];

    const { [TRACKING_TYPE.tableTracking]: tableTracking } = getRefData();
    if (isEmpty(tableTracking)) return payload;

    for (const key in tableTracking) {
      tableTracking[key].forEach(
        ({
          timeTaken,
          eventType,
          timestamp,
          tableData,
          tableGrids,
          fieldLabel,
        }) => {
          payload.push({
            item_id: key,
            time_spent: timeTaken,
            event_type: eventType,
            timestamp,
            doc_id: docId,
            doc_type: docType,
            user_id: userId,
            org_id: orgId,
            field_label: fieldLabel,

            ...(!isEmpty(tableGrids) && { table_grids: tableGrids }),
          });
        }
      );
    }

    return payload;
  };

  const handleTrackingSubmit = () => {
    const getAuthToken = () => {
      return (
        sessionStorage.getItem('tempToken') ||
        getValueFromPath('app.token') ||
        ''
      );
    };

    const {
      [TRACKING_TYPE.fieldTracking]: fieldTracking,
      [TRACKING_TYPE.tableTracking]: tableTracking,
    } = getRefData();

    let payload = {};
    try {
      payload = {
        events: [
          ...generateFieldTrackingPayload(fieldTracking),
          ...generateTableTrackingPayload(tableTracking),
        ],
      };
    } catch (e) {
      resetTracking();
    }

    if (isEmpty(payload?.events)) return;

    const fetchParams = {
      timeout: 30000, // Change later to 30000 for production

      method: 'POST',
      headers: {
        token: getAuthToken(),
        'content-type': 'application/json',
        accept: 'application/json, text/plain, */*',
        connection: 'keep-alive',
      },
      keepalive: true,

      body: JSON.stringify(payload),
    };

    // eslint-disable-next-line no-console
    console.debug('Generated tracking payload successfully', {
      payload,
    });

    const fallbackApi = async () => {
      try {
        const response = await postTrackingData(payload);
        const status = get(response.responsePayload, 'status');
        if (status === 'success') {
          // eslint-disable-next-line no-console
          console.debug('Tracking data submitted successfully');
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.debug(
          e.message || 'An error occurred while submitting tracking data.'
        );
      } finally {
        resetTracking();
      }
    };

    fetch(endpoints.raichu.postTrackingData, fetchParams)
      .then((data) => {
        if (data.ok) {
          // eslint-disable-next-line no-console
          console.debug('Tracking data submitted successfully');

          resetTracking();
        }
      })
      .catch((e) => {
        fallbackApi();

        // eslint-disable-next-line no-console
        console.debug(e || 'An error occurred while submitting tracking data.');
      });
  };

  return (
    <TrackingContext.Provider
      value={{
        handleTrackingSubmit,
        handleTrackingStart,
        handleTrackingEnd,
        handleDocumentFocus,
        handleDocumentUnFocus,
        handleTableTracking,
        handleDelayedTableTracking,
        handleTableFieldTrackingStart,
        handleTableFieldTrackingEnd,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
}

export function WithTrackingContext(Component) {
  return function (props) {
    return (
      <TrackingContext.Consumer>
        {(context) => {
          if (context === undefined) {
            throw new Error(
              'TrackingContext must be used within a TrackingProvider'
            );
          }
          return <Component {...props} {...context} />;
        }}
      </TrackingContext.Consumer>
    );
  };
}

function useTrackingContext() {
  const context = React.useContext(TrackingContext);

  if (context === undefined) {
    throw new Error(
      'useTrackingContext must be used within a TrackingProvider'
    );
  }
  return context;
}

export { TrackingProvider, useTrackingContext };
