import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Tunnel: React.FC = () => {
  const { code }: { code: string } = useParams();
  const [url, setUrl] = useState("");

  useEffect(() => {
    axios.get(`/api/tunnels/${code}`).then((res) => {
      setUrl(res.data.url);
      window.location.href = res.data.url;
    });
  }, [code]);

  return <div>Redirecting to {url}</div>;
};

export default Tunnel;
