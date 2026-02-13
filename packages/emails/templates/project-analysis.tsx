import {
  Body,
  Button,
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

interface ProjectAnalysisEmailProps {
  projectId: string;
  projectTitle: string;
}

const baseUrl = process.env.BASE_URL ? `https://${process.env.BASE_URL}` : "";

export const ProjectAnalysisEmail = ({
  projectId = "john.doe@example.com",
  projectTitle = "Project Title",
}: ProjectAnalysisEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Analyse terminée pour le projet {projectTitle}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`${baseUrl}/celluloid-email-logo.png`}
                width="188"
                alt="Celluloid"
                className="my-0 "
              />
            </Section>

            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Analyse terminée pour le projet {projectTitle}
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Bonjour, <br />
              L'analyse du projet {projectTitle} est terminée.
            </Text>

            <Text className="text-black text-[14px] ">
              Vous pouvez désormais accéder à l'analyse du projet {projectTitle}
              en cliquant sur le lien suivant : <br />
              <strong>{`${baseUrl}/project/${projectId}`}</strong>
            </Text>

            <Button href={`${baseUrl}/project/${projectId}`}>
              Accéder au projet
            </Button>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ProjectAnalysisEmail;
