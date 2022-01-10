import Link from 'next/link';
import { Row, Col, Snippet, Actions } from '../components';
import styles from '../styles/Home.module.scss';
import { getSheets } from '../helpers/api';

const CONTENT = {
  title: 'Find assured suppliers of digital social care records',
  content: `Find government-assured suppliers who can help digitise your needs assessments and care plans.

Every supplier:

* offers minimum features (opens in a new tab), such as generating reports and seeing audit trails of changes to records
* complies with national standards (opens in a new tab) and can help meet CQC regulations on good governance
* has passed basic financial and security checks to give you added protection

Answer a few questions to filter suppliers based on your needs or go straight to all suppliers.`,
  actions: {
    button: 'Filter suppliers',
    link: 'Go straight to all suppliers'
  },
  download: {
    title: 'Before you start',
    content:  'If you’re not sure what you need from a digital solution, you can [download a list of all the features offered by different suppliers](/download) to see what’s possible.'
  }
};

export default function Home({ steps, ...props }) {
  return (
    <Row>
      <Col colspan={2}>
        <h1><Snippet inline>title</Snippet></h1>
        <Snippet>content</Snippet>
        <Actions>
          <Link href={`/${steps[0]}`}><a className="nhsuk-button"><Snippet inline>actions.button</Snippet></a></Link>
          <Link href="/results"><a><Snippet inline>actions.link</Snippet></a></Link>
        </Actions>
        <h4><Snippet inline>download.title</Snippet></h4>
        <Snippet>download.content</Snippet>
      </Col>
      <Col />
    </Row>
  )
}

export async function getStaticProps() {
  const { steps, schema } = await getSheets()

  return {
    props: {
      content: CONTENT,
      steps,
      schema
    }
  }
}
