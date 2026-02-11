# Kanban Board – TypeScript نقي

لوحة Kanban لإدارة المهام مكتوبة بـ **TypeScript نقي** بدون React أو Vite أو أي Bundler.

## المميزات

- TypeScript فقط → تحويل بـ `tsc` → JavaScript في المتصفح
- حفظ تلقائي في `localStorage`
- واجهة حديثة (Tailwind CSS)
- متجاوب مع الشاشات
- إضافة، تعديل، حذف، ونقل المهام بين الأعمدة (To Do / In Progress / Completed)

## التشغيل

### 1. تثبيت TypeScript

```bash
npm install -g typescript
```

أو محلياً:

```bash
npm install --save-dev typescript
```

### 2. تحويل TypeScript إلى JavaScript

```bash
tsc
```

يتم إنشاء `dist/app.js` من `src/app.ts`.

### 3. فتح المشروع

- افتح `index.html` في المتصفح، أو
- شغّل سيرفر محلي ثم افتح الصفحة:

```bash
npx http-server -p 8000
```

ثم: `http://localhost:8000`

أو مع Python:

```bash
python -m http.server 8000
```

## هيكل المشروع

```
kanban-ts-main/
├── index.html
├── src/
│   ├── app.ts
│   └── style.css
├── dist/
│   └── app.js
├── tsconfig.json
└── README.md
```

## إعدادات tsconfig.json

- `outDir: "./dist"` → مخرجات الـ JS في `dist`
- `rootDir: "./src"` → المصدر من `src`
- `target: "ES2020"` و `module: "ES2020"`

## طريقة العمل

1. تعديل الكود في `src/app.ts`
2. تشغيل: `tsc`
3. الصفحة تربط السكربت: `<script src="dist/app.js"></script>`

## الاستخدام

| الإجراء | الطريقة |
|--------|---------|
| إضافة مهمة | زر **+** في الهيدر |
| نقل المهمة | أزرار To Do / Start / Complete في البطاقة |
| تعديل | أيقونة القلم على البطاقة |
| حذف | أيقونة سلة المهملات على البطاقة |

## أوامر مفيدة

```bash
tsc              # تحويل مرة واحدة
tsc --watch      # تحويل تلقائي عند التعديل
```

## التبعيات

لا توجد تبعيات في وقت التشغيل؛ فقط TypeScript مطلوب للتحويل (`tsc`).

## 👨‍💻 Author

<div align="center">

### **Eng. Yasien Ahmed Elkelany**

💼 **Backend .NET Developer** | **Angular Frontend Developer**  
🏢 **General Authority for Investment**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/yasien-ahmed-b8ab41325)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:yasienahmed607@gmail.com)

[🔗 LinkedIn Profile](https://www.linkedin.com/in/yasien-ahmed-b8ab41325) | [📧 Email](mailto:yasienahmed607@gmail.com)

</div>

---

<div align="center">

**Made with ❤️ by Eng. Yasien Ahmed Elkelany**

⭐ Star this repo if you find it helpful!

</div>
