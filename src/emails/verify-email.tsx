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

interface TemplateProps {
  url: string
  name?: string
}

function Template({ url, name }: TemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Verify your email address to complete your account setup
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Heading style={h1}>Verify Your Email</Heading>
          </Section>

          <Section style={section}>
            <Text style={text}>Hi{name ? ` ${name}` : ""},</Text>
            <Text style={text}>
              Welcome! To complete your account setup and start using our
              service, please verify your email address by clicking the button
              below.
            </Text>

            <Section style={buttonContainer}>
              <Button href={url} style={button}>
                Verify Email Address
              </Button>
            </Section>

            <Text style={text}>
              If the button doesn't work, you can also copy and paste this link
              into your browser:
            </Text>
            <Text style={link}>{url}</Text>

            <Text style={text}>
              This link will expire in 24 hours for security reasons.
            </Text>

            <Text style={footer}>
              If you didn't create an account with us, you can safely ignore
              this email.
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
  backgroundColor: "#3b82f6",
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
  color: "#3b82f6",
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
    subject: "Verify your email address",
    html: emailHtml,
  })
}
