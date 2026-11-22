const chai = require("chai");
const chaiHttp = require("chai-http");
const sinon = require("sinon");
const axios = require("axios");

const { expect } = chai;
chai.use(chaiHttp.default);
const { request } = chaiHttp;

process.env.API_MEMBERS_URL = "http://fake-api.test/members";
process.env.API_ASSETS_URL = "http://fake-api.test/assets";
process.env.API_SECRET_KEY = "test-key";

const fakeMembers = [
  { id: 1, first_name: "Alice", last_name: "Smith", household_id: 1 },
  { id: 2, first_name: "Bob", last_name: "Jones", household_id: 1 },
];

const axiosStub = sinon.stub(axios, "get").callsFake(async (url) => {
  if (url.startsWith(process.env.API_MEMBERS_URL)) return { data: fakeMembers };
  return { data: [] };
});

const app = require("../app");

const validAsset = () => ({
  name: "Desk Lamp",
  price: "25.50",
  date: "01/15/2024",
  paidBy: "Alice",
});

const postAsset = (body) => request.execute(app).post("/api/assets").send(body);

describe("POST /api/assets", () => {
  after(() => axiosStub.restore());

  describe("valid input", () => {
    it("creates the asset and responds 201", async () => {
      const res = await postAsset(validAsset());
      expect(res).to.have.status(201);
      expect(res.body.status).to.equal("success");
      expect(res.body.asset).to.include({
        asset_name: "Desk Lamp",
        price: 25.5,
        date: "01/15/2024",
        paidBy: "Alice Smith",
        image: null,
      });
    });

    it("accepts several payers by first or full name", async () => {
      const res = await postAsset({
        ...validAsset(),
        paidBy: "alice, Bob Jones",
      });
      expect(res).to.have.status(201);
      expect(res.body.asset.paidBy).to.equal("Alice Smith, Bob Jones");
    });

    it("trims spaces around the name", async () => {
      const res = await postAsset({ ...validAsset(), name: "  Desk Lamp  " });
      expect(res).to.have.status(201);
      expect(res.body.asset.asset_name).to.equal("Desk Lamp");
    });
  });

  describe("invalid input", () => {
    const cases = [
      ["name", "a".repeat(101), "Asset name cannot exceed 100 characters."],
      ["price", "abc", "Price must be a number."],
      ["price", "-5", "Price cannot be negative."],
      ["price", "10.999", "Price can have at most two decimal places."],
      ["date", "2024-01-15", "Enter the date as MM/DD/YYYY, e.g. 10/24/2026."],
      ["date", "13/01/2024", "Month must be between 01 and 12."],
      ["date", "02/30/2024", "That month only has 29 days."],
      ["date", "02/29/2023", "That month only has 28 days."],
      [
        "date",
        "01/01/0000",
        `Year must be between 0001 and ${new Date().getFullYear()}.`,
      ],

      ["paidBy", "Zed", "Not a household member: Zed."],
    ];

    cases.forEach(([field, value, message]) => {
      it(`rejects ${field} = "${value}"`, async () => {
        const res = await postAsset({ ...validAsset(), [field]: value });
        expect(res).to.have.status(400);
        expect(res.body.status).to.equal("error");
        expect(res.body.errors).to.deep.equal({ [field]: message });
      });
    });

    it("rejects a date in the future", async () => {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      const mm = String(t.getMonth() + 1).padStart(2, "0");
      const dd = String(t.getDate()).padStart(2, "0");
      const res = await postAsset({
        ...validAsset(),
        date: `${mm}/${dd}/${t.getFullYear()}`,
      });
      expect(res).to.have.status(400);
      expect(res.body.errors.date).to.match(
        /cannot be in the future|Year must be between/,
      );
    });

    describe("missing required fields", () => {
      const required = {
        name: "Asset name is required.",
        price: "Price is required.",
        date: "Date purchased is required.",
        paidBy: "Enter at least one person who paid.",
      };

      Object.entries(required).forEach(([field, message]) => {
        it(`rejects a request with no ${field}`, async () => {
          const body = validAsset();
          delete body[field];
          const res = await postAsset(body);
          expect(res).to.have.status(400);
          expect(res.body.errors).to.deep.equal({ [field]: message });
        });

        it(`rejects ${field} that is only spaces`, async () => {
          const res = await postAsset({ ...validAsset(), [field]: "   " });
          expect(res).to.have.status(400);
          expect(res.body.errors[field]).to.equal(message);
        });
      });

      it("reports every missing field at once for an empty body", async () => {
        const res = await postAsset({});
        expect(res).to.have.status(400);
        expect(res.body.errors).to.deep.equal(required);
      });
    });
  });
});
