// State management
const state = {
    dailyLimit: 100000000,
    usedLimit: 0,
    otpAttempts: 3,
    generatedOTP: '',
    transferData: null,
    currentBalance: 0
};

// DOM Elements
let transferForm, otpForm, resultDiv, btnContinue, btnVerify, btnBack, btnNewTransfer, resendOTPLink, otpInputs, 
    otpAttemptsEl, remainingLimitEl, dailyLimitEl, initialBalanceInput, dailyLimitInput,
    saveBalanceBtn, saveLimitBtn, targetAccountInput, amountInput, notesInput;

// Initialize DOM elements
function initElements() {
    // Form elements
    transferForm = document.getElementById('transferForm');
    otpForm = document.getElementById('otpForm');
    resultDiv = document.getElementById('result');
    
    // Buttons
    btnContinue = document.getElementById('btnContinue');
    btnVerify = document.getElementById('btnVerify');
    btnBack = document.getElementById('btnBack');
    btnNewTransfer = document.getElementById('btnNewTransfer');
    resendOTPLink = document.getElementById('resendOTP');
    
    // Input fields
    otpInputs = document.querySelectorAll('.otp-input');
    targetAccountInput = document.getElementById('targetAccount');
    amountInput = document.getElementById('amount');
    notesInput = document.getElementById('notes');
    
    // Info displays
    otpAttemptsEl = document.getElementById('otpAttempts');
    remainingLimitEl = document.getElementById('remainingLimit');
    dailyLimitEl = document.getElementById('dailyLimit');
    
    // Settings inputs
    initialBalanceInput = document.getElementById('initialBalance');
    dailyLimitInput = document.getElementById('dailyLimitInput');
    
    // Buttons
    saveBalanceBtn = document.getElementById('saveBalance');
    saveLimitBtn = document.getElementById('saveLimit');
    
    // Debug log
    if (!targetAccountInput || !amountInput) {
        console.error('One or more form elements not found');
    }
}

// Initialize the app
function init() {
    // Initialize DOM elements
    initElements();
    
    // Set initial values
    state.currentBalance = 1000000; // Default value
    state.dailyLimit = 100000000;   // Default value
    
    // Update from input fields if they exist
    if (initialBalanceInput) {
        state.currentBalance = parseInt(initialBalanceInput.value) || 1000000;
    }
    
    if (dailyLimitInput) {
        state.dailyLimit = parseInt(dailyLimitInput.value) || 100000000;
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Load saved values from localStorage if available
    loadSavedValues();
    
    // Initial display update
    updateDisplayedLimits();
}

// Load saved values from localStorage
function loadSavedValues() {
    try {
        // Ensure elements are initialized
        initElements();
        
        // Load saved balance
        const savedBalance = localStorage.getItem('savedBalance');
        if (savedBalance !== null) {
            const balance = parseInt(savedBalance);
            if (!isNaN(balance)) {
                state.currentBalance = balance;
                if (initialBalanceInput) {
                    initialBalanceInput.value = balance;
                }
            }
        } else if (initialBalanceInput) {
            // If no saved balance, use the input value
            state.currentBalance = parseInt(initialBalanceInput.value) || 0;
        }
        
        // Load daily limit
        const savedLimit = localStorage.getItem('dailyLimit');
        if (savedLimit !== null) {
            const limit = parseInt(savedLimit);
            if (!isNaN(limit)) {
                state.dailyLimit = limit;
                if (dailyLimitInput) {
                    dailyLimitInput.value = limit;
                }
            }
        } else if (dailyLimitInput) {
            // If no saved limit, use the input value
            state.dailyLimit = parseInt(dailyLimitInput.value) || 100000000;
        }
        
        // Initialize used limit
        state.usedLimit = 0;
        
        // Update display
        updateDisplayedLimits();
    } catch (error) {
        console.error('Error loading saved values:', error);
        // Set default values if error occurs
        state.currentBalance = 1000000;
        state.dailyLimit = 100000000;
        state.usedLimit = 0;
    }
}

// Save balance to state and update display
function saveBalance(e) {
    e && e.preventDefault(); // Prevent form submission if triggered by a button
    
    // Re-initialize elements to make sure we have the latest references
    initElements();
    
    if (!initialBalanceInput) {
        console.error('Initial balance input not found');
        return;
    }
    
    const newBalance = parseInt(initialBalanceInput.value);
    if (isNaN(newBalance) || newBalance < 0) {
        showToast('Mohon masukkan jumlah saldo yang valid', 'danger');
        return;
    }
    
    state.currentBalance = newBalance;
    localStorage.setItem('savedBalance', newBalance.toString());
    
    // Update display
    updateDisplayedLimits();
    
    // Show success feedback
    showToast('Saldo berhasil diperbarui', 'success');
    
    // Log for debugging
    console.log('Saldo disimpan:', newBalance);
}

// Save daily limit to state and update display
function saveDailyLimit(e) {
    e && e.preventDefault(); // Prevent form submission if triggered by a button
    
    // Re-initialize elements to make sure we have the latest references
    initElements();
    
    if (!dailyLimitInput) {
        console.error('Daily limit input not found');
        return;
    }
    
    const newLimit = parseInt(dailyLimitInput.value);
    if (isNaN(newLimit) || newLimit < 100000) {
        showToast('Limit harian minimal Rp100.000', 'danger');
        return;
    }
    
    state.dailyLimit = newLimit;
    state.usedLimit = 0; // Reset used limit when daily limit changes
    localStorage.setItem('dailyLimit', newLimit.toString());
    
    // Update display
    updateDisplayedLimits();
    
    // Show success feedback
    showToast('Limit harian berhasil diperbarui', 'success');
    
    // Log for debugging
    console.log('Limit harian disimpan:', newLimit);
}

// Show toast notification
function showToast(message, type = 'info') {
    // Create toast element if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast show align-items-center text-white bg-${type} border-0`;
    toast.role = 'alert';
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove toast after 3 seconds
    setTimeout(() => {
        const toastElement = document.getElementById(toastId);
        if (toastElement) {
            toastElement.classList.remove('show');
            setTimeout(() => toastElement.remove(), 300);
        }
    }, 3000);
}

// Update displayed limits and balance
function updateDisplayedLimits() {
    const remaining = state.dailyLimit - state.usedLimit;
    
    try {
        // Update current balance display if element exists
        const balanceDisplay = document.getElementById('currentBalanceDisplay');
        if (balanceDisplay) {
            balanceDisplay.textContent = formatCurrency(state.currentBalance);
        }
        
        // Update remaining limit display if element exists
        const remainingLimitDisplay = document.getElementById('remainingLimitDisplay');
        if (remainingLimitDisplay) {
            remainingLimitDisplay.textContent = formatCurrency(remaining);
        } else {
            // If remainingLimitDisplay doesn't exist, try to use remainingLimitEl
            if (remainingLimitEl) {
                remainingLimitEl.textContent = formatCurrency(remaining);
            }
        }
        
        // Source account display removed - no longer needed
        
        // Update daily limit display if element exists
        if (dailyLimitEl) {
            dailyLimitEl.textContent = formatCurrency(state.dailyLimit);
        }
    } catch (error) {
        console.error('Error updating display:', error);
    }
}

// Initialize balance and limit from input fields
function initializeFromInputs() {
    state.currentBalance = parseInt(initialBalanceInput.value) || 0;
    state.dailyLimit = parseInt(dailyLimitInput.value) || 100000000;
    state.usedLimit = 0;
    updateDisplayedLimits();
}

// Validate account number
function validateAccountNumber(account) {
    return /^\d{10}$/.test(account);
}

// Format account number for display
function formatAccountNumber(account) {
    if (!account) return '-';
    return account.replace(/\d(?=\d{4})/g, '*');
}

// Set up event listeners
function setupEventListeners() {
    // Add event listeners only if elements exist
    if (btnContinue) btnContinue.addEventListener('click', handleContinue);
    if (btnVerify) btnVerify.addEventListener('click', handleVerify);
    if (btnBack) btnBack.addEventListener('click', handleBack);
    if (btnNewTransfer) btnNewTransfer.addEventListener('click', resetForm);
    if (resendOTPLink) resendOTPLink.addEventListener('click', handleResendOTP);
    
    // Save buttons
    if (saveBalanceBtn) {
        saveBalanceBtn.addEventListener('click', saveBalance);
    }
    
    if (saveLimitBtn) {
        saveLimitBtn.addEventListener('click', saveDailyLimit);
    }
    
    // Input change handlers
    if (dailyLimitInput) {
        dailyLimitInput.addEventListener('change', (e) => {
            const value = parseInt(e.target.value) || 100000000;
            state.dailyLimit = value;
            updateDisplayedLimits();
        });
    }
    
    if (initialBalanceInput) {
        initialBalanceInput.addEventListener('change', (e) => {
            const value = parseInt(e.target.value) || 0;
            state.currentBalance = value;
        });
    }
    
    // Handle OTP input auto-focus
    if (otpInputs && otpInputs.length > 0) {
        otpInputs.forEach((input, index) => {
            if (input) {
                input.addEventListener('input', (e) => {
                    if (e.target.value.length === 1) {
                        if (index < otpInputs.length - 1 && otpInputs[index + 1]) {
                            otpInputs[index + 1].focus();
                        }
                    } else if (e.target.value.length === 0 && index > 0) {
                        otpInputs[index - 1].focus();
                    }
                });
            }
        });
    }
}

// Handle continue button click
function handleContinue(e) {
    e.preventDefault();
    
    try {
        // Re-initialize elements to ensure we have the latest references
        initElements();
        
        // Validate elements exist
        if (!targetAccountInput || !amountInput) {
            throw new Error('Form elements not properly initialized');
        }
        
        // Get form values
        const targetAccount = targetAccountInput.value.trim();
        const amount = parseInt(amountInput.value);
        const notes = notesInput ? notesInput.value : '';
        
        // Log values for debugging
        console.log('Form values:', { targetAccount, amount, notes });
        
        // Validate form
        if (!validateTransferForm(targetAccount, amount)) {
            return;
        }
        
        // Store transfer data
        state.transferData = {
            targetAccount,
            amount,
            notes,
            date: new Date().toLocaleString(),
            reference: 'TRX' + Date.now().toString().slice(-8)
        };
        
        // Generate and send OTP
        state.generatedOTP = generateAndSendOTP();
        
        // Show OTP form
        if (transferForm) transferForm.style.display = 'none';
        if (otpForm) {
            otpForm.style.display = 'block';
            // Focus first OTP input
            if (otpInputs.length > 0) {
                otpInputs[0].focus();
            }
        }
    } catch (error) {
        console.error('Error in handleContinue:', error);
        showToast('Terjadi kesalahan saat memproses transfer. Silakan coba lagi.', 'danger');
    }
}

// Validate transfer form (basic validation only - before OTP)
function validateTransferForm(targetAccount, amount) {
    // Reset validation
    targetAccountInput.classList.remove('is-invalid');
    amountInput.classList.remove('is-invalid');
    
    let isValid = true;
    
    // Only validate amount range (10,000 - 50,000,000)
    if (isNaN(amount) || amount < 10000 || amount > 50000000) {
        amountInput.classList.add('is-invalid');
        isValid = false;
    }
    
    return isValid;
}

// Validate all transfer details (called after OTP verification)
function validateTransferDetails(targetAccount, amount) {
    // Reset validation
    targetAccountInput.classList.remove('is-invalid');
    amountInput.classList.remove('is-invalid');
    
    // Validate target account number (10 digits)
    if (!/^\d{10}$/.test(targetAccount)) {
        targetAccountInput.classList.add('is-invalid');
        showToast('Nomor rekening harus 10 digit angka.', 'danger');
        return false;
    }
    
    // Check if source has sufficient balance
    if (amount > state.currentBalance) {
        showToast('Saldo Anda tidak mencukupi untuk melakukan transaksi ini.', 'danger');
        return false;
    }
    
    // Check daily limit
    if (state.usedLimit + amount > state.dailyLimit) {
        showToast(`Jumlah transfer melebihi sisa limit harian Anda (${formatCurrency(state.dailyLimit - state.usedLimit)}).`, 'danger');
        return false;
    }
    
    return true;
}

// Process the transfer
function processTransfer() {
    const { amount } = state.transferData;
    
    // Deduct from balance
    state.currentBalance -= amount;
    state.usedLimit += amount;
    updateDisplayedLimits();
    
    // Simulate random success/failure (80% success rate for demo)
    const isSuccess = Math.random() < 0.8;
    
    // Show result
    showResult(isSuccess);
}

// Show transfer result
function showResult(isSuccess) {
    // Hide OTP form
    otpForm.style.display = 'none';
    
    // Show result
    resultDiv.style.display = 'block';
    const resultAlert = document.getElementById('resultAlert');
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    const transactionDetails = document.getElementById('transactionDetails');
    
    if (isSuccess) {
        // Success
        resultAlert.className = 'alert success';
        resultIcon.className = 'fas fa-check-circle text-success';
        resultTitle.textContent = 'Transfer Berhasil!';
        resultMessage.textContent = 'Transaksi Anda telah berhasil diproses.';
        
        // Show transaction details
        transactionDetails.innerHTML = `
            <div class="transaction-detail">
                <span class="transaction-detail-label">Nomor Referensi:</span>
                <span class="transaction-detail-value">${state.transferData.reference}</span>
            </div>
            <div class="transaction-detail">
                <span class="transaction-detail-label">Ke Rekening:</span>
                <span class="transaction-detail-value">${state.transferData.targetAccount}</span>
            </div>
            <div class="transaction-detail">
                <span class="transaction-detail-label">Jumlah Transfer:</span>
                <span class="transaction-detail-value amount">${formatCurrency(state.transferData.amount)}</span>
            </div>
            <div class="transaction-detail">
                <span class="transaction-detail-label">Saldo Sekarang:</span>
                <span class="transaction-detail-value">${formatCurrency(state.currentBalance)}</span>
            </div>
            <div class="transaction-detail">
                <span class="transaction-detail-label">Waktu Transaksi:</span>
                <span class="transaction-detail-value">${state.transferData.date}</span>
            </div>
        `;
    } else {
        // Failure
        resultAlert.className = 'alert error';
        resultIcon.className = 'fas fa-times-circle text-danger';
        resultTitle.textContent = 'Transfer Gagal';
        resultMessage.textContent = 'Maaf, terjadi kesalahan saat memproses transaksi Anda. Silakan coba lagi nanti.';
        
        // Show transaction details for failed transaction
        transactionDetails.innerHTML = `
            <div class="transaction-detail">
                <span class="transaction-detail-label">Rekening Tujuan:</span>
                <span class="transaction-detail-value">${state.transferData.targetAccount}</span>
            </div>
            <div class="transaction-detail">
                <span class="transaction-detail-label">Jumlah Transfer:</span>
                <span class="transaction-detail-value amount">${formatCurrency(state.transferData.amount)}</span>
            </div>
            <div class="transaction-detail">
                <span class="transaction-detail-label">Waktu Transaksi:</span>
                <span class="transaction-detail-value">${state.transferData.date}</span>
            </div>
            <div class="transaction-detail">
                <span class="transaction-detail-label">Status:</span>
                <span class="transaction-detail-value text-danger">Gagal</span>
            </div>
        `;
    }
}

// Reset form for new transfer
function resetForm() {
    // Reset form
    if (targetAccountInput) targetAccountInput.value = '';
    if (amountInput) amountInput.value = '';
    if (notesInput) notesInput.value = '';
    
    // Hide result and show form
    resultDiv.style.display = 'none';
    transferForm.style.display = 'block';
    
    // Reset OTP inputs
    otpInputs.forEach(input => input.value = '');
    
    // Focus on first field
    if (targetAccountInput) targetAccountInput.focus();
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Handle OTP verification
function handleVerify(e) {
    e.preventDefault();
    
    // Get the entered OTP
    let enteredOTP = '';
    otpInputs.forEach(input => {
        enteredOTP += input.value || '';
    });
    
    // Validate OTP
    if (enteredOTP.length !== 6) {
        showToast('Masukkan 6 digit kode OTP', 'danger');
        return;
    }
    
    if (enteredOTP === state.generatedOTP) {
        // OTP is correct, now validate all transfer details
        const { targetAccount, amount } = state.transferData;
        
        if (!validateTransferDetails(targetAccount, amount)) {
            // Validation failed, go back to form
            otpForm.style.display = 'none';
            transferForm.style.display = 'block';
            return;
        }
        
        // All validations passed, process the transfer
        processTransfer();
    } else {
        // Wrong OTP
        state.otpAttempts--;
        
        if (state.otpAttempts > 0) {
            showToast(`Kode OTP salah. Sisa percobaan: ${state.otpAttempts}`, 'danger');
            
            // Clear OTP inputs
            otpInputs.forEach(input => {
                input.value = '';
            });
            
            // Focus on first OTP input
            if (otpInputs[0]) {
                otpInputs[0].focus();
            }
            
            // Update remaining attempts display
            if (otpAttemptsEl) {
                otpAttemptsEl.textContent = `Percobaan tersisa: ${state.otpAttempts}`;
            }
        } else {
            // No more attempts
            showToast('Percobaan habis. Silakan coba lagi nanti.', 'danger');
            resetForm();
        }
    }
}

// Handle back button click
function handleBack() {
    otpForm.style.display = 'none';
    transferForm.style.display = 'block';
}

// Handle resend OTP
function handleResendOTP(e) {
    e.preventDefault();
    
    // Reset OTP attempts
    state.otpAttempts = 3;
    
    // Generate and send new OTP
    state.generatedOTP = generateAndSendOTP();
    
    // Update UI
    if (otpAttemptsEl) {
        otpAttemptsEl.textContent = `Percobaan tersisa: ${state.otpAttempts}`;
    }
    
    // Clear OTP inputs
    otpInputs.forEach(input => {
        input.value = '';
    });
    
    // Focus on first OTP input
    if (otpInputs[0]) {
        otpInputs[0].focus();
    }
    
    showToast('Kode OTP baru telah dikirim', 'info');
}

// Generate and send OTP (simulated)
function generateAndSendOTP() {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('OTP generated:', otp); // For testing
    
    // In a real app, you would send this OTP to the user's phone/email
    // sendOTPToUser(otp);
    
    return otp;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);