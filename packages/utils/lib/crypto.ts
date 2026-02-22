export function generate6DigitOtp() {
  // Generate a 6-digit OTP
  const otp: string = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}

export function compareCodes(expected: string, actual: string) {
  return expected.replace(/\s/g, "") === actual.replace(/\s/g, "");
}
