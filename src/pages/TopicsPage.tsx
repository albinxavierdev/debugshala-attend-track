
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
import { fetchTopics, createTopic, updateTopic, deleteTopic, fetchBatches, Topic } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

const TopicsPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Topic>({
    batch_id: '',
    date: new Date().toISOString().slice(0, 10),
    topic: '',
  });
  
  const { data: topics = [] } = useQuery({
    queryKey: ['topics'],
    queryFn: fetchTopics,
  });
  
  const { data: batches = [] } = useQuery({
    queryKey: ['batches'],
    queryFn: fetchBatches,
  });
  
  const createMutation = useMutation({
    mutationFn: createTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      resetForm();
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: (topic: Topic) => updateTopic(topic.id!, topic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      resetForm();
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: deleteTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
  
  const resetForm = () => {
    setFormData({
      batch_id: '',
      date: new Date().toISOString().slice(0, 10),
      topic: '',
    });
    setSelectedTopic(null);
    setIsDialogOpen(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTopic?.id) {
      updateMutation.mutate({ ...formData, id: selectedTopic.id });
    } else {
      createMutation.mutate(formData);
    }
  };
  
  const handleEdit = (topic: Topic) => {
    setSelectedTopic(topic);
    setFormData({
      batch_id: topic.batch_id,
      date: new Date(topic.date).toISOString().slice(0, 10),
      topic: topic.topic,
    });
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <MobileNavBar />
      <MainLayout>
        <PageHeader 
          title="Topics" 
          description="Track topics covered in each batch"
          onAddNew={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          addNewText="Add Topic"
        />
        
        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No topics found. Add your first topic to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  topics.map((topic) => (
                    <TableRow key={topic.id}>
                      <TableCell>{new Date(topic.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{topic.topic}</TableCell>
                      <TableCell>{topic.batch_name}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(topic)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => topic.id && handleDelete(topic.id)}
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
        
        {/* Add/Edit Topic Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedTopic ? 'Edit Topic' : 'Add New Topic'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
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
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="topic">Topic Covered</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-debugshala-600 hover:bg-debugshala-700">
                  {selectedTopic ? 'Update Topic' : 'Add Topic'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </MainLayout>
    </>
  );
};

export default TopicsPage;
