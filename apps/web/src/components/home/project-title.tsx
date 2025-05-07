import { Fade } from "@mui/material";
import { useTranslations } from "next-intl";
import { StyledTitle } from "@/components/common/typography";

interface ProjectTitleProps {
  ownProjectsLength: number;
  joinedProjectsLength: number;
}

export default function ProjectTitle({
  ownProjectsLength,
  joinedProjectsLength,
}: ProjectTitleProps) {
  const t = useTranslations();

  return (
    <Fade in={true} appear={true}>
      <StyledTitle
        sx={{
          marginBottom: 2,
        }}
        variant="h4"
      >
        {ownProjectsLength > 0
          ? t("home.myProjects")
          : joinedProjectsLength > 0
            ? t("home.member")
            : t("home.publicProjects")}
      </StyledTitle>
    </Fade>
  );
}
