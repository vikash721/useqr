import axios from "axios";

const baseURL =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_APP_URL ?? "";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
