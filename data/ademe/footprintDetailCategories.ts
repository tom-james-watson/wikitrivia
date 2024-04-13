import { t } from "@lingui/macro";

export interface FootprintDetailCategories {
  [key: number]: string;
}

const footprintDetailCategories: FootprintDetailCategories = {
  1: t`Raw materials`,
  2: t`Supplying`,
  3: t`Formatting`,
  4: t`Assembly and delivery`,
  5: t`Building`,
  6: t`Fuel`,
  7: t`Condensation trails`,
  8: t`Usage`,
  13: t`Devices building`,
  14: t`Devices usage`,
  15: t`Transmission`,
  16: t`Data-centers construction`,
  17: t`Data-centers usage`,
  30: t`Farming`,
  31: t`Processing`,
  32: t`Packaging`,
  33: t`Delivery`,
  34: t`Supermarket and distribution`,
  35: t`Consumption`
}

export default footprintDetailCategories;
