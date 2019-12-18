import uuid from 'uuidv4';
import { Registry } from '../registry';
import { Transaction } from '../transaction';
import { Procedure } from '..';

export default function map(...actions: string[]): MapProcedure{
  return new MapProcedure(actions)
}

class MapProcedure {
  private predicate?: (x: any) => boolean;

  constructor(
    private actions: string[]
  ) { }

  forEach(data: { [key: string]: string }): (transaction) => string {
    let [key, collectionName] = Object.entries(data)[0];

    return (transaction: Transaction) => {
      const newActionName = uuid();

      Registry.getInstance().set(newActionName, async () => {
        const originalCollection = transaction.getAttribute(collectionName);
        let collection = Array.from(originalCollection);

        collection = await Promise.all(collection.map(async c => {
          if (!this.predicate || this.predicate(c)) {
            return new Procedure(...this.actions).run({ [key]: c }).then((childTransaction: Transaction) => {
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

  filter(predicate: (x: any) => boolean) {
    this.predicate = predicate;
    return this;
  }
}