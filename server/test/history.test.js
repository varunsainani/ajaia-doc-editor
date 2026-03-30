const test = require("node:test");
const assert = require("node:assert/strict");
const { parseHistory, appendHistoryEntry } = require("../history");

test("parseHistory returns array for valid json", () => {
  const parsed = parseHistory('[{"content":"A","timestamp":"2026-01-01T00:00:00.000Z"}]');
  assert.equal(Array.isArray(parsed), true);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].content, "A");
});

test("parseHistory returns [] for invalid json", () => {
  const parsed = parseHistory("not-json");
  assert.deepEqual(parsed, []);
});

test("appendHistoryEntry appends previous content with timestamp", () => {
  const result = appendHistoryEntry([], "<p>Old</p>");
  assert.equal(result.length, 1);
  assert.equal(result[0].content, "<p>Old</p>");
  assert.equal(typeof result[0].timestamp, "string");
  assert.equal(Number.isNaN(Date.parse(result[0].timestamp)), false);
});
