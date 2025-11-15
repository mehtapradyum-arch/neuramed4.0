import localforage from "localforage";

export const cache = localforage.createInstance({ name: "neuramed", storeName: "cache" });

export async function setCached(key: string, value: any) {
  return cache.setItem(key, value);
}
export async function getCached<T>(key: string) {
  return cache.getItem<T>(key);
}
