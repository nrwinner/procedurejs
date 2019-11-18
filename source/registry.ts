export class Registry {
  private actions = new Map<string, Function>();

  private static _instance: Registry;

  private constructor() { }

  static getInstance(): Registry {
    if (!this._instance) {
      this._instance = new Registry();
    }

    return this._instance;
  }

  get(name: string) {
    return this.actions.get(name);
  }

  set(name: string, action: Function) {
    this.actions.set(name, action);
  }
}