import { onRequestPost as __api_scrape_run_ts_onRequestPost } from "D:\\Cursor Projects\\pulsepoint-ideas\\functions\\api\\scrape\\run.ts"
import { onRequestGet as __api_analyses__id__ts_onRequestGet } from "D:\\Cursor Projects\\pulsepoint-ideas\\functions\\api\\analyses\\[id].ts"
import { onRequestDelete as __api_subreddits__id__ts_onRequestDelete } from "D:\\Cursor Projects\\pulsepoint-ideas\\functions\\api\\subreddits\\[id].ts"
import { onRequestGet as __api_analyses_index_ts_onRequestGet } from "D:\\Cursor Projects\\pulsepoint-ideas\\functions\\api\\analyses\\index.ts"
import { onRequestGet as __api_health_ts_onRequestGet } from "D:\\Cursor Projects\\pulsepoint-ideas\\functions\\api\\health.ts"
import { onRequestGet as __api_subreddits_index_ts_onRequestGet } from "D:\\Cursor Projects\\pulsepoint-ideas\\functions\\api\\subreddits\\index.ts"
import { onRequestPost as __api_subreddits_index_ts_onRequestPost } from "D:\\Cursor Projects\\pulsepoint-ideas\\functions\\api\\subreddits\\index.ts"
import { onRequest as __api_test_db_ts_onRequest } from "D:\\Cursor Projects\\pulsepoint-ideas\\functions\\api\\test-db.ts"
import { onRequest as ___middleware_ts_onRequest } from "D:\\Cursor Projects\\pulsepoint-ideas\\functions\\_middleware.ts"

export const routes = [
    {
      routePath: "/api/scrape/run",
      mountPath: "/api/scrape",
      method: "POST",
      middlewares: [],
      modules: [__api_scrape_run_ts_onRequestPost],
    },
  {
      routePath: "/api/analyses/:id",
      mountPath: "/api/analyses",
      method: "GET",
      middlewares: [],
      modules: [__api_analyses__id__ts_onRequestGet],
    },
  {
      routePath: "/api/subreddits/:id",
      mountPath: "/api/subreddits",
      method: "DELETE",
      middlewares: [],
      modules: [__api_subreddits__id__ts_onRequestDelete],
    },
  {
      routePath: "/api/analyses",
      mountPath: "/api/analyses",
      method: "GET",
      middlewares: [],
      modules: [__api_analyses_index_ts_onRequestGet],
    },
  {
      routePath: "/api/health",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_health_ts_onRequestGet],
    },
  {
      routePath: "/api/subreddits",
      mountPath: "/api/subreddits",
      method: "GET",
      middlewares: [],
      modules: [__api_subreddits_index_ts_onRequestGet],
    },
  {
      routePath: "/api/subreddits",
      mountPath: "/api/subreddits",
      method: "POST",
      middlewares: [],
      modules: [__api_subreddits_index_ts_onRequestPost],
    },
  {
      routePath: "/api/test-db",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_test_db_ts_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_ts_onRequest],
      modules: [],
    },
  ]