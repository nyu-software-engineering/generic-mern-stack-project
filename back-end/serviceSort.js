const SORT_OPTIONS = ["recommended", "price-low", "price-high", "rating", "newest"]

// listings without a rating yet are ranked below every rated listing
function compareByRating(a, b) {
    return (b.rating ?? 0) - (a.rating ?? 0)
}

// listings without a created date are treated as the oldest
function compareByNewest(a, b) {
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
}

function compareByRecommended(a, b) {
    return Number(Boolean(b.featured)) - Number(Boolean(a.featured))
        || compareByRating(a, b)
        || (b.numReviews ?? 0) - (a.numReviews ?? 0)
}

const comparators = {
    "recommended": compareByRecommended,
    "price-low": (a, b) => a.price - b.price,
    "price-high": (a, b) => b.price - a.price,
    "rating": compareByRating,
    "newest": compareByNewest
}

// returns a sorted copy so the shared services list keeps its original order
function sortServices(services, sort) {
    return [...services].sort(comparators[sort])
}

module.exports = { SORT_OPTIONS, sortServices }
