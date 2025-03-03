import UploadForm from './components/UploadForm';

// Add generateStaticParams for static export
export async function generateStaticParams() {
  // Since this is a mobile upload page that needs to handle any user ID,
  // we'll generate a few example paths and handle the rest on the client
  return [
    { userId: 'example1' },
    { userId: 'example2' },
    { userId: 'example3' },
  ];
}

export default function MobileUploadPage({
  params,
}: {
  params: { userId: string };
}) {
  return <UploadForm userId={params.userId} />;
} 