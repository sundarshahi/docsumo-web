/* eslint-disable no-useless-escape */
import mixpanel from 'mixpanel-browser';
import { INVALID_EMAIL_DOMAINS } from 'new/constants';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import { isPossiblePhoneNumber } from 'react-phone-number-input';

const FILE_NAME_REGEX = /^\w|^\w[\w\-.\s]+$/;
const DOCUMENT_TYPES_REGEX = /^[a-zA-Z0-9 ,-]*$/;
const ALPHABET_AND_SPACE_REGEX = /^[a-zA-Z ]*$/;
const ALPHABET_SPACE_DOT_REGEX = /^[a-zA-Z .]*$/;
const EMAIL_REGEX = /^[\w+_\.]+@([\w-]+\.)+[\w-]{2,12}$/;
const CERTIFICATE_REGEX =
  /(-----BEGIN CERTIFICATE-----)[^ ]+(-----END CERTIFICATE-----)/gm;

export function validateName(name) {
  if (!name.trim()) {
    return {
      isValid: false,
      message: 'Please enter your full name',
    };
  } else if (!name.trim().match(ALPHABET_AND_SPACE_REGEX)) {
    return {
      isValid: false,
      message: 'Please enter only alphabets and space',
    };
  } else {
    return {
      isValid: true,
      message: '',
    };
  }
}

export function validateEmail(email) {
  if (!email.trim()) {
    return {
      isValid: false,
      message: 'Please enter your email address',
    };
  } else if (!email.trim().match(EMAIL_REGEX)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address',
    };
  } else {
    const emailString = email
      .toLowerCase()
      .substring(email.toLowerCase().indexOf('@') + 1);
    const length = emailString.indexOf('.');
    const domain = emailString.substring(0, length);

    if (!INVALID_EMAIL_DOMAINS.every((emailDomain) => emailDomain !== domain)) {
      //Call mixpanel event for public email error
      mixpanel.track(MIXPANEL_EVENTS.signup_step1_failed_public_email, {
        email,
      });
      return {
        isValid: false,
        message: 'Please enter a company email address',
      };
    } else {
      return {
        isValid: true,
        message: '',
      };
    }
  }
}

export function validateCompanyName(company) {
  if (!company.trim()) {
    return {
      isValid: false,
      message: 'Please enter your company name',
    };
  } else if (!company.trim().match(ALPHABET_SPACE_DOT_REGEX)) {
    return {
      isValid: false,
      message: 'Please enter only alphabets, space, or .',
    };
  } else {
    return {
      isValid: true,
      message: '',
    };
  }
}

export function validateDocumentTypes(documentType) {
  if (!documentType.trim()) {
    return {
      isValid: false,
      message: 'Please enter document types',
    };
  } else if (!documentType.trim().match(DOCUMENT_TYPES_REGEX)) {
    return {
      isValid: false,
      message: 'Please enter only Letters, Numbers, Hyphens(-) or Commas(,).',
    };
  } else {
    return {
      isValid: true,
      message: '',
    };
  }
}

export function validatePhoneNumber(phone) {
  const phoneNumber = phone || '';
  if (!phoneNumber || !phoneNumber.trim()) {
    return {
      isValid: false,
      message: 'Please enter your phone number',
    };
  } else if (!isPossiblePhoneNumber(phoneNumber.trim())) {
    return {
      isValid: false,
      message: 'Please enter valid phone number',
    };
  } else {
    return {
      isValid: true,
      message: '',
    };
  }
}

export function validateFileName(fileName) {
  const file = fileName.trim();
  if (!file) {
    return {
      isValid: false,
      message: 'File name should not be empty',
    };
  } else if (!file.match(FILE_NAME_REGEX)) {
    return {
      isValid: false,
      message: 'File name should be alphanumeric',
    };
  } else if (file.charAt(file.length - 1) === '.') {
    return {
      isValid: false,
      message: 'File name should not end with .',
    };
  } else if (fileName.trim().length >= 200) {
    return {
      isValid: false,
      message: 'File name should not be longer than 200 characters',
    };
  } else {
    return {
      isValid: true,
      message: '',
    };
  }
}

export function validateURL(url) {
  if (!url || !url.trim()) {
    return {
      isValid: false,
      message: 'Please enter the URL',
    };
  }

  try {
    const newUrl = new URL(url.trim());
    if (
      newUrl &&
      (newUrl.protocol === 'http:' || newUrl.protocol === 'https:')
    ) {
      return {
        isValid: true,
        message: '',
      };
    }
  } catch (err) {
    return {
      isValid: false,
      message: 'Please enter a valid URL',
    };
  }
}

export function validateCertificate(certificate) {
  if (!certificate || !certificate.trim()) {
    return {
      isValid: false,
      message: 'Please enter the certificate',
    };
  } else if (!certificate.trim().match(CERTIFICATE_REGEX)) {
    return {
      isValid: false,
      message: 'The certificate format is not valid.',
    };
  } else {
    return {
      isValid: true,
      message: '',
    };
  }
}
