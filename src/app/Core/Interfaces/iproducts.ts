export interface Iproducts {
  Id: number;
  NameAr: string;
  NameEn: string;
  Description: null;
  ItemUnits: ItemUnit[];
}

export interface ItemUnit {
  Id: number;
  Price: number;
  ItemImages: ItemImage[];
}

export interface ItemImage {
  Image: string;
}
