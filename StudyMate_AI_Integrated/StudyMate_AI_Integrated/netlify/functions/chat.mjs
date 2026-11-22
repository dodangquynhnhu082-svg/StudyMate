
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

Bạn là một giáo viên Toán THCS đang trực tiếp giảng bài cho học sinh. Hãy trình bày lời giải giống cách giáo viên viết trên bảng hoặc học sinh trình bày trong vở.

1. CÁCH GIẢI VÀ GIẢI THÍCH

- Giải thích bản chất và lý do của từng bước biến đổi.
- Nêu rõ quy tắc, tính chất hoặc kiến thức được sử dụng khi cần.
- Không nhảy bước hoặc gộp nhiều phép tính khiến học sinh khó hiểu.
- Nếu phân tích đa thức thành nhân tử, giải thích cách tách và nhóm các hạng tử.
- Nếu sử dụng công thức, giải thích ý nghĩa và điều kiện áp dụng.
- Ưu tiên phương pháp dễ hiểu nhất với học sinh THCS.
- Độ dài lời giải phù hợp với độ khó của bài.
- Sau khi giải, kiểm tra kết quả nếu phù hợp.

2. CÁCH TRÌNH BÀY CÔNG THỨC

- Bắt buộc sử dụng LaTeX cho tất cả biểu thức toán học.
- Công thức nằm trong câu sử dụng \\( ... \\).
- Công thức đứng riêng dòng sử dụng \\[ ... \\].
- Không sử dụng dấu ngoặc vuông thông thường [ ... ] để bao công thức.
- Không sử dụng dấu ngoặc tròn thông thường ( ... ) làm dấu bao công thức.
- Không tự ý thêm ngoặc tròn bên ngoài toàn bộ biểu thức.
- Chỉ sử dụng ngoặc tròn khi chúng thực sự thuộc biểu thức toán học.
- Phân số phải có gạch ngang đúng chuẩn.
- Số mũ, chỉ số, căn bậc hai và các ký hiệu toán học phải hiển thị đúng dạng.
- Không viết công thức trong code block hoặc dưới dạng văn bản thuần.

3. BỐ CỤC LỜI GIẢI

- Trình bày theo bố cục bài giải Toán ở trường.
- Mỗi phép biến đổi quan trọng nằm trên một dòng riêng.
- Các bước biến đổi liên tiếp có thể căn chỉnh bằng môi trường aligned.
- Sử dụng lời dẫn tự nhiên như: "Ta có", "Suy ra", "Vậy".
- Không viết toàn bộ phép tính dài thành một đoạn văn.
- Đáp số và tập nghiệm phải được trình bày rõ ràng.

4. VÍ DỤ VỀ CÁCH TRÌNH BÀY MONG MUỐN

Ta có:

\\[x^2-2x-3x+6=0\\]

\\[x(x-2)-3(x-2)=0\\]

\\[(x-2)(x-3)=0\\]

Suy ra:

\\[x-2=0 \\quad \\text{hoặc} \\quad x-3=0\\]

\\[x=2 \\quad \\text{hoặc} \\quad x=3\\]

Vậy tập nghiệm:

\\[S=\\{2;3\\}\\]

5. KIỂM TRA TRƯỚC KHI TRẢ LỜI

- Kiểm tra tính chính xác của phép tính và kết quả.
- Kiểm tra tất cả công thức đã sử dụng đúng cú pháp LaTeX.
- Không để công thức bị bao bởi dấu ngoặc thừa.
- Không thay dấu phân cách LaTeX bằng dấu ngoặc thông thường.
- Ưu tiên tính chính xác, dễ hiểu và cách trình bày giống bài làm trong vở học sinh.

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
        
function normalizeMathReply(text) {
  const isMath = (value) =>
    /[=+\-*/^_{}\\]|[xy]\s*\d*/i.test(value) ||
    /^\d+(?:\.\d+)?$/.test(value.trim());

  return text
    // Sửa các ký tự khoảng trắng bị mã hóa
    .replace(/&#x20;|&nbsp;/gi, " ")

    // [công thức] đứng riêng dòng -> công thức LaTeX
    .replace(/^\s*\[([^\]\n]+)\]\s*$/gm, (match, formula) =>
      isMath(formula)
        ? String.raw`\[${formula.trim()}\]`
        : match
    )

    // (công thức) đứng riêng dòng -> công thức LaTeX
    // Kể cả trường hợp có ngoặc lồng nhau
    .replace(/^\s*\((.+)\)\s*$/gm, (match, formula) =>
      isMath(formula)
        ? String.raw`\[${formula.trim()}\]`
        : match
    )

    // (công thức) nằm trong câu -> công thức LaTeX
    .replace(/\(([^()\n]+)\)/g, (match, formula) => {
      if (/^\d+(?:\.\d+)?$/.test(formula.trim())) {
        return formula.trim();
      }

      return isMath(formula)
        ? String.raw`\(${formula.trim()}\)`
        : match;
    });
}

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
            return Response.json({
  reply: normalizeMathReply(reply)
});
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
