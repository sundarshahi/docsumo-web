/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';

import cx from 'classnames';
import Popover from 'react-tiny-popover';

import styles from './styles.scss';

class CustomPopover extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  attachListner() {
    const { uid, footer } = this.props;
    if (footer && uid) {
      const footerBox = document.getElementById(`${uid}-footer`);
      if (footerBox) {
        footerBox.addEventListener('click', () =>
          this.setState({ isOpen: false })
        );
      }
    }
  }

  componentDidMount() {
    this.attachListner();
  }

  componentDidUpdate({ footer: prevFooter }) {
    const { footer } = this.props;
    if (footer !== prevFooter) {
      this.attachListner();
    }
  }

  toggle = () => {
    const { onToggle } = this.props;
    if (onToggle) onToggle();
    this.setState({ isOpen: !this.state.isOpen });
  };

  render() {
    const {
      className,
      content,
      children,
      position,
      title,
      footer,
      uid,
      containerClassName,
      widepop,
      titleClassName,
      contentClassName,
      openClassName,
      openDatePop,
      align,
      contentLocation,
      ref,
      overRide,
    } = this.props;
    const { isOpen } = this.state;
    return (
      <Popover
        isOpen={isOpen}
        position={position || ['bottom', 'left', 'right', 'top']} // if you'd like, supply an array of preferred positions ordered by priority
        padding={5} // adjust padding here!
        disableReposition={!widepop} // prevents automatic readjustment of content position that keeps your popover content within your window's bounds
        //onClickOutside handle click events outside of the popover/target here!
        containerClassName={cx(styles.container, containerClassName)}
        onClickOutside={() => {
          if (overRide) {
            return;
          }
          this.setState({ isOpen: false });
        }}
        align={align}
        contentLocation={contentLocation}
        ref={ref}
        content={() => (
          <>
            <div className={cx(styles.content, contentClassName)}>
              {title ? (
                <p className={cx(styles.title, titleClassName)}>{title}</p>
              ) : (
                ''
              )}
              {content}
              {footer ? (
                <p className={styles.footer} id={`${uid}-footer`}>
                  {footer}
                </p>
              ) : (
                ''
              )}
            </div>
          </>
        )}
      >
        <div
          className={cx(styles.root, className, {
            [openClassName]: isOpen,
          })}
          onClick={() => {
            if (openDatePop) {
              openDatePop();
              this.toggle();
            } else {
              this.toggle();
            }
          }}
        >
          {children}
        </div>
      </Popover>
    );
  }
}

export default CustomPopover;
