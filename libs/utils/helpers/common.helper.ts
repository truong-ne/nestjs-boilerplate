export class CommonHelper {
  static getPattern(prefixCmd: string[], functionName: string): string {
    const cmd = [...prefixCmd, functionName];
    return cmd.join('.');
  }

  static generateUnique(prefix = '', suffix = ''): string {
    const timestamp = ((Date.now() / 1000) | 0).toString(16);
    const randomPart = ((Math.random() * 0x1000000) | 0).toString(32);
    return [prefix, timestamp + randomPart, suffix].filter(Boolean).join('-');
  }

  static getExtractArray<T = unknown>(prevArr: T[], newArr: T[]): T[] {
    const set = new Set<T>();
    prevArr.map((e) => set.add(e));

    return newArr.filter((e) => set.has(e));
  }

  static joinEvent(...word: string[]): string {
    return word.join('_');
  }
}
