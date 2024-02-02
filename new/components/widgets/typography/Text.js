import React from 'react';

import PropTypes from 'prop-types';

const Text = React.forwardRef((props, ref) => {
  const { tag: Tag = 'p', children } = props;

  const attrs = {};
  ['className', 'style'].forEach((key) => {
    if (props[key]) {
      attrs[key] = props[key];
    }
  });

  return (
    <Tag {...attrs} ref={ref}>
      {children}
    </Tag>
  );
});

Text.propTypes = {
  tag: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Text;
