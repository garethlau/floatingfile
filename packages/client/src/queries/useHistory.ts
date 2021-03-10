import axios from "axios";
import { BASE_API_URL } from "../env";
import { useQuery } from "react-query";
import { HistoryRecord } from "@floatingfile/types";

export default function useHistory(code: string) {
  const queryKey = ["space", code, "history"];

  function query(): Promise<Array<HistoryRecord>> {
    return new Promise((resolve, reject) => {
      axios
        .get(`${BASE_API_URL}/api/v5/spaces/${code}/history`)
        .then((response) => {
          const { history } = response.data;
          resolve(history);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  const config = { enabled: !!code };
  return useQuery(queryKey, query, config);
}
