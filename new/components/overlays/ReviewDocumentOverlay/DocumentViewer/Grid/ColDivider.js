import React, { Component } from 'react';
import { connect } from 'react-redux';
import { showToast } from 'new/redux/helpers';

import cx from 'classnames';
import { Cancel } from 'iconoir-react';
import DropDown from 'new/components/widgets/GridHeaderDropDown';
import { StaticTooltip } from 'new/components/widgets/tooltip';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import { customMixpanelTracking } from 'new/utils/mixpanel';
import { Manager, Popper, Reference } from 'react-popper';
import { Portal } from 'react-portal';

import GridColumnPortal from '../GridColumnPortal';

import styles from '../GridRegion.scss';

class ColDivider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initPosition: null,
      left: this.props.left,
      percentage: null,
      isDropdownOpen: false,
      buttonKey: null,
    };

    this.colRef = React.createRef();
    this.columnTooltipRef = React.createRef();
  }

  dragElement = (
    elmnt = {},
    { onChange, page, index, handleDragging, gridView }
  ) => {
    var pos1 = 0,
      pos3 = 0;
    elmnt.onmousedown = dragMouseDown;
    var position = elmnt.offsetLeft;
    var Changed = false;

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      Changed = false;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      if (!gridView) return;
      handleDragging(true);
      e = e || window.event;
      e.preventDefault();

      Changed = true;
      const gridEle =
        document.getElementById(`grid-table-layout-${page}-${index}`) || {};
      const gridWidth = gridEle.clientWidth;

      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos3 = e.clientX;

      let left = elmnt.offsetLeft - pos1;
      left = left > 0.5 ? left : 0.5;
      left = left < gridWidth - 0.5 ? left : gridWidth - 0.5;
      elmnt.style.left = left + 'px';
      position = left;
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
    const {
      absolute,
      atLeastOneHeaderFound,
      tableGridStyle,
      left: colLeft,
    } = this.props;

    if (!absolute) {
      this.dragElement(this.colRef.current, this.props);
    }

    if (absolute && !atLeastOneHeaderFound) {
      this.setState({ isDropdownOpen: true });
    }

    if (this.columnTooltipRef.current && tableGridStyle) {
      const top = `calc(${tableGridStyle.top} - 7px)`;
      const left = `calc(${tableGridStyle.left} + ${colLeft}px)`;

      this.columnTooltipRef.current.style.top = top;
      this.columnTooltipRef.current.style.left = left;
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.gridView !== this.props.gridView && !this.props.absolute) {
      this.dragElement(this.colRef.current, this.props);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { left, atLeastOneHeaderFound, absolute } = nextProps;
    const { left: preLeft, atLeastOneHeaderFound: preHeaders } = this.props;

    if (left && preLeft && preLeft !== left) {
      this.setState({
        left: this.props.left,
      });
    }
    if (atLeastOneHeaderFound !== preHeaders && absolute) {
      this.setState({ isDropdownOpen: !atLeastOneHeaderFound });
    }
  }

  shouldComponentUpdate(nextProps = {}, nextState) {
    const { left, isDropdownOpen } = nextState;
    const { left: preLeft, isDropdownOpen: preIsDropdownOpen } = this.state;

    const {
      header,
      absolute,
      foundedHeader = [],
      atLeastOneHeaderFound,
      enableInteraction,
      buttonKey,
      colLength,
      gridView,
    } = this.props;

    if (
      header !== nextProps.header ||
      absolute !== nextProps.absolute ||
      foundedHeader.length !== nextProps.foundedHeader.length ||
      atLeastOneHeaderFound !== nextProps.atLeastOneHeaderFound ||
      buttonKey !== nextProps.buttonKey ||
      colLength !== nextProps.colLength ||
      enableInteraction !== nextProps.enableInteraction ||
      preLeft !== left ||
      isDropdownOpen !== preIsDropdownOpen ||
      gridView !== nextProps.gridView
    ) {
      return true;
    }
    return false;
  }

  handleColumnButtonClick = () => {
    const { gridView, docReadOnly } = this.props;

    if (docReadOnly) return;

    if (!gridView) {
      showToast({
        title: 'Please click on the Edit button to assign headers to columns.',
        info: true,
      });
      return;
    }
    this.setState({ isDropdownOpen: true });

    this.mixpanelTracking(MIXPANEL_EVENTS.column_mapper_click);
  };

  mixpanelTracking = (evtName) => {
    const {
      config: { accountType = '', canSwitchToOldMode = true },
      user: { email = '', role = '', companyName = '' },
      docMeta: { docId = '', title = '', type = '' },
    } = this.props;
    customMixpanelTracking(evtName, {
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
    let { left, isDropdownOpen } = this.state;
    const {
      colIndex,
      index,
      handleRemove,
      header,
      absolute,
      foundedHeader,
      handleChangeHeader,
      atLeastOneHeaderFound,
      gridView,
      sortedColumnOptions,
      columnOverlayWidth,
      enableInteraction,
    } = this.props;
    const style = {
      left: `${left}px`,
    };
    return (
      <>
        {header && gridView && enableInteraction ? (
          <span
            className={styles.columnOverlay}
            style={{ width: `${columnOverlayWidth}px`, ...style }}
          ></span>
        ) : (
          ''
        )}
        <div
          className={cx(
            styles.column,
            'grid-column',
            { [styles.passiveColumn]: !gridView },
            { [styles.openDD]: isDropdownOpen },
            { [styles.absoluteItem]: absolute },
            {
              [styles.errorOnNoHeader]:
                absolute && !atLeastOneHeaderFound && gridView,
            }
          )}
          style={style}
          ref={this.colRef}
        >
          {gridView && !absolute && enableInteraction ? (
            <button
              className={styles.removeImgBox}
              onClick={() => handleRemove(left)}
              title='Delete Column'
            >
              <Cancel className={styles.removeImg} />
            </button>
          ) : (
            ''
          )}

          <svg className={styles.column__svgLine}>
            <line x1='1' y1='0' x2='1' y2='100%' />
          </svg>

          {enableInteraction ? (
            <GridColumnPortal>
              <div
                ref={this.columnTooltipRef}
                className={cx(styles.portalColumnHeader, 'UFTooltipLink', {
                  'd-none': gridView,
                })}
                title={gridView ? 'Select Column Header' : null}
                onClick={this.handleColumnButtonClick}
                role='presentation'
              >
                <StaticTooltip
                  visible={header || gridView}
                  hasUnassignTooltip={!header && gridView}
                  hasErrorTooltip={absolute && !atLeastOneHeaderFound}
                  showStaticTooltip={
                    gridView && absolute && !atLeastOneHeaderFound
                  }
                  staticTooltipLabel='Select header for at-least one grid column'
                  position='top'
                  description={!header && gridView ? 'Unassigned' : header}
                  hideArrow
                />
              </div>
            </GridColumnPortal>
          ) : (
            ''
          )}

          {enableInteraction && gridView ? (
            <Manager>
              <Reference>
                {({ ref }) => (
                  <div
                    className={cx(
                      styles.columnHeader,
                      {
                        [styles.columnHeader__top]: !gridView,
                      },
                      'UFTooltipLink'
                    )}
                    onClick={this.handleColumnButtonClick}
                    id={`drop_down_${colIndex}`}
                    title={gridView ? 'Select Column Header' : null}
                    ref={ref}
                    role='presentation'
                  >
                    <StaticTooltip
                      visible={header || gridView}
                      hasUnassignTooltip={!header && gridView}
                      hasErrorTooltip={absolute && !atLeastOneHeaderFound}
                      showStaticTooltip={
                        gridView && absolute && !atLeastOneHeaderFound
                      }
                      staticTooltipLabel='Select header for at-least one grid column'
                      position='top'
                      description={!header && gridView ? 'Unassigned' : header}
                      hideArrow
                    />
                  </div>
                )}
              </Reference>
              {this.state.isDropdownOpen && (
                <Portal>
                  <Popper placement={'left-start'} strategy='fixed'>
                    {({ ref, style, placement }) => (
                      <div
                        ref={ref}
                        style={{
                          ...style,
                          zIndex: 10000,
                          width: '185px',
                        }}
                        data-placement={placement}
                      >
                        <DropDown
                          onChange={(e) => {
                            handleChangeHeader(e);
                          }}
                          className={styles.columnOptions}
                          open={isDropdownOpen}
                          defaultValue={header}
                          buttonKey={colIndex}
                          onClose={() =>
                            this.setState({
                              isDropdownOpen: false,
                            })
                          }
                          options={sortedColumnOptions || []}
                          activatedHeaders={foundedHeader || []}
                        />
                      </div>
                    )}
                  </Popper>
                </Portal>
              )}
            </Manager>
          ) : (
            ''
          )}
        </div>
      </>
    );
  }
}

function mapStateToProps(state) {
  const { copiedPage, copiedGridId, docId } = state.documents.reviewTool;
  const { user, config } = state.app;

  return {
    copiedPage,
    copiedGridId,
    docId,
    user,
    config,
  };
}

export default connect(mapStateToProps, null)(ColDivider);
