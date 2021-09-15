import { NextApiHandler } from "next"
import { z } from "zod"
import { getClient } from "../../../db/client"
import { createSessionHelpers } from "../../../db/session"

const bodySchema = z.object({
  name: z.string(),
})

const db = getClient()

const handler: NextApiHandler = async (req, res) => {
  const body = bodySchema.parse(req.body)

  const user = await createSessionHelpers({ req, res }).getUser()
  if (!user) {
    res.status(401).end()
    return
  }

  const bucket = await db.bucket.create({
    data: {
      name: body.name,
      ownerId: user.id,
    },
  })

  res.redirect(`/buckets/${bucket.id}`)
}
export default handler