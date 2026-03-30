import anthropic
from app.config import settings

_client: anthropic.Anthropic | None = None


def get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    return _client


async def summarize_text(text: str, context: str = "교재") -> str:
    """Summarize extracted text from PDF or notice."""
    client = get_client()
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""다음은 유치원 아이의 {context} 내용입니다.
학부모가 이해하기 쉽도록 핵심 학습 내용을 한국어로 요약해주세요.
주요 학습 주제, 활동, 목표를 정리해주세요.

내용:
{text[:8000]}"""
        }],
    )
    return message.content[0].text


async def generate_daily_review(
    child_name: str,
    child_age: int,
    date: str,
    notice_content: str,
    lesson_plan_summary: str,
    textbook_summaries: list[str],
) -> dict:
    """Generate daily review with summary and parent guide."""
    client = get_client()

    context_parts = []
    if notice_content:
        context_parts.append(f"[오늘의 알림장]\n{notice_content}")
    if lesson_plan_summary:
        context_parts.append(f"[이번 주 레슨 플랜]\n{lesson_plan_summary}")
    if textbook_summaries:
        context_parts.append(f"[교재 내용]\n{''.join(textbook_summaries[:3])}")

    context = "\n\n".join(context_parts)

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        messages=[{
            "role": "user",
            "content": f"""당신은 유치원 학습 도우미입니다.
아이 이름: {child_name} (만 {child_age}세)
날짜: {date}

다음 자료를 바탕으로 두 가지를 작성해주세요:

1. **오늘의 학습 요약** (아이가 오늘 무엇을 배웠는지 부모에게 설명)
2. **부모 질문 가이드** (집에서 아이와 대화하며 복습할 수 있는 질문 5-7개. 아이 나이에 맞는 쉬운 표현으로)

자료:
{context}

JSON 형식으로 응답해주세요:
{{"summary": "오늘의 학습 요약...", "parent_guide": "1. 질문1\\n2. 질문2\\n..."}}"""
        }],
    )

    import json
    text = message.content[0].text
    # Extract JSON from response
    start = text.find("{")
    end = text.rfind("}") + 1
    if start >= 0 and end > start:
        return json.loads(text[start:end])
    return {"summary": text, "parent_guide": ""}


async def generate_quizzes(
    child_name: str,
    child_age: int,
    review_summary: str,
    parent_guide: str,
) -> list[dict]:
    """Generate quizzes and flashcards from daily review."""
    client = get_client()

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        messages=[{
            "role": "user",
            "content": f"""유치원생 학습 퀴즈를 만들어주세요.
아이 이름: {child_name} (만 {child_age}세)

오늘 배운 내용:
{review_summary}

다음 두 종류를 만들어주세요:
1. **퀴즈** 3개: 4지선다형. 아이가 재미있게 풀 수 있도록.
2. **플래시카드** 4개: 앞면(질문)과 뒷면(답) 형태.

JSON 배열로 응답해주세요:
[
  {{"question": "질문", "answer": "정답", "options": ["보기1","보기2","보기3","보기4"], "quiz_type": "quiz"}},
  {{"question": "앞면 질문", "answer": "뒷면 답", "options": null, "quiz_type": "flashcard"}}
]"""
        }],
    )

    import json
    text = message.content[0].text
    start = text.find("[")
    end = text.rfind("]") + 1
    if start >= 0 and end > start:
        return json.loads(text[start:end])
    return []


async def generate_child_summary(
    child_name: str,
    child_age: int,
    notice_content: str,
    lesson_summary: str,
) -> dict:
    """Generate a child-friendly summary of today's learning."""
    client = get_client()

    context = ""
    if notice_content:
        context += f"[알림장]\n{notice_content}\n"
    if lesson_summary:
        context += f"[레슨플랜]\n{lesson_summary}\n"

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""당신은 만 {child_age}세 유치원생 '{child_name}'의 다정한 학습 친구입니다.

다음 자료를 바탕으로 아이가 직접 읽을 수 있는 오늘의 학습 요약을 만들어주세요.

규칙:
- 모든 문장은 8단어 이내로 짧게
- 이모지를 많이 사용해주세요
- 아이에게 말하듯 다정하고 재미있는 톤
- {child_name}의 이름을 사용해주세요
- 3~5문장으로 요약

자료:
{context}

JSON으로 응답:
{{"summary": "아이용 학습 요약...", "encouragement": "격려 메시지 한 줄"}}"""
        }],
    )

    import json
    text = message.content[0].text
    start = text.find("{")
    end = text.rfind("}") + 1
    if start >= 0 and end > start:
        return json.loads(text[start:end])
    return {"summary": "오늘도 재미있게 배웠어요! 🌟", "encouragement": "최고야! ⭐"}


async def generate_learning_activities(
    child_name: str,
    child_age: int,
    review_summary: str,
) -> list[dict]:
    """Generate diverse learning activities for child review."""
    client = get_client()

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=3000,
        messages=[{
            "role": "user",
            "content": f"""당신은 만 {child_age}세 유치원생 '{child_name}'의 재미있는 학습 친구입니다.

규칙:
- 모든 문장은 8단어 이내로 짧게
- 어려운 단어 대신 아이가 아는 쉬운 단어만 사용
- 각 질문에 관련 이모지를 반드시 포함
- 정답이 명확하고 혼동 없어야 함
- 오답 보기도 아이 수준에 맞게
- 힌트를 하나씩 제공
- 격려하는 재미있는 톤

다음 내용을 바탕으로 학습 활동을 만들어주세요:
{review_summary}

JSON 배열로 다음 활동들을 만들어주세요:

1. OX퀴즈 3개: activity_type="ox", options=["⭕ 맞아요", "❌ 틀려요"], answer는 "⭕ 맞아요" 또는 "❌ 틀려요"
2. 4지선다 퀴즈 3개: activity_type="multiple_choice", options에 이모지 포함 보기 4개
3. 빈칸 채우기 2개: activity_type="fill_blank", question에 ___포함, options에 보기 3개
4. 플래시카드 3개: activity_type="flashcard", question=이모지+질문, answer=답+짧은설명
5. 단어 연결 1개: activity_type="word_match", options에 {{"words":["단어1","단어2","단어3"], "descriptions":["설명1","설명2","설명3"]}} 형태

각 항목 형식:
[
  {{"activity_type": "ox", "question": "🌸 봄에 꽃이 피어요", "answer": "⭕ 맞아요", "options": ["⭕ 맞아요", "❌ 틀려요"], "hint": "봄이 되면 예쁜 꽃이...", "emoji_cue": "🌸"}},
  ...
]"""
        }],
    )

    import json
    text = message.content[0].text
    start = text.find("[")
    end = text.rfind("]") + 1
    if start >= 0 and end > start:
        return json.loads(text[start:end])
    return []
