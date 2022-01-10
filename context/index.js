import { ModelContextWrapper } from './model';
import { ContentContextWrapper } from './content';
import { StepContextWrapper } from './step';

export function PageContext({ children, schema, content, step, steps }) {
  return (
    <ContentContextWrapper value={content}>
      <StepContextWrapper step={step} steps={steps}>
        <ModelContextWrapper schema={schema}>
          { children }
        </ModelContextWrapper>
      </StepContextWrapper>
    </ContentContextWrapper>
  );
}
