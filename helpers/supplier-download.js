import XLSX from 'xlsx-js-style';
import flatten from 'lodash/flatten';

const STYLES = {
  h1: {
    sz:24,
    bold: true
  },
  h2: {
    sz:18,
    bold: true
  },
  strong: {
    bold: true
  },
  a: {
    underline: true,
    color: { rgb: '000000FF' },
  },
  borderTop: {
    top: {
      style: 'thin',
      color: { rgb: '00000000' }
    }
  }
};

function ucfirst(str) {
  return `${str.charAt(0).toUpperCase()}${str.substring(1)}`;
}


export function getDownload({ model, schema, mappings, suppliers }) {
  const isFiltered = Object.values(model).some(val => val && val.length);

  // add mappings to supplier object for faster access later
  mappings.forEach(mapping => {
    const supplier = suppliers.find(s => s.id === mapping.name);
    if (supplier) {
      supplier.features = mapping;
    }
  });

  const addBorder = (row = []) => {
    return row.map(cell => {
      if (typeof cell === 'string') {
        return { v: cell, s: { border: STYLES.borderTop } };
      }
      cell.s = cell.s || {};
      cell.s.border = STYLES.borderTop;
      return cell;
    });
  };

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([]);
  XLSX.utils.sheet_add_aoa(worksheet, [
    [
      {
        v: 'Find assured suppliers of digital social care records',
        s: { font: STYLES.h1 }
      }
    ],
    [
      {
        v: 'All suppliers offer core features for social care and comply with national standards.',
        l: { Target: 'https://www.digitalsocialcare.co.uk/social-care-technology/digital-social-care-records-dynamic-purchasing-system/core-capabilities-and-standards-supplier-assurance-process/' },
        s: { font: STYLES.a }
      }
    ],
    [''],
    [
      {
        v: 'Supplier information',
        s: { font: STYLES.h2 }
      }
    ]
  ]);

  worksheet['!cols'] = [{ wch: 20 }, { wch: 60 }, ...suppliers.map(s => ({ wch: 20 }))];

  const supplierMap = ['name', 'email', 'phone', 'web'].map(key => {
    const row = ['', ucfirst(key), ...suppliers.map(s => s[key])];
    switch (key) {
      case 'name':
        return addBorder(row.map(v => ({ v, s: { font: STYLES.strong } })));
      case 'web':
        return row.map((v, i) => {
          if (i > 1) {
            return { v, l: { Target: v }, s: { font: STYLES.a } };
          }
          return v;
        });
      default:
        return row;
    }
  });

  XLSX.utils.sheet_add_aoa(worksheet, supplierMap, { origin: -1 });
  XLSX.utils.sheet_add_aoa(worksheet, [], { origin: -1 });

  const YES = () => ({ v: 'Yes', s: { font: {  }, alignment: { horizontal: 'center' } } });
  const NO = () => ({ v: 'No', s: { font: { color: { rgb: '00AA0000' } }, alignment: { horizontal: 'center' } } });

  const getFilteredCapabilities = (fn = _ => true) => {
    const block = schema
      .filter(section => section.name !== 'hardware')
      .reduce((rows, section) => {
        const allOptions = section.options.reduce((map, option) => {
          if (option.reveal) {
            return [...map, ...option.reveal.options.map(o => o)];
          }
          return [...map, option];
        }, []);

        return [
          ...rows,
          ...allOptions
            .filter(fn)
            .map((option, i) => {
              const row = i === 0 ? [ { v: section.title, s: { font: STYLES.strong }} ] : [''];
              row.push(option.label);
              row.push(...suppliers.map(supplier => {
                return supplier.features[option.value] ? YES() : NO();
              }));
              return i === 0 ? addBorder(row) : row;
            })
        ];
      }, []);

    block[0] = addBorder(block[0]);

    return block;
  };
  const devices = [
    addBorder([
      { v: 'Devices', s: { font: STYLES.strong } },
      'Supplies devices such as computers, tablets and phones',
      ...suppliers.map(supplier => supplier.features.hardware ? YES() : NO())
    ])
  ];

  if (isFiltered) {
    const selected = flatten(Object.values(model));
    const selectedMapping = getFilteredCapabilities(opt => selected.includes(opt.value));
    const unselectedMapping = getFilteredCapabilities(opt => !selected.includes(opt.value));

    XLSX.utils.sheet_add_aoa(worksheet, [[ { v: 'Your search criteria', s: { font: STYLES.h2 } } ]], { origin: -1 });
    XLSX.utils.sheet_add_aoa(worksheet, [
      addBorder([
        { v: 'Search criteria matched', s: { font: STYLES.strong } },
        '',
        ...suppliers.map(s => s.matched ? YES() : NO())
      ])
    ], { origin: -1 });
    XLSX.utils.sheet_add_aoa(worksheet, selectedMapping, { origin: -1 });
    if (model.hardware !== 'no') {
      XLSX.utils.sheet_add_aoa(worksheet, devices, { origin: -1 });
    }

    XLSX.utils.sheet_add_aoa(worksheet, [], { origin: -1 });
    XLSX.utils.sheet_add_aoa(worksheet, [[ { v: 'Other services, features and compatible systems', s: { font: STYLES.h2 } } ]], { origin: -1 });
    XLSX.utils.sheet_add_aoa(worksheet, unselectedMapping, { origin: -1 });
    if (model.hardware === 'no') {
      XLSX.utils.sheet_add_aoa(worksheet, devices, { origin: -1 });
    }
  } else {
    XLSX.utils.sheet_add_aoa(worksheet, [[ { v: 'Services, features and compatible systems', s: { font: STYLES.h2 } } ]], { origin: -1 });
    XLSX.utils.sheet_add_aoa(worksheet, getFilteredCapabilities(), { origin: -1 });
    XLSX.utils.sheet_add_aoa(worksheet, devices, { origin: -1 });
  }

  const integrations = [
    addBorder([
      { v: 'Compatibility', s: { alignment: { vertical: 'top' }, font: STYLES.strong } },
      { v: 'Compatible with:', s: { alignment: { vertical: 'top' } } },
      ...suppliers.map(s => ({ v: s.integrations, s: { alignment: { vertical: 'top' } }}))
    ])
  ];

  XLSX.utils.sheet_add_aoa(worksheet, integrations, { origin: -1 });
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Suppliers');

  return XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
}
