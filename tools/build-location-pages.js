#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const facts = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "hotel-facts.json"), "utf8"));
const BASE = facts.identity.canonicalUrl.replace(/\/$/, "");
const BOOKING = facts.booking.engineUrl;
const WHATSAPP = facts.booking.whatsappUrl;
const HOTEL_MAP = facts.identity.mapUrl;

const languageMeta = {
  tr: { htmlLang: "tr", hreflang: "tr-TR", dir: "ltr", locale: "tr_TR", home: "/", name: "Türkçe", code: "TR" },
  en: { htmlLang: "en", hreflang: "en", dir: "ltr", locale: "en_US", home: "/en/", name: "English", code: "EN" },
  ar: { htmlLang: "ar", hreflang: "ar", dir: "rtl", locale: "ar_AR", home: "/ar/", name: "العربية", code: "AR" },
  ka: { htmlLang: "ka", hreflang: "ka-GE", dir: "ltr", locale: "ka_GE", home: "/ka/", name: "ქართული", code: "KA" },
};

const slugs = {
  airport: {
    tr: "/trabzon-havalimanina-yakin-otel/",
    en: "/en/hotel-near-trabzon-airport/",
    ar: "/ar/hotel-near-trabzon-airport/",
    ka: "/ka/hotel-near-trabzon-airport/",
  },
  forum: {
    tr: "/forum-trabzon-yakin-otel/",
    en: "/en/hotel-near-forum-trabzon/",
    ar: "/ar/hotel-near-forum-trabzon/",
    ka: "/ka/hotel-near-forum-trabzon/",
  },
  farabi: {
    tr: "/farabi-hastanesi-yakin-otel/",
    en: "/en/hotel-near-farabi-hospital/",
    ar: "/ar/hotel-near-farabi-hospital/",
    ka: "/ka/hotel-near-farabi-hospital/",
  },
};

const ui = {
  tr: {
    home: "Ana Sayfa", airport: "Havalimanı", forum: "Forum Trabzon", farabi: "Farabi Hastanesi", rooms: "Odalar",
    book: "Oda ve fiyatları kontrol et", route: "Canlı rotayı aç", useful: "İlgili sayfalar", currentPrice: "Güncel fiyat ve müsaitlik",
    ctaText: "Fiyatlar tarihe, oda tipine ve seçilen koşullara göre değişir. Güncel seçenekleri rezervasyon sisteminde görün veya WhatsApp’tan sorun.",
    nav: "Gezinme", breadcrumb: "İçerik yolu", quick: "Hızlı rezervasyon", contact: "İletişim", footer: "Trabzon’da konaklama planınıza uygun oda seçeneklerini inceleyin; güncel fiyatı rezervasyon sisteminde veya WhatsApp üzerinden doğrulayın.",
  },
  en: {
    home: "Home", airport: "Airport", forum: "Forum Trabzon", farabi: "Farabi Hospital", rooms: "Rooms",
    book: "Check rooms and prices", route: "Open live route", useful: "Related pages", currentPrice: "Current rates and availability",
    ctaText: "Rates change by date, room type and selected conditions. Check the booking engine or ask on WhatsApp for the current options.",
    nav: "Navigation", breadcrumb: "Breadcrumb", quick: "Quick booking", contact: "Contact", footer: "Compare room options for your stay in Trabzon, then confirm the current rate in the booking engine or on WhatsApp.",
  },
  ar: {
    home: "الرئيسية", airport: "المطار", forum: "Forum Trabzon", farabi: "مستشفى فارابي", rooms: "الغرف",
    book: "تحقق من الغرف والأسعار", route: "افتح المسار المباشر", useful: "صفحات مرتبطة", currentPrice: "الأسعار والتوفر الآن",
    ctaText: "تتغير الأسعار حسب التاريخ ونوع الغرفة وشروط السعر المختار. راجع نظام الحجز أو اسأل عبر واتساب عن الخيارات الحالية.",
    nav: "التنقل", breadcrumb: "مسار الصفحة", quick: "حجز سريع", contact: "التواصل", footer: "قارن خيارات الغرف لإقامتك في طرابزون، ثم تحقق من السعر الحالي عبر نظام الحجز أو واتساب.",
  },
  ka: {
    home: "მთავარი", airport: "აეროპორტი", forum: "Forum Trabzon", farabi: "ფარაბის საავადმყოფო", rooms: "ოთახები",
    book: "ოთახებისა და ფასების შემოწმება", route: "ცოცხალი მარშრუტის გახსნა", useful: "დაკავშირებული გვერდები", currentPrice: "მიმდინარე ფასი და ხელმისაწვდომობა",
    ctaText: "ფასი თარიღის, ოთახის ტიპისა და არჩეული პირობების მიხედვით იცვლება. მიმდინარე ვარიანტები შეამოწმეთ დაჯავშნის სისტემაში ან WhatsApp-ზე.",
    nav: "ნავიგაცია", breadcrumb: "გვერდის გზა", quick: "სწრაფი დაჯავშნა", contact: "კონტაქტი", footer: "შეადარეთ ტრაბზონში განთავსების ოთახები და მიმდინარე ფასი გადაამოწმეთ დაჯავშნის სისტემაში ან WhatsApp-ზე.",
  },
};

const content = {
  airport: {
    destination: "Trabzon Airport",
    image: "/assets/lobi.webp",
    official: "https://www.dhmi.gov.tr/Sayfalar/Havalimani/Trabzon/Ulasim.aspx",
    tr: {
      title: "Trabzon Havalimanına Yakın Otel | Pelit Park Hotel", description: "Trabzon Havalimanı odaklı konaklamanız için Pelit Park Hotel’in konumunu, güncel ulaşım seçeneklerini, geç varış planını, otoparkı ve rezervasyonu inceleyin.",
      eyebrow: "Trabzon’a varış", h1: "Trabzon Havalimanına Yakın Otel", lead: "Uçuş öncesi veya sonrası sakin bir oda arıyorsanız, Pelit Park Hotel’den havalimanına canlı rotayı kontrol edebilir, varış saatinizi resepsiyona iletebilir ve güncel oda seçeneklerini görebilirsiniz.",
      introTitle: "Havalimanı yolculuğunu doğrulanabilir bilgilerle planlayın", intro: "Otel adına garantili bir transfer sözü vermiyoruz. DHMİ; havalimanına HAVAŞ, belediye otobüsü, dolmuş, ticari taksi, kiralık araç ve özel araçla ulaşılabildiğini belirtiyor. Saat ve güzergâhlar değişebileceği için seyahat gününde resmi kaynağı ve canlı rotayı kontrol edin.", imageAlt: "Pelit Park Hotel lobi ve resepsiyon alanı",
      cards: [
        ["ri-bus-line", "Güncel ulaşım seçenekleri", "HAVAŞ, belediye otobüsü, dolmuş ve taksi bilgilerini yolculuk gününde DHMİ’nin resmi sayfasından doğrulayın."],
        ["ri-time-line", "Geç varış", "Uçuşunuz geç saatteyse tahmini varış saatinizi önceden WhatsApp üzerinden otele bildirin; geç check-in koşullarını rezervasyonunuz için doğrulayın."],
        ["ri-parking-box-line", "Araçla geliş", "Otel misafirleri için ücretsiz yerinde otopark bulunur. Girişe ait güncel rotayı yola çıkmadan önce haritada açın."],
      ],
      sourceLabel: "DHMİ’nin güncel ulaşım bilgileri", faqTitle: "Havalimanı konaklaması hakkında", faqs: [["Otel havalimanı transferi sağlıyor mu?", "Web sitesinde garantili bir otel transferi taahhüt etmiyoruz. DHMİ’nin yayımladığı ulaşım seçeneklerini kontrol edin veya uygun bir seçenek hakkında resepsiyona danışın."], ["Geç varışta ne yapmalıyım?", "Rezervasyonunuzu tamamladıktan sonra uçuş ve tahmini varış saatinizi otele bildirin; kendi rezervasyonunuz için geç giriş koşullarını yazılı olarak doğrulayın."]],
    },
    en: {
      title: "Hotel Near Trabzon Airport | Pelit Park Hotel", description: "Plan an airport-focused stay at Pelit Park Hotel with current transport options, a live route, late-arrival guidance, on-site parking and direct booking.",
      eyebrow: "Arriving in Trabzon", h1: "Hotel Near Trabzon Airport", lead: "For a calm stay before or after a flight, check the live route between Pelit Park Hotel and Trabzon Airport, share your expected arrival time and compare current room options.",
      introTitle: "Plan your airport journey with current information", intro: "This page does not promise a hotel-operated transfer. DHMİ lists HAVAŞ, municipal buses, minibuses, commercial taxis, rental cars and private cars among the airport transport options. Timetables and routes can change, so check the official source and live map on your travel day.", imageAlt: "Lobby and reception area at Pelit Park Hotel in Trabzon",
      cards: [["ri-bus-line", "Current transport options", "Verify HAVAŞ, bus, minibus and taxi information on the official DHMİ page on the day you travel."], ["ri-time-line", "Late arrival planning", "If your flight arrives late, send your estimated arrival time on WhatsApp and confirm the late check-in conditions for your reservation."], ["ri-parking-box-line", "Arriving by car", "Complimentary on-site parking is available for hotel guests. Open the current route to the entrance before setting out."]],
      sourceLabel: "Current DHMİ transport information", faqTitle: "Airport-stay questions", faqs: [["Does the hotel provide an airport transfer?", "This website does not promise a hotel-operated transfer. Check the transport choices published by DHMİ or ask reception about a suitable option."], ["What should I do if I arrive late?", "After booking, share your flight and estimated arrival time with the hotel and confirm the late check-in conditions for your reservation in writing."]],
    },
    ar: {
      title: "فندق قريب من مطار طرابزون | Pelit Park Hotel", description: "خطط لإقامة مرتبطة بمطار طرابزون مع مسار مباشر وخيارات نقل حالية وإرشادات الوصول المتأخر وموقف مجاني وحجز واضح في Pelit Park Hotel.",
      eyebrow: "الوصول إلى طرابزون", h1: "فندق قريب من مطار طرابزون", lead: "لإقامة هادئة قبل الرحلة أو بعدها، افتح المسار الحالي بين Pelit Park Hotel ومطار طرابزون، وأرسل موعد وصولك المتوقع، وقارن الغرف المتاحة الآن.",
      introTitle: "خطط للوصول اعتمادًا على معلومات محدثة", intro: "لا تعد هذه الصفحة بخدمة نقل يشغّلها الفندق. تذكر هيئة المطارات التركية DHMİ خيارات تشمل HAVAŞ والحافلات البلدية والدولموش وسيارات الأجرة وتأجير السيارات والسيارة الخاصة. قد تتغير المواعيد والمسارات، لذلك راجع المصدر الرسمي والخريطة يوم السفر.", imageAlt: "منطقة الاستقبال والردهة في Pelit Park Hotel بطرابزون",
      cards: [["ri-bus-line", "خيارات النقل الحالية", "تحقق من معلومات HAVAŞ والحافلات والدولموش وسيارات الأجرة في صفحة DHMİ الرسمية يوم سفرك."], ["ri-time-line", "الوصول المتأخر", "إذا كانت رحلتك متأخرة، أرسل وقت الوصول المتوقع عبر واتساب وثبّت شروط الدخول المتأخر الخاصة بحجزك."], ["ri-parking-box-line", "الوصول بالسيارة", "يتوفر موقف سيارات مجاني داخل الموقع لنزلاء الفندق. افتح المسار الحالي إلى المدخل قبل الانطلاق."]],
      sourceLabel: "معلومات النقل الحالية من DHMİ", faqTitle: "أسئلة الإقامة المرتبطة بالمطار", faqs: [["هل يوفر الفندق خدمة نقل من المطار؟", "لا يقدم الموقع وعدًا بخدمة نقل يشغّلها الفندق. راجع الخيارات المنشورة لدى DHMİ أو اسأل الاستقبال عن الخيار المناسب."], ["ماذا أفعل عند الوصول المتأخر؟", "بعد الحجز أرسل بيانات الرحلة وموعد الوصول المتوقع، وثبّت كتابيًا شروط الدخول المتأخر الخاصة بحجزك."]],
    },
    ka: {
      title: "სასტუმრო ტრაბზონის აეროპორტთან ახლოს | Pelit Park Hotel", description: "დაგეგმეთ აეროპორტთან დაკავშირებული განთავსება Pelit Park Hotel-ში: მიმდინარე ტრანსპორტი, ცოცხალი მარშრუტი, გვიანი ჩამოსვლა, პარკინგი და დაჯავშნა.",
      eyebrow: "ტრაბზონში ჩამოსვლა", h1: "სასტუმრო ტრაბზონის აეროპორტთან ახლოს", lead: "ფრენამდე ან ფრენის შემდეგ მშვიდი განთავსებისთვის გახსენით Pelit Park Hotel-სა და ტრაბზონის აეროპორტს შორის მიმდინარე მარშრუტი, შეგვატყობინეთ ჩამოსვლის სავარაუდო დრო და შეადარეთ ოთახები.",
      introTitle: "დაგეგმეთ აეროპორტიდან გზა განახლებული ინფორმაციით", intro: "ეს გვერდი სასტუმროს მიერ შესრულებულ ტრანსფერს არ გპირდებათ. DHMİ აეროპორტის ტრანსპორტის ვარიანტებად ასახელებს HAVAŞ-ს, მუნიციპალურ ავტობუსს, დოლმუშს, ტაქსის, ავტომობილის დაქირავებასა და პირად მანქანას. განრიგი შეიძლება შეიცვალოს, ამიტომ მგზავრობის დღეს ოფიციალური წყარო და ცოცხალი რუკა შეამოწმეთ.", imageAlt: "Pelit Park Hotel-ის ლობი და მიმღები ტრაბზონში",
      cards: [["ri-bus-line", "მიმდინარე ტრანსპორტი", "HAVAŞ-ის, ავტობუსის, დოლმუშისა და ტაქსის ინფორმაცია მგზავრობის დღეს DHMİ-ის ოფიციალურ გვერდზე გადაამოწმეთ."], ["ri-time-line", "გვიანი ჩამოსვლა", "თუ ფრენა გვიან ჩამოდის, WhatsApp-ზე გამოგვიგზავნეთ სავარაუდო დრო და თქვენი ჯავშნისთვის გვიანი შესვლის პირობები წინასწარ დაადასტურეთ."], ["ri-parking-box-line", "მანქანით ჩამოსვლა", "სასტუმროს სტუმრებისთვის ადგილზე უფასო პარკინგია. გამგზავრებამდე გახსენით სასტუმროს შესასვლელამდე მიმდინარე მარშრუტი."]],
      sourceLabel: "DHMİ-ის მიმდინარე სატრანსპორტო ინფორმაცია", faqTitle: "კითხვები აეროპორტთან განთავსებაზე", faqs: [["აქვს სასტუმროს აეროპორტის ტრანსფერი?", "ვებსაიტი სასტუმროს მიერ შესრულებულ ტრანსფერს არ გპირდებათ. შეამოწმეთ DHMİ-ის ტრანსპორტის ვარიანტები ან ჰკითხეთ მიმღებს შესაბამისი არჩევანის შესახებ."], ["რა გავაკეთო გვიანი ჩამოსვლისას?", "დაჯავშნის შემდეგ მოგვწერეთ ფრენისა და სავარაუდო ჩამოსვლის დრო და წერილობით დაადასტურეთ თქვენი გვიანი შესვლის პირობები."]],
    },
  },
  forum: {
    destination: "Forum Trabzon",
    image: "/assets/about.webp",
    official: "https://www.forumtrabzon.com/",
    tr: {
      title: "Forum Trabzon Yakın Otel | Pelit Park Hotel", description: "Forum Trabzon alışveriş planınız için Pelit Park Hotel’in konumunu, canlı rotayı, ücretsiz otoparkı, dönüş planını ve güncel rezervasyon seçeneklerini inceleyin.",
      eyebrow: "Trabzon’da alışveriş", h1: "Forum Trabzon Yakın Otel", lead: "Forum Trabzon’u ziyaret edecekseniz, Pelit Park Hotel’den canlı rotayı açabilir, araçla geliş için otopark bilgisini görebilir ve alışveriş sonrası konaklamanızı planlayabilirsiniz.",
      introTitle: "Alışveriş gününü sabit süre iddiası olmadan planlayın", intro: "Forum Trabzon’a yolculuk süresi günün trafiğine göre değişir. Yola çıkmadan önce canlı rotayı kontrol edin; mağaza, etkinlik ve çalışma saati gibi değişebilen bilgiler için alışveriş merkezinin resmi sayfasını kullanın.", imageAlt: "Pelit Park Hotel’de temiz ve rahat bir oda",
      cards: [["ri-route-line", "Canlı rota", "Otel ile Forum Trabzon arasındaki güncel yönlendirmeyi ve trafiği haritada kontrol edin."], ["ri-parking-box-line", "Otel otoparkı", "Otel misafirleri için ücretsiz yerinde otopark, araçla yapılan alışveriş gezilerinde pratik bir başlangıç noktası sağlar."], ["ri-store-2-line", "Güncel mağaza bilgisi", "Çalışma saatleri, markalar ve etkinlikler değişebilir; ziyaret günü Forum Trabzon’un resmi sitesini kontrol edin."]],
      sourceLabel: "Forum Trabzon resmi sitesi", faqTitle: "Forum Trabzon ziyareti hakkında", faqs: [["Forum Trabzon’a nasıl giderim?", "Otel ile Forum Trabzon arasındaki güncel yönlendirme ve trafik için bu sayfadaki canlı rota bağlantısını kullanın."], ["Otelde otopark var mı?", "Otel misafirleri için ücretsiz yerinde otopark bulunur. Müsaitlik veya özel araç ihtiyacınız varsa varıştan önce resepsiyona yazın."]],
    },
    en: {
      title: "Hotel Near Forum Trabzon | Pelit Park Hotel", description: "Plan a Forum Trabzon shopping stay with a live route, complimentary on-site parking, practical return planning and current room availability at Pelit Park Hotel.",
      eyebrow: "Shopping in Trabzon", h1: "Hotel Near Forum Trabzon", lead: "If Forum Trabzon is part of your trip, open the live route from Pelit Park Hotel, review the parking information and plan a comfortable return after shopping.",
      introTitle: "Plan your shopping day without a fixed travel-time claim", intro: "Travel time to Forum Trabzon changes with city traffic. Check the live route before leaving, and use the shopping centre’s official website for changing store, event and opening information.", imageAlt: "Clean and comfortable room at Pelit Park Hotel in Trabzon",
      cards: [["ri-route-line", "Live route", "Check current directions and traffic between the hotel and Forum Trabzon on the map."], ["ri-parking-box-line", "Hotel parking", "Complimentary on-site parking for hotel guests is practical when your shopping plan begins or ends by car."], ["ri-store-2-line", "Current centre information", "Opening hours, shops and events may change; check Forum Trabzon’s official website on the day you visit."]],
      sourceLabel: "Official Forum Trabzon website", faqTitle: "Forum Trabzon stay questions", faqs: [["How do I get to Forum Trabzon?", "Use the live route link on this page for current directions and traffic between Pelit Park Hotel and Forum Trabzon."], ["Is parking available at the hotel?", "Complimentary on-site parking is available for hotel guests. Message reception before arrival if you have a specific vehicle requirement."]],
    },
    ar: {
      title: "فندق قريب من Forum Trabzon | Pelit Park Hotel", description: "خطط لإقامة تسوق قرب Forum Trabzon مع مسار مباشر وموقف مجاني في الفندق وعودة عملية بعد التسوق وغرف متاحة للحجز في Pelit Park Hotel.",
      eyebrow: "التسوق في طرابزون", h1: "فندق قريب من Forum Trabzon", lead: "إذا كان Forum Trabzon ضمن برنامجك، افتح المسار الحالي من Pelit Park Hotel، وراجع معلومات الموقف، وخطط لعودة مريحة بعد التسوق.",
      introTitle: "خطط ليوم التسوق دون وعود بوقت ثابت", intro: "يتغير وقت الطريق إلى Forum Trabzon حسب حركة المدينة. راجع المسار المباشر قبل الخروج، واستخدم الموقع الرسمي للمركز للمعلومات المتغيرة مثل المتاجر والفعاليات وساعات العمل.", imageAlt: "غرفة نظيفة ومريحة في Pelit Park Hotel بطرابزون",
      cards: [["ri-route-line", "المسار الحالي", "تحقق من الاتجاهات وحركة المرور بين الفندق وForum Trabzon على الخريطة."], ["ri-parking-box-line", "موقف الفندق", "يتوفر موقف سيارات مجاني داخل الموقع لنزلاء الفندق، وهو عملي عند بدء أو إنهاء رحلة التسوق بالسيارة."], ["ri-store-2-line", "معلومات المركز الحالية", "قد تتغير ساعات العمل والمتاجر والفعاليات؛ راجع موقع Forum Trabzon الرسمي في يوم الزيارة."]],
      sourceLabel: "الموقع الرسمي لـForum Trabzon", faqTitle: "أسئلة الإقامة لزيارة Forum Trabzon", faqs: [["كيف أصل إلى Forum Trabzon؟", "استخدم رابط المسار المباشر في هذه الصفحة لمعرفة الاتجاهات وحركة المرور الحالية بين الفندق وForum Trabzon."], ["هل يوجد موقف سيارات في الفندق؟", "يتوفر موقف مجاني داخل الموقع لنزلاء الفندق. تواصل مع الاستقبال قبل الوصول إذا كانت لديك متطلبات خاصة بالسيارة."]],
    },
    ka: {
      title: "სასტუმრო Forum Trabzon-თან ახლოს | Pelit Park Hotel", description: "დაგეგმეთ Forum Trabzon-ში შოპინგი: ცოცხალი მარშრუტი, სასტუმროს უფასო პარკინგი, დაბრუნების პრაქტიკული გეგმა და მიმდინარე ოთახები Pelit Park Hotel-ში.",
      eyebrow: "შოპინგი ტრაბზონში", h1: "სასტუმრო Forum Trabzon-თან ახლოს", lead: "თუ Forum Trabzon თქვენს გეგმაშია, გახსენით ცოცხალი მარშრუტი Pelit Park Hotel-იდან, გაეცანით პარკინგის ინფორმაციას და შოპინგის შემდეგ მშვიდად დაბრუნდით სასტუმროში.",
      introTitle: "დაგეგმეთ შოპინგის დღე ფიქსირებული დროის დაპირების გარეშე", intro: "Forum Trabzon-მდე მგზავრობის დრო ქალაქის მოძრაობაზეა დამოკიდებული. გასვლამდე შეამოწმეთ ცოცხალი მარშრუტი, ხოლო მაღაზიების, ღონისძიებებისა და სამუშაო საათების განახლებული ინფორმაცია სავაჭრო ცენტრის ოფიციალურ გვერდზე ნახეთ.", imageAlt: "სუფთა და კომფორტული ოთახი Pelit Park Hotel-ში ტრაბზონში",
      cards: [["ri-route-line", "ცოცხალი მარშრუტი", "რუკაზე შეამოწმეთ სასტუმროსა და Forum Trabzon-ს შორის მიმდინარე მიმართულება და მოძრაობა."], ["ri-parking-box-line", "სასტუმროს პარკინგი", "სასტუმროს სტუმრებისთვის ადგილზე უფასო პარკინგია, რაც მანქანით შოპინგის დაგეგმვას ამარტივებს."], ["ri-store-2-line", "ცენტრის განახლებული ინფორმაცია", "სამუშაო საათები, მაღაზიები და ღონისძიებები შეიძლება შეიცვალოს; ვიზიტის დღეს ოფიციალური გვერდი შეამოწმეთ."]],
      sourceLabel: "Forum Trabzon-ის ოფიციალური გვერდი", faqTitle: "კითხვები Forum Trabzon-ში ვიზიტზე", faqs: [["როგორ მივიდე Forum Trabzon-მდე?", "სასტუმროსა და Forum Trabzon-ს შორის მიმდინარე მიმართულებისა და მოძრაობისთვის გამოიყენეთ ამ გვერდზე მოცემული ცოცხალი მარშრუტი."], ["სასტუმროში პარკინგია?", "სასტუმროს სტუმრებისთვის ადგილზე უფასო პარკინგია. განსაკუთრებული სატრანსპორტო მოთხოვნის შემთხვევაში წინასწარ მოგვწერეთ."]],
    },
  },
  farabi: {
    destination: "KTU Farabi Hospital",
    image: "/assets/room-2.webp",
    official: "https://www.ktu.edu.tr/farabi/iletisim",
    tr: {
      title: "Farabi Hastanesi Yakın Otel | Pelit Park Hotel", description: "KTÜ Farabi Hastanesi ziyareti için Pelit Park Hotel’de sakin konaklama, iki ayrı yatak seçeneği, canlı rota, otopark ve güncel rezervasyon bilgilerini inceleyin.",
      eyebrow: "Hasta yakını ve refakatçi konaklaması", h1: "Farabi Hastanesi Yakın Otel", lead: "KTÜ Farabi Hastanesi ziyareti sırasında sakin bir konaklama planı için canlı rotayı açın, iki ayrı yataklı oda seçeneğini sorun ve güncel fiyatı rezervasyon sisteminde kontrol edin.",
      introTitle: "Hastane ziyaretine uygun, açık ve ölçülü konaklama bilgisi", intro: "Pelit Park Hotel ile KTÜ Farabi Hastanesi arasında bir ortaklık yoktur ve bu sayfa tıbbi tavsiye vermez. Randevu, ziyaretçi kuralı ve hastane ulaşımı gibi değişebilen bilgileri resmi Farabi Hastanesi kaynağından doğrulayın.", imageAlt: "Pelit Park Hotel’de iki ayrı yataklı Twin oda",
      cards: [["ri-hotel-bed-line", "Oda düzeni", "Refakatçi veya birlikte seyahat eden iki misafir için Twin odada iki ayrı yatak bulunur. Manzara ve balkon seçilen odaya göre değişebilir."], ["ri-route-line", "Hastaneye güncel rota", "Trafik ve giriş noktaları değişebileceği için çıkmadan önce canlı rotayı açın."], ["ri-file-list-3-line", "Resmi ziyaret bilgisi", "Randevu, ziyaretçi ve ulaşım bilgilerini KTÜ Farabi Hastanesi’nin resmi sayfasından kontrol edin."]],
      sourceLabel: "KTÜ Farabi Hastanesi resmi iletişim ve ulaşım bilgileri", faqTitle: "Farabi Hastanesi ziyareti hakkında", faqs: [["Otelin Farabi Hastanesi ile anlaşması var mı?", "Hayır. Pelit Park Hotel bağımsız bir konaklama işletmesidir; hastane ile ortaklık veya tıbbi hizmet iddiasında bulunmaz."], ["Refakatçi için iki ayrı yatak seçebilir miyim?", "Twin odalarda iki ayrı yatak bulunur. Belirli oda, manzara ve balkon talebini rezervasyondan önce yazılı olarak doğrulayın."]],
    },
    en: {
      title: "Hotel Near Farabi Hospital Trabzon | Pelit Park Hotel", description: "Plan a calm stay for a KTÜ Farabi Hospital visit with twin-bed options, a live route, on-site parking and current booking information at Pelit Park Hotel.",
      eyebrow: "Visitor and companion stays", h1: "Hotel Near Farabi Hospital Trabzon", lead: "For a calm base during a KTÜ Farabi Hospital visit, open the live route, ask about a room with two separate beds and check the current rate in the booking engine.",
      introTitle: "Clear accommodation information for a hospital visit", intro: "Pelit Park Hotel is not affiliated with KTÜ Farabi Hospital, and this page does not provide medical advice. Confirm changing appointment, visitor and hospital-access information with Farabi Hospital’s official source.", imageAlt: "Twin room with two separate beds at Pelit Park Hotel",
      cards: [["ri-hotel-bed-line", "Room arrangement", "A Twin room provides two separate beds for companions or guests travelling together. View and balcony vary by the selected room."], ["ri-route-line", "Current hospital route", "Traffic and entrance arrangements can change, so open the live route before leaving."], ["ri-file-list-3-line", "Official visitor information", "Check appointment, visitor and access details on KTÜ Farabi Hospital’s official website."]],
      sourceLabel: "Official KTÜ Farabi Hospital contact and access information", faqTitle: "Farabi Hospital stay questions", faqs: [["Is the hotel affiliated with Farabi Hospital?", "No. Pelit Park Hotel is an independent accommodation business and does not claim a partnership with the hospital or provide medical services."], ["Can I choose two separate beds for a companion stay?", "Twin rooms have two separate beds. Confirm the specific room, view and balcony request in writing before booking."]],
    },
    ar: {
      title: "فندق قريب من مستشفى فارابي طرابزون | Pelit Park Hotel", description: "خطط لإقامة هادئة لزيارة مستشفى KTÜ فارابي مع خيار سريرين منفصلين ومسار مباشر وموقف مجاني ومعلومات حجز حالية في Pelit Park Hotel.",
      eyebrow: "إقامة الزائر والمرافق", h1: "فندق قريب من مستشفى فارابي في طرابزون", lead: "لإقامة هادئة أثناء زيارة مستشفى KTÜ فارابي، افتح المسار الحالي، واسأل عن غرفة بسريرين منفصلين، وتحقق من السعر الحالي في نظام الحجز.",
      introTitle: "معلومات إقامة واضحة ومعتدلة لزيارة المستشفى", intro: "لا توجد شراكة بين Pelit Park Hotel ومستشفى KTÜ فارابي، ولا تقدم هذه الصفحة نصيحة طبية. تحقق من معلومات المواعيد والزيارة والوصول المتغيرة في المصدر الرسمي للمستشفى.", imageAlt: "غرفة Twin بسريرين منفصلين في Pelit Park Hotel",
      cards: [["ri-hotel-bed-line", "ترتيب الغرفة", "توفر غرفة Twin سريرين منفصلين للمرافقين أو المسافرين معًا. تختلف الإطلالة والبلكون حسب الغرفة المختارة."], ["ri-route-line", "المسار الحالي للمستشفى", "قد تتغير حركة المرور ونقاط الدخول، لذلك افتح المسار المباشر قبل الخروج."], ["ri-file-list-3-line", "معلومات الزيارة الرسمية", "راجع تفاصيل المواعيد والزيارة والوصول في الموقع الرسمي لمستشفى KTÜ فارابي."]],
      sourceLabel: "معلومات الاتصال والوصول الرسمية لمستشفى KTÜ فارابي", faqTitle: "أسئلة الإقامة لزيارة مستشفى فارابي", faqs: [["هل توجد شراكة بين الفندق ومستشفى فارابي؟", "لا. Pelit Park Hotel منشأة إقامة مستقلة ولا يدعي شراكة مع المستشفى أو تقديم خدمات طبية."], ["هل أستطيع اختيار سريرين منفصلين لإقامة المرافق؟", "تضم غرف Twin سريرين منفصلين. ثبّت كتابيًا الغرفة المحددة والإطلالة والبلكون المطلوب قبل الحجز."]],
    },
    ka: {
      title: "სასტუმრო ფარაბის საავადმყოფოსთან ახლოს | Pelit Park Hotel", description: "დაგეგმეთ მშვიდი განთავსება KTÜ Farabi Hospital-ში ვიზიტისთვის: Twin ოთახი, ცოცხალი მარშრუტი, პარკინგი და მიმდინარე დაჯავშნა Pelit Park Hotel-ში.",
      eyebrow: "სტუმრისა და თანმხლების განთავსება", h1: "სასტუმრო ფარაბის საავადმყოფოსთან ახლოს", lead: "KTÜ Farabi Hospital-ში ვიზიტისას მშვიდი განთავსებისთვის გახსენით მიმდინარე მარშრუტი, იკითხეთ ორი ცალკე საწოლის მქონე ოთახი და შეამოწმეთ მიმდინარე ფასი.",
      introTitle: "მკაფიო ინფორმაცია საავადმყოფოში ვიზიტისას განთავსებაზე", intro: "Pelit Park Hotel არ არის დაკავშირებული KTÜ Farabi Hospital-თან და ეს გვერდი სამედიცინო რჩევას არ იძლევა. ვიზიტის, დანიშვნისა და საავადმყოფოში მისვლის განახლებული ინფორმაცია ოფიციალურ წყაროში გადაამოწმეთ.", imageAlt: "Twin ოთახი ორი ცალკე საწოლით Pelit Park Hotel-ში",
      cards: [["ri-hotel-bed-line", "ოთახის მოწყობა", "Twin ოთახში ორი ცალკე საწოლია თანმხლებისთვის ან ერთად მოგზაური სტუმრებისთვის. ხედი და აივანი არჩეული ოთახის მიხედვით იცვლება."], ["ri-route-line", "საავადმყოფომდე მიმდინარე გზა", "მოძრაობა და შესასვლელები შეიძლება შეიცვალოს, ამიტომ გასვლამდე ცოცხალი მარშრუტი გახსენით."], ["ri-file-list-3-line", "ოფიციალური ინფორმაცია", "დანიშვნის, ვიზიტისა და მისვლის დეტალები KTÜ Farabi Hospital-ის ოფიციალურ გვერდზე შეამოწმეთ."]],
      sourceLabel: "KTÜ Farabi Hospital-ის ოფიციალური საკონტაქტო და მისვლის ინფორმაცია", faqTitle: "კითხვები ფარაბის საავადმყოფოში ვიზიტზე", faqs: [["აქვს სასტუმროს თანამშრომლობა ფარაბის საავადმყოფოსთან?", "არა. Pelit Park Hotel დამოუკიდებელი განთავსების ობიექტია და საავადმყოფოსთან პარტნიორობას ან სამედიცინო მომსახურებას არ აცხადებს."], ["შეიძლება თანმხლებისთვის ორი ცალკე საწოლი ავირჩიო?", "Twin ოთახებში ორი ცალკე საწოლია. კონკრეტული ოთახი, ხედი და აივანი დაჯავშნამდე წერილობით გადაამოწმეთ."]],
    },
  },
};

function esc(value) {
  return String(value).replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}

function routeUrl(destination) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent("Pelit Park Hotel, Trabzon")}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}

function alternateMarkup(topic) {
  const order = ["tr", "en", "ar", "ka"];
  const items = order.map((lang) => `    <link rel="alternate" hreflang="${languageMeta[lang].hreflang}" href="${BASE}${slugs[topic][lang]}" />`);
  items.push(`    <link rel="alternate" hreflang="x-default" href="${BASE}${slugs[topic].tr}" />`);
  return items.join("\n");
}

function languageSwitcher(topic, currentLang) {
  return ["ar", "en", "ka", "tr"].map((lang) => {
    const meta = languageMeta[lang];
    const current = lang === currentLang ? ' aria-current="page"' : "";
    return `<a href="${slugs[topic][lang]}" aria-label="${esc(meta.name)}"${current}>${meta.code}</a>`;
  }).join("");
}

function localLinks(lang) {
  const labels = ui[lang];
  return ["airport", "forum", "farabi"].map((topic) => `<a href="${slugs[topic][lang]}">${esc(labels[topic])}</a>`).join("");
}

function pageHtml(topic, lang) {
  const meta = languageMeta[lang];
  const labels = ui[lang];
  const page = content[topic];
  const copy = page[lang];
  const pathname = slugs[topic][lang];
  const canonical = `${BASE}${pathname}`;
  const route = routeUrl(page.destination);
  const hotelSchema = {
    "@type": "Hotel", "@id": `${BASE}/#hotel`, name: facts.identity.name, url: `${BASE}/`,
    image: `${BASE}/assets/room-1.webp`, telephone: facts.identity.telephone, email: facts.identity.email,
    address: { "@type": "PostalAddress", ...facts.identity.address },
    amenityFeature: [{ "@type": "LocationFeatureSpecification", name: lang === "ar" ? "موقف سيارات مجاني" : lang === "ka" ? "უფასო პარკინგი" : lang === "tr" ? "Ücretsiz otopark" : "Complimentary parking", value: true }],
    hasMap: HOTEL_MAP,
  };
  const schema = { "@context": "https://schema.org", "@graph": [hotelSchema, { "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: copy.title, description: copy.description, inLanguage: meta.hreflang, about: { "@id": `${BASE}/#hotel` } }, { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: labels.home, item: `${BASE}${meta.home}` }, { "@type": "ListItem", position: 2, name: copy.h1, item: canonical }] }] };
  const rtlCss = lang === "ar" ? '    <link rel="stylesheet" href="/assets/css/rtl.css" />\n' : "";
  const cards = copy.cards.map(([icon, title, text], index) => `<article class="georgian-info-card"><i class="${icon}" aria-hidden="true"></i><h3>${esc(title)}</h3><p>${esc(text)}</p>${index === 2 ? `<a href="${esc(page.official)}" target="_blank" rel="noopener noreferrer">${esc(copy.sourceLabel)}</a>` : ""}</article>`).join("\n");
  const faqs = copy.faqs.map(([question, answer]) => `<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join("\n");
  const related = ["airport", "forum", "farabi"].filter((item) => item !== topic).map((item) => `<a href="${slugs[item][lang]}">${esc(labels[item])}</a>`).join("") + `<a href="${meta.home}${meta.home === "/" ? "room-types/" : "room-types/"}">${esc(labels.rooms)}</a>`;

  return `<!DOCTYPE html>
<html lang="${meta.htmlLang}" dir="${meta.dir}">
  <head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18172085628"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","AW-18172085628");</script>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${esc(copy.description)}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${canonical}" />
${alternateMarkup(topic)}
    <meta property="og:title" content="${esc(copy.title)}" />
    <meta property="og:description" content="${esc(copy.description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Pelit Park Hotel" />
    <meta property="og:image" content="${BASE}${page.image}" />
    <meta property="og:image:alt" content="${esc(copy.imageAlt)}" />
    <meta property="og:locale" content="${meta.locale}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(copy.title)}" />
    <meta name="twitter:description" content="${esc(copy.description)}" />
    <meta name="twitter:image" content="${BASE}${page.image}" />
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css" rel="stylesheet" />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="stylesheet" href="/assets/css/georgian-landing.css${lang === "ka" ? "?v=ka-breadcrumbs-20260911" : ""}" />
${rtlCss}    <title>${esc(copy.title)}</title>
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
    <link rel="manifest" href="/assets/site.webmanifest" />
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
  </head>
  <body class="georgian-page georgian-content-page">
    <header class="subpage__header roomtypes__header georgian-hero georgian-subpage-hero">
      <nav><div class="nav__bar"><div class="logo"><a href="${meta.home}"><img src="/assets/logo.png" alt="Pelit Park Hotel" width="637" height="392" /></a></div><ul class="nav__links" id="nav-links"><li><a href="${meta.home}">${esc(labels.home)}</a></li><li><a href="${slugs.airport[lang]}">${esc(labels.airport)}</a></li><li><a href="${slugs.forum[lang]}">${esc(labels.forum)}</a></li><li><a href="${slugs.farabi[lang]}">${esc(labels.farabi)}</a></li><li><a href="${meta.home}room-types/">${esc(labels.rooms)}</a></li></ul><div class="language-switcher" aria-label="${esc(labels.nav)}">${languageSwitcher(topic, lang)}</div><div class="nav__menu__btn" id="menu-btn"><i class="ri-menu-line"></i></div></div></nav>
${lang === "ka" ? "" : `      <nav class="georgian-breadcrumb" aria-label="${esc(labels.breadcrumb)}"><ol><li><a href="${meta.home}">${esc(labels.home)}</a></li><li aria-current="page">${esc(copy.h1)}</li></ol></nav>
`}      <div class="section__container georgian-hero__content"><p class="section__subheader">${esc(copy.eyebrow)}</p><h1 class="section__header">${esc(copy.h1)}</h1><p class="section__description">${esc(copy.lead)}</p><div class="georgian-hero__actions"><a class="btn georgian-hero__button" href="${BOOKING}" target="_blank" rel="noopener noreferrer" data-booking-event="booking_click"><i class="ri-calendar-check-line" aria-hidden="true"></i>${esc(labels.book)}</a><a class="btn georgian-hero__button georgian-hero__button--secondary" href="${route}" target="_blank" rel="noopener noreferrer" data-booking-event="directions_click"><i class="ri-route-line" aria-hidden="true"></i>${esc(labels.route)}</a></div></div>
    </header>
    <main>
      <section class="section__container georgian-article-intro"><div><p class="section__subheader">${esc(copy.eyebrow)}</p><h2 class="section__header">${esc(copy.introTitle)}</h2><p class="section__description">${esc(copy.intro)}</p></div><img src="${page.image}" alt="${esc(copy.imageAlt)}" width="1600" height="${page.image.endsWith('/lobi.webp') ? '1142' : '1160'}" loading="lazy" decoding="async" /></section>
      <section class="georgian-info-section"><div class="section__container"><h2 class="section__header">${esc(copy.introTitle)}</h2><div class="georgian-info-grid">${cards}</div></div></section>
      <section class="section__container georgian-map-section"><div><p class="section__subheader">${esc(labels.route)}</p><h2 class="section__header">${esc(copy.h1)}</h2><p class="section__description">${esc(copy.lead)}</p><div class="georgian-section__actions"><a class="btn" href="${route}" target="_blank" rel="noopener noreferrer"><i class="ri-navigation-line" aria-hidden="true"></i> ${esc(labels.route)}</a><a class="georgian-text-link" href="${meta.home}room-types/">${esc(labels.rooms)}</a></div></div><iframe title="${esc(copy.h1)}" src="https://www.google.com/maps?q=${encodeURIComponent("Pelit Park Hotel, Trabzon")}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></section>
      <section class="section__container georgian-faq"><h2 class="section__header">${esc(copy.faqTitle)}</h2><div class="georgian-faq__list">${faqs}</div></section>
      <section class="georgian-related" aria-labelledby="related-title"><div class="section__container"><h2 id="related-title">${esc(labels.useful)}</h2><div class="georgian-related__links">${related}</div></div></section>
      <section class="georgian-final-cta"><h2 class="section__header">${esc(labels.currentPrice)}</h2><p class="section__description">${esc(labels.ctaText)}</p><div class="georgian-section__actions"><a class="btn" href="${BOOKING}" target="_blank" rel="noopener noreferrer" data-booking-event="booking_click">${esc(labels.book)}</a><a class="btn georgian-btn--dark" href="${WHATSAPP}" target="_blank" rel="noopener noreferrer" data-booking-event="whatsapp_click">WhatsApp</a></div></section>
    </main>
    <footer class="footer" id="contact"><div class="section__container footer__container"><div class="footer__col"><div class="logo"><a href="${meta.home}">${esc(facts.identity.name)}</a></div><p class="section__description">${esc(labels.footer)}</p><a class="btn" href="${BOOKING}" target="_blank" rel="noopener noreferrer" data-booking-event="booking_click">${esc(labels.book)}</a></div><div class="footer__col"><h4>${esc(labels.useful)}</h4><div class="footer__links">${localLinks(lang)}<a href="${meta.home}room-types/">${esc(labels.rooms)}</a></div></div><div class="footer__col"><h4>${esc(labels.contact)}</h4><ul class="footer__links"><li><a href="mailto:${esc(facts.identity.email)}">${esc(facts.identity.email)}</a></li><li class="footer__phone"><a href="tel:${esc(facts.identity.telephone.replace(/\s/g, ''))}">${esc(facts.identity.telephone)}</a></li><li>${esc(`${facts.identity.address.streetAddress} ${facts.identity.address.addressLocality} / ${facts.identity.address.addressRegion}`)}</li></ul><div class="footer__socials"><a href="${WHATSAPP}" target="_blank" rel="noopener noreferrer"><img src="/assets/whatsapp.webp" alt="WhatsApp" width="2048" height="2048" loading="lazy" /></a><a href="${facts.identity.instagramUrl}" target="_blank" rel="noopener noreferrer"><img src="/assets/instagram.webp" alt="Instagram" width="64" height="64" loading="lazy" /></a><a href="${HOTEL_MAP}" target="_blank" rel="noopener noreferrer"><img src="/assets/maps.webp" alt="Google Maps" width="1100" height="1100" loading="lazy" /></a></div></div></div><div class="footer__bar">© 2026 ${esc(facts.identity.name)}</div></footer>
    <div class="georgian-mobile-bar" role="navigation" aria-label="${esc(labels.quick)}"><a class="georgian-mobile-bar__button georgian-mobile-bar__button--primary" href="${WHATSAPP}" target="_blank" rel="noopener noreferrer" data-booking-event="whatsapp_click"><i class="ri-whatsapp-line" aria-hidden="true"></i>WhatsApp</a><a class="georgian-mobile-bar__button" href="${BOOKING}" target="_blank" rel="noopener noreferrer" data-booking-event="booking_click"><i class="ri-calendar-check-line" aria-hidden="true"></i>${esc(labels.book)}</a></div>
    <script src="/main.js"></script><script src="/language.js"></script><script src="/assets/js/booking-events.js"></script>
  </body>
</html>
`;
}

function outputPath(urlPath) {
  return path.join(ROOT, urlPath.replace(/^\//, ""), "index.html");
}

for (const topic of Object.keys(content)) {
  for (const lang of Object.keys(languageMeta)) {
    const target = outputPath(slugs[topic][lang]);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, pageHtml(topic, lang), "utf8");
    console.log(`Built ${path.relative(ROOT, target)}`);
  }
}
