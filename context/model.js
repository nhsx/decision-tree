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

  function clearModel() {
    clearStorage();
    setModel(emptyModel(schema));
  }

  function updateField(field, value) {
    const topLevelQuestion = schema.find(q => q.name === field);
    const newState = { ...model, [field]: value };
    if (topLevelQuestion) {
      topLevelQuestion.options
        .filter(opt => opt.reveal && !value.includes(opt.value))
        .forEach(opt => {
          newState[opt.value] = [];
        })
    }
    setModel(newState);
  }

  const value = {
    model,
    updateField,
    clearModel
  };

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>
}

export function useModelContext() {
  return useContext(ModelContext)
}
