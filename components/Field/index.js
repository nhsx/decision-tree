import { useModelContext } from '../../context/model';

import CheckboxGroup from '../CheckboxGroup';
import RadioGroup from '../RadioGroup';

const components = {
  CheckboxGroup,
  RadioGroup
}

export default function Field({ schema }) {
  const { model, updateField } = useModelContext();
  const { type, ...props } = schema;
  const Component = components[type];

  function onChange(field, value) {
    updateField(field, value);
  }

  return <Component {...props} onFieldChange={onChange} value={model[props.name]} />
}
