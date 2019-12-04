import { Registry } from './registry';

export default function action(name) {
  return function decorator(_, __, descriptor) {
    const original = descriptor.value;
    if (typeof original === 'function') {
      descriptor.value = function(...args) {
        return original.apply(this, args);
      }

      // add the function to the global action registry
      Registry.getInstance().set(name, descriptor.value);
    }
    return descriptor;
  };
}