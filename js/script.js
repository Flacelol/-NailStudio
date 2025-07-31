// Inizializzazione EmailJS
(function() {
    emailjs.init("YOUR_PUBLIC_KEY"); // Sostituire con la vostra chiave pubblica EmailJS
})();

// Elementi DOM
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const bookingForm = document.getElementById('bookingForm');
const header = document.querySelector('.header');

// Menu mobile
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
});

// Chiusura menu al clic sui link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
    });
});

// Scorrimento fluido per la navigazione
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

// Navigazione attiva durante lo scorrimento
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
    
    // Cambio stile header durante lo scorrimento
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Impostazione data minima per la prenotazione (oggi)
const dateInput = document.getElementById('date');
if (dateInput) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    dateInput.setAttribute('min', minDate);
}

// Gestione form di prenotazione
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Ottenimento dati del form
        const formData = new FormData(bookingForm);
        const bookingData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email') || 'Non specificato',
            service: getServiceName(formData.get('service')),
            date: formatDate(formData.get('date')),
            time: formData.get('time'),
            message: formData.get('message') || 'Nessuna richiesta aggiuntiva'
        };
        
        // Validazione
        if (!validateForm(bookingData)) {
            return;
        }
        
        // Mostra indicatore di caricamento
        showLoading(true);
        
        try {
            // Invio tramite EmailJS
            const response = await emailjs.send(
                'YOUR_SERVICE_ID', // Sostituire con il vostro Service ID
                'YOUR_TEMPLATE_ID', // Sostituire con il vostro Template ID
                {
                    to_email: 'your-email@example.com', // La vostra email per ricevere le richieste
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
            
            // Invio riuscito
            showAlert('La vostra richiesta è stata inviata con successo! Vi contatteremo al più presto.', 'success');
            bookingForm.reset();
            
        } catch (error) {
            console.error('Errore di invio:', error);
            showAlert('Si è verificato un errore durante l\'invio della richiesta. Riprovate o chiamateci.', 'error');
        } finally {
            showLoading(false);
        }
    });
}

// Funzione di validazione del form
function validateForm(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Inserire un nome corretto (minimo 2 caratteri)');
    }
    
    if (!data.phone || !isValidPhone(data.phone)) {
        errors.push('Inserire un numero di telefono corretto');
    }
    
    if (data.email && data.email !== 'Non specificato' && !isValidEmail(data.email)) {
        errors.push('Inserire un email corretto');
    }
    
    if (!data.service || data.service === 'Scegli il servizio') {
        errors.push('Scegliere un servizio');
    }
    
    if (!data.date) {
        errors.push('Scegliere una data');
    }
    
    if (!data.time) {
        errors.push('Scegliere un orario');
    }
    
    if (errors.length > 0) {
        showAlert(errors.join('\n'), 'error');
        return false;
    }
    
    return true;
}

// Validazione telefono
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Validazione email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Ottenimento nome del servizio
function getServiceName(serviceValue) {
    const services = {
        // Manicure
        'classic-manicure': 'Manicure classica',
        'hardware-manicure': 'Manicure con apparecchio',
        'nail-art': 'Nail art',
        'nail-extension': 'Ricostruzione',
        'correction': 'Correzione',
        
        // Pedicure
        'classic-pedicure': 'Pedicure classica',
        'hardware-pedicure': 'Pedicure con apparecchio',
        'spa-pedicure': 'SPA-pedicure',
        'medical-pedicure': 'Pedicure curativa',
        
        // Sopracciglia
        'brow-correction': 'Correzione sopracciglia',
        'brow-coloring': 'Colorazione sopracciglia',
        'brow-lamination': 'Laminazione sopracciglia',
        'brow-complex': 'Complesso per sopracciglia',
        
        // Tagli
        'women-haircut': 'Taglio femminile',
        'men-haircut': 'Taglio maschile',
        'child-haircut': 'Taglio per bambini',
        'hair-coloring': 'Colorazione capelli'
    };
    return services[serviceValue] || serviceValue;
}

// Formattazione data
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return date.toLocaleDateString('it-IT', options);
}

// Visualizzazione messaggi
function showAlert(message, type) {
    // Rimuovere messaggi precedenti
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = message.replace(/\n/g, '<br>');
    
    // Inserire messaggio dopo il form
    const formContainer = document.querySelector('.booking-form-container');
    if (formContainer) {
        formContainer.appendChild(alert);
        
        // Scorrere al messaggio
        alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Rimuovere automaticamente dopo 5 secondi
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
}

// Visualizzazione indicatore di caricamento
function showLoading(show) {
    let loadingElement = document.querySelector('.loading');
    
    if (show) {
        if (!loadingElement) {
            loadingElement = document.createElement('div');
            loadingElement.className = 'loading';
            loadingElement.innerHTML = `
                <div class="spinner"></div>
                <p>Stiamo inviando la vostra richiesta...</p>
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

// Animazione apparizione elementi durante lo scorrimento
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

// Osservazione elementi per l'animazione
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .gallery-item, .feature, .contact-item');
    animatedElements.forEach(el => observer.observe(el));
});

// Galleria - ingrandimento immagini
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img) {
            openImageModal(img.src, img.alt);
        }
    });
});

// Finestra modale per le immagini
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
    
    // Chiusura finestra modale
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
    
    // Chiusura con Escape
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

// Stili per la finestra modale (aggiunti dinamicamente)
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

// Messaggio console per lo sviluppatore
console.log(`
🎨 Sito Web Nail Studio
📧 Non dimenticare di configurare EmailJS:
1. Registrarsi su https://www.emailjs.com/
2. Creare un servizio e un template
3. Sostituire YOUR_PUBLIC_KEY, YOUR_SERVICE_ID, YOUR_TEMPLATE_ID nel codice
4. Specificare la vostra email per ricevere le richieste
`);