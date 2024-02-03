// Use thi func to download image onLoad component
// and get respose of prgress of downlaod

import { actions as appActions } from 'new/redux/app/actions';

export const imageDownloader = (url, element, progress, staticFile = false) => {
  if (staticFile) {
    element.src = url;
  } else {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw Error(response.status + ' ' + response.statusText);
        }
        if (!response.body) {
          throw Error('ReadableStream not yet supported in this browser.');
        }
        const contentLength = response.headers.get('content-length');
        if (!contentLength) {
          throw Error('Content-Length response header unavailable');
        }
        const total = parseInt(contentLength, 10);
        let loaded = 0;
        return new Response(
          new ReadableStream({
            start(controller) {
              const reader = response.body.getReader();
              read();
              function read() {
                reader
                  .read()
                  .then(({ done, value }) => {
                    if (done) {
                      controller.close();
                      return;
                    }
                    loaded += value.byteLength;

                    // return progress form here to your viewer component
                    progress({ loaded, total });

                    controller.enqueue(value);
                    read();
                  })
                  .catch((error) => {
                    controller.error(error);
                  });
              }
            },
          })
        );
      })
      .then((response) => response.blob())
      .then((data) => {
        // set src url to your img element
        element.src = URL.createObjectURL(data);
      })
      .catch((error) => {
        appActions.setToast({
          title: error || 'Failed to download the image',
          error: true,
        });
      });
  }
};

export default imageDownloader;
