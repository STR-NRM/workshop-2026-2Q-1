import { initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';
import OpenAI from 'openai';

const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');
const REGION = 'asia-southeast1';
const DATABASE_URL =
  process.env.FIREBASE_DATABASE_URL ||
  'https://workshop-2026-2q-1-default-rtdb.asia-southeast1.firebasedatabase.app';
const REPORT_VERSION = '2026-05-13-click-analysis-v2-expert-report';

initializeApp({ databaseURL: DATABASE_URL });

const allowedOrigins = [
  'http://localhost:5174',
  'http://localhost:5173',
  'https://str-nrm.github.io',
];

function setCors(req, res) {
  const origin = req.get('origin');
  if (origin && isAllowedOrigin(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
  }
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
}

function isAllowedOrigin(origin) {
  return allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin);
}

function requirePayload(body) {
  const payload = body && typeof body === 'object' ? body : null;
  if (!payload?.survey?.id || !payload?.sample || !Array.isArray(payload?.questionStats)) {
    const error = new Error('AI 분석에 필요한 설문 데이터가 부족합니다.');
    error.status = 400;
    throw error;
  }
  return payload;
}

function buildPrompt(payload) {
  return `다음은 누리미디어 AI 사업부 2026 상반기 워크샵 사전 설문의 익명 집계 데이터입니다.

응답 데이터:
${JSON.stringify(payload, null, 2)}

보고서 목표:
- 단순 요약이 아니라, 조직 운영, 제품 운영, 개발 협업, AI 제품 사업화 경험이 있는 외부 전문가들이 함께 검토한 수준의 컨설팅 보고서처럼 작성하세요.
- 다만 독자는 실제 워크샵에 참여하는 실무 팀원입니다. 어려운 컨설팅 용어를 남발하지 말고, 필요하면 쉬운 한국어로 풀어 쓰세요.
- 보고서의 목적은 "좋다/나쁘다" 판정이 아니라, 워크샵에서 합의해야 할 운영 의제와 4주 실행 실험을 찾는 것입니다.

작성 원칙:
- 반드시 "# Executive Summary"로 시작하세요.
- 전체 보고서는 한국어로 작성하되, 첫 제목 "Executive Summary"는 영어 그대로 유지하세요.
- 읽는 사람은 PM, 프론트엔드, 백엔드, AI 엔지니어, 프롬프트 엔지니어가 섞인 실무 팀원입니다.
- 개인 평가처럼 보이는 표현, 특정 직군 탓으로 읽히는 표현, 과장된 긍정/부정 표현을 피하세요.
- 응답 수가 적으면 표본 한계를 명시하고, 결론을 단정하지 마세요.
- 긴 보고서여도 구조가 선명해야 합니다. 각 섹션은 "요약", "근거", "해석", "실행 시사점" 순서가 드러나게 정리하세요.
- 수치와 서술형 응답을 구분해서 해석하고, 서술형은 익명성을 해칠 수 있는 표현을 일반화하세요.
- 수치가 약한 지점에서는 "추정", "가능성", "확인 필요"를 명확히 구분하세요.
- 확신도는 높음/중간/낮음으로 표시하고, 확신도가 낮은 결론은 실행안으로 단정하지 마세요.
- 워크샵 현장에서 바로 토론할 수 있는 질문과 4주 운영 실험 후보를 포함하세요.
- 표를 사용하면 읽기 쉬운 곳에는 Markdown 표를 사용하세요.
- 각 섹션 끝에는 팀원이 바로 이해할 수 있는 "워크샵에서 확인할 질문"을 1~3개 포함하세요.

필수 섹션:
1. # Executive Summary
   - 5~8개 bullet로 핵심 결론, 가장 큰 리스크, 가장 먼저 합의할 의제, 4주 내 실행 후보를 요약하세요.
   - 각 bullet에는 가능한 경우 근거 수치 또는 관찰 신호를 붙이세요.
2. ## 1. 데이터 범위와 해석 주의
   - 표본 수, 완료율, 응답 편향 가능성, 해석하면 안 되는 것과 해석 가능한 것을 구분하세요.
3. ## 2. 우선순위 신호와 경영적 의미
   - 낮은 평균, 큰 이견, 높은 N/A, 서술형 신호를 분리하고 "왜 중요한지"를 설명하세요.
4. ## 3. 운영체계 진단
   - 목표/우선순위, 역할과 책임, 직군 간 협업, 의사결정, 제품 발견과 검증, 개발 실행, 외부 협업 접점을 나누어 진단하세요.
5. ## 4. 제품·기술·협업 포트폴리오 관점
   - AI Agent, AI Viewer, AI Idea, AI Reader, AI Editor를 별도 제품명이 등장하는 경우에만 조심스럽게 해석하세요.
   - 설문 데이터만으로 제품별 결론을 낼 수 없으면 "추가 확인 필요"로 남기세요.
6. ## 5. 주요 긴장관계와 합의가 필요한 질문
   - 서로 충돌할 수 있는 관점, 예를 들어 속도와 품질, 실험과 안정화, 자율과 조율, 내부 실행과 외부 협업을 균형 있게 정리하세요.
7. ## 6. 4주 실행 실험 후보
   - 최소 5개, 최대 8개 후보를 제안하세요.
8. ## 7. 분과 토론 아젠다
   - PM/제품, AI/데이터, BE/FE/개발, 외부 협업/운영 중 실제 응답 신호에 맞는 분과를 제안하세요.
9. ## 8. 다음 설문 또는 추가 확인 항목
   - 다음에 더 물어봐야 할 문항, 인터뷰로 확인할 것, 데이터로 검증할 것을 나누세요.

각 실행 실험 후보에는 반드시 "가설", "첫 1주 실행", "성공 판단 신호", "부작용/주의점", "중단 기준"을 포함하세요.`;
}

function normalizeReport(text) {
  const trimmed = String(text || '').trim();
  if (/^#\s*Executive Summary/i.test(trimmed)) return trimmed;
  if (/^Executive Summary/i.test(trimmed)) return `# ${trimmed}`;
  return `# Executive Summary
- 모델 응답이 지정된 제목으로 시작하지 않아, 운영자가 읽을 수 있도록 제목을 보정했습니다.

${trimmed}`;
}

function outputText(response) {
  if (response.output_text) return response.output_text;
  return JSON.stringify(response.output ?? response, null, 2);
}

export const generateWorkshopAnalysis = onRequest(
  {
    region: REGION,
    timeoutSeconds: 540,
    memory: '1GiB',
    secrets: [OPENAI_API_KEY],
  },
  async (req, res) => {
    setCors(req, res);
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'POST 요청만 지원합니다.' });
      return;
    }
    const origin = req.get('origin');
    if (origin && !isAllowedOrigin(origin)) {
      res.status(403).json({ error: '허용되지 않은 출처의 AI 분석 요청입니다.' });
      return;
    }

    try {
      const payload = requirePayload(req.body);
      const model = process.env.OPENAI_MODEL || 'gpt-5.5';
      const reasoningEffort = process.env.OPENAI_REASONING_EFFORT || 'high';
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

      const response = await openai.responses.create({
        model,
        reasoning: { effort: reasoningEffort },
        input: buildPrompt(payload),
      });

      const result = normalizeReport(outputText(response));
      const analysis = {
        result,
        model,
        reasoningEffort,
        analyzedAt: Date.now(),
        reportVersion: REPORT_VERSION,
        generatedBy: {
          origin: origin || null,
        },
        inputSummary: {
          surveyId: payload.survey.id,
          questionVersion: payload.survey.questionVersion || null,
          respondentCount: payload.sample.respondentCount,
          completedCount: payload.sample.completedCount,
          questionCount: payload.questionStats.length,
        },
      };

      await getDatabase().ref(`surveys/${payload.survey.id}/analysis/comprehensive`).set(analysis);
      res.json({ ok: true, analysis });
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({
        error: err.message || 'AI 분석 생성 중 오류가 발생했습니다.',
      });
    }
  },
);
