import React from 'react';

import { Helmet } from 'react-helmet';

const PageMetadata = (props) => {
  const { title = 'Docsumo' } = props;

  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  );
};

export default PageMetadata;
