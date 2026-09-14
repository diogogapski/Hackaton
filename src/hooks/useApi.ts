"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/src/lib/api-client";

/** GET com estado de carregamento/erro e `reload`. `path` nulo não dispara a requisição. */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    if (!path) return;
    let ativo = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- início da requisição
    setLoading(true);
    api<T>(path)
      .then((json) => {
        if (!ativo) return;
        setData(json);
        setError(null);
      })
      .catch((e: Error) => ativo && setError(e))
      .finally(() => ativo && setLoading(false));
    return () => {
      ativo = false;
    };
  }, [path, versao]);

  const reload = useCallback(() => setVersao((v) => v + 1), []);
  return { data, error, loading, reload };
}
