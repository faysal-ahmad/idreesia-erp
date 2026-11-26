import React from 'react';

import { PersonPickerField } from '/imports/ui/modules/helpers/controls';

import { storeKarkunSource } from '../gql/paged-store-karkuns';

interface Props {
  fieldName: string;
  fieldLabel?: string;
  placeholder?: string;
  fieldLayout?: Record<string, unknown>;
  initialValue?: unknown;
  required?: boolean;
  requiredMessage?: string;
  disabled?: boolean;
  /** Adds a "Recently Used" tab: the people used on the store's forms before. */
  predefinedFilterName?: string;
  predefinedFilterStoreId?: string;
}

/** A form field naming a person on a store form (who purchased, received, ...). */
const StoreKarkunField = ({
  predefinedFilterName,
  predefinedFilterStoreId,
  ...fieldProps
}: Props) => (
  <PersonPickerField
    {...fieldProps}
    source={storeKarkunSource}
    sourceLabel="All Karkuns"
    tabs={
      predefinedFilterName
        ? [
            {
              key: 'recent',
              label: 'Recently Used',
              source: {
                ...storeKarkunSource,
                variables: { predefinedFilterName, predefinedFilterStoreId },
                description:
                  "Showing people already named in this field on this store's forms.",
              },
            },
          ]
        : undefined
    }
  />
);

export default StoreKarkunField;
