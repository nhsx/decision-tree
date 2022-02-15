import { ModelContextWrapper } from './model';
import { ContentContextWrapper } from './content';
import { StepContextWrapper } from './step';
import { AlertContextWrapper } from './alert';

export function PageContext({ children, schema, content, step, steps }) {
  return (
    <AlertContextWrapper>
      <ContentContextWrapper value={content}>
        <StepContextWrapper step={step} steps={steps}>
          <ModelContextWrapper schema={schema}>
            { children }
          </ModelContextWrapper>
        </StepContextWrapper>
      </ContentContextWrapper>
    </AlertContextWrapper>
  );
}
