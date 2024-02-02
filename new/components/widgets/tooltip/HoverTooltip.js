import React from 'react';

import cx from 'classnames';

import styles from './hoverTooltip.scss';

export class HoverIconTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
    };
  }

  render() {
    const {
      position,
      label,
      className,
      labelClassName,
      arrowClassName,
      hideLabel,
    } = this.props;
    return (
      <div key={name} className={cx(styles.iconRoot, className)}>
        {this.props.children}

        {!hideLabel ? (
          <div
            className={cx(styles.tooltip, labelClassName)}
            data-placement={position}
          >
            {label}
            <div
              className={cx(styles.arrow, arrowClassName)}
              data-placement={position}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

export class HoverButtonTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
    };
  }

  render() {
    const { position, label, className, labelClassName, arrowClassName } =
      this.props;
    return (
      <div
        key={name}
        title={label}
        className={cx(styles.buttonRoot, className)}
      >
        {this.props.children}

        <div
          className={cx(styles.tooltip, labelClassName)}
          data-placement={position}
        >
          {label}
          <div
            className={cx(styles.arrow, arrowClassName)}
            data-placement={position}
          />
        </div>
      </div>
    );
  }
}
