import { Button, Html, render } from "@react-email/components"
import { transporter } from "@/lib/mailer.js"

export default function Email({ url }: { url: string }) {
  return (
    <Html>
      <Button
        href={url}
        style={{ background: "#000", color: "#fff", padding: "12px 20px" }}
      >
        Click link to verify your email
      </Button>
    </Html>
  )
}

export async function sendEmail(data: {
  to: string
  subject: string
  url: string
}) {
  const emailHtml = await render(<Email url={data.url} />)

  await transporter.sendMail({
    to: data.to,
    subject: data.subject,
    html: emailHtml,
  })
}
