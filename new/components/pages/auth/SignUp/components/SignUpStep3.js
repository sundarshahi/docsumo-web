import React from 'react';
import { Link } from 'react-router-dom';

import { NavArrowLeft } from 'iconoir-react';
import DOCSUMO_LOGO from 'new/assets/images/logos/docsumo-logo.png';
import AUTO_WORKFLOW_ICON from 'new/assets/images/signup-step-3.svg';
import ROUTES from 'new/constants/routes';
import Badge from 'new/ui-elements/Badge';
import Button from 'new/ui-elements/Button/Button';
import { Dropdown } from 'new/ui-elements/Dropdown/Dropdown';
import Input from 'new/ui-elements/Input/Input';

import styles from '../SignUp.scss';

const NUM_OF_DOCS = [
  { id: 1, label: 'Less than 1000', value: '1000' },
  { id: 2, label: '1000 to 5000', value: '5000' },
  { id: 3, label: '5000 to 10000', value: '10000' },
  { id: 4, label: 'More than 10000', value: '11000' },
];

function SignUpStep3(props) {
  const {
    documentTypesList,
    documentType,
    otherDocs,
    noOfFile,
    isAttemptingSignup,
    errors,
    onBack,
    onSubmit,
    onDocumentTypeSelectionChange,
    onInputChange,
    onDropdownSelectionChange,
  } = props;
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
              src={AUTO_WORKFLOW_ICON}
              alt='Automate workflow end-to-end'
              className={styles.img_lg}
            />
          </div>
          <p className={styles.sidebar_text}>
            Automate workflow
            <br />
            end-to-end
          </p>
          <p className={styles.sidebar_subtext}>
            Implement human-in-the-loop verification with our smart
            <br />
            review screen without changing your existing workflow.
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
          <Badge className={styles.content_stepper} title={'Step 3/3'} />
          <h1 className={styles.content_subheading}>
            What <span>type of documents</span> will you be extracting?
          </h1>
          <div className={styles.form}>
            <form onSubmit={onSubmit} id='signup-form-complete'>
              <div className={styles.form_field}>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className={styles.label}>Document type</label>
                <Dropdown
                  className={styles.input}
                  data={documentTypesList}
                  placeholder='Select document type'
                  optionLabelKey='label'
                  optionValueKey='value'
                  error={errors && errors.documentType}
                  onChange={onDocumentTypeSelectionChange}
                  values={documentType}
                  searchEnabled={true}
                  multiSelect={true}
                  otherOption={{ icon: 13, label: 'Other', value: 'Other' }}
                />
              </div>
              {documentType.includes('Other') && (
                <div className={styles.form_field}>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label className={styles.label}>Please specify</label>
                  <Input
                    name='otherDocs'
                    placeholder='Enter your document type'
                    value={otherDocs}
                    id='users-input-other-docs'
                    onChange={onInputChange}
                    hasError={errors && errors.otherDocs ? true : false}
                    className={styles.input}
                    errorText={errors && errors.otherDocs}
                  />
                </div>
              )}
              <div className={styles.form_field}>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className={styles.label}>
                  Number of documents per month
                </label>
                <Dropdown
                  data={NUM_OF_DOCS}
                  className={styles.input}
                  placeholder='Select the number of documents'
                  optionLabelKey='label'
                  optionValueKey='value'
                  error={errors && errors.noOfFile}
                  value={noOfFile}
                  onChange={(value) =>
                    onDropdownSelectionChange('noOfFile', value)
                  }
                />
              </div>
              <div className={styles.content_btnContainer}>
                <Button
                  className={styles.button}
                  variant={'contained'}
                  isLoading={isAttemptingSignup}
                  type='submit'
                >
                  <span className={styles.buttonText}>Get Started</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUpStep3;
