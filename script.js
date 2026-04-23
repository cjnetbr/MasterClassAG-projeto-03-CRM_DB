// Configuração do Supabase (Substitua pelos seus dados)
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize Lucide Icons
lucide.createIcons();

// --- Navbar & Mobile Menu ---
const navbar = document.querySelector('.navbar');
const mobileMenu = document.querySelector('.mobile-menu');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

function toggleMenu() {
    mobileMenu.classList.toggle('open');
    const icon = document.querySelector('.mobile-menu-btn i');
    if (mobileMenu.classList.contains('open')) {
        icon.setAttribute('data-lucide', 'x');
    } else {
        icon.setAttribute('data-lucide', 'menu');
    }
    lucide.createIcons();
}

// --- Scroll Reveal Animations ---
const revealElements = document.querySelectorAll('.reveal');

const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
};

const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

revealElements.forEach(el => {
    revealObserver.observe(el);
});

// --- Modal & Multi-step Form ---
const modal = document.getElementById('quoteModal');
const step1 = document.getElementById('step1Form');
const step2 = document.getElementById('step2Form');
const successStep = document.getElementById('successStep');
const progressBar = document.getElementById('progressBar');
const stepIndicators = document.querySelectorAll('.step-indicator');

let currentStep = 1;

function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    resetForm();
}

function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(resetForm, 300); // Reset after transition
}

// Close modal on click outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

function resetForm() {
    currentStep = 1;
    step1.reset();
    step2.reset();
    
    // Reset file UI
    const fileUI = document.querySelector('.file-upload-ui');
    fileUI.innerHTML = '<i data-lucide="upload-cloud"></i><span>Clique para anexar ou arraste a imagem</span>';
    fileUI.classList.remove('file-uploaded-text');
    lucide.createIcons();
    
    updateStepsUI();
}

function updateStepsUI() {
    // Handle form visibility
    step1.classList.remove('active');
    step2.classList.remove('active');
    successStep.classList.remove('active');
    
    if (currentStep === 1) {
        step1.classList.add('active');
        progressBar.style.width = '50%';
        stepIndicators[0].classList.add('active');
        stepIndicators[1].classList.remove('active');
    } else if (currentStep === 2) {
        step2.classList.add('active');
        progressBar.style.width = '100%';
        stepIndicators[0].classList.add('active');
        stepIndicators[1].classList.add('active');
    } else if (currentStep === 3) {
        successStep.classList.add('active');
        // Hide indicators for success step
        document.querySelector('.progress-container').style.opacity = '0';
        document.querySelector('.step-indicators').style.opacity = '0';
    }
    
    if (currentStep < 3) {
        document.querySelector('.progress-container').style.opacity = '1';
        document.querySelector('.step-indicators').style.opacity = '1';
    }
}

function validateStep1() {
    const length = document.getElementById('length').value;
    const width = document.getElementById('width').value;
    const zipcode = document.getElementById('zipcode').value;
    
    if (!length || !width || !zipcode) {
        alert("Por favor, preencha as dimensões e o CEP para continuar.");
        return false;
    }
    return true;
}

function validateStep2() {
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    
    if (!email || !phone) {
        alert("Por favor, preencha os dados de contato.");
        return false;
    }
    return true;
}

function nextStep() {
    if (currentStep === 1 && validateStep1()) {
        currentStep = 2;
        updateStepsUI();
    }
}

function prevStep() {
    if (currentStep === 2) {
        currentStep = 1;
        updateStepsUI();
    }
}

async function submitForm() {
    if (currentStep === 2 && validateStep2()) {
        const btn = document.querySelector('#step2Form .btn-primary');
        const originalText = btn.innerText;
        btn.innerText = "Enviando orcamento...";
        btn.disabled = true;
        
        try {
            let item_photo_url = null;
            
            // 1. Upload da foto (se existir)
            const fileInput = document.getElementById('itemPhoto');
            if (fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                
                // Upload para o bucket 'quote_images'
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('quote_images')
                    .upload(fileName, file);
                    
                if (uploadError) throw uploadError;
                
                // Pegar a URL pública da imagem
                const { data: publicUrlData } = supabase.storage
                    .from('quote_images')
                    .getPublicUrl(fileName);
                    
                item_photo_url = publicUrlData.publicUrl;
            }

            // 2. Coletar dados do formulário
            const quoteData = {
                length: parseFloat(document.getElementById('length').value),
                width: parseFloat(document.getElementById('width').value),
                zipcode: document.getElementById('zipcode').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                item_photo_url: item_photo_url
            };

            // 3. Inserir no banco de dados (tabela 'quotes')
            const { data, error } = await supabase
                .from('quotes')
                .insert([quoteData]);

            if (error) throw error;
            
            // Sucesso! Ir para o step 3
            currentStep = 3;
            updateStepsUI();
            
        } catch (error) {
            console.error('Erro ao enviar solicitação:', error);
            alert('Ocorreu um erro ao enviar sua solicitação. Por favor, verifique a configuração do Supabase e tente novamente.');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }
}

// --- Input Masks ---
function maskCEP(event) {
    let input = event.target;
    input.value = input.value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2');
}

function maskPhone(event) {
    let input = event.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 2) {
        value = `(${value.slice(0,2)}) ${value.slice(2)}`;
    }
    if (value.length > 10) {
        value = `${value.slice(0,10)}-${value.slice(10)}`;
    }
    input.value = value;
}

// --- File Upload UI Feedback ---
const fileInput = document.getElementById('itemPhoto');
const fileUI = document.querySelector('.file-upload-ui');

fileInput.addEventListener('change', function(e) {
    if (this.files && this.files[0]) {
        const fileName = this.files[0].name;
        fileUI.innerHTML = `<i data-lucide="check"></i><span>${fileName} selecionado</span>`;
        fileUI.classList.add('file-uploaded-text');
        lucide.createIcons();
    }
});
