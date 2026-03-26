# 영유 (Young-U) - 우리 아이 학습 트래커

유치원 알림장, 교재, 레슨 플랜을 기반으로 아이의 학습을 트래킹하고 데일리 리뷰할 수 있는 웹 서비스입니다.

## 주요 기능

- **알림장 관리**: 유치원 알림장 텍스트 입력 + AI 자동 요약
- **교재 관리**: PDF 업로드 → 텍스트 추출(opendataloader-pdf) → AI 요약
- **주간 레슨플랜**: PDF 업로드 → 주차별 관리
- **데일리 리뷰**: AI가 알림장+레슨플랜+교재를 종합하여 학습 요약 + 부모 질문 가이드 생성
- **퀴즈 & 플래시카드**: AI 생성 4지선다 퀴즈 + 플래시카드로 아이와 복습
- **반응형 디자인**: PC, 노트북, 아이패드, 아이폰 지원

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프론트엔드 | Next.js 14 + Tailwind CSS |
| 백엔드 | FastAPI (Python) |
| PDF 파싱 | opendataloader-pdf |
| AI | Claude API (Anthropic) |
| DB/Storage | Supabase (PostgreSQL + Storage) |
| 배포 | Vercel (프론트) + Railway/Render (백엔드) |

## 시작하기

### 1. Supabase 설정

1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 실행
3. Storage에서 `uploads` 버킷 생성

### 2. 백엔드 실행

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# .env 설정
cp .env.example .env
# SUPABASE_URL, SUPABASE_KEY, ANTHROPIC_API_KEY 입력

uvicorn app.main:app --reload
```

### 3. 프론트엔드 실행

```bash
cd frontend
npm install

# .env.local 설정
cp .env.example .env.local

npm run dev
```

### 4. 접속

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8000
- API 문서: http://localhost:8000/docs
