const getNestedValue = (obj: any, path: string): string => {
  const keys = path.split(".");
  let value = obj;
  for (const key of keys) {
    if (value && value[key]) {
      value = value[key];
    } else {
      return "";
    }
  }
  // Handle array with single element (common in xml2js)
  if (Array.isArray(value) && value.length > 0) {
    value = value[0];
  }
  return typeof value === "string" ? value : value?._ || "";
};

const extractCreditReportData = (parsedXml: any) => {
  const root = parsedXml.INProfileResponse;

  // Extract Basic Details
  const currentApplicant =
    root.Current_Application?.[0]?.Current_Application_Details?.[0]
      ?.Current_Applicant_Details?.[0] || {};
  const firstHolder =
    root.CAIS_Account?.[0]?.CAIS_Account_DETAILS?.[0]
      ?.CAIS_Holder_Details?.[0] || {};

  const basicDetails = {
    name: `${getNestedValue(currentApplicant, "First_Name")} ${getNestedValue(currentApplicant, "Last_Name")}`.trim(),
    mobileNumber: getNestedValue(currentApplicant, "MobilePhoneNumber"),
    pan: getNestedValue(firstHolder, "Income_TAX_PAN"),
    creditScore: getNestedValue(root, "SCORE.0.BureauScore"),
  };

  // Extract Report Summary
  const caisSummary = root.CAIS_Account?.[0]?.CAIS_Summary?.[0] || {};
  const creditAccount = caisSummary.Credit_Account?.[0] || {};
  const totalOutstanding = caisSummary.Total_Outstanding_Balance?.[0] || {};
  const capsummary = root.TotalCAPS_Summary?.[0] || {};

  const reportSummary = {
    totalNumberOfAccounts: getNestedValue(creditAccount, "CreditAccountTotal"),
    activeAccounts: getNestedValue(creditAccount, "CreditAccountActive"),
    closedAccounts: getNestedValue(creditAccount, "CreditAccountClosed"),
    currentBalanceAmount: getNestedValue(
      totalOutstanding,
      "Outstanding_Balance_All"
    ),
    securedAccountsAmount: getNestedValue(
      totalOutstanding,
      "Outstanding_Balance_Secured"
    ),
    unsecuredAccountsAmount: getNestedValue(
      totalOutstanding,
      "Outstanding_Balance_UnSecured"
    ),
    last7DaysCreditEnquiries: getNestedValue(capsummary, "TotalCAPSLast7Days"),
  };

  // Extract Credit Accounts Information
  const accountsDetails = root.CAIS_Account?.[0]?.CAIS_Account_DETAILS || [];

  const creditAccounts = accountsDetails.map((account: any) => {
    const addressDetails = account.CAIS_Holder_Address_Details?.[0] || {};

    return {
      // Credit Cards / Banks
      creditCard: {
        bankName: getNestedValue(account, "Subscriber_Name"),
        accountNumber: getNestedValue(account, "Account_Number"),
        accountType: getNestedValue(account, "Account_Type"),
        portfolioType: getNestedValue(account, "Portfolio_Type"),
      },

      // Account Details
      openDate: getNestedValue(account, "Open_Date"),
      closedDate: getNestedValue(account, "Date_Closed"),
      creditLimit: getNestedValue(account, "Credit_Limit_Amount"),
      highestCredit: getNestedValue(
        account,
        "Highest_Credit_or_Original_Loan_Amount"
      ),
      currentBalance: getNestedValue(account, "Current_Balance"),
      amountOverdue: getNestedValue(account, "Amount_Past_Due"),
      accountStatus: getNestedValue(account, "Account_Status"),
      dateReported: getNestedValue(account, "Date_Reported"),

      // Addresses
      address: {
        line1: getNestedValue(
          addressDetails,
          "First_Line_Of_Address_non_normalized"
        ),
        line2: getNestedValue(
          addressDetails,
          "Second_Line_Of_Address_non_normalized"
        ),
        line3: getNestedValue(
          addressDetails,
          "Third_Line_Of_Address_non_normalized"
        ),
        city: getNestedValue(addressDetails, "City_non_normalized"),
        state: getNestedValue(addressDetails, "State_non_normalized"),
        pincode: getNestedValue(
          addressDetails,
          "ZIP_Postal_Code_non_normalized"
        ),
      },
    };
  });

  return {
    basicDetails,
    reportSummary,
    creditAccounts,
  };
};

export { extractCreditReportData };
