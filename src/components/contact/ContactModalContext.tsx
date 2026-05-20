"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ContactModalContextValue = {
  openModal: () => void;
  closeModal: () => void;
  isOpen: boolean;
};

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ openModal, closeModal, isOpen }),
    [openModal, closeModal, isOpen],
  );

  return (
    <ContactModalContext.Provider value={value}>{children}</ContactModalContext.Provider>
  );
}

export function useContactModal() {
  const ctx = useContext(ContactModalContext);
  if (!ctx) {
    throw new Error("useContactModal debe usarse dentro de ContactModalProvider");
  }
  return ctx;
}
