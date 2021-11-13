import { handle, json, redirect } from "next-runtime"
import { Form, useFormSubmit } from "next-runtime/form"
import { FetchError } from "next-runtime/lib/fetch-error"
import Link from "next/link"
import { z } from "zod"
import { AppHead } from "../modules/app/AppHead"
import { AuthPageLayout } from "../modules/auth/AuthPageLayout"
import { sessionHelpers } from "../modules/auth/session"
import { Button } from "../modules/dom/Button"
import { httpCodes } from "../modules/network/http-codes"
import { anchorClass } from "../modules/ui/anchor"
import { solidButtonClass } from "../modules/ui/button"
import { TextInputField } from "../modules/ui/TextInputField"
import { loginUser } from "../modules/user"

type Response = {
  errorMessage?: string
}

const loginBodySchema = z.object({
  email: z.string().email(`Must be a valid email`),
  password: z.string(),
})

export const getServerSideProps = handle<Response>({
  async get(context) {
    const user = await sessionHelpers(context).getUser()
    return user ? redirect("/buckets") : json({})
  },

  async post(context) {
    const body = loginBodySchema.parse(context.req.body)
    const user = await loginUser(body)
    if (!user) {
      return json(
        { errorMessage: "Invalid email or password" },
        httpCodes.unauthorized,
      )
    }

    await sessionHelpers(context).create(user)
    return redirect("/buckets", httpCodes.seeOther)
  },
})

export default function LoginPage() {
  const submit = useFormSubmit()

  return (
    <AuthPageLayout title="log in">
      <AppHead title="log in" />
      <Form method="post" className={AuthPageLayout.formClass}>
        <TextInputField.Email name="email" required />
        <TextInputField.Password
          name="password"
          required
          isNewPassword={false}
        />
        <Button
          className={solidButtonClass}
          type="submit"
          loading={submit.isLoading}
        >
          log in
        </Button>
      </Form>

      {submit.error instanceof FetchError ? (
        <AuthPageLayout.Paragraph>
          {submit.error.data?.errorMessage as string}
        </AuthPageLayout.Paragraph>
      ) : null}

      <AuthPageLayout.Paragraph>
        {"don't have an account? "}
        <Link href="/signup">
          <a className={anchorClass}>sign up</a>
        </Link>
      </AuthPageLayout.Paragraph>
    </AuthPageLayout>
  )
}