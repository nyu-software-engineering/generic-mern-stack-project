const { expect } = require("chai");
const { request } = require("chai-http");
const app = require("../app");
const {
  currentUserId, listInvites, lists, savedPlaces, users,
} = require("../data/demoData");

const inbox = () => request.execute(app).get("/api/invites");
const respond = (id, body) =>
  request.execute(app).post(`/api/invites/${id}/respond`).send(body);

describe("Invitation routes", function () {
  const sender = users.find((user) => user.id !== currentUserId);
  const list = lists[0];
  let invite;
  let otherInvite;
  let originalMembers;
  let originalInvites;

  beforeEach(function () {
    originalMembers = [...list.memberIds];
    originalInvites = [...listInvites];
    list.memberIds.splice(0, list.memberIds.length, sender.id);

    invite = {
      id: "test-invite-159", listId: list.id, fromUserId: sender.id,
      toUserId: currentUserId, status: "pending",
    };
    otherInvite = {
      ...invite, id: "test-other-159", toUserId: sender.id,
    };
    listInvites.splice(0, listInvites.length, invite, otherInvite);
  });

  afterEach(function () {
    list.memberIds.splice(0, list.memberIds.length, ...originalMembers);
    listInvites.splice(0, listInvites.length, ...originalInvites);
  });

  it("returns only my pending invites, with the fields used by the inbox", async function () {
    const { cities } = require("../data/demoData");
    const city = cities.find((item) => item.id === list.cityId);
    listInvites.push({ ...invite, id: "test-finished-159", status: "declined" });
    const result = await inbox();

    expect(result.status).to.equal(200);
    expect(result.body).to.deep.equal([{
      id: invite.id,
      cityId: city.id,
      cityName: city.name,
      sender: {
        id: sender.id, name: sender.name,
        username: sender.username, photoUrl: sender.photoUrl,
      },
      placeCount: savedPlaces.filter((saved) => saved.listId === list.id).length,
      memberCount: list.memberIds.length,
    }]);
  });

  it("accepts an invite, adds membership, and removes it from the inbox", async function () {
    const result = await respond(invite.id, { response: "accept" });

    expect(result.status).to.equal(200);
    expect(result.body).to.deep.equal({ ok: true, cityId: list.cityId });
    expect(invite.status).to.equal("accepted");
    expect(list.memberIds).to.include(currentUserId);
    expect((await inbox()).body).to.deep.equal([]);
  });

  it("declines an invite and leaves membership unchanged", async function () {
    const members = [...list.memberIds];
    const result = await respond(invite.id, { response: "decline" });

    expect(result.status).to.equal(200);
    expect(result.body).to.deep.equal({ ok: true, cityId: list.cityId });
    expect(invite.status).to.equal("declined");
    expect(list.memberIds).to.deep.equal(members);
    expect((await inbox()).body).to.deep.equal([]);
  });

  it("keeps the invite pending after an invalid or missing response", async function () {
    for (const body of [{ response: "maybe" }, {}, { response: true }]) {
      expect((await respond(invite.id, body)).status).to.equal(400);
    }
    expect(invite.status).to.equal("pending");
    expect(list.memberIds).not.to.include(currentUserId);
  });

  it("returns 404 for an unknown invite or another user's invite", async function () {
    for (const id of ["no-such-invite", otherInvite.id]) {
      expect((await respond(id, { response: "accept" })).status).to.equal(404);
    }
    expect(otherInvite.status).to.equal("pending");
    expect(list.memberIds).not.to.include(currentUserId);
  });

  it("handles existing membership and repeated responses without adding duplicates", async function () {
    list.memberIds.push(currentUserId);
    expect((await respond(invite.id, { response: "accept" })).status).to.equal(200);
    expect((await respond(invite.id, { response: "decline" })).status).to.equal(404);
    expect(invite.status).to.equal("accepted");
    expect(list.memberIds.filter((id) => id === currentUserId)).to.have.length(1);
  });
});
