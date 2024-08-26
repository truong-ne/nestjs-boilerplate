import { DateDigit, ETimeFilter } from '@lib/common/enums';
import * as moment from 'moment';
import { NumberHelper } from './number.helper';

export class DatetimeHelper {
  static dateDiff(
    start: Date | string,
    end: Date | string,
    digit: moment.unitOfTime.Diff,
  ): number {
    const diff = moment(end).diff(moment(start), digit);
    return diff;
  }

  static convertDateToSecond(date: Date): number {
    return NumberHelper.round(new Date(date).getTime() / 1000, 0);
  }

  static addTime(
    period: number,
    digit: moment.unitOfTime.Diff,
    date = new Date(),
  ): Date {
    return moment(date).add(period, digit).toDate();
  }

  static subTime(
    period: number,
    digit: moment.unitOfTime.Diff,
    date = new Date(),
  ): Date {
    return moment(date).subtract(period, digit).toDate();
  }

  static convertDateToUTC(date: Date | string): Date {
    return moment(date || new Date())
      .utc()
      .toDate();
  }

  static timeFilter(date: Date, timeFilter: ETimeFilter): Date {
    const resDate = {
      [ETimeFilter.Today]: this.subTime(1, DateDigit.Day, date),
      [ETimeFilter.OneWeek]: this.subTime(7, DateDigit.Day, date),
      [ETimeFilter.OneMonth]: this.subTime(1, DateDigit.Month, date),
      [ETimeFilter.ThreeMonths]: this.subTime(3, DateDigit.Month, date),
      [ETimeFilter.SixMonths]: this.subTime(6, DateDigit.Month, date),
      [ETimeFilter.OneYear]: this.subTime(12, DateDigit.Month, date),
    }[timeFilter];

    return moment(resDate).startOf(DateDigit.Day).toDate();
  }
}
