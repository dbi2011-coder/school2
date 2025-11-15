const ADMIN_CREDENTIALS = {
    username: "عمرو بن العاص",
    password: "47564756"
};

// التحقق من حالة تسجيل الدخول
function checkAuth() {
    const role = localStorage.getItem("role");
    if (role === "admin") {
        window.location.href = "admin.html";
    } else if (role === "staff") {
        window.location.href = "staff.html";
    }
}

// تسجيل الدخول
document.getElementById("loginBtn").addEventListener("click", function() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        showNotification("يرجى ملء جميع الحقول", "error");
        return;
    }

    // التحقق من بيانات المدير
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem("role", "admin");
        showNotification("مرحبًا بك أيها المدير", "success");
        setTimeout(() => {
            window.location.href = "admin.html";
        }, 1000);
        return;
    }

    // التحقق من بيانات المنسوبين
    const staff = JSON.parse(localStorage.getItem("staff")) || [];
    const foundStaff = staff.find(s => s.id === username);
    
    if (foundStaff) {
        localStorage.setItem("role", "staff");
        localStorage.setItem("currentStaff", JSON.stringify(foundStaff));
        showNotification(`مرحبًا بك ${foundStaff.name}`, "success");
        setTimeout(() => {
            window.location.href = "staff.html";
        }, 1000);
    } else {
        showNotification("بيانات الدخول غير صحيحة", "error");
    }
});

// إدخال بالزر Enter
document.getElementById("password").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        document.getElementById("loginBtn").click();
    }
});

// عرض الإشعارات
function showNotification(message, type = "info") {
    // إنشاء عنصر الإشعار
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // إضافة الإشعار للصفحة
    document.body.appendChild(notification);
    
    // إظهار الإشعار
    setTimeout(() => {
        notification.classList.add("show");
    }, 100);
    
    // إخفاء الإشعار بعد 3 ثوان
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// تنسيقات الإشعارات
const notificationStyles = document.createElement("style");
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        left: 20px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateY(-100px);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
        max-width: 400px;
        margin: 0 auto;
    }
    
    .notification.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .notification.success {
        border-right: 4px solid #4caf50;
    }
    
    .notification.error {
        border-right: 4px solid #f44336;
    }
    
    .notification.info {
        border-right: 4px solid #2196f3;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-content i {
        font-size: 18px;
    }
    
    .notification.success i { color: #4caf50; }
    .notification.error i { color: #f44336; }
    .notification.info i { color: #2196f3; }
`;
document.head.appendChild(notificationStyles);

// التحقق من المصادقة عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function() {
    checkAuth();
    
    // تعيين قيمة افتراضية لتسهيل الاختبار
    document.getElementById("username").value = "عمرو بن العاص";
    document.getElementById("password").value = "47564756";
});