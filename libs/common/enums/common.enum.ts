export enum ExchangeType {
  Topic = 'topic',
  Fanout = 'fanout',
  Direct = 'direct',
}

export enum ResponseEmitterResult {
  success = 'success',
  error = 'error',
  ack = 'ack',
}

export enum DateDigit {
  Day = 'day',
  Minute = 'minute',
  Second = 'second',
  Month = 'month',
}

export enum Sort {
  asc = 'asc',
  desc = 'desc',
  ASC = 'ASC',
  DESC = 'DESC'
}

export enum ETimeFilter {
  Today = 'Today',
  OneWeek = 'OneWeek',
  OneMonth = 'OneMonth',
  ThreeMonths = 'ThreeMonths',
  SixMonths = 'SixMonths',
  OneYear = 'OneYear',
}

export const sortIndex = Object.values(Sort);
