import React, { Component } from 'react';
import { connect } from 'react-redux';
import { showToast } from 'new/redux/helpers';
import { actions as documentActions } from 'new/redux/oldDocuments/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import {
  Check,
  GridAdd,
  InfoEmpty,
  PageDown,
  PageUp,
  PasteClipboard,
} from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import {
  GlobalTooltip,
  HelpTooltip,
} from 'new/components/overlays/OldReviewDocumentOverlay/tooltip';
import ttConstants from 'new/constants/helpTooltips';
import { SUPPORT_LINK } from 'new/constants/urllink';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import { customMixpanelTracking } from 'new/utils/mixpanel';

import styles from './footer.scss';

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copiedPage: null,
      currentGrid: 1,
      scrollListenerActive: true,
    };
  }

  copyPage = (page) => {
    this.setState({ copiedPage: page });
  };

  setCurrentGrid = () => {
    const { grids, currentPage } = this.props;
    const shortedGrid = _.sortBy(grids, 'page');
    const currentGrid = _.findIndex(
      shortedGrid,
      (grid) => grid.page === currentPage - 1
    );
    if (currentGrid !== -1) {
      this.setState({
        currentGrid: currentGrid + 1,
      });
    } else {
      this.setState({
        currentGrid: !this.state.currentGrid
          ? this.state.currentGrid
          : this.state.currentGrid - 1,
      });
    }
  };

  handleScroll = () => {
    const { scrollListenerActive } = this.state;
    const { grids = [] } = this.props;
    var childDivs = grids.map((grid, index) => {
      let childDiv = document.getElementById(
        `grid-table-layout-${grid.page}-${index}`
      );
      return childDiv;
    });
    const docWrapper = document.getElementById('rt-document-wrapper');
    let lastChildDivInView = null;
    if (!scrollListenerActive || !grids.length) return;
    const parentRect = docWrapper?.getBoundingClientRect();
    let visibleChildDiv = null;
    childDivs.forEach((childDiv) => {
      const childRect = childDiv?.getBoundingClientRect();
      const parentMiddle = parentRect.height / 2;
      if (
        !visibleChildDiv &&
        childRect &&
        parentRect &&
        childRect.top - parentRect.top >= parentMiddle * 0.75 &&
        childRect.top - parentRect.top <= parentMiddle * 1.25
      ) {
        visibleChildDiv = childDiv;
      }
    });

    if (visibleChildDiv) {
      lastChildDivInView = visibleChildDiv;
      const match = lastChildDivInView?.id.match(/\d+/g);
      if (match !== null && match.length >= 2) {
        this.setState({
          currentGrid: Number(match[1]) + 1,
        });
      }
    }
  };

  componentDidMount() {
    this.setCurrentGrid();
    const docWrapper = document.getElementById('rt-document-wrapper');
    docWrapper?.addEventListener('scroll', this.handleScroll);
  }

  componentDidUpdate({
    isAddingSimilarLines: prevSimilarLine,
    grids: prevGrids,
  }) {
    const { handleCloseGrid, isAddingSimilarLines, grids } = this.props;

    if (grids.length !== prevGrids.length) {
      this.setCurrentGrid();
    }
    if (isAddingSimilarLines !== prevSimilarLine && !isAddingSimilarLines) {
      handleCloseGrid();
    }
  }

  componentWillUnmount() {
    let docWrapper = document.getElementById('rt-document-wrapper');
    docWrapper?.removeEventListener('scroll', this.handleScroll);
  }

  handleGridChange = (id) => {
    const { grids = [] } = this.props;
    let docWrapper = document.getElementById('rt-document-wrapper');
    docWrapper?.removeEventListener('scroll', this.handleScroll);
    this.setState(
      {
        scrollListenerActive: false,
      },
      () => {
        if (!this.state.scrollListenerActive) {
          let targetGrid = grids.find((grid, idx) => idx === id - 1);
          let currentPage = targetGrid?.page;
          const gridEle = document.getElementById(
            `grid-table-layout-${currentPage}-${id - 1}`
          );
          gridEle?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          if (id !== -1) {
            this.setState({
              currentGrid: id,
              scrollListenerActive: true,
            });
            setTimeout(() => {
              docWrapper?.addEventListener('scroll', this.handleScroll);
            }, 1000);
          }
        }
      }
    );
    // Up down Btns event tracking
    this.mixpanelTracking();
  };

  mixpanelTracking = () => {
    const {
      user: { email = '', role = '', companyName = '' },
      config: { canSwitchToOldMode = true, accountType = '' },
      docMeta: { docId = '', title = '', type = '' },
    } = this.props;

    customMixpanelTracking(MIXPANEL_EVENTS.table_up_down_btns, {
      docId: docId,
      label: title,
      docType: type,
      'work email': email,
      version: 'new',
      role,
      plan: accountType,
      canSwitchUIVersion: canSwitchToOldMode,
      companyName: companyName,
    });
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

    if (errorMessage) return;

    documentActions.rtManageGridData({
      docId,
      parentId: parentId,
      method: 'PASTE',
      grid_id: copiedGridId,
      paste_page: [currentPage - 1],
    });
  };

  render() {
    const { currentGrid } = this.state;
    const {
      handleClose,
      extractData,
      grids,
      isAddingSimilarLines,
      copiedPage,
      isPastingGrid,
      isDragging,
    } = this.props;
    const headerFounded = grids.find(
      (grid) => grid.columns && grid.columns.find((e) => e.header)
    );

    const disabled =
      !(grids && grids.length) ||
      !(grids && grids.length && headerFounded) ||
      isDragging;
    //const tooltipText = 'Select area below table header to make grid.';
    const tooltipText =
      'Click and drag table region on the document to capture table.';
    return (
      <>
        <div className={styles.root}>
          {grids && grids.length ? (
            <>
              <div className={styles.GridFooter}>
                <div className={styles.tablePagination}>
                  <IconButton
                    icon={PageUp}
                    variant='text'
                    onClick={() => {
                      currentGrid !== 1 &&
                        this.handleGridChange(currentGrid - 1);
                    }}
                    disabled={currentGrid === 1}
                  />
                  <span className={styles.pagination}>
                    Table: {currentGrid}/{grids.length || 1}
                  </span>
                  <IconButton
                    icon={PageDown}
                    variant='text'
                    onClick={() => {
                      currentGrid !== grids.length &&
                        this.handleGridChange(currentGrid + 1);
                    }}
                    disabled={currentGrid === grids.length}
                  />
                </div>
                <span className={styles.separator}></span>
                <div className={cx(styles.tableActions)}>
                  <Button
                    onClick={() => handleClose()}
                    variant='outlined'
                    size='small'
                    className='mr-4'
                  >
                    Cancel
                  </Button>

                  <GlobalTooltip
                    img={'selectTable'}
                    visible={!(grids && grids.length)}
                    position='top'
                    description={tooltipText}
                    className={styles.reviewToolTip}
                  >
                    <HelpTooltip
                      id={ttConstants.TT_REVIEW_SCRREN_AUTO_EXTRACT_TABLE}
                    >
                      <HelpTooltip
                        id={ttConstants.TT_REVIEW_SCRREN_GRID_EXTRACT_DATA}
                      >
                        <Tooltip
                          labelClassName={styles.tooltip}
                          label={'Extract data as specified by the grid above'}
                          placement={'top'}
                        >
                          <Button
                            icon={Check}
                            className={cx('UFTooltipApplyChanges')}
                            disabled={disabled}
                            onClick={() => extractData()}
                            isLoading={isAddingSimilarLines || false}
                            size='small'
                          >
                            Apply Changes
                          </Button>
                        </Tooltip>
                      </HelpTooltip>
                    </HelpTooltip>
                  </GlobalTooltip>
                </div>
              </div>
            </>
          ) : (
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
          )}
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
    isDragging,
    copiedGridId,
  } = state.documents.reviewTool;
  const { config } = state.app;
  const { pages } = documentsById[docId] || {};
  const { isAddingSimilarLines } = fieldsById[selectedSectionFieldId] || {};

  return {
    pages,
    isAddingSimilarLines,
    copiedPage,
    isPastingGrid,
    isDragging,
    config,
    copiedGridId,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(Footer);
