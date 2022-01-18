const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

const html = `
  <h1>Your results for assured suppliers of digital social care records</h1>

  <p>Attached is a CSV of assured suppliers of digital social care records matched to your search criteria</p>

  <p>If your requirements change you can <a href="${process.env.SERVICE_START}">start a new search for digital social care record suppliers.</a> You can also <a href="https://www.digitalsocialcare.co.uk/">visit the Digital Social Care website</a> for more information on technology and data protection in social care.</p>
`;

function sendMail({ email, csv }) {
  return new Promise((resolve, reject) => {
    transporter.sendMail({
      from: '',
      to: email,
      subject: 'Your results for assured suppliers of digital social care records',
      html,
      attachments: [
        {
          filename: "matching-suppliers.csv",
          content: csv
        }
      ]
    }, (err, info) => {
      if (err) {
        return reject(err);
      }
      resolve(info);
    });
  });
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
      res.json({ ok: false })
    })
}
