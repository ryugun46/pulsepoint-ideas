import { onRequest as __api_test_db_ts_onRequest } from "D:\\Cursor Projects\\pulsepoint-ideas\\functions\\api\\test-db.ts"

export const routes = [
    {
      routePath: "/api/test-db",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_test_db_ts_onRequest],
    },
  ]