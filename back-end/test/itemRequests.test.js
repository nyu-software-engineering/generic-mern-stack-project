import { describe, it } from "mocha";
import { expect } from "chai";
import { getOpenItemRequests } from "../services/itemRequests.js";
import { mockData } from "./fixtures.js";

describe("getOpenItemRequests (#114)", () => {
  it("returns only open item requests, newest first", () => {
    const data = mockData();
    const [first] = data.itemRequests;
    data.itemRequests.push(
      { ...first, id: 2, status: "closed", createdAt: "2026-11-02T09:00:00Z" },
      { ...first, id: 3, status: "open", createdAt: "2026-11-03T09:00:00Z" },
    );

    expect(getOpenItemRequests(data).map((request) => request.id)).to.deep.equal([3, 1]);
  });

  it("returns an empty list when nothing is open", () => {
    const data = mockData();
    data.itemRequests[0].status = "closed";

    expect(getOpenItemRequests(data)).to.deep.equal([]);
  });
});
