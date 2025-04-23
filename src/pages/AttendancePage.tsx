
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MobileNavBar } from '@/components/MobileNavBar';
import { PageHeader } from '@/components/ui/PageHeader';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { fetchAttendance, fetchBatches, fetchAttendanceByBatch } from '@/lib/supabase';
import { formatDate, formatTime } from '@/lib/utils';

const AttendancePage = () => {
  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');
  
  const { data: batches = [] } = useQuery({
    queryKey: ['batches'],
    queryFn: fetchBatches,
  });
  
  const { data: allAttendance = [] } = useQuery({
    queryKey: ['attendance'],
    queryFn: fetchAttendance,
  });
  
  const { data: filteredAttendance = [] } = useQuery({
    queryKey: ['attendance', selectedBatchId],
    queryFn: () => selectedBatchId === 'all' ? fetchAttendance() : fetchAttendanceByBatch(selectedBatchId),
    enabled: selectedBatchId !== 'all',
  });
  
  const attendance = selectedBatchId === 'all' ? allAttendance : filteredAttendance;
  
  const handleBatchChange = (value: string) => {
    setSelectedBatchId(value);
  };
  
  // Group attendance by date
  const attendanceByDate = attendance.reduce((acc, record) => {
    const date = new Date(record.timestamp || '').toLocaleDateString();
    
    if (!acc[date]) {
      acc[date] = [];
    }
    
    acc[date].push(record);
    return acc;
  }, {} as Record<string, any[]>);
  
  const sortedDates = Object.keys(attendanceByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <>
      <MobileNavBar />
      <MainLayout>
        <PageHeader 
          title="Attendance Records" 
          description="View all student attendance"
        />
        
        <div className="mb-6">
          <div className="flex items-center space-x-2 max-w-xs">
            <span className="text-sm font-medium text-gray-700">Filter by batch:</span>
            <Select value={selectedBatchId} onValueChange={handleBatchChange}>
              <SelectTrigger>
                <SelectValue placeholder="All batches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All batches</SelectItem>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id!}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {sortedDates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No attendance records found.</p>
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date} className="mb-8">
              <h3 className="text-lg font-semibold mb-4">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <div className="bg-white rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Batch</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceByDate[date].map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{formatTime(record.timestamp || '')}</TableCell>
                          <TableCell className="font-medium">{record.student_name}</TableCell>
                          <TableCell>{record.batch_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ))
        )}
      </MainLayout>
    </>
  );
};

export default AttendancePage;
