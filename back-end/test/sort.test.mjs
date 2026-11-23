import { expect } from "chai"
import { request } from "chai-http"
import app from "../app.js"
import { sortServices } from "../serviceSort.js"

async function getSortedServices(sort) {
    const response = await request.execute(app).get("/api/services").query({ sort })
    expect(response.status).to.equal(200)
    return response.body
}

describe("GET /api/services?sort", () => {
    it("sorts by price from low to high", async () => {
        const prices = (await getSortedServices("price-low")).map(service => service.price)

        expect(prices).to.deep.equal([...prices].sort((a, b) => a - b))
    })

    it("sorts by price from high to low", async () => {
        const prices = (await getSortedServices("price-high")).map(service => service.price)

        expect(prices).to.deep.equal([...prices].sort((a, b) => b - a))
    })

    it("sorts by highest rating and puts unrated listings last", async () => {
        const ratings = (await getSortedServices("rating")).map(service => service.rating)

        expect(ratings.at(-1)).to.equal(null)
        const rated = ratings.filter(rating => rating !== null)
        expect(rated).to.deep.equal([...rated].sort((a, b) => b - a))
    })

    it("sorts by newest listing first", async () => {
        const dates = (await getSortedServices("newest")).map(service => service.createdAt)

        expect(dates).to.deep.equal([...dates].sort().reverse())
    })

    it("sorts recommended listings with featured ones first", async () => {
        const services = await getSortedServices("recommended")
        const firstUnfeatured = services.findIndex(service => !service.featured)

        expect(services.slice(firstUnfeatured).every(service => !service.featured)).to.equal(true)
    })

    it("keeps the original order when no sort is given", async () => {
        const unsorted = await request.execute(app).get("/api/services")
        await getSortedServices("price-high")
        const unsortedAgain = await request.execute(app).get("/api/services")

        expect(unsortedAgain.body.map(service => service.id)).to.deep.equal(unsorted.body.map(service => service.id))
    })

    it("still includes every listing and its provider name", async () => {
        const unsorted = await request.execute(app).get("/api/services")
        const sorted = await getSortedServices("rating")

        expect(sorted).to.have.lengthOf(unsorted.body.length)
        expect(sorted).to.deep.include.members(unsorted.body)
    })

    it("rejects an unknown sort option", async () => {
        const response = await request.execute(app).get("/api/services").query({ sort: "cheapest" })

        expect(response.status).to.equal(400)
        expect(response.body.error).to.include("price-low")
    })
})

describe("sortServices", () => {
    const newListing = { id: 11, title: "New listing", price: 30, featured: false, rating: null, numReviews: 0 }
    const listings = [
        { id: 1, price: 50, featured: true, rating: 4.8, numReviews: 6, createdAt: "2026-08-24" },
        newListing,
        { id: 2, price: 15, featured: true, rating: 4.8, numReviews: 12, createdAt: "2026-08-30" }
    ]

    it("handles listings without a rating or created date", () => {
        expect(sortServices(listings, "rating").map(service => service.id)).to.deep.equal([1, 2, 11])
        expect(sortServices(listings, "newest").map(service => service.id)).to.deep.equal([2, 1, 11])
    })

    it("breaks recommended ties by number of reviews", () => {
        expect(sortServices(listings, "recommended").map(service => service.id)).to.deep.equal([2, 1, 11])
    })

    it("does not change the list it was given", () => {
        sortServices(listings, "price-low")

        expect(listings.map(service => service.id)).to.deep.equal([1, 11, 2])
    })
})
