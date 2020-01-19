import { Transaction } from './transaction';
import { Store } from './store';
import { Registry } from './registry';

export type Operator = (transaction: Transaction) => Promise<any>

export class Procedure {
  private steps: (string | Operator)[];
  transaction = new Transaction();

  constructor(...steps: (string | Operator)[]) {
    this.steps = steps;
    Store.getInstance().set(this.transaction);
  }

  async run(initialProperties: { [key: string]: any }): Promise<Transaction> {
    // populate intiial properties into transaction
    for (let key in initialProperties) {
      this.transaction.setAttribute(key, initialProperties[key]);
    }

    for (const step of this.steps) {
      let name: string;

      if (typeof step !== 'string') {
        await step(this.transaction);
        continue;
      } else {
        name = step;
      }

      this.transaction.createLog(name);

      let result: { [key: string]: any };

      try {
        result = await Registry.getInstance().get(name)(this.transaction.id);
      } catch (error) {
        Store.getInstance().destroy(this.transaction.id);
        this.transaction.transactionError(error);
        return Promise.reject(this.transaction.fullDump());
      }

      for (let key in result) {
        this.transaction.setAttribute(key, result[key])
      }
    }

    Store.getInstance().destroy(this.transaction.id);

    return this.transaction;
  }
}