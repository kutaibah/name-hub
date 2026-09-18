'use client';

import { useState } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { isDemoMode } from '@/lib/cns/config';
import { setDemoScenario, getDemoScenario, type DemoRegistrationScenario } from '@/lib/cns/demo-fixtures';
import { cn } from '@/lib/utils';

const scenarios: { value: DemoRegistrationScenario; label: string; description: string }[] = [
  {
    value: 'success',
    label: 'Success',
    description: 'Registration completes successfully',
  },
  {
    value: 'rejected_approval',
    label: 'Rejected Approval',
    description: 'User declines the wallet subscription',
  },
  {
    value: 'insufficient_funds',
    label: 'Insufficient Funds',
    description: 'Not enough Canton Coin for payment',
  },
  {
    value: 'processing_slow',
    label: 'Slow Processing',
    description: 'Payment takes longer than usual',
  },
  {
    value: 'service_error',
    label: 'Service Error',
    description: 'Backend service returns an error',
  },
];

export function DemoControls() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<DemoRegistrationScenario>(getDemoScenario());

  if (!isDemoMode()) {
    return null;
  }

  const handleScenarioChange = (scenario: DemoRegistrationScenario) => {
    setDemoScenario(scenario);
    setCurrentScenario(scenario);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={cn(
        'w-80 shadow-lg border-warning/50',
        !isOpen && 'w-auto'
      )}>
        <CardHeader 
          className="py-3 px-4 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <CardTitle className="text-sm font-medium">Demo Controls</CardTitle>
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </div>
        </CardHeader>

        {isOpen && (
          <CardContent className="pt-0 pb-4">
            <p className="text-xs text-muted-foreground mb-3">
              Control how demo registrations behave
            </p>
            
            <div className="space-y-2">
              {scenarios.map(scenario => (
                <button
                  key={scenario.value}
                  onClick={() => handleScenarioChange(scenario.value)}
                  className={cn(
                    'w-full text-left p-2 rounded-md transition-colors',
                    currentScenario === scenario.value
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{scenario.label}</span>
                    {currentScenario === scenario.value && (
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    )}
                  </div>
                  <p className={cn(
                    'text-xs mt-0.5',
                    currentScenario === scenario.value
                      ? 'text-primary-foreground/80'
                      : 'text-muted-foreground'
                  )}>
                    {scenario.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
