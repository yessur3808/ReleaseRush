export namespace Config {
  export interface Env {
    APP_NAME: string;
    GA_MEASUREMENT_ID?: string;
    /** Base URL of the Game-Tracker-Service, e.g. "http://localhost:3000" */
    GAMES_API_URL?: string;
  }
}
