import CleanerJobCard from '../CleanerJobCard';
import '@/lib/i18n';

export default function CleanerJobCardExample() {
  return (
    <div className="p-4 max-w-md mx-auto">
      <CleanerJobCard
        job={{
          id: '1',
          clientName: 'Johnson Residence',
          address: '123 Park Ave, Manhattan, NY',
          date: '2024-01-15',
          time: '09:00',
          status: 'scheduled',
          role: 'driver',
          teamMembers: ['Ana Rodriguez', 'Carmen Lopez']
        }}
        onStart={(id) => console.log('Starting job:', id)}
        onComplete={(id) => console.log('Completing job:', id)}
      />
    </div>
  );
}
