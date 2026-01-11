// Payment System for Andrews Villa
class PaymentSystem {
    constructor() {
        this.paymentMethods = {
            cashapp: {
                name: 'Cash App',
                icon: 'fa-money-bill-wave',
                description: 'Instant transfer via Cash App',
                instructions: 'Send payment to: $AndrewsVilla',
                color: '#00D632'
            },
            crypto: {
                name: 'Crypto Payment',
                icon: 'fab fa-ethereum',
                description: 'Various cryptocurrencies accepted',
                instructions: 'Send crypto to: 0x742d35Cc6634C0532925a3b844Bc9e...',
                color: '#627EEA'
            },
            chime: {
                name: 'Chime',
                icon: 'fa-mobile-alt',
                description: 'Bank transfer via Chime',
                instructions: 'Transfer to: Andrews Villa (Routing: 123456789)',
                color: '#15B786'
            }
        };
        
        this.transactions = [];
        this.init();
    }
    
    init() {
        console.log('Payment system initialized');
        this.loadTransactions();
    }
    
    loadTransactions() {
        // Load from localStorage
        const saved = localStorage.getItem('paymentTransactions');
        if (saved) {
            this.transactions = JSON.parse(saved);
        }
    }
    
    saveTransactions() {
        localStorage.setItem('paymentTransactions', JSON.stringify(this.transactions));
    }
    
    initiatePayment(transactionData) {
        const {
            propertyId,
            propertyTitle,
            amount,
            paymentMethod,
            type = 'booking',
            userId = localStorage.getItem('username') || 'anonymous'
        } = transactionData;
        
        // Create transaction record
        const transaction = {
            id: 'txn_' + Date.now(),
            propertyId,
            propertyTitle,
            amount,
            paymentMethod,
            type,
            userId,
            status: 'pending',
            createdAt: new Date().toISOString(),
            paymentDetails: this.paymentMethods[paymentMethod]
        };
        
        // Add to transactions
        this.transactions.push(transaction);
        this.saveTransactions();
        
        // Process payment (simulated)
        return this.processPayment(transaction);
    }
    
    processPayment(transaction) {
        return new Promise((resolve, reject) => {
            // Simulate payment processing
            console.log(`Processing ${transaction.paymentMethod} payment for $${transaction.amount}`);
            
            setTimeout(() => {
                // Simulate success 90% of the time
                const success = Math.random() < 0.9;
                
                if (success) {
                    transaction.status = 'completed';
                    transaction.completedAt = new Date().toISOString();
                    transaction.receiptId = 'RCPT' + Math.random().toString(36).substr(2, 9).toUpperCase();
                    
                    // Update user's payment history
                    this.updateUserPaymentHistory(transaction);
                    
                    // Generate receipt
                    const receipt = this.generateReceipt(transaction);
                    
                    this.saveTransactions();
                    resolve({
                        success: true,
                        transaction,
                        receipt,
                        message: 'Payment completed successfully'
                    });
                } else {
                    transaction.status = 'failed';
                    transaction.failedAt = new Date().toISOString();
                    transaction.failureReason = 'Payment processor declined transaction';
                    
                    this.saveTransactions();
                    reject({
                        success: false,
                        transaction,
                        message: 'Payment failed. Please try another method.'
                    });
                }
            }, 2000);
        });
    }
    
    updateUserPaymentHistory(transaction) {
        const userPayments = JSON.parse(localStorage.getItem('userPayments') || '[]');
        userPayments.push({
            id: transaction.id,
            date: transaction.completedAt,
            amount: transaction.amount,
            property: transaction.propertyTitle,
            method: transaction.paymentMethod,
            receiptId: transaction.receiptId,
            status: 'completed'
        });
        
        localStorage.setItem('userPayments', JSON.stringify(userPayments));
    }
    
    generateReceipt(transaction) {
        const receipt = `
            ANDREWS VILLA - OFFICIAL RECEIPT
            ================================
            Receipt ID: ${transaction.receiptId}
            Date: ${new Date(transaction.completedAt).toLocaleDateString()}
            Time: ${new Date(transaction.completedAt).toLocaleTimeString()}
            
            Transaction Details:
            -------------------
            Property: ${transaction.propertyTitle}
            Transaction Type: ${transaction.type}
            Amount: $${parseFloat(transaction.amount).toFixed(2)}
            Payment Method: ${transaction.paymentDetails.name}
            
            Payment Status: COMPLETED
            -------------------------
            
            Customer Information:
            --------------------
            Customer ID: ${transaction.userId}
            
            Terms & Conditions:
            ------------------
            1. This receipt is proof of payment
            2. All transactions are final
            3. For refund requests, contact support
            4. Receipt ID must be referenced
            
            Thank you for choosing Andrews Villa!
            =====================================
        `;
        
        return receipt;
    }
    
    getPaymentHistory(userId = null) {
        if (userId) {
            return this.transactions.filter(t => t.userId === userId);
        }
        return this.transactions;
    }
    
    getPaymentMethodDetails(method) {
        return this.paymentMethods[method] || null;
    }
    
    getAllPaymentMethods() {
        return Object.values(this.paymentMethods);
    }
    
    // Admin functions
    getAllTransactions() {
        return this.transactions;
    }
    
    updateTransactionStatus(transactionId, status) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (transaction) {
            transaction.status = status;
            transaction.updatedAt = new Date().toISOString();
            this.saveTransactions();
            return true;
        }
        return false;
    }
    
    getTransactionStats() {
        const completed = this.transactions.filter(t => t.status === 'completed');
        const pending = this.transactions.filter(t => t.status === 'pending');
        const failed = this.transactions.filter(t => t.status === 'failed');
        
        const totalAmount = completed.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        return {
            totalTransactions: this.transactions.length,
            completed: completed.length,
            pending: pending.length,
            failed: failed.length,
            totalAmount: totalAmount.toFixed(2),
            averageAmount: completed.length > 0 ? (totalAmount / completed.length).toFixed(2) : '0.00'
        };
    }
}

// Export for use in other files
let paymentSystemInstance = null;

function getPaymentSystem() {
    if (!paymentSystemInstance) {
        paymentSystemInstance = new PaymentSystem();
    }
    return paymentSystemInstance;
}

// Example usage in HTML page:
// 
// <script>
//     const paymentSystem = getPaymentSystem();
//     
//     // When user clicks pay button:
//     document.getElementById('payButton').addEventListener('click', async function() {
//         const paymentData = {
//             propertyId: 'prop_1',
//             propertyTitle: 'Modern Villa',
//             amount: '750000',
//             paymentMethod: 'bitcoin'
//         };
//         
//         try {
//             const result = await paymentSystem.initiatePayment(paymentData);
//             alert('Payment successful! Receipt: ' + result.receiptId);
//         } catch (error) {
//             alert('Payment failed: ' + error.message);
//         }
//     });
// </script>