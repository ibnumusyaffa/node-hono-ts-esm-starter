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
  Text
} from "jsx-email"

type Props = {
  name: string
  link: string
}

export const templateName = "ForgotPasswordEmail"

export const Template = ({ name, link }: Props) => (
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
        <Container alignment="left" className="mx-auto py-[20px] px-[12px] md:py-[40px] md:px-0 lg:py-[48px] lg:px-0 text-left">
          <Img
            src="https://jsx.email/assets/demo/koala-logo.png"
            width="170"
            height="50"
            alt="Koala"
            style={{
              margin: "0 auto",
            }}
          />
          <Text className="text-[16px] text-gray-800">Hi {name},</Text>
          <Text className="text-[16px] text-gray-800">
            Someone recently requested a password change for your account. If
            this was you, you can set a new password here:
          </Text>
          <Section>
            <Button
              className="bg-[#5F51E8] rounded-lg text-white text-[16px] p-[12px] no-underline block"
              href={link}
              align="center"
              width={1000}
              borderRadius={4}
              
              height={25}
            >
              Reset Password
            </Button>
          </Section>
          <Text className="text-[16px] text-gray-800">
            If you don't want to change your password or didn't request this,
            just ignore and delete this message.
          </Text>

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

export const PreviewProps = {
  name: "Bruce",
  link: "http://example.com",
} as Props
