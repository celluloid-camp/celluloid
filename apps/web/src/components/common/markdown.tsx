import { Typography } from "@mui/material";
import Markdown from "react-markdown";
import { memo } from "react";

export const StyledMarkdown = memo(({ content }: { content: string }) => {
  return (
    <Markdown
      components={{
        p: (props) => {
          return <Typography variant="body1" sx={{ mb: 1 }} {...props} />;
        },
      }}
    >
      {content}
    </Markdown>
  );
});
