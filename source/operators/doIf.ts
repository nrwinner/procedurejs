import { Operator, Procedure } from '../procedure';
import { Transaction } from '../transaction';

export default function doIf(prop: { [key: string]: boolean | ((x) => boolean | Promise<boolean>) }) {
  const [key, predicate] = Object.entries(prop)[0]

  return async (transaction: Transaction, procedure: () => Promise<Transaction>) => {
    const value = transaction.getAttribute(key);
    
    if ((typeof predicate === 'function' && predicate(value)) || (typeof predicate !== 'function' && predicate)) {
      const newTransaction = await procedure();
      transaction.concat(newTransaction, true);
    }
  }
}