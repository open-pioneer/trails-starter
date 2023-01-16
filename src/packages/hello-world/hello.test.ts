import { assert, it } from "vitest";
import { timesTwo } from "./hello";

it("should return number times two", function () {
    assert.strictEqual(timesTwo(3), 6);
});
