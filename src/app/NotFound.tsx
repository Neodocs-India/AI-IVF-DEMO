import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';

export default function NotFound() {
  return (
    <>
      <PageHeader title="Page not found" meta="This address does not match any screen." />
      <Link to="/" className="text-sm text-lagoon hover:underline">
        Go to Command Centre
      </Link>
    </>
  );
}
