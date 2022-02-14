import Link from 'next/link';
import { stringify } from 'csv-stringify/sync';
import { Row, Col, Actions } from '../components';
import styles from '../styles/Home.module.scss';
import { getSheets, getResults } from '../helpers/api';

export default function Home({ steps, csv, ...props }) {

  return (
    <Row>
      <Col colspan={2}>
        <h1>Find assured suppliers of digital social care records</h1>
        <p>Find government-assured suppliers who can help digitise your needs assessments and care plans.</p>

        <p>Every supplier:</p>
        <ul>
          <li>offers <a href="https://www.digitalsocialcare.co.uk/social-care-technology/digital-social-care-records-dynamic-purchasing-system/core-capabilities-and-standards-supplier-assurance-process/" target="_blank" rel="noreferrer">minimum features (opens in a new tab)</a>, such as generating reports and seeing audit trails of changes to records</li>
          <li>complies with <a href="https://www.digitalsocialcare.co.uk/social-care-technology/digital-social-care-records-dynamic-purchasing-system/core-capabilities-and-standards-supplier-assurance-process/" target="_blank" rel="noreferrer">national standards (opens in a new tab)</a> and can help meet CQC regulations on good governance</li>
          <li>has passed basic financial and security checks to give you added protection</li>
        </ul>

        <p>Answer a few questions to filter suppliers based on your needs or go straight to all suppliers.</p>
        <Actions>
          <Link href={`/${steps[0]}`}><a className="nhsuk-button">Filter suppliers</a></Link>
          <Link href="/results?clear=true"><a>Go straight to all suppliers</a></Link>
        </Actions>
        <h4>Before you start</h4>
        <p>If you’re not sure what you need from a digital solution, you can <a href={encodeURI(`data:text/csv;charset=utf-8,${csv}`)} download="all-suppliers.csv">download a list of all the features offered by different suppliers</a> to see what’s possible.</p>
      </Col>
      <Col />
    </Row>
  )
}

export async function getStaticProps() {
  const { suppliers } = await getResults()
  const { steps, schema } = await getSheets()

  const titleCase = (str) => {
    return `${str.charAt(0).toUpperCase()}${str.substring(1)}`;
  }

  const columns = Object.keys(suppliers[0]).filter(key => key !== 'hardware').map(key => {
    return {
      key,
      header: titleCase(key)
    }
  })

  const csv = stringify(suppliers, { columns, header: true })

  return {
    props: {
      steps,
      schema,
      csv
    }
  }
}
