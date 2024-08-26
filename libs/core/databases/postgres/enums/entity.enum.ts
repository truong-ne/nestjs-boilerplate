export enum EGender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export enum ERole {
  Admin = 'Admin',
  Manager = 'Manager',
  User = 'User',
}

export enum EDiscountUnit {
  Percent = '%',
  VND = 'VND'
}

export enum EDiscountType {
  Limit = 'Limit',
  Infinity = 'Infinity'
}

export enum EDiscountStatus {
  Active = 'Active',
  InActive = 'InActive',
  Expired = 'Expired',
  OutOfStock = 'OutOfStock'
}

export enum EBillStatus {
  Pending = 'Pending',
  Confirm = 'Confirm',
  InProgress = 'InProgress',
  Finish = 'Finish',
  Cancel = 'Cancel',
  Denied = 'Denied'
}

export enum EBillMethod {
  COD = 'COD',
  Momo = 'Momo'
}

export enum EDeliveryUnit {
  Shopee = 'Shopee',
  Grab = 'Grab',
  Lalamove = 'Lalamove'
}