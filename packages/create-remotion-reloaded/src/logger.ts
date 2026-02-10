export interface Logger {
  log: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}

export const defaultLogger: Logger = {
  log: (message) => console.log(message),
  warn: (message) => console.warn(message),
  error: (message) => console.error(message),
};
