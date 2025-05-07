import Typography, { type TypographyProps } from "@mui/material/Typography";
import React, { useMemo } from "react";

type MultiLineTypographyProps = TypographyProps & {
  text: string;
  lineLimit?: number;
};

export const MultiLineTypography: React.FC<MultiLineTypographyProps> =
  React.memo(({ text, lineLimit, ...props }) => {
    const lines = useMemo(() => text.split("\n"), [text]);
    const truncatedLines = lineLimit ? lines.slice(0, lineLimit) : lines;

    return (
      <Typography component="div">
        {truncatedLines.map((line, index) => (
          <React.Fragment key={line}>
            <Typography component="span" {...props}>
              {line}
            </Typography>
            {index === truncatedLines.length - 1 &&
              lineLimit &&
              lines.length > lineLimit && (
                <Typography component="span" {...props}>
                  ...
                </Typography>
              )}
            {index < truncatedLines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </Typography>
    );
  });
