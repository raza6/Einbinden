import { useEffect, useMemo, useRef } from 'react';
import config from './config';

const debounce = (func: Function, timeout = 300): Function => {
  let timer: number;
  return (...args: any) => {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(context, args); }, timeout);
  };
};

const useDebounce = (callback: Function): Function => {
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

const useHasChanged = (value: any): boolean => {
  const previousValue = usePrevious(value);
  return previousValue !== value;
};

const getRandomOfList = (list: Array<string>): string => {
  return list[Math.floor((Math.random()*list.length))];
}

const selectCover = (coverUrl: string): string => {
  if (coverUrl === '') {
    return `${import.meta.env.BASE_URL}nocover.png`;
  } else if (coverUrl.startsWith('/static')) {
    return `${config.API_URL}${coverUrl}`;
  } else {
    return coverUrl;
  }
}

export { debounce, useDebounce, getRandomOfList, useHasChanged, selectCover };