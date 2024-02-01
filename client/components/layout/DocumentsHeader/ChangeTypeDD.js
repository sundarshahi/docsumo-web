import React from 'react';

import styles from './changeuser.scss';

const ChangeTypeDD = (props) => {
  const { options, onClick } = props;
  return (
    <div className={styles.radioGroup}>
      {options.map(({ title, id }) => (
        <label className={styles.circleContainer} key={id}>
          <input type='radio' name='role' onClick={() => onClick(id)} />
          <span className={styles.circle}></span>
          <p className={styles.roleText}>{title}</p>
        </label>
      ))}
    </div>
    // <ul className={styles.typeddbox}>
    //     { options.map(({ title, id }) => (
    //         <li className={styles.typedditem} key={id}>
    //             <button onClick={() => onClick(id)}>{title}</button>
    //         </li>
    //     )) }
    // </ul>
  );
};

export default ChangeTypeDD;
