import { supabase } from '@/integrations/supabase/client';

export type Batch = {
  id?: string;
  name: string;
  time_slot: string;
  type: 'Existing' | 'New' | 'Project';
  created_at?: string;
};

export type Student = {
  id?: string;
  name: string;
  contact: string;
  batch_id: string;
  created_at?: string;
};

export type Attendance = {
  id?: string;
  student_id: string;
  batch_id: string;
  timestamp?: string;
  student_name?: string;
  batch_name?: string;
};

export type Topic = {
  id?: string;
  batch_id: string;
  date: string;
  topic: string;
  batch_name?: string;
};

// Batch functions
export async function fetchBatches() {
  const { data, error } = await supabase.from('batches').select('*').order('name');
  if (error) throw error;
  return data as Batch[];
}

export async function fetchBatchById(id: string) {
  const { data, error } = await supabase.from('batches').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Batch;
}

export async function createBatch(batch: Batch) {
  const { data, error } = await supabase.from('batches').insert(batch).select();
  if (error) throw error;
  return data[0] as Batch;
}

export async function updateBatch(id: string, batch: Batch) {
  const { data, error } = await supabase.from('batches').update(batch).eq('id', id).select();
  if (error) throw error;
  return data[0] as Batch;
}

export async function deleteBatch(id: string) {
  const { error } = await supabase.from('batches').delete().eq('id', id);
  if (error) throw error;
}

// Student functions
export async function fetchStudents() {
  const { data, error } = await supabase
    .from('students')
    .select('*, batches(name)')
    .order('name');
  
  if (error) throw error;
  
  return data.map(student => ({
    ...student,
    batch_name: student.batches?.name
  }));
}

export async function fetchStudentsByBatch(batchId: string) {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('batch_id', batchId)
    .order('name');
  
  if (error) throw error;
  return data as Student[];
}

export async function fetchStudentById(id: string) {
  const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Student;
}

export async function createStudent(student: Student) {
  const { data, error } = await supabase.from('students').insert(student).select();
  if (error) throw error;
  return data[0] as Student;
}

export async function updateStudent(id: string, student: Student) {
  const { data, error } = await supabase.from('students').update(student).eq('id', id).select();
  if (error) throw error;
  return data[0] as Student;
}

export async function deleteStudent(id: string) {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw error;
}

// Attendance functions
export async function fetchAttendance() {
  const { data, error } = await supabase
    .from('attendance')
    .select(`
      *,
      students(name),
      batches(name)
    `)
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  
  return data.map(record => ({
    ...record,
    student_name: record.students?.name,
    batch_name: record.batches?.name
  }));
}

export async function fetchAttendanceByBatch(batchId: string) {
  const { data, error } = await supabase
    .from('attendance')
    .select(`
      *,
      students(name)
    `)
    .eq('batch_id', batchId)
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  
  return data.map(record => ({
    ...record,
    student_name: record.students?.name
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
  const newAttendance = {
    student_id: studentId,
    batch_id: batchId,
    timestamp: new Date().toISOString()
  };
  
  const { data: newData, error: insertError } = await supabase
    .from('attendance')
    .insert(newAttendance)
    .select();
  
  if (insertError) throw insertError;
  return { data: newData[0], exists: false };
}

// Topics functions
export async function fetchTopics() {
  const { data, error } = await supabase
    .from('topics')
    .select(`
      *,
      batches(name)
    `)
    .order('date', { ascending: false });
  
  if (error) throw error;
  
  return data.map(topic => ({
    ...topic,
    batch_name: topic.batches?.name
  }));
}

export async function fetchTopicsByBatch(batchId: string) {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('batch_id', batchId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data as Topic[];
}

export async function createTopic(topic: Topic) {
  const { data, error } = await supabase.from('topics').insert(topic).select();
  if (error) throw error;
  return data[0] as Topic;
}

export async function updateTopic(id: string, topic: Topic) {
  const { data, error } = await supabase.from('topics').update(topic).eq('id', id).select();
  if (error) throw error;
  return data[0] as Topic;
}

export async function deleteTopic(id: string) {
  const { error } = await supabase.from('topics').delete().eq('id', id);
  if (error) throw error;
}
