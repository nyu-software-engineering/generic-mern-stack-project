const express = require("express");
const app = express();
const purchaseAssetRouter = require("./projects/purchase_asset");

app.use(purchaseAssetRouter);
module.exports = app;
