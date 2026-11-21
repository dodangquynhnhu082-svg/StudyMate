STUDYMATE - BAN TICH HOP GIA SU AI

CAU TRUC:
- public/index.html: file StudyMate_AmThanh_DungSai_ToanBo.html do ban chon, duoc sao chep nguyen ven.
- netlify/functions/chat.mjs: backend goi Gemini API.
- netlify.toml: cau hinh Netlify, publish public va deploy Netlify Function.

TRUOC KHI DEPLOY:
1. Mo dung site StudyMate hien tai tren Netlify.
2. Vao Project configuration > Environment variables.
3. Kiem tra GEMINI_API_KEY da co gia tri hop le va pham vi su dung co Functions. Neu chua co, tao bien GEMINI_API_KEY va dan API key lay tu Google AI Studio.
4. Neu can, co the khai bao them SUPABASE_URL va SUPABASE_ANON_KEY. Neu bo trong, backend su dung gia tri mac dinh khop voi Supabase dang duoc cau hinh trong HTML.
5. Sau khi thay doi Environment variables, can deploy lai de Function nhan gia tri moi.

DEPLOY AN TOAN:
- Nen deploy qua Git repository da ket noi voi Netlify hoac Netlify CLI de Netlify nhan ca thu muc netlify/functions.
- Neu site da ket noi Git: cap nhat cac file trong repo theo dung cau truc cua goi nay, sau do commit/push; Netlify se build va deploy.
- Neu chua ket noi Git: co the dung Netlify CLI trong thu muc du an, chay `netlify link` de chon dung site hien tai, sau do `netlify deploy --prod`.
- Khong chi upload rieng file HTML; nhu vay giao dien co the hien nhung chuc nang AI se khong co backend.

KIEM TRA SAU DEPLOY:
1. Mo website StudyMate va dang nhap.
2. Vao muc Gia su AI.
3. Gui mot cau hoi thu.
4. Neu loi, mo Netlify > Functions > chat > Logs de xem loi; khong gui API key cho nguoi khac.

LUU Y:
- API key Gemini chi dat trong Environment variables cua Netlify, tuyet doi khong dan vao HTML.
- Backend yeu cau dang nhap StudyMate bang Supabase truoc khi goi AI.
- Khong the xac minh tu may nay rang GEMINI_API_KEY da co trong tai khoan Netlify cua ban.
