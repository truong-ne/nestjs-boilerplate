export interface LanguageError {
  kr: string;
  vn?: string;
  en: string;
}

export type ErrObj = Record<string, LanguageError>;

export const errObj: ErrObj = {
  InvalidDate: {
    en: 'Invalid Date',
    kr: '잘못된 일자 형식입니다.',
  },
  NotFound: {
    en: 'Notfound record',
    kr: '데이터가 없습니다',
  },
  Existed: {
    en: 'Record existed',
    kr: '중복된 데이터입니다.',
  },
};

export const validationErr: ErrObj = {
  isEnum: {
    en: 'must be one of the following values',
    kr: '다음 값 중 하나여야 합니다',
  },
};
