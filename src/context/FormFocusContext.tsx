import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { TextInput } from 'react-native';

type FieldRef = React.RefObject<TextInput | null>;

type FormFocusContextValue = {
  registerField: (index: number, ref: FieldRef) => void;
  unregisterField: (index: number) => void;
  setActiveIndex: (index: number) => void;
  focusNext: () => void;
  hasNext: boolean;
  activeIndex: number;
};

const FormFocusContext = createContext<FormFocusContextValue | null>(null);

export function FormFocusProvider({ children }: { children: React.ReactNode }) {
  const fields = useRef<Map<number, FieldRef>>(new Map());
  const [activeIndex, setActiveIndex] = useState(-1);

  const registerField = useCallback((index: number, ref: FieldRef) => {
    fields.current.set(index, ref);
  }, []);

  const unregisterField = useCallback((index: number) => {
    fields.current.delete(index);
  }, []);

  const hasNext = activeIndex >= 0 && fields.current.has(activeIndex + 1);

  const focusNext = useCallback(() => {
    const nextRef = fields.current.get(activeIndex + 1);
    nextRef?.current?.focus();
  }, [activeIndex]);

  const value = useMemo(
    () => ({
      registerField,
      unregisterField,
      setActiveIndex,
      focusNext,
      hasNext,
      activeIndex,
    }),
    [registerField, unregisterField, focusNext, hasNext, activeIndex],
  );

  return <FormFocusContext.Provider value={value}>{children}</FormFocusContext.Provider>;
}

export function useFormFocus() {
  return useContext(FormFocusContext);
}
