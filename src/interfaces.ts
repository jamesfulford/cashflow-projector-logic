export enum RuleType {
  INCOME = "income",
  EXPENSE = "expense",
}

export type BaseRule = {
  id: string;
  name: string;
};
export type BaseRecurringRule = BaseRule & {
  rrule: string;
  value: number;
  exceptions: string[];
};
export type IncomeRule = BaseRecurringRule & { type: RuleType.INCOME };
export type ExpenseRule = BaseRecurringRule & { type: RuleType.EXPENSE };

export type IApiRule = IncomeRule | ExpenseRule;

export interface IApiTransaction {
  rule_id: string;
  id: string;
  name: string;
  value: number;
  day: string;
  calculations: {
    balance: number;
    working_capital: number;
  };
}

export interface IParameters {
  startDate: string;
  endDate: string;
  startingBalance: number;
}
