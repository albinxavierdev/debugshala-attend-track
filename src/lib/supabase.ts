
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Batch type
export type Batch = Tables<'batches'>;
export type Student = Tables<'students'> & { batch_name?: string };
export type Attendance = Tables<'attendance'> & { student_name?: string; batch_name?: string };
export type Topic = Tables<'topics'> & { batch_name?: string };

// Batch functions
export async function fetchBatches(): Promise<Batch[]> {
  const { data, error } = await supabase
    .from<Batch>('batches')
    .select('*')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchBatchById(id: string): Promise<Batch> {
  const { data, error } = await supabase
    .from<Batch>('batches')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data!;
}

export async function createBatch(batch: TablesInsert<'batches'>): Promise<Batch> {
  const { data, error } = await supabase
    .from<Batch>('batches')
    .insert(batch)
    .select()
    .single();
  if (error) throw error;
  return data!;
}

export async function updateBatch(id: string, batch: TablesUpdate<'batches'>): Promise<Batch> {
  const { data, error } = await supabase
    .from<Batch>('batches')
    .update(batch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data!;
}

export async function deleteBatch(id: string) {
  const { error } = await supabase
    .from('batches')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Student functions
export async function fetchStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*, batches(name)')
    .order('name');

  if (error) throw error;

  return (data ?? []).map((student: any) => ({
    ...student,
    batch_name: student.batches?.name,
  }));
}

export async function fetchStudentsByBatch(batchId: string): Promise<Student[]> {
  const { data, error } = await supabase
    .from<Student>('students')
    .select('*')
    .eq('batch_id', batchId)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

export async function fetchStudentById(id: string): Promise<Student> {
  const { data, error } = await supabase
    .from<Student>('students')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data!;
}

export async function createStudent(student: TablesInsert<'students'>): Promise<Student> {
  const { data, error } = await supabase
    .from<Student>('students')
    .insert(student)
    .select()
    .single();
  if (error) throw error;
  return data!;
}

export async function updateStudent(id: string, student: TablesUpdate<'students'>): Promise<Student> {
  const { data, error } = await supabase
    .from<Student>('students')
    .update(student)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data!;
}

export async function deleteStudent(id: string) {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Attendance functions
export async function fetchAttendance(): Promise<Attendance[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, students(name), batches(name)')
    .order('timestamp', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((record: any) => ({
    ...record,
    student_name: record.students?.name,
    batch_name: record.batches?.name,
  }));
}

export async function fetchAttendanceByBatch(batchId: string): Promise<Attendance[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, students(name)')
    .eq('batch_id', batchId)
    .order('timestamp', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((record: any) => ({
    ...record,
    student_name: record.students?.name,
  }));
}

export async function checkAttendance(studentId: string, batchId: string) {
  // Check if student has already checked in today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('student_id', studentId)
    .eq('batch_id', batchId)
    .gte('timestamp', today.toISOString())
    .maybeSingle();

  if (error) throw error;

  // If already checked in, return existing record
  if (data) return { data, exists: true };

  // If not, create new attendance record
  const newAttendance: TablesInsert<'attendance'> = {
    student_id: studentId,
    batch_id: batchId,
    timestamp: new Date().toISOString(),
  };

  const { data: newData, error: insertError } = await supabase
    .from('attendance')
    .insert(newAttendance)
    .select()
    .single();

  if (insertError) throw insertError;
  return { data: newData, exists: false };
}

// Topics functions
export async function fetchTopics(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from('topics')
    .select('*, batches(name)')
    .order('date', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((topic: any) => ({
    ...topic,
    batch_name: topic.batches?.name,
  }));
}

export async function fetchTopicsByBatch(batchId: string): Promise<Topic[]> {
  const { data, error } = await supabase
    .from<Topic>('topics')
    .select('*')
    .eq('batch_id', batchId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createTopic(topic: TablesInsert<'topics'>): Promise<Topic> {
  const { data, error } = await supabase
    .from<Topic>('topics')
    .insert(topic)
    .select()
    .single();
  if (error) throw error;
  return data!;
}

export async function updateTopic(id: string, topic: TablesUpdate<'topics'>): Promise<Topic> {
  const { data, error } = await supabase
    .from<Topic>('topics')
    .update(topic)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data!;
}

export async function deleteTopic(id: string) {
  const { error } = await supabase
    .from('topics')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
