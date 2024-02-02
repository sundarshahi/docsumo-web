import React, { useEffect, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';

import _ from 'lodash';
import DOCSUMO_LOGO from 'new/assets/images/logos/docsumo-logo.png';
import ROUTES from 'new/constants/routes';

import MFAAuthFlow from './components/MFAAuthFlow';
import MFASetupFlow from './components/MFASetupFlow';

import styles from './MultiFactorAuthentication.scss';

function MultiFactorAuthentication(props) {
  const {
    history: { location },
  } = props;

  const [mfaData, setMFAData] = useState({});
  const [showMFAAuthFlow, setShowMFAAuthFlow] = useState(true);
  const [showMFASetupFlow, setShowMFASetupFlow] = useState(false);

  useEffect(() => {
    const mfaData = location.state;

    if (_.isEmpty(mfaData)) {
      return <Redirect to={ROUTES.ROOT} />;
    }

    setMFAData(mfaData);
    setShowMFAAuthFlow(mfaData.mfaEnable && mfaData.mfaSetup);
    setShowMFASetupFlow(mfaData.mfaEnable && !mfaData.mfaSetup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResetSuccess = (mfaData) => {
    setMFAData(mfaData);
    setShowMFAAuthFlow(mfaData.mfaEnable && mfaData.mfaSetup);
    setShowMFASetupFlow(mfaData.mfaEnable && !mfaData.mfaSetup);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to={'/'}>
            <img
              className={styles.company_logo}
              src={DOCSUMO_LOGO}
              alt='Docsumo'
            />
          </Link>
        </div>
        {showMFAAuthFlow ? (
          <MFAAuthFlow mfaData={mfaData} onResetSuccess={handleResetSuccess} />
        ) : null}
        {showMFASetupFlow ? <MFASetupFlow mfaData={mfaData} /> : null}
      </div>
    </div>
  );
}

export default MultiFactorAuthentication;
