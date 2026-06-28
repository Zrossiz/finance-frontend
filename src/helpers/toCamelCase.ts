export function toCamelCase<T>(obj: T): T {
  if (obj !== null && typeof obj === "object" && !Array.isArray(obj)) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );

      (result as Record<string, unknown>)[camelKey] = toCamelCase(
        (obj as Record<string, unknown>)[key]
      );

      return result;
    }, {} as T);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item)) as T;
  }

  return obj;
}