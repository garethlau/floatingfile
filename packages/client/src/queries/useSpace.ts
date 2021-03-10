import { BASE_API_URL } from "../env";
import { useQuery } from "react-query";
import axios from "axios";
import { Space } from "@floatingfile/types";

export default function useSpace(code: string) {
  const queryKey = ["space", code];
  function query(): Promise<Space> {
    return new Promise((resolve, reject) => {
      axios
        .get(`${BASE_API_URL}/api/v5/spaces/${code}`)
        .then((response) => {
          const { space } = response.data;
          resolve(space);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  }
  const config = {
    enabled: !!code,
    refetchOnWindowFocus: true,
  };

  return useQuery(queryKey, query, config);
}
