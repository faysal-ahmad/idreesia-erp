import request from 'request';

export default function sendEmail({ from, to, replyTo, subject, html }) {
  return new Promise((resolve, reject) => {
    const options = {
      uri: 'https://api.sendgrid.com/v3/mail/send',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${Meteor.settings.private.emailProviderKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to,
            subject,
          },
        ],
        from: {
          email: from,
        },
        reply_to: {
          email: replyTo,
        },
        subject,
        content: [
          {
            type: 'text/html',
            value: html,
          },
        ],
      }),
    };

    request.post(options, (error, response, body) => {
      if (error) reject(error);
      if (body !== '') {
        const bodyObject = JSON.parse(body);
        if (bodyObject.errors) {
          reject(bodyObject.errors);
        }
      }
      resolve(null);
    });
  });
}
