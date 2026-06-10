const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();
const db = require("../database/db");

const smsId = process.env.SMS_ID;
const smsPass = process.env.SMS_PASS;
const smsEmail = process.env.SMS_EMAIL;

async function sendFast2OTP(number) {
  const token = await getToken();
  const options = {
    method: "POST",
    url: `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&customerId=${smsId}&flowType=SMS&mobileNumber=${number}`,
    headers: {
      authToken: token,
    },
  };

  let verificationId = null;
  let otpError = null;

  try {
    const { data } = await axios(options);
    const { data: otpData } = data;

    const sqlStatement = "INSERT INTO otp (mobile, vid) VALUES(?, ?)";
    await db(sqlStatement, [number, otpData.verificationId]);

    verificationId = otpData.verificationId;
  } catch (error) {
    otpError = error;
  }

  return new Promise((resolve, reject) => {
    if (verificationId) {
      resolve(verificationId);
    } else {
      reject(otpError);
    }
  });
}

async function VerifyFast2OTP(vid, code) {
  const token = await getToken();
  const options = {
    method: "GET",
    url: `https://cpaas.messagecentral.com/verification/v3/validateOtp?verificationId=${vid}&code=${code}`,
    headers: {
      authToken: token,
    },
  };

  let verificationStatus = null;
  let otpVerificationError = null;

  try {
    const { data } = await axios(options);
    const { data: otpData } = data;
    verificationStatus =
      otpData.verificationStatus === "VERIFICATION_COMPLETED";
  } catch (error) {
    console.log("SHOULD NOT BE HERE");
    otpVerificationError = error;
  }

  return new Promise((resolve, reject) => {
    if (verificationStatus) {
      resolve(verificationStatus);
    } else {
      reject(otpVerificationError);
    }
  });
}

async function getToken() {
  const options = {
    method: "GET",
    url: `https://cpaas.messagecentral.com/auth/v1/authentication/token?country=IN&email=${smsEmail}&customerId=${smsId}&key=${smsPass}&scope=NEW`,
    headers: { accept: "*/*" },
  };

  try {
    const response = await axios(options);
    const res = response.data;
    // console.log(res);
    OTPAuthToken = res?.token;
    console.log(OTPAuthToken);
    return OTPAuthToken;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  sendFast2OTP,
  VerifyFast2OTP,
};
