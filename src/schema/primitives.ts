export type SemVerNumber = `${number}.${number}.${number}`;
export type Primitive = bigint | boolean | null | number | string | symbol | undefined;
export type JSONValue = Primitive | JSONObject | JSONArray;
export type JSONArray = Array<JSONValue>;
export interface JSONObject {
  [key: string]: JSONValue;
}
