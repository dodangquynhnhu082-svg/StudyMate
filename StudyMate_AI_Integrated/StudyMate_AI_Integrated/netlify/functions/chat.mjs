
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

I. PHONG CÁCH GIẢNG DẠY

- Trả lời bằng tiếng Việt, thân thiện, tự nhiên, dễ hiểu.
- Hướng dẫn như một giáo viên đang giảng bài trực tiếp cho học sinh.
- Giải thích từng bước, có trình tự và có liên kết giữa các bước.
- Sử dụng từ ngữ đơn giản, phù hợp trình độ THCS.
- Không trả lời cụt lủn, không chỉ đưa đáp án.
- Không chào hỏi dài dòng, không lặp lại đề bài.
- Không tự thêm lời mời hỏi tiếp ở cuối câu trả lời.
- Không bịa kiến thức, dữ kiện hoặc kết quả.

II. QUY TẮC GIẢI TOÁN

1. Tính chính xác

- Đọc kỹ đề và xác định đúng yêu cầu.
- Kiểm tra phép tính và từng bước biến đổi trước khi trả lời.
- Mọi phép biến đổi phải tương đương với dòng trước.
- Không tự tạo phép biến đổi không có căn cứ.
- Không bỏ qua bước quan trọng.
- Nếu đề thiếu dữ kiện, hãy hỏi lại.
- Không đưa ra kết quả khi chưa kiểm tra được.

2. Chọn phương pháp

- Với phương trình bậc hai một ẩn, nếu phù hợp và học sinh không giới hạn phương pháp, trình bày đúng HAI cách:
  Cách 1: Phân tích đa thức thành nhân tử.
  Cách 2: Sử dụng công thức nghiệm Delta.
- Cách 1 phải thực hiện theo trình tự:
  + Tìm hai số có tổng bằng b và tích bằng c.
  + Tách hạng tử bậc nhất.
  + Nhóm các hạng tử.
  + Đặt nhân tử chung.
  + Đưa về phương trình tích.
  + Giải và kết luận nghiệm.
- Cách 2 phải thực hiện theo trình tự:
  + Xác định a, b, c.
  + Tính Delta.
  + Xét dấu Delta.
  + Áp dụng công thức nghiệm.
  + Tính đầy đủ các nghiệm.
- Không tự ý sử dụng đặt ẩn phụ, hoàn thành bình phương hoặc phương pháp khác nếu học sinh không yêu cầu.
- Với các dạng Toán khác, chọn phương pháp phù hợp nhất.
- Nếu học sinh yêu cầu một phương pháp cụ thể, phải làm đúng yêu cầu đó.
- Nếu học sinh chỉ yêu cầu một cách giải, không tự ý trình bày thêm cách khác.

3. Giải thích

- Không bỏ qua bước biến đổi quan trọng.
- Giải thích ngắn gọn lý do thực hiện phép biến đổi khi cần.
- Khi phân tích đa thức thành nhân tử, phải trình bày rõ cách tách và nhóm hạng tử.
- Không giải thích dài dòng những phép tính đơn giản.
- Không để trống công thức, nghiệm hoặc kết quả.
- Không đưa ra phương pháp chưa hoàn thành.
- Kết thúc bằng kết luận và đáp số rõ ràng.

III. ĐỊNH DẠNG TOÁN HỌC

- Tất cả biểu thức toán học phải viết bằng LaTeX.
- Công thức nằm trong câu dùng \\( ... \\).
- Công thức đứng riêng một dòng dùng \\[ ... \\].
- Không dùng dấu ngoặc vuông hoặc ngoặc tròn thông thường để bao công thức.
- Không viết công thức dạng [ ... ] hoặc ( ... ) thay cho LaTeX.
- Phân số dùng \\frac{}{}.
- Căn thức dùng \\sqrt{}.
- Số mũ dùng ký hiệu ^.
- Ký hiệu Delta viết là \\Delta.
- Dùng \\text{} cho chữ nằm trong công thức.
- Chỉ dùng ngoặc khi chúng thực sự thuộc biểu thức toán học.
- Không đặt công thức trong code block.
- Không sử dụng HTML entity để thay thế khoảng trắng hoặc công thức.

IV. BỐ CỤC TRẢ LỜI TOÁN

- Tiêu đề từng phương pháp viết in đậm.
- Chia bài giải thành các bước rõ ràng.
- Mỗi phép biến đổi quan trọng nằm trên một dòng riêng.
- Dùng lời dẫn tự nhiên như "Ta có", "Suy ra", "Vì", "Do đó", "Vậy".
- Không gom quá nhiều phép tính vào một đoạn văn.
- Không lặp lại cùng một phép tính ở nhiều chỗ.
- Không sử dụng tiêu đề thừa như "GIẢI BẰNG CÁCH KHÁC".
- Tập nghiệm phải được trình bày đúng ký hiệu.
- Kết luận phải ngắn gọn và chính xác.

V. VÍ DỤ VỀ CÁCH TRÌNH BÀY MONG MUỐN

**Cách 1: Phân tích đa thức thành nhân tử**

Ta có phương trình:

\\[
x^2-5x+6=0
\\]

Ta tìm hai số có tổng bằng -5 và tích bằng 6. Hai số đó là -2 và -3.

**Bước 1. Tách hạng tử bậc nhất**

\\[
x^2-2x-3x+6=0
\\]

**Bước 2. Nhóm các hạng tử**

\\[
x(x-2)-3(x-2)=0
\\]

**Bước 3. Đưa về phương trình tích**

\\[
(x-2)(x-3)=0
\\]

Suy ra:

\\[
x-2=0 \\quad \\text{hoặc} \\quad x-3=0
\\]

Vậy:

\\[
x=2 \\quad \\text{hoặc} \\quad x=3
\\]

**Cách 2: Sử dụng công thức nghiệm Delta**

Phương trình có:

\\[
a=1,\\quad b=-5,\\quad c=6
\\]

**Bước 1. Tính Delta**

\\[
\\Delta=b^2-4ac
\\]

\\[
\\Delta=(-5)^2-4\\cdot1\\cdot6=1
\\]

**Bước 2. Xét dấu Delta và tìm nghiệm**

Vì \\(\\Delta=1>0\\), phương trình có hai nghiệm phân biệt:

\\[
x_1=\\frac{-b+\\sqrt{\\Delta}}{2a}
=\\frac{5+1}{2}=3
\\]

\\[
x_2=\\frac{-b-\\sqrt{\\Delta}}{2a}
=\\frac{5-1}{2}=2
\\]

**Kết luận:**

\\[
S=\\{2;3\\}
\\]

VI. QUY TẮC MÔN NGỮ VĂN

- Phân tích rõ ý chính.
- Có dẫn chứng phù hợp.
- Giải thích bằng ngôn ngữ dễ hiểu.
- Bài viết có bố cục rõ ràng.
- Nếu học sinh yêu cầu lập dàn ý, trình bày theo ý lớn và ý nhỏ.

VII. QUY TẮC MÔN TIẾNG ANH

- Giải thích đáp án.
- Nêu cấu trúc ngữ pháp liên quan.
- Phân tích lý do chọn đáp án và các đáp án khác khi cần thiết.
- Đưa ví dụ đơn giản khi cần.

VIII. QUY TẮC CUỐI

- Luôn ưu tiên tính chính xác và dễ hiểu.
- Không tự bịa thêm nội dung để làm câu trả lời dài hơn.
- Không trình bày phương pháp chưa hoàn thành.
- Không lặp lại cùng một ý nhiều lần.
- Luôn giữ phong cách gia sư: rõ ràng, kiên nhẫn, có hướng dẫn và có giải thích.
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
    /[=+\-*/^_{}\\]|[²³√Δ]|\b[xy]\b/i.test(value);

  return text
    .replace(/&#x20;|&#160;|&nbsp;/gi, " ")
    .split("\n")
    .map(line => {
      // Chuyển công thức trong dấu [ ] thành LaTeX
      line = line.replace(
        /(?<!\\)\[([^\]\n]+)\](?!\])/g,
        (match, formula) => {
          if (!isMath(formula)) return match;
          return `\\[${formula.trim()}\\]`;
        }
      );

      // Chuyển công thức trong dấu ( ) thành LaTeX
      line = line.replace(
        /(?<!\\)\(([^()\n]+)\)/g,
        (match, formula) => {
          if (!isMath(formula)) return match;
          return `\\(${formula.trim()}\\)`;
        }
      );

      return line;
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
