import { COMPUTE_TRANSACTIONS, INTERPRET_RRULE } from "./functions";

describe("COMPUTE_TRANSACTIONS", () => {
  test("should compute transactions correctly", () => {
    const rules = [
      ["name", "rrule", "value"],
      ["Rent", "FREQ=MONTHLY;BYMONTHDAY=1", -2100],
      ["Salary", "FREQ=MONTHLY;BYMONTHDAY=15", 5000],
    ] as [string, string, number][];
    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-12-31");
    const startingBalance = 1000;

    const result = COMPUTE_TRANSACTIONS(
      rules,
      startDate,
      endDate,
      startingBalance
    );

    expect(result).toEqual([
      ["day", "name", "value", "balance", "working capital"],
      ["2025-01-01", "Rent", -2100, -1100, -1100],
      ["2025-01-15", "Salary", 5000, 3900, -1100],
      ["2025-02-01", "Rent", -2100, 1800, -1100],
      ["2025-02-15", "Salary", 5000, 6800, -1100],
      ["2025-03-01", "Rent", -2100, 4700, -1100],
      ["2025-03-15", "Salary", 5000, 9700, -1100],
      ["2025-04-01", "Rent", -2100, 7600, -1100],
      ["2025-04-15", "Salary", 5000, 12600, -1100],
      ["2025-05-01", "Rent", -2100, 10500, -1100],
      ["2025-05-15", "Salary", 5000, 15500, -1100],
      ["2025-06-01", "Rent", -2100, 13400, -1100],
      ["2025-06-15", "Salary", 5000, 18400, -1100],
      ["2025-07-01", "Rent", -2100, 16300, -1100],
      ["2025-07-15", "Salary", 5000, 21300, -1100],
      ["2025-08-01", "Rent", -2100, 19200, -1100],
      ["2025-08-15", "Salary", 5000, 24200, -1100],
      ["2025-09-01", "Rent", -2100, 22100, -1100],
      ["2025-09-15", "Salary", 5000, 27100, -1100],
      ["2025-10-01", "Rent", -2100, 25000, -1100],
      ["2025-10-15", "Salary", 5000, 30000, -1100],
      ["2025-11-01", "Rent", -2100, 27800, -1100],
      ["2025-11-15", "Salary", 5000, 32800, -1100],
      ["2025-12-01", "Rent", -2100, 30700, -1100],
      ["2025-12-15", "Salary", 5000, 35700, -1100],
    ]);
  });
});

describe("INTERPRET_RRULE", () => {
  test("should interpret rrule correctly", () => {
    const rrulestring = "FREQ=MONTHLY;BYMONTHDAY=1";
    const startDate = new Date("2025-01-01");

    const result = INTERPRET_RRULE(rrulestring, startDate);

    expect(result).toBe("Last was 2024-12-01, next will be 2025-01-01");
  });

  test("should handle invalid rrule", () => {
    const rrulestring = "INVALID_RRULE";
    const startDate = new Date("2025-01-01");

    const result = INTERPRET_RRULE(rrulestring, startDate);

    expect(result).toBe("Error: Invalid rrule");
  });
});
