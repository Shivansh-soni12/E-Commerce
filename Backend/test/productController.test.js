const { expect } = require("chai");
const sinon = require("sinon");
const { getProducts } = require("../controllers/productController");
const Product = require("../models/Product");

describe("Product Controller", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should get all products successfully", async () => {
    const req = {};
    const res = {
      json: sinon.stub()
    };

    const mockProducts = [
      { _id: "1", name: "Product 1", price: 100 },
      { _id: "2", name: "Product 2", price: 200 }
    ];

    sinon.stub(Product, "find").resolves(mockProducts);

    await getProducts(req, res);

    expect(res.json.calledWith(mockProducts)).to.be.true;
  });
});
