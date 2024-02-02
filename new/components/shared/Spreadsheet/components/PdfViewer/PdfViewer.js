/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component } from 'react';

import cx from 'classnames';
import { Cut, Maximize, ZoomIn, ZoomOut } from 'iconoir-react';
import { Collapse } from 'iconoir-react';
import _ from 'lodash';
import { KEY_CODES } from 'new/constants/keyboard';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import { getOS } from 'new/utils';
import {
  Highlight,
  PdfHighlighter,
  PdfLoader,
  Popup,
} from 'react-pdf-highlighter';

import './PdfHighlighter.css';
import styles from './PdfViewer.scss';

const ZOOM_RANGES = {
  1: 0.25,
  2: 0.5,
  3: 0.75,
  4: 1,
  5: 1.25,
  6: 1.5,
  7: 1.75,
  8: 2,
};

const ZOOM_KEY = {
  IN: 'zoomIn',
  OUT: 'zoomOut',
};
class PdfViewer extends Component {
  constructor(props) {
    super(props);
    this.pdfHighlighterRef = React.createRef();
    this.state = {
      zoomed: true,
      highlights: [],
      highlighted: null,
    };
  }

  componentDidMount() {
    const { highlights = [] } = this.props;
    this.setState({ highlights });
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentDidUpdate(prevProps) {
    const { highlights: prevHighlights = [] } = prevProps;
    const { highlights = [] } = this.props;

    if (!_.isEqual(prevHighlights, highlights)) {
      this.setState({
        highlights,
      });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (e) => {
    const { keyCode, ctrlKey, metaKey, altKey } = e;

    const isMacOS = getOS() === 'MacOS';

    if (
      (keyCode === KEY_CODES.PLUS || keyCode === KEY_CODES.PLUS_NUMPAD) &&
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey))
    ) {
      // Zoom in
      e.preventDefault();
      this.handleZoomInClick();
    } else if (
      (keyCode === KEY_CODES.MINUS || keyCode === KEY_CODES.MINUS_NUMPAD) &&
      ((isMacOS && metaKey) || (!isMacOS && ctrlKey))
    ) {
      // Zoom out
      e.preventDefault();
      this.handleZoomOutClick();
    } else if (altKey && keyCode === KEY_CODES.F) {
      // Zoom to fit
      e.preventDefault();
      this.handleZoomFitToWidthClick(ZOOM_RANGES[3]);
    }
  };

  setPdfHighlight = (highlight) => {
    this.setState({ highlighted: highlight }, () => {
      if (this.scrollViewTo) {
        this.scrollViewTo(highlight);
      }
    });
  };

  setZoom = async ({ key, value }) => {
    // setting out the zoom scale value
    if (key === ZOOM_KEY['IN']) {
      this.zoom = this.zoom + ZOOM_RANGES[1];
    } else if (key === ZOOM_KEY['OUT']) {
      this.zoom = this.zoom - ZOOM_RANGES[1];
    } else {
      this.zoom = value;
    }

    // access pdfHighlighter methods for handling zoom events
    const pdfHighlighterRef = this.pdfHighlighterRef.current || {};
    const pdfViewer = pdfHighlighterRef.viewer;
    if (pdfViewer) {
      pdfViewer.currentScaleValue = +this.zoom;
      pdfHighlighterRef.resizeObserver.disconnect();
    }
    this.setState({ zoom: this.zoom });
  };

  handleZoomFitToWidthClick = (value) => {
    this.setZoom({ value });
  };

  handleZoomInClick = () => {
    this.setZoom({ key: ZOOM_KEY['IN'] });
  };

  handleZoomOutClick = () => {
    this.setZoom({ key: ZOOM_KEY['OUT'] });
  };

  handleSplitDocument = () => {
    const { docId, documentActions } = this.props;
    documentActions.storeRootSplitDocumentId({
      currentRootSplitDocId: docId,
    });
  };

  getPdfScaleValue = (range1, range2, range3, range4, range5) => {
    const { splitMode, originalFilePreview } = this.props;
    const isHorizontalSplitMode = !!(splitMode === 'horizontal');
    const isVerticalSplitMode = !!(splitMode === 'vertical');
    const isSidebarOpen = JSON.parse(localStorage.getItem('isSidebarOpen'));

    // calculations of initial pdfScaleValue as per the sidebar, splitModes and originalFilePreview types
    if (isVerticalSplitMode && isSidebarOpen) {
      return ZOOM_RANGES[range1];
    } else if (isVerticalSplitMode && !isSidebarOpen) {
      return ZOOM_RANGES[range2];
    } else if (
      (isHorizontalSplitMode && isSidebarOpen) ||
      (isSidebarOpen && !originalFilePreview)
    ) {
      return ZOOM_RANGES[range3];
    } else if (
      (isHorizontalSplitMode && !isSidebarOpen) ||
      (!isSidebarOpen && !originalFilePreview)
    ) {
      return ZOOM_RANGES[range4];
    } else if (originalFilePreview) {
      return ZOOM_RANGES[range5];
    }
  };

  initialPdfScaleValue = () => {
    const { docMeta: { type = '' } = {} } = this.props;
    let pdfScaleValue;
    switch (type) {
      case 'p_and_l':
        pdfScaleValue = this.getPdfScaleValue(2, 3, 4, 5, 6);
        break;
      case 'rent_roll':
      default:
        pdfScaleValue = this.getPdfScaleValue(1, 2, 3, 4, 5);
        break;
    }
    if (!this.zoom) this.zoom = pdfScaleValue; // set initial scale value
    return pdfScaleValue;
  };

  render() {
    const {
      url,
      splitView,
      originalFilePreview,
      docMeta: { pages = [] } = {},
    } = this.props;
    const { zoomed, key, highlights = [] } = this.state;

    return (
      <div className={styles.pdfReview}>
        <div className={styles.reviewContainer}>
          <PdfLoader url={url} key={key}>
            {(pdfDocument) => (
              /* highlights, scrollRef, onSelectionFinished are props and events available on pdf highlighter feature,
                                need default value here. */
              <PdfHighlighter
                pdfDocument={pdfDocument}
                pdfScaleValue={this.initialPdfScaleValue()}
                enableAreaSelection={(event) => event.altKey}
                ref={this.pdfHighlighterRef}
                scrollRef={(scrollTo) => {
                  this.scrollViewTo = scrollTo;
                  const pdfHighlighter =
                    document.querySelectorAll('.PdfHighlighter');
                  if (pdfHighlighter && pdfHighlighter.length) {
                    if (splitView) pdfHighlighter[1].classList.add('pdfHeight');
                    if (originalFilePreview)
                      pdfHighlighter[0].classList.add(
                        'pdfHeight_OriginalFilePreview'
                      );
                  }
                }}
                onSelectionFinished={() => {}}
                onScrollChange={() => {
                  setTimeout(() => {
                    const this_ = this.pdfHighlighterRef.current;
                    this_?.setState(
                      {
                        scrolledToHighlightId: this.state.highlighted.id,
                      },
                      () => this_.renderHighlights()
                    );
                  }, 200);
                }}
                highlightTransform={(
                  highlight,
                  index,
                  setTip,
                  hideTip,
                  viewportToScaled,
                  screenshot,
                  isScrolledTo
                ) => {
                  return (
                    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
                    <Popup onMouseOut={() => {}} onMouseOver={() => {}}>
                      <Highlight
                        className='pdf_highlight'
                        isScrolledTo={isScrolledTo}
                        position={highlight.position}
                      />
                    </Popup>
                  );
                }}
                highlights={highlights}
              />
            )}
          </PdfLoader>

          <div
            className={cx(styles.controls, { [styles.absolute]: splitView })}
          >
            <IconButton
              className={cx('unstyled-btn', styles.iconBtn)}
              onClick={() => {
                this.setState(
                  {
                    zoomed: !zoomed,
                  },
                  () => {
                    this.handleZoomFitToWidthClick(
                      zoomed ? ZOOM_RANGES[2] : ZOOM_RANGES[5]
                    );
                  }
                );
              }}
              disabled={this.zoom <= ZOOM_RANGES[1]}
              title={zoomed ? 'Shrink Document' : 'Expand Document'}
              icon={
                zoomed ? (
                  <Collapse height={20} width={20} />
                ) : (
                  <Maximize height={20} width={20} />
                )
              }
              variant='text'
            />
            <IconButton
              className={cx('unstyled-btn', styles.iconBtn)}
              onClick={this.handleZoomOutClick}
              disabled={this.zoom <= ZOOM_RANGES[1]}
              title='Zoom Out (Ctrl + -)'
              icon={<ZoomOut height={20} width={20} />}
              variant='text'
            />
            <IconButton
              className={cx('unstyled-btn', styles.iconBtn)}
              onClick={this.handleZoomInClick}
              disabled={this.zoom >= ZOOM_RANGES[8]}
              title='Zoom In (Ctrl + +)'
              icon={<ZoomIn height={20} width={20} />}
              variant='text'
            />
            <>
              <IconButton
                className={cx('unstyled-btn', styles.iconBtn, styles.splitIcon)}
                onClick={this.handleSplitDocument}
                disabled={!pages || !pages.length}
                title='Split Document'
                icon={<Cut height={20} width={20} />}
                variant='text'
              />
            </>
          </div>
        </div>
      </div>
    );
  }
}

export default PdfViewer;
