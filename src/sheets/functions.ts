import { RRule, RRuleSet, rrulestr } from "rrule";
import { IApiRule, IParameters, RuleType } from "../interfaces";
import { fromDateToString, fromStringToDate } from "../rrule";
import { computeTransactions } from "../transactions";
import { Candle, computeCandles } from "../candles";

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

export function INTERPRET_RRULES(rrulestrings: string[][], startDate: Date) {
  function getPlayoutInfo(rruleset: RRuleSet) {
    try {
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
  }
  return rrulestrings.map(([rrulestring]) => {
    try {
      const rruleset = rrulestr(rrulestring, {
        forceset: true,
      }) as RRuleSet;
      return [rruleset.rrules()[0].toText(), getPlayoutInfo(rruleset)];
    } catch (e) {
      return [e.toString()];
    }
  });
}

export function GROUP_TO_CANDLES(
  days: Date[][],
  values: number[][],
  groupBy: "day" | "week" | "month" | "quarter" | "year",
  startDate: Date,
  endDate: Date,
  startValue: number,
  candleField: keyof Candle
) {
  if (days.length !== values.length)
    throw new Error("Must have same number of days and values.");
  const rows = days
    .map(([day], i): [Date | string, number] => [day, values[i][0]])
    .filter(([day, value]) => day)
    .map(([day, value]): [Date, number] => [
      typeof day === "string" ? fromStringToDate(day) : day,
      value,
    ]);

  const candles = computeCandles(rows, groupBy, {
    startDate,
    endDate,
    startValue,
  });
  return [
    [groupBy + " of", candleField],
    ...candles.map((c) => [c.date, c[candleField]]),
  ];
}

export function COMPUTE_INCREASES(
  days: Date[][],
  values: number[][],
  startDate: Date
) {
  if (days.length !== values.length) {
    throw new Error("must compare same number of days as values");
  }
  const results: [Date, number, number][] = [];

  let previousValue = values[0][0];
  results.push([startDate, previousValue, 0]);
  days.forEach(([day], i) => {
    const [value] = values[i];
    if (value > previousValue) {
      const result: [Date, number, number] = [
        day,
        value,
        Math.round((value - previousValue) * 100) / 100,
      ];
      results.push(result);

      previousValue = value;
    }
  });

  return [["day", "increased value", "increased difference"], ...results];
}

export function APPLY_INCREASES(
  _increaseDates: [Date][],
  _increaseBalances: [number][],
  _projectCosts: [number][]
) {
  const increaseDates = _increaseDates.filter(([d]) => d);
  const increaseBalances = _increaseBalances.filter(([v]) => v);
  const projectCosts = _projectCosts.filter(([v]) => v);
  if (increaseDates.length !== increaseBalances.length) {
    throw new Error("increaseDates and increaseBalances must have same length");
  }

  let increaseIndex = 0;
  let balance = increaseBalances[0][0];
  const results = projectCosts.map(([cost]) => {
    balance -= cost;
    while (balance < 0) {
      // go to next increase
      increaseIndex += 1;
      if (increaseIndex >= increaseDates.length) {
        // too far in the future
        return [`after ${increaseDates[increaseDates.length - 1][0]}`, balance];
      }
      const increaseAmount =
        increaseBalances[increaseIndex][0] -
        increaseBalances[increaseIndex - 1][0];
      balance += increaseAmount;
    }
    return [increaseDates[increaseIndex][0], balance];
  });

  return [["funds ready date", "remaining capital"], ...results];
}

// TODO:
// - display versus compute end date
// - suggest end date
