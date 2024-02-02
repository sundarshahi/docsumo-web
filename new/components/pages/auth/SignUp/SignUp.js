import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { bindActionCreators } from 'redux';

import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { PageScrollableContent } from 'new/components/layout/page';
import DotLoader from 'new/components/widgets/dotLoader';
import { ERROR_TYPES } from 'new/constants/errors';
import routes from 'new/constants/routes';
import {
  chameleonIdentifyUser,
  NEW_USER_FLAGS,
} from 'new/thirdParty/chameleon';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import {
  RUDDER_ANALYTICS_EVENTS,
  rudderAnalyticsIdentifyUser,
  rudderAnalyticsTrackEvent,
} from 'new/thirdParty/rudderAnalytics';
import {
  validateCompanyName,
  validateEmail,
  validateName,
  validatePhoneNumber,
} from 'new/utils/validation';

import SignUpStep1 from './components/SignUpStep1';
import SignUpStep1Socials from './components/SignUpStep1Socials';
import SignUpStep2 from './components/SignUpStep2';
import SignUpStep3 from './components/SignUpStep3';

import styles from './SignUp.scss';

const DEFAULT_DOC_TYPES_LIST = [
  {
    label: 'Invoices',
    value: 'Invoices',
    icon: 1,
  },
  {
    label: 'Bank Statements',
    value: 'Bank Statements',
    icon: 2,
  },
  {
    label: 'Balance Sheet',
    value: 'Balance Sheet',
    icon: 3,
  },
  {
    label: 'Profit and Loss Statements',
    value: 'Profit and Loss Statements',
    icon: 4,
  },
  {
    label: 'Accord Forms',
    value: 'Accord Forms',
    icon: 5,
  },
  {
    label: 'USA Tax Return Forms',
    value: 'USA Tax Return Forms',
    icon: 6,
  },
  {
    label: 'Utility Bills',
    value: 'Utility Bills',
    icon: 7,
  },
  {
    label: 'Checks',
    value: 'Checks',
    icon: 8,
  },
  {
    label: 'Rent Rolls',
    value: 'Rent Rolls',
    icon: 9,
  },
  {
    label: 'Indian KYC',
    value: 'Indian KYC',
    icon: 10,
  },
  {
    label: 'Driving License',
    value: 'Driving License',
    icon: 11,
  },
  {
    label: 'Passport',
    value: 'Passport',
    icon: 12,
  },
];

class SignUp extends Component {
  state = {
    fullName: '',
    email: '',
    password: '',
    company: '',
    jobRole: '',
    region: 'us',
    documentType: [],
    otherDocs: '',
    noOfFile: '',
    phone: '',
    uiError: '',
    errors: null,
    step: 1,
    isRequesting: false,
    passwordErrors: {},
    source: '',
    landingPath: '',
    signonError: {},
    loading: false,
    SSOToken: {},
    documentTypesList: DEFAULT_DOC_TYPES_LIST,
  };

  passwordInputRef = React.createRef();

  UNSAFE_componentWillMount() {
    const { step } = this.getStorageData();
    if (step === 1) localStorage.removeItem('signUpData');
  }

  getUtmSource = () => {
    const {
      location: { search },
    } = this.props;

    let source = '$direct';

    if (search) {
      const urlParams = new URLSearchParams(search);

      if (urlParams.get('utm_source')) {
        source = urlParams.get('utm_source');
      }
    }

    return source;
  };
  getUtmChannel = () => {
    const {
      location: { search },
    } = this.props;

    let channel = '';

    if (search) {
      const urlParams = new URLSearchParams(search);

      if (urlParams.get('utm_channel')) {
        channel = urlParams.get('utm_channel');
      }
    }

    return channel;
  };
  getUtmCampaign = () => {
    const {
      location: { search },
    } = this.props;

    let campaign = '';

    if (search) {
      const urlParams = new URLSearchParams(search);

      if (urlParams.get('utm_campaign')) {
        campaign = urlParams.get('utm_campaign');
      }
    }

    return campaign;
  };
  getUtmTerm = () => {
    const {
      location: { search },
    } = this.props;

    let term = '';

    if (search) {
      const urlParams = new URLSearchParams(search);

      if (urlParams.get('utm_term')) {
        term = urlParams.get('utm_term');
      }
    }

    return term;
  };

  getLandingPath = () => {
    const {
      location: { search },
    } = this.props;

    let refPath = null;

    if (search) {
      const urlParams = new URLSearchParams(search);

      if (urlParams.get('ref')) {
        refPath = urlParams.get('ref');
      }
    }

    return (
      refPath ||
      document.referrer ||
      mixpanel.get_property('$initial_referrer') ||
      '$direct'
    );
  };

  getGoogleAccoundId = () => {
    let googleAccountId = '';
    const {
      location: { search },
    } = this.props;

    if (search) {
      const urlParams = new URLSearchParams(search);
      const id = urlParams.get('google_account_id');
      if (id) {
        googleAccountId = id;
      }
    }
    return googleAccountId;
  };

  getParamsFromUrl = (key) => {
    const {
      location: { search },
    } = this.props;

    if (search) {
      const urlParams = new URLSearchParams(search);
      const param = urlParams.get(key) || '';
      return param;
    }
  };

  fetchDocumenTypesList = async () => {
    const { documentTypesList } = this.state;
    let apiData = documentTypesList;
    try {
      const response = await api.getDocumentTypesList();
      apiData = _.get(response.responsePayload, 'data');

      let list = apiData.map((item, index) => {
        return {
          label: item.title,
          value: item.value,
          icon: index + 1,
        };
      });

      this.setState({ documentTypesList: list });
    } catch (e) {
      // Do nothing
    }
  };

  componentDidMount() {
    this.setState({ ...this.getStorageData() });

    const source = this.getUtmSource();

    if (source) {
      mixpanel.track(MIXPANEL_EVENTS.signup_start, { source: source });
    }

    this.fetchDocumenTypesList();
  }

  handleInputChange = (e) => {
    let { errors } = this.state;
    let { name, value } = e.target;
    this.setState({
      [name]: value,
      uiError: '',
    });

    if (errors && errors[name]) {
      this.setState({
        errors: { ...errors, [name]: '' },
      });
    }
  };

  handlePhoneInputChange = (value) => {
    let { errors } = this.state;
    this.setState({
      phone: value,
      errors: { ...errors, phone: '' },
    });
  };

  handlePasswordInputChange = ({ password, errors: passErrors }) => {
    let { passwordErrors, errors } = this.state;
    passwordErrors =
      !_.isEmpty(passwordErrors) && !passErrors
        ? { ...passwordErrors }
        : { ...passErrors };

    this.setState({ password, passwordErrors });

    if (errors && errors.password) {
      this.setState({
        errors: { ...errors, password: '' },
      });
    }
  };

  handleDocumentTypesSelectionChange = (selectedItem) => {
    const { errors } = this.state;

    const values = selectedItem.map((item) => item.value);

    this.setState({
      documentType: values,
      errors: {
        ...errors,
        documentType: '',
      },
    });
  };

  handleDropdownSelectionChange = (name, { value }) => {
    let { errors } = this.state;

    this.setState({ [name]: value });

    if (errors && errors[name]) {
      this.setState({
        errors: { ...errors, [name]: '' },
      });
    }
  };

  handleCheckboxChange = ({ target }) => {
    const { checked, value } = target;
    let { errors, documentType } = this.state;
    const included = documentType.includes(value);
    if (checked && !included) {
      this.setState({
        documentType: [...documentType, value],
      });
    } else if (!checked && included) {
      const result = documentType.filter((e) => e !== value);
      this.setState({
        documentType: [...result],
      });
    }
    if (errors && errors['documentType']) {
      this.setState({
        errors: { ...errors, ['documentType']: '' },
      });
    }
  };

  updateStep = (process, type) => {
    const { step, fullName, SSOToken } = this.state;

    if (step === 1) {
      this.setState({ SSOToken: {} });
    }

    if (type === 'social') {
      this.setState(
        {
          step: 'socialSignUp1',
          isRequesting: false,
        },
        () => this.setStorageData(type)
      );
      return;
    }

    if (process === 'next') {
      let nextStep;
      if (typeof step === 'string') {
        nextStep = 1;
      } else {
        nextStep = step;
      }
      this.setState({ step: nextStep + 1, isRequesting: false }, () =>
        this.setStorageData(type)
      );
    } else {
      const nextStep = typeof step === 'string' ? 2 : step;

      mixpanel.track(MIXPANEL_EVENTS.signup_step_back, {
        'full name': fullName.trim(),
        step: nextStep,
      });

      this.setState(
        {
          step:
            !(Object.keys(SSOToken).length === 0) && step === 2
              ? 'socialSignUp1'
              : nextStep - 1,
          isRequesting: false,
          signonError: {},
          errors: {},
        },
        () => this.setStorageData(type)
      );
    }
  };

  getStorageData = () => {
    return JSON.parse(localStorage.getItem('signUpData')) || {};
  };

  setStorageData = (type) => {
    const {
      fullName,
      email,
      password,
      company,
      jobRole,
      phone,
      region,
      documentType,
      noOfFile,
      otherDocs,
      step,
    } = this.state;

    let { SSOToken } = this.state;

    if (_.isEmpty(SSOToken) && type === 'social') {
      SSOToken = { ...this.props.SSOToken };
      this.setState({ SSOToken });
    }

    localStorage.setItem(
      'signUpData',
      JSON.stringify({
        fullName,
        email,
        password,
        company,
        jobRole,
        phone,
        region,
        documentType,
        noOfFile,
        otherDocs,
        step,
        SSOToken,
      })
    );
  };

  setErrors = (errors) => {
    if (!_.isEmpty(errors)) {
      this.setState({
        ...this.state,
        errors,
        uiError: '',
        isRequesting: false,
      });
    }
  };

  clearFirstStepFieldValues = () => {
    this.setState({ fullName: '', email: '', password: '' });
  };

  updateToNextStepFromSocialSignon = async (email) => {
    const { SSOToken: { idToken = '' } = {} } = this.props;
    this.setState({ loading: true });
    const params = {
      email,
      idToken,
      type: 'social',
    };
    let { emailError } = await this.validateSignupEmail(params);
    if (!_.isEmpty(emailError)) {
      emailError = { ...emailError, message: emailError.email };
      await this.setState({ signonError: emailError, errors: {} });
    } else {
      mixpanel.track(MIXPANEL_EVENTS.signup_step_1, {
        'work email': email.trim(),
      });
      this.updateStep('next', 'social');
    }
  };

  validateSignupEmail = async ({ email, type, ...params }) => {
    const utmParams = {
      utm_source: this.getUtmSource(),
      utm_campaign: this.getUtmCampaign(),
      utm_channel: this.getUtmChannel(),
      utm_term: this.getUtmTerm(),
      utm_medium: this.getParamsFromUrl('utm_medium'),
      firstPageSeen: this.getParamsFromUrl('firstPageSeen'),
      lastPageSeen: this.getParamsFromUrl('lastPageSeen'),
      originalSource: this.getParamsFromUrl('originalSource'),
      utm_content: this.getParamsFromUrl('utm_content'),
    };

    const emailError = {};
    try {
      await api.validateSignupUser({ email, type, ...params, ...utmParams });
    } catch (e) {
      const errorCode =
        _.get(e.responsePayload, 'error') || ERROR_TYPES.VALIDATION_ERROR;
      let errorMessage =
        _.get(e.responsePayload, 'message') ||
        'An error occurred while validating email.';

      if (errorCode === ERROR_TYPES.INVALID_EMAIL) {
        errorMessage =
          'Invalid email. Please enter your company email address.';
      }
      emailError.email = errorMessage;
      mixpanel.track(MIXPANEL_EVENTS.signup_step1_failed, {
        email,
        errorMessage,
        type,
      });
    } finally {
      this.setState({ loading: false });
    }

    return { emailError };
  };
  validateFirstStepSocials = async () => {
    const { phone } = this.state;

    let errors = {};
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.message;
    }

    if (!_.isEmpty(errors)) {
      this.setErrors(errors);
      return false;
    } else {
      return true;
    }
  };

  validateCompanyEmail = async () => {
    const { email } = this.state;
    let errors = {};
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message;
    }
    if (!_.isEmpty(errors)) {
      this.setErrors(errors);
      return false;
    } else {
      return true;
    }
  };

  validateFirstStep = async () => {
    const { fullName, email, phone, passwordErrors } = this.state;
    let errors = {};

    const nameValidation = validateName(fullName);
    if (!nameValidation.isValid) {
      errors.fullName = nameValidation.message;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message;
    }

    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.message;
    }

    const passwordError =
      this.passwordInputRef && this.passwordInputRef.current.validate();

    if (_.isEmpty(errors) && !passwordError && _.isEmpty(passwordErrors)) {
      this.setState({ isRequesting: true });
      const params = {
        email,
        type: 'email',
      };
      const { emailError } = await this.validateSignupEmail(params);
      if (!_.isEmpty(emailError)) {
        errors = { ...emailError };
      }
    }

    if (!_.isEmpty(errors) || !_.isEmpty(passwordErrors) || passwordError) {
      this.setErrors(errors);

      return false;
    } else {
      return true;
    }
  };

  validateSecondStep = async () => {
    const { company, jobRole, region, email, SSOToken } = this.state;
    const errors = {};

    const companyValidation = validateCompanyName(company);
    try {
      const payload = {
        email: !_.isEmpty(SSOToken) ? SSOToken?.email : email,
      };
      await api.verifyHubspotSignup(payload);
      // eslint-disable-next-line no-empty
    } catch (e) {
      // Dont need to catch error!
    }

    if (!companyValidation.isValid) {
      errors.company = companyValidation.message;
    }

    if (!jobRole) {
      errors.jobRole = 'Please enter your job role';
    }

    if (!region) {
      errors.region = 'Please enter your region';
    }

    if (!_.isEmpty(errors)) {
      this.setErrors(errors);

      return false;
    } else {
      return true;
    }
  };

  validateThirdStep = () => {
    const { documentType, noOfFile, otherDocs } = this.state;
    const errors = {};

    //const documentTypesValidation = validateDocumentTypes(documentType);
    if (!documentType.length) {
      errors.documentType = 'Please select a document Type';
    }

    if (
      documentType.length &&
      documentType.includes('other') &&
      _.isEmpty(otherDocs.trim())
    ) {
      errors.otherDocs =
        'Please add the other document types, separated by comma.';
    }

    if (!noOfFile) {
      errors.noOfFile = 'Please select the range of number of documents';
    }

    if (!_.isEmpty(errors)) {
      this.setErrors(errors);
    }

    return !!_.isEmpty(errors);
  };

  signUpUser = async () => {
    const {
      fullName,
      email,
      password,
      company,
      jobRole,
      phone,
      region,
      documentType,
      otherDocs,
      noOfFile,
      SSOToken,
    } = this.state;
    const { history } = this.props;

    const landingPath = this.getLandingPath();
    const source = this.getUtmSource();
    const campaign = this.getUtmCampaign();
    const channel = this.getUtmChannel();
    const term = this.getUtmTerm();
    const google_account_id = this.getGoogleAccoundId();
    const medium = this.getParamsFromUrl('utm_medium');
    const firstPageSeen = this.getParamsFromUrl('firstPageSeen');
    const lastPageSeen = this.getParamsFromUrl('lastPageSeen');
    const originalSource = this.getParamsFromUrl('originalSource');
    const content = this.getParamsFromUrl('utm_content');

    this.setState({ isRequesting: true });

    const errors = {};

    const mixpanelProperties = {
      'full name': fullName,
      'work email': email,
      'company name': company,
      'job role': jobRole,
      phone: phone,
      region: region,
      'document types': documentType.join(', '),
      'no. of files': noOfFile,
      type: 'email',
    };

    let payload = {
      type: 'email',
      fullName: fullName.trim(),
      email: email.trim(),
      password: password,
      company: company.trim(),
      jobRole: jobRole,
      phoneNumber: phone,
      region,
      documentType,
      otherDocs,
      noOfFile,
      referrer: landingPath || '',
      utm_source: source || '',
      utm_channel: channel || '',
      utm_campaign: campaign || '',
      utm_term: term || '',
      utm_medium: medium || '',
      originalSource: originalSource || '',
      lastPageSeen: lastPageSeen || '',
      firstPageSeen: firstPageSeen || '',
      utm_content: content || '',
    };

    if (!_.isEmpty(SSOToken)) {
      payload = {
        ...payload,
        ...SSOToken,
        type: 'social',
      };
      mixpanelProperties['work email'] = payload.email;
      mixpanelProperties['full name'] = payload.fullName;
      mixpanelProperties.providerId = payload.providerId;
      mixpanelProperties.type = 'social';
    }

    if (google_account_id) {
      payload = {
        ...payload,
        google_account_id,
      };
    }

    try {
      const response = await api.signupUser(payload);
      const { token, user } = _.get(response.responsePayload, 'data');

      // API Client already updates the token, but still making an
      // additional action dispatch here to make sure it's not missed
      await this.props.appActions.setAuthToken({ token });
      localStorage.removeItem('signUpData');

      // Add mixpanel events
      mixpanel.alias(user.userId);
      mixpanel.track(MIXPANEL_EVENTS.signup_complete, mixpanelProperties);

      try {
        const [userResponse, configResponse] = await Promise.all([
          api.getUser(),
          api.getConfig(),
        ]);
        const config = _.get(configResponse.responsePayload, 'data');
        const user = _.get(userResponse.responsePayload, 'data.user');

        const currentDate = new Date();
        await chameleonIdentifyUser(
          user,
          config,
          {
            signed_up_at: currentDate.toISOString(),
            is_new_user: true,
            ...NEW_USER_FLAGS,
          },
          true
        );

        // Set the config in app state
        await this.props.appActions.setConfig({ config });

        // Set the user in app state
        await this.props.appActions.setUser({ user: user });

        // Set onboarding tutorial origin
        if (config && config.flags && config.flags.showTooltipFlow) {
          await this.props.appActions.setTooltipOrigin('Signup');
        }

        // Add rudderstack events
        const rudderstackData = {
          email: user.email,
          full_name: user.fullName,
          company_name: user.companyName,
          job_title: user.jobRole,
          contact_number: user.phoneNumber,
        };
        rudderAnalyticsIdentifyUser(rudderstackData);
        rudderAnalyticsTrackEvent(
          RUDDER_ANALYTICS_EVENTS.userRegistered,
          rudderstackData
        );

        // Redirection
        history.push(routes.ROOT);
      } catch (e) {
        // Config request has failed.
        // Reload the page and bootstrap the app again
        window.location = '/';
      }
    } catch (e) {
      const errorMessage =
        _.get(e.responsePayload, 'message') || 'Failed to sign up';

      this.setState({
        isRequesting: false,
        uiError: errorMessage,
        errors,
      });

      mixpanel.track(MIXPANEL_EVENTS.signup_failed, {
        ...mixpanelProperties,
        error: errorMessage,
      });
    }
  };

  handleNext = async (e) => {
    e.preventDefault();
    const {
      step,
      fullName,
      email,
      company,
      jobRole,
      phone,
      region,
      documentType,
      noOfFile,
    } = this.state;

    let isValid = false;

    await this.setState({ signonError: {} });

    /* eslint-disable indent */
    switch (step) {
      case 'socialSignUp1':
        isValid = await this.validateFirstStepSocials();
        break;
      case 1:
        isValid = await this.validateFirstStep();
        break;
      case 2:
        isValid = this.validateSecondStep();
        break;
      case 3:
        isValid = this.validateThirdStep();
        break;
      default:
        break;
    }
    /* eslint-enable indent */

    if (!isValid) return;

    const mixpanelEventName = `signup_step_${step}`;

    mixpanel.track(MIXPANEL_EVENTS[mixpanelEventName], {
      'full name': fullName.trim(),
      'work email': email.trim(),
      'company name': company.trim(),
      'job role': jobRole,
      phone: phone.trim(),
      region: region,
      'document types': documentType,
      'no. of files': noOfFile,
    });

    this.updateStep('next', 'email');
  };

  handleBack = () => {
    this.updateStep('back', 'email');
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const { step } = this.state;

    if (step === 3) {
      const isValid = this.validateThirdStep();

      if (isValid) {
        this.signUpUser();
      }

      return;
    }
  };

  renderStepContent = () => {
    const { appActions } = this.props;
    const {
      fullName,
      email,
      password,
      company,
      phone,
      jobRole,
      region,
      documentTypesList,
      documentType,
      otherDocs,
      noOfFile,
      step,
      errors,
      isRequesting,
      uiError,
      signonError,
    } = this.state;

    /* eslint-disable indent */
    switch (step) {
      case 'socialSignUp1': {
        return (
          <SignUpStep1Socials
            fullName={fullName}
            email={email}
            password={password}
            phone={phone}
            passwordInputRef={this.passwordInputRef}
            signonError={signonError}
            errors={errors}
            isRequesting={isRequesting}
            appActions={appActions}
            updateToNextStepFromSocialSignon={
              this.updateToNextStepFromSocialSignon
            }
            clearFirstStepFieldValues={this.clearFirstStepFieldValues}
            onInputChange={this.handleInputChange}
            onPhoneInputChange={this.handlePhoneInputChange}
            onPasswordInputChange={this.handlePasswordInputChange}
            onNext={this.handleNext}
            onBack={this.handleBack}
          />
        );
      }

      case 1: {
        return (
          <SignUpStep1
            fullName={fullName}
            email={email}
            password={password}
            phone={phone}
            passwordInputRef={this.passwordInputRef}
            signonError={signonError}
            errors={errors}
            isRequesting={isRequesting}
            appActions={appActions}
            updateToNextStepFromSocialSignon={
              this.updateToNextStepFromSocialSignon
            }
            clearFirstStepFieldValues={this.clearFirstStepFieldValues}
            onInputChange={this.handleInputChange}
            onPhoneInputChange={this.handlePhoneInputChange}
            onPasswordInputChange={this.handlePasswordInputChange}
            onNext={this.handleNext}
            validateCompanyEmail={this.validateCompanyEmail}
          />
        );
      }
      case 2: {
        return (
          <SignUpStep2
            company={company}
            jobRole={jobRole}
            region={region}
            errors={errors}
            onInputChange={this.handleInputChange}
            onDropdownSelectionChange={this.handleDropdownSelectionChange}
            onNext={this.handleNext}
            onBack={this.handleBack}
          />
        );
      }
      case 3: {
        return (
          <SignUpStep3
            documentType={documentType}
            otherDocs={otherDocs}
            noOfFile={noOfFile}
            errors={errors}
            documentTypesList={documentTypesList}
            handleCheckboxChange={this.handleCheckboxChange}
            onSubmit={this.handleSubmit}
            uiError={uiError}
            onBack={this.handleBack}
            isAttemptingSignup={isRequesting}
            onInputChange={this.handleInputChange}
            onDocumentTypeSelectionChange={
              this.handleDocumentTypesSelectionChange
            }
            onDropdownSelectionChange={this.handleDropdownSelectionChange}
          />
        );
      }
      default:
        return null;
    }
    /* eslint-enable indent */
  };

  render() {
    const { loading } = this.state;

    return (
      <PageScrollableContent className={styles.wrapper}>
        <div className={styles.container}>
          {loading && <DotLoader containerClassName={styles.loaderContainer} />}
          {this.renderStepContent()}
        </div>
      </PageScrollableContent>
    );
  }
}

function mapStateToProp({ app }) {
  return {
    user: app.user,
    SSOToken: app.SSOToken,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(SignUp);
