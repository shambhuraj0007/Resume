'use client';

import { useEffect, useState } from 'react';
import { History, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface AnalysisRecord {
  _id: string;
  analysisType: string;
  creditsUsed: number;
  fileName?: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  createdAt: string;
}

export default function AnalysisHistory() {
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/credits/history?limit=20');
      const data = await response.json();
      
      if (response.ok) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case 'resume_analysis':
        return 'Resume Analysis';
      case 'resume_creation':
        return 'Resume Creation';
      case 'resume_edit':
        return 'Resume Edit';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Analysis History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Analysis History
        </CardTitle>
        <CardDescription>
          Your recent resume analyses and activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No analysis history yet</p>
            <p className="text-sm">Start analyzing resumes to see your history here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record) => (
              <div
                key={record._id}
                className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {record.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">
                        {getAnalysisTypeLabel(record.analysisType)}
                      </p>
                      <Badge variant={record.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                        {record.status}
                      </Badge>
                    </div>
                    {record.fileName && (
                      <p className="text-sm text-muted-foreground truncate">
                        {record.fileName}
                      </p>
                    )}
                    {record.errorMessage && (
                      <p className="text-xs text-red-500 mt-1">
                        {record.errorMessage}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(record.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-medium">
                    {record.creditsUsed} {record.creditsUsed === 1 ? 'credit' : 'credits'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
