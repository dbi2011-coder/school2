// تسجيل الخروج
function logout() {
    localStorage.removeItem("role");
    localStorage.removeItem("currentStaff");
    window.location.href = "index.html";
}

// تحميل الملفات
function loadFiles() {
    const files = JSON.parse(localStorage.getItem("files")) || [];
    const categories = [...new Set(files.map(f => f.category))];
    const container = document.getElementById("fileCategories");

    container.innerHTML = categories.map(cat => {
        const categoryFiles = files.filter(f => f.category === cat);
        return `
            <div class="category-card">
                <div class="category-header">
                    <i class="fas fa-folder"></i>
                    ${cat}
                </div>
                <div class="category-files">
                    ${categoryFiles.map(f => `
                        <div class="file-item">
                            <div>
                                <strong>${f.title}</strong>
                                ${f.note ? `<div style="font-size: 12px; color: #666; margin-top: 4px;">${f.note}</div>` : ''}
                            </div>
                            <div class="file-date">${f.date}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// تحميل الأحداث
function loadEvents() {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const container = document.getElementById("calendarList");

    // ترتيب الأحداث حسب التاريخ
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = events.map(event => {
        const eventDate = new Date(event.date);
        const today = new Date();
        const diffTime = eventDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let dayText = "اليوم";
        let badgeClass = "event-days";
        
        if (diffDays > 1) {
            dayText = `باقي ${diffDays} يوم`;
        } else if (diffDays === 1) {
            dayText = "غدًا";
        } else if (diffDays < 0) {
            dayText = "منتهي";
            badgeClass = "event-days expired";
        }
        
        return `
            <div class="event-card">
                <div class="${badgeClass}">${dayText}</div>
                <div>
                    <strong>${event.title}</strong>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">
                        ${eventDate.toLocaleDateString('ar-SA', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// عرض اسم المستخدم
function displayUserName() {
    const currentStaff = JSON.parse(localStorage.getItem("currentStaff"));
    const staffNameElement = document.getElementById("staffUserName");
    
    if (currentStaff && staffNameElement) {
        staffNameElement.textContent = currentStaff.name;
    }
}

// تنسيقات إضافية للأحداث المنتهية
const additionalStyles = document.createElement("style");
additionalStyles.textContent = `
    .event-days.expired {
        background-color: #6c757d !important;
    }
    
    .badge {
        background: #e9ecef;
        color: #495057;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
    }
`;
document.head.appendChild(additionalStyles);

// تهيئة التطبيق
document.addEventListener("DOMContentLoaded", function() {
    // التحقق من صلاحية المنسوب
    if (localStorage.getItem("role") !== "staff") {
        window.location.href = "index.html";
        return;
    }
    
    displayUserName();
    loadFiles();
    loadEvents();
});
