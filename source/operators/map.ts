import uuid from 'uuidv4';
import { Registry } from '../registry';
import { Transaction } from '../transaction';
import { Procedure } from '..';

export default function map(...actions: string[]): MapProcedure{
  return new MapProcedure(actions)
}

class MapProcedure {
  constructor(
    private actions: string[],
    public actionName = uuid()
  ) { }

  forEach(data: { [key: string]: string }): (transaction) => string {
    let [key, collectionName] = Object.entries(data)[0];

    return (transaction: Transaction) => {
      const newActionName = uuid();

      Registry.getInstance().set(newActionName, async () => {
        let collection = transaction.getAttribute(collectionName);

        collection = await Promise.all(collection.map(async c => {
          return new Procedure(...this.actions).run({ [key]: c }).then((childTransaction: Transaction) => {
            transaction.concat(childTransaction); 
            return childTransaction.getAttribute(key);
          });
        }))

        return  { [collectionName]: collection }
      });

      return newActionName;
    }
  }
}