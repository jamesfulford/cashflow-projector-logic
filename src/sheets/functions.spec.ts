import { COMPUTE_TRANSACTIONS, INTERPRET_RRULES, RuleRow } from "./functions";

describe("COMPUTE_TRANSACTIONS", () => {
  it("should compute transactions for a single rule", () => {
    const rules: RuleRow[] = [
      ["Rent", "RRULE:FREQ=MONTHLY;BYMONTHDAY=1", -2100],
    ];
    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-03-01");
    const startingBalance = 5000;

    const result = COMPUTE_TRANSACTIONS(
      rules,
      startDate,
      endDate,
      startingBalance
    );

    expect(result).toEqual([
      ["day", "name", "value", "balance", "working capital"],
      ["2025-01-01", "Rent", -2100, 2900, 800],
      ["2025-02-01", "Rent", -2100, 800, 800],
    ]);
  });

  it("should compute transactions for multiple rules", () => {
    const rules: RuleRow[] = [
      ["Rent", "RRULE:FREQ=MONTHLY;BYMONTHDAY=1", -2100],
      ["Salary", "RRULE:FREQ=MONTHLY;BYMONTHDAY=15", 3000],
    ];
    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-03-01");
    const startingBalance = 5000;

    const result = COMPUTE_TRANSACTIONS(
      rules,
      startDate,
      endDate,
      startingBalance
    );

    expect(result).toEqual([
      ["day", "name", "value", "balance", "working capital"],
      ["2025-01-01", "Rent", -2100, 2900, 2900],
      ["2025-01-15", "Salary", 3000, 5900, 3800],
      ["2025-02-01", "Rent", -2100, 3800, 3800],
      ["2025-02-15", "Salary", 3000, 6800, 6800],
    ]);
  });

  it("should compute transactions with different date ranges", () => {
    const rules: RuleRow[] = [
      ["Rent", "RRULE:FREQ=MONTHLY;BYMONTHDAY=1", -2100],
    ];
    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-01-15");
    const startingBalance = 5000;

    const result = COMPUTE_TRANSACTIONS(
      rules,
      startDate,
      endDate,
      startingBalance
    );

    expect(result).toEqual([
      ["day", "name", "value", "balance", "working capital"],
      ["2025-01-01", "Rent", -2100, 2900, 2900],
    ]);
  });

  it("should compute transactions with different starting balances", () => {
    const rules: RuleRow[] = [
      ["Rent", "RRULE:FREQ=MONTHLY;BYMONTHDAY=1", -2100],
    ];
    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-03-01");
    const startingBalance = 10000;

    const result = COMPUTE_TRANSACTIONS(
      rules,
      startDate,
      endDate,
      startingBalance
    );

    expect(result).toEqual([
      ["day", "name", "value", "balance", "working capital"],
      ["2025-01-01", "Rent", -2100, 7900, 5800],
      ["2025-02-01", "Rent", -2100, 5800, 5800],
    ]);
  });
});

describe("INTERPRET_RRULE", () => {
  it("should interpret a daily recurrence rule", () => {
    const rrules = ["FREQ=DAILY"];
    const startDate = new Date("2025-01-01");

    const result = INTERPRET_RRULES(rrules, startDate);

    expect(result).toEqual(["Last was 2024-12-31, next will be 2025-01-01"]);
  });

  it("should interpret a weekly recurrence rule", () => {
    const rrules = ["FREQ=WEEKLY;BYDAY=MO"];
    const startDate = new Date("2025-01-01");

    const result = INTERPRET_RRULES(rrules, startDate);

    expect(result).toEqual(["Last was 2024-12-30, next will be 2025-01-06"]);
  });

  it("should interpret a monthly recurrence rule", () => {
    const rrules = ["FREQ=MONTHLY;BYMONTHDAY=1"];
    const startDate = new Date("2025-01-01");

    const result = INTERPRET_RRULES(rrules, startDate);

    expect(result).toEqual(["Next will be 2025-01-01"]);
  });

  it("should interpret a yearly recurrence rule", () => {
    const rrules = ["FREQ=YEARLY;BYMONTH=1;BYMONTHDAY=1"];
    const startDate = new Date("2025-01-01");

    const result = INTERPRET_RRULES(rrules, startDate);

    expect(result).toEqual(["Next will be 2025-01-01"]);
  });

  it("should handle invalid recurrence rule", () => {
    const rrules = ["INVALID_RRULE"];
    const startDate = new Date("2025-01-01");

    const result = INTERPRET_RRULES(rrules, startDate);

    expect(result).toEqual(["Error: Unknown RRULE property 'INVALID_RRULE'"]);
  });
});
