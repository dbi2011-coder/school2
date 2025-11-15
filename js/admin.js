// تسجيل الخروج
function logout() {
    localStorage.removeItem("role");
    localStorage.removeItem("currentStaff");
    window.location.href = "index.html";
}

// إضافة ملف
function addFile() {
    const title = document.getElementById("title").value.trim();
    const category = document.getElementById("category").value;
    const note = document.getElementById("note").value.trim();
    const fileInput = document.getElementById("fileUpload");

    if (!title) {
        alert("يرجى إدخال عنوان المحتوى");
        return;
    }

    const files = JSON.parse(localStorage.getItem("files")) || [];
    const newFile = {
        id: Date.now().toString(),
        title: title,
        category: category,
        note: note,
        date: new Date().toLocaleDateString('ar-SA'),
        fileName: fileInput.files[0] ? fileInput.files[0].name : null
    };

    files.push(newFile);
    localStorage.setItem("files", JSON.stringify(files));

    // Reset form
    document.getElementById("title").value = "";
    document.getElementById("note").value = "";
    document.getElementById("fileUpload").value = "";

    updateStats();
    alert("تم رفع المحتوى بنجاح");
}

// إضافة منسوب
function addStaff() {
    const name = document.getElementById("staffName").value.trim();
    const id = document.getElementById("staffId").value.trim();
    const phone = document.getElementById("staffPhone").value.trim();
    const job = document.getElementById("staffJob").value;

    if (!name || !id) {
        alert("يرجى إدخال الاسم ورقم الهوية");
        return;
    }

    const staff = JSON.parse(localStorage.getItem("staff")) || [];
    
    // التحقق من عدم تكرار رقم الهوية
    if (staff.find(s => s.id === id)) {
        alert("رقم الهوية مسجل مسبقًا");
        return;
    }

    const newStaff = {
        id: id,
        name: name,
        phone: phone,
        job: job
    };

    staff.push(newStaff);
    localStorage.setItem("staff", JSON.stringify(staff));

    // Reset form
    document.getElementById("staffName").value = "";
    document.getElementById("staffId").value = "";
    document.getElementById("staffPhone").value = "";

    displayStaff();
    updateStats();
    alert("تم إضافة المنسوب بنجاح");
}

// عرض المنسوبين
function displayStaff() {
    const staff = JSON.parse(localStorage.getItem("staff")) || [];
    const tableBody = document.getElementById("staffTableBody");
    
    tableBody.innerHTML = staff.map(staff => `
        <tr>
            <td>${staff.name}</td>
            <td>${staff.id}</td>
            <td>${staff.phone || '-'}</td>
            <td><span class="badge">${staff.job}</span></td>
            <td>
                <button class="btn-outline" onclick="deleteStaff('${staff.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

// حذف منسوب
function deleteStaff(staffId) {
    if (confirm("هل أنت متأكد من حذف هذا المنسوب؟")) {
        const staff = JSON.parse(localStorage.getItem("staff")) || [];
        const updatedStaff = staff.filter(s => s.id !== staffId);
        localStorage.setItem("staff", JSON.stringify(updatedStaff));
        displayStaff();
        updateStats();
    }
}

// إضافة حدث
function addEvent() {
    const title = document.getElementById("eventTitle").value.trim();
    const date = document.getElementById("eventDate").value;

    if (!title || !date) {
        alert("يرجى إدخال اسم الحدث وتاريخه");
        return;
    }

    const events = JSON.parse(localStorage.getItem("events")) || [];
    const newEvent = {
        id: Date.now().toString(),
        title: title,
        date: date
    };

    events.push(newEvent);
    localStorage.setItem("events", JSON.stringify(events));

    // Reset form
    document.getElementById("eventTitle").value = "";
    document.getElementById("eventDate").value = "";

    displayEvents();
    updateStats();
    alert("تم إضافة الحدث بنجاح");
}

// عرض الأحداث
function displayEvents() {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const eventsList = document.getElementById("eventsList");
    
    // ترتيب الأحداث حسب التاريخ
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    eventsList.innerHTML = events.map(event => {
        const eventDate = new Date(event.date);
        const today = new Date();
        const diffTime = eventDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let dayText = "اليوم";
        if (diffDays > 1) dayText = `باقي ${diffDays} يوم`;
        else if (diffDays < 0) dayText = "منتهي";
        
        return `
            <div class="event-item">
                <div>
                    <strong>${event.title}</strong>
                    <div style="font-size: 12px; color: #666; margin-top: 5px;">
                        ${new Date(event.date).toLocaleDateString('ar-SA')}
                    </div>
                </div>
                <div class="event-date">${dayText}</div>
            </div>
        `;
    }).join("");
}

// حفظ جدول الحصص
function saveSchedule() {
    alert("تم حفظ جدول الحصص بنجاح");
}

// تبديل التبويبات
function switchTab(tabName) {
    // إخفاء جميع المحتويات
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // إزالة النشاط من جميع الأزرار
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // إظهار المحتوى المحدد
    document.getElementById(tabName).classList.add('active');
    
    // تعيين النشاط للزر المحدد
    event.currentTarget.classList.add('active');
}

// تحديث الإحصائيات
function updateStats() {
    const staff = JSON.parse(localStorage.getItem("staff")) || [];
    const files = JSON.parse(localStorage.getItem("files")) || [];
    const events = JSON.parse(localStorage.getItem("events")) || [];
    
    document.getElementById("totalStaff").textContent = staff.length;
    document.getElementById("totalFiles").textContent = files.length;
    document.getElementById("totalEvents").textContent = events.length;
    document.getElementById("totalTeachers").textContent = staff.filter(s => s.job === "معلم").length;
}

// التبديل بين أقسام الشريط الجانبي
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // إزالة النشاط من جميع العناصر
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // إضافة النشاط للعنصر المحدد
            this.classList.add('active');
            
            // إظهار القسم المحدد (يمكن تطويره لاحقًا)
            const target = this.querySelector('a').getAttribute('href').substring(1);
            showSection(target);
        });
    });
}

// إظهار القسم المحدد
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionId + '-section');
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

// التبديل في الشريط الجانبي للأجهزة الصغيرة
function setupSidebarToggle() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }
}

// تهيئة البيانات الافتراضية
function initializeSampleData() {
    // بيانات المنسوبين الافتراضية
    if (!localStorage.getItem("staff") || JSON.parse(localStorage.getItem("staff")).length === 0) {
        const sampleStaff = [
            { id: "1234567890", name: "أحمد محمد", phone: "0551234567", job: "معلم" },
            { id: "0987654321", name: "سارة عبدالله", phone: "0557654321", job: "وكيل" },
            { id: "1122334455", name: "محمد علي", phone: "0551122334", job: "موجه طلابي" }
        ];
        localStorage.setItem("staff", JSON.stringify(sampleStaff));
    }
    
    // بيانات الملفات الافتراضية
    if (!localStorage.getItem("files") || JSON.parse(localStorage.getItem("files")).length === 0) {
        const sampleFiles = [
            { 
                id: "1", 
                title: "التعميم الأسبوعي", 
                category: "التعاميم الداخلية", 
                note: "يتعلق بالأنشطة الأسبوعية", 
                date: "١٤٤٥/٠٣/٠١",
                fileName: null
            },
            { 
                id: "2", 
                title: "دليل المعلم", 
                category: "الأدلة واللوائح والأنظمة", 
                note: "", 
                date: "١٤٤٥/٠٢/١٥",
                fileName: null
            }
        ];
        localStorage.setItem("files", JSON.stringify(sampleFiles));
    }
    
    // بيانات الأحداث الافتراضية
    if (!localStorage.getItem("events") || JSON.parse(localStorage.getItem("events")).length === 0) {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const sampleEvents = [
            { 
                id: "1", 
                title: "بداية الفصل الدراسي الثاني", 
                date: today.toISOString().split('T')[0]
            },
            { 
                id: "2", 
                title: "اختبارات منتصف الفصل", 
                date: nextWeek.toISOString().split('T')[0]
            }
        ];
        localStorage.setItem("events", JSON.stringify(sampleEvents));
    }
}

// تهيئة التطبيق
document.addEventListener("DOMContentLoaded", function() {
    // التحقق من صلاحية المدير
    if (localStorage.getItem("role") !== "admin") {
        window.location.href = "index.html";
        return;
    }
    
    initializeSampleData();
    setupNavigation();
    setupSidebarToggle();
    displayStaff();
    displayEvents();
    updateStats();
    
    // إظهار قسم لوحة التحكم افتراضيًا
    showSection('dashboard');
});
