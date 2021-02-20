import { BASE_API_URL } from "../env";
import { useQuery } from "react-query";
import axios from "axios";

export default function useSpace(code) {
  const queryKey = ["space", code];
  function query() {
    return new Promise((resolve, reject) => {
      axios
        .get(`${BASE_API_URL}/api/v4/spaces/${code}`)
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
    initialData: { files: [], history: [], users: [] },
  };

  return useQuery(queryKey, query, config);
}
