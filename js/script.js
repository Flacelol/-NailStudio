// Ініціалізація EmailJS
(function() {
    emailjs.init("YOUR_PUBLIC_KEY"); // Замініть на ваш публічний ключ EmailJS
})();

// DOM елементи
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const bookingForm = document.getElementById('bookingForm');
const header = document.querySelector('.header');

// Мобільне меню
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
});

// Закриття меню при кліку на посилання
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
    });
});

// Плавна прокрутка для навігації
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const headerHeight = header.offsetHeight;
            const targetPosition = targetSection.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Активна навігація при прокрутці
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const scrollPos = window.scrollY + header.offsetHeight + 50;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
    
    // Зміна стилю хедера при прокрутці
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Встановлення мінімальної дати для запису (сьогодні)
const dateInput = document.getElementById('date');
if (dateInput) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    dateInput.setAttribute('min', minDate);
}

// Обробка форми запису
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Отримання даних форми
        const formData = new FormData(bookingForm);
        const bookingData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email') || 'Не вказано',
            service: getServiceName(formData.get('service')),
            date: formatDate(formData.get('date')),
            time: formData.get('time'),
            message: formData.get('message') || 'Немає додаткових побажань'
        };
        
        // Валідація
        if (!validateForm(bookingData)) {
            return;
        }
        
        // Показати індикатор завантаження
        showLoading(true);
        
        try {
            // Відправка через EmailJS
            const response = await emailjs.send(
                'YOUR_SERVICE_ID', // Замініть на ваш Service ID
                'YOUR_TEMPLATE_ID', // Замініть на ваш Template ID
                {
                    to_email: 'your-email@example.com', // Ваш email для отримання заявок
                    from_name: bookingData.name,
                    from_phone: bookingData.phone,
                    from_email: bookingData.email,
                    service: bookingData.service,
                    booking_date: bookingData.date,
                    booking_time: bookingData.time,
                    message: bookingData.message,
                    reply_to: bookingData.email
                }
            );
            
            // Успішна відправка
            showAlert('Ваша заявка успішно відправлена! Ми зв\'яжемося з вами найближчим часом.', 'success');
            bookingForm.reset();
            
        } catch (error) {
            console.error('Помилка відправки:', error);
            showAlert('Виникла помилка при відправці заявки. Спробуйте ще раз або зателефонуйте нам.', 'error');
        } finally {
            showLoading(false);
        }
    });
}

// Функція валідації форми
function validateForm(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Введіть коректне ім\'я (мінімум 2 символи)');
    }
    
    if (!data.phone || !isValidPhone(data.phone)) {
        errors.push('Введіть коректний номер телефону');
    }
    
    if (data.email && data.email !== 'Не вказано' && !isValidEmail(data.email)) {
        errors.push('Введіть коректний email');
    }
    
    if (!data.service || data.service === 'Оберіть послугу') {
        errors.push('Оберіть послугу');
    }
    
    if (!data.date) {
        errors.push('Оберіть дату');
    }
    
    if (!data.time) {
        errors.push('Оберіть час');
    }
    
    if (errors.length > 0) {
        showAlert(errors.join('\n'), 'error');
        return false;
    }
    
    return true;
}

// Валідація телефону
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Валідація email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Отримання назви послуги
function getServiceName(serviceValue) {
    const services = {
        // Манікюр
        'classic-manicure': 'Класичний манікюр',
        'hardware-manicure': 'Апаратний манікюр',
        'nail-art': 'Нейл-арт',
        'nail-extension': 'Нарощування',
        'correction': 'Корекція',
        
        // Педикюр
        'classic-pedicure': 'Класичний педикюр',
        'hardware-pedicure': 'Апаратний педикюр',
        'spa-pedicure': 'SPA-педикюр',
        'medical-pedicure': 'Лікувальний педикюр',
        
        // Брови
        'brow-correction': 'Корекція брів',
        'brow-coloring': 'Фарбування брів',
        'brow-lamination': 'Ламінування брів',
        'brow-complex': 'Комплекс для брів',
        
        // Стрижки
        'women-haircut': 'Жіноча стрижка',
        'men-haircut': 'Чоловіча стрижка',
        'child-haircut': 'Дитяча стрижка',
        'hair-coloring': 'Фарбування волосся'
    };
    return services[serviceValue] || serviceValue;
}

// Форматування дати
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return date.toLocaleDateString('uk-UA', options);
}

// Показ повідомлень
function showAlert(message, type) {
    // Видалити попередні повідомлення
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = message.replace(/\n/g, '<br>');
    
    // Вставити повідомлення після форми
    const formContainer = document.querySelector('.booking-form-container');
    if (formContainer) {
        formContainer.appendChild(alert);
        
        // Прокрутити до повідомлення
        alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Автоматично видалити через 5 секунд
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
}

// Показ індикатора завантаження
function showLoading(show) {
    let loadingElement = document.querySelector('.loading');
    
    if (show) {
        if (!loadingElement) {
            loadingElement = document.createElement('div');
            loadingElement.className = 'loading';
            loadingElement.innerHTML = `
                <div class="spinner"></div>
                <p>Відправляємо вашу заявку...</p>
            `;
            
            const submitButton = bookingForm.querySelector('button[type="submit"]');
            submitButton.parentNode.insertBefore(loadingElement, submitButton.nextSibling);
        }
        
        loadingElement.style.display = 'block';
        bookingForm.querySelector('button[type="submit"]').disabled = true;
    } else {
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        bookingForm.querySelector('button[type="submit"]').disabled = false;
    }
}

// Анімація появи елементів при прокрутці
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Спостереження за елементами для анімації
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .gallery-item, .feature, .contact-item');
    animatedElements.forEach(el => observer.observe(el));
});

// Галерея - збільшення зображень
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img) {
            openImageModal(img.src, img.alt);
        }
    });
});

// Модальне вікно для зображень
function openImageModal(src, alt) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <img src="${src}" alt="${alt}">
                <button class="modal-close">&times;</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Закриття модального вікна
    const closeModal = () => {
        modal.remove();
        document.body.style.overflow = 'auto';
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    });
    
    // Закриття на Escape
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

// Стилі для модального вікна (додаються динамічно)
if (!document.querySelector('#modal-styles')) {
    const modalStyles = document.createElement('style');
    modalStyles.id = 'modal-styles';
    modalStyles.textContent = `
        .image-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
        }
        
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .modal-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
        }
        
        .modal-content img {
            width: 100%;
            height: auto;
            max-height: 80vh;
            object-fit: contain;
            border-radius: 10px;
        }
        
        .modal-close {
            position: absolute;
            top: -40px;
            right: 0;
            background: none;
            border: none;
            color: white;
            font-size: 30px;
            cursor: pointer;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-close:hover {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
        }
    `;
    document.head.appendChild(modalStyles);
}

// Консольне повідомлення для розробника
console.log(`
🎨 Nail Studio Website
📧 Не забудьте налаштувати EmailJS:
1. Зареєструйтеся на https://www.emailjs.com/
2. Створіть сервіс та шаблон
3. Замініть YOUR_PUBLIC_KEY, YOUR_SERVICE_ID, YOUR_TEMPLATE_ID у коді
4. Вкажіть ваш email для отримання заявок
`);