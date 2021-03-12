export class System {
  static out = {
    println(...strs: string[]) {
      console.log(...strs);
    },
  };

  static err = {
    println(...strs: string[]) {
      console.error(...strs);
    },
  };
}
