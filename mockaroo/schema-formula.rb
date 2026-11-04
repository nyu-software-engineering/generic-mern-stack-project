users = (1..8).map { |n| {"id" => (n == 1 ? "owner-1" : "student-#{n}"), "name" => generate("Full Name"), "email" => "demo#{n}@nyu.edu", "completedRentals" => random(0, 12)} };
items = [["Mini fridge", "Appliances"], ["Desk lamp", "Study supplies"], ["Study chair", "Furniture"], ["Bike lock", "Electronics"], ["Projector", "Electronics"], ["Tool kit", "Study supplies"], ["Vacuum", "Appliances"], ["Folding desk", "Furniture"]];
listings = items.each_with_index.map { |item, i| {"id" => i + 1, "ownerId" => (i == 4 ? "student-2" : "owner-1"), "title" => item[0], "category" => item[1], "description" => "#{item[0]} in good working condition. Pickup on campus.", "price" => generate("Number", min: 1, max: 25, decimals: 2), "rentalTerms" => "Campus pickup. Return clean with all included accessories.", "status" => ["published", "published", "paused", "draft", "published", "draft", "published", "paused"][i], "image" => "https://picsum.photos/seed/dormshare-#{i + 1}/320/240"} };
statuses = ["requested", "declined", "confirmed", "active", "extension_requested", "completed", "cancelled"];
today = now().to_date;
rentals = (1..15).map { |n| item = listings[[4, 15].include?(n) ? 4 : (n - 1) % listings.length];
state = {4 => "confirmed", 15 => "active"}[n] || statuses[(n - 1) % statuses.length];
start = today + (state == "completed" ? -8 : (["active", "extension_requested"].include?(state) ? -1 : 3));
finish = start + 2;
{"id" => 100 + n, "listingId" => item["id"], "borrowerId" => (item["ownerId"] == "owner-1" ? "student-#{2 + (n - 1) % 7}" : "owner-1"), "ownerId" => item["ownerId"], "startDate" => start.strftime("%Y-%m-%d"), "endDate" => finish.strftime("%Y-%m-%d"), "status" => state, "terms" => {"pricePerDay" => item["price"], "rentalTerms" => item["rentalTerms"]}, "totalPrice" => (item["price"] * 2).round(2), "createdAt" => ([start, today].min - 2).strftime("%Y-%m-%d"), "extensionRequest" => (state == "extension_requested" ? {"newEndDate" => (finish + 2).strftime("%Y-%m-%d"), "status" => "pending"} : nil)} };
conversations = [[5, "owner-1"], [1, "student-3"], [2, "student-4"]].each_with_index.map { |(listing_id, borrower_id), i|
  item = listings.find { |listing| listing["id"] == listing_id };
  sent_date = (today - i - 1).strftime("%Y-%m-%d");
  start_date = today + 3 + i;
  end_date = start_date + 2;
  messages = [
    {"id" => i * 3 + 1, "senderId" => borrower_id, "type" => "text", "text" => "Hi! Could I borrow the #{item["title"]}?", "sentAt" => "#{sent_date}T09:00:00Z"},
    {"id" => i * 3 + 2, "senderId" => item["ownerId"], "type" => "text", "text" => "Yes, it is available. The listed price is $#{item["price"]}/day.", "sentAt" => "#{sent_date}T09:05:00Z"}
  ];
  if i < 2;
    messages << {"id" => i * 3 + 3, "senderId" => (i == 0 ? item["ownerId"] : borrower_id), "type" => "offer", "totalPrice" => (item["price"] * 2 * 0.9).round(2), "startDate" => start_date.strftime("%Y-%m-%d"), "endDate" => end_date.strftime("%Y-%m-%d"), "status" => "pending", "sentAt" => "#{sent_date}T09:10:00Z"};
  end;
  {"id" => i + 1, "listingId" => item["id"], "participantIds" => [item["ownerId"], borrower_id], "messages" => messages}
};

# Seed reviews from actual completed rentals, so participants stay consistent.
review_specs = [
  {"bookingId" => 106, "rating" => 5, "comment" => "Quick replies and an easy pickup."},
  {"bookingId" => 113, "rating" => 4, "comment" => "Friendly and easy to coordinate with."}
];
reviews = review_specs.each_with_index.map { |spec, i|
  rental = rentals.find { |record| record["id"] == spec["bookingId"] };
  reviewer_id = rental["ownerId"] == "owner-1" ? rental["borrowerId"] : rental["ownerId"];
  {"id" => i + 1, "bookingId" => rental["id"], "reviewerId" => reviewer_id, "reviewedUserId" => "owner-1", "communicationRating" => spec["rating"], "itemCareRating" => spec["rating"], "overallRating" => spec["rating"], "comment" => spec["comment"], "createdAt" => (today - 1 - i).strftime("%Y-%m-%d")}
};

request_items = [["Portable speaker", "Near Third North", "For a small birthday party in the dorm lounge."], ["Rice cooker", "A6 building", "Cooking for a study group this week."], ["Graphing calculator", "Library", "Mine broke right before a midterm."], ["Camping tent", "Baraha", "Weekend trip with friends."], ["HDMI cable", "Campus Center", "Presenting at a club meeting."]];
item_requests = request_items.each_with_index.map { |(item_name, area, details), i|
  needed_by = today + 2 + i;
  {"id" => i + 1, "requesterId" => (i == 4 ? "owner-1" : "student-#{3 + i}"), "itemName" => item_name, "neededBy" => needed_by.strftime("%Y-%m-%d"), "neededUntil" => (needed_by + 2).strftime("%Y-%m-%d"), "approximateArea" => area, "targetPrice" => (i == 1 ? nil : random(5, 30)), "details" => details, "status" => "open", "responses" => [], "createdAt" => "#{(today - i - 1).strftime("%Y-%m-%d")}T12:00:00Z"}
};

{"users" => users, "listings" => listings, "rentals" => rentals, "conversations" => conversations, "reviews" => reviews, "itemRequests" => item_requests}