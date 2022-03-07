import { Fragment, useState, useEffect } from 'react';
import classnames from 'classnames';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import size from 'lodash/size';
import pickBy from 'lodash/pickBy';
import chunk from 'lodash/chunk';
import flatten from 'lodash/flatten';
import every from 'lodash/every';
import partition from 'lodash/partition';
import intersection from 'lodash/intersection';
import axios from 'axios';
import shuffle from 'fast-shuffle';

import { getResults, getSheets } from '../helpers/api';
import { getDownload } from '../helpers/supplier-download';
import { useModelContext } from '../context/model';
import { useAlertContext } from '../context/alert';
import { Snippet, Row, Col, Details } from '../components';

const EMAIL_RE = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

function filterSuppliers(model, mappings, suppliers) {
  const nopes = [
    'hardware'
  ];
  // update seed for random ordering of suppliers every minute
  // this allows for locally stable rendering
  const SEED = Math.round(Date.now() / 60000);

  const filteredModel = Object.keys(model)
    .filter(key => !nopes.includes(key))
    .map(key => model[key]);

  const modelValues = flatten(filteredModel);

  return partition(shuffle(SEED)(suppliers), supplier => {
    const map = mappings.find(mapping => mapping.name === supplier.id);
    if (!map) {
      return false;
    }
    const yeps = modelValues.filter(val => Object.keys(map).includes(val));

    return !yeps.length || every(yeps, yep => map[yep]);
  })
}

import styles from '../styles/Results.module.scss';

const CONTENT = {
  title: 'All assured suppliers of digital social care records',
  'title-filtered': '{{showing}} of {{total}} suppliers match your criteria',
  intro: 'All suppliers offer [core features for social care and comply with national standards](https://www.digitalsocialcare.co.uk/social-care-technology/digital-social-care-records-dynamic-purchasing-system/core-capabilities-and-standards-supplier-assurance-process/).',
  hardware: '{{#hardware}}Supplies{{/hardware}}{{^hardware}}Does not supply{{/hardware}} devices such as computers, tablets and phones',
  'other-suppliers': {
    title: `{{num}} supplier{{#plural}}s{{/plural}} didn't match your criteria`,
    subtitle: 'Criteria not met'
  },
  'next-steps': {
    title: 'Next steps',
    content: '[Free resources and guidelines for buying solutions in the public sector](https://www.digitalsocialcare.co.uk/social-care-technology/digital-social-care-records-dynamic-purchasing-system/purchasing-through-the-dps/)'
  },
  actions: {
    'download-filtered': 'Download results',
    'download-all': 'Download all suppliers'
  },
  email: {
    summary: 'Email my results to me',
    'add-another': 'Add another email addresss'
  }
}

function Supplier({ name, email, phone, web, summary, video, capabilities, hardware, integrations, children }) {
  const words = summary.split(' ');

  const snippet = words.slice(0, 50).join(' ');
  const maincontent = words.slice(50).join(' ');

  const { query } = useRouter();

  const contact = (
    <div className={styles.contact}>
      <h3>Contact</h3>
      <p><a href={`mailto:${email}`}>{email}</a></p>
      <p>{phone}</p>
      <p><a href={web} target="_blank" rel="noreferrer">{`${web.replace(/^http(s)?:\/\//, '')} (opens in a new tab)`}</a></p>
    </div>
  )

  return (
    <div className={styles.supplier}>
      <hr />
      <Row>
        <Col colspan={children ? 3 : 2}>
          <h2>{ name }</h2>
          {
            children || <ReactMarkdown>{ `${snippet} ...` }</ReactMarkdown>
          }
        </Col>
        {
          !children && <Col>{ contact }</Col>
        }
      </Row>
      {
        children && (
          <Row>
            <Col colspan={2}><ReactMarkdown>{ `${snippet} ...` }</ReactMarkdown></Col>
            <Col>{ contact }</Col>
          </Row>
        )
      }
      <Details summary="See more">
        <Row>
          <Col colspan={2}>
            <ReactMarkdown>{`... ${maincontent}`}</ReactMarkdown>
            <hr />
            <iframe
              src={video}
              width={500}
              height={281}
              frameBorder={0}
            />
            <hr />
            <h3>Key product capabilities:</h3>
            <ReactMarkdown>{capabilities}</ReactMarkdown>
            <hr />
          </Col>
          <Col />
        </Row>
        <Row>
          <Col>
            <h3>Devices:</h3>
            <Snippet hardware={hardware}>hardware</Snippet>

            <hr />

            <h3>Compatible with:</h3>

            <div className={styles['list-container']}>
              <ReactMarkdown>{integrations}</ReactMarkdown>
            </div>

          </Col>
        </Row>
      </Details>
    </div>
  )
}

function CheckYourAnswersSection({ model, schema, section, title, nested = false }) {
  const options = schema.find(s => s.name === section).options;

  const values = options.filter(opt => {
    const field = model[section];
    if (Array.isArray(field)) {
      return field.includes(opt.value)
    }
    return field === opt.value;
  });

  const chunked = nested && chunk(values, 3);

  return (
    <>
      <Link href={`/${section}`}><a className="float-right change-link">Change</a></Link>
      <h3 className="nhsuk-heading-xs nhsuk-u-margin-bottom-2">{`${title}:`}</h3>
      {
        !!values.length
          ? (
            <>
              {
                nested
                  ? chunked.map((chunk, row) => (
                    <Row key={row}>
                      {
                        chunk.map((val, col) => {
                          const children = val.reveal.options.filter(opt => model[val.value].includes(opt.value));
                          return (
                            <Col key={col}>
                              <h5>{val.label}</h5>
                              {
                                !!children.length
                                  ? (
                                    <ul>
                                      {
                                        children.map(child => <li key={child.value}>{child.label}</li>)
                                      }
                                    </ul>
                                  )
                                  : 'None specified'
                              }
                            </Col>
                          )
                        })
                      }
                      {
                        chunk.length === 1 && <><Col /><Col /></>
                      }
                      {
                        chunk.length === 2 && <Col />
                      }
                    </Row>
                  ))
                  : (
                    <div className={styles['list-container']}>
                      <ul>
                        {
                          values.map(val => <li key={val.value}>{val.label}</li>)
                        }
                      </ul>
                    </div>
                  )
              }
            </>
          )
          : 'No answer provided'
      }
    </>
  )
}

function CheckYourAnswers({ model, schema }) {
  return (
    <details className="nhsuk-details">
      <summary className="nhsuk-details__summary">
        <span className="nhsuk-details__summary-text">View or change search criteria</span>
      </summary>
      <div className="nhsuk-details__text">
        <h3>Search criteria</h3>
        <hr />
        <CheckYourAnswersSection model={model} schema={schema} section="care-setting" title="Care services"/>
        <hr />
        <CheckYourAnswersSection model={model} schema={schema} section="hardware" title="Devices"/>
        <hr />
        <CheckYourAnswersSection model={model} schema={schema} section="capabilities" title="Additional features" nested={true} />
      </div>
    </details>
  )
}

function OtherSuppliers({ otherSuppliers, model, mappings, schema }) {
  const num = otherSuppliers.length;

  const allOptions = flatten(schema.map(s => {
    return flatten(s.options.map(opt => {
      return opt.reveal ? opt.reveal.options : opt
    }))
  }))

  function getLabel(key) {
    return allOptions.find(opt => opt.value === key).label;
  }

  return (
    <>
      <h4><Snippet inline num={num} plural={num > 1}>other-suppliers.title</Snippet></h4>
      <Details summary="Show suppliers not matching my criteria">
        {
          otherSuppliers.map(supplier => {
            const settings = mappings.find(m => m.name === supplier.id);
            return (
              <Supplier key={supplier.id} {...supplier}>
                <h3><Snippet inline>other-suppliers.subtitle</Snippet></h3>
                {
                  schema.map(s => {
                    const sectionOptions = flatten(s.options.map(o => {
                      if (o.reveal) {
                        return o.reveal.options.map(r => r.value)
                      }
                      return o.value;
                    }));

                    const nopes = Object.keys(pickBy(settings, (setting, key) => {
                      return sectionOptions.includes(key) && setting === false;
                    }));

                    const modelValues = flatten(Object.values(model))

                    const toDisplay = intersection(nopes, modelValues);

                    if (!toDisplay.length) {
                      return null
                    }

                    return (
                      <Fragment key={s.name}>
                        <h4>{s.title}</h4>
                        <ul className={styles['other-suppliers-list']}>
                          {
                            toDisplay.map(key => (<li key={key}>{getLabel(key)}</li>))
                          }
                        </ul>
                      </Fragment>
                    )
                  })
                }

              </Supplier>
            )
          })
        }
      </Details>
    </>
  )
}

function EmailForm({ attachment }) {
  const [emails, setEmails] = useState(['']);
  const [errs, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const { alertSuccess, alertError } = useAlertContext();

  async function sendEmail() {
    setSending(true)
    const res = await axios.post('/api/send-email', { emails, attachment });
    setSending(false);
    if (res.data.ok) {
      alertSuccess('Email(s) sent successfully');
      setEmails(['']);
    } else {
      alertError('There was a problem sending your email(s)');
    }
  }

  const onEmailChange = index => e => {
    const value = e.target.value;
    setEmails(emails.map((email, i) => {
      if (index === i) {
        return value;
      }
      return email;
    }));
  }

  function addAnother(e) {
    e.preventDefault();

    setEmails([
      ...emails,
      ''
    ]);
  }

  const remove = index => e => {
    e.preventDefault();
    setEmails(emails.filter((e, i) => i !== index));
  }

  async function validateAndSend() {
    const errors = emails.reduce((obj, email, index) => {
      if (!email) {
        return {
          ...obj,
          [index]: 'Email is required'
        }
      }
      if (!email.match(EMAIL_RE)) {
        return {
          ...obj,
          [index]: 'Email is invalid'
        }
      }
      return obj
    }, {});

    setErrors(errors);

    if (size(errors)) {
      return;
    }

    await sendEmail();
  }

  return (
    <Details summary={<Snippet inline>email.summary</Snippet>}>
      {
        emails.map((email, index) => {
          const error = errs[index];

          return (
            <div key={index} className={classnames('nhsuk-form-group', { 'nhsuk-form-group--error': error })}>
              <label
                className="nhsuk-label"
                htmlFor={`email-${index}`}
              >
                Email
              </label>
              {
                error && <span className="nhsuk-error-message">{error}</span>
              }
              <Row>
                <Col colspan={2}>
                  <input
                    className={'nhsuk-input'}
                    key={index}
                    id={`email-${index}`}
                    type="email"
                    value={email}
                    onChange={onEmailChange(index)}
                  />
                </Col>
                <Col>
                  {
                    index > 0 && <p><a href="#" onClick={remove(index)}>Remove</a></p>
                  }
                </Col>
              </Row>
            </div>
          )
        })
      }
      <p>
        <a href="#" onClick={addAnother}><Snippet inline>email.add-another</Snippet></a>
      </p>
      <button onClick={validateAndSend} className="nhsuk-button nhsuk-button--secondary" disabled={sending}>Submit</button>
    </Details>
  )
}

export default function Results({ suppliers, schema, mappings }) {
  const { model, clearModel } = useModelContext();
  const [matchingSuppliers, setMatchingSuppliers] = useState([]);
  const [otherSuppliers, setOtherSuppliers] = useState([]);
  const [download, setDownload] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (router.query.clear) {
      clearModel();
      router.replace({ path: router.pathname })
    }
  }, [clearModel, router]);

  useEffect(() => {
    setDownload(getDownload({ model, schema, mappings, suppliers: [...matchingSuppliers, ...otherSuppliers] }));
  }, [matchingSuppliers, otherSuppliers, schema, model]);

  useEffect(() => {
    const [newMatchingSuppliers, newOtherSuppliers] = filterSuppliers(model, mappings, suppliers);
    setMatchingSuppliers(newMatchingSuppliers);
    setOtherSuppliers(newOtherSuppliers);
  }, [model, mappings, suppliers])

  const hasValues = !!Object.values(model).filter(val => {
    if (Array.isArray(val)) {
      return !!val.length
    }
    return !!val;
  }).length;

  const filtered = matchingSuppliers.length < suppliers.length;

  return (
    <>
      <Row>
        <Col colspan={2} total={3}>
          <h1><Snippet inline showing={matchingSuppliers.length} total={suppliers.length}>{filtered ? 'title-filtered' : 'title'}</Snippet></h1>
          <Snippet>intro</Snippet>
        </Col>
        <Col/>
      </Row>
      {
        hasValues && <CheckYourAnswers model={model} schema={schema} />
      }
      {
        matchingSuppliers.map((supplier, index) => <Supplier key={supplier.id} {...supplier} />)
      }
      {
        filtered && <OtherSuppliers otherSuppliers={otherSuppliers} mappings={mappings} model={model} schema={schema} />
      }
      <hr />
      <a className="nhsuk-button" href={encodeURI(`data:application/vnd.ms-excel;base64,${download}`)} download={`${filtered ? 'matching' : 'all'}-suppliers.xlsx`}><Snippet inline>{filtered ? 'actions.download-filtered' : 'actions.download-all'}</Snippet></a>
      {
        filtered && <EmailForm attachment={download} />
      }
      <hr />
      <h2><Snippet inline>next-steps.title</Snippet></h2>
      <Snippet>next-steps.content</Snippet>
    </>
  )
}

export async function getStaticProps() {
  const { suppliers, mappings } = await getResults();
  const { schema } = await getSheets();

  return {
    props: {
      suppliers,
      mappings,
      schema,
      content: CONTENT
    }
  }
}
