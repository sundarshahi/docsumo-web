import React from 'react';

import routes from 'client/constants/routes';
import { ReactComponent as AllDocumentsIcon } from 'images/icons/alldoc.svg';
import { ReactComponent as ProcessedIcon } from 'images/icons/nav-processed.svg';
import { ReactComponent as ReviewIcon } from 'images/icons/nav-review.svg';
import { ReactComponent as SkippedIcon } from 'images/icons/nav-skipped.svg';

export const DOCUMENTS_ROUTES = [
  {
    icon: <AllDocumentsIcon />,
    title: 'All Files',
    url: routes.ALL,
    gEvent: 'all documents',
    uid: 'all',
    counts: 'all',
  },
  {
    icon: <ReviewIcon />,
    title: 'Review',
    url: routes.REVIEW,
    gEvent: 'review',
    uid: 'review',
    counts: 'review',
  },
  {
    icon: <SkippedIcon />,
    title: 'Skipped',
    url: routes.SKIPPED,
    gEvent: 'skipped',
    uid: 'skipped',
    counts: 'skipped',
  },
  {
    icon: <ProcessedIcon />,
    title: 'Processed',
    url: routes.PROCESSED,
    gEvent: 'processed',
    uid: 'processed',
    counts: 'processed',
  },
];
