
import { useQuery } from "@tanstack/react-query";

import AnnotationService from "~services/AnnotationService";

export const useGetAnnotationsQuery = (projectId: string) => useQuery({
  queryKey: ['annotation', projectId],
  queryFn: () => AnnotationService.list(projectId),
})

