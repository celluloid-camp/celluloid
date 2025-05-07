import bcrypt from "bcryptjs";

export function hashPassword(password: string) {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
}

export function generateOtp() {
  // Generate a 4-digit OTP
  const otp: string = Math.floor(1000 + Math.random() * 9000).toString();
  return otp;
}

export function compareCodes(expected: string, actual: string) {
  return expected.replace(/\s/g, "") === actual.replace(/\s/g, "");
}
