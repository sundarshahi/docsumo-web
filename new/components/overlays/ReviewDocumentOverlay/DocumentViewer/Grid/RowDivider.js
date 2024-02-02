import React, { Component } from 'react';
import { connect } from 'react-redux';

import cx from 'classnames';
import { Cancel } from 'iconoir-react';
import { ReactComponent as AddImg } from 'new/assets/images/icons/add.svg';
import { ReactComponent as CloseImg } from 'new/assets/images/icons/clear.svg';
import { HelpTooltip } from 'new/components/widgets/tooltip';
import ttConstants from 'new/constants/helpTooltips';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import { customMixpanelTracking } from 'new/utils/mixpanel';

import styles from '../GridRegion.scss';

class RowDivider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initPosition: null,
      top: this.props.top,
      percentage: null,
      ignore: false,
      isHeaderSelected: false,
    };
    this.rowRef = React.createRef();
    this.changeDisplayRef = React.createRef();
  }

  dragElement = (elmnt = {}, { onChange, page, index, handleDragging }) => {
    var pos2 = 0,
      pos4 = 0;
    var position = elmnt.offsetTop;
    var Changed = false;
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      handleDragging(true);
      e = e || window.event;
      e.preventDefault();
      Changed = false;
      // get the mouse cursor position at startup:
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      Changed = true;
      const gridEle =
        document.getElementById(`grid-table-layout-${page}-${index}`) || {};
      const gridHeight = gridEle.clientHeight;

      // calculate the new cursor position:
      pos2 = pos4 - e.clientY;
      pos4 = e.clientY;
      let top = elmnt.offsetTop - pos2;
      top = top > 0.5 ? top : 0.5;
      top = top < gridHeight - 1 ? top : gridHeight - 1;
      // set the element's new position:
      elmnt.style.top = top + 'px';
      position = top;
    }

    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
      if (Changed) {
        onChange(position);
      }
    }
  };

  componentDidMount() {
    const { ignore, absolute, isHeaderSelected, gridView } = this.props;
    if (gridView) {
      if (!absolute) {
        this.dragElement(this.rowRef.current, this.props);
      }
    }
    this.setHeight();
    this.setState({
      ignore,
      isHeaderSelected,
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.gridView !== this.props.gridView && !this.props.absolute) {
      this.dragElement(this.rowRef.current, this.props);
    }
  }

  componentWillUnmount() {
    if (this.changeDisplayRef.current) {
      clearTimeout(this.changeDisplayRef.current);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { top, ignore, postRow, isHeaderSelected } = nextProps;
    const {
      top: preTop,
      ignore: prevIgnore,
      postRow: prePostRow,
      isHeaderSelected: preIsHeaderSelected,
    } = this.props;
    if (preTop !== top) {
      this.setState({
        top,
        ignore,
      });
      this.setHeight(postRow);
    }
    if (isHeaderSelected !== preIsHeaderSelected) {
      this.setState({
        isHeaderSelected,
      });
    }
    if (ignore !== prevIgnore) {
      this.setState({
        ignore,
      });
    }
    if ((postRow && postRow.position) !== (prePostRow && prePostRow.position)) {
      this.setHeight(postRow || {});
    }
  }

  setHeight(postRow) {
    const { top, page, index } = this.props;
    let Row = postRow || this.props.postRow;
    const gridEle =
      document.getElementById(`grid-table-layout-${page}-${index}`) || {};
    const gridHeight = gridEle.clientHeight;
    if (Row && Row.position) {
      const height = Math.abs(Row.position - top);
      this.setState({
        height,
      });
    } else {
      this.setState({
        height: gridHeight - top,
      });
    }
  }

  shouldComponentUpdate(_nextProps, nextState) {
    const { top, ignore, height, isHeaderSelected } = this.state;
    const {
      top: preTop,
      ignore: prevIgnore,
      height: prevHeight,
      isHeaderSelected: preIsHeaderSelected,
    } = nextState;

    const { atLeastOneHeaderFound, gridView, enableInteraction } = this.props;
    if (
      top !== preTop ||
      ignore !== prevIgnore ||
      height !== prevHeight ||
      isHeaderSelected !== preIsHeaderSelected ||
      atLeastOneHeaderFound !== _nextProps.atLeastOneHeaderFound ||
      gridView !== _nextProps.gridView ||
      enableInteraction !== _nextProps.enableInteraction
    ) {
      return true;
    }
    return false;
  }

  noHeader = (e) => {
    const { selectHeader } = this.props;
    e.stopPropagation();
    selectHeader(false);
    const tool = document.getElementById('tooltipSelection') || {};
    tool.style.display = 'none';
    this.changeDisplayRef.current = setTimeout(() => {
      tool.style.display = 'block';
    }, 200);
  };

  handleYesClick = (e) => {
    const { selectHeader } = this.props;
    const { isHeaderSelected } = this.state;
    e.stopPropagation();
    selectHeader(!isHeaderSelected);
  };

  mixpanelTracking = () => {
    const {
      config: { accountType = '', canSwitchToOldMode = true },
      user: { email = '', role = '', companyName = '' },
      docMeta: { docId = '', title = '', type = '' },
    } = this.props;

    customMixpanelTracking(MIXPANEL_EVENTS.add_header_btn, {
      docId: docId,
      label: title,
      docType: type,
      email: email,
      plan: accountType,
      canSwitchUIVersion: canSwitchToOldMode,
      role,
      companyName,
    });
  };

  render() {
    let { top, height, ignore, isHeaderSelected } = this.state;

    const {
      onRemove,
      handleRemove,
      absolute,
      postRow,
      page,
      selectHeader,
      atLeastOneHeaderFound,
      gridView,
      index,
      enableInteraction,
    } = this.props;
    const style = {
      top: `${top}px`,
    };
    const rowStyle = {
      top: `calc(${top}px + 1px)`,
      height: `calc(${height}px - 1px)`,
    };

    return (
      <>
        {gridView && absolute && enableInteraction ? (
          <>
            {isHeaderSelected ? (
              <button
                className={cx(styles.addRowHeader, {
                  [styles.rowHeaderSelected]: postRow && isHeaderSelected,
                })}
                onClick={() => {
                  selectHeader(!isHeaderSelected);
                }}
              >
                <Tooltip label='Remove Header' size='sm'>
                  Header
                </Tooltip>
              </button>
            ) : (
              <button
                className={cx(styles.addRowHeader, {
                  [styles.rowHeaderSelected]: postRow && isHeaderSelected,
                })}
                onClick={() => {
                  selectHeader(!isHeaderSelected);
                  this.mixpanelTracking();
                }}
              >
                Add Header
              </button>
            )}
          </>
        ) : null}

        {enableInteraction ? (
          <div
            style={rowStyle}
            id={
              !(postRow && postRow.position)
                ? `grid-layout-last-row-conatiner-${page}-${index}`
                : undefined
            }
            className={cx(
              styles.rowContainer,
              { [styles.disableRowContainer]: ignore },
              {
                [styles.rowSelected]:
                  absolute && postRow && isHeaderSelected && ignore,
              },
              { [styles.rowHovered]: postRow && !isHeaderSelected },
              { [styles.passiveRowHovered]: !gridView }
            )}
          >
            {gridView && !absolute ? (
              <>
                <HelpTooltip
                  id={
                    absolute &&
                    ttConstants.TT_REVIEW_SCRREN_GRID_IGNORE_ROW_DATA
                  }
                >
                  <button
                    className={styles.removeImgBox}
                    onClick={() => onRemove(!ignore)}
                    title={!ignore ? 'Ignore Data' : 'Include Data'}
                  >
                    {ignore ? (
                      <AddImg className={styles.removeImg} />
                    ) : (
                      <CloseImg className={styles.removeImg} />
                    )}
                  </button>
                </HelpTooltip>
                <span className={styles.rowContainer__bg} />
              </>
            ) : (
              <span className={styles.rowContainer__bg} />
            )}
          </div>
        ) : (
          ''
        )}

        <div
          className={cx(
            styles.row,
            { [styles.absoluteItem]: absolute },
            { [styles.absoluteItemPassive]: absolute && !gridView },
            { [styles.passiveRow]: !gridView }
          )}
          style={style}
          ref={this.rowRef}
        >
          {gridView && !absolute && enableInteraction ? (
            <button
              className={styles.removeImgBox}
              onClick={() => handleRemove(top)}
              title='Delete Row'
            >
              <Cancel className={styles.removeImg} />
            </button>
          ) : (
            ''
          )}

          <svg className={styles.row__svgLine}>
            <line x1='0' y1='1' x2='100%' y2='1' />
          </svg>
        </div>
      </>
    );
  }
}

function mapStateToProps(state) {
  const { config, user } = state.app;
  return {
    config,
    user,
  };
}

export default connect(mapStateToProps, null)(RowDivider);
