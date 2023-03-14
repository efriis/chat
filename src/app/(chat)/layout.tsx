export const metadata = {
  title: 'e3k',
  description: 'Erick\'s chatbot',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>{children}</div>
  )
}
