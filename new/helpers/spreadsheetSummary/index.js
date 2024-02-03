import _ from 'lodash';
import CustomCodeWorker from 'new/workers/customCode.worker.js';
import PromiseWorker from 'promise-worker';

const customCodePromiseWorker = new PromiseWorker(new CustomCodeWorker());

export async function getSummaryData(data, rawData, customFormula) {
  if (!_.isEmpty(customFormula) && _.isString(customFormula)) {
    try {
      const calculatedData = await customCodePromiseWorker
        .postMessage({ data, rawData, customFormula })
        .then((data) => {
          return data;
        });

      return calculatedData;
    } catch (e) {
      /* eslint-disable no-console */
      console.error(e);
      return {
        kv: [],
        table: [],
        error: 'An error occurred while processing custom summary code.',
      };
      /* eslint-enable no-console */
    }
  } else {
    return {
      kv: [],
      table: [],
      error:
        'No custom code to process. Please add the code from Document Settings modal.',
    };
  }
}
