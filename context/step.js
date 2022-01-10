import { createContext, useContext } from 'react';

const StepContext = createContext();

export function StepContextWrapper({ children, step, steps }) {

  return (
    <StepContext.Provider value={{ step, steps }}>
      {children}
    </StepContext.Provider>
  );
}

export function useStepContext() {
  return useContext(StepContext);
}
