export const STORAGE_KEYS = {
  AUTH: 'auth',
  PARTICIPANT: 'participant',
  SETTINGS_POPPED: 'customer-profile-settings-popped',
};

export default {
  ram: {} as Record<string, string>,
  setItem(key: string, value: Record<string, any> | string) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(e);
      this.ram[key] = JSON.stringify(value);
    }
  },
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(e);
      this.ram[key] = undefined;
    }
  },
  getItem<T>(key: string): T {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {
      console.warn(e);
      return JSON.parse(this.ram[key]);
    }
  },
};
