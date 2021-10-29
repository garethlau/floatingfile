import { BASE_API_URL } from "../env";
import { useQuery } from "react-query";
import axios from "axios";
import { Space } from "@floatingfile/common";

export default function useSpace(code: string) {
  return useQuery<Space>(
    ["space", code],
    () => {
      return axios
        .get(`${BASE_API_URL}/api/v5/spaces/${code}`)
        .then((response) => response.data.space);
    },
    {
      enabled: !!code,
      refetchOnWindowFocus: true,
      staleTime: 60 * 1000, // 1 minute
    }
  );
}
