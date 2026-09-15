export interface Iproducts {
  Id: number;
  Code: string;
  NameAr: string;
  NameEn: string;
  Description: string;
  Notes: string;
  Quantity: number;
  ImagePath: null;
  Image: null;
  ItemUnits: ItemUnit[];
}

export interface ItemUnit {
  Id: number;
  UnitId: number;
  UnitName: string;
  Barcode: string;
  Price: number;
  PriceTax: number;
  Vat: number;
  ItemImages: any[];
}
