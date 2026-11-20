const { expect } = require("chai");
const { request } = require("chai-http");
const app = require("../app");
const { users, currentUserId } = require("../data/demoData");

function changePassword(body) {
  return request.execute(app).patch("/api/users/me/password").send(body);
}

describe("PATCH /api/users/me/password", function () {
  const me = users.find((user) => user.id === currentUserId);
  const originalPassword = me.password;

  // These tests change the password in memory
  afterEach(function () {
    me.password = originalPassword;
  });

  it("changes the password when the current one is right", async function () {
    const response = await changePassword({
      currentPassword: "password123",
      newPassword: "newpass456",
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({ ok: true });
    expect(me.password).to.equal("newpass456");
  });

  it("returns 401 when the current password is wrong", async function () {
    const response = await changePassword({
      currentPassword: "not-my-password",
      newPassword: "newpass456",
    });

    expect(response.status).to.equal(401);
    expect(response.body).to.deep.equal({ error: "Your current password is wrong." });
    expect(me.password).to.equal(originalPassword);
  });

  it("returns 400 when the new password breaks the rules", async function () {
    const tooShort = await changePassword({ currentPassword: "password123", newPassword: "abc1" });
    const noNumber = await changePassword({ currentPassword: "password123", newPassword: "abcdefghij" });
    const sameAsOld = await changePassword({ currentPassword: "password123", newPassword: "password123" });

    expect(tooShort.status).to.equal(400);
    expect(tooShort.body.error).to.equal("Use at least 8 characters.");
    expect(noNumber.status).to.equal(400);
    expect(noNumber.body.error).to.equal("Include at least one number.");
    expect(sameAsOld.status).to.equal(400);
    expect(me.password).to.equal(originalPassword);
  });

  it("returns 400 when a field is missing", async function () {
    const response = await changePassword({ newPassword: "newpass456" });

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({ error: "Enter your current password." });
  });
});
