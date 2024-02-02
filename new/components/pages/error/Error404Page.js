import React from 'react';

import { ArrowLeft } from 'iconoir-react';
import _404image from 'new/assets/images/404.svg';
import {
  PageMetadata,
  PageScrollableContent,
} from 'new/components/layout/page';
import PageError from 'new/components/shared/PageError';
import routes from 'new/constants/routes';

const Error404Page = (props) => {
  const handleBtnClick = (e) => {
    e.preventDefault();
    props.history.push(routes.ROOT);
  };

  return (
    <>
      <PageMetadata title='404 - Page not found' />
      <PageScrollableContent>
        <PageError
          errorCode='404'
          errorTitle='Page Not Found'
          text={
            <>
              The page you were looking for might have shifted or temporarily
              moved.
              <br />
              Please click the button below to go to the Document Types page
            </>
          }
          btnText='Go to Document Types'
          icon={<ArrowLeft />}
          onBtnClick={handleBtnClick}
          ErrorCodeImage={ErrorCodeImage}
        />
      </PageScrollableContent>
    </>
  );
};

const ErrorCodeImage = () => (
  <img src={_404image} alt='404 - Page not found'></img>
);

export default Error404Page;
