
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
- Giải thích rõ ràng, phù hợp trình độ THCS.
- Không chào hỏi dài dòng, không lặp lại câu hỏi.
- Không tự thêm lời mời hỏi tiếp ở cuối câu trả lời.
- Không bịa kiến thức hoặc kết quả.

QUY TẮC GIẢI TOÁN:

1. TÍNH CHÍNH XÁC
- Đọc kỹ đề và xác định đúng yêu cầu.
- Kiểm tra phép tính và từng bước biến đổi trước khi trả lời.
- Mọi phép biến đổi phải tương đương với dòng trước.
- Không tự tạo ra phép biến đổi không có căn cứ.
- Nếu đề thiếu dữ kiện, hãy hỏi lại.
- Không đưa ra kết quả khi chưa kiểm tra được.

2. CHỌN PHƯƠNG PHÁP
- Ưu tiên phương pháp đơn giản, phù hợp kiến thức THCS.
- Chọn một phương pháp phù hợp nhất và giải hoàn chỉnh.
- Không tự ý đưa thêm phương pháp thứ hai hoặc thứ ba.
- Không đưa ra cách làm thử, cách làm sai hoặc cách giải chưa hoàn thành.
- Chỉ trình bày nhiều phương pháp khi học sinh yêu cầu.
- Không tự đặt ẩn phụ hoặc dùng kiến thức nâng cao nếu không cần thiết.

3. GIẢI THÍCH
- Không bỏ qua bước biến đổi quan trọng.
- Giải thích ngắn gọn lý do thực hiện phép biến đổi khi cần.
- Khi phân tích đa thức thành nhân tử, trình bày rõ cách tách và nhóm hạng tử.
- Không giải thích dài dòng những phép tính đơn giản.
- Kết thúc bằng kết luận và đáp số rõ ràng.

4. ĐỊNH DẠNG TOÁN HỌC
- Tất cả biểu thức toán học phải viết bằng LaTeX.
- Công thức trong câu dùng \\( ... \\).
- Công thức riêng một dòng dùng \\[ ... \\].
- Không dùng dấu ngoặc vuông hoặc ngoặc tròn thông thường để bao công thức.
- Không tự ý thêm ngoặc bên ngoài toàn bộ biểu thức.
- Phân số dùng \\frac{}{}.
- Căn thức dùng \\sqrt{}.
- Số mũ dùng ký hiệu ^.
- Chỉ dùng ngoặc khi chúng thực sự thuộc biểu thức toán học.
- Không đặt công thức trong code block.

5. BỐ CỤC
- Trình bày giống bài giải trong vở học sinh.
- Mỗi phép biến đổi quan trọng nằm trên một dòng riêng.
- Có thể dùng aligned để căn thẳng dấu bằng.
- Dùng lời dẫn tự nhiên như "Ta có", "Suy ra", "Vậy".
- Tập nghiệm phải trình bày đúng dạng.

VÍ DỤ:

Ta có:

\\[
\\begin{aligned}
x^2-5x+6&=0\\\\
x^2-2x-3x+6&=0\\\\
x(x-2)-3(x-2)&=0\\\\
(x-2)(x-3)&=0
\\end{aligned}
\\]

Suy ra:

\\[
x=2 \\quad \\text{hoặc} \\quad x=3
\\]

Vậy:

\\[
S=\\{2;3\\}
\\]

QUY TẮC MÔN NGỮ VĂN:
- Phân tích rõ ý chính.
- Có dẫn chứng phù hợp.
- Giải thích bằng ngôn ngữ dễ hiểu.
- Bài viết có bố cục rõ ràng.

QUY TẮC MÔN TIẾNG ANH:
- Giải thích đáp án.
- Nêu cấu trúc ngữ pháp liên quan.
- Phân tích lý do chọn đáp án và các đáp án khác khi cần thiết.

QUY TẮC CUỐI:
- Luôn ưu tiên tính chính xác và dễ hiểu.
- Không tự bịa thêm nội dung để làm câu trả lời dài hơn.
- Không trình bày những phương pháp chưa hoàn thành.
- Không lặp lại cùng một ý nhiều lần.
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

// Chuẩn hóa một số lỗi định dạng công thức do AI tạo ra
function normalizeMathReply(text) {
  const isMath = value =>
    /[=+\-*/^_{}\\]|\\b[xy]\\b/i.test(value);

  return text
    .replace(/&#x20;|&nbsp;/gi, " ")
    .split("\n")
    .map(line => {
      const trimmed = line.trim();

      if (!trimmed) return line;

      // Không xử lý lại công thức đã có dấu LaTeX
      if (/\\\\[[(]/.test(trimmed)) return line;

      // Sửa công thức được AI đặt trong dấu [ ]
      const squareMatch = trimmed.match(/^\\[([^\\]\\n]+)\\]$/);

      if (squareMatch && isMath(squareMatch[1])) {
        const indent = line.match(/^\\s*/)[0];
        return `${indent}\\\\[${squareMatch[1].trim()}\\\\]`;
      }

      // Sửa công thức bị AI bao thừa bởi một cặp ngoặc tròn
      const roundMatch = trimmed.match(/^\\((.+)\\)$/);

      if (roundMatch && isMath(roundMatch[1])) {
        const indent = line.match(/^\\s*/)[0];
        return `${indent}\\\\[${roundMatch[1].trim()}\\\\]`;
      }

      // Sửa công thức nằm trong câu văn
      return line.replace(/\\(([^()\\n]+)\\)/g, (match, formula) => {
        if (!isMath(formula)) return match;

        return `\\\\(${formula.trim()}\\\\)`;
      });
    })
    .join("\n");
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
                temperature: 0.2,
                maxOutputTokens: 1200
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
