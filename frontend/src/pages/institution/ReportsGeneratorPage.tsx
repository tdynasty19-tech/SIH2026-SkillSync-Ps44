import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileText, Download } from 'lucide-react';

export const ReportsGeneratorPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Regulatory Reports Generator</h1>
      <p className="text-slate-600">Generate compliance and accreditation reports in one click.</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <FileText className="text-indigo-600" />
            <CardTitle>NAAC Accreditation Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">Includes student progression, placement data, and industry collaboration metrics required for NAAC criterion 5 & 3.</p>
            <Button className="w-full"><Download size={16} className="mr-2" /> Generate PDF</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <FileText className="text-indigo-600" />
            <CardTitle>NBA Compliance Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">Focuses on outcome-based education metrics, program outcomes (POs) attainment, and placement statistics.</p>
            <Button className="w-full"><Download size={16} className="mr-2" /> Generate PDF</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
