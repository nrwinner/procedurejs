import uuid from 'uuidv4';
import { Registry } from '../registry';
import { Transaction } from '../transaction';
import { Procedure } from '..';

export default function doIf(data: { [key: string]: (x: any) => boolean }): (x: Transaction) => boolean {
  const [key, predicate] = Object.entries(data)[0];

  return (transaction: Transaction): boolean => {
    return predicate(transaction.getAttribute(key));
  }
}