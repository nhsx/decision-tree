import ReactMarkdown from 'react-markdown';
import classnames from 'classnames';
import Field from '../Field';
import Snippet from '../Snippet';

import styles from './style.module.scss';

export default function CheckboxGroup({ name, label, hint, options, value, onFieldChange }) {
  function onChange(e) {
    const val = e.target.value;
    if (value.includes(val)) {
      onFieldChange(name, value.filter(v => v !== val));
    } else {
      onFieldChange(name, [ ...value, val ]);
    }
  }
  return (
    <div className="nhsuk-form-group" aria-describedby={hint && `${name}-hint`}>
      <fieldset className="nhsuk-fieldset">
        <legend className="nhsuk-fieldset__legend">
          <h1 className="nhsuk-fieldset__heading">{ label }</h1>
        </legend>
        {
          hint && <div className="nhsuk-hint" id={`${name}-hint`}><ReactMarkdown>{ hint }</ReactMarkdown></div>
        }
        <div className="nhsuk-checkboxes">
          {
            options.map((option, index) => {
              const id = `${name}-${index}`;
              const isChecked = value.includes(option.value);
              const showReveal = option.reveal && isChecked;
              return (
                <div key={index} className="nhsuk-checkboxes__item">
                  <input className="nhsuk-checkboxes__input" id={id} name={name} type="checkbox" value={option.value} checked={isChecked} onChange={onChange} />
                  <label className="nhsuk-label nhsuk-label--bold nhsuk-checkboxes__label" htmlFor={id}>
                    { option.label }
                  </label>
                  <div className="nhsuk-hint nhsuk-checkboxes__hint" id={`${id}-item-hint`}>
                    { option.hint }
                  </div>
                  {
                    showReveal && (
                      <div className={styles.reveal}>
                        <div className={classnames('nhsuk-hint', styles.revealHint)}><Snippet inline>reveal-hint</Snippet></div>
                        <Field schema={option.reveal} />
                      </div>
                    )
                  }
                </div>
              )
            })
          }
        </div>
      </fieldset>
    </div>
  )
}
