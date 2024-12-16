import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ForgetPasswordEmailProps {
  username?: string;
  email: string;
  otp: string;
}

const baseUrl = process.env.BASE_URL ? `https://${process.env.BASE_URL}` : "";

export const ForgetPasswordEmail = ({
  username = "",
  email = "john.doe@example.com",
  otp = "123456",
}: ForgetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Réinitialisation de mot de passe Celluloid</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`${baseUrl}/static/celluloid-logo.png`}
                width="188"
                alt="Celluloid"
                className="my-0 "
              />
            </Section>

            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Réinitialisation de mot de passe
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Bonjour {username}, <br />
              Nous avons reçu une demande de réinitialisation de mot de passe
              pour l'adresse email {email}
            </Text>

            <Text className="text-black text-[14px] ">
              Voici votre code de confirmation :
            </Text>

            <Text className="text-black text-3xl leading-[24px] bg-gray-200 rounded-md p-2 text-center">
              <strong>{otp}</strong>
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

export default ForgetPasswordEmail;
