import request from 'request';

const baseUri = 'http://sms.aimztra.com:7080/smsprocessor/sendmt.htm';
const updatePhoneNumber = phoneNumber =>
  `+92${phoneNumber.substring(1, 4)}${phoneNumber.substring(5)}`;

export default function sendSmsMessage(phoneNumber, messageBody) {
  const updatedPhoneNumber = updatePhoneNumber(phoneNumber);
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(`Sending message to ${updatedPhoneNumber}`);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const options = {
      uri: `${baseUri}?message=${messageBody}&phoneno=${updatedPhoneNumber}&username=MTMSG&password=AE381A`,
    };

    request.get(options, error => {
      if (error) reject(error);
      resolve();
    });
  });
}
