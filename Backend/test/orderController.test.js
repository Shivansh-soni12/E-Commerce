const { expect } = require("chai");
const sinon = require("sinon");
const { getAllOrders } = require("../controllers/orderController");
const Order = require("../models/Order");

describe("Order Controller", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should get all orders successfully", async () => {
    const req = {};
    const res = {
      json: sinon.stub()
    };

    const mockOrders = [
      {
        _id: "order1",
        userId: "user1",
        items: [{ productId: "prod1", quantity: 2 }],
        totalAmount: 200
      }
    ];

    const populateChain = sinon.stub().returns({
      populate: sinon.stub().resolves(mockOrders)
    });

    sinon.stub(Order, "find").callsFake(() => ({
      populate: sinon.stub().returns({
        populate: sinon.stub().resolves(mockOrders)
      })
    }));

    await getAllOrders(req, res);

    expect(res.json.calledWith(mockOrders)).to.be.true;
  });
});
