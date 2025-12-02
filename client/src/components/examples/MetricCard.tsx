import MetricCard from '../MetricCard';
import { Building2 } from 'lucide-react';

export default function MetricCardExample() {
  return (
    <div className="p-4">
      <MetricCard
        title="Total Companies"
        value={42}
        description="Active cleaning agencies"
        icon={Building2}
        trend={{ value: 12, positive: true }}
      />
    </div>
  );
}
