const { GoogleSpreadsheet } = require('google-spreadsheet');
const { pick, mapValues } = require('lodash');

function conditionalParseBool(val) {
  if (val === 'TRUE') {
    return true;
  }
  if (val === 'FALSE') {
    return false;
  }
  if (val === '') {
    return null;
  }
  return val;
}

async function getSpreadseet() {
  const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);
  await doc.useServiceAccountAuth({
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n")
  });

  await doc.loadInfo();

  return doc;
}

async function getSchema(doc, step) {
  const sheet = doc.sheetsByTitle[step];
  const rows = await sheet.getRows();
  const { label, hint, type } = rows[0];

  return {
    label,
    hint,
    type,
    name: step,
    options: rows.filter(r => Boolean(r.option)).map(r => {
      const revealOptions = rows.filter(rv => rv['reveal-parent'] === r.option);

      const reveal = revealOptions.length > 0 && {
        label: null,
        hint: null,
        type: 'CheckboxGroup',
        name: r.option,
        options: revealOptions.map(r => {
          return {
            value: r.reveal,
            label: r['reveal-label'],
            hint: r['reveal-hint'] || null
          }
        })
      };

      return {
        value: r.option,
        label: r['option-label'],
        hint: r['option-hint'] || null,
        reveal: reveal || null
      }
    })
  };
}

export async function getAllSuppliers(doc) {
  const sheet = doc.sheetsByTitle['suppliers'];
  const rows = await sheet.getRows();

  return rows.map(row => mapValues(pick(row, 'id', 'name', 'email', 'phone', 'web', 'summary', 'video', 'capabilities', 'integrations', 'hardware'), conditionalParseBool))
}

export async function getMappings(doc) {
  const sheet = doc.sheetsByTitle['mappings'];
  const rows = await sheet.getRows();

  return rows.map(row => mapValues(pick(row, sheet.headerValues), conditionalParseBool));
}

export async function getResults() {
  const doc = await getSpreadseet()

  const suppliers = await getAllSuppliers(doc);
  const mappings = await getMappings(doc);

  return {
    suppliers,
    mappings
  };
}

export async function getSheets(req, res) {
  const doc = await getSpreadseet();

  const blacklist = [
    'mappings',
    'suppliers'
  ];

  const steps = doc.sheetsByIndex.filter(s => !blacklist.includes(s.title)).map(s => s.title);

  return Promise.all(steps.map(step => getSchema(doc, step)))
    .then(schema => {
      return { steps, schema }
    });
}
