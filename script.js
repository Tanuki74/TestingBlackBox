// Global variables
let dailyTotal = 0;
const DAILY_LIMIT = 100000000;
let otpAttempts = 3;
let currentOtp = '';
let accountBalance = 100000000; // Example balance

// DOM Elements
const transferForm = document.getElementById('transferForm');
const otpSection = document.getElementById('otpSection');
const resultSection = document.getElementById('resultSection');
const accountNumberInput = document.getElementById('accountNumber');
const amountInput = document.getElementById('amount');
const otpInput = document.getElementById('otp');
const otpAttemptsSpan = document.getElementById('otpAttempts');
const transactionResult = document.getElementById('transactionResult');

// Event Listeners
document.getElementById('submitBtn').addEventListener('click', validateTransfer);
document.getElementById('verifyOtpBtn').addEventListener('click', verifyOtp);
document.getElementById('newTransactionBtn').addEventListener('click', resetForm);

// Generate random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate transfer form
function validateTransfer(e) {
    e.preventDefault();
    
    const accountNumber = accountNumberInput.value.trim();
    const amount = parseInt(amountInput.value);
    
    // Reset error messages
    document.getElementById('accountNumberError').textContent = '';
    document.getElementById('amountError').textContent = '';
    
    let isValid = true;
    
    // Validate account number (exactly 10 digits)
    if (!/^\d{10}$/.test(accountNumber)) {
        document.getElementById('accountNumberError').textContent = 'Nomor rekening harus 10 digit angka';
        isValid = false;
    }
    
    // Validate amount
    if (isNaN(amount) || amount < 10000 || amount > 50000000) {
        document.getElementById('amountError').textContent = 'Nominal transfer harus antara 10.000 - 50.000.000';
        isValid = false;
    } else if (amount > accountBalance) {
        document.getElementById('amountError').textContent = 'Saldo tidak mencukupi';
        isValid = false;
    } else if ((dailyTotal + amount) > DAILY_LIMIT) {
        document.getElementById('amountError').textContent = `Melebihi batas harian. Sisa limit harian: ${(DAILY_LIMIT - dailyTotal).toLocaleString('id-ID')}`;
        isValid = false;
    }
    
    if (isValid) {
        // Generate and send OTP (simulated)
        currentOtp = generateOTP();
        console.log(`OTP for testing: ${currentOtp}`); // For testing purposes
        
        // Show OTP section
        transferForm.style.display = 'none';
        otpSection.style.display = 'block';
        otpInput.focus();
    }
}

// Verify OTP
function verifyOtp() {
    const enteredOtp = otpInput.value.trim();
    
    if (enteredOtp === currentOtp) {
        // OTP is correct, process transfer
        processTransfer();
    } else {
        // Incorrect OTP
        otpAttempts--;
        otpAttemptsSpan.textContent = otpAttempts;
        
        if (otpAttempts <= 0) {
            // No more attempts left
            showResult('Transaksi dibatalkan. Batas percobaan OTP habis.', false);
            otpSection.style.display = 'none';
        } else {
            document.getElementById('otpError').textContent = 'Kode OTP salah. Silakan coba lagi.';
        }
    }
}

// Process the transfer
function processTransfer() {
    const amount = parseInt(amountInput.value);
    const accountNumber = accountNumberInput.value;
    
    // Update balance and daily total
    accountBalance -= amount;
    dailyTotal += amount;
    
    // Show success message
    const message = `Transfer sebesar ${amount.toLocaleString('id-ID')} ke rekening ${accountNumber} berhasil!<br>Saldo Anda: ${accountBalance.toLocaleString('id-ID')}`;
    showResult(message, true);
    
    // Hide OTP section
    otpSection.style.display = 'none';
}

// Show transaction result
function showResult(message, isSuccess) {
    resultSection.style.display = 'block';
    transactionResult.innerHTML = message;
    transactionResult.className = isSuccess ? 'success' : 'error';
}

// Reset form for new transaction
function resetForm() {
    transferForm.style.display = 'block';
    resultSection.style.display = 'none';
    accountNumberInput.value = '';
    amountInput.value = '';
    otpInput.value = '';
    document.getElementById('notes').value = '';
    document.getElementById('otpError').textContent = '';
    otpAttempts = 3;
    otpAttemptsSpan.textContent = otpAttempts;
    
    // Reset OTP for security
    currentOtp = '';
}
