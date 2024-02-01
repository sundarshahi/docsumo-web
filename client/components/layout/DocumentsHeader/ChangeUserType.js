import React from 'react';

import styles from './changeuser.scss';

const ChangeUserType = (props) => {
  const { options, onClick } = props;

  return (
    <div className={styles.radioGroup}>
      {options.map(({ fullName, userId }) => (
        <label className={styles.circleContainer} key={userId}>
          <input type='radio' name='role' onClick={() => onClick(userId)} />
          <span className={styles.circle}></span>
          <p className={styles.roleText}>{fullName}</p>
        </label>
      ))}
    </div>
    // <ul className={styles.typeddbox}>
    //     { options.map(({ fullName, userId, default:admin }) => (
    //         <li className={styles.typedditem} key={userId}>
    //             {admin ? '':
    //                 <button onClick={() => onClick(userId)}>{fullName}</button>
    //             }
    //         </li>
    //     )) }
    // </ul>
  );
};

export default ChangeUserType;
