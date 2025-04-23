
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
import { fetchBatches, createBatch, updateBatch, deleteBatch, Batch } from '@/lib/supabase';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';

const BatchesPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrBatch, setQrBatch] = useState<Batch | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Batch>({
    name: '',
    time_slot: '',
    type: 'Existing',
  });
  
  const { data: batches = [] } = useQuery({
    queryKey: ['batches'],
    queryFn: fetchBatches,
  });
  
  const createMutation = useMutation({
    mutationFn: createBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      resetForm();
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: (batch: Batch) => updateBatch(batch.id!, batch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      resetForm();
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: deleteBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
  
  const resetForm = () => {
    setFormData({
      name: '',
      time_slot: '',
      type: 'Existing',
    });
    setSelectedBatch(null);
    setIsDialogOpen(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedBatch?.id) {
      updateMutation.mutate({ ...formData, id: selectedBatch.id });
    } else {
      createMutation.mutate(formData);
    }
  };
  
  const handleEdit = (batch: Batch) => {
    setSelectedBatch(batch);
    setFormData({
      name: batch.name,
      time_slot: batch.time_slot,
      type: batch.type,
    });
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      deleteMutation.mutate(id);
    }
  };
  
  const showQRCode = (batch: Batch) => {
    setQrBatch(batch);
    setShowQR(true);
  };

  return (
    <>
      <MobileNavBar />
      <MainLayout>
        <PageHeader 
          title="Batches" 
          description="Manage all your training batches"
          onAddNew={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          addNewText="Add Batch"
        />
        
        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No batches found. Create your first batch to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.name}</TableCell>
                      <TableCell>{batch.time_slot}</TableCell>
                      <TableCell>{batch.type}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => showQRCode(batch)}
                          >
                            QR
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(batch)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => batch.id && handleDelete(batch.id)}
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
        
        {/* Add/Edit Batch Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedBatch ? 'Edit Batch' : 'Add New Batch'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Batch Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time_slot">Time Slot</Label>
                  <Input
                    id="time_slot"
                    value={formData.time_slot}
                    onChange={(e) => setFormData({ ...formData, time_slot: e.target.value })}
                    placeholder="e.g., 9:00 AM - 11:00 AM"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Batch Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({ ...formData, type: value as Batch['type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Existing">Existing</SelectItem>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Project">Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-debugshala-600 hover:bg-debugshala-700">
                  {selectedBatch ? 'Update Batch' : 'Create Batch'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* QR Code Dialog */}
        <Dialog open={showQR} onOpenChange={setShowQR}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Attendance QR Code</DialogTitle>
            </DialogHeader>
            {qrBatch && (
              <QRCodeGenerator 
                batch={qrBatch} 
                baseUrl={window.location.origin} 
              />
            )}
          </DialogContent>
        </Dialog>
      </MainLayout>
    </>
  );
};

export default BatchesPage;
