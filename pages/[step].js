import Link from 'next/link';
import { Snippet, Row, Col, Field, Actions } from '../components';
import { getSheets } from '../helpers/api';

const CONTENT = {
  title: 'What type of services do you provide?',
  hint: 'Select all that apply'
}

export default function CareSetting({ schema, steps, ...props }) {
  const step = props.step;
  const nextStep = steps[steps.indexOf(step) + 1] || 'results';

  return (
    <Row>
      <Col colspan={2}>
        <Field schema={schema.find(s => s.name === step)} />
        <Actions>
          <Link href={`/${nextStep}`}><a className="nhsuk-button"><Snippet inline>actions.submit</Snippet></a></Link>
        </Actions>
      </Col>
      <Col />
    </Row>
  );
}

export async function getStaticPaths(stuff) {
  const { steps, schema } = await getSheets();

  return {
    paths: steps.map(step => {
      return {
        params: { step }
      }
    }),
    fallback: false
  }
}

export async function getStaticProps(context) {
  const { step } = context.params;
  const { steps, schema } = await getSheets()

  return {
    props: {
      step,
      content: CONTENT,
      steps,
      schema
    },
    revalidate: 60
  }
}
