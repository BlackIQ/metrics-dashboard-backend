export const GOOGLE_LOGIN = async (req, res) => {
  return res.status(200).json({ message: "Google Authentication Provider" });
};

export const FACEBOOK_LOGIN = async (req, res) => {
  return res.status(200).json({ message: "Facebook Authentication Provider" });
};

export const MICROSOFT_LOGIN = async (req, res) => {
  return res.status(200).json({ message: "Microsoft Authentication Provider" });
};

export const GITHUB_LOGIN = async (req, res) => {
  return res.status(200).json({ message: "GitHub Authentication Provider" });
};
