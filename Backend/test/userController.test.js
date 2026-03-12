const { expect } = require("chai");
const sinon = require("sinon");
const { registerUser } = require("../controllers/userController");
const User = require("../models/User");

describe("User Controller", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should register a new user successfully", async () => {
    const req = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "password123"
      }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };

    // Stub User methods
    sinon.stub(User, "findOne").resolves(null); // User doesn't exist
    sinon.stub(User, "create").resolves({
      _id: "123",
      name: "John Doe",
      email: "john@example.com",
      password: "hashedPassword"
    });

    await registerUser(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.called).to.be.true;
  });
});
