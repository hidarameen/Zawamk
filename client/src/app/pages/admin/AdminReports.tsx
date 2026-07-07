import { motion } from 'motion/react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { FileUpload } from '../../components/ui/FileUpload';

import { useState } from 'react';

export default function AdminReports() {
  const [reports, setReports] = useState([
    { id: 1, type: 'محتوى غير لائق', track: 'زامل تجريبية', reporter: 'محمد أحمد', status: 'pending' },
    { id: 2, type: 'انتهاك حقوق', track: 'زامل أخرى', reporter: 'فاطمة علي', status: 'pending' },
  ]);

  const handleAction = (id: number) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2">البلاغات والتقارير</h1>
        <p className="text-muted-foreground">مراجعة البلاغات المقدمة من المستخدمين</p>
      </motion.div>

      <div className="space-y-4">
        {reports.map((report) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-secondary/50 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold mb-2">{report.type}</h3>
                  <p className="text-muted-foreground mb-1">الزامل: {report.track}</p>
                  <p className="text-sm text-muted-foreground">المبلغ: {report.reporter}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(report.id)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  قبول
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAction(report.id)}>
                  رفض
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
