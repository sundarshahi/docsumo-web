import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  // actionTypes as documentActionTypes,
  actions as gloableActions,
} from 'new/redux/app/actions';
//import { Button, APPEARANCES } from 'new/components/widgets/buttons';
import { actions as documentActions } from 'new/redux/oldDocuments/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import _ from 'lodash';
import AddColumn from 'new/assets/images/docsumo/add-column.gif';
import AddRow from 'new/assets/images/docsumo/add-row.gif';
import AssignHeader from 'new/assets/images/docsumo/assign-header.gif';
import IgnoreRow from 'new/assets/images/docsumo/ignore-row.gif';
import SelectRegion from 'new/assets/images/docsumo/select-region-icon.gif';
import SelectTable from 'new/assets/images/docsumo/select-table.gif';
import StretchTable from 'new/assets/images/docsumo/stretch-table.gif';
import { ReactComponent as CloseIcon } from 'new/assets/images/icons/clear.svg';
//import { ReactComponent as RightIcon } from 'new/assets/images/icons/chevron-right.svg';
import { ReactComponent as RightArrowIcon } from 'new/assets/images/icons/right-arrow-tt.svg';
import defineViewPort from 'new/utils/defineViewPort';
import Popover from 'react-tiny-popover';

import styles from './styles.scss';

class HelpToolTip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTTParent: null,
      currentPChildrens: null,
      currentTT: {},
      lastTT: null,
      visible: false,
      tooltipPosition: false,
    };
  }

  componentDidMount() {
    this.setTooltip();
    // eslint-disable-next-line compat/compat
    const parsedUrl = new URL(window.location.href);
    const client = parsedUrl.searchParams.get('client');
    if (sessionStorage.getItem('tempToken') && !client) {
      this.setState({
        tooltipPosition: true,
      });
    }
  }

  componentDidUpdate(preProps) {
    const { helpTTSequence, helpChildTTSequence } = this.props;
    const {
      helpTTSequence: preHelpTTSequence,
      helpChildTTSequence: preHelpChildTTSequence,
    } = preProps;
    if (
      helpTTSequence !== preHelpTTSequence ||
      helpChildTTSequence !== preHelpChildTTSequence
    ) {
      this.setTooltip();
    }
  }

  setTooltip = () => {
    const { id, helpTTSequence, helpChildTTSequence, tooltipFlow } = this.props;
    const currentTTParent = _.find(tooltipFlow, ['sequence', helpTTSequence]);
    const currentPChildrens = currentTTParent && currentTTParent.childrens;
    const currentTT = _.find(currentPChildrens, [
      'sequence',
      helpChildTTSequence,
    ]);
    const lastTT =
      helpTTSequence === tooltipFlow.length &&
      helpChildTTSequence === _.last(tooltipFlow).childrens.length;
    /* if(document && !document[`onTTLoad${helpTTSequence+1}`]){
            if(onNext){
                document[`onTTLoad${helpTTSequence+1}`] = onNext;
            }
        } */
    this.setState({
      currentTTParent,
      currentPChildrens,
      currentTT,
      lastTT,
      visible: false,
    });
    if (id && currentTT && currentTT.id === id) {
      const findEle = document.querySelector(`.${id}`);
      this.setState({
        currentTTParent,
        currentPChildrens,
        currentTT,
        lastTT,
      });
      if (findEle && !defineViewPort(findEle)) {
        findEle.onload = () => {
          window.loadingEle = findEle;
        };
        window.foundedEle = findEle;
        findEle.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setTimeout(() => this.setState({ visible: true }), 200);
    }
    /* if(!id || !currentTT || currentTT.id !== id ){
            return (<>{ children }</>);
        } else {
            setTimeout(() => {
                const findEle = document.querySelector(`.${id}`);
                visible = true;
                if(findEle && !defineViewPort(findEle)){
                    findEle.onload = () => { window.loadingEle = findEle; };
                    window.foundedEle = findEle;
                    findEle.scrollIntoView({ behavior: 'smooth',  block: 'center'  });
                }
            }, 500);
        } */
  };

  nextClick = () => {
    const { gloableActions, helpTTSequence, helpChildTTSequence, onNext } =
      this.props;
    const { currentPChildrens, lastTT } = this.state;
    const {
      setHelpTTSequence,
      setLocalConfigFlags,
      setConfigFlags,
      setTooltipFlowModal,
    } = gloableActions;
    const childSequence =
      helpChildTTSequence < currentPChildrens.length
        ? helpChildTTSequence + 1
        : 1;
    const sequence =
      helpChildTTSequence < currentPChildrens.length
        ? helpTTSequence
        : helpTTSequence + 1;
    // eslint-disable-next-line compat/compat
    const parsedUrl = new URL(window.location.href);
    const client = parsedUrl.searchParams.get('client');
    if (sessionStorage.getItem('tempToken') && !client) {
      // if(lineItemId.length === 0){
      //     setLocalConfigFlags({
      //         'showTooltipFlow': false,
      //     });
      //     setTooltipFlowModal(false);
      //     setHelpTTSequence({ sequence: undefined, childSequence: undefined });
      // }
      if (onNext) {
        document[`onTTLoad${childSequence}-${sequence}`] = onNext;
      }
      if (lastTT) {
        setLocalConfigFlags({
          showTooltipFlow: false,
        });
      }
      setTooltipFlowModal(false);
      setHelpTTSequence({
        sequence: lastTT ? undefined : sequence,
        childSequence: lastTT ? undefined : childSequence,
      });
    } else {
      if (onNext) {
        document[`onTTLoad${childSequence}-${sequence}`] = onNext;
      }
      if (lastTT) {
        setLocalConfigFlags({
          showTooltipFlow: false,
        });
        setConfigFlags({
          showTooltipFlow: false,
        });
      }
      setTooltipFlowModal(false);
      setHelpTTSequence({
        sequence: lastTT ? undefined : sequence,
        childSequence: lastTT ? undefined : childSequence,
      });
    }
  };

  tooltipClose = () => {
    const { gloableActions } = this.props;
    const { setHelpTTSequence, setLocalConfigFlags, setTooltipFlowModal } =
      gloableActions;
    // eslint-disable-next-line compat/compat
    const parsedUrl = new URL(window.location.href);
    const client = parsedUrl.searchParams.get('client');
    if (sessionStorage.getItem('tempToken') && !client) {
      setLocalConfigFlags({
        showTooltipFlow: false,
      });
      setTooltipFlowModal(false);
      setHelpTTSequence({
        sequence: undefined,
        childSequence: undefined,
      });
    } else {
      setHelpTTSequence({ sequence: null });
    }
  };

  render() {
    const { currentTT = {}, lastTT, visible, tooltipPosition } = this.state;
    const { children, visiblePopup, showTooltipIntroModal } = this.props;
    const isSidebarTip = ['/edit-fields/', '/review-document/'].includes(
      currentTT.route
    );
    let selectRegion = currentTT.id === 'tt_review_screen-lable_value';
    let info = currentTT.id === 'tt-header-info-icon';
    let approveDoc = currentTT.id === 'tt_review_screen-line_approve-doc';
    let image;
    switch (currentTT.img) {
      case 'autoExtract':
        image = SelectTable;
        break;
      case 'stretch':
        image = StretchTable;
        break;
      case 'addRow':
        image = AddRow;
        break;
      case 'ignore':
        image = IgnoreRow;
        break;
      case 'assignHeader':
        image = AssignHeader;
        break;
      case 'selectRegion':
        image = SelectRegion;
        break;
      case 'addColumn':
        image = AddColumn;
        break;
      default:
        image = SelectTable;
    }
    return (
      <Popover
        isOpen={visible && visiblePopup && !showTooltipIntroModal}
        position={currentTT.position || ['left', 'right', 'bottom', 'top']} // if you'd like, supply an array of preferred positions ordered by priority
        padding={10} // adjust padding here!
        disableReposition // prevents automatic readjustment of content position that keeps your popover content within your window's bounds
        //onClickOutside handle click events outside of the popover/target here!
        containerClassName={cx(
          styles.container,
          {
            [styles.isSidebarTip]: isSidebarTip || currentTT.sidebar,
          },
          { [styles.freetoolPosition]: currentTT.sidebar },
          { [styles.regionContainer]: selectRegion },
          { [styles.approveDoc]: approveDoc },
          { [styles.tooltipPosition]: tooltipPosition }
        )}
        content={(
          { position } // you can also provide a render function that injects some useful stuff!
        ) => (
          <div className={cx(styles.content, { [styles.info]: info })}>
            <CloseIcon
              className={styles.closeIcon}
              onClick={() => this.tooltipClose()}
            />
            {currentTT.description && (
              <p className={styles.contentText}>{currentTT.description}</p>
            )}
            {currentTT.img && (
              <img
                src={image}
                alt='help-img'
                className={cx(styles.contentImg, {
                  [styles.regionImg]: selectRegion,
                })}
              />
            )}
            {/* <Button 
                            iconRightClassName={styles.iconRight}
                            iconRight={!lastTT ? RightIcon : null} 
                            onClick={() => this.nextClick()}
                            appearance={APPEARANCES.PRIMARY_REVERSED}
                            className={cx(styles.nextBtn, {[styles.gifNext] : currentTT.img})}
                        >
                            { lastTT ? 'Got It' : 'Next'}
                        </Button> */}
            <button
              className={cx(styles.nextBtn, {
                [styles.gifNext]: currentTT.img,
              })}
              onClick={() => this.nextClick()}
            >
              {lastTT ? 'Got It' : 'Next'}
              {!lastTT ? <RightArrowIcon className={styles.nextIcon} /> : null}
            </button>
            <div
              className={cx(
                styles.arrow,
                { [styles.regionArrow]: selectRegion },
                { [styles.approveDocArrow]: approveDoc }
              )}
              data-placement={position}
            />
          </div>
        )}
      >
        {children}
      </Popover>
    );
  }
}

function mapStateToProp(state) {
  const {
    helpTTSequence,
    helpChildTTSequence,
    config,
    tooltipFlow,
    showTooltipIntroModal,
  } = state.app;
  const { lineItemId } = state.documents.reviewTool;
  return {
    helpTTSequence,
    helpChildTTSequence,
    visiblePopup: config && config.flags && config.flags.showTooltipFlow,
    tooltipFlow,
    showTooltipIntroModal,
    lineItemId,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    gloableActions: bindActionCreators(gloableActions, dispatch),
    buttonActions: bindActionCreators(documentActions, dispatch),
  };
}

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(HelpToolTip)
);

export class GlobalTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
    this.handleCloseTooltip(this.props.visible);
  }

  handleCloseTooltip = (visible) => {
    this.setState({ visible });
  };

  componentDidUpdate(preProps) {
    if (preProps.visible !== this.props.visible) {
      this.handleCloseTooltip(this.props.visible);
    }
  }

  render() {
    const { visible } = this.state;
    const { position, description, img, children, className } = this.props;
    let image;
    switch (img) {
      case 'autoExtract':
        image = SelectTable;
        break;
      case 'stretch':
        image = StretchTable;
        break;
      case 'addRow':
        image = AddRow;
        break;
      case 'ignore':
        image = IgnoreRow;
        break;
      case 'assignHeader':
        image = AssignHeader;
        break;
      case 'selectRegion':
        image = SelectRegion;
        break;
      case 'addColumn':
        image = AddColumn;
        break;
      default:
        image = SelectTable;
    }
    return (
      <Popover
        isOpen={visible}
        position={position || ['left', 'right', 'bottom', 'top']} // if you'd like, supply an array of preferred positions ordered by priority
        padding={10} // adjust padding here!
        disableReposition // prevents automatic readjustment of content position that keeps your popover content within your window's bounds
        //onClickOutside handle click events outside of the popover/target here!
        containerClassName={cx(
          styles.container,
          styles.globalContainer,
          className
        )}
        content={(
          { position } // you can also provide a render function that injects some useful stuff!
        ) => (
          <div className={cx(styles.content)}>
            <CloseIcon
              className={styles.closeIcon}
              onClick={() => this.handleCloseTooltip(false)}
            />
            {description && <p className={styles.contentText}>{description}</p>}
            {img && (
              <img
                src={image}
                alt='help-img'
                width='370'
                height='160'
                className={cx(styles.contentImg, styles.gifImg)}
              />
            )}
            <div className={styles.arrow} data-placement={position} />
          </div>
        )}
      >
        {children}
      </Popover>
    );
  }
}
export class GlobalErrorTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
    this.handleCloseTooltip(this.props.visible);
  }

  handleCloseTooltip = (visible) => {
    this.setState({ visible });
  };

  componentDidUpdate(preProps) {
    if (preProps.visible !== this.props.visible) {
      this.handleCloseTooltip(this.props.visible);
    }
  }

  render() {
    const { visible } = this.state;
    const { position, description, img, children, className, arrowPlace } =
      this.props;
    return (
      <Popover
        isOpen={visible}
        position={position || ['left', 'right', 'bottom', 'top']} // if you'd like, supply an array of preferred positions ordered by priority
        padding={10} // adjust padding here!
        disableReposition // prevents automatic readjustment of content position that keeps your popover content within your window's bounds
        //onClickOutside handle click events outside of the popover/target here!
        containerClassName={cx(
          styles.container,
          styles.globalContainer,
          className
        )}
        content={(
          { position } // you can also provide a render function that injects some useful stuff!
        ) => (
          <div className={styles.content}>
            {description && (
              <p className={styles.contentText}>
                {description.split('\n').map((text) => {
                  return <p key={text}>{text}</p>;
                })}
              </p>
            )}
            {img && (
              <img src={img} alt='help-img' className={styles.contentImg} />
            )}
            <div
              className={cx(styles.arrow, {
                [styles.arrowPlace]: arrowPlace,
              })}
              data-placement={position}
            />
          </div>
        )}
      >
        {children}
      </Popover>
    );
  }
}

export class StaticTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
    this.handleCloseTooltip(this.props.visible);
  }

  handleCloseTooltip = (visible) => {
    this.setState({ visible });
  };

  componentDidUpdate(preProps) {
    if (preProps.visible !== this.props.visible) {
      this.handleCloseTooltip(this.props.visible);
    }
  }

  render() {
    const { description, visible, hideArrow } = this.props;
    if (!visible) {
      return '';
    }
    return (
      <div
        className={cx(styles.staticContainerWrapper, {
          [styles['staticContainerWrapper--no-arrow']]: hideArrow,
        })}
      >
        <div className={styles.staticContainer}>
          <div className={styles.content}>
            {description && <p className={styles.contentText}>{description}</p>}
            {!hideArrow && <div className={styles.staticArrow} />}
          </div>
        </div>
      </div>
    );
  }
}

export class GlobalHeaderTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
    this.handleCloseTooltip(this.props.visible);
  }

  handleCloseTooltip = (visible) => {
    this.setState({ visible });
  };

  componentDidUpdate(preProps) {
    if (preProps.visible !== this.props.visible) {
      this.handleCloseTooltip(this.props.visible);
    }
  }

  render() {
    const { visible } = this.state;
    const { position, description } = this.props;
    if (!visible) {
      return '';
    }
    return (
      <div className={styles.headerContainerWrapper}>
        <div className={styles.headerContainer}>
          <div className={styles.content}>
            <CloseIcon
              className={styles.closeIcon}
              onClick={() => this.handleCloseTooltip(false)}
            />
            {description && <p className={styles.contentText}>{description}</p>}
            <div className={styles.arrow} data-placement={position} />
          </div>
        </div>
      </div>
    );
  }
}
