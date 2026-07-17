export default async function VoicePage({
  params,
}: {
  params: Promise<{ voiceId: string }>
}) {
  const { voiceId } = await params
  return <div>Voice: {voiceId}</div>
}
