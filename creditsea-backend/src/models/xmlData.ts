import { Schema, model } from "mongoose";

const BasicDetailsSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    match: /^[6-9]\d{9}$/, // Indian mobile format example
  },
  pan: {
    type: String,
    required: true,
    uppercase: true,
    match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, // PAN format validation
  },
  creditScore: {
    type: Number,
    min: 300,
    max: 900,
  },
});

const ReportSummarySchema = new Schema(
  {
    totalAccounts: { type: Number, default: 0 },
    activeAccounts: { type: Number, default: 0 },
    closedAccounts: { type: Number, default: 0 },
    currentBalanceAmount: { type: Number, default: 0 },
    securedAccountsAmount: { type: Number, default: 0 },
    unsecuredAccountsAmount: { type: Number, default: 0 },
    last7DaysCreditEnquiries: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CreditAccountSchema = new Schema(
  {
    creditCard: {
      bankName: String,
      accountNumber: String,
      accountType: String,
      portfolioType: String,
    },
    openDate: String,
    closedDate: String,
    creditLimit: String,
    highestCredit: String,
    currentBalance: String,
    amountOverdue: String,
    accountStatus: String,
    dateReported: String,
    address: {
      line1: String,
      line2: String,
      line3: String,
      city: String,
      state: String,
      pincode: String,
    },
  },
  { _id: false }
);

const UserReportSchema = new Schema(
  {
    basicDetails: {
      type: BasicDetailsSchema,
    },
    reportSummary: {
      type: ReportSummarySchema,
    },
    creditAccounts: {
      type: [CreditAccountSchema], // array of credit accounts
      default: [],
    },
  },
  { timestamps: true }
);

export default model("UserReport", UserReportSchema);
