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
{"users" => users, "listings" => listings, "rentals" => rentals, "conversations" => conversations}
