import { createContext, useContext, useState, useEffect } from 'react';
import flatten from 'lodash/flatten';

const ModelContext = createContext();

function emptyModel(schema) {
  if (!schema) {
    return {};
  }
  const reveals = flatten(schema.map(s => s.options.filter(opt => opt.reveal))).map(s => s.value)
  const fields = [
    ...schema.map(s => s.name),
    ...reveals
  ];

  return fields.reduce((model, field) => {
    return {
      ...model,
      [field]: schema[field]?.type === 'RadioGroup' ? null : []
    }
  }, {})
}

export function ModelContextWrapper({ children, schema }) {
  const [model, setModel] = useState(emptyModel(schema));

  useEffect(() => {
    const modelData = JSON.parse(localStorage.getItem('model'))

    if (modelData) {
      setModel(modelData)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('model', JSON.stringify(model))
  }, [model]);

  function clearStorage() {
    localStorage.clear();
  }

  function updateField(field, value) {
    setModel({
      ...model,
      [field]: value
    })
  }

  const value = {
    model,
    updateField
  };

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>
}

export function useModelContext() {
  return useContext(ModelContext)
}
