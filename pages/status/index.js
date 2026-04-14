import useSWR from "swr"
async function fetchStatus(){
    const response = await fetch("/api/v1/status")
    const responseBody = await response.json();
    return responseBody
}
export default function StatusPage() {
  const {data, error, isLoading} = useSWR("status", fetchStatus, {
    refreshInterval: 2000,
  })
  if (isLoading){
    return (
      <>
      Carregando...
      </>
    )
  }
  if (error){
    return(
      <>erro: {error}</>
    )
  }
  const database = data.dependencies.database
  let updated_atText = new Date(data.updated_at).toLocaleString("pt-BR")
  return (
    <>
      <h1>Status</h1>
      <div>Status do banco: {database.status}</div>
      <div>Nome do banco: {database.name}</div>
      <div>Versão: {database.version}</div>
      <div>Conexões em uso: {database.connections.used}</div>
      <div>Conexões máximas: {database.connections.max}</div>
      <h2>Atualizado em: {updated_atText}</h2>
    </>
  );
}


/*
function UpdatedAt(){
  const {isLoading, data} = useSWR("status", fetchStatus, {
    refreshInterval: 2000,
  });
  let updatedAtText = "Carregando ..."
  if(!isLoading && data){
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR")
  }
  return <div>Ultima atualizacao: {updatedAtText}</div>
}
*/