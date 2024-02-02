import React, { Component } from 'react';
import { connect } from 'react-redux';
import { showToast } from 'new/redux/helpers';

import cx from 'classnames';
import { Cancel } from 'iconoir-react';
import { ReactComponent as IconChain } from 'new/assets/images/icons/icon-chain.svg';
import { StaticTooltip } from 'new/components/overlays/OldReviewDocumentOverlay/tooltip';
import DropDown from 'new/components/widgets/GridHeaderDropDown';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import { customMixpanelTracking } from 'new/utils/mixpanel';
import { Manager, Popper, Reference } from 'react-popper';

import DropdownPortal from '../DropdownPortal';

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
    const { absolute, atLeastOneHeaderFound, gridCount } = this.props;
    if (!absolute) {
      this.dragElement(this.colRef.current, this.props);
    }

    if (gridCount === 0 && absolute && !atLeastOneHeaderFound) {
      this.setState({ isDropdownOpen: true });
    }
  }
  //   handleHeaderChange = (e) => {
  //       const { handleChangeHeader, buttonKey, colLength} = this.props;
  //       handleChangeHeader(e);

  //       if(buttonKey < colLength){
  //           if(e){
  //               let incrementButtonKey =  buttonKey + 1;

  //               const buttonRef = document.getElementById(`drop_down_${incrementButtonKey}`);
  //               if(buttonRef){
  //                   buttonRef.click();
  //               }
  //           }else{
  //               let incrementButtonKey =  buttonKey - 1;
  //               const buttonRef = document.getElementById(`drop_down_${incrementButtonKey}`);
  //               if(buttonRef){
  //                   buttonRef.click();
  //               }
  //           }
  //       }
  //   }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { left, atLeastOneHeaderFound, absolute, gridCount } = nextProps;
    const { left: preLeft, atLeastOneHeaderFound: preHeaders } = this.props;

    if (left && preLeft && preLeft !== left) {
      this.setState({
        left: this.props.left,
      });
    }
    if (gridCount === 0 && atLeastOneHeaderFound !== preHeaders && absolute) {
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
      gridCount,
      gridView,
      buttonKey,
      colLength,
    } = this.props;

    if (
      header !== nextProps.header ||
      absolute !== nextProps.absolute ||
      foundedHeader.length !== nextProps.foundedHeader.length ||
      atLeastOneHeaderFound !== nextProps.atLeastOneHeaderFound ||
      buttonKey !== nextProps.buttonKey ||
      colLength !== nextProps.colLength ||
      gridView !== nextProps.gridView ||
      gridCount !== gridCount ||
      preLeft !== left ||
      isDropdownOpen !== preIsDropdownOpen
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
        error: true,
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
      buttonKey,
      handleRemove,
      header,
      gridHeaders,
      absolute,
      foundedHeader,
      handleChangeHeader,
      atLeastOneHeaderFound,
      gridCount,
      gridView,
    } = this.props;
    const style = {
      left: `${left}px`,
    };
    return (
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
        {gridView && !absolute ? (
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

        <Manager>
          <Reference>
            {({ ref }) => (
              <button
                className={cx(
                  styles.selectColumn,
                  { [styles.selectedColumn]: header },
                  { [styles.passiveSelectColumn]: !gridView },
                  'UFTooltipLink'
                )}
                onClick={this.handleColumnButtonClick}
                id={`drop_down_${buttonKey}`}
                title={gridView ? 'Select Column Header' : null}
                ref={ref}
              >
                <StaticTooltip
                  visible={header}
                  position='top'
                  description={header}
                  hideArrow
                />
                {!gridView ? (
                  <IconChain className={styles.columnIcon} />
                ) : gridCount === 0 && absolute && !atLeastOneHeaderFound ? (
                  <Tooltip
                    visible={
                      gridCount === 0 && absolute && !atLeastOneHeaderFound
                    }
                    placement='top'
                    label='Select header for at-least one grid column.'
                    className={styles.reviewToolTip}
                    iconType='close'
                  >
                    <IconChain className={styles.columnIcon} />
                  </Tooltip>
                ) : (
                  <IconChain className={styles.columnIcon} />
                )}
                {/* {!gridView ? (
	                        		''
									) : (
												
										<DropDown
											onChange={(e) => {
												handleChangeHeader(e);
												//this.handleHeaderChange(e);
											}}
											className={styles.columnOptions}
											open={isDropdownOpen}
											defaultValue={header}
											buttonKey={buttonKey}
											onClose={() =>
												this.setState({ isDropdownOpen: false })
											}
											options={gridHeaders || []}
											activatedHeaders={foundedHeader || []}
										/>
									
									)} */}
              </button>
            )}
          </Reference>
          {gridView && this.state.isDropdownOpen && (
            <DropdownPortal>
              <Popper placement='bottom-start' strategy='fixed'>
                {({ ref, style, placement }) => (
                  <div
                    ref={ref}
                    style={{
                      ...style,
                      zIndex: 5,
                      width: '185px',
                    }}
                    data-placement={placement}
                  >
                    <DropDown
                      onChange={(e) => {
                        handleChangeHeader(e);
                        //this.handleHeaderChange(e);
                      }}
                      className={styles.columnOptions}
                      open={isDropdownOpen}
                      defaultValue={header}
                      buttonKey={buttonKey}
                      onClose={() =>
                        this.setState({
                          isDropdownOpen: false,
                        })
                      }
                      options={gridHeaders || []}
                      activatedHeaders={foundedHeader || []}
                    />
                  </div>
                )}
              </Popper>
            </DropdownPortal>
          )}
        </Manager>
      </div>
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
