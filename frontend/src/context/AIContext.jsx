import { createContext, useContext, useState } from 'react';

const AIContext = createContext();

export function AIProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState('');

  const openAI = (msg = '') => {
    setInitialMessage(msg);
    setIsOpen(true);
  };

  const closeAI = () => {
    setIsOpen(false);
    setInitialMessage('');
  };

  return (
    <AIContext.Provider value={{ isOpen, openAI, closeAI, initialMessage, setInitialMessage }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  return useContext(AIContext);
}
