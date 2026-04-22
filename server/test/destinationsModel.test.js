import test from "node:test";
import assert from "node:assert/strict";
import { mock } from "node:test";

import { pool } from "../src/config/db.js";
import { searchDestinationsModel } from "../src/models/destinationsModel.js";

test("searchDestinationsModel builds filtered query and params", async () => {
  let capturedSql = "";
  let capturedParams = [];
  const queryMock = mock.method(pool, "query", async (sql, params) => {
    capturedSql = sql;
    capturedParams = params;
    return { rows: [] };
  });

  try {
    await searchDestinationsModel({
      tagIds: [1, 2],
      countryId: 99,
      international: true,
      months: [6, 7],
      q: "beach",
      limit: 10,
      offset: 20,
    });
  } finally {
    queryMock.mock.restore();
  }

  assert.match(capturedSql, /JOIN destination_tags dt/);
  assert.match(capturedSql, /dt\.tag_id = ANY\(\$1::int\[\]\)/);
  assert.match(capturedSql, /d\.country_id = \$2/);
  assert.match(capturedSql, /d\.country_id <> \$3/);
  assert.match(capturedSql, /s\.month = ANY\(\$4::int\[\]\)/);
  assert.match(capturedSql, /ILIKE \$5/);
  assert.match(capturedSql, /ORDER BY\s+COALESCE\(AVG\(s\.suitability\), 0\) DESC/);
  assert.deepEqual(capturedParams, [[1, 2], 99, 99, [6, 7], "%beach%", 10, 20]);
});
