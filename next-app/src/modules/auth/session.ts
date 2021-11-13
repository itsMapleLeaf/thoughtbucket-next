import type { Session, User } from "@prisma/client"
import Cookies from "cookies"
import type { IncomingMessage, ServerResponse } from "http"
import { getClient } from "../db"

const sessionCookieName = "session"

const cookieOptions = {
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
  secure:
    process.env.NODE_ENV === "production" &&
    // the app is built with production even when setting the node env to test,
    // so we need this extra env variable to explicitly disable https cookies during tests
    process.env.COOKIE_SECURE !== "false",
  signed: false,
}

export function sessionHelpers({
  req,
  res,
}: {
  req: IncomingMessage
  res: ServerResponse
}) {
  const db = getClient()
  const cookies = new Cookies(req, res, cookieOptions)

  const helpers = {
    async get(): Promise<Session | undefined> {
      const id = cookies.get(sessionCookieName, cookieOptions)
      if (!id) return

      const session = await db.session.findUnique({
        where: { id },
      })
      return session ?? undefined
    },

    async create(user: { id: string }): Promise<void> {
      const session = await db.session.upsert({
        where: { userId: user.id },
        update: { userId: user.id },
        create: { userId: user.id },
        select: { id: true },
      })
      cookies.set(sessionCookieName, session.id, cookieOptions)
    },

    async delete(): Promise<void> {
      const session = await helpers.get()
      if (session) {
        await db.session.delete({ where: { id: session.id } })
      }
      cookies.set(sessionCookieName, null, cookieOptions)
    },

    async getUser(): Promise<User | undefined> {
      const session = await helpers.get()
      if (!session) return

      const user = await db.user.findUnique({
        where: { id: session.userId },
      })
      return user ?? undefined
    },
  }

  return helpers
}