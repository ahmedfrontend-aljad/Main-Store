export interface IallCategories {
  Groups: Group[];
}

export interface Group {
  Id: number;
  NameAr: string;
  NameEn: null;
  Code: string;
  Items: Item[];
}

export interface Item {
  Id: number;
  Code: string;
  NameAr: string;
  NameEn: null | string;
  ItemGroupId: number;
  UnitId: number;
  ItemUnitId: number;
  UnitName: string;
  Barcode: null | string;
  Price: number;
  PriceTax: number;
  Vat: number;
  ImagePath: null;
  Description: null | string;
  Notes: null | string;
  Quantity: number;
}
