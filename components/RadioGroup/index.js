import Markdown from '../Markdown';

export default function RadioGroup({ name, label, hint, options, value, onFieldChange }) {
  function onChange(e) {
    const value = e.target.value;
    onFieldChange(name, value);
  }

  return (
    <div className="nhsuk-form-group">
      <fieldset className="nhsuk-fieldset" aria-describedby={hint && `${name}-hint`}>
        <legend className="nhsuk-fieldset__legend nhsuk-fieldset__legend--l">
          <h1 className="nhsuk-fieldset__heading">{label}</h1>
        </legend>
        {
          hint && <div className="nhsuk-hint" id={`${name}-hint`}><Markdown>{ hint }</Markdown></div>
        }
        <div className="nhsuk-radios">
          {
            options.map((option, index) => {
              const id = `${name}-${index}`;
              return (
                <div key={index} className="nhsuk-radios__item">
                  <input className="nhsuk-radios__input" id={id} name={name} type="radio" value={option.value} onChange={onChange} checked={value === option.value} />
                  <label className="nhsuk-label nhsuk-label--bold nhsuk-radios__label" htmlFor={id}>
                    { option.label }
                  </label>
                  <div className="nhsuk-hint nhsuk-radios__hint" id={`${id}-item-hint`}>
                    { option.hint }
                  </div>
                </div>
              )
            })
          }
        </div>
      </fieldset>
    </div>
  )
}
