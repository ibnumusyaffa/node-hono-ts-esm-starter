import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
} from "jsx-email"

type Props = {
  name: string
  link: string
}

export const ForgotPasswordEmail = ({ name, link }: Props) => (
  <Html>
    <Head />
    <Preview>
      The sales intelligence platform that helps you uncover qualified leads.
    </Preview>
    <Tailwind>
      <Body
        style={{
          backgroundColor: "#ffffff",
          fontFamily:
            '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
        }}
      >
        <Container className="mx-auto py-[20px] px-[12px] md:py-[40px] md:px-0 lg:py-[48px] lg:px-0">
          <Img
            src="https://jsx.email/assets/demo/koala-logo.png"
            width="170"
            height="50"
            alt="Koala"
            style={{
              margin: "0 auto",
            }}
          />
          <p className="text-[16px] text-gray-800">Hi {name},</p>
          <p className="text-[16px] text-gray-800">
            Someone recently requested a password change for your account. If
            this was you, you can set a new password here:
          </p>
          <Section>
            <Button
              className="bg-[#5F51E8] rounded text-white text-[16px] p-[12px] no-underline block"
              href={link}
            >
              Reset Password
            </Button>
          </Section>
          <p className="text-[16px] text-gray-800">
            If you don't want to change your password or didn't request this,
            just ignore and delete this message.
          </p>

          <p className="text-[16px] text-gray-800">
            Thanks,
            <br />
            The Koala team
          </p>
          <Hr
            style={{
              borderColor: "#cccccc",
              margin: "20px 0",
            }}
          />
          <p className="text-[12px] text-gray-500">
            408 Warren Rd - San Mateo, CA 94402
          </p>
        </Container>
      </Body>
    </Tailwind>
  </Html>
)

ForgotPasswordEmail.PreviewProps = {
  name: "Bruce",
  link: "http://example.com",
} as Props

export default ForgotPasswordEmail
