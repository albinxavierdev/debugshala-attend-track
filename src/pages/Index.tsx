
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MobileNavBar } from '@/components/MobileNavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, BookOpen, ClipboardCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchBatches, fetchStudents, fetchTopics, fetchAttendance } from '@/lib/supabase';
import { Link } from 'react-router-dom';

const Index = () => {
  const { data: batches = [] } = useQuery({
    queryKey: ['batches'],
    queryFn: fetchBatches,
  });
  
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: fetchStudents,
  });
  
  const { data: topics = [] } = useQuery({
    queryKey: ['topics'],
    queryFn: fetchTopics,
  });
  
  const { data: attendance = [] } = useQuery({
    queryKey: ['attendance'],
    queryFn: fetchAttendance,
  });

  // Get today's attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayAttendance = attendance.filter(a => {
    const attendanceDate = new Date(a.timestamp || '');
    return attendanceDate >= today;
  });

  return (
    <>
      <MobileNavBar />
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Debugshala</h1>
          <p className="text-gray-500">Manage your batches, students, and attendance.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-sm hover:shadow transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-500 text-sm font-normal">Total Batches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold">{batches.length}</span>
                  <CalendarDays className="h-8 w-8 text-debugshala-500" />
                </div>
                <Link to="/batches" className="text-sm text-debugshala-600 mt-4 inline-block">
                  View all batches
                </Link>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-500 text-sm font-normal">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold">{students.length}</span>
                  <Users className="h-8 w-8 text-debugshala-500" />
                </div>
                <Link to="/students" className="text-sm text-debugshala-600 mt-4 inline-block">
                  View all students
                </Link>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-500 text-sm font-normal">Today's Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold">{todayAttendance.length}</span>
                  <ClipboardCheck className="h-8 w-8 text-debugshala-500" />
                </div>
                <Link to="/attendance" className="text-sm text-debugshala-600 mt-4 inline-block">
                  View attendance
                </Link>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-500 text-sm font-normal">Topics Covered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold">{topics.length}</span>
                  <BookOpen className="h-8 w-8 text-debugshala-500" />
                </div>
                <Link to="/topics" className="text-sm text-debugshala-600 mt-4 inline-block">
                  View all topics
                </Link>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                {attendance.slice(0, 5).length > 0 ? (
                  <div className="space-y-4">
                    {attendance.slice(0, 5).map((record) => (
                      <div key={record.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{record.student_name}</p>
                          <p className="text-sm text-gray-500">{record.batch_name}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(record.timestamp || '').toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">No attendance records found</div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Topics</CardTitle>
              </CardHeader>
              <CardContent>
                {topics.slice(0, 5).length > 0 ? (
                  <div className="space-y-4">
                    {topics.slice(0, 5).map((topic) => (
                      <div key={topic.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{topic.topic}</p>
                          <p className="text-sm text-gray-500">{topic.batch_name}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(topic.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">No topics recorded yet</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default Index;
