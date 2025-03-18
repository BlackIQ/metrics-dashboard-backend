// Libs
import crypto from "crypto";

export const generateSecureValue = (length = 20) =>
  crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
