import { IApiTransaction } from "./interfaces";
import { eachDayOfInterval } from "date-fns/eachDayOfInterval";
import { format } from "date-fns/format";
import { fromDateToString } from "./rrule";

interface ComputationalParameters {
  startDate: Date;
  endDate: Date;
  startValue: number;
}

export interface Candle {
  date: Date;

  open: number;
  low: number;
  high: number;
  close: number;

  volume: number;
}

export function computeCandles(
  _rows: [Date, number][],
  groupBy: "day" | "week" | "month" | "quarter" | "year",
  parameters: ComputationalParameters
): Candle[] {
  if (_rows.length === 0) return [];

  function isSameGroup(a: Date, b: Date) {
    switch (groupBy) {
      case "day":
        return format(a, "yyyy-MM-dd") == format(b, "yyyy-MM-dd");
      case "month":
        return format(a, "yyyy-MM") == format(b, "yyyy-MM");
      case "quarter":
        return format(a, "yyyy-qq") == format(b, "yyyy-qq");
      case "week":
        return format(a, "YYYY-ww") == format(b, "YYYY-ww");
      case "year":
        return format(a, "yyyy") == format(b, "yyyy");
    }
  }

  const rows: [Date, number][] = [
    [parameters.startDate, parameters.startValue],
    ..._rows,
  ];

  const days = eachDayOfInterval({
    // date-fns applies a timezone offset if you include a Z here
    start: fromDateToString(parameters.startDate) + "T00:00:00",
    end: fromDateToString(parameters.endDate) + "T00:00:00",
  });

  //   first day in range that fits in a group
  // (if groupBy="month", )
  const representativeDays: Date[] = [];
  days.forEach((day) => {
    const firstDayInDayGroup = representativeDays.at(-1);
    if (!firstDayInDayGroup || !isSameGroup(firstDayInDayGroup, day)) {
      representativeDays.push(day);
    }
  });

  let row_i = 0; // for traversing `rows`
  let lastValue = parameters.startValue;
  return representativeDays.map((repDay): Candle => {
    const open = lastValue;

    // Get all transactions for this day
    const todaysValues: number[] = [];
    while (row_i < rows.length && isSameGroup(rows[row_i][0], repDay)) {
      const value = rows[row_i][1];
      lastValue = value;
      todaysValues.push(value);
      row_i += 1;
    }

    const volume = todaysValues.length;
    const low = Math.min(...todaysValues);
    const high = Math.max(...todaysValues);

    return {
      date: repDay,
      volume,

      open,
      close: lastValue,
      high,
      low,
    };
  });
}
