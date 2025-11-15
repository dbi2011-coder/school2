// supabase.js - مُحدَّث لإضافة دعم معاينة وتنزيل الملفات
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

    // =================== دوال التخزين (معاينة و تحميل فعلي) ===================
    // تحاول استخدام أسماء الحقول الشائعة لجلب مسار الملف
    _getPathFromFileRecord(file) {
        return file.storage_path || file.file_path || file.path || file.url || file.public_path || null;
    },

    _getBucketFromFileRecord(file) {
        return file.storage_bucket || file.bucket || 'uploads';
    },

    // إرجاع رابط عام (public url) إن أمكن
    async getFilePublicUrl(file) {
        try {
            const path = this._getPathFromFileRecord(file);
            const bucket = this._getBucketFromFileRecord(file);
            if (!path) return null;

            const { data, error } = supabase.storage.from(bucket).getPublicUrl(path);
            if (error) return null;
            // في supabase v2: data.publicUrl
            if (data && data.publicUrl) return data.publicUrl;
            // fallback: construct (لا ينصح إن لم يكن public)
            return null;
        } catch (err) {
            console.error("getFilePublicUrl error:", err);
            return null;
        }
    },

    // تنزيل الملف فعليًا كـ blob ثم بدء تحميله في المتصفح
    async downloadFileFromStorage(file) {
        try {
            const path = this._getPathFromFileRecord(file);
            const bucket = this._getBucketFromFileRecord(file);
            if (!path) throw new Error("مسار الملف غير متوفر");

            // تنزيل كـ blob
            const { data, error } = await supabase.storage.from(bucket).download(path);
            if (error) {
                // أحيانًا يعيد خطأ لأن الملف خاص، حاول الحصول على public URL كخطة بديلة
                const pub = await this.getFilePublicUrl(file);
                if (pub) {
                    // افتح الرابط في نافذة جديدة (المتصفح سيقوم بالتحميل أو العرض)
                    window.open(pub, '_blank');
                    return { success: true };
                }
                throw error;
            }

            // إنشاء رابط مؤقت وتحميله
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.file_name || path.split('/').pop() || 'file';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            return { success: true };
        } catch (err) {
            console.error("downloadFileFromStorage error:", err);
            return { success: false, error: err };
        }
    }
};

// تصدير الكائن للاستخدام في الملفات الأخرى
window.Database = Database;
