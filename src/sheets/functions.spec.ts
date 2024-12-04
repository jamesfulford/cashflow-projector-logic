import { COMPUTE_TRANSACTIONS, INTERPRET_RRULE } from "./functions";

describe("COMPUTE_TRANSACTIONS", () => {
  it("should compute transactions for a single rule", () => {
    const rules = [
      ["name", "rrule", "value"],
      ["Rent", "RRULE:FREQ=MONTHLY;BYMONTHDAY=1", -2100],
    ];
    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-03-01");
    const startingBalance = 5000;

    const result = COMPUTE_TRANSACTIONS(rules, startDate, endDate, startingBalance);

    expect(result).toEqual([
      ["day", "name", "value", "balance", "working capital"],
      ["2025-01-01", "Rent", -2100, 2900, 2900],
      ["2025-02-01", "Rent", -2100, 800, 800],
    ]);
  });

  it("should compute transactions for multiple rules", () => {
    const rules = [
      ["name", "rrule", "value"],
      ["Rent", "RRULE:FREQ=MONTHLY;BYMONTHDAY=1", -2100],
      ["Salary", "RRULE:FREQ=MONTHLY;BYMONTHDAY=15", 3000],
    ];
    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-03-01");
    const startingBalance = 5000;

    const result = COMPUTE_TRANSACTIONS(rules, startDate, endDate, startingBalance);

    expect(result).toEqual([
      ["day", "name", "value", "balance", "working capital"],
      ["2025-01-01", "Rent", -2100, 2900, 2900],
      ["2025-01-15", "Salary", 3000, 5900, 2900],
      ["2025-02-01", "Rent", -2100, 3800, 2900],
      ["2025-02-15", "Salary", 3000, 6800, 2900],
    ]);
  });

  it("should compute transactions with different date ranges", () => {
    const rules = [
      ["name", "rrule", "value"],
      ["Rent", "RRULE:FREQ=MONTHLY;BYMONTHDAY=1", -2100],
    ];
    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-01-15");
    const startingBalance = 5000;

    const result = COMPUTE_TRANSACTIONS(rules, startDate, endDate, startingBalance);

    expect(result).toEqual([
      ["day", "name", "value", "balance", "working capital"],
      ["2025-01-01", "Rent", -2100, 2900, 2900],
    ]);
  });

  it("should compute transactions with different starting balances", () => {
    const rules = [
      ["name", "rrule", "value"],
      ["Rent", "RRULE:FREQ=MONTHLY;BYMONTHDAY=1", -2100],
    ];
    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-03-01");
    const startingBalance = 10000;

    const result = COMPUTE_TRANSACTIONS(rules, startDate, endDate, startingBalance);

    expect(result).toEqual([
      ["day", "name", "value", "balance", "working capital"],
      ["2025-01-01", "Rent", -2100, 7900, 7900],
      ["2025-02-01", "Rent", -2100, 5800, 5800],
    ]);
  });
});

describe("INTERPRET_RRULE", () => {
  it("should interpret a daily recurrence rule", () => {
    const rrule = "FREQ=DAILY";
    const startDate = new Date("2025-01-01");

    const result = INTERPRET_RRULE(rrule, startDate);

    expect(result).toBe("Last was 2024-12-31, next will be 2025-01-01");
  });

  it("should interpret a weekly recurrence rule", () => {
    const rrule = "FREQ=WEEKLY;BYDAY=MO";
    const startDate = new Date("2025-01-01");

    const result = INTERPRET_RRULE(rrule, startDate);

    expect(result).toBe("Last was 2024-12-30, next will be 2025-01-06");
  });

  it("should interpret a monthly recurrence rule", () => {
    const rrule = "FREQ=MONTHLY;BYMONTHDAY=1";
    const startDate = new Date("2025-01-01");

    const result = INTERPRET_RRULE(rrule, startDate);

    expect(result).toBe("Last was 2024-12-01, next will be 2025-01-01");
  });

  it("should interpret a yearly recurrence rule", () => {
    const rrule = "FREQ=YEARLY;BYMONTH=1;BYMONTHDAY=1";
    const startDate = new Date("2025-01-01");

    const result = INTERPRET_RRULE(rrule, startDate);

    expect(result).toBe("Last was 2024-01-01, next will be 2025-01-01");
  });

  it("should handle invalid recurrence rule", () => {
    const rrule = "INVALID_RRULE";
    const startDate = new Date("2025-01-01");

    const result = INTERPRET_RRULE(rrule, startDate);

    expect(result).toBe("Error: Invalid rrule: INVALID_RRULE");
  });
});
