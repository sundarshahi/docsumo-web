import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as documentActions } from 'new/redux/documents/actions';
import { sortGrids } from 'new/redux/documents/helpers';
import { showToast } from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import { GridAdd, InfoEmpty, PasteClipboard } from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import { SUPPORT_LINK } from 'new/constants/urllink';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button from 'new/ui-elements/Button/Button';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';

import styles from './footer.scss';
class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copiedPage: null,
      scrollListenerActive: true,
    };
  }

  copyPage = (page) => {
    this.setState({ copiedPage: page });
  };

  componentDidUpdate({
    isAddingSimilarLines: prevSimilarLine,
    grids: prevGrids,
  }) {
    const {
      handleCloseGrid,
      isAddingSimilarLines,
      originalGrids,
      grids,
      setGridViewMode,
    } = this.props;

    if (isAddingSimilarLines !== prevSimilarLine && !isAddingSimilarLines) {
      handleCloseGrid();
    }

    if (grids?.length !== prevGrids?.length) {
      if (!grids?.length && !originalGrids?.length) {
        setGridViewMode(true);
      }
    }
  }

  findOverlappingBoxes = (targetGrid, arrayOfGrids) => {
    const overlappingGrids = [];

    const targetBox = {
      topLeft: { x: targetGrid.topLeft[0], y: targetGrid.topLeft[1] },
      bottomRight: {
        x: targetGrid.bottomRight[0],
        y: targetGrid.bottomRight[1],
      },
    };

    for (let i = 0; i < arrayOfGrids.length; i++) {
      const grid = arrayOfGrids[i];

      const gridBox = {
        topLeft: { x: grid.topLeft[0], y: grid.topLeft[1] },
        bottomRight: { x: grid.bottomRight[0], y: grid.bottomRight[1] },
      };

      const xOverlap =
        targetBox.bottomRight.x > gridBox.topLeft.x &&
        targetBox.topLeft.x < gridBox.bottomRight.x;

      const yOverlap =
        targetBox.bottomRight.y > gridBox.topLeft.y &&
        targetBox.topLeft.y < gridBox.bottomRight.y;

      if (xOverlap && yOverlap) {
        overlappingGrids.push(arrayOfGrids[i]?.id);
      }
    }

    return overlappingGrids;
  };
  handleGridPaste = () => {
    const {
      copiedPage,
      currentPage,
      documentActions,
      docId,
      parentId,
      docMeta,
      user,
      config,
      copiedGridId,
      grids,
    } = this.props;
    const { canSwitchToOldMode = true } = config;
    let errorMessage = '';

    if (copiedPage === currentPage) {
      errorMessage = 'Grid cannot be copied and pasted in the same page.';
      showToast({
        title: errorMessage,
        error: true,
      });
    }

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.paste_grid, {
      docId: docMeta.docId,
      label: docMeta.title,
      'document type': docMeta.type,
      'work email': user.email,
      'line item id': parentId,
      errorMessage,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
    const { pages = [] } = docMeta || {};
    const docHeight = pages[0]?.image?.height;
    if (errorMessage) return;
    let currentCopiedGrid = _.cloneDeep(
      grids.find((item) => item.id === copiedGridId)
    );
    const currentPageGrids = _.cloneDeep(
      grids.filter((item) => item.page + 1 === currentPage)
    );

    let pageDistance = currentPage - (currentCopiedGrid?.page + 1);

    //Update value based on paste grid for the current copied grid
    currentCopiedGrid.bottomRight[1] =
      currentCopiedGrid?.bottomRight[1] + pageDistance * docHeight;
    currentCopiedGrid.topLeft[1] =
      currentCopiedGrid?.topLeft[1] + pageDistance * docHeight;
    currentCopiedGrid.rows.forEach((row) => {
      row.y += pageDistance * docHeight;
    });

    currentCopiedGrid.position = [
      ...currentCopiedGrid?.topLeft,
      ...currentCopiedGrid?.bottomRight,
    ];

    currentCopiedGrid.is_parent_grid = false;
    currentCopiedGrid.page = currentPage - 1;
    currentCopiedGrid.id = crypto.randomUUID();
    currentCopiedGrid.staticId = true;

    //Find overlapping box
    const overlapBbox = this.findOverlappingBoxes(
      currentCopiedGrid,
      currentPageGrids
    );
    let finalGrid = [];
    if (overlapBbox.length > 0) {
      finalGrid = _.cloneDeep(
        grids.filter((item) => !overlapBbox.includes(item.id))
      );
    } else {
      finalGrid = _.cloneDeep(grids);
    }
    finalGrid.push(currentCopiedGrid);
    documentActions.rtUpdateGridData({
      grids: sortGrids(finalGrid),
    });
    //Earlier Manage grid function to make api call for paste grid
    // documentActions.rtManageGridData({
    //   docId,
    //   parentId: parentId,
    //   method: 'PASTE',
    //   grid_id: copiedGridId,
    //   paste_page: [currentPage - 1],
    // });
  };

  render() {
    const { originalGrids, grids, copiedPage, isPastingGrid } = this.props;

    return (
      <>
        <div className={styles.root}>
          {!originalGrids?.length && !grids?.length ? (
            <div className={styles.gridEmpty}>
              <GridAdd className={styles.icon} />
              <p className={styles.gridEmptyText}>
                Add or draw grids to get started
              </p>
              <Tooltip
                label='Read more about table grid'
                className={styles.iconInfo}
              >
                <a
                  href={SUPPORT_LINK.TABLE_GRID}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <InfoEmpty fontSize='12' />
                </a>
              </Tooltip>
            </div>
          ) : null}
        </div>
        {copiedPage && (
          <Button
            type='button'
            icon={PasteClipboard}
            className={styles.paste_btn}
            onClick={this.handleGridPaste}
            disabled={isPastingGrid}
            isLoading={isPastingGrid}
          >
            Paste
          </Button>
        )}
      </>
    );
  }
}

function mapStateToProp(state) {
  const {
    docId,
    documentsById,
    fieldsById,
    selectedSectionFieldId,
    copiedPage,
    isPastingGrid,
    copiedGridId,
    grids,
    originalGrids,
  } = state.documents.reviewTool;
  const { config } = state.app;
  const { pages } = documentsById[docId] || {};
  const { isAddingSimilarLines } = fieldsById[selectedSectionFieldId] || {};

  return {
    pages,
    isAddingSimilarLines,
    copiedPage,
    isPastingGrid,
    config,
    copiedGridId,
    grids,
    originalGrids,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(Footer);
