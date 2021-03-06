import {ChangeEvent} from 'react';
import get from 'get-value';

import {
  Validates,
  Validator,
  FieldOutput,
  FieldDictionary,
  Field,
  FormError,
} from './types';

export function isField<T extends object>(
  input: FieldOutput<T>,
): input is Field<T> {
  return (
    Object.prototype.hasOwnProperty.call(input, 'value') &&
    Object.prototype.hasOwnProperty.call(input, 'onChange') &&
    Object.prototype.hasOwnProperty.call(input, 'onBlur') &&
    Object.prototype.hasOwnProperty.call(input, 'defaultValue')
  );
}

export function mapObject<Output>(
  input: any,
  mapper: (value: any, key: any) => any,
) {
  return Object.keys(input).reduce((accumulator: any, key) => {
    const value = input[key];
    accumulator[key] = mapper(value, key);
    return accumulator;
  }, {}) as Output;
}

export function normalizeValidation<Value, Context extends object = {}>(
  input: Validates<Value, Context>,
): Validator<Value, Context>[] {
  return Array.isArray(input) ? input : [input];
}

export function isChangeEvent(
  value: any,
): value is ChangeEvent<HTMLInputElement> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Reflect.has(value, 'target') &&
    Reflect.has(value.target, 'value')
  );
}

export function propagateErrors(
  fieldBag: {[key: string]: FieldOutput<any>},
  errors: FormError[],
) {
  errors.forEach(error => {
    if (error.field == null) {
      return;
    }

    const got = get(fieldBag, error.field);

    if (got && isField(got)) {
      if (got.error !== error.message) {
        got.setError(error.message);
      }
    }
  });
}

export function validateAll(fieldBag: {[key: string]: FieldOutput<any>}) {
  const fields = Object.values(fieldBag);
  const errors: FormError[] = [];

  function validate(field: Field<unknown>) {
    const message = field.runValidation();
    if (message) {
      errors.push({message});
    }
  }

  function validateDictionary(fields: FieldDictionary<any>) {
    Object.values(fields).forEach(validate);
  }

  for (const item of fields) {
    if (isField(item)) {
      validate(item);
    } else if (Array.isArray(item)) {
      item.map(validateDictionary);
    } else {
      validateDictionary(item);
    }
  }

  return errors;
}

export function noop() {}

export function shallowArrayComparison(arrA: unknown[], arrB: any) {
  if (arrA === arrB) {
    return true;
  }

  if (!arrA || !arrB) {
    return false;
  }

  const len = arrA.length;

  if (arrB.length !== len) {
    return false;
  }

  for (let i = 0; i < len; i++) {
    if (arrA[i] !== arrB[i]) {
      return false;
    }
  }

  return true;
}

export function defaultDirtyComparator<Value>(
  defaultValue: Value,
  newValue: Value,
): boolean {
  return Array.isArray(defaultValue)
    ? !shallowArrayComparison(defaultValue, newValue)
    : defaultValue !== newValue;
}
