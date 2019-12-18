import { Transaction } from "../transaction"

export default function actions(...actions: string[]) {


  return {
    apply: (...steps: Function[]) => {
      return async (transaction: Transaction): Promise<string> => {
        let result: string;

        for (let step of steps) {
          const stepResult = await step(transaction, actions);

          if (!stepResult) {
            return undefined;
          } else {
            result = stepResult;
          }
        }

        return result;
      }
    }
  }
}