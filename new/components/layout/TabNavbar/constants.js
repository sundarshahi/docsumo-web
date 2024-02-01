import React from 'react';

import { DoubleCheck, EyeEmpty, Page, SkipNext } from 'iconoir-react';
import routes from 'new/constants/routes';

export const DOCUMENTS_ROUTES = [
  {
    icon: <Page />,
    title: 'All Files',
    url: routes.ALL,
    gEvent: 'all documents',
    uid: 'all',
    counts: 'all',
  },
  {
    icon: <EyeEmpty />,
    title: 'Review',
    url: routes.REVIEW,
    gEvent: 'review',
    uid: 'review',
    counts: 'review',
  },
  {
    icon: <SkipNext />,
    title: 'Skipped',
    url: routes.SKIPPED,
    gEvent: 'skipped',
    uid: 'skipped',
    counts: 'skipped',
  },
  {
    icon: <DoubleCheck />,
    title: 'Processed',
    url: routes.PROCESSED,
    gEvent: 'processed',
    uid: 'processed',
    counts: 'processed',
  },
];
