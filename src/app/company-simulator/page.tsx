import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export default function CompanySimulatorPage() {
  return (
    <AppLayout>
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4 w-fit">
                    <Building2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Company Simulator</CardTitle>
                <CardDescription>This feature is coming soon!</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Prepare for interviews with specific companies like Google, Amazon, and more. This section will provide company-specific questions and simulate their entire interview process.
                </p>
            </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
