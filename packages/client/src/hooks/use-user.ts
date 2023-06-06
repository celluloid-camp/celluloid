import { useQuery } from "@tanstack/react-query";

import ProjectService from "~services/ProjectService";
import UserService from "~services/UserService";


export const useMe = () => useQuery({
  queryKey: ['me'],
  queryFn: () => UserService.me(),
})


export const useProjects = (term?: string) => useQuery({
  queryKey: ['projects', term],
  queryFn: () => ProjectService.list(term),
})
