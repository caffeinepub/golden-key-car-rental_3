import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface Translations {
  [key: string]: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.cars': 'Our Fleet',
    'nav.blog': 'Blog',
    'nav.dashboard': 'My Dashboard',
    'nav.admin': 'Admin',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.booking': 'Book Now',

    // Hero
    'hero.title': 'Drive in Luxury',
    'hero.subtitle': 'Premium car rental experience with Golden Key',
    'hero.cta': 'Explore Our Fleet',
    'hero.cta2': 'Book Now',

    // Cars
    'cars.title': 'Our Premium Fleet',
    'cars.search': 'Search cars...',
    'cars.filter.category': 'Category',
    'cars.filter.transmission': 'Transmission',
    'cars.filter.price': 'Max Daily Price',
    'cars.filter.all': 'All',
    'cars.filter.economy': 'Economy',
    'cars.filter.suv': 'SUV',
    'cars.filter.luxury': 'Luxury',
    'cars.filter.van': 'Van',
    'cars.filter.automatic': 'Automatic',
    'cars.filter.manual': 'Manual',
    'cars.available': 'Available',
    'cars.unavailable': 'Unavailable',
    'cars.perDay': '/day',
    'cars.bookNow': 'Book Now',
    'cars.viewDetails': 'View Details',
    'cars.noResults': 'No cars found matching your criteria.',
    'cars.loading': 'Loading cars...',
    'cars.dailyRate': 'Daily Rate',
    'cars.category': 'Category',
    'cars.transmission': 'Transmission',
    'cars.specs': 'Specifications',
    'cars.gallery': 'Gallery',
    'cars.reviews': 'Reviews',
    'cars.availability': 'Availability',

    // Booking
    'booking.title': 'Complete Your Booking',
    'booking.step1': 'Rental Details',
    'booking.step2': 'Add-ons',
    'booking.step3': 'Customer Info',
    'booking.step4': 'Payment',
    'booking.pickupDate': 'Pickup Date',
    'booking.returnDate': 'Return Date',
    'booking.location': 'Location',
    'booking.addons': 'Add-ons',
    'booking.childSeat': 'Child Seat',
    'booking.additionalDriver': 'Additional Driver',
    'booking.unlimitedKm': 'Unlimited KM',
    'booking.name': 'Full Name',
    'booking.email': 'Email Address',
    'booking.phone': 'Phone Number',
    'booking.license': "Driver's License Number",
    'booking.total': 'Total',
    'booking.proceed': 'Proceed to Payment',
    'booking.loginRequired': 'Please login to complete your booking',
    'booking.login': 'Login with Internet Identity',
    'booking.summary': 'Booking Summary',
    'booking.baseCost': 'Base Cost',
    'booking.addonsCost': 'Add-ons Cost',
    'booking.discount': 'Discount',
    'booking.earlyPayment': 'Early Payment Discount (10%)',
    'booking.days': 'days',

    // Pricing
    'pricing.title': 'Price Calculator',
    'pricing.currency': 'Currency',
    'pricing.promoCode': 'Promo Code',
    'pricing.apply': 'Apply',
    'pricing.earlyPayment': 'Early Payment Discount',
    'pricing.total': 'Total Cost',
    'pricing.perDay': 'Per Day',
    'pricing.days': 'Days',
    'pricing.promoApplied': 'Promo code applied!',
    'pricing.promoInvalid': 'Invalid or expired promo code',

    // Reviews
    'reviews.title': 'Customer Reviews',
    'reviews.write': 'Write a Review',
    'reviews.rating': 'Rating',
    'reviews.comment': 'Your Review',
    'reviews.submit': 'Submit Review',
    'reviews.noReviews': 'No reviews yet. Be the first to review!',
    'reviews.loginRequired': 'Login to write a review',
    'reviews.average': 'Average Rating',
    'reviews.success': 'Review submitted successfully!',
    'reviews.completedRequired': 'You can only review cars you have completed a booking for.',

    // Dashboard
    'dashboard.title': 'My Dashboard',
    'dashboard.profile': 'Profile',
    'dashboard.bookings': 'My Bookings',
    'dashboard.invoices': 'Invoices',
    'dashboard.editProfile': 'Edit Profile',
    'dashboard.saveProfile': 'Save Profile',
    'dashboard.cancel': 'Cancel',
    'dashboard.cancelBooking': 'Cancel Booking',
    'dashboard.downloadInvoice': 'Download Invoice',
    'dashboard.noBookings': 'No bookings found.',
    'dashboard.status.pending': 'Pending',
    'dashboard.status.confirmed': 'Confirmed',
    'dashboard.status.cancelled': 'Cancelled',
    'dashboard.status.completed': 'Completed',

    // Admin
    'admin.title': 'Admin Dashboard',
    'admin.cars': 'Car Management',
    'admin.bookings': 'Bookings',
    'admin.users': 'Users',
    'admin.promotions': 'Promotions',
    'admin.revenue': 'Revenue',
    'admin.stripe': 'Stripe Config',
    'admin.blog': 'Blog Posts',
    'admin.addCar': 'Add Car',
    'admin.editCar': 'Edit Car',
    'admin.deleteCar': 'Delete Car',
    'admin.createPromo': 'Create Promo Code',
    'admin.totalRevenue': 'Total Revenue',

    // Blog
    'blog.title': 'Golden Key Blog',
    'blog.readMore': 'Read More',
    'blog.backToBlog': 'Back to Blog',
    'blog.by': 'By',
    'blog.noPosts': 'No blog posts yet.',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.clear': 'Clear',
    'common.goHome': 'Go to Home',
    'common.accessDenied': 'Access Denied',
    'common.accessDeniedMsg': 'You do not have permission to view this page.',

    // Footer
    'footer.rights': 'All rights reserved.',
    'footer.contact': 'Contact Us',
    'footer.whatsapp': 'WhatsApp',
    'footer.fleet': 'Our Fleet',
    'footer.blog': 'Blog',
    'footer.privacy': 'Privacy Policy',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.cars': 'أسطولنا',
    'nav.blog': 'المدونة',
    'nav.dashboard': 'لوحة التحكم',
    'nav.admin': 'الإدارة',
    'nav.login': 'تسجيل الدخول',
    'nav.logout': 'تسجيل الخروج',
    'nav.booking': 'احجز الآن',

    // Hero
    'hero.title': 'تنقل بفخامة',
    'hero.subtitle': 'تجربة تأجير سيارات فاخرة مع المفتاح الذهبي',
    'hero.cta': 'استكشف أسطولنا',
    'hero.cta2': 'احجز الآن',

    // Cars
    'cars.title': 'أسطولنا المتميز',
    'cars.search': 'ابحث عن سيارات...',
    'cars.filter.category': 'الفئة',
    'cars.filter.transmission': 'ناقل الحركة',
    'cars.filter.price': 'أقصى سعر يومي',
    'cars.filter.all': 'الكل',
    'cars.filter.economy': 'اقتصادية',
    'cars.filter.suv': 'دفع رباعي',
    'cars.filter.luxury': 'فاخرة',
    'cars.filter.van': 'فان',
    'cars.filter.automatic': 'أوتوماتيك',
    'cars.filter.manual': 'يدوي',
    'cars.available': 'متاحة',
    'cars.unavailable': 'غير متاحة',
    'cars.perDay': '/يوم',
    'cars.bookNow': 'احجز الآن',
    'cars.viewDetails': 'عرض التفاصيل',
    'cars.noResults': 'لا توجد سيارات تطابق معاييرك.',
    'cars.loading': 'جاري تحميل السيارات...',
    'cars.dailyRate': 'السعر اليومي',
    'cars.category': 'الفئة',
    'cars.transmission': 'ناقل الحركة',
    'cars.specs': 'المواصفات',
    'cars.gallery': 'معرض الصور',
    'cars.reviews': 'التقييمات',
    'cars.availability': 'التوفر',

    // Booking
    'booking.title': 'أكمل حجزك',
    'booking.step1': 'تفاصيل الإيجار',
    'booking.step2': 'الإضافات',
    'booking.step3': 'معلومات العميل',
    'booking.step4': 'الدفع',
    'booking.pickupDate': 'تاريخ الاستلام',
    'booking.returnDate': 'تاريخ الإرجاع',
    'booking.location': 'الموقع',
    'booking.addons': 'الإضافات',
    'booking.childSeat': 'مقعد الأطفال',
    'booking.additionalDriver': 'سائق إضافي',
    'booking.unlimitedKm': 'كيلومترات غير محدودة',
    'booking.name': 'الاسم الكامل',
    'booking.email': 'البريد الإلكتروني',
    'booking.phone': 'رقم الهاتف',
    'booking.license': 'رقم رخصة القيادة',
    'booking.total': 'الإجمالي',
    'booking.proceed': 'المتابعة للدفع',
    'booking.loginRequired': 'يرجى تسجيل الدخول لإتمام الحجز',
    'booking.login': 'تسجيل الدخول',
    'booking.summary': 'ملخص الحجز',
    'booking.baseCost': 'التكلفة الأساسية',
    'booking.addonsCost': 'تكلفة الإضافات',
    'booking.discount': 'الخصم',
    'booking.earlyPayment': 'خصم الدفع المبكر (10%)',
    'booking.days': 'أيام',

    // Pricing
    'pricing.title': 'حاسبة الأسعار',
    'pricing.currency': 'العملة',
    'pricing.promoCode': 'رمز الخصم',
    'pricing.apply': 'تطبيق',
    'pricing.earlyPayment': 'خصم الدفع المبكر',
    'pricing.total': 'التكلفة الإجمالية',
    'pricing.perDay': 'في اليوم',
    'pricing.days': 'أيام',
    'pricing.promoApplied': 'تم تطبيق رمز الخصم!',
    'pricing.promoInvalid': 'رمز خصم غير صالح أو منتهي الصلاحية',

    // Reviews
    'reviews.title': 'تقييمات العملاء',
    'reviews.write': 'اكتب تقييماً',
    'reviews.rating': 'التقييم',
    'reviews.comment': 'تقييمك',
    'reviews.submit': 'إرسال التقييم',
    'reviews.noReviews': 'لا توجد تقييمات بعد. كن أول من يقيّم!',
    'reviews.loginRequired': 'سجل الدخول لكتابة تقييم',
    'reviews.average': 'متوسط التقييم',
    'reviews.success': 'تم إرسال التقييم بنجاح!',
    'reviews.completedRequired': 'يمكنك فقط تقييم السيارات التي أكملت حجزاً لها.',

    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.profile': 'الملف الشخصي',
    'dashboard.bookings': 'حجوزاتي',
    'dashboard.invoices': 'الفواتير',
    'dashboard.editProfile': 'تعديل الملف',
    'dashboard.saveProfile': 'حفظ الملف',
    'dashboard.cancel': 'إلغاء',
    'dashboard.cancelBooking': 'إلغاء الحجز',
    'dashboard.downloadInvoice': 'تحميل الفاتورة',
    'dashboard.noBookings': 'لا توجد حجوزات.',
    'dashboard.status.pending': 'قيد الانتظار',
    'dashboard.status.confirmed': 'مؤكد',
    'dashboard.status.cancelled': 'ملغي',
    'dashboard.status.completed': 'مكتمل',

    // Admin
    'admin.title': 'لوحة الإدارة',
    'admin.cars': 'إدارة السيارات',
    'admin.bookings': 'الحجوزات',
    'admin.users': 'المستخدمون',
    'admin.promotions': 'العروض',
    'admin.revenue': 'الإيرادات',
    'admin.stripe': 'إعداد Stripe',
    'admin.blog': 'المدونة',
    'admin.addCar': 'إضافة سيارة',
    'admin.editCar': 'تعديل سيارة',
    'admin.deleteCar': 'حذف سيارة',
    'admin.createPromo': 'إنشاء رمز خصم',
    'admin.totalRevenue': 'إجمالي الإيرادات',

    // Blog
    'blog.title': 'مدونة المفتاح الذهبي',
    'blog.readMore': 'اقرأ المزيد',
    'blog.backToBlog': 'العودة للمدونة',
    'blog.by': 'بقلم',
    'blog.noPosts': 'لا توجد مقالات بعد.',

    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.close': 'إغلاق',
    'common.confirm': 'تأكيد',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.submit': 'إرسال',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.clear': 'مسح',
    'common.goHome': 'الذهاب للرئيسية',
    'common.accessDenied': 'وصول مرفوض',
    'common.accessDeniedMsg': 'ليس لديك صلاحية لعرض هذه الصفحة.',

    // Footer
    'footer.rights': 'جميع الحقوق محفوظة.',
    'footer.contact': 'اتصل بنا',
    'footer.whatsapp': 'واتساب',
    'footer.fleet': 'أسطولنا',
    'footer.blog': 'المدونة',
    'footer.privacy': 'سياسة الخصوصية',
  }
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('gk-language');
    return (stored === 'ar' || stored === 'en') ? stored : 'en';
  });

  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('gk-language', language);
  }, [language, isRTL]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
