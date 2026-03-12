const { expect } = require("chai");
const sinon = require("sinon");
const { getDashboard } = require("../controllers/dashboardController");

describe("Dashboard Controller", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should return admin dashboard when user role is admin", async () => {
    const req = {
      user: { role: "admin" }
    };

    const res = {
      json: sinon.stub(),
      status: sinon.stub().returnsThis()
    };

    await getDashboard(req, res);

    expect(res.json.calledOnce).to.be.true;
    const calledWith = res.json.getCall(0).args[0];
    expect(calledWith.role).to.equal("admin");
    expect(calledWith.redirectTo).to.equal("/admin/dashboard");
  });
});
