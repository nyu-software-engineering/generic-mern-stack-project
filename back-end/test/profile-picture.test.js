import { expect } from "chai"
import request from "supertest"
import { unlinkSync } from "node:fs"
import path from "node:path"
import app from "../app.js"
import profile from "../data/profile.js"

describe("Profile picture router", () => {
    const originalPicture = profile.picture.large
    const uploadedFiles = []
    afterEach(() => {
        profile.picture.large = originalPicture
        uploadedFiles.forEach(filename => {
            unlinkSync(path.join("uploads", filename))
        })
        uploadedFiles.length = 0
    })

    it("uploads a valid profile picture", async () => {
        const image = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/Xj8AAAAASUVORK5CYII=","base64"
        )
        const response = await request(app)
            .post("/api/profile/picture")
            .attach("picture", image, "profile.png")

        expect(response.status).to.equal(200)
        expect(response.body.picture.large).to.include("/uploads/")
        const imagePath = response.body.picture.large
        uploadedFiles.push(path.basename(imagePath))
        const imageResponse = await request(app).get(imagePath)
        expect(imageResponse.status).to.equal(200)
    })

    it("rejects a request without a picture", async() => {
        const response = await request(app)
            .post("/api/profile/picture")
        expect(response.status).to.equal(400)
        expect(response.body.error).to.equal(
            "Profile picture is required"
        )
    })

    it("rejects a non-image file", async() => {
        const response = await request(app)
            .post("/api/profile/picture")
            .attach("picture", Buffer.from("test"), "notes.txt")
        expect(response.status).to.equal(400)
        expect(response.body.error).to.equal(
            "Profile picture is required"
        )
    })
})