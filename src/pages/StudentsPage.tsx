
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MobileNavBar } from '@/components/MobileNavBar';
import { PageHeader } from '@/components/ui/PageHeader';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchStudents, createStudent, updateStudent, deleteStudent, fetchBatches, Student } from '@/lib/supabase';

const StudentsPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Student>({
    name: '',
    contact: '',
    batch_id: '',
  });
  
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: fetchStudents,
  });
  
  const { data: batches = [] } = useQuery({
    queryKey: ['batches'],
    queryFn: fetchBatches,
  });
  
  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      resetForm();
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: (student: Student) => updateStudent(student.id!, student),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      resetForm();
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
  
  const resetForm = () => {
    setFormData({
      name: '',
      contact: '',
      batch_id: '',
    });
    setSelectedStudent(null);
    setIsDialogOpen(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStudent?.id) {
      updateMutation.mutate({ ...formData, id: selectedStudent.id });
    } else {
      createMutation.mutate(formData);
    }
  };
  
  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      contact: student.contact,
      batch_id: student.batch_id,
    });
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <MobileNavBar />
      <MainLayout>
        <PageHeader 
          title="Students" 
          description="Manage all your students"
          onAddNew={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          addNewText="Add Student"
        />
        
        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No students found. Add your first student to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.contact}</TableCell>
                      <TableCell>{student.batch_name}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(student)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => student.id && handleDelete(student.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Add/Edit Student Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Student Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact">Contact Number</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="batch">Batch</Label>
                  <Select 
                    value={formData.batch_id} 
                    onValueChange={(value) => setFormData({ ...formData, batch_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id!}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-debugshala-600 hover:bg-debugshala-700">
                  {selectedStudent ? 'Update Student' : 'Create Student'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </MainLayout>
    </>
  );
};

export default StudentsPage;
