import { Store } from './store';

export default function resolve(...props: string[]) {
  return function decorator(_, __, descriptor) {
    const original: Function = descriptor.value;

    if (typeof original === 'function') {
      descriptor.value = function(transactionId: string, ...args: any[]) {
        let properties = {};

        // if we didn't pass parameters or the first parameter isn't a string, call the original function without attempting to resolve
        if (!transactionId || typeof transactionId !== 'string') {
          return original.apply(this, [ transactionId, ...args ])
        }
        
        const transaction = Store.getInstance().get(transactionId);
        
        // if we couldn't find a transaction for the given parameter, call the original function without attempting to resolve
        if (!transaction) {
          transaction.addToLog({ message: 'unable to find transaction for ' + transactionId + ', not attempting to resolve' })
          return original.apply(this, [ transactionId, ...args ])
        }

        // resolve the requested properties from the transaction
        for (const p of props) {
          properties[p] = transaction.getAttribute(p);
        }

        // create an optional log parameter that the target function can use to manually add logs to the active transaction
        const log = (message: string, data?: any) => {
          transaction.addToLog({ message, data });
        }
        
        return original.apply(this, [ properties, log ])
      }
    }
  }
}