/**
 * @deprecated use typeof === "number"
 * @param item
 */
export function isNumber(item: any): item is number {
  return typeof item === 'number';
}

/**
 * @deprecated use typeof === "boolean"
 * @param item
 */
export function isBoolean(item: any): item is boolean {
  return typeof item === 'boolean';
}
