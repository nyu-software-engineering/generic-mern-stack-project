users = (1..8).map { |n| {"id" => (n == 1 ? "owner-1" : "student-#{n}"), "name" => generate("Full Name"), "email" => "demo#{n}@nyu.edu", "completedRentals" => random(0, 12)} };
items = [["Mini fridge", "Appliances"], ["Desk lamp", "Study supplies"], ["Study chair", "Furniture"], ["Bike lock", "Electronics"], ["Projector", "Electronics"], ["Tool kit", "Study supplies"], ["Vacuum", "Appliances"], ["Folding desk", "Furniture"]];
listings = items.each_with_index.map { |item, i| {"id" => i + 1, "ownerId" => (i == 4 ? "student-2" : "owner-1"), "title" => item[0], "category" => item[1], "description" => "#{item[0]} in good working condition. Pickup on campus.", "price" => generate("Number", min: 1, max: 25, decimals: 2), "rentalTerms" => "Campus pickup. Return clean with all included accessories.", "status" => ["published", "published", "paused", "draft", "published", "draft", "published", "paused"][i], "image" => "https://picsum.photos/seed/dormshare-#{i + 1}/320/240"} };
statuses = ["requested", "declined", "confirmed", "active", "extension_requested", "completed", "cancelled"];
today = now().to_date;
rentals = (1..14).map { |n| item = listings[n == 4 ? 4 : (n - 1) % listings.length];
state = n == 4 ? "confirmed" : statuses[(n - 1) % statuses.length];
start = today + (state == "completed" ? -8 : (["active", "extension_requested"].include?(state) ? -1 : 3));
finish = start + 2;
{"id" => 100 + n, "listingId" => item["id"], "borrowerId" => (item["ownerId"] == "owner-1" ? "student-#{2 + (n - 1) % 7}" : "owner-1"), "ownerId" => item["ownerId"], "startDate" => start.strftime("%Y-%m-%d"), "endDate" => finish.strftime("%Y-%m-%d"), "status" => state, "terms" => {"pricePerDay" => item["price"], "rentalTerms" => item["rentalTerms"]}, "totalPrice" => (item["price"] * 2).round(2), "createdAt" => ([start, today].min - 2).strftime("%Y-%m-%d"), "extensionRequest" => (state == "extension_requested" ? {"newEndDate" => (finish + 2).strftime("%Y-%m-%d"), "status" => "pending"} : nil)} };
{"users" => users, "listings" => listings, "rentals" => rentals}
