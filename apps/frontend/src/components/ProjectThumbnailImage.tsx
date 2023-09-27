import { CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Image from "mui-image";
import * as React from "react";

import { getPeerTubeThumbnail } from "~services/VideoService";

type ProjectThumbnailImageProps = {
  host: string | undefined | null;
  videoId: string;
  bgColor?: React.CSSProperties["backgroundColor"] | undefined;
  height?: React.CSSProperties["height"] | number | undefined;
  style?: React.CSSProperties | undefined;
  width?: React.CSSProperties["width"] | number | undefined;
};

export const ProjectThumbnailImage: React.FC<ProjectThumbnailImageProps> = ({
  host,
  videoId,
  ...props
}) => {
  const query = useQuery({
    queryKey: ["video", host, videoId],
    queryFn: () =>
      getPeerTubeThumbnail(`https://${host}/api/v1/videos/${videoId}`),
  });

  return (
    <Image
      src={`https://${host}${query.data}`}
      showLoading={<CircularProgress />}
      {...props}
    />
  );
};
