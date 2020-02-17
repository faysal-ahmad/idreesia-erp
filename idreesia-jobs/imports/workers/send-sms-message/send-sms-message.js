export default function sendSmsMessage(phoneNumber, messageBody) {
  console.log(`Sent message to ${phoneNumber}`);
  return Promise.resolve();
}
