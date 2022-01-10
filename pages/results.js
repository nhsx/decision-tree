import { useState } from 'react';
import { getResults, getSheets } from '../helpers/api';
import { useModelContext } from '../context/model';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Snippet, Row, Col } from '../components';
import size from 'lodash/size';
import chunk from 'lodash/chunk';
import flatten from 'lodash/flatten';
import every from 'lodash/every';

function filterSuppliers(model, mappings, suppliers) {
  const nopes = [
    'hardware'
  ];
  const modelValues = flatten(Object.values(model)).filter(val => !nopes.includes(val));

  return suppliers.filter(supplier => {
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
  hardware: '{{#hardware}}Supplies{{/hardware}}{{^hardware}}Does not supply{{/hardware}} devices such as computers, tablets and phones'
}

function Supplier({ name, email, phone, web, summary, video, capabilities, hardware, integrations }) {
  const words = summary.split(' ');

  const snippet = words.slice(0, 50).join(' ');
  const maincontent = words.slice(50).join(' ');

  return (
    <div className={styles.supplier}>
      <hr />
      <Row>
        <Col colspan={2}>
          <h2>{ name }</h2>
          <ReactMarkdown>{ `${snippet} ...` }</ReactMarkdown>
        </Col>
        <Col className={styles.contact}>
          <h3>Contact</h3>
          <p><a href={`mailto:${email}`}>{email}</a></p>
          <p>{phone}</p>
          <p><a href={web} target="_blank">{`${web} (opens in a new tab)`}</a></p>
        </Col>
      </Row>
      <details className="nhsuk-details">
        <summary className="nhsuk-details__summary">
          <span className="nhsuk-details__summary-text">See more</span>
        </summary>
        <div className="nhsuk-details__text">
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
        </div>
      </details>
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

export default function Results({ suppliers, schema, mappings }) {
  const { model } = useModelContext();

  const hasValues = !!Object.values(model).filter(val => {
    if (Array.isArray(val)) {
      return !!val.length
    }
    return !!val;
  }).length;

  const visibleSuppliers = filterSuppliers(model, mappings, suppliers);
  const filtered = visibleSuppliers.length < suppliers.length;

  return (
    <>
      <Row>
        <Col colspan={2}>
          <h1><Snippet inline showing={visibleSuppliers.length} total={suppliers.length}>{filtered ? 'title-filtered' : 'title'}</Snippet></h1>
          <Snippet>intro</Snippet>
        </Col>
        <Col />
      </Row>
      {
        hasValues && <CheckYourAnswers model={model} schema={schema} />
      }
      {
        visibleSuppliers.map((supplier, index) => <Supplier {...supplier} />)
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
