const { expect } = require("chai");
const sinon = require("sinon");
const { getCart } = require("../controllers/cartController");
const User = require("../models/User");

describe("Cart Controller", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should get user cart successfully", async () => {
    const req = {
      params: { userId: "123" }
    };

    const res = {
      json: sinon.stub(),
      status: sinon.stub().returnsThis()
    };

    const mockUser = {
      _id: "123",
      cart: [
        { productId: "prod1", name: "Product 1", price: 100, quantity: 1 }
      ]
    };

    const populateStub = sinon.stub().resolves(mockUser);
    sinon.stub(User, "findById").returns({ populate: populateStub });

    await getCart(req, res);

    expect(res.json.calledWith(mockUser.cart)).to.be.true;
  });
});
