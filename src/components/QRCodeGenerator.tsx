
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from '@/components/ui/card';
import { Batch } from '@/lib/supabase';
import { generateDailyBatchCode } from '@/lib/utils';

interface QRCodeGeneratorProps {
  batch: Batch;
  baseUrl: string;
}

export const QRCodeGenerator = ({ batch, baseUrl }: QRCodeGeneratorProps) => {
  const batchCode = generateDailyBatchCode(batch.id || '');
  const checkInUrl = `${baseUrl}/check-in/${batch.id}/${batchCode}`;
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 flex flex-col items-center">
        <h3 className="font-medium text-lg mb-2">{batch.name}</h3>
        <p className="text-sm text-gray-500 mb-4">
          Scan to check-in for today ({new Date().toLocaleDateString()})
        </p>
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <QRCodeSVG value={checkInUrl} size={200} />
        </div>
        <p className="mt-4 text-xs text-gray-500">QR Code valid for today only</p>
      </CardContent>
    </Card>
  );
};
