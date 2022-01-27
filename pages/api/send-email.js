const { NotifyClient } = require('notifications-node-client');

const subject = 'Your results for assured suppliers of digital social care records';

function sendMail({ email, csv }) {

  const client = new NotifyClient(process.env.NOTIFY_KEY);
  const recipients = email.split(',');
  const sendMessages = () => recipients.map(recipient => {
    return client.sendEmail(process.env.NOTIFY_TEMPLATE, recipient, {
      personalisation: {
        subject,
        url: process.env.SERVICE_START,
        link: client.prepareUpload(Buffer.from(csv))
      }
    });
  });
  return Promise.all(sendMessages());

}

export default function handler(req, res) {
  const { emails, csv } = req.body;

  Promise.all(
    emails.map(email => sendMail({ email, csv }))
  )
    .then(() => {
      res.json({ ok: true })
    })
    .catch(err => {
      console.error(err.response.data.errors);
      res.json({ ok: false, message: err.message })
    })
}
