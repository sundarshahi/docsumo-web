import React from 'react';

import {
  Calculator,
  Calendar,
  CheckCircle,
  FastArrowDownBox,
  Table2Columns,
  TextAlt,
} from 'iconoir-react';
import { ReactComponent as AlphaNumericIcon } from 'new/assets/images/icons/alphanumeric.svg';
import { ReactComponent as BarcodeIcon } from 'new/assets/images/icons/barcode.svg';
import { ReactComponent as CommentsIcon } from 'new/assets/images/icons/comment.svg';
import { ReactComponent as CompanyIcon } from 'new/assets/images/icons/company-name.svg';
import { ReactComponent as EmailIcon } from 'new/assets/images/icons/email-address.svg';
import { ReactComponent as IconDropdown } from 'new/assets/images/icons/icon-dropdown.svg';
import { ReactComponent as IconNumber } from 'new/assets/images/icons/icon-number.svg';
import { ReactComponent as AddressIcon } from 'new/assets/images/icons/location-address.svg';
import { ReactComponent as PersonNameIcon } from 'new/assets/images/icons/person-name.svg';
import { ReactComponent as PhoneIcon } from 'new/assets/images/icons/phone-number.svg';
import { ReactComponent as StringIcon } from 'new/assets/images/icons/string.svg';

export const dataTypeIcons = {
  string: <TextAlt />,
  date: <Calendar />,
  'date(mm-dd)': <Calendar />,
  'date(dd-mm)': <Calendar />,
  number: <IconNumber />,
  line_item: <Table2Columns />,
  alphanumeric_token: <AlphaNumericIcon />,
  calculated_field: <Calculator />,
  drop_down: <IconDropdown />,
  optical_mark_recognition: <CheckCircle />,
  comments: <CommentsIcon />,
  person_name: <PersonNameIcon />,
  address: <AddressIcon />,
  company_name: <CompanyIcon />,
  phone_number: <PhoneIcon />,
  email_address: <EmailIcon />,
  barcode: <BarcodeIcon />,
  default: <StringIcon />,
  drop_down_map: <FastArrowDownBox />,
};
