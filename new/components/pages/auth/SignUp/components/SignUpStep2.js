import React from 'react';
import { Link } from 'react-router-dom';

import cx from 'classnames';
import { NavArrowLeft } from 'iconoir-react';
import { ReactComponent as RoleIcon } from 'new/assets/images/icons/briefcase.svg';
import { ReactComponent as RightIcon } from 'new/assets/images/icons/chevron-right-rounded.svg';
import DOCSUMO_LOGO from 'new/assets/images/logos/docsumo-logo.png';
import TRAIN_MODELS_ICON from 'new/assets/images/signup-step-2-v2.svg';
import ROUTES from 'new/constants/routes';
import { useAutofocus } from 'new/hooks/useAutofocus';
import Badge from 'new/ui-elements/Badge';
import Button from 'new/ui-elements/Button/Button';
import { Dropdown } from 'new/ui-elements/Dropdown/Dropdown';
import Input from 'new/ui-elements/Input/Input';

import styles from '../SignUp.scss';

const JOB_ROLES = [
  { icon: <RoleIcon />, label: 'Developer', value: 'Developer' },
  { icon: <RoleIcon />, label: 'Manager', value: 'Manager' },
  { icon: <RoleIcon />, label: 'Director', value: 'Director' },
  { icon: <RoleIcon />, label: 'Executive', value: 'Executive' },
  { icon: <RoleIcon />, label: 'Other', value: 'Other' },
];

const REGION = [
  { id: 1, label: 'USA', value: 'us' },
  { id: 2, label: 'Europe', value: 'eu' },
  { id: 3, label: 'Asia Pacific', value: 'india' },
];

function SignUpStep2(props) {
  const {
    company,
    jobRole,
    region,
    onInputChange,
    onDropdownSelectionChange,
    onNext,
    onBack,
    errors,
  } = props;

  const companyNameRef = useAutofocus();

  return (
    <>
      <div className={styles.sidebar}>
        <div className={styles.sidebar_logoContainer}>
          <Link to={ROUTES.ROOT}>
            <img
              className={styles.company_logo}
              src={DOCSUMO_LOGO}
              alt='Docsumo'
            />
          </Link>
        </div>
        <div className={styles.sidebar_content}>
          <div className={styles.imageContainer}>
            <img
              src={TRAIN_MODELS_ICON}
              alt='Choose a pretrained model or train your dataset'
              className={styles.img_sm}
            />
          </div>
          <p className={cx(styles.sidebar_text, styles.sidebar_text__primary)}>
            Effortlessly extract data from
            <br />
            any document type
          </p>
          <p className={styles.sidebar_subtext}>
            Choose from 50+ ready-to-use document types or create
            <br />
            your very own custom document type for data extraction.
          </p>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.secondaryBtnContainer}>
          <button
            type='button'
            onClick={onBack}
            className={styles.secondaryBtn}
          >
            <NavArrowLeft />
            <span>Back</span>
          </button>
        </div>
        <div className={styles.content_body}>
          <Badge className={styles.content_stepper} title={'Step 2/3'} />
          <h1 className={styles.content_subheading}>
            Help us with some additional info to provide you a{' '}
            <span>customized experience</span>
          </h1>
          <div className={styles.form}>
            <form onSubmit={onNext} id='signup-form-step-2'>
              <div className={styles.form_field}>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className={styles.label}>Company Name</label>
                <Input
                  name='company'
                  placeholder='Enter company name'
                  value={company}
                  id='users-input-company'
                  onChange={onInputChange}
                  hasError={errors && errors.company}
                  className={styles.input}
                  errorText={errors && errors.company}
                  ref={companyNameRef}
                />
              </div>

              <div className={styles.form_field}>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className={styles.label}>Job Role</label>
                <Dropdown
                  data={JOB_ROLES}
                  className={styles.input}
                  optionLabelKey='label'
                  optionValueKey='value'
                  error={errors && errors.jobRole}
                  value={jobRole}
                  onChange={(value) =>
                    onDropdownSelectionChange('jobRole', value)
                  }
                  formatOptionLabel={(item) => (
                    <div className='d-flex align-items-center w-100'>
                      <span className={styles.icon}>
                        <RoleIcon />
                      </span>
                      <span className=' ml-4'>{item.label}</span>
                    </div>
                  )}
                />
              </div>
              <div className={styles.form_field}>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className={styles.label}>Account Region</label>
                <Dropdown
                  data={REGION}
                  className={styles.input}
                  optionLabelKey='label'
                  optionValueKey='value'
                  error={errors && errors.region}
                  onChange={(value) =>
                    onDropdownSelectionChange('region', value)
                  }
                  value={region}
                />
                <div className={styles.dropdownHelpText}>
                  Please note that once you sign up, you will not be able to
                  change the region.
                </div>
              </div>
              <div className={styles.content_btnContainer}>
                <Button
                  variant={'contained'}
                  className={styles.button}
                  type='submit'
                >
                  <span className={styles.buttonText}>Next</span>
                  <RightIcon />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUpStep2;
