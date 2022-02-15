import { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export function AlertContextWrapper({ children }) {

  const [message, setMessage] = useState('');
  const [state, setState] = useState('success');

  const clearAlert = () => {
    setMessage('');
  };

  const alertSuccess  = msg => {
    setState('success');
    setMessage(msg);
    setTimeout(clearAlert, 5000);
  };

  const alertError  = msg => {
    setState('error');
    setMessage(msg);
    setTimeout(clearAlert, 5000);
  };

  const value = {
    message,
    state,
    clearAlert,
    alertSuccess,
    alertError
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  return useContext(AlertContext);
}
