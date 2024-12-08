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

function buildCandle(values: number[]): Omit<Candle, "volume" | "date"> {
  const open = Math.round(100 * values[0]) / 100;
  const low = Math.round(100 * Math.min(...values)) / 100;
  const high = Math.round(100 * Math.max(...values)) / 100;
  const close = Math.round(100 * values[values.length - 1]) / 100;
  return { open, low, high, close };
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
  return representativeDays.map((repDay): Candle => {
    // Get all transactions for this day
    const todaysValues: number[] = [];
    while (row_i < rows.length && isSameGroup(rows[row_i][0], repDay)) {
      todaysValues.push(rows[row_i][1]);
      row_i += 1;
    }

    const volume = todaysValues.length;

    return {
      date: repDay,
      volume,
      ...buildCandle(todaysValues),
    };
  });
}
