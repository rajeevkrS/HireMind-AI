import { TryCatch } from "../middleware/trycatch.js";

export const loginUser = TryCatch(async (req, res) => {
  const { email } = req.body;

  res.json(email);
});
