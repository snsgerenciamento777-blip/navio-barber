import { createContext } from "@navio-barber/api";
import { prisma } from "@navio-barber/database";
import { auth } from "@navio-barber/auth";

export const createAPIContext = async (headers: Headers) => {
  let session = null;
  try {
    session = (await auth.api.getSession({ headers })) ?? null;
  } catch {
    session = null;
  }

  return createContext({
    prisma,
    session: session ?? null,
    headers,
  });
};
