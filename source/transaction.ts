import uuid from 'uuidv4';

export interface TransactionLogEntry {
  name: string;
  messages: { message: string, data?: any }[];
  error?: Error;
}

export class Transaction {
  id: string;
  error: boolean;

  private attributes: { [key: string]: any } = {};
  private log: TransactionLogEntry[] = [];

  constructor() {
    this.id = uuid();
  }

  getAttribute(attr: string): any {
    return this.attributes[attr];
  }

  setAttribute(attr: string, value: string): any {
    this.attributes[attr] = value
  }

  createLog(name: string) {
    this.log.push({ name, messages: [] });
  }

  addToLog(log: { message: string, data?: any }) {
    const activeLog = this.log.pop();
    activeLog.messages.push(log);
    this.log.push(activeLog);
  }

  transactionError(error: Error) {
    const activeLog = this.log.pop();
    activeLog.error = error
    this.log.push(activeLog);
    this.error = true;
  }

  fullDump() {
    // deep copy the object from makeDump juuuust to make sure there are no lingering references
    return Object.assign({}, this.makeDump());
  }

  attributeDump() {
    // deep copy this.attributes juuuust to make sure there are no lingering references
    return Object.assign({}, this.attributes);
  }

  concat(transaction: Transaction, attributes?: boolean) {
    if (attributes) {
      this.attributes = Object.assign(this.attributes, transaction.attributes);
    }

    this.log = this.log.concat(transaction.log);
  }

  private makeDump() {
    return {
      id: this.id,
      error: !!this.error,
      attributes: this.attributes,
      log: this.log
    }
  }
}