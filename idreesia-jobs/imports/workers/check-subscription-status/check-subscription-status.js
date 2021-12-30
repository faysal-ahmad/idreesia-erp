import request from 'request';
import { People } from 'meteor/idreesia-common/server/collections/common';

const regex = RegExp('^[0-9+]{4}-[0-9+]{7}$');
const baseUri = 'http://sms.aimztra.com:7080/smsprocessor/subs_info.htm';
const transformPhoneNumber = phoneNumber =>
  `92${phoneNumber.substring(1, 4)}${phoneNumber.substring(5)}`;

export default function checkSubscriptionStatus(person) {
  const {
    sharedData: {
      contactNumber1,
      contactNumber1Subscribed,
      contactNumber2,
      contactNumber2Subscribed,
    },
  } = person;

  const promises = [];
  if (contactNumber1Subscribed !== true && regex.test(contactNumber1)) {
    promises.push(
      new Promise((resolve, reject) => {
        const updatedPhoneNumber = transformPhoneNumber(contactNumber1);
        const options = {
          uri: `${baseUri}?&phoneno=%2B${updatedPhoneNumber}&username=MTMSG&password=AE381A`,
        };

        request.get(options, (error, response, body) => {
          if (error) reject(error);
          // Look for string `"subsInfo":"Y"` in the returned body
          // to find out if it is subscribed or not.
          const numberSubscribed = body.includes('"subsInfo":"Y"');
          resolve(numberSubscribed);
        });
      }).then(subscribed => {
        People.update(person._id, {
          $set: {
            'sharedData.contactNumber1Subscribed': subscribed,
          },
        });
      })
    );
  }

  if (contactNumber2Subscribed !== true && regex.test(contactNumber2)) {
    promises.push(
      new Promise((resolve, reject) => {
        const updatedPhoneNumber = transformPhoneNumber(contactNumber2);
        const options = {
          uri: `${baseUri}?&phoneno=%2B${updatedPhoneNumber}&username=MTMSG&password=AE381A`,
        };

        request.get(options, (error, response, body) => {
          if (error) reject(error);
          // Look for string `"subsInfo":"Y"` in the returned body
          // to find out if it is subscribed or not.
          const numberSubscribed = body.includes('"subsInfo":"Y"');
          resolve(numberSubscribed);
        });
      }).then(subscribed => {
        People.update(person._id, {
          $set: {
            'sharedData.contactNumber2Subscribed': subscribed,
          },
        });
      })
    );
  }

  return Promise.all(promises);
}
