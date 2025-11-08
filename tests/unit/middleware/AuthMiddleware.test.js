const jwt = require("jsonwebtoken");
const authMiddleware = require("../../../middleware/AuthMiddleware");

jest.mock("jsonwebtoken");

describe("AuthMiddleware - verifyToken", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {},
    };

    res = {
      redirect: jest.fn(),
      clearCookie: jest.fn(),
    };

    next = jest.fn();
    process.env.JWT_SECRET_TOKEN = "secretkey";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should redirect to /login if token is not provided", () => {
    req.cookies.token = undefined;

    authMiddleware.verifyToken(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(next).not.toHaveBeenCalled();
  });

  test("should call next() and set req.user if token is valid", () => {
    const mockDecoded = { email: "test@example.com" };
    req.cookies.token = "validToken";

    jwt.verify.mockReturnValue(mockDecoded);

    authMiddleware.verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("validToken", "secretkey");
    expect(req.user).toEqual(mockDecoded);
    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("should clear cookie and redirect if token is invalid", () => {
    req.cookies.token = "invalidToken";
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    authMiddleware.verifyToken(req, res, next);

    expect(res.clearCookie).toHaveBeenCalledWith("token");
    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(next).not.toHaveBeenCalled();
  });
});
