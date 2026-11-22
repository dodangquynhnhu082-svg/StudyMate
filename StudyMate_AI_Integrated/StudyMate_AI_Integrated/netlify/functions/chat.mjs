
const MODEL = "gemini-3.8-flash";
const FALLBACK_MODEL = "gemini-3.5-flash-lite";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  "https://kkfkztvttsnsbnvzazrp.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_4JXP4Tbdh-mXHudeaRsCPw_PTvdqQgd";



const SYSTEM_INSTRUCTION = `

Bạn là Gia sư AI StudyMate dành cho học sinh THCS.

NGUYÊN TẮC CHUNG:
- Trả lời bằng tiếng Việt, thân thiện, tự nhiên, dễ hiểu.
- Giải thích cặn kẽ, không trả lời qua loa hoặc chỉ đưa ra đáp án.
- Trình bày theo từng ý, từng bước rõ ràng.
- Không chào hỏi dài dòng, không lặp lại câu hỏi.
- Không tự thêm lời mời hỏi tiếp ở cuối mỗi câu trả lời.

VỚI MÔN TOÁN:
QUY TẮC ĐỊNH DẠNG CÔNG THỨC TOÁN:

- Công thức nằm trong câu phải viết bằng \( ... \).
- Công thức đứng riêng dòng phải viết bằng \[ ... \].
- Tuyệt đối không dùng [ ... ] để thay thế cho \[ ... \].
- Không bỏ dấu gạch chéo ngược \ trước dấu ngoặc.
- Các ký hiệu như Delta, căn bậc hai, phân số, số mũ và chỉ số phải viết bằng LaTeX.
- Ví dụ đúng: \[ \Delta = b^2 - 4ac \]
- Ví dụ sai: [ \Delta = b^2 - 4ac ]
- Không đặt công thức Toán trong dấu nháy đơn hoặc dấu code.
- Kiểm tra lại toàn bộ công thức trước khi gửi câu trả lời.
- Đóng vai một giáo viên đang trực tiếp giảng bài cho học sinh, không chỉ là công cụ đưa đáp án.
- Giải thích bản chất và lý do của từng bước biến đổi.
- Với mỗi phép biến đổi, phải nói rõ đã sử dụng quy tắc, tính chất hoặc kiến thức nào.
- Không nhảy bước, không gộp nhiều phép tính khiến học sinh khó theo dõi.
- Nếu áp dụng phương pháp phân tích đa thức thành nhân tử, phải giải thích cách nhận ra và cách nhóm các hạng tử.
- Nếu có công thức, phải giải thích ý nghĩa và điều kiện áp dụng khi cần.
- Sau mỗi bước, viết phép tính trên một dòng riêng để dễ quan sát.
- Nếu bài có nhiều cách giải, ưu tiên cách dễ hiểu nhất và có thể giới thiệu cách khác.
- Sau khi giải, kiểm tra lại kết quả nếu phù hợp.
- Không mặc định học sinh đã hiểu kiến thức nền.
- Độ dài lời giải phải tương xứng với độ khó; bài đơn giản vẫn cần giải thích đủ để học sinh tự làm lại được.

HIỂN THỊ CÔNG THỨC:
- Bắt buộc sử dụng LaTeX.
- Công thức trong dòng: \\( ... \\)
- Công thức riêng dòng: \\[ ... \\]
- Không đặt công thức trong dấu code block.
- Không thay công thức bằng cách viết ký hiệu tùy tiện.
QUY CÁCH TRÌNH BÀY NHƯ BÀI GIẢI TRONG VỞ:

- Trình bày lời giải theo bố cục bài làm Toán ở trường.
- Mỗi phép biến đổi đặt trên một dòng riêng.
- Các bước biến đổi tương đương phải được căn chỉnh thẳng hàng bằng môi trường aligned.
- Phân số phải hiển thị dạng phân số có gạch ngang.
- Số mũ phải hiển thị ở vị trí phía trên.
- Căn bậc hai phải có dấu căn đúng chuẩn.
- Không viết công thức dài thành một đoạn văn.
- Có lời dẫn như: "Ta có", "Suy ra", "Vậy".
- Đáp số và tập nghiệm phải được trình bày rõ ràng.
- Ưu tiên cách trình bày giống vở học sinh THCS.

VỚI MÔN NGỮ VĂN:
- Phân tích rõ ý chính.
- Có dẫn chứng phù hợp.
- Giải thích nội dung bằng ngôn ngữ dễ hiểu.
- Khi làm bài viết, trình bày có bố cục rõ ràng.

VỚI MÔN TIẾNG ANH:
- Giải thích đáp án.
- Nêu cấu trúc ngữ pháp liên quan.
- Phân tích vì sao chọn đáp án đó và vì sao các đáp án khác chưa phù hợp khi cần thiết.

CÁC QUY TẮC KHÁC:
- Nếu thiếu dữ kiện, hỏi lại.
- Không bịa thông tin hoặc giả vờ đã đọc tài liệu chưa được cung cấp.
- Giải thích phù hợp trình độ THCS và bảo đảm an toàn cho học sinh.

`;


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options, timeoutMs = 6500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

export default async (request, context) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    return Response.json(
      { error: "Phương thức không được hỗ trợ." },
      { status: 405 }
    );
  }

  // Xác minh tài khoản StudyMate
  const authHeader = request.headers.get("authorization") || "";
  const accessToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : "";

  if (!accessToken) {
    return Response.json(
      { error: "Bạn cần đăng nhập StudyMate để dùng Gia sư AI." },
      { status: 401 }
    );
  }

  try {
    console.log("[StudyMate] Bắt đầu xác minh Supabase");

    const authCheck = await fetchWithTimeout(
      `${SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`
        }
      },
      4500
    );

    console.log("[StudyMate] Supabase:", authCheck.status);

    if (!authCheck.ok) {
      return Response.json(
        { error: "Phiên đăng nhập đã hết hạn. Bạn hãy đăng nhập lại nhé." },
        { status: 401 }
      );
    }

    console.log("[StudyMate] Xác minh tài khoản thành công");

  } catch (error) {
    console.error("[StudyMate] Lỗi Supabase:", error.message);

    return Response.json(
      { error: "Không xác minh được tài khoản StudyMate lúc này." },
      { status: 502 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "Netlify chưa nhận được GEMINI_API_KEY." },
      { status: 500 }
    );
  }

  // Đọc câu hỏi
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Dữ liệu gửi lên không hợp lệ." },
      { status: 400 }
    );
  }

  if (!Array.isArray(body.history) || body.history.length === 0) {
    return Response.json(
      { error: "Bạn hãy nhập câu hỏi trước nhé." },
      { status: 400 }
    );
  }

  const history = body.history
    .filter(item =>
      item &&
      ["user", "model"].includes(item.role) &&
      typeof item.content === "string"
    )
    .slice(-12)
    .map(item => ({
      role: item.role,
      parts: [{ text: item.content.slice(0, 5000) }]
    }));

  while (history.length && history[0].role !== "user") {
    history.shift();
  }

  if (!history.length || history[history.length - 1].role !== "user") {
    return Response.json(
      { error: "Tin nhắn cuối chưa hợp lệ. Bạn thử gửi lại nhé." },
      { status: 400 }
    );
  }

  // Gọi AI chính và AI dự phòng
  const models = [MODEL, FALLBACK_MODEL];
  let lastError = "";

  for (const model of models) {
    console.log("[StudyMate] Đang thử model:", model);

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const upstream = await fetchWithTimeout(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: SYSTEM_INSTRUCTION }]
              },
              contents: history,
              generationConfig: {
                temperature: 0.65,
                maxOutputTokens: 500
              }
            })
          },
          6500
        );

        console.log(
          `[StudyMate] ${model} lần ${attempt}:`,
          upstream.status
        );

        const result = await upstream.json().catch(() => ({}));

        if (upstream.ok) {
          const reply = (result?.candidates?.[0]?.content?.parts || [])
            .map(part => part.text || "")
            .join("")
            .trim();

          if (reply) {
            console.log("[StudyMate] AI trả lời thành công:", model);
            return Response.json({ reply });
          }

          lastError = "AI chưa tạo được nội dung trả lời.";
          console.error("[StudyMate]", lastError);
          break;
        }

        lastError =
          result?.error?.message ||
          `HTTP ${upstream.status}`;

        console.error(
          `[StudyMate] Lỗi ${model}:`,
          JSON.stringify(result.error || result)
        );

        // Chỉ thử lại khi lỗi có khả năng tạm thời
        const temporaryError =
          upstream.status === 429 ||
          [500, 502, 503, 504].includes(upstream.status);

        if (!temporaryError) {
          break;
        }

        if (attempt < 2) {
          await sleep(700);
        }

      } catch (error) {
        lastError = error.name === "AbortError"
          ? "Yêu cầu AI quá thời gian chờ."
          : error.message || "Lỗi kết nối AI.";

        console.error(
          `[StudyMate] Lỗi kết nối ${model}:`,
          lastError
        );

        if (attempt < 2) {
          await sleep(700);
        }
      }
    }

    console.log("[StudyMate] Chuyển sang model tiếp theo");
  }

  console.error("[StudyMate] Tất cả model đều không phản hồi:", lastError);

  return Response.json(
    {
      error: "Gia sư AI đang bận. Hệ thống đã thử máy chủ dự phòng nhưng chưa kết nối được. Bạn thử lại sau một chút nhé."
    },
    { status: 503 }
  );
};
