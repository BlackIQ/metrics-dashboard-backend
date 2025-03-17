// Libs
import crypto from "crypto";

export const generateSecureValue = () => crypto.randomBytes(10).toString("hex");
