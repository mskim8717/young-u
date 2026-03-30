# 영유(Young-U) 배포 가이드

이 문서는 영유 서비스를 처음부터 배포하는 방법을 단계별로 설명합니다.
총 3개의 외부 서비스를 사용합니다:

| 서비스 | 역할 | 비용 |
|--------|------|------|
| Supabase | 데이터베이스 + 파일 저장소 | 무료 (Free tier) |
| Railway | 백엔드 서버 (FastAPI) | 무료 체험 후 월 $5~ |
| Vercel | 프론트엔드 (Next.js) | 무료 (Hobby plan) |

---

## 1단계: Supabase 설정 (데이터베이스)

### 1-1. 계정 만들기

1. 브라우저에서 [https://supabase.com](https://supabase.com) 접속
2. 우측 상단 **Start your project** 클릭
3. **Sign up with GitHub** 클릭 (GitHub 계정이 없으면 먼저 [github.com](https://github.com)에서 가입)
4. GitHub 로그인 후 Supabase 접근 권한을 허용

### 1-2. 프로젝트 생성

1. 로그인 후 **New Project** 클릭
2. 다음 정보를 입력:
   - **Organization**: 기본값 사용
   - **Project name**: `young-u`
   - **Database Password**: 비밀번호 입력 (기억해둘 것!)
   - **Region**: `Northeast Asia (Seoul)` 선택
3. **Create new project** 클릭
4. 프로젝트가 생성될 때까지 1~2분 대기

### 1-3. 데이터베이스 테이블 만들기

1. 좌측 메뉴에서 **SQL Editor** 클릭 (아이콘: `<>` 모양)
2. **New Query** 클릭
3. 프로젝트 폴더의 `supabase/schema.sql` 파일 내용을 전체 복사
4. SQL Editor에 붙여넣기
5. 우측 하단 **Run** 버튼 클릭
6. 하단에 `Success` 메시지가 나오면 완료

### 1-4. 파일 저장소(Storage) 만들기

1. 좌측 메뉴에서 **Storage** 클릭 (폴더 아이콘)
2. **New bucket** 클릭
3. 다음 정보 입력:
   - **Name**: `uploads`
   - **Public bucket**: 끄기 (OFF)
4. **Create bucket** 클릭

### 1-5. API 키 확인하기 (나중에 필요)

1. 좌측 메뉴에서 **Settings** (톱니바퀴) 클릭
2. **API** 또는 **Data API** 클릭
3. 다음 두 가지를 메모장에 복사해둡니다:

| 항목 | 위치 | 예시 |
|------|------|------|
| **Project URL** | 상단 URL 필드 | `https://xxxxxxxx.supabase.co` |
| **anon public 키** | Project API keys → `anon` `public` | `eyJhbGciOi...` 로 시작하는 긴 문자열 |

> ⚠️ `service_role` `secret` 키는 절대 외부에 공유하지 마세요!

---

## 2단계: GitHub에 코드 올리기

### 2-1. GitHub 계정 만들기 (이미 있으면 건너뛰기)

1. [https://github.com](https://github.com) 접속
2. **Sign up** 클릭 → 이메일, 비밀번호, 사용자명 입력 → 가입 완료

### 2-2. 새 저장소(Repository) 만들기

1. GitHub 로그인 후 우측 상단 **+** → **New repository** 클릭
2. 다음 정보 입력:
   - **Repository name**: `young-u`
   - **Public** 선택
3. **Create repository** 클릭

### 2-3. 코드 업로드 (터미널에서)

터미널(맥: Terminal 앱, 윈도우: PowerShell)을 열고 프로젝트 폴더로 이동 후:

```bash
cd /경로/young-u

# Git 초기화 (이미 했으면 건너뛰기)
git init
git branch -m main

# GitHub 연결
git remote add origin https://github.com/내아이디/young-u.git

# 코드 올리기
git add .
git commit -m "initial commit"
git push -u origin main
```

> GitHub 로그인 팝업이 뜨면 로그인해주세요.

---

## 3단계: Railway 설정 (백엔드 서버)

### 3-1. 계정 만들기

1. [https://railway.app](https://railway.app) 접속
2. **Login** → **Login with GitHub** 클릭
3. GitHub 접근 권한 허용

### 3-2. 프로젝트 생성

1. 대시보드에서 **New Project** 클릭
2. **Deploy from GitHub Repo** 클릭
3. `young-u` 저장소 선택
4. 자동으로 배포가 시작되지만, 설정이 필요하므로 실패해도 괜찮습니다

### 3-3. 빌드 설정

1. 생성된 서비스를 클릭
2. 상단 **Settings** 탭 클릭
3. 아래로 스크롤하여 **Build** 섹션 찾기
4. **Builder** 드롭다운 → **Dockerfile** 선택
5. **Dockerfile Path** → `Dockerfile` 입력
6. **Custom Build Command** → 비워두기 (내용이 있으면 삭제)
7. **Custom Start Command** → 비워두기 (내용이 있으면 삭제)

### 3-4. 환경변수 설정

1. 상단 **Variables** 탭 클릭
2. **RAW Editor** 클릭
3. 다음 내용을 붙여넣기:

```
SUPABASE_URL=여기에_1-5단계에서_복사한_Project_URL
SUPABASE_KEY=여기에_1-5단계에서_복사한_anon_public_키
ANTHROPIC_API_KEY=여기에_Anthropic_API_키
CORS_ORIGINS=http://localhost:3000
```

> **ANTHROPIC_API_KEY**: [https://console.anthropic.com](https://console.anthropic.com)에서 발급받을 수 있습니다.
> **CORS_ORIGINS**: Vercel 배포 후 URL을 추가합니다 (5단계에서 설명).

4. **Update variables** 클릭

### 3-5. 배포 확인

1. 상단 **Deployments** 탭 클릭
2. 최신 배포가 **Active** 상태가 될 때까지 대기 (1~2분)
3. 만약 **FAILED**면 **Redeploy** 클릭

### 3-6. 도메인(URL) 생성

1. 상단 **Settings** 탭 클릭
2. **Networking** 섹션 찾기
3. **Generate Domain** 클릭
4. 포트 입력란에 `8080` 입력
5. 생성된 URL을 메모 (예: `young-u-production.up.railway.app`)

### 3-7. 동작 확인

브라우저에서 다음 주소에 접속:

```
https://생성된URL/api/health
```

화면에 `{"status":"ok"}` 가 나오면 백엔드 배포 성공!

---

## 4단계: Vercel 설정 (프론트엔드)

### 4-1. 계정 만들기

1. [https://vercel.com](https://vercel.com) 접속
2. **Sign Up** → **Continue with GitHub** 클릭
3. GitHub 접근 권한 허용

### 4-2. 프로젝트 생성

1. 대시보드에서 **Add New...** → **Project** 클릭
2. **Import Git Repository** 에서 `young-u` 저장소의 **Import** 클릭
3. 다음 설정을 변경:
   - **Root Directory**: 입력란 옆 **Edit** 클릭 → `frontend` 입력 → **Continue**
4. **Environment Variables** 섹션에서:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://생성된Railway URL` (예: `https://young-u-production.up.railway.app`)
   - **Add** 클릭
5. **Deploy** 클릭
6. 배포 완료까지 1~2분 대기

### 4-3. 배포 확인

배포 완료 후 화면에 나타나는 URL로 접속 (예: `https://young-u.vercel.app`)

> 축하합니다! 🎉 영유 서비스가 인터넷에 공개되었습니다!

---

## 5단계: CORS 설정 업데이트 (중요!)

프론트엔드 배포 후, Railway에서 CORS를 업데이트해야 합니다.

1. [railway.app](https://railway.app) 대시보드 → young-u 프로젝트 클릭
2. 서비스 클릭 → **Variables** 탭
3. `CORS_ORIGINS` 값을 수정:

```
CORS_ORIGINS=http://localhost:3000,https://young-u.vercel.app
```

> `https://young-u.vercel.app` 부분을 4단계에서 받은 실제 Vercel URL로 변경하세요.

4. 저장 후 자동으로 재배포됩니다

---

## 최종 확인 체크리스트

| 확인 항목 | 방법 |
|-----------|------|
| 백엔드 동작 | `https://Railway URL/api/health` 접속 → `{"status":"ok"}` |
| 프론트엔드 동작 | Vercel URL 접속 → 영유 대시보드 표시 |
| 아이 등록 | + 아이 추가 → 이름, 연도 입력 → 추가 클릭 → 버튼 생성 확인 |
| 알림장 저장 | 알림장 메뉴 → 알림장 입력 → 저장 → AI 요약 표시 |
| PDF 업로드 | 교재 또는 레슨플랜 → PDF 업로드 → 텍스트 추출 확인 |

---

## 문제 해결

### "아이 추가가 안 돼요"
- 브라우저 개발자 도구(F12) → Console 탭에서 빨간 에러 확인
- CORS 에러가 보이면 → 5단계 CORS 설정 확인

### "Railway 배포 실패"
- Deployments → View logs → Deploy Logs 확인
- Variables에 `SUPABASE_URL`, `SUPABASE_KEY`가 올바른지 확인

### "AI 요약이 안 돼요"
- Railway Variables에서 `ANTHROPIC_API_KEY`가 올바른지 확인
- [console.anthropic.com](https://console.anthropic.com)에서 API 키 잔액 확인

### "PDF 업로드 실패"
- Supabase → Storage → `uploads` 버킷이 있는지 확인
- 파일 크기가 50MB 이하인지 확인

---

## 서비스 접속 주소 요약

| 서비스 | URL |
|--------|-----|
| 프론트엔드 (Vercel) | https://young-u.vercel.app |
| 백엔드 API (Railway) | https://young-u-production.up.railway.app |
| 백엔드 API 문서 | https://young-u-production.up.railway.app/docs |
| Supabase 대시보드 | https://supabase.com/dashboard |
| Railway 대시보드 | https://railway.app/dashboard |
| Vercel 대시보드 | https://vercel.com/dashboard |
