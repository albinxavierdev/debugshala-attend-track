
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchBatchById, fetchStudentsByBatch, checkAttendance } from '@/lib/supabase';
import { generateDailyBatchCode } from '@/lib/utils';

const CheckInPage = () => {
  const { batchId, code } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [checkInStatus, setCheckInStatus] = useState<'idle' | 'success' | 'error' | 'duplicate'>('idle');
  
  // Validate QR code
  useEffect(() => {
    if (!batchId || !code) {
      toast({
        title: "Invalid QR Code",
        description: "This QR code is not valid.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    // Check if code is valid for today
    const expectedCode = generateDailyBatchCode(batchId);
    if (code !== expectedCode) {
      toast({
        title: "Expired QR Code",
        description: "This QR code has expired. Please scan today's code.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
  }, [batchId, code, navigate, toast]);
  
  const { data: batch } = useQuery({
    queryKey: ['batch', batchId],
    queryFn: () => batchId ? fetchBatchById(batchId) : null,
    enabled: !!batchId,
  });
  
  const { data: students = [] } = useQuery({
    queryKey: ['students', batchId],
    queryFn: () => batchId ? fetchStudentsByBatch(batchId) : [],
    enabled: !!batchId,
  });
  
  const checkInMutation = useMutation({
    mutationFn: () => checkAttendance(selectedStudentId, batchId!),
    onSuccess: (result) => {
      if (result.exists) {
        setCheckInStatus('duplicate');
        toast({
          title: "Already Checked In",
          description: "You've already checked in today.",
          variant: "default",
        });
      } else {
        setCheckInStatus('success');
        toast({
          title: "Check-in Successful",
          description: "Your attendance has been recorded.",
          variant: "default",
        });
      }
    },
    onError: () => {
      setCheckInStatus('error');
      toast({
        title: "Check-in Failed",
        description: "There was an error recording your attendance. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleCheckIn = () => {
    if (!selectedStudentId) {
      toast({
        title: "Student Required",
        description: "Please select your name before checking in.",
        variant: "destructive",
      });
      return;
    }
    
    checkInMutation.mutate();
  };
  
  if (!batch) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-debugshala-600 flex items-center justify-center text-white font-bold mx-auto mb-4">
            D
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Debugshala Check-In</h1>
          <p className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="font-medium text-lg">{batch.name}</h2>
            <p className="text-sm text-gray-500">{batch.time_slot}</p>
          </div>
          
          {checkInStatus === 'idle' ? (
            <>
              <div className="space-y-2">
                <label htmlFor="student" className="block text-sm font-medium text-gray-700">
                  Select your name
                </label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your name" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id!}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleCheckIn} 
                className="w-full bg-debugshala-600 hover:bg-debugshala-700"
                disabled={!selectedStudentId}
              >
                Check In
              </Button>
            </>
          ) : (
            <div className="text-center py-6">
              {checkInStatus === 'success' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-1">Check-In Successful!</h3>
                  <p className="text-gray-500">Your attendance has been recorded.</p>
                </>
              )}
              
              {checkInStatus === 'duplicate' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-1">Already Checked In</h3>
                  <p className="text-gray-500">You've already checked in for today's class.</p>
                </>
              )}
              
              {checkInStatus === 'error' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-1">Check-In Failed</h3>
                  <p className="text-gray-500">There was an error recording your attendance. Please try again.</p>
                  
                  <Button 
                    onClick={() => setCheckInStatus('idle')} 
                    className="mt-4"
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;
