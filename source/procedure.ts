import { Transaction } from './transaction';
import { Store } from './store';
import { Registry } from './registry';

export class Procedure {
  private steps: (string | ((transaction) => string))[];
  private transaction = new Transaction();

  constructor(...steps: (string | ((transaction) => string))[]) {
    this.steps = steps;
    Store.getInstance().set(this.transaction);
  }

  async run(initialProperties: { [key: string]: any }): Promise<{ [key: string]: any }> {
    // populate intiial properties into transaction
    for (let key in initialProperties) {
      this.transaction.setAttribute(key, initialProperties[key]);
    }

    for (const action of this.steps) {
      let name: string;

      if (typeof action !== 'string') {
        name = action(this.transaction);
      } else {
        name = action;
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