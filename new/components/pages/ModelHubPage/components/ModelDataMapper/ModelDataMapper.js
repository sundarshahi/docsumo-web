import React from 'react';

import { ReactComponent as Nine40 } from 'new/assets/images/AIModelIcon/940.svg';
import { ReactComponent as Form1040A } from 'new/assets/images/AIModelIcon/1040 a.svg';
import { ReactComponent as Form1040B } from 'new/assets/images/AIModelIcon/1040 b.svg';
import { ReactComponent as Form1040C } from 'new/assets/images/AIModelIcon/1040 c.svg';
import { ReactComponent as Form1040D } from 'new/assets/images/AIModelIcon/1040 d.svg';
import { ReactComponent as Form1040E } from 'new/assets/images/AIModelIcon/1040 e.svg';
import { ReactComponent as Form1040I } from 'new/assets/images/AIModelIcon/1040 i.svg';
import { ReactComponent as Form1040II } from 'new/assets/images/AIModelIcon/1040 ii.svg';
import { ReactComponent as Form1040III } from 'new/assets/images/AIModelIcon/1040 iii.svg';
import { ReactComponent as Form1040 } from 'new/assets/images/AIModelIcon/1040.svg';
import { ReactComponent as One120s } from 'new/assets/images/AIModelIcon/1120 s.svg';
import { ReactComponent as Form8995A } from 'new/assets/images/AIModelIcon/8995-A.svg';
import { ReactComponent as AadhaarBack } from 'new/assets/images/AIModelIcon/Aadhaar Back.svg';
import { ReactComponent as Acord25 } from 'new/assets/images/AIModelIcon/Acord 25.svg';
import { ReactComponent as Acord27 } from 'new/assets/images/AIModelIcon/Acord 27.svg';
import { ReactComponent as Acord28 } from 'new/assets/images/AIModelIcon/Acord 28.svg';
import { ReactComponent as Acord29 } from 'new/assets/images/AIModelIcon/Acord 29.svg';
import { ReactComponent as Acord125 } from 'new/assets/images/AIModelIcon/Acord 125.svg';
import { ReactComponent as BalanceSheet } from 'new/assets/images/AIModelIcon/Balance sheet.svg';
import { ReactComponent as BillOfLading } from 'new/assets/images/AIModelIcon/Bill of lading.svg';
import { ReactComponent as DebtSettlement } from 'new/assets/images/AIModelIcon/Debt Settlement.svg';
import { ReactComponent as DL } from 'new/assets/images/AIModelIcon/Driving License.svg';
import { ReactComponent as FloodCertification } from 'new/assets/images/AIModelIcon/Flood certification.svg';
import { ReactComponent as Invoice } from 'new/assets/images/AIModelIcon/Invoice.svg';
import { ReactComponent as PAN } from 'new/assets/images/AIModelIcon/Pan Card.svg';
import { ReactComponent as PassportBack } from 'new/assets/images/AIModelIcon/Passport Back.svg';
import { ReactComponent as PassportFront } from 'new/assets/images/AIModelIcon/Passport Front.svg';
import { ReactComponent as PNL } from 'new/assets/images/AIModelIcon/Profit and loss.svg';
import { ReactComponent as RC } from 'new/assets/images/AIModelIcon/RC.svg';
import { ReactComponent as RRMHRV } from 'new/assets/images/AIModelIcon/Rent Roll MHRV.svg';
import { ReactComponent as RRMultifamily } from 'new/assets/images/AIModelIcon/Rent Roll Multifamily.svg';
import { ReactComponent as RRRental } from 'new/assets/images/AIModelIcon/Rent Roll Rental.svg';
import { ReactComponent as Test } from 'new/assets/images/AIModelIcon/test.svg';
import { ReactComponent as USBankStatement } from 'new/assets/images/AIModelIcon/US bank statement.svg';
import { ReactComponent as VoterID } from 'new/assets/images/AIModelIcon/Voter ID.svg';
import { ReactComponent as W2 } from 'new/assets/images/AIModelIcon/W2.svg';
import { ReactComponent as W9 } from 'new/assets/images/AIModelIcon/W9.svg';

const IMAGE_MAP = [
  {
    title: 'Invoice',
    value: 'invoice',
    icon: <Invoice />,
  },
  {
    title: 'Bill of Lading',
    value: 'bill_of_lading',
    icon: <BillOfLading />,
  },
  {
    title: 'Utility Bill',
    value: 'utility_bill',
    icon: <Test />,
  },
  {
    title: 'Acord 25',
    value: 'acord25',
    icon: <Acord25 />,
  },
  {
    title: 'Acord 28',
    value: 'acord28',
    icon: <Acord28 />,
  },
  {
    title: 'Acord 27',
    value: 'acord27',
    icon: <Acord27 />,
  },
  {
    title: 'Flood Certification',
    value: 'flood_certification',
    icon: <FloodCertification />,
  },
  {
    title: 'Acord 125',
    value: 'acord125',
    icon: <Acord125 />,
  },
  {
    title: 'Acord 101',
    value: 'acord101',
    icon: <Acord29 />,
  },
  {
    title: 'Acord 24',
    value: 'acord24',
    icon: <Acord29 />,
  },
  {
    title: 'Debt settlement',
    value: 'ndr',
    icon: <DebtSettlement />,
  },
  {
    title: 'US Bank Statement',
    value: 'us_bank_statement',
    icon: <USBankStatement />,
  },
  {
    title: 'Cheque',
    value: 'us_cheque',
    icon: <Test />,
  },
  {
    title: 'W9 Forms',
    value: 'w9_forms',
    icon: <W9 />,
  },
  {
    title: 'W2 Forms',
    value: 'w2_forms',
    icon: <W2 />,
  },
  {
    title: '940 Forms',
    value: '940_forms',
    icon: <Nine40 />,
  },
  {
    title: '1120s Forms',
    value: '1120s_forms',
    icon: <One120s />,
  },
  {
    title: 'Form 1040',
    value: 'form_1040',
    icon: <Form1040 />,
  },
  {
    title: 'Form 1040 Schedule 1',
    value: 'form_1040_schedule_1',
    icon: <Form1040I />,
  },
  {
    title: 'Form 1040 Schedule 2',
    value: 'form_1040_schedule_2',
    icon: <Form1040II />,
  },
  {
    title: 'Form 1040 Schedule 3',
    value: 'form_1040_schedule_3',
    icon: <Form1040III />,
  },
  {
    title: 'Form 1040 Schedule A',
    value: 'form_1040_schedule_a',
    icon: <Form1040A />,
  },
  {
    title: 'Form 1040 Schedule B',
    value: 'form_1040_schedule_b',
    icon: <Form1040B />,
  },
  {
    title: 'Form 1040 Schedule C',
    value: 'form_1040_schedule_c',
    icon: <Form1040C />,
  },
  {
    title: 'Form 1040 Schedule D',
    value: 'form_1040_schedule_d',
    icon: <Form1040D />,
  },
  {
    title: 'Form 1040 Schedule E',
    value: 'form_1040_schedule_e',
    icon: <Form1040E />,
  },
  {
    title: 'Form 8995-A',
    value: 'form_8995a',
    icon: <Form8995A />,
  },
  {
    title: '990 Forms',
    value: 'form_990',
    icon: <Test />,
  },
  {
    title: 'Rent Roll Multifamily',
    value: 'rent_roll',
    icon: <RRMultifamily />,
  },
  {
    title: 'Rent Roll Rental',
    value: 'rent_roll_rental',
    icon: <RRRental />,
  },
  {
    title: 'Rent Roll MHRV',
    value: 'rent_roll_mhrv',
    icon: <RRMHRV />,
  },
  {
    title: 'Profit and Loss',
    value: 'p_and_l',
    icon: <PNL />,
  },
  {
    title: 'Balance Sheet',
    value: 'balance_sheet',
    icon: <BalanceSheet />,
  },
  {
    title: 'Passport Front',
    value: 'passport_front',
    icon: <PassportFront />,
  },
  {
    title: 'Passport Back',
    value: 'passport_back',
    icon: <PassportBack />,
  },
  {
    title: 'Aadhaar Back',
    value: 'aadhaar_back',
    icon: <AadhaarBack />,
  },
  {
    title: 'PAN',
    value: 'pan',
    icon: <PAN />,
  },
  {
    title: 'Driving License',
    value: 'dl',
    icon: <DL />,
  },
  {
    title: 'Registration Certificate',
    value: 'rc',
    icon: <RC />,
  },
  {
    title: 'Voter Id Card',
    value: 'voterid',
    icon: <VoterID />,
  },
  {
    title: 'Bank Statement',
    value: 'bank_statement',
    icon: <USBankStatement />,
  },
  {
    title: 'US Driving License',
    value: 'us_license',
    icon: <DL />,
  },
  {
    title: 'Passports',
    value: 'world_passport',
    icon: <PassportFront />,
  },
  {
    title: 'Auto Classify',
    value: 'auto_classify',
    icon: <Test />,
  },
  {
    title: 'Table Vision',
    value: 'table_vision',
    icon: <Test />,
  },
  {
    title: 'Payslip',
    value: 'us_payslip',
    icon: <Test />,
  },
  {
    title: 'Test Document',
    value: 'test',
    icon: <Test />,
  },
];

const CARD_DATA = [
  {
    name: 'ID Card',
    value: 'ID Card',
  },
  {
    name: 'Statement',
    value: 'Statement',
  },
  {
    name: 'Lending',
    value: 'Lending',
  },
  {
    name: 'Bills',
    value: 'Bills',
  },
  {
    name: 'CRE',
    value: 'CRE',
  },
  {
    name: 'Compliance',
    value: 'Compliance',
  },
  {
    name: 'IRS',
    value: 'IRS',
  },
];

export { CARD_DATA, IMAGE_MAP };
