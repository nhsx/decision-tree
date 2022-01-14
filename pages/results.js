import { useState } from 'react';
import { getResults, getSheets } from '../helpers/api';
import { useModelContext } from '../context/model';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Snippet, Row, Col, Details } from '../components';
import size from 'lodash/size';
import pickBy from 'lodash/pickBy';
import chunk from 'lodash/chunk';
import flatten from 'lodash/flatten';
import every from 'lodash/every';
import partition from 'lodash/partition';
import intersection from '../node_modules/lodash/intersection';

function filterSuppliers(model, mappings, suppliers) {
  const nopes = [
    'hardware'
  ];
  const modelValues = flatten(Object.values(model)).filter(val => !nopes.includes(val));

  return partition(suppliers, supplier => {
    const map = mappings.find(mapping => mapping.name === supplier.id);
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
  }
}

function Supplier({ name, email, phone, web, summary, video, capabilities, hardware, integrations, children }) {
  const words = summary.split(' ');

  const snippet = words.slice(0, 50).join(' ');
  const maincontent = words.slice(50).join(' ');

  const contact = (
    <div className={styles.contact}>
      <h3>Contact</h3>
      <p><a href={`mailto:${email}`}>{email}</a></p>
      <p>{phone}</p>
      <p><a href={web} target="_blank">{`${web} (opens in a new tab)`}</a></p>
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
              frameborder={0}
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
            <h3>Devices</h3>
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
                  ? chunked.map(chunk => (
                    <Row>
                      {
                        chunk.map(val => {
                          const children = val.reveal.options.filter(opt => model[val.value].includes(opt.value));
                          return (
                            <Col>
                              <h5>{val.label}</h5>
                              {
                                !!children.length
                                  ? (
                                    <ul>
                                      {
                                        children.map(child => <li>{child.label}</li>)
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
                          values.map(val => <li>{val.label}</li>)
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
              <Supplier {...supplier}>
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
                      <>
                        <h4>{s.title}</h4>
                        <ul className={styles['other-suppliers-list']}>
                          {
                            toDisplay.map(key => (<li>{getLabel(key)}</li>))
                          }
                        </ul>
                      </>
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

export default function Results({ suppliers, schema, mappings }) {
  const { model } = useModelContext();

  const hasValues = !!Object.values(model).filter(val => {
    if (Array.isArray(val)) {
      return !!val.length
    }
    return !!val;
  }).length;

  const [matchingSuppliers, otherSuppliers] = filterSuppliers(model, mappings, suppliers);
  const filtered = matchingSuppliers.length < suppliers.length;

  return (
    <>
      <Row>
        <Col colspan={2}>
          <h1><Snippet inline showing={matchingSuppliers.length} total={suppliers.length}>{filtered ? 'title-filtered' : 'title'}</Snippet></h1>
          <Snippet>intro</Snippet>
        </Col>
        <Col />
      </Row>
      {
        hasValues && <CheckYourAnswers model={model} schema={schema} />
      }
      {
        matchingSuppliers.map((supplier, index) => <Supplier {...supplier} />)
      }
      {
        filtered && <OtherSuppliers otherSuppliers={otherSuppliers} mappings={mappings} model={model} schema={schema} />
      }
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
