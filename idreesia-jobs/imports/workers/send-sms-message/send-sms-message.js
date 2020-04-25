import request from 'request';

const baseUri = 'http://sms.aimztra.com:7080/smsprocessor/sendmtmsg.htm';
const transformPhoneNumber = phoneNumber =>
  `92${phoneNumber.substring(1, 4)}${phoneNumber.substring(5)}`;

export default function sendSmsMessage(phoneNumber, messageBody) {
  const updatedPhoneNumber = transformPhoneNumber(phoneNumber);
  /*
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`Sending message to ${updatedPhoneNumber}`);
      return Promise.resolve();
    }
  */

  return new Promise((resolve, reject) => {
    const options = {
      uri: `${baseUri}?message=${messageBody}&phoneno=%2B${updatedPhoneNumber}&username=MTMSG&password=AE381A`,
    };

    request.get(options, (error, response, body) => {
      if (error) reject(error);
      // Look for string `SuccessList:[+############]` in the returned body
      // to find out if it succeeded.
      const messageSent = body.includes(`+${updatedPhoneNumber}`);
      resolve({
        phoneNumber,
        messageSent,
      });
    });
  });
}
