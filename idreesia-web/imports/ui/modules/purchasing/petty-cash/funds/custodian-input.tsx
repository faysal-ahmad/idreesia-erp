import React from 'react';

import {
  PersonPickerInput,
  type PersonPickerInputProps,
} from '/imports/ui/modules/helpers/controls';

import { purchasingCustodianKarkunSource } from '../gql';

type Props = Omit<PersonPickerInputProps, 'source' | 'drawerTitle'>;

/**
 * Picks a fund's custodian from the people who hold a Purchasing permission,
 * not from every karkun. Works as a Form.Item control.
 */
const CustodianInput = (props: Props) => (
  <PersonPickerInput
    source={purchasingCustodianKarkunSource}
    drawerTitle="Select the Custodian"
    {...props}
  />
);

export default CustodianInput;
