import Link from 'next/link';
import { Row, Col, Actions } from '../components';
import styles from '../styles/Home.module.scss';
import { getSheets } from '../helpers/api';

export default function Home({ steps, ...props }) {

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
        <p>If you’re not sure what you need from a digital solution, you can <a href="/Required_and_optional_standards_and_capabilities_March_2021.xlsx">download a list of all the features offered by different suppliers</a> to see what’s possible.</p>
      </Col>
      <Col />
    </Row>
  )
}

export async function getStaticProps() {
  const { steps, schema } = await getSheets()

  return {
    props: {
      steps,
      schema
    }
  }
}
