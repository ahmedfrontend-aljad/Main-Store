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
  NameEn: string;
  ItemGroupId: number;
  UnitId: number;
  ItemUnitId: number;
  UnitName: string;
  Barcode: string;
  Price: number;
  PriceTax: number;
  Vat: number;
  ImagePath: string;
  Image: string;
  Description: string;
  Notes: string;
  Quantity: number;
}
