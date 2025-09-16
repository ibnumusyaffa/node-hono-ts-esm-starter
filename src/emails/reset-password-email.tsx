import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  render,
} from "@react-email/components"
import { transporter } from "@/lib/mailer.js"

type TemplateProps = {
  url: string
  name?: string
}

export default function Template({ url, name }: TemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Reset your password to regain access to your account
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Heading style={h1}>Reset Your Password</Heading>
          </Section>

          <Section style={section}>
            <Text style={text}>Hi{name ? ` ${name}` : ""},</Text>
            <Text style={text}>
              We received a request to reset your password. If you made this
              request, click the button below to create a new password.
            </Text>

            <Section style={buttonContainer}>
              <Button href={url} style={button}>
                Reset Password
              </Button>
            </Section>

            <Text style={text}>
              If the button doesn't work, you can also copy and paste this link
              into your browser:
            </Text>
            <Text style={link}>{url}</Text>

            <Text style={text}>
              This link will expire in 1 hour for security reasons.
            </Text>

            <Text style={footer}>
              If you didn't request a password reset, you can safely ignore
              this email. Your password will remain unchanged.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
}

const logoContainer = {
  margin: "32px 0",
  textAlign: "center" as const,
}

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
}

const section = {
  padding: "0 48px",
}

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "left" as const,
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const button = {
  backgroundColor: "#dc2626",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  border: "none",
}

const link = {
  color: "#dc2626",
  fontSize: "14px",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
}

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "48px 0 0 0",
}

export async function send(data: { to: string; url: string; name?: string }) {
  const emailHtml = await render(<Template url={data.url} name={data.name} />)
  await transporter.sendMail({
    to: data.to,
    subject: "Reset your password",
    html: emailHtml,
  })
}
