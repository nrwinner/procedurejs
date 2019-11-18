import { Transaction } from './transaction';

export class Store {
  private transactions = new Map<string, Transaction> ();

  private static _instance: Store;

  private constructor() { }

  static getInstance(): Store {
    if (!this._instance) {
      this._instance = new Store();
    }

    return this._instance;
  }

  get(id: string): Transaction {
    return this.transactions.get(id);
  }

  set(transaction: Transaction): void {
    this.transactions.set(transaction.id, transaction);
  }

  destroy(id: string) {
    this.transactions.delete(id);
  }
}