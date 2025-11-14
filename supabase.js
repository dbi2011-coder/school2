// supabase.js - المشروع الجديد
const SUPABASE_URL = 'https://bcjhxjelaqirormcflms.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjamh4amVsYXFpcm9ybWNmbG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzkzNTMsImV4cCI6MjA3ODUxNTM1M30.aDJ-dR70zJEQJYoUc2boZOtoJevEtPRj_UFAMlEwZpc';

// تهيئة Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// دوال قاعدة البيانات
const Database = {
    // دوال الموظفين
    async getStaff() {
        const { data, error } = await supabase
            .from('staff')
            .select('*')
            .order('name');
        return error ? [] : data;
    },

    async addStaff(staff) {
        const { data, error } = await supabase
            .from('staff')
            .insert([staff]);
        return { data, error };
    },

    async updateStaff(id, updates) {
        const { data, error } = await supabase
            .from('staff')
            .update(updates)
            .eq('id', id);
        return { data, error };
    },

    async deleteStaff(id) {
        const { data, error } = await supabase
            .from('staff')
            .delete()
            .eq('id', id);
        return { data, error };
    },

    // دوال الملفات
    async getFiles() {
        const { data, error } = await supabase
            .from('files')
            .select('*')
            .order('created_at', { ascending: false });
        return error ? [] : data;
    },

    async addFile(file) {
        const { data, error } = await supabase
            .from('files')
            .insert([file]);
        return { data, error };
    },

    async deleteFile(id) {
        const { data, error } = await supabase
            .from('files')
            .delete()
            .eq('id', id);
        return { data, error };
    },

    // دوال الأحداث
    async getEvents() {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date');
        return error ? [] : data;
    },

    async addEvent(event) {
        const { data, error } = await supabase
            .from('events')
            .insert([event]);
        return { data, error };
    },

    async updateEvent(id, updates) {
        const { data, error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', id);
        return { data, error };
    },

    async deleteEvent(id) {
        const { data, error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);
        return { data, error };
    },

    // دوال جداول الحصص
    async getSchedules() {
        const { data, error } = await supabase
            .from('schedules')
            .select('*');
        return error ? [] : data;
    },

    async upsertSchedule(schedule) {
        const { data, error } = await supabase
            .from('schedules')
            .upsert(schedule, { onConflict: 'teacher_id' });
        return { data, error };
    },

    // دوال توقيت الدوام
    async getWorkSchedules() {
        const { data, error } = await supabase
            .from('work_schedules')
            .select('*');
        
        if (error) return {};
        
        const schedules = {};
        data.forEach(item => {
            schedules[item.time_type] = item.schedule_data;
        });
        return schedules;
    },

    async saveWorkSchedule(timeType, scheduleData) {
        const { data, error } = await supabase
            .from('work_schedules')
            .upsert({
                time_type: timeType,
                schedule_data: scheduleData
            }, { onConflict: 'time_type' });
        return { data, error };
    },

    // دوال حالة الاطلاع
    async getFileReadStatus() {
        const { data, error } = await supabase
            .from('file_read_status')
            .select('*');
        return error ? {} : this.formatFileReadStatus(data);
    },

    async updateFileReadStatus(fileId, staffId, status) {
        const { data, error } = await supabase
            .from('file_read_status')
            .upsert({
                file_id: fileId,
                staff_id: staffId,
                ...status
            }, { onConflict: 'file_id,staff_id' });
        return { data, error };
    },

    formatFileReadStatus(data) {
        const status = {};
        data.forEach(item => {
            if (!status[item.file_id]) {
                status[item.file_id] = {};
            }
            status[item.file_id][item.staff_id] = {
                read: item.read,
                read_date: item.read_date,
                staff_name: item.staff_name,
                downloaded: item.downloaded
            };
        });
        return status;
    },

    // دالة جديدة لرفع الملفات إلى التخزين
    async uploadFile(file, fileName) {
        try {
            // رفع الملف إلى التخزين
            const { data, error } = await supabase.storage
                .from('school-files')
                .upload(`files/${fileName}`, file);
            
            if (error) throw error;
            
            // الحصول على رابط عام للملف
            const { data: urlData } = supabase.storage
                .from('school-files')
                .getPublicUrl(`files/${fileName}`);
            
            return { 
                success: true, 
                filePath: `files/${fileName}`,
                publicUrl: urlData.publicUrl
            };
        } catch (error) {
            console.error('خطأ في رفع الملف:', error);
            return { success: false, error: error.message };
        }
    },

    // دالة جديدة لجلب رابط الملف
    async getFileUrl(filePath) {
        try {
            const { data } = supabase.storage
                .from('school-files')
                .getPublicUrl(filePath);
            
            return data.publicUrl;
        } catch (error) {
            console.error('خطأ في جلب رابط الملف:', error);
            return null;
        }
    },

    // دالة جديدة لحذف الملف من التخزين
    async deleteFileFromStorage(filePath) {
        try {
            const { data, error } = await supabase.storage
                .from('school-files')
                .remove([filePath]);
            
            return { success: !error, error };
        } catch (error) {
            console.error('خطأ في حذف الملف:', error);
            return { success: false, error };
        }
    }
};

// تصدير الكائن للاستخدام في الملفات الأخرى
window.Database = Database;
