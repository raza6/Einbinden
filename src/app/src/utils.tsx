import { useEffect, useMemo, useRef } from 'react';

const debounce = (func: Function, timeout = 300): Function => {
  let timer: NodeJS.Timeout;
  return (...args: any) => {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(context, args); }, timeout);
  };
};

function useDebounce(callback: Function) {
  const ref = useRef();

  useEffect(() => {
    // @ts-ignore
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = () => {
      // @ts-ignore
      ref.current?.();
    };

    return debounce(func, 300);
  }, []);

  return debouncedCallback;
}

function getRandomOfList (list: Array<string>): string {
  return list[Math.floor((Math.random()*list.length))];
}

export { debounce, useDebounce, getRandomOfList };