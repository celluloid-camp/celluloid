import { useQuery } from "@tanstack/react-query";

import UserService from "~services/UserService";


export const useMe = () => useQuery({
  queryKey: ['me'],
  queryFn: () => UserService.me(),
})

