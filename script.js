document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });

    // Shopping Cart Functionality
    let cart = [];

    // DOM Elements
    const cartIcon = document.getElementById('cartIcon');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const btnCheckout = document.getElementById('btnCheckout');
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');

    // Open cart
    function openCart() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close cart
    function closeCart() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Update cart display
    function updateCartDisplay() {
        // Update count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Update total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;

        // Update checkout button
        btnCheckout.disabled = cart.length === 0;

        // Render cart items
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Tu carrito está vacío</p>
                </div>
            `;
        } else {
            cartItems.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }
    }

    // Add to cart
    function addToCart(name, price) {
        const existingItem = cart.find(item => item.name === name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price: parseFloat(price), quantity: 1 });
        }

        updateCartDisplay();
        openCart();
    }

    // Update quantity (exposed globally for inline onclick)
    window.updateQuantity = function(index, change) {
        cart[index].quantity += change;

        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }

        updateCartDisplay();
    };

    // Remove from cart (exposed globally for inline onclick)
    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        updateCartDisplay();
    };

    // Event Listeners
    if (cartIcon) {
        cartIcon.addEventListener('click', openCart);
    }

    if (cartClose) {
        cartClose.addEventListener('click', closeCart);
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }

    // Add to cart button listeners
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const name = this.dataset.name;
            const price = this.dataset.price;

            // Visual feedback
            this.classList.add('added');
            const originalText = this.textContent;
            this.textContent = '¡Añadido!';

            setTimeout(() => {
                this.classList.remove('added');
                this.textContent = originalText;
            }, 1000);

            addToCart(name, price);
        });
    });

    // Checkout button
    if (btnCheckout) {
        btnCheckout.addEventListener('click', function() {
            if (cart.length > 0) {
                openCheckoutModal();
            }
        });
    }

    // Checkout Modal Functionality
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutModalOverlay = document.getElementById('checkoutModalOverlay');
    const checkoutModalClose = document.getElementById('checkoutModalClose');
    const checkoutCancel = document.getElementById('checkoutCancel');
    const checkoutConfirm = document.getElementById('checkoutConfirm');
    const checkoutSummary = document.getElementById('checkoutSummary');
    const customerName = document.getElementById('customerName');
    const customerEmail = document.getElementById('customerEmail');
    const customerPhone = document.getElementById('customerPhone');

    function openCheckoutModal() {
        // Generate order summary
        const productList = cart.map(item => `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n');
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        checkoutSummary.innerHTML = `<strong>Resumen del pedido:</strong><br>${cart.map(item => `${item.name} x${item.quantity}`).join('<br>')}<br><strong>Total: $${total.toFixed(2)}</strong>`;

        checkoutModal.classList.add('active');
        checkoutModalOverlay.classList.add('active');
        closeCart();
    }

    function closeCheckoutModal() {
        checkoutModal.classList.remove('active');
        checkoutModalOverlay.classList.remove('active');
        customerName.value = '';
        customerEmail.value = '';
        customerPhone.value = '';
    }

    if (checkoutModalClose) {
        checkoutModalClose.addEventListener('click', closeCheckoutModal);
    }

    if (checkoutCancel) {
        checkoutCancel.addEventListener('click', closeCheckoutModal);
    }

    if (checkoutModalOverlay) {
        checkoutModalOverlay.addEventListener('click', closeCheckoutModal);
    }

    if (checkoutConfirm) {
        checkoutConfirm.addEventListener('click', function() {
            const name = customerName.value.trim();
            const email = customerEmail.value.trim();
            const phone = customerPhone.value.trim();

            if (!name || !email || !phone) {
                alert('Por favor completa todos los campos.');
                return;
            }

            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor ingresa un correo electrónico válido.');
                return;
            }

            // Prepare order data
            const productList = cart.map(item => `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join(' | ');
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Fill hidden form fields
            document.getElementById('orderFormName').value = name;
            document.getElementById('orderFormEmail').value = email;
            document.getElementById('orderFormPhone').value = phone;
            document.getElementById('orderFormProducts').value = productList;
            document.getElementById('orderFormTotal').value = `$${total.toFixed(2)}`;

            // Submit the form via fetch
            const form = document.querySelector('form[name="pedidos"]');
            const formData = new FormData(form);

            checkoutConfirm.disabled = true;
            checkoutConfirm.textContent = 'Enviando...';

            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            })
            .then(response => {
                if (response.ok) {
                    alert('¡Gracias por tu pedido, ' + name + '! Te contactaremos pronto para confirmar los detalles.');
                    cart = [];
                    updateCartDisplay();
                    closeCheckoutModal();
                } else {
                    throw new Error('Error en el envío');
                }
            })
            .catch(error => {
                alert('Hubo un problema al enviar tu pedido. Por favor intenta de nuevo o contáctanos directamente.');
                console.error('Error:', error);
            })
            .finally(() => {
                checkoutConfirm.disabled = false;
                checkoutConfirm.textContent = 'Confirmar Pedido';
            });
        });
    }

    // Initialize cart display
    updateCartDisplay();
});
