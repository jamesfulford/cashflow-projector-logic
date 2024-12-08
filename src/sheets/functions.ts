import { RRuleSet, rrulestr } from "rrule";
import { IApiRule, IParameters, RuleType } from "../interfaces";
import { fromDateToString } from "../rrule";
import { computeTransactions } from "../transactions";

export type RuleRow = [string, string, number];
export type TransactionRow = [string, string, number, number, number];
export type TransactionRows = [string[], ...TransactionRow[]];

export function COMPUTE_TRANSACTIONS(
  rules: RuleRow[],
  startDate: Date,
  endDate: Date,
  startingBalance: number = 0
): TransactionRows {
  const rs = rules.map(([name, rrule, value]): IApiRule => {
    return {
      id: name,
      name,
      rrule,
      value,
      type: value > 0 ? RuleType.INCOME : RuleType.EXPENSE,
      exceptions: [],
    };
  });

  const parameters: IParameters = {
    startDate: fromDateToString(startDate),
    endDate: fromDateToString(endDate),
    startingBalance,
  };
  const transactions = computeTransactions(rs, parameters);

  return [
    ["day", "name", "value", "balance", "working capital"],
    ...transactions.map((t): TransactionRow => {
      return [
        t.day,
        t.name,
        t.value,
        t.calculations.balance,
        t.calculations.working_capital,
      ];
    }),
  ];
}

export function INTERPRET_RRULES(rrulestrings: string[], startDate: Date) {
  return rrulestrings.map((rrulestring) => {
    try {
      const rruleset = rrulestr(rrulestring, {
        forceset: true,
      }) as RRuleSet;
      const last = rruleset.before(startDate);
      const next = rruleset.after(startDate, true);
      if (last && next) {
        return `Last was ${fromDateToString(
          last
        )}, next will be ${fromDateToString(next)}`;
      } else if (last) {
        return `Last was ${fromDateToString(last)}, no more expected`;
      } else if (next) {
        return `Next will be ${fromDateToString(next)}`;
      } else {
        return `Never did or will happen.`;
      }
    } catch (e) {
      return e.toString();
    }
  });
}

// TODO:
// - transactions to candles
// - better display rrules
// - summarize rules based on transactions
// - display versus compute end date
// - suggest end date
