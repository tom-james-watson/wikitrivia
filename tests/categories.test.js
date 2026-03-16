import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getAllPlayRoutePaths,
  getAllSelectionRoute,
  getCategoryDefinitions,
  getGroupAllSelectionRoute,
  getLeafSelectionRoute,
  getSelectionRouteParentPath,
  getSelectionRoutePath,
  getSelectionRouteShareLabel,
} from "../lib/categories";

test("top-level categories stay in the intended order", () => {
  assert.deepEqual(
    getCategoryDefinitions().map((category) => category.slug),
    [
      "history",
      "leaders",
      "entertainment",
      "people",
      "technology",
      "art",
      "engineering",
      "sport",
      "architecture",
      "business",
    ],
  );
});

test("history all route resolves to descendant free-play decks", () => {
  const route = getGroupAllSelectionRoute(["history"]);

  assert.ok(route);
  assert.equal(getSelectionRoutePath(route), "/play/history/all");
  assert.equal(route.nodeId, "all-history");
  assert.equal(getSelectionRouteShareLabel(route), "History");
});

test("leaf routes keep clean share labels and parent paths", () => {
  const route = getLeafSelectionRoute(["engineering", "space"]);

  assert.ok(route);
  assert.equal(getSelectionRoutePath(route), "/play/engineering/space");
  assert.equal(getSelectionRouteParentPath(route), "/play/engineering");
  assert.equal(getSelectionRouteShareLabel(route), "Engineering / Space");
  assert.equal(route.nodeId, "all-engineering-space");
});

test("static paths include deep selectors and leaf routes", () => {
  const paths = getAllPlayRoutePaths().map((path) => path.join("/"));

  assert.ok(paths.includes(""));
  assert.ok(paths.includes("all"));
  assert.ok(paths.includes("featured"));
  assert.ok(paths.includes("featured/us-presidents"));
  assert.ok(paths.includes("browse"));
  assert.ok(paths.includes("leaders"));
  assert.ok(paths.includes("browse/history"));
  assert.ok(paths.includes("leaders/rulers"));
  assert.ok(paths.includes("leaders/rulers/europe/england"));
  assert.ok(paths.includes("leaders/rulers/all"));
  assert.ok(paths.includes("technology/websites"));
});

test("all route stays anchored at /play/all", () => {
  const route = getAllSelectionRoute();

  assert.equal(getSelectionRoutePath(route), "/play/all");
  assert.equal(getSelectionRouteParentPath(route), "/play");
  assert.equal(route.kind, "all");
  assert.equal(route.nodeId, "all");
});
