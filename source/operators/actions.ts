import { Transaction } from '../transaction';
import { Procedure } from '../';
import { Operator } from '../procedure';

export type ActionOperator = (transaction: Transaction, procedure: () => Promise<Transaction>) => Promise<any>;

export default function actions(...actions: string[]) {

  return {
    apply: (...operators: ActionOperator[]) => {
      return async (transaction: Transaction) => {
        const procedure = async () => {
          return await new Procedure(...actions).run(transaction.attributes);
        };

        for (let op of operators) {
          await op(transaction, procedure);
        }
      }
    }
  }
}