import {
  DateResolver,
  TimeResolver,
  DateTimeResolver,
  TimestampResolver,
  UtcOffsetResolver,
  EmailAddressResolver,
  PhoneNumberResolver,
  PostalCodeResolver,
  URLResolver,
  CurrencyResolver,
  JSONResolver,
  JSONObjectResolver,
} from 'graphql-scalars';

export default {
  Date: DateResolver,
  Time: TimeResolver,
  DateTime: DateTimeResolver,
  Timestamp: TimestampResolver,
  UtcOffset: UtcOffsetResolver,
  EmailAddress: EmailAddressResolver,
  PhoneNumber: PhoneNumberResolver,
  PostalCode: PostalCodeResolver,
  URL: URLResolver,
  Currency: CurrencyResolver,
  JSON: JSONResolver,
  JSONObject: JSONObjectResolver,
};
