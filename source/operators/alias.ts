import { Transaction } from "../transaction";
import { Operator } from "../procedure";

export default function alias(prop1: string, alias: string): Operator {
  return async (transaction: Transaction) => {
    transaction.setAttribute(alias, transaction.getAttribute(prop1));
  }
}