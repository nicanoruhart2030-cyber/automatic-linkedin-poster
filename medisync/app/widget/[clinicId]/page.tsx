import ChatWidget from '@/components/ChatWidget'

export default function WidgetPage({ params }: { params: { clinicId: string } }) {
  return (
    <div className="h-screen flex flex-col">
      <ChatWidget clinicId={params.clinicId} />
    </div>
  )
}
