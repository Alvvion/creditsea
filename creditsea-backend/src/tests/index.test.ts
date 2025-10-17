import request from "supertest";
import fs from "fs";
import path from "path";
import * as mongoose from "mongoose";
import app from "../index";
import UserReport from "../models/xmlData";
import { extractCreditReportData } from "../utils/functions";

// ✅ Partial mock to skip DB connection
jest
  .spyOn(mongoose, "connect")
  .mockImplementation(() => Promise.resolve(mongoose) as any);

// ✅ Mock external modules
jest.mock("../models/xmlData");
jest.mock("../utils/functions");

describe("XML Upload API", () => {
  const mockParsedData = {
    name: "John Doe",
    creditScore: 750,
    accounts: [{ accountNumber: "1234", balance: 1200 }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (extractCreditReportData as jest.Mock).mockResolvedValue(mockParsedData);
    (UserReport as any).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockParsedData),
    }));
  });

  it("should successfully upload an XML file, parse, and save data", async () => {
    const xmlPath = path.join(__dirname, "sample.xml");
    fs.writeFileSync(xmlPath, `<Report><Name>John Doe</Name></Report>`);

    const res = await request(app).post("/upload").attach("file", xmlPath);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(extractCreditReportData).toHaveBeenCalled();
    expect(UserReport).toHaveBeenCalled();

    fs.unlinkSync(xmlPath);
  });

  it("should return 400 if no file is provided", async () => {
    const res = await request(app).post("/upload");
    expect(res.status).toBe(400);
  });

  it("should handle XML parsing errors gracefully", async () => {
    (extractCreditReportData as jest.Mock).mockRejectedValueOnce(
      new Error("Invalid XML")
    );
    const xmlPath = path.join(__dirname, "invalid.xml");
    fs.writeFileSync(xmlPath, `<InvalidXML>`);

    const res = await request(app).post("/upload").attach("file", xmlPath);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    fs.unlinkSync(xmlPath);
  });
});
