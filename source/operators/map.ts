import uuid from 'uuidv4';
import { Registry } from '../registry';
import { Transaction } from '../transaction';
import { Procedure } from '..';

export default function map(data: { [key: string]: string }, predicate?: (x?: any) => boolean) {
  const [key, collectionName] = Object.entries(data)[0];
  const newActionName = uuid();

  return (transaction: Transaction, actions: string[]) => {
    
    Registry.getInstance().set(newActionName, async () => {
      let collection = transaction.getAttribute(collectionName);

      collection = await Promise.all(collection.map(async c => {
        if (!predicate || predicate(c)) {
          return new Procedure(...actions).run({ [key]: c }).then((childTransaction: Transaction) => {
            transaction.concat(childTransaction); 
            return childTransaction.getAttribute(key);
          });
        }

        return c;
      }))

      return  { [collectionName]: collection }
    });

    return newActionName;
  }
}