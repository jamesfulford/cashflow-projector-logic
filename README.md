# cashflow-projector-logic

Add the power of recurring date rules to your budgeting spreadsheet.

## Setup

```bash
npm i && npm run bundle
```

In a Google Sheet,

1. Extensions > Apps Script
2. Paste `dist/bundle.js` into a new file called `bundle.gs`.
3. Paste `src/sheets/stubs.gs` into a new file called `stubs.gs`.
4. Use your new functions!

## Running Tests

To run the tests, use the following command:

```bash
npm test
```

## Concepts

A **transaction** is a payment that happens on a particular day. For example, paying $2100 (value) for rent (name) on Jan 1st 2025 (day).

A **rule** is a source of recurring transactions. For example, paying $2100 (value) for rent (name) on the 1st of every month (recurring rule, or **rrule** for short).

<!--
A **candle** is a summary of transactions in a time interval (often a day). For example, on Jan 1st 2025, there were 2 transactions that.
-->

## RRule Strings

Fun fact: RFC5545 "Recurrence Rule" texts are what are used for calendars (the .ical or .ics format). It's a powerful format!

Use these tools to generate RRule Strings:

- https://icalendar.org/rrule-tool.html
- https://jkbrzt.github.io/rrule/

Here's some examples:

Common expense patterns:

- Every Monday, Wednesday, and Friday: `FREQ=WEEKLY;BYDAY=MO,WE,FR` (like coffee, gas)
- Every 1st day of the month: `RRULE:FREQ=MONTHLY;BYMONTHDAY=1` (like bills/utilities, rent/mortgage, subscriptions)
- Every 6 months on the 10th: `RRULE:FREQ=MONTHLY;INTERVAL=6;BYMONTHDAY=10` (like car insurance)
- Every year on May 4th: `FREQ=YEARLY;INTERVAL=1;BYMONTH=5;BYMONTHDAY=4` (like yearly subscriptions, ROTH IRA contributions)

Common paycheck patterns:

- Every 2 weeks on Friday: `FREQ=WEEKLY;INTERVAL=2;BYDAY=FR`
- Every 1st and 15th of the month: `RRULE:FREQ=MONTHLY;BYMONTHDAY=1,15`
- On the last day of the month: `RRULE:FREQ=MONTHLY;BYMONTHDAY=-1`

Note: if an RRule says "INTERVAL" (how we say things like 'every 2 weeks' instead of 'every 1 week') and is more than 1, it would be good to also specify a "DTSTART" (start date) so the dates don't shift on you when you change what day to start computing with.

Note: this tool can handle "RRule Sets", which means can specify "RDATE" and "EXDATE" lists too, to manually include and exclude dates.

Note: this tool ignores times and timezones.

## Dates

We tend to use the date format "YYYY-MM-DD". For instance, January 15th 2025 would be "2025-01-15". This is the ISO8601 standard format for dates.

This format is especially nice because sorting these values is the same as sorting the dates. Also, there tends to be less confusion between those who are used to month first (US, typically) and those who are used to day first (India, among other locales).

In Google Sheets, most of the time, you can use formatting to have Google Sheets show this format date in whatever format you prefer. However, some of our tools put dates in the middle of messages.

## Documentation

### COMPUTE_TRANSACTIONS

Inputs: COMPUTE_TRANSACTIONS(rules, startDate: Date, endDate: Date, startingBalance: number)

Where rules is a region 3-wide with columns "name", "rrule", and "value" and includes the header row.

name: a unique name to track which rule a transaction comes from
rrule: a valid rrule string, see "RRule Strings"
value: a number. Positive means income, negative means expense. (Currency-agnostic)

### INTERPRET_RRULE
