import { Transaction } from './transaction';
import { Store } from './store';
import { Registry } from './registry';

export class Procedure {
  private steps: string[];
  private transaction = new Transaction();

  constructor(...steps: string[]) {
    this.steps = steps;
    Store.getInstance().set(this.transaction);
  }

  async run(initialProperties: { [key: string]: any }): Promise<{ [key: string]: any }> {
    // populate intiial properties into transaction
    for (let key in initialProperties) {
      this.transaction.setAttribute(key, initialProperties[key]);
    }

    for (const name of this.steps) {
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

    return this.transaction.fullDump();
  }
}