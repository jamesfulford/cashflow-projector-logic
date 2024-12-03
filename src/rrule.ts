import { parseISO } from "date-fns/parseISO";
import { RRuleSet, rrulestr } from "rrule";
import { IApiRule } from "./interfaces";

export function fromStringToDate(datestring: string): Date {
  return parseISO(datestring + "T00:00:00");
}
export function fromDateToString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getDatesOfRRule(
  rrulestring: string | undefined,
  startDate: string,
  endDate: string
): string[] {
  if (!rrulestring) return [];

  const rruleset = rrulestr(rrulestring, {
    forceset: true,
  }) as RRuleSet;

  // bug: rrulestr sets default dtstart to the present time,
  // which breaks our reconciliation use case.
  // override it in the rrule.
  const rrule = rruleset.rrules()[0];

  if (!rrule.origOptions.dtstart)
    rrule.options.dtstart = fromStringToDate(startDate);

  // bug: `between` uses current time-of-day on all dates,
  // causing all the ex-dates to be ignored.
  // I've tried to tell it to use the right time of day, but with no luck.
  // so, here we are, implementing exdates manually.
  const exdates = new Set(rruleset.exdates().map(fromDateToString));
  const dates = rrule
    .between(fromStringToDate(startDate), fromStringToDate(endDate), true)
    .map(fromDateToString)
    .filter((d) => !exdates.has(d));

  return dates;
}

export function getDatesOfRule(
  rule: IApiRule,
  startDate: string,
  endDate: string
): string[] {
  const dates = getDatesOfRRule(rule.rrule, startDate, endDate);
  return dates.sort();
}
