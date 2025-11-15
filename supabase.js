// supabase.js - مع دعم التخزين الفعلي للملفات (محدث)
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

    // دوال التخزين الفعلي للملفات
    async uploadFile(file, fileName, folder = 'school-files') {
        try {
            // إنشاء اسم فريد للملف
            const fileExt = fileName.split('.').pop();
            const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${folder}/${uniqueFileName}`;

            console.log('بدء رفع الملف:', fileName, 'المسار:', filePath);

            // رفع الملف إلى التخزين
            const { data, error } = await supabase.storage
                .from('files')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('خطأ في رفع الملف:', error);
                throw error;
            }

            console.log('تم رفع الملف بنجاح:', data);

            // الحصول على رابط التحميل
            const { data: urlData } = supabase.storage
                .from('files')
                .getPublicUrl(filePath);

            console.log('رابط الملف العام:', urlData);

            return {
                success: true,
                filePath: filePath,
                fileName: fileName,
                publicUrl: urlData.publicUrl,
                uniqueFileName: uniqueFileName
            };
        } catch (error) {
            console.error('خطأ في رفع الملف:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    async downloadFile(filePath) {
        try {
            const { data, error } = await supabase.storage
                .from('files')
                .download(filePath);

            if (error) throw error;
            return { success: true, data: data };
        } catch (error) {
            console.error('خطأ في تحميل الملف:', error);
            return { success: false, error: error.message };
        }
    },

    async getFileUrl(filePath) {
        try {
            const { data } = supabase.storage
                .from('files')
                .getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error) {
            console.error('خطأ في الحصول على رابط الملف:', error);
            return null;
        }
    },

    async deleteStorageFile(filePath) {
        try {
            const { data, error } = await supabase.storage
                .from('files')
                .remove([filePath]);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('خطأ في حذف الملف:', error);
            return { success: false, error: error.message };
        }
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

    // دوال حالة الاطلاع المحسنة
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
                read: status.read || false,
                read_date: status.read_date || null,
                staff_name: status.staff_name || '',
                downloaded: status.downloaded || false,
                download_date: status.download_date || null,
                read_count: status.read_count || 0,
                download_count: status.download_count || 0,
                last_access: new Date().toISOString()
            }, { onConflict: 'file_id,staff_id' });
        return { data, error };
    },

    formatFileReadStatus(data) {
        const status = {};
        if (data) {
            data.forEach(item => {
                if (!status[item.file_id]) {
                    status[item.file_id] = {};
                }
                status[item.file_id][item.staff_id] = {
                    read: item.read,
                    read_date: item.read_date,
                    staff_name: item.staff_name,
                    downloaded: item.downloaded,
                    download_date: item.download_date,
                    read_count: item.read_count,
                    download_count: item.download_count,
                    last_access: item.last_access
                };
            });
        }
        return status;
    },

    // دالة مساعدة للتحقق من اتصال Supabase
    async checkConnection() {
        try {
            const { data, error } = await supabase
                .from('staff')
                .select('count')
                .limit(1);
            
            return {
                connected: !error,
                error: error ? error.message : null
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message
            };
        }
    }
};

// تصدير الكائن للاستخدام في الملفات الأخرى
window.Database = Database;

// التحقق من التحميل
console.log('✅ Supabase.js loaded successfully');
console.log('📁 Database object:', typeof Database !== 'undefined' ? 'Loaded' : 'Not Loaded');
