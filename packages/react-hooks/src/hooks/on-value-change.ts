import React, {useEffect} from 'react';

export function useOnValueChange<T>(
  value: T,
  onChange: (value: T, oldValue: T) => void,
) {
  const tracked = React.useRef(value);
  const oldValue = tracked.current;

  useEffect(() => {
    if (value !== oldValue) {
      tracked.current = value;
      onChange(value, oldValue);
    }
  }, [oldValue, onChange, value]);
}
