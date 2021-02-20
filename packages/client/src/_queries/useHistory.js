import axios from "axios";
import { BASE_API_URL } from "../env";
import { useQuery } from "react-query";

export default function useHistory(code) {
  const queryKey = ["space", code, "history"];

  function query() {
    return new Promise((resolve, reject) => {
      axios
        .get(`${BASE_API_URL}/api/v4/spaces/${code}/history`)
        .then((response) => {
          const { history } = response.data;
          resolve(history);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  const config = { initialData: [], enabled: !!code };
  return useQuery(queryKey, query, config);
}
