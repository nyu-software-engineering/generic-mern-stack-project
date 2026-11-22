const express = require("express");
const {
  cities, currentUserId, listInvites, lists, savedPlaces, users,
} = require("../data/demoData");

const router = express.Router();

router.get("/invites", (req, res) => {
  const inbox = [];

  for (const invite of listInvites) {
    if (invite.toUserId !== currentUserId || invite.status !== "pending") continue;

    const list = lists.find((item) => item.id === invite.listId);
    const city = cities.find((item) => item.id === list?.cityId);
    if (!list || !city) continue;

    const sender = users.find((user) => user.id === invite.fromUserId);
    inbox.push({
      id: invite.id,
      cityId: city.id,
      cityName: city.name,
      sender: sender ? {
        id: sender.id,
        name: sender.name,
        username: sender.username,
        photoUrl: sender.photoUrl,
      } : null,
      placeCount: savedPlaces.filter((saved) => saved.listId === list.id).length,
      memberCount: list.memberIds.length,
    });
  }

  return res.json(inbox);
});

router.post("/invites/:id/respond", (req, res) => {
  const invite = listInvites.find((item) =>
    item.id === req.params.id &&
    item.toUserId === currentUserId &&
    item.status === "pending"
  );

  if (!invite) {
    return res.status(404).json({ error: "This invite is no longer available." });
  }

  const response = req.body?.response;
  if (response !== "accept" && response !== "decline") {
    return res.status(400).json({ error: "Unknown response." });
  }

  const list = lists.find((item) => item.id === invite.listId);
  if (response === "accept" && list && !list.memberIds.includes(currentUserId)) {
    list.memberIds.push(currentUserId);
  }

  invite.status = response === "accept" ? "accepted" : "declined";
  return res.json({ ok: true, cityId: list?.cityId ?? null });
});

module.exports = router;
