import { PrintStream } from './PrintStream';
import { Logger } from './Logger';

export class ConfigurableConsoleHandler {
  static redirectTo(ps: PrintStream) {
    if (ps.ws) ps.close();
    Logger.setPrintStream(ps);
  }

  static undoRedirect() {}
}
