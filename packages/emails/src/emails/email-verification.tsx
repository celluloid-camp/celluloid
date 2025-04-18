import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

const baseUrl = process.env.BASE_URL ?? "";

interface EmailVerificationProps {
  username?: string;
  otp: string;
}

export const EmailVerification = ({
  username = "",
  otp = "123456",
}: EmailVerificationProps) => {
  return (
    <Html>
      <Head />
      <Preview>Vérification de votre email Celluloid</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`${baseUrl}/celluloid-email-logo.png`}
                width="188"
                alt="Celluloid"
                className="my-0 mx-auto"
              />
            </Section>

            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Vérification de votre email
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Bonjour {username}, <br /> Voici votre code de confirmation:
            </Text>

            <Text className="text-black text-3xl leading-[24px] bg-gray-200 rounded-md p-2 text-center">
              <strong>{otp}</strong>
            </Text>

            <Text className="text-black text-[14px] ">
              Veuillez le saisir dans le formulaire prévu à cet effet.
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              L'équipe Celluloid vous souhaite la bienvenue !
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default EmailVerification;
