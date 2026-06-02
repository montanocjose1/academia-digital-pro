import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../components/Course/CourseCard';
import { Trash2, ShoppingCart, Percent, CreditCard, ShieldCheck, CheckCircle2, Ticket, FileText } from 'lucide-react';

export default function CartPage() {
  const { user } = useAuth();
  const {
    cartItems,
    coupon,
    couponError,
    couponLoading,
    subtotal,
    discountAmount,
    total,
    removeFromCart,
    applyCoupon,
    checkoutCart,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponAppliedSuccess, setCouponAppliedSuccess] = useState(false);
  
  // Checkout Emulation states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  
  // Success Invoice state
  const [purchaseInvoice, setPurchaseInvoice] = useState(null);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponAppliedSuccess(false);
    if (!couponCode) return;

    const res = await applyCoupon(couponCode);
    if (res.success) {
      setCouponAppliedSuccess(true);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setCheckoutError('');
    setCheckoutLoading(true);

    if (!user) {
      setCheckoutError('Debes iniciar sesión para realizar la compra.');
      setCheckoutLoading(false);
      return;
    }

    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      setCheckoutError('Por favor complete todos los datos de facturación ficticios.');
      setCheckoutLoading(false);
      return;
    }

    // Call checkout api
    const res = await checkoutCart();
    if (res.success) {
      // Store checkout purchase object to display invoice receipt
      setPurchaseInvoice(res.purchase);
    } else {
      setCheckoutError(res.message || 'Error al procesar la inscripción.');
    }
    setCheckoutLoading(false);
  };

  // If purchase completes, show receipt invoice layout
  if (purchaseInvoice) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-28 pb-20 space-y-8">
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-slate-900 shadow-2xl space-y-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
          
          <div className="w-16 h-16 bg-emerald-950/30 rounded-2xl flex items-center justify-center border border-emerald-500/20 mx-auto text-emerald-400">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display font-extrabold text-3xl text-white">¡Compra Exitosa!</h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Se ha completado el pago emulado. Ya puedes acceder a tus cursos desde tu panel de aprendizaje.
            </p>
          </div>

          {/* Invoice Print Layout */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 md:p-8 text-left space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span className="font-display font-bold text-lg text-white">Factura de Compra</span>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Cód: {purchaseInvoice.invoiceNumber}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold uppercase tracking-wider">Cliente:</span>
                <p className="text-slate-350 font-medium">{user.name}</p>
                <p className="text-slate-500">{user.email}</p>
              </div>
              <div className="space-y-1 md:text-right">
                <span className="text-slate-500 font-semibold uppercase tracking-wider">Fecha de Emisión:</span>
                <p className="text-slate-350 font-medium">{new Date(purchaseInvoice.createdAt).toLocaleDateString()}</p>
                <p className="text-slate-500">Estado: <span className="text-emerald-400 font-bold">PAGADO</span></p>
              </div>
            </div>

            {/* Courses bought */}
            <div className="border-t border-slate-900 pt-4 space-y-3">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Cursos Adquiridos:</span>
              <div className="divide-y divide-slate-900 bg-slate-900/10 rounded-xl px-4 border border-slate-900/60">
                {cartItems.map((item) => (
                  <div key={item._id} className="py-3 flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium pr-4">{item.title}</span>
                    <span className="text-slate-400 font-semibold flex-shrink-0">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total balance pricing */}
            <div className="border-t border-slate-900 pt-4 grid grid-cols-2 gap-2 text-xs md:text-sm">
              <div className="text-slate-500">Subtotal:</div>
              <div className="text-right text-slate-400">${subtotal.toFixed(2)}</div>

              {discountAmount > 0 && (
                <>
                  <div className="text-slate-500">Descuento {purchaseInvoice.couponApplied ? `(${purchaseInvoice.couponApplied})` : ''}:</div>
                  <div className="text-right text-rose-400">-${discountAmount.toFixed(2)}</div>
                </>
              )}

              <div className="text-slate-200 font-bold text-sm md:text-base border-t border-slate-900 pt-2 mt-2 uppercase">Total Pagado:</div>
              <div className="text-right text-indigo-400 font-bold text-sm md:text-base border-t border-slate-900 pt-2 mt-2">
                ${purchaseInvoice.totalAmount.toFixed(2)} USD
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to="/profile"
              className="w-full sm:w-auto btn-gradient text-white font-semibold px-6 py-3 rounded-xl text-sm"
            >
              Ir a Mis Cursos
            </Link>
            <Link
              to="/courses"
              className="w-full sm:w-auto btn-gradient-secondary text-slate-300 font-semibold px-6 py-3 rounded-xl text-sm"
            >
              Seguir Comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty, show empty state
  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-28 pb-20">
        <div className="glass-panel p-12 rounded-3xl border border-slate-900 shadow-2xl text-center space-y-6">
          <ShoppingCart className="w-16 h-16 text-slate-650 mx-auto" />
          <h1 className="font-display font-extrabold text-2xl text-white">Tu carrito está vacío</h1>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Aún no has agregado ningún curso a tu carrito de compras.
          </p>
          <Link
            to="/courses"
            className="inline-flex btn-gradient text-white font-semibold px-6 py-3 rounded-xl text-sm"
          >
            Ver Catálogo de Cursos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      
      {/* Title */}
      <h1 className="font-display font-extrabold text-3xl text-white mb-8">Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Items List (Left Column) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="divide-y divide-slate-900 glass-panel border border-slate-900 rounded-2xl overflow-hidden px-6 shadow-xl">
            {cartItems.map((item) => (
              <div key={item._id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-4 min-w-0">
                  <img
                    src={getImageUrl(item.thumbnail)}
                    alt={item.title}
                    className="w-16 h-10 object-cover rounded-lg bg-slate-950 flex-shrink-0"
                  />
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-sm font-semibold text-slate-200 truncate pr-2">{item.title}</h3>
                    <p className="text-xs text-indigo-400 font-semibold">{item.category}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 flex-shrink-0">
                  <span className="font-display font-bold text-sm text-slate-200">${item.price.toFixed(2)}</span>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1.5 rounded-full hover:bg-slate-900/50 cursor-pointer"
                    title="Eliminar curso"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon validator Form */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-900 shadow-xl space-y-4">
            <h3 className="font-display font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <Ticket className="w-4 h-4 text-indigo-400" />
              <span>¿Tienes un cupón de descuento?</span>
            </h3>
            
            {couponError && <p className="text-xs text-rose-400 font-semibold">{couponError}</p>}
            {couponAppliedSuccess && (
              <p className="text-xs text-emerald-400 font-semibold">
                ¡Cupón aplicado! Descuento activo: {coupon.discountType === 'percentage' ? `${coupon.value}%` : `$${coupon.value} USD`}
              </p>
            )}

            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Ingresa código (Ej: PRO50)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={couponAppliedSuccess}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={couponLoading || couponAppliedSuccess || !couponCode}
                className="bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              >
                {couponLoading ? 'Verificando...' : 'Aplicar'}
              </button>
            </form>
          </div>
        </div>

        {/* Pricing Summary & Checkout Panel (Right Column) */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-6 rounded-2xl border border-slate-900 shadow-2xl space-y-6">
            <h2 className="font-display font-bold text-lg text-white border-b border-slate-900 pb-3 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              <span>Resumen y Pago Ficticio</span>
            </h2>

            {checkoutError && (
              <div className="bg-rose-950/20 border border-rose-500/20 text-rose-400 text-xs rounded-xl p-3.5 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Calculations summary details */}
            <div className="space-y-2.5 text-xs pb-4 border-b border-slate-900">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({cartItems.length} cursos)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-400 font-medium">
                  <span>Descuento cupón</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-white font-bold text-sm pt-2 uppercase">
                <span>Total a Pagar</span>
                <span className="text-indigo-400 font-extrabold">${total.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Emulated Payment Gateway form details */}
            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Nombre del Tarjetahabiente</label>
                <input
                  type="text"
                  required
                  placeholder="Juan Perez"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Número de Tarjeta</label>
                <input
                  type="text"
                  required
                  placeholder="4000 1234 5678 9010"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Vencimiento</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">CVV</label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={checkoutLoading}
                className="w-full btn-gradient text-white font-semibold py-3.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 cursor-pointer text-xs"
              >
                <span>{checkoutLoading ? 'Procesando pago emulado...' : `Pagar $${total.toFixed(2)} USD`}</span>
              </button>
            </form>

            <div className="flex items-center space-x-2 justify-center text-[10px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Pago 100% encriptado. Transacción ficticia de demostración.</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
