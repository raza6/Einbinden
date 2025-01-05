import { useEffect, useMemo, useRef } from 'react';

const debounce = (func: Function, timeout = 300): Function => {
  let timer: number;
  return (...args: any) => {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(context, args); }, timeout);
  };
};

function useDebounce(callback: Function) {
  const ref = useRef(undefined);

  useEffect(() => {
    // @ts-ignore
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = (...args: any[]) => {
      // @ts-ignore
      ref.current?.(...args);
    };

    return debounce(func, 300);
  }, []);

  return debouncedCallback;
}

const usePrevious = (value: any) => {
  const ref = useRef(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const useHasChanged= (value: any) => {
  const previousValue = usePrevious(value);
  return previousValue !== value;
};

function getRandomOfList (list: Array<string>): string {
  return list[Math.floor((Math.random()*list.length))];
}

export { debounce, useDebounce, getRandomOfList, useHasChanged };